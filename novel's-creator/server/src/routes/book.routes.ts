import { Router } from "express";

import {
  getBooks,
  getBook,
  addBook,
  editBook,
  removeBook,
} from "../controllers/book.controller";

const router = Router();

router.get("/:userId", getBooks);

router.get("/:userId/:bookId", getBook);

router.post("/:userId", addBook);

router.patch("/:userId/:bookId", editBook);

router.delete("/:userId/:bookId", removeBook);

export default router;