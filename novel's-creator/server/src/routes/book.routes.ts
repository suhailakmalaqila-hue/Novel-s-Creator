import { Router } from "express";

import {
  getBooks,
  getBook,
  addBook,
  editBook,
  removeBook,
} from "../controllers/book.controller";

import {
  authMiddleware,
} from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getBooks);
router.get("/:bookId", getBook);
router.post("/", addBook);
router.patch("/:bookId", editBook);
router.delete("/:bookId", removeBook);

export default router;