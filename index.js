import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createServer } from "http";
import * as socket_pkg from "socket.io";
const { Server } = socket_pkg;

import supabase from "./supabase.js";

import ApiRouter from "./routes/Api.js";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer);
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.use("/api", ApiRouter);

io.on("connection", (socket) => {
  io.allSockets().then((payload) => console.log(payload));
  console.log(`new connection with id: ${socket.id}`);
  let unsubs = [];
  let userOfThisSocket = {};

  socket.on("user-connect", (user) => {
    console.log(user.username + " is starting connection");
    socket.join(user.username);
    userOfThisSocket.username = user.username;
    io.to(user.username).emit("test", "Sending from a group");
    (async () => {
      const { data: userData, error: error1 } = await supabase
        .from("userinfo")
        .select("username,password,chats,groups")
        .eq("username", user.username);
      if (error1 || userData.length !== 1) {
        io.to(user.username).emit("user-not-found", {
          message: "user not found, check if any error is attached",
          error: JSON.stringify(error1),
        });
        return;
      }
      const userinfo = userData[0];
      if (user.password !== userinfo.password) {
        io.to(user.username).emit("user-auth-failed", {
          message: "password is wrong! who are you?",
          error: "credential failed",
        });
        return;
      }
      const chats = userinfo.chats;
      const chatTables = chats.map((chat) => {
        const sorter = [user.username, chat];
        sorter.sort();
        return `${sorter[0]}_to_${sorter[1]}`;
      });
      // send the initial chat first....
      const intialSending = {};
      await asyncForEach(chatTables, async (tableName, i) => {
        const { data: chatsWithUser, error } = await supabase
          .from(tableName)
          .select("*")
          .order("timestamp", { ascending: false });
        intialSending[chats[i]] = chatsWithUser;
      });
      const chatUsers = {};
      await asyncForEach(chats, async (chat, i) => {
        const { data: userData, error: error1 } = await supabase
          .from("userinfo")
          .select("id,username,display_name,status,avatar_url")
          .eq("username", chat);
        chatUsers[chat] = userData[0];
      });
      io.to(user.username).emit(
        user.username,
        "INITIAL",
        chatUsers,
        intialSending
      );

      chatTables.forEach((tableName, i) => {
        const unsubscriber = supabase
          .from(tableName)
          .on("UPDATE", (updatedChat) => {
            io.to(user.username).emit(
              user.username,
              "UPDATE",
              chats[i],
              updatedChat.new
            );
          })
          .on("INSERT", (insertedChat) => {
            io.to(user.username).emit(
              user.username,
              "INSERT",
              chats[i],
              insertedChat.new
            );
          })
          .on("DELETE", (deletedChat) => {
            io.to(user.username).emit(
              user.username,
              "DELETE",
              chats[i],
              deletedChat.old
            );
          })
          .subscribe();
        unsubs.push(unsubscriber);
      });
    })();
    const userRowSubscription = supabase
      .from(`userinfo:username=eq.${user.username}`)
      .on("UPDATE", (userPayload) => {
        console.log(userPayload.new);
        io.to(user.username).emit("user-changed", userPayload.new);
      })
      .subscribe();
    unsubs.push(userRowSubscription);
  });
  socket.on("disconnecting", (...args) => {
    console.log("Back end dis connect ing");
    console.log(`Disconnecting with id: ${socket.id}`);
    if (userOfThisSocket.username) {
      console.log(userOfThisSocket.username + " is offline");
    }
    console.log("unsubscribing all events");
    for (let i = 0; i < unsubs.length; i++) {
      const unsubscriber = unsubs[i];
      console.log("Unsubscribed one event");
      unsubscriber.unsubscribe();
    }
    console.log(...args);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
