import pool from "../config/database";

export async function getAllGenres() {
  const result = await pool.query(
    `
    SELECT
      id,
      name,
      created_at
    FROM genres
    ORDER BY name ASC
    `
  );

  return result.rows;
}

export async function createGenre(name: string) {
  const result = await pool.query(
    `
    INSERT INTO genres (name)
    VALUES ($1)
    ON CONFLICT (name)
    DO UPDATE SET name = EXCLUDED.name
    RETURNING *
    `,
    [name]
  );

  return result.rows[0];
}

export async function addGenreToBook(
  bookId: string,
  genreId: string,
  userId: string
) {
  const bookResult = await pool.query(
    `
    SELECT id
    FROM books
    WHERE id = $1
      AND user_id = $2
    `,
    [bookId, userId]
  );

  if (bookResult.rows.length === 0) {
    return null;
  }

  const genreResult = await pool.query(
    `
    SELECT id
    FROM genres
    WHERE id = $1
    `,
    [genreId]
  );

  if (genreResult.rows.length === 0) {
    return null;
  }

  const result = await pool.query(
    `
    INSERT INTO book_genres (
      book_id,
      genre_id
    )
    VALUES ($1, $2)
    ON CONFLICT (book_id, genre_id)
    DO NOTHING
    RETURNING *
    `,
    [bookId, genreId]
  );

  return result.rows[0] ?? null;
}

export async function removeGenreFromBook(
  bookId: string,
  genreId: string,
  userId: string
) {
  const result = await pool.query(
    `
    DELETE FROM book_genres bg
    USING books b
    WHERE bg.book_id = b.id
      AND bg.book_id = $1
      AND bg.genre_id = $2
      AND b.user_id = $3
    RETURNING bg.*
    `,
    [bookId, genreId, userId]
  );

  return result.rows[0] ?? null;
}
