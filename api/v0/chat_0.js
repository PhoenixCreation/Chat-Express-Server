import dotenv from "dotenv";
dotenv.config();
import express from "express";
import supabase from "../../supabase.js";
import client from "../../postgres.js";
import CryptoJS from "crypto-js";

const ChatApiRouter = express.Router();

ChatApiRouter.get("/", (req, res) => {
  res.send(
    `<h2>This is Api route. You SHOULD'NT be here. GET out of here and enjoy the chat.</h2>`
  );
});

ChatApiRouter.get("/test", async (req, res) => {
  res.json({ message: "This is test route." });
});

ChatApiRouter.post("/addchat", async (req, res) => {
  try {
    const { requestingUser, toBeAddedUser } = req.body;

    // check for requesting user first
    const { data: userData, error: error1 } = await supabase
      .from("userinfo")
      .select("username,password,chats")
      .eq("username", requestingUser.username);
    if (error1) {
      console.log("On Api call [POST] /api/v0/chat/addchat =>");
      console.log(error1);
      res.json({ error: error1, message: "Supabase Server error" });
      return;
    }
    if (userData.length !== 1) {
      console.log("On Api call [POST] /api/v0/chat/addchat =>");
      console.log("No user found?!");
      res.json({
        error: "No user found for your credentials",
        message: "No user found. Make sure your have proper credentials.",
      });
      return;
    }

    // chreck for user to be added
    const { data: AddedUserData, error: error2 } = await supabase
      .from("userinfo")
      .select("username,chats")
      .eq("username", toBeAddedUser.username);
    if (error2) {
      console.log("On Api call [POST] /api/v0/chat/addchat =>");
      console.log(error2);
      res.json({ error: error2, message: "Supabase Server error" });
      return;
    }
    if (AddedUserData.length !== 1) {
      console.log("On Api call [POST] /api/v0/chat/addchat =>");
      console.log("No user found?!");
      res.json({
        error: "No user found for Addin a chat",
        message:
          "No user found to be added. Make sure your have proper credentials.",
      });
      return;
    }

    // check for password of current user
    const user = userData[0];
    if (user.password !== requestingUser.password) {
      console.log("On Api call [POST] /api/v0/chat/addchat =>");
      console.log("Password from requestingUser is not encrypted");
      res.json({
        error: "Bad credentials",
        message: "Unusual data provided. Password is not properly encrypted.",
      });
      return;
    }

    // Do 3 things
    // add a table with sorting named
    // add requesting name to toBeAddedUser's chat
    // add toBeAddedUser name to requesting's chat
    res.json({ message: "success!" });
  } catch (error) {
    console.log("On Api call [POST] /api/v0/chat/addchat =>");
    console.log(error);
    res.json({
      error: JSON.stringify(error),
      message: "Internal Server Error",
    });
  }
});

export default ChatApiRouter;