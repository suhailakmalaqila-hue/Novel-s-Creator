import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/database";

type RegisterData = {
  email: string;
  password: string;
  authorName?: string;
  penName?: string;
};

function generateToken(user: {
  id: string;
  email: string;
  role: string;
}) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET belum dikonfigurasi");
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

export async function registerUser(data: RegisterData) {
  const existingUser = await pool.query(
    `
    SELECT id
    FROM users
    WHERE email = $1
    `,
    [data.email]
  );

  if (existingUser.rows.length > 0) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const result = await pool.query(
    `
    INSERT INTO users (
      email,
      password_hash,
      author_name,
      pen_name
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      email,
      role,
      author_name,
      pen_name,
      created_at,
      updated_at
    `,
    [
      data.email,
      passwordHash,
      data.authorName ?? null,
      data.penName ?? null,
    ]
  );

  const user = result.rows[0];

  const token = generateToken(user);

  return {
    user,
    token,
  };
}

export async function loginUser(
  email: string,
  password: string
) {
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
    WHERE email = $1
    `,
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const user = result.rows[0];

  const passwordValid = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = generateToken(user);

  const {
    password_hash: _passwordHash,
    ...safeUser
  } = user;

  return {
    user: safeUser,
    token,
  };
} 