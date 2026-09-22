import { Request, Response } from "express";

import { loginUser } from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  return res.status(403).json({
    message: 'Registrasi mandiri dinonaktifkan. Akun dibuat oleh Admin.'
  });
};

export async function login(
  req: Request,
  res: Response
) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi",
      });
    }

    const result = await loginUser(
      email,
      password
    );

    return res.json({
      success: true,
      message: "Login berhasil",
      data: result,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_CREDENTIALS"
    ) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal melakukan login",
    });
  }
}