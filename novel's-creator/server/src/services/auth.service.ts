import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/database";

function generateToken(user: {
  id: string;
  email: string;
  role: string;
}) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET belum dikonfigurasi"
    );
  }

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    secret,
    {
      expiresIn: "7d",
    }
  );
}

/**
 * Public registration is intentionally not implemented.
 *
 * Account creation belongs to the Admin user-management module:
 *
 * Admin Dashboard
 *      -> POST /api/admin/users
 *      -> user.service.ts
 *      -> users
 *
 * This service therefore contains authentication only.
 */
export async function loginUser(
  email: string,
  password: string
) {
  const normalizedEmail =
    email.trim().toLowerCase();

  const result = await pool.query(
    `
    SELECT
      id,
      email,
      password_hash,
      role,
      author_name,
      pen_name,
      bio,
      avatar_url,
      daily_word_goal,
      today_word_count,
      last_active_date,
      theme,
      sound_effects,
      preferred_genre,
      tutorial_completed,
      created_at,
      updated_at
    FROM users
    WHERE LOWER(email) = $1
    `,
    [normalizedEmail]
  );

  if (result.rows.length === 0) {
    throw new Error(
      "INVALID_CREDENTIALS"
    );
  }

  const user = result.rows[0];

  const passwordValid =
    await bcrypt.compare(
      password,
      user.password_hash
    );

  if (!passwordValid) {
    throw new Error(
      "INVALID_CREDENTIALS"
    );
  }

  const token =
    generateToken(user);

  const {
    password_hash: _passwordHash,
    ...safeUser
  } = user;

  return {
    user: safeUser,
    token,
  };
}
