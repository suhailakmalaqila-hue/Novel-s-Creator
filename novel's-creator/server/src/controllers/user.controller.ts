import { Response } from "express";

import {
  AuthRequest,
} from "../middleware/auth.middleware";

import {
  getUserById,
  updateUser,
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
        message: "Tidak terautentikasi",
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
      message: "Gagal mengambil data user",
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
        message: "Tidak terautentikasi",
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
