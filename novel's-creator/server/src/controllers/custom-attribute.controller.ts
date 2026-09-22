import { Response } from "express";

import {
  AuthRequest,
} from "../middleware/auth.middleware";

import {
  getCustomAttributes,
  createCustomAttribute,
  updateCustomAttribute,
  deleteCustomAttribute,
} from "../services/custom-attribute.service";

export async function listCustomAttributes(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const attributes =
      await getCustomAttributes(
        req.params.characterId,
        req.user.id
      );

    if (attributes === null) {
      return res.status(404).json({
        message: "Karakter tidak ditemukan",
      });
    }

    return res.json(attributes);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Gagal mengambil custom attributes",
    });
  }
}

export async function addCustomAttribute(
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
      !req.body.key ||
      typeof req.body.key !== "string"
    ) {
      return res.status(400).json({
        message: "key wajib diisi",
      });
    }

    const attribute =
      await createCustomAttribute(
        req.params.characterId,
        req.user.id,
        req.body
      );

    if (attribute === null) {
      return res.status(404).json({
        message: "Karakter tidak ditemukan",
      });
    }

    return res.status(201).json(attribute);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Gagal membuat custom attribute",
    });
  }
}

export async function editCustomAttribute(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const attribute =
      await updateCustomAttribute(
        req.params.attributeId,
        req.user.id,
        req.body
      );

    if (!attribute) {
      return res.status(404).json({
        message:
          "Custom attribute tidak ditemukan",
      });
    }

    return res.json(attribute);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Gagal memperbarui custom attribute",
    });
  }
}

export async function removeCustomAttribute(
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
      await deleteCustomAttribute(
        req.params.attributeId,
        req.user.id
      );

    if (!deleted) {
      return res.status(404).json({
        message:
          "Custom attribute tidak ditemukan",
      });
    }

    return res.json({
      message:
        "Custom attribute berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Gagal menghapus custom attribute",
    });
  }
}
