import { Router } from "express";

import {
  getMyProfile,
  updateMyProfile,
} from "../controllers/user.controller";

const router = Router();

router.get("/:userId", getMyProfile);

router.patch("/:userId", updateMyProfile);

export default router;