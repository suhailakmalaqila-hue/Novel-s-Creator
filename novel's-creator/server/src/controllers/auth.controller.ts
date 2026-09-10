import { Request, Response } from "express";

import {
  registerUser,
  loginUser,
} from "../services/auth.service";

export async function register(
  req: Request,
  res: Response
) {
  try {
    const {
      email,
      password,
      authorName,
      penName,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password minimal terdiri dari 8 karakter",
      });
    }

    const result = await registerUser({
      email,
      password,
      authorName,
      penName,
    });

    return res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      data: result,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "EMAIL_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        success: false,
        message: "Email sudah terdaftar",
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal melakukan registrasi",
    });
  }
}

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