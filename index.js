import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { createServer } from "http";
import * as socket_pkg from "socket.io";
const { Server } = socket_pkg;

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
  socket.on("message", (...args) => {
    console.log("Back end message recieved");
    console.log(socket.id);
    socket.emit("message_re", ...args);
    console.log(...args);
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
