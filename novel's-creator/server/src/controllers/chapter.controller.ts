import { Response } from "express";

import {
  AuthRequest,
} from "../middleware/auth.middleware";

import {
  getChaptersByBook,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
  getSnapshots,
  createSnapshot,
  getSnapshotById,
} from "../services/chapter.service";

export async function getChapters(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId =
      req.user?.id;

    const { bookId } =
      req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Tidak terautentikasi",
      });
    }

    const chapters =
      await getChaptersByBook(
        bookId,
        userId
      );

    return res.json({
      success: true,
      data: chapters,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Gagal mengambil chapter",
    });
  }
}

export async function getChapter(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId =
      req.user?.id;

    const {
      bookId,
      chapterId,
    } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Tidak terautentikasi",
      });
    }

    const chapter =
      await getChapterById(
        bookId,
        chapterId,
        userId
      );

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message:
          "Chapter tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      data: chapter,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Gagal mengambil chapter",
    });
  }
}

export async function addChapter(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId =
      req.user?.id;

    const { bookId } =
      req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Tidak terautentikasi",
      });
    }

    if (
      !req.body.title ||
      !req.body.title.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Judul chapter wajib diisi",
      });
    }

    const chapter =
      await createChapter(
        bookId,
        userId,
        req.body
      );

    return res.status(201).json({
      success: true,
      message:
        "Chapter berhasil dibuat",
      data: chapter,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "BOOK_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Buku tidak ditemukan",
      });
    }

    if (
      error instanceof Error &&
      error.message ===
        "CHAPTER_NUMBER_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Nomor chapter sudah digunakan",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Gagal membuat chapter",
    });
  }
}

export async function editChapter(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId =
      req.user?.id;

    const {
      bookId,
      chapterId,
    } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Tidak terautentikasi",
      });
    }

    const chapter =
      await updateChapter(
        bookId,
        chapterId,
        userId,
        req.body
      );

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message:
          "Chapter tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message:
        "Chapter berhasil diperbarui",
      data: chapter,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "CHAPTER_NUMBER_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Nomor chapter sudah digunakan",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Gagal memperbarui chapter",
    });
  }
}

export async function removeChapter(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId =
      req.user?.id;

    const {
      bookId,
      chapterId,
    } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Tidak terautentikasi",
      });
    }

    const deleted =
      await deleteChapter(
        bookId,
        chapterId,
        userId
      );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message:
          "Chapter tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message:
        "Chapter berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Gagal menghapus chapter",
    });
  }
}

export async function listSnapshots(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId =
      req.user?.id;

    const {
      bookId,
      chapterId,
    } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Tidak terautentikasi",
      });
    }

    const snapshots =
      await getSnapshots(
        bookId,
        chapterId,
        userId
      );

    if (!snapshots) {
      return res.status(404).json({
        success: false,
        message:
          "Chapter tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      data: snapshots,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Gagal mengambil snapshot",
    });
  }
}

export async function addSnapshot(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId =
      req.user?.id;

    const {
      bookId,
      chapterId,
    } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Tidak terautentikasi",
      });
    }

    const { chapterTitle, content, reason } = req.body;

    if (
      !chapterTitle ||
      content === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Data snapshot tidak lengkap",
      });
    }

    const snapshot = await createSnapshot(
  bookId,
  chapterId,
  userId,
  {
    chapterTitle,
    content,
    reason,
  }
);

    if (!snapshot) {
      return res.status(404).json({
        success: false,
        message:
          "Chapter tidak ditemukan",
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Snapshot berhasil dibuat",
      data: snapshot,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Gagal membuat snapshot",
    });
  }
}

export async function getSnapshot(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId =
      req.user?.id;

    const {
      bookId,
      chapterId,
      snapshotId,
    } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Tidak terautentikasi",
      });
    }

    const snapshot =
      await getSnapshotById(
        bookId,
        chapterId,
        snapshotId,
        userId
      );

    if (!snapshot) {
      return res.status(404).json({
        success: false,
        message:
          "Snapshot tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      data: snapshot,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Gagal mengambil snapshot",
    });
  }
}
