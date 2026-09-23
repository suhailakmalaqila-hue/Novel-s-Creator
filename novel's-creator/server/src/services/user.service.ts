import bcrypt from "bcrypt";
import pool from "../config/database";

type AdminUserData = {
  email: string;
  password?: string;
  authorName?: string;
  penName?: string;
  role?: "admin" | "user";
};

export async function getUserById(userId: string) {
  const result = await pool.query(
    `
    SELECT
      id,
      email,
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
    WHERE id = $1
    `,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function updateUser(
  userId: string,
  data: {
    authorName?: string;
    penName?: string;
    bio?: string;
    avatarUrl?: string;
    dailyWordGoal?: number;
    theme?: string;
    soundEffects?: boolean;
    preferredGenre?: string;
    tutorialCompleted?: boolean;
  }
) {
  const result = await pool.query(
    `
    UPDATE users
    SET
      author_name = COALESCE($2, author_name),
      pen_name = COALESCE($3, pen_name),
      bio = COALESCE($4, bio),
      avatar_url = COALESCE($5, avatar_url),
      daily_word_goal = COALESCE($6, daily_word_goal),
      theme = COALESCE($7, theme),
      sound_effects = COALESCE($8, sound_effects),
      preferred_genre = COALESCE($9, preferred_genre),
      tutorial_completed = COALESCE($10, tutorial_completed),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING
      id,
      email,
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
    `,
    [
      userId,
      data.authorName ?? null,
      data.penName ?? null,
      data.bio ?? null,
      data.avatarUrl ?? null,
      data.dailyWordGoal ?? null,
      data.theme ?? null,
      data.soundEffects ?? null,
      data.preferredGenre ?? null,
      data.tutorialCompleted ?? null,
    ]
  );

  return result.rows[0] ?? null;
}

export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const result = await pool.query(
    `
      SELECT password_hash
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error("USER_NOT_FOUND");
  }

  const passwordHash = result.rows[0].password_hash;

  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    passwordHash
  );

  if (!isCurrentPasswordValid) {
    throw new Error("INVALID_CURRENT_PASSWORD");
  }

  if (currentPassword === newPassword) {
    throw new Error("SAME_PASSWORD");
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 12);

  await pool.query(
    `
      UPDATE users
      SET
        password_hash = $1,
        updated_at = NOW()
      WHERE id = $2
    `,
    [newPasswordHash, userId]
  );
}

export async function getAllUsers() {
  const result = await pool.query(
    `
    SELECT
      id,
      email,
      role,
      author_name,
      pen_name,
      created_at,
      updated_at
    FROM users
    ORDER BY created_at DESC
    `
  );

  return result.rows;
}

export async function createUserByAdmin(
  data: AdminUserData
) {
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

  const passwordHash = await bcrypt.hash(
    data.password!,
    12
  );

  const result = await pool.query(
    `
    INSERT INTO users (
      email,
      password_hash,
      author_name,
      pen_name,
      role
    )
    VALUES ($1, $2, $3, $4, $5)
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
      data.role ?? "user",
    ]
  );

  return result.rows[0];
}

export async function updateUserByAdmin(
  userId: string,
  actorUserId: string,
  data: AdminUserData
) {
  const targetResult = await pool.query(
    `
    SELECT id, role
    FROM users
    WHERE id = $1
    `,
    [userId]
  );

  if (targetResult.rows.length === 0) {
    return null;
  }

  const targetUser = targetResult.rows[0];

  if (
    userId === actorUserId &&
    data.role === "user"
  ) {
    throw new Error("CANNOT_DEMOTE_SELF");
  }

  if (
    targetUser.role === "admin" &&
    data.role === "user"
  ) {
    const adminCountResult = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM users
      WHERE role = 'admin'
      `
    );

    const adminCount =
      adminCountResult.rows[0].count;

    if (adminCount <= 1) {
      throw new Error("CANNOT_REMOVE_LAST_ADMIN");
    }
  }

  // Email tidak boleh dipakai user lain
  if (data.email) {
    const existingUser = await pool.query(
      `
      SELECT id
      FROM users
      WHERE email = $1
      AND id <> $2
      `,
      [data.email, userId]
    );

    if (existingUser.rows.length > 0) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }
  }

  let passwordHash: string | null = null;

  if (data.password) {
    passwordHash = await bcrypt.hash(
      data.password,
      12
    );
  }

  const result = await pool.query(
    `
    UPDATE users
    SET
      email = COALESCE($2, email),
      password_hash = COALESCE($3, password_hash),
      author_name = COALESCE($4, author_name),
      pen_name = COALESCE($5, pen_name),
      role = COALESCE($6, role),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
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
      userId,
      data.email ?? null,
      passwordHash,
      data.authorName ?? null,
      data.penName ?? null,
      data.role ?? null,
    ]
  );

  return result.rows[0] ?? null;
}

export async function deleteUserByAdmin(
  userId: string,
  actorUserId: string
) {
  // 1. Ambil data target dulu
  const targetResult = await pool.query(
    `
    SELECT id, role
    FROM users
    WHERE id = $1
    `,
    [userId]
  );

  if (targetResult.rows.length === 0) {
    return false;
  }

  const targetUser = targetResult.rows[0];

  // 2. Cek apakah target adalah Admin dan merupakan Admin terakhir
  if (targetUser.role === "admin") {
    const adminCountResult = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM users
      WHERE role = 'admin'
      `
    );

    const adminCount = adminCountResult.rows[0].count;

    if (adminCount <= 1) {
      throw new Error("CANNOT_DELETE_LAST_ADMIN");
    }
  }

  // 3. Cek self-delete setelah memastikan bukan admin terakhir
  if (userId === actorUserId) {
    throw new Error("CANNOT_DELETE_SELF");
  }

  const result = await pool.query(
    `
    DELETE FROM users
    WHERE id = $1
    RETURNING id
    `,
    [userId]
  );

  return result.rows.length > 0;
}
