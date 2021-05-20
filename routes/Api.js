import express from "express";
import AuthApiRouter from "../api/v0/auth_0.js";

const ApiRouter = express.Router();

ApiRouter.use("/v0/auth", AuthApiRouter);

export default ApiRouter;
