import { Router } from "express";

import {
  listRelationships,
  addRelationship,
  editRelationship,
  removeRelationship,
} from "../controllers/relationship.controller";

import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get(
  "/:characterId/relationships",
  listRelationships
);

router.post(
  "/:characterId/relationships",
  addRelationship
);

router.patch(
  "/:characterId/relationships/:relationshipId",
  editRelationship
);

router.delete(
  "/:characterId/relationships/:relationshipId",
  removeRelationship
);

export default router;
