import express from "express";
import supabase from "../../supabase.js";

const TABLE_NAME = "userinfo";

const AuthApiRouter = express.Router();

AuthApiRouter.get("/", (req, res) => {
  res.send(
    `<h2>This is for Api call. get the hell out of here and enjoy chat app.</h2>`
  );
});

AuthApiRouter.post("/signup", async (req, res) => {
  try {
    const user = req.body;

    // if username  or password is not provided
    if (!user.username || !user.password) {
      res.json({ error: "Bad credentials", message: "Unusual data provided" });
      return;
    }

    // retrive list of all usernames from supabase
    const { data: currentUsers, error: error1 } = await supabase
      .from(TABLE_NAME)
      .select("username");

    // If error came from supabase
    if (error1) {
      console.log("On Api call [POST] /api/auth/signup => ");
      console.log("Supabase returned error => ");
      console.log(error1);
      res.json({ error: error1, message: "Supabase Server error" });
      return;
    }

    // varible to check if user alredy exists
    let alreadyExists = false;
    for (let i = 0; i < currentUsers.length; i++) {
      const currentUser = currentUsers[i];
      if (currentUser.username === user.username) {
        alreadyExists = true;
        break;
      }
    }

    // IF username is alredy taken
    if (alreadyExists) {
      res.json({
        error: "user already exists",
        message: "user with this username alredy exists.",
      });
      return;
    }

    // check for the remaining informaion, set defaults if not provided
    if (!user.ip) user.ip = "-1.-1.-1.-1";
    if (!user.location) user.location = { lat: 0, lon: 0 };
    if (typeof user.public !== "boolean") user.public = false;
    if (!user.settings) user.settings = { theme: "light" };

    // Insert user to databse by supabase
    const { data, error: error2 } = await supabase
      .from(TABLE_NAME)
      .insert([user]);

    // If error from supabase came
    if (error2) {
      console.log("On Api call [POST] /api/auth/signup => ");
      console.log("Supabse returned error => ");
      console.log(error2);
      res.json({ error: error2, message: "Supabase Server error" });
      return;
    }

    // Everything is okay. Good to go

    // return the user recived from insert query
    res
      .status(200)
      .json({ message: "Successfully added the user.", user: data[0] });
  } catch (error) {
    console.log("On Api call [POST] /api/auth/signup => ");
    console.log(error);
    res.status(200).json({ error, message: "Internal Server Error" });
  }
});

AuthApiRouter.post("/login", async (req, res) => {
  try {
    const user = req.body;

    // if username  or password is not provided
    if (!user.username || !user.password) {
      console.log("On Api call [POST] /api/auth/login => ");
      console.log("Unusual data provided => ");
      console.log(user);
      res.json({ error: "Bad credentials", message: "Unusual data provided" });
      return;
    }

    // retrive list of all users
    const { data: currentUsers, error: error1 } = await supabase
      .from(TABLE_NAME)
      .select("*");

    // If error came from supabase
    if (error1) {
      console.log("On Api call [POST] /api/auth/login => ");
      console.log("Supabase returned error => ");
      console.log(error1);
      res.json({ error: error1, message: "Supabase Server error" });
      return;
    }

    // varibles to check the credentials
    /**
     * status has following values
     *
     * `not found`: User does not exists
     *
     * `password`: Wrong passsword provided for this username
     *
     * `available`: User credentials checks out. It is valid user.
     *
     * @type  {("not found" | "password" | "available")}
     */
    let status = "not found";
    let returnUser = {};
    for (let i = 0; i < currentUsers.length; i++) {
      const currentUser = currentUsers[i];
      if (currentUser.username === user.username) {
        if (currentUser.password === user.password) {
          status = "available";
          returnUser = currentUser;
        } else {
          status = "password";
        }
        break;
      }
    }

    // IF no user is found
    if (status === "not found") {
      console.log("On Api call [POST] /api/auth/login => ");
      console.log("User does not exists => ");
      console.log(user.username);
      res.json({
        error: "user does not exists",
        message: "user with this username does not exists.",
      });
      return;
    }

    // If password is wrong
    if (status === "password") {
      console.log("On Api call [POST] /api/auth/login => ");
      console.log("Incorrect Password => ");
      console.log(user.username);
      res.json({
        error: "Wrong password",
        message: "Wrong password provoded.",
      });
      return;
    }

    // Everything is okay. Good to go.

    // return user that is found
    res.json({ message: "user found!", user: returnUser });
    return;
  } catch (error) {
    console.log("On Api call [POST] /api/auth/login => ");
    console.log(error);
    res.status(200).json({ error, message: "Internal Server Error" });
  }
});

AuthApiRouter.post("/getuser", async (req, res) => {
  try {
    const { id } = req.body;
    const { data: currentUser, error: error1 } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("id", id);
    if (error1) {
      console.log("On Api call [POST] /api/auth/getuser => ");
      console.log("Supabase returned error => ");
      console.log(error1);
      res.json({ error: error1, message: "Supabase Server error" });
      return;
    }
    if (currentUser.length === 0) {
      res.json({ error: "Bad credentials", message: "Unusual id provided" });
      return;
    }
    res.status(200).json({ user: currentUser[0] });
  } catch (error) {
    console.log("On Api call [POST] /api/auth/getuser => ");
    console.log(error);
    res.status(200).json({ error, message: "Internal Server Error" });
  }
});

export default AuthApiRouter;
