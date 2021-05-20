import dotenv from "dotenv";
dotenv.config();
import pg_pkg from "pg";
const { Client } = pg_pkg;

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
});
client.connect((error) =>
  console.log(error ? error : "Connected postgres database")
);

export default client;
