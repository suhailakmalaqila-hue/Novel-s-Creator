import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest
  extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authorization =
    req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      success: false,
      message: "Token autentikasi tidak ditemukan",
    });
  }

  const [type, token] =
    authorization.split(" ");

  if (
    type !== "Bearer" ||
    !token
  ) {
    return res.status(401).json({
      success: false,
      message:
        "Format Authorization tidak valid",
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error(
      "JWT_SECRET belum dikonfigurasi"
    );

    return res.status(500).json({
      success: false,
      message:
        "Konfigurasi authentication bermasalah",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      secret
    );

    if (
      typeof decoded !== "object" ||
      !decoded.userId ||
      !decoded.email ||
      !decoded.role
    ) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid",
      });
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        "Token tidak valid atau sudah kedaluwarsa",
    });
  }
}