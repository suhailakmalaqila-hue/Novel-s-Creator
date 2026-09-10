import { Router } from "express";

import {
  getGenres,
  addGenre,
  attachGenreToBook,
  detachGenreFromBook,
} from "../controllers/genre.controller";

const router = Router();

router.get("/", getGenres);

router.post("/", addGenre);

router.post(
  "/books/:bookId/:genreId",
  attachGenreToBook
);

router.delete(
  "/books/:bookId/:genreId",
  detachGenreFromBook
);

export default router;