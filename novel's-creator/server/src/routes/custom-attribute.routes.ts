import { Router } from "express";

import {
  listCustomAttributes,
  addCustomAttribute,
  editCustomAttribute,
  removeCustomAttribute,
} from "../controllers/custom-attribute.controller";

import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get(
  "/:characterId/attributes",
  listCustomAttributes
);

router.post(
  "/:characterId/attributes",
  addCustomAttribute
);

router.patch(
  "/:characterId/attributes/:attributeId",
  editCustomAttribute
);

router.delete(
  "/:characterId/attributes/:attributeId",
  removeCustomAttribute
);

export default router;
