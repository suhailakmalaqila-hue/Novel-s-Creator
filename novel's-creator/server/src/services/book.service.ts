import pool from "../config/database";

export async function getBooksByUser(userId: string) {
  const result = await pool.query(
    `
    SELECT
      b.id,
      b.user_id,
      b.title,
      b.synopsis,
      b.cover_url,
      b.target_word_count,
      b.current_word_count,
      b.status,
      b.created_at,
      b.updated_at,

      COALESCE(
        json_agg(
          json_build_object(
            'id', g.id,
            'name', g.name
          )
        ) FILTER (WHERE g.id IS NOT NULL),
        '[]'
      ) AS genres

    FROM books b

    LEFT JOIN book_genres bg
      ON bg.book_id = b.id

    LEFT JOIN genres g
      ON g.id = bg.genre_id

    WHERE b.user_id = $1

    GROUP BY b.id

    ORDER BY b.updated_at DESC
    `,
    [userId]
  );

  return result.rows;
}

export async function getBookById(
  bookId: string,
  userId: string
) {
  const result = await pool.query(
    `
    SELECT
      b.id,
      b.user_id,
      b.title,
      b.synopsis,
      b.cover_url,
      b.target_word_count,
      b.current_word_count,
      b.status,
      b.created_at,
      b.updated_at,

      COALESCE(
        json_agg(
          json_build_object(
            'id', g.id,
            'name', g.name
          )
        ) FILTER (WHERE g.id IS NOT NULL),
        '[]'
      ) AS genres

    FROM books b

    LEFT JOIN book_genres bg
      ON bg.book_id = b.id

    LEFT JOIN genres g
      ON g.id = bg.genre_id

    WHERE b.id = $1
      AND b.user_id = $2

    GROUP BY b.id
    `,
    [bookId, userId]
  );

  return result.rows[0] ?? null;
}

export async function createBook(
  userId: string,
  data: {
    title: string;
    synopsis?: string;
    coverUrl?: string;
    targetWordCount?: number;
    status?: string;
  }
) {
  const result = await pool.query(
    `
    INSERT INTO books (
      user_id,
      title,
      synopsis,
      cover_url,
      target_word_count,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [
      userId,
      data.title,
      data.synopsis ?? null,
      data.coverUrl ?? null,
      data.targetWordCount ?? 0,
      data.status ?? "draft",
    ]
  );

  return result.rows[0];
}

export async function updateBook(
  bookId: string,
  userId: string,
  data: {
    title?: string;
    synopsis?: string;
    coverUrl?: string;
    targetWordCount?: number;
    currentWordCount?: number;
    status?: string;
  }
) {
  const result = await pool.query(
    `
    UPDATE books
    SET
      title = COALESCE($3, title),
      synopsis = COALESCE($4, synopsis),
      cover_url = COALESCE($5, cover_url),
      target_word_count = COALESCE($6, target_word_count),
      current_word_count = COALESCE($7, current_word_count),
      status = COALESCE($8::book_status, status),
      updated_at = CURRENT_TIMESTAMP

    WHERE id = $1
      AND user_id = $2

    RETURNING *
    `,
    [
      bookId,
      userId,
      data.title ?? null,
      data.synopsis ?? null,
      data.coverUrl ?? null,
      data.targetWordCount ?? null,
      data.currentWordCount ?? null,
      data.status ?? null,
    ]
  );

  return result.rows[0] ?? null;
}

export async function deleteBook(
  bookId: string,
  userId: string
) {
  const result = await pool.query(
    `
    DELETE FROM books
    WHERE id = $1
      AND user_id = $2
    RETURNING id
    `,
    [bookId, userId]
  );

  return result.rows[0] ?? null;
}
