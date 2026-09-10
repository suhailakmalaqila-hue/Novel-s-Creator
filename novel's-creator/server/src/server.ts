import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import pool from "./config/database";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import bookRoutes from "./routes/book.routes";
import genreRoutes from "./routes/genre.routes";

dotenv.config();

const app = express();

const PORT =
  Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    const result =
      await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message:
        "Novel's Creator API is running",
      database: "connected",
      timestamp:
        result.rows[0].now,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:
        "Database connection failed",
    });
  }
});

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/books",
  bookRoutes
);

app.use(
  "/api/genres",
  genreRoutes
);

app.listen(PORT, () => {
  console.log(
    `Novel's Creator API running on http://localhost:${PORT}`
  );
});