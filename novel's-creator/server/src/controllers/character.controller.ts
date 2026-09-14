import { Response } from "express";
import {
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

import {
  getCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from "../services/character.service";

export async function listCharacters(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const bookId =
      typeof req.query.bookId === "string"
        ? req.query.bookId
        : undefined;

    const characters = await getCharacters(
      req.user.userId,
      bookId
    );

    return res.json(characters);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gagal mengambil karakter",
    });
  }
}

export async function getCharacter(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const character = await getCharacterById(
      req.params.characterId,
      req.user.userId
    );

    if (!character) {
      return res.status(404).json({
        message: "Karakter tidak ditemukan",
      });
    }

    return res.json(character);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gagal mengambil karakter",
    });
  }
}

export async function addCharacter(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (
      !req.body.fullName ||
      typeof req.body.fullName !== "string"
    ) {
      return res.status(400).json({
        message: "fullName wajib diisi",
      });
    }

    const character = await createCharacter(
      req.user.userId,
      req.body
    );

    return res.status(201).json(character);
  } catch (error: any) {
    console.error(error);

    if (error.message === "BOOK_NOT_OWNED") {
      return res.status(403).json({
        message: "Buku tidak dimiliki user",
      });
    }

    return res.status(500).json({
      message: "Gagal membuat karakter",
    });
  }
}

export async function editCharacter(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const character = await updateCharacter(
      req.params.characterId,
      req.user.userId,
      req.body
    );

    if (!character) {
      return res.status(404).json({
        message: "Karakter tidak ditemukan",
      });
    }

    return res.json(character);
  } catch (error: any) {
    console.error(error);

    if (error.message === "BOOK_NOT_OWNED") {
      return res.status(403).json({
        message: "Buku tidak dimiliki user",
      });
    }

    return res.status(500).json({
      message: "Gagal memperbarui karakter",
    });
  }
}

export async function removeCharacter(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const deleted = await deleteCharacter(
      req.params.characterId,
      req.user.userId
    );

    if (!deleted) {
      return res.status(404).json({
        message: "Karakter tidak ditemukan",
      });
    }

    return res.json({
      message: "Karakter berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Gagal menghapus karakter",
    });
  }
}
