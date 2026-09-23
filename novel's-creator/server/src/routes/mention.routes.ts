import { Router } from "express";

import {
  listMentions,
  addMention,
  editMention,
  removeMention,
} from "../controllers/mention.controller";

import {
  authMiddleware,
} from "../middleware/auth.middleware";

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

router.patch(
  "/books/:bookId/chapters/:chapterId/mentions/:mentionId",
  editMention
);

router.delete(
  "/books/:bookId/chapters/:chapterId/mentions/:mentionId",
  removeMention
);

export default router;
