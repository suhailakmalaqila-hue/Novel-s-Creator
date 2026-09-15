import path from "path";
import dotenv from "dotenv";
import { Pool } from "pg";

// Memastikan .env terbaca
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "novels_creator_db",
  user: process.env.DB_USER || "postgres",
  password: String(process.env.DB_PASSWORD || "postgres"), // Mengunci agar nilainya PASTI string
});

pool.on("connect", () => {
  console.log("PostgreSQL connected");
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL error:", error);
});

export default pool;