import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import pool from "./config/database";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import bookRoutes from "./routes/book.routes";
import genreRoutes from "./routes/genre.routes";
import chapterRoutes from "./routes/chapter.routes";
import characterRoutes from "./routes/character.routes";
import relationshipRoutes from "./routes/relationship.routes";
import customAttributeRoutes from "./routes/custom-attribute.routes";
import mentionRoutes from "./routes/mention.routes";

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

app.use(
  "/api/books",
  chapterRoutes
);

app.use(
  "/api/characters",
  characterRoutes
);

app.use(
  "/api/characters",
  relationshipRoutes
);

app.use(
  "/api/characters",
  customAttributeRoutes
);

app.use(
  "/api",
  mentionRoutes
);

app.listen(PORT, () => {
  console.log(
    `Novel's Creator API running on http://localhost:${PORT}`
  );
});