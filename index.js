import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import supabase_pkg from "@supabase/supabase-js";
const { createClient } = supabase_pkg;
import pg_pkg from "pg";
const { Client } = pg_pkg;

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});
client.connect((error) =>
  console.log(error ? error : "Connected postgres database")
);

const supabase = createClient(process.env.supabaseUrl, process.env.supabaseKey);

(async () => {
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

// INFO: `alter publication supabase_realtime add table <table_name>;`

app.get("/test", async (req, res) => {
  try {
    // always use toLowerCase at the end of the name or else things won't work
    const dbname = `Alice_to_Bob`.toLowerCase();
    res.json({ message: Math.random(), dbname });
  } catch (err) {
    console.log(err);
    res.json({ err });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
