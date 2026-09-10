import path from "path";
import dotenv from "dotenv";
import { Pool } from "pg";

// Memastikan .env di root folder selalu terbaca
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on("connect", () => {
  console.log("PostgreSQL connected");
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL error:", error);
});

export default pool;