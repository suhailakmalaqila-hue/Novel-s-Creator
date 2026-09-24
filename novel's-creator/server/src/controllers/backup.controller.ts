import { Response } from "express";
import {
  AuthRequest,
} from "../middleware/auth.middleware";
import {
  exportUserBackup,
  importUserBackup,
  BackupData,
} from "../services/backup.service";

export async function exportBackup(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const backup = await exportUserBackup(userId);

    const filename =
      `novels-creator-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

    res.setHeader(
      "Content-Type",
      "application/json; charset=utf-8"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    return res.status(200).json(backup);
  } catch (error) {
    console.error(
      "Export backup error:",
      error
    );

    return res.status(500).json({
      message: "Gagal melakukan export backup",
    });
  }
}

export async function importBackup(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const backup = req.body as BackupData;

    if (!backup || typeof backup !== "object") {
      return res.status(400).json({
        message: "Backup JSON tidak valid",
      });
    }

    if (backup.format !== "novels-creator") {
      return res.status(400).json({
        message: "Format backup tidak valid",
      });
    }

    if (backup.version !== 1) {
      return res.status(400).json({
        message:
          "Versi backup tidak didukung",
      });
    }

    const result =
      await importUserBackup(
        userId,
        backup
      );

    return res.status(200).json({
      success: true,
      message:
        "Backup berhasil diimport",
      data: result,
    });
  } catch (error: any) {
    console.error(
      "Import backup error:",
      error
    );

    const errorMessages: Record<
      string,
      string
    > = {
      INVALID_BACKUP:
        "Backup JSON tidak valid",

      INVALID_BACKUP_FORMAT:
        "Format backup tidak valid",

      UNSUPPORTED_BACKUP_VERSION:
        "Versi backup tidak didukung",

      INVALID_BACKUP_PROJECT:
        "Struktur project backup tidak valid",

      INVALID_BACKUP_STRUCTURE:
        "Struktur data backup tidak valid",

      INVALID_BOOK_ID:
        "Data book dalam backup tidak valid",

      INVALID_GENRE_ID:
        "Data genre dalam backup tidak valid",

      INVALID_GENRE_NAME:
        "Nama genre dalam backup tidak valid",

      INVALID_BOOK_GENRE_REFERENCE:
        "Referensi book genre tidak valid",

      INVALID_CHAPTER_BOOK_REFERENCE:
        "Referensi book pada chapter tidak valid",

      INVALID_CHAPTER_ID:
        "Data chapter dalam backup tidak valid",

      INVALID_SNAPSHOT_REFERENCE:
        "Referensi chapter snapshot tidak valid",

      INVALID_CHARACTER_ID:
        "Data character dalam backup tidak valid",

      INVALID_BOOK_CHARACTER_REFERENCE:
        "Referensi book character tidak valid",

      INVALID_CUSTOM_ATTRIBUTE_REFERENCE:
        "Referensi custom attribute tidak valid",

      INVALID_RELATIONSHIP_REFERENCE:
        "Referensi relationship tidak valid",

      INVALID_SELF_RELATIONSHIP:
        "Relationship karakter tidak valid",

      INVALID_MENTION_REFERENCE:
        "Referensi character mention tidak valid",

      INVALID_QUICK_NOTE_BOOK_REFERENCE:
        "Referensi book pada quick note tidak valid",

      INVALID_QUICK_NOTE_CHAPTER_REFERENCE:
        "Referensi chapter pada quick note tidak valid",

      INVALID_QUICK_NOTE_CHARACTER_REFERENCE:
        "Referensi character pada quick note tidak valid",
    };

    const message =
      errorMessages[error?.message] ??
      "Gagal melakukan import backup";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}
