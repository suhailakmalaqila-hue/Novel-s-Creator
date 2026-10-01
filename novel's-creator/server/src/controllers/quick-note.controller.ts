import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  getQuickNotes,
  createQuickNote,
  updateQuickNote,
  deleteQuickNote,
} from "../services/quick-note.service";

function handleReferenceError(error: unknown, res: Response): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  switch (error.message) {
    case "BOOK_NOT_OWNED":
      res.status(403).json({
        success: false,
        message: "Buku tidak dimiliki user",
      });
      return true;

    case "CHAPTER_NOT_OWNED":
      res.status(403).json({
        success: false,
        message: "Chapter tidak dimiliki user",
      });
      return true;

    case "CHARACTER_NOT_OWNED":
      res.status(403).json({
        success: false,
        message: "Character tidak dimiliki user",
      });
      return true;

    case "INVALID_NOTE_SCOPE":
      res.status(400).json({
        success: false,
        message: "Scope quick note tidak sesuai dengan referensi data",
      });
      return true;

    case "MULTIPLE_NOTE_REFERENCES":
      res.status(400).json({
        success: false,
        message:
          "Quick note hanya boleh memiliki satu referensi book, chapter, atau character",
      });
      return true;

    case "INVALID_REFERENCE_ID":
      res.status(400).json({
        success: false,
        message: "ID referensi quick note tidak valid",
      });
      return true;

    default:
      return false;
  }
}

export async function listQuickNotes(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const notes = await getQuickNotes(userId);

    return res.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error("listQuickNotes error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil quick notes",
    });
  }
}

export async function addQuickNote(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const title =
      typeof req.body?.title === "string" ? req.body.title.trim() : "";

    const content =
      typeof req.body?.content === "string" ? req.body.content.trim() : "";

    if (!title && !content) {
      return res.status(400).json({
        success: false,
        message: "Judul atau isi catatan wajib diisi",
      });
    }

    const note = await createQuickNote(userId, req.body ?? {});

    return res.status(201).json({
      success: true,
      message: "Quick note berhasil dibuat",
      data: note,
    });
  } catch (error) {
    if (handleReferenceError(error, res)) {
      return;
    }

    console.error("addQuickNote error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal membuat quick note",
    });
  }
}

export async function editQuickNote(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const note = await updateQuickNote(
      userId,
      req.params.noteId,
      req.body ?? {}
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Quick note tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message: "Quick note berhasil diperbarui",
      data: note,
    });
  } catch (error) {
    if (handleReferenceError(error, res)) {
      return;
    }

    console.error("editQuickNote error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui quick note",
    });
  }
}

export async function removeQuickNote(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const deleted = await deleteQuickNote(userId, req.params.noteId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Quick note tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message: "Quick note berhasil dihapus",
      data: deleted,
    });
  } catch (error) {
    console.error("removeQuickNote error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus quick note",
    });
  }
}
