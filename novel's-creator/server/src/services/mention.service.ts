import pool from "../config/database";

async function verifyChapterOwnership(
  chapterId: string,
  bookId: string,
  userId: string
) {
  const result = await pool.query(
    `
    SELECT 1
    FROM chapters c
    JOIN books b
      ON b.id = c.book_id
    WHERE c.id = $1
      AND c.book_id = $2
      AND b.user_id = $3
    `,
    [chapterId, bookId, userId]
  );

  return result.rowCount === 1;
}

async function verifyCharacterOwnership(
  characterId: string,
  userId: string
) {
  const result = await pool.query(
    `
    SELECT 1
    FROM characters
    WHERE id = $1
      AND user_id = $2
    `,
    [characterId, userId]
  );

  return result.rowCount === 1;
}

async function verifyCharacterInBook(
  characterId: string,
  bookId: string
) {
  const result = await pool.query(
    `
    SELECT 1
    FROM book_characters
    WHERE character_id = $1
      AND book_id = $2
    `,
    [characterId, bookId]
  );

  return result.rowCount === 1;
}

export async function getMentions(
  bookId: string,
  chapterId: string,
  userId: string
) {
  const chapterOwned =
    await verifyChapterOwnership(
      chapterId,
      bookId,
      userId
    );

  if (!chapterOwned) {
    return null;
  }

  const result = await pool.query(
    `
    SELECT
      m.id,
      m.chapter_id,
      m.character_id,
      m.display_text,
      m.start_offset,
      m.end_offset,
      m.created_at,

      c.full_name AS character_name,
      c.alias AS character_alias

    FROM chapter_character_mentions m

    JOIN characters c
      ON c.id = m.character_id

    WHERE m.chapter_id = $1
      AND c.user_id = $2

    ORDER BY
      m.start_offset NULLS LAST,
      m.created_at ASC
    `,
    [chapterId, userId]
  );

  return result.rows;
}

export async function createMention(
  bookId: string,
  chapterId: string,
  userId: string,
  input: {
    characterId: string;
    displayText: string;
    startOffset?: number;
    endOffset?: number;
  }
) {
  const chapterOwned =
    await verifyChapterOwnership(
      chapterId,
      bookId,
      userId
    );

  if (!chapterOwned) {
    return null;
  }

  const characterOwned =
    await verifyCharacterOwnership(
      input.characterId,
      userId
    );

  if (!characterOwned) {
    throw new Error(
      "CHARACTER_NOT_OWNED"
    );
  }

  const characterInBook =
    await verifyCharacterInBook(
      input.characterId,
      bookId
    );

  if (!characterInBook) {
    throw new Error(
      "CHARACTER_NOT_IN_BOOK"
    );
  }

  const result = await pool.query(
    `
    INSERT INTO chapter_character_mentions (
      chapter_id,
      character_id,
      display_text,
      start_offset,
      end_offset
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [
      chapterId,
      input.characterId,
      input.displayText,
      input.startOffset ?? null,
      input.endOffset ?? null,
    ]
  );

  return result.rows[0];
}

export async function updateMention(
  bookId: string,
  chapterId: string,
  mentionId: string,
  userId: string,
  input: {
    characterId?: string;
    displayText?: string;
    startOffset?: number | null;
    endOffset?: number | null;
  }
) {
  const chapterOwned =
    await verifyChapterOwnership(
      chapterId,
      bookId,
      userId
    );

  if (!chapterOwned) {
    return null;
  }

  const existing = await pool.query(
    `
    SELECT
      m.id,
      m.character_id
    FROM chapter_character_mentions m
    WHERE m.id = $1
      AND m.chapter_id = $2
    `,
    [mentionId, chapterId]
  );

  if (existing.rowCount === 0) {
    return null;
  }

  const nextCharacterId =
    input.characterId ??
    existing.rows[0].character_id;

  const characterOwned =
    await verifyCharacterOwnership(
      nextCharacterId,
      userId
    );

  if (!characterOwned) {
    throw new Error(
      "CHARACTER_NOT_OWNED"
    );
  }

  const characterInBook =
    await verifyCharacterInBook(
      nextCharacterId,
      bookId
    );

  if (!characterInBook) {
    throw new Error(
      "CHARACTER_NOT_IN_BOOK"
    );
  }

  const result = await pool.query(
    `
    UPDATE chapter_character_mentions
    SET
      character_id = $1,
      display_text = COALESCE($2, display_text),
      start_offset = CASE
        WHEN $3::integer IS NULL
        THEN start_offset
        ELSE $3
      END,
      end_offset = CASE
        WHEN $4::integer IS NULL
        THEN end_offset
        ELSE $4
      END
    WHERE id = $5
      AND chapter_id = $6
    RETURNING *
    `,
    [
      nextCharacterId,
      input.displayText ?? null,
      input.startOffset ?? null,
      input.endOffset ?? null,
      mentionId,
      chapterId,
    ]
  );

  return result.rows[0];
}

export async function deleteMention(
  mentionId: string,
  userId: string
) {
  const result = await pool.query(
    `
    DELETE FROM chapter_character_mentions m
    USING chapters ch
    JOIN books b
      ON b.id = ch.book_id
    WHERE m.id = $1
      AND m.chapter_id = ch.id
      AND b.user_id = $2
    RETURNING m.id
    `,
    [mentionId, userId]
  );

  return result.rowCount === 1;
}
