import pool from "../config/database";

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