import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Pool } from "pg";

// Buat pengganti __dirname khusus ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Selalu membaca .env yang berada di folder server
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "novels_creator_db",
  user: process.env.DB_USER || "postgres",
  password: String(process.env.DB_PASSWORD || "postgres"),
});

pool.on("connect", () => {
  console.log("PostgreSQL connected");
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL error:", error);
});

export default pool;