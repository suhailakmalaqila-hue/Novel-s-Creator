import { Router } from "express";

import {
  listCharacters,
  getCharacter,
  addCharacter,
  editCharacter,
  removeCharacter,
} from "../controllers/character.controller";

import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", listCharacters);

router.get(
  "/:characterId",
  getCharacter
);

router.post(
  "/",
  addCharacter
);

router.patch(
  "/:characterId",
  editCharacter
);

router.delete(
  "/:characterId",
  removeCharacter
);

export default router;
