import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import supabase_pkg from "@supabase/supabase-js";
const { createClient } = supabase_pkg;

const supabase = createClient(process.env.supabaseUrl, process.env.supabaseKey);

(async () => {
  console.log("self caaling function");
  const { data, error } = await supabase
    .from("userinfo")
    .select(`username,password`);
  console.log(data);
  const userinfo = supabase
    .from("userinfo")
    .on("*", (payload) => {
      console.log(payload);
      console.log(`By method of ${payload.eventType}`);
    })
    .subscribe();
})();

const app = express();

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
