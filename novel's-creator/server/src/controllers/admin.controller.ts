import { Response } from "express";

import {
  AuthRequest,
} from "../middleware/auth.middleware";

import {
  getAllUsers,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
} from "../services/user.service";

export async function getAdminUsers(
  req: AuthRequest,
  res: Response
) {
  try {
    const users = await getAllUsers();

    return res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("getAdminUsers error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data user",
    });
  }
}

export async function createAdminUser(
  req: AuthRequest,
  res: Response
) {
  try {
    const {
      email,
      password,
      authorName,
      penName,
      role,
    } = req.body;

    // Validasi field wajib
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi",
      });
    }

    // Validasi role jika dikirim
    if (
      role !== undefined &&
      role !== "admin" &&
      role !== "user"
    ) {
      return res.status(400).json({
        success: false,
        message: "Role harus admin atau user",
      });
    }

    const user = await createUserByAdmin({
      email,
      password,
      authorName,
      penName,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "User berhasil dibuat",
      data: user,
    });
  } catch (error) {
    console.error("createAdminUser error:", error);

    if (
      error instanceof Error &&
      error.message === "EMAIL_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        message: "Email sudah digunakan",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Gagal membuat user",
    });
  }
}

export async function updateAdminUser(
  req: AuthRequest,
  res: Response
) {
  try {
    const actorUserId = req.user?.id;
    const targetUserId = req.params.userId;

    if (!actorUserId) {
      return res.status(401).json({
        success: false,
        message: "Tidak terautentikasi",
      });
    }

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "User ID wajib diisi",
      });
    }

    const {
      email,
      password,
      authorName,
      penName,
      role,
    } = req.body;

    // Tidak boleh mengirim role selain enum database
    if (
      role !== undefined &&
      role !== "admin" &&
      role !== "user"
    ) {
      return res.status(400).json({
        success: false,
        message: "Role harus admin atau user",
      });
    }

    const user = await updateUserByAdmin(
      targetUserId,
      actorUserId,
      {
        email,
        password,
        authorName,
        penName,
        role,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message: "User berhasil diperbarui",
      data: user,
    });
  } catch (error) {
    console.error("updateAdminUser error:", error);

    if (
      error instanceof Error &&
      error.message === "EMAIL_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        message: "Email sudah digunakan",
      });
    }

    if (
      error instanceof Error &&
      error.message === "CANNOT_DEMOTE_SELF"
    ) {
      return res.status(400).json({
        success: false,
        message: "Admin tidak dapat menurunkan role dirinya sendiri",
      });
    }

    if (
      error instanceof Error &&
      error.message === "CANNOT_REMOVE_LAST_ADMIN"
    ) {
      return res.status(400).json({
        success: false,
        message: "Tidak dapat menghapus Admin terakhir",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui user",
    });
  }
}

export async function deleteAdminUser(
  req: AuthRequest,
  res: Response
) {
  try {
    const actorUserId = req.user?.id;
    const targetUserId = req.params.userId;

    if (!actorUserId) {
      return res.status(401).json({
        success: false,
        message: "Tidak terautentikasi",
      });
    }

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "User ID wajib diisi",
      });
    }

    const deleted = await deleteUserByAdmin(
      targetUserId,
      actorUserId
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message: "User berhasil dihapus",
    });
  } catch (error) {
    console.error("deleteAdminUser error:", error);

    if (
      error instanceof Error &&
      error.message === "CANNOT_DELETE_SELF"
    ) {
      return res.status(400).json({
        success: false,
        message: "Admin tidak dapat menghapus dirinya sendiri",
      });
    }

    if (
      error instanceof Error &&
      error.message === "CANNOT_DELETE_LAST_ADMIN"
    ) {
      return res.status(400).json({
        success: false,
        message: "Tidak dapat menghapus Admin terakhir",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus user",
    });
  }
}
