import { Request, Response } from "express";

import {
  getBooksByUser,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from "../services/book.service";

export async function getBooks(
  req: Request,
  res: Response
) {
  try {
    const userId = req.params.userId;

    const books = await getBooksByUser(userId);

    return res.json({
      success: true,
      data: books,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar buku",
    });
  }
}

export async function getBook(
  req: Request,
  res: Response
) {
  try {
    const { userId, bookId } = req.params;

    const book = await getBookById(bookId, userId);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Buku tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      data: book,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data buku",
    });
  }
}

export async function addBook(
  req: Request,
  res: Response
) {
  try {
    const userId = req.params.userId;

    if (!req.body.title) {
      return res.status(400).json({
        success: false,
        message: "Judul buku wajib diisi",
      });
    }

    const book = await createBook(userId, req.body);

    return res.status(201).json({
      success: true,
      message: "Buku berhasil dibuat",
      data: book,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal membuat buku",
    });
  }
}

export async function editBook(
  req: Request,
  res: Response
) {
  try {
    const { userId, bookId } = req.params;

    const book = await updateBook(
      bookId,
      userId,
      req.body
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Buku tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message: "Buku berhasil diperbarui",
      data: book,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui buku",
    });
  }
}

export async function removeBook(
  req: Request,
  res: Response
) {
  try {
    const { userId, bookId } = req.params;

    const deleted = await deleteBook(
      bookId,
      userId
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Buku tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message: "Buku berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus buku",
    });
  }
}