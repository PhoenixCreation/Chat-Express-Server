import dotenv from "dotenv";
dotenv.config();
import supabase_pkg from "@supabase/supabase-js";
const { createClient } = supabase_pkg;

const supabase = createClient(process.env.supabaseUrl, process.env.supabaseKey);
console.log(`Supabase connected, probably`);

export default supabase;
