import express from "express";
import AuthApiRouter from "../api/v0/auth_0.js";
import ChatApiRouter from "../api/v0/chat_0.js";

const ApiRouter = express.Router();

ApiRouter.use("/v0/auth", AuthApiRouter);
ApiRouter.use("/v0/chat", ChatApiRouter);

export default ApiRouter;
