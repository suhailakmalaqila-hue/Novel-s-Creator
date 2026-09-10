import { Request, Response } from "express";

import {
  getAllGenres,
  createGenre,
  addGenreToBook,
  removeGenreFromBook,
} from "../services/genre.service";

export async function getGenres(
  _req: Request,
  res: Response
) {
  try {
    const genres = await getAllGenres();

    return res.json({
      success: true,
      data: genres,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil genre",
    });
  }
}

export async function addGenre(
  req: Request,
  res: Response
) {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Nama genre wajib diisi",
      });
    }

    const genre = await createGenre(name);

    return res.status(201).json({
      success: true,
      message: "Genre berhasil dibuat",
      data: genre,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal membuat genre",
    });
  }
}

export async function attachGenreToBook(
  req: Request,
  res: Response
) {
  try {
    const { bookId, genreId } = req.params;

    const relation = await addGenreToBook(
      bookId,
      genreId
    );

    return res.status(201).json({
      success: true,
      message: "Genre berhasil ditambahkan ke buku",
      data: relation,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan genre ke buku",
    });
  }
}

export async function detachGenreFromBook(
  req: Request,
  res: Response
) {
  try {
    const { bookId, genreId } = req.params;

    const relation = await removeGenreFromBook(
      bookId,
      genreId
    );

    if (!relation) {
      return res.status(404).json({
        success: false,
        message: "Relasi genre tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message: "Genre berhasil dihapus dari buku",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus genre dari buku",
    });
  }
}