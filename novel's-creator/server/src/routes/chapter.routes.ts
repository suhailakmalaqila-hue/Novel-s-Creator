import { Router } from "express";

import {
  getChapters,
  getChapter,
  addChapter,
  editChapter,
  removeChapter,
  listSnapshots,
  addSnapshot,
  getSnapshot,
} from "../controllers/chapter.controller";

import {
  authMiddleware,
} from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get(
  "/:bookId/chapters",
  getChapters
);

router.get(
  "/:bookId/chapters/:chapterId",
  getChapter
);

router.post(
  "/:bookId/chapters",
  addChapter
);

router.patch(
  "/:bookId/chapters/:chapterId",
  editChapter
);

router.delete(
  "/:bookId/chapters/:chapterId",
  removeChapter
);

router.get(
  "/:bookId/chapters/:chapterId/snapshots",
  listSnapshots
);

router.post(
  "/:bookId/chapters/:chapterId/snapshots",
  addSnapshot
);

router.get(
  "/:bookId/chapters/:chapterId/snapshots/:snapshotId",
  getSnapshot
);

export default router;
