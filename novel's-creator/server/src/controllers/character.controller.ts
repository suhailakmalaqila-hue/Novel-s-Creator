import { Request, Response } from "express";

import {
  AuthRequest,
} from "../middleware/auth.middleware";

import {
  getCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from "../services/character.service";

function isInvalidCharacterInput(
  error: unknown
): error is Error {
  return (
    error instanceof Error &&
    [
      "FULL_NAME_REQUIRED",
      "INVALID_CHARACTER_ROLE",
      "INVALID_CHARACTER_STATUS",
      "INVALID_BOOK_IDS",
      "INVALID_BOOK_ID",
      "INVALID_USER_ID",
    ].includes(error.message)
  );
}

export async function listCharacters(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const bookId =
      typeof req.query.bookId === "string"
        ? req.query.bookId
        : undefined;

    const characters =
      await getCharacters(
        req.user.id,
        bookId
      );

    return res.json(characters);
  } catch (error) {
    console.error(error);

    if (
      isInvalidCharacterInput(error)
    ) {
      return res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Gagal mengambil karakter",
    });
  }
}

export async function getCharacter(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const character =
      await getCharacterById(
        req.params.characterId,
        req.user.id
      );

    if (!character) {
      return res.status(404).json({
        success: false,
        message:
          "Karakter tidak ditemukan",
      });
    }

    return res.json(character);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Gagal mengambil karakter",
    });
  }
}

export async function addCharacter(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      typeof req.body?.fullName !==
        "string" ||
      !req.body.fullName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "fullName wajib diisi",
      });
    }

    const character =
      await createCharacter(
        req.user.id,
        req.body
      );

    return res.status(201).json(
      character
    );
  } catch (error: any) {
    console.error(
      "Create character failed:",
      error
    );

    if (
      isInvalidCharacterInput(error)
    ) {
      return res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }

    if (
      error?.message ===
      "BOOK_NOT_OWNED"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Buku tidak dimiliki user",
      });
    }

    if (error?.code === "22P02") {
      return res.status(400).json({
        success: false,
        message:
          "Nilai character tidak valid. Periksa roleTag, status, dan UUID bookIds.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Gagal membuat karakter",
    });
  }
}

export async function editCharacter(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const character =
      await updateCharacter(
        req.params.characterId,
        req.user.id,
        req.body
      );

    if (!character) {
      return res.status(404).json({
        success: false,
        message:
          "Karakter tidak ditemukan",
      });
    }

    return res.json(character);
  } catch (error: any) {
    console.error(
      "Update character failed:",
      error
    );

    if (
      isInvalidCharacterInput(error)
    ) {
      return res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }

    if (
      error?.message ===
      "BOOK_NOT_OWNED"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Buku tidak dimiliki user",
      });
    }

    if (error?.code === "22P02") {
      return res.status(400).json({
        success: false,
        message:
          "Nilai character tidak valid.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Gagal memperbarui karakter",
    });
  }
}

export async function removeCharacter(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const deleted =
      await deleteCharacter(
        req.params.characterId,
        req.user.id
      );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message:
          "Karakter tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message:
        "Karakter berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Gagal menghapus karakter",
    });
  }
}
