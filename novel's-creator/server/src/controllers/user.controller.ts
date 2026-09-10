import { Request, Response } from "express";
import {
  getUserById,
  updateUser,
} from "../services/user.service";

export async function getMyProfile(
  req: Request,
  res: Response
) {
  try {
    const userId = req.params.userId;

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
      message: "Gagal mengambil data user",
    });
  }
}

export async function updateMyProfile(
  req: Request,
  res: Response
) {
  try {
    const userId = req.params.userId;

    const user = await updateUser(userId, req.body);

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
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui profil",
    });
  }
}
