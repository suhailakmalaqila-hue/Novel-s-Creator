import { Response } from "express";

import {
  AuthRequest,
} from "../middleware/auth.middleware";

import {
  getRelationships,
  createRelationship,
  updateRelationship,
  deleteRelationship,
} from "../services/relationship.service";

export async function listRelationships(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const result = await getRelationships(
      req.params.characterId,
      req.user.id
    );

    if (result === null) {
      return res.status(404).json({
        message: "Karakter tidak ditemukan",
      });
    }

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gagal mengambil relationship",
    });
  }
}

export async function addRelationship(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (
      !req.body.targetCharacterId ||
      !req.body.relationType
    ) {
      return res.status(400).json({
        message:
          "targetCharacterId dan relationType wajib diisi",
      });
    }

    const relationship =
      await createRelationship(
        req.params.characterId,
        req.user.id,
        req.body
      );

    if (relationship === null) {
      return res.status(404).json({
        message: "Karakter tidak ditemukan",
      });
    }

    return res.status(201).json(
      relationship
    );
  } catch (error: any) {
    console.error(error);

    if (
      error.message === "TARGET_NOT_OWNED"
    ) {
      return res.status(403).json({
        message:
          "Target character tidak dimiliki user",
      });
    }

    if (
      error.message === "SELF_RELATIONSHIP"
    ) {
      return res.status(400).json({
        message:
          "Karakter tidak dapat memiliki relationship dengan dirinya sendiri",
      });
    }

    return res.status(500).json({
      message: "Gagal membuat relationship",
    });
  }
}

export async function editRelationship(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const relationship =
      await updateRelationship(
        req.params.relationshipId,
        req.user.id,
        req.body
      );

    if (!relationship) {
      return res.status(404).json({
        message:
          "Relationship tidak ditemukan",
      });
    }

    return res.json(relationship);
  } catch (error: any) {
    console.error(error);

    if (
      error.message === "TARGET_NOT_OWNED"
    ) {
      return res.status(403).json({
        message:
          "Target character tidak dimiliki user",
      });
    }

    if (
      error.message === "SELF_RELATIONSHIP"
    ) {
      return res.status(400).json({
        message:
          "Karakter tidak dapat memiliki relationship dengan dirinya sendiri",
      });
    }

    return res.status(500).json({
      message:
        "Gagal memperbarui relationship",
    });
  }
}

export async function removeRelationship(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const deleted =
      await deleteRelationship(
        req.params.relationshipId,
        req.user.id
      );

    if (!deleted) {
      return res.status(404).json({
        message:
          "Relationship tidak ditemukan",
      });
    }

    return res.json({
      message:
        "Relationship berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Gagal menghapus relationship",
    });
  }
}
