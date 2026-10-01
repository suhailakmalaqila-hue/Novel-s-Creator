import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Pool } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

/**
 * All timestamp-without-time-zone columns in the current schema are written
 * from a UTC PostgreSQL session. The frontend then converts those UTC values
 * into the user's own browser timezone for display.
 */
const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 5432,
  database:
    process.env.DB_NAME || "novels_creator_db",
  user: process.env.DB_USER || "postgres",
  password: String(
    process.env.DB_PASSWORD || "postgres"
  ),

  // PostgreSQL session timezone.
  options: "-c timezone=UTC",
});

pool.on("connect", (client) => {
  console.log("PostgreSQL connected");

  // Keep the setting explicit even if the server/database default changes.
  void client.query("SET TIME ZONE 'UTC'");
});

pool.on("error", (error) => {
  console.error(
    "Unexpected PostgreSQL error:",
    error
  );
});

export default pool;
