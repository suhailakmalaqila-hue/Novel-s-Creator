import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";

import {
  getUserById,
  updateUser,
  changeUserPassword,
} from "../services/user.service";

export async function getMyProfile(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("getMyProfile error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil profil",
    });
  }
}

export async function updateMyProfile(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await updateUser(
      userId,
      req.body
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    return res.json({
      success: true,
      message: "Profil berhasil diperbarui",
      data: user,
    });
  } catch (error) {
    console.error("updateMyProfile error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui profil",
    });
  }
}

export async function changeMyPassword(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Password lama dan password baru wajib diisi",
      });
    }

    if (!currentPassword.trim()) {
      return res.status(400).json({
        success: false,
        message: "Password lama wajib diisi",
      });
    }

    if (!newPassword.trim()) {
      return res.status(400).json({
        success: false,
        message: "Password baru wajib diisi",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password baru minimal 6 karakter",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "Password baru harus berbeda dari password lama",
      });
    }

    await changeUserPassword(
      userId,
      currentPassword,
      newPassword
    );

    return res.json({
      success: true,
      message: "Kata sandi berhasil diperbarui",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_CURRENT_PASSWORD"
    ) {
      return res.status(401).json({
        success: false,
        message: "Kata sandi saat ini salah",
      });
    }

    if (
      error instanceof Error &&
      error.message === "USER_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    if (
      error instanceof Error &&
      error.message === "SAME_PASSWORD"
    ) {
      return res.status(400).json({
        success: false,
        message: "Password baru harus berbeda dari password lama",
      });
    }

    console.error("changeMyPassword error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui kata sandi",
    });
  }
}
