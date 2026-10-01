import { Router } from "express";

import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "../controllers/user.controller";

import {
  authMiddleware,
} from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/me",
  authMiddleware,
  getMyProfile
);

router.patch(
  "/me",
  authMiddleware,
  updateMyProfile
);

router.patch(
  "/me/password",
  authMiddleware,
  changeMyPassword
);

export default router;
