import { Router } from "express";

import {
  getGenres,
  addGenre,
  attachGenreToBook,
  detachGenreFromBook,
} from "../controllers/genre.controller";

import {
  authMiddleware,
} from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

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
