import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  listQuickNotes,
  addQuickNote,
  editQuickNote,
  removeQuickNote,
} from "../controllers/quick-note.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", listQuickNotes);
router.post("/", addQuickNote);
router.patch("/:noteId", editQuickNote);
router.delete("/:noteId", removeQuickNote);

export default router;
