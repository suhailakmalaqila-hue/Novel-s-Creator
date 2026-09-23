import { Response } from "express";

import {
  AuthRequest,
} from "../middleware/auth.middleware";

import {
  getMentions,
  createMention,
  updateMention,
  deleteMention,
} from "../services/mention.service";

export async function listMentions(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const mentions =
      await getMentions(
        req.params.bookId,
        req.params.chapterId,
        req.user.id
      );

    if (mentions === null) {
      return res.status(404).json({
        message:
          "Chapter tidak ditemukan",
      });
    }

    return res.json(mentions);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Gagal mengambil character mentions",
    });
  }
}

export async function addMention(
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
      !req.body.characterId ||
      !req.body.displayText
    ) {
      return res.status(400).json({
        message:
          "characterId dan displayText wajib diisi",
      });
    }

    const mention =
      await createMention(
        req.params.bookId,
        req.params.chapterId,
        req.user.id,
        req.body
      );

    if (mention === null) {
      return res.status(404).json({
        message:
          "Chapter tidak ditemukan",
      });
    }

    return res.status(201).json(
      mention
    );
  } catch (error: any) {
    console.error(error);

    if (
      error.message ===
      "CHARACTER_NOT_OWNED"
    ) {
      return res.status(403).json({
        message:
          "Character tidak dimiliki user",
      });
    }

    if (
      error.message ===
      "CHARACTER_NOT_IN_BOOK"
    ) {
      return res.status(400).json({
        message:
          "Character belum terhubung dengan buku",
      });
    }

    return res.status(500).json({
      message:
        "Gagal membuat character mention",
    });
  }
}

export async function editMention(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const mention =
      await updateMention(
        req.params.bookId,
        req.params.chapterId,
        req.params.mentionId,
        req.user.id,
        req.body
      );

    if (mention === null) {
      return res.status(404).json({
        message:
          "Character mention tidak ditemukan",
      });
    }

    return res.json(mention);
  } catch (error: any) {
    console.error(error);

    if (
      error.message ===
      "CHARACTER_NOT_OWNED"
    ) {
      return res.status(403).json({
        message:
          "Character tidak dimiliki user",
      });
    }

    if (
      error.message ===
      "CHARACTER_NOT_IN_BOOK"
    ) {
      return res.status(400).json({
        message:
          "Character belum terhubung dengan buku",
      });
    }

    return res.status(500).json({
      message:
        "Gagal memperbarui character mention",
    });
  }
}

export async function removeMention(
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
      await deleteMention(
        req.params.mentionId,
        req.user.id
      );

    if (!deleted) {
      return res.status(404).json({
        message:
          "Character mention tidak ditemukan",
      });
    }

    return res.json({
      message:
        "Character mention berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message:
        "Gagal menghapus character mention",
    });
  }
}
