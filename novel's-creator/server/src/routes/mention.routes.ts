import { Router } from "express";

import {
  listMentions,
  addMention,
  removeMention,
} from "../controllers/mention.controller";

import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get(
  "/books/:bookId/chapters/:chapterId/mentions",
  listMentions
);

router.post(
  "/books/:bookId/chapters/:chapterId/mentions",
  addMention
);

router.delete(
  "/books/:bookId/chapters/:chapterId/mentions/:mentionId",
  removeMention
);

export default router;
