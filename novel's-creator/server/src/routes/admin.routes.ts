import { Router } from "express";

import {
  authMiddleware,
  requireRole,
} from "../middleware/auth.middleware";

import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from "../controllers/admin.controller";

const router = Router();

router.use(authMiddleware);
router.use(requireRole("admin"));

router.get("/users", getAdminUsers);

router.post("/users", createAdminUser);

router.patch(
  "/users/:userId",
  updateAdminUser
);

router.delete(
  "/users/:userId",
  deleteAdminUser
);

export default router;
