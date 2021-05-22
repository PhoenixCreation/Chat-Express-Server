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

const PORT = process.env.PORT || 5000;
io.allSockets().then((payload) => console.log(payload));

io.on("connection", (socket) => {
  io.allSockets().then((payload) => console.log(payload));

  socket.on("connect", (...args) => {
    console.log("Back end connect");
    console.log(...args);
  });
  socket.on("start_listning_for", (username) => {
    console.log(username);
    (async () => {
      // TODO: retrive user info first, then send the initial chats first and also subscribe to the all tables
      const { data, error } = await supabase
        .from(`${username}_to_${username}`)
        .select("*");
      console.log("messages recieved from supabase");
      socket.emit(username, data);

      supabase
        .from(`${username}_to_${username}`)
        .on("*", (payload) => {
          console.log("message recieved from supabase");
          socket.emit(username, payload);
        })
        .subscribe();
    })();
  });
  socket.on("disconnecting", (...args) => {
    console.log("Back end dis connect ing");
    console.log(...args);
  });
  socket.on("disconnect", (...args) => {
    console.log("Back end dis connect");
    console.log(...args);
  });
});

httpServer.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
