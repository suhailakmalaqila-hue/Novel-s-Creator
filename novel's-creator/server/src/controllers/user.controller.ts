import { Response } from "express";

import {
  AuthenticatedRequest,
} from "../middleware/auth.middleware";

import {
  getUserById,
  updateUser,
} from "../services/user.service";

export async function getMyProfile(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.userId;

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
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Gagal mengambil data user",
    });
  }
}

export async function updateMyProfile(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.userId;

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
      message:
        "Profil berhasil diperbarui",
      data: user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Gagal memperbarui profil",
    });
  }
}
