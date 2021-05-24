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
    io.to(user.username).emit("test", "Sending from a group");
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
      unsubscriber.unsubscribe();
    }
    console.log(...args);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
