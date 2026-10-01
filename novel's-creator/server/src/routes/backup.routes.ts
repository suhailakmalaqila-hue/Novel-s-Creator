import { Router } from "express";

import {
  exportBackup,
  importBackup,
} from "../controllers/backup.controller";

import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/export",
  authMiddleware,
  exportBackup
);

router.post(
  "/import",
  authMiddleware,
  importBackup
);

export default router;
