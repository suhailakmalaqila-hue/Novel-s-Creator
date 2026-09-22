import pool from "../config/database";

type CreateChapterData = {
  chapterNumber?: number;
  title: string;
  content?: string;
  status?: "draft" | "review" | "published";
  sortOrder?: number;
};

type UpdateChapterData = {
  chapterNumber?: number;
  title?: string;
  content?: string;
  wordCount?: number;
  characterCount?: number;
  status?: "draft" | "review" | "published";
  sortOrder?: number;
};

type CreateSnapshotData = {
  chapterTitle: string;
  content: string;
  reason?: string;
};

function countWords(text: string): number {
  const normalized = text.trim();

  if (!normalized) {
    return 0;
  }

  return normalized.split(/\s+/).length;
}

function countCharacters(text: string): number {
  return text.length;
}

/**
 * Source of truth untuk progress Book.
 *
 * books.current_word_count tidak dihitung dari state frontend.
 *
 * Nilainya selalu disinkronkan dari:
 *
 * SUM(chapters.word_count)
 *
 * untuk Book tersebut.
 */
async function syncBookWordCount(
  bookId: string
): Promise<number> {
  const result = await pool.query(
    `
    UPDATE books
    SET
      current_word_count = COALESCE(
        (
          SELECT SUM(c.word_count)
          FROM chapters c
          WHERE c.book_id = books.id
        ),
        0
      ),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING current_word_count
    `,
    [bookId]
  );

  return Number(
    result.rows[0]?.current_word_count ?? 0
  );
}

async function verifyBookOwnership(
  bookId: string,
  userId: string
) {
  const result = await pool.query(
    `
    SELECT id
    FROM books
    WHERE id = $1
      AND user_id = $2
    `,
    [bookId, userId]
  );

  return result.rows.length > 0;
}

async function verifyChapterOwnership(
  chapterId: string,
  bookId: string,
  userId: string
) {
  const result = await pool.query(
    `
    SELECT c.id
    FROM chapters c
    INNER JOIN books b
      ON b.id = c.book_id
    WHERE c.id = $1
      AND c.book_id = $2
      AND b.user_id = $3
    `,
    [
      chapterId,
      bookId,
      userId,
    ]
  );

  return result.rows.length > 0;
}

export async function getChaptersByBook(
  bookId: string,
  userId: string
) {
  const result = await pool.query(
    `
    SELECT
      c.id,
      c.book_id,
      c.chapter_number,
      c.title,
      c.content,
      c.word_count,
      c.character_count,
      c.status,
      c.sort_order,
      c.last_saved_at,
      c.created_at,
      c.updated_at
    FROM chapters c
    INNER JOIN books b
      ON b.id = c.book_id
    WHERE c.book_id = $1
      AND b.user_id = $2
    ORDER BY
      c.sort_order ASC,
      c.chapter_number ASC,
      c.created_at ASC
    `,
    [bookId, userId]
  );

  return result.rows;
}

export async function getChapterById(
  bookId: string,
  chapterId: string,
  userId: string
) {
  const result = await pool.query(
    `
    SELECT
      c.id,
      c.book_id,
      c.chapter_number,
      c.title,
      c.content,
      c.word_count,
      c.character_count,
      c.status,
      c.sort_order,
      c.last_saved_at,
      c.created_at,
      c.updated_at
    FROM chapters c
    INNER JOIN books b
      ON b.id = c.book_id
    WHERE c.id = $1
      AND c.book_id = $2
      AND b.user_id = $3
    `,
    [
      chapterId,
      bookId,
      userId,
    ]
  );

  return result.rows[0] ?? null;
}

export async function createChapter(
  bookId: string,
  userId: string,
  data: CreateChapterData
) {
  const bookExists =
    await verifyBookOwnership(
      bookId,
      userId
    );

  if (!bookExists) {
    throw new Error(
      "BOOK_NOT_FOUND"
    );
  }

  const content =
    data.content ?? "";

  const wordCount =
    countWords(content);

  const characterCount =
    countCharacters(content);

  let chapterNumber =
    data.chapterNumber;

  if (
    !chapterNumber ||
    chapterNumber < 1
  ) {
    const nextNumberResult =
      await pool.query(
        `
        SELECT
          COALESCE(
            MAX(chapter_number),
            0
          ) + 1 AS next_number
        FROM chapters
        WHERE book_id = $1
        `,
        [bookId]
      );

    chapterNumber = Number(
      nextNumberResult.rows[0]
        .next_number
    );
  }

  let sortOrder =
    data.sortOrder;

  if (
    sortOrder === undefined
  ) {
    const nextOrderResult =
      await pool.query(
        `
        SELECT
          COALESCE(
            MAX(sort_order),
            0
          ) + 1 AS next_order
        FROM chapters
        WHERE book_id = $1
        `,
        [bookId]
      );

    sortOrder = Number(
      nextOrderResult.rows[0]
        .next_order
    );
  }

  try {
    const result =
      await pool.query(
        `
        INSERT INTO chapters (
          book_id,
          chapter_number,
          title,
          content,
          word_count,
          character_count,
          status,
          sort_order,
          last_saved_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7::chapter_status,
          $8,
          CURRENT_TIMESTAMP
        )
        RETURNING
          id,
          book_id,
          chapter_number,
          title,
          content,
          word_count,
          character_count,
          status,
          sort_order,
          last_saved_at,
          created_at,
          updated_at
        `,
        [
          bookId,
          chapterNumber,
          data.title.trim() ||
            `Bab ${chapterNumber}`,
          content,
          wordCount,
          characterCount,
          data.status ??
            "draft",
          sortOrder,
        ]
      );

    await syncBookWordCount(
      bookId
    );

    return result.rows[0];
  } catch (error: any) {
    if (
      error?.code === "23505"
    ) {
      throw new Error(
        "CHAPTER_NUMBER_EXISTS"
      );
    }

    throw error;
  }
}

export async function updateChapter(
  bookId: string,
  chapterId: string,
  userId: string,
  data: UpdateChapterData
) {
  const owned =
    await verifyChapterOwnership(
      chapterId,
      bookId,
      userId
    );

  if (!owned) {
    return null;
  }

  const content =
    data.content;

  /**
   * Word count selalu dihitung dari
   * content aktual.
   */
  const wordCount =
    content !== undefined
      ? countWords(content)
      : undefined;

  const characterCount =
    content !== undefined
      ? countCharacters(content)
      : undefined;

  try {
    const result =
      await pool.query(
        `
        UPDATE chapters
        SET
          chapter_number =
            COALESCE(
              $3,
              chapter_number
            ),

          title =
            COALESCE(
              $4,
              title
            ),

          content =
            COALESCE(
              $5,
              content
            ),

          word_count =
            COALESCE(
              $6,
              word_count
            ),

          character_count =
            COALESCE(
              $7,
              character_count
            ),

          status =
            COALESCE(
              $8::chapter_status,
              status
            ),

          sort_order =
            COALESCE(
              $9,
              sort_order
            ),

          last_saved_at =
            CURRENT_TIMESTAMP,

          updated_at =
            CURRENT_TIMESTAMP

        WHERE id = $1
          AND book_id = $2

        RETURNING
          id,
          book_id,
          chapter_number,
          title,
          content,
          word_count,
          character_count,
          status,
          sort_order,
          last_saved_at,
          created_at,
          updated_at
        `,
        [
          chapterId,
          bookId,
          data.chapterNumber ??
            null,
          data.title !== undefined
            ? data.title.trim()
            : null,
          content !== undefined
            ? content
            : null,
          wordCount ?? null,
          characterCount ??
            null,
          data.status ?? null,
          data.sortOrder ??
            null,
        ]
      );

    const updated =
      result.rows[0] ?? null;

    if (!updated) {
      return null;
    }

    await syncBookWordCount(
      bookId
    );

    return updated;
  } catch (error: any) {
    if (
      error?.code === "23505"
    ) {
      throw new Error(
        "CHAPTER_NUMBER_EXISTS"
      );
    }

    throw error;
  }
}

export async function deleteChapter(
  bookId: string,
  chapterId: string,
  userId: string
) {
  const owned =
    await verifyChapterOwnership(
      chapterId,
      bookId,
      userId
    );

  if (!owned) {
    return null;
  }

  const result =
    await pool.query(
      `
      DELETE FROM chapters
      WHERE id = $1
        AND book_id = $2
      RETURNING id
      `,
      [
        chapterId,
        bookId,
      ]
    );

  const deleted =
    result.rows[0] ?? null;

  if (!deleted) {
    return null;
  }

  await syncBookWordCount(
    bookId
  );

  return deleted;
}

export async function getSnapshots(
  bookId: string,
  chapterId: string,
  userId: string
) {
  const owned =
    await verifyChapterOwnership(
      chapterId,
      bookId,
      userId
    );

  if (!owned) {
    return null;
  }

  const result =
    await pool.query(
      `
      SELECT
        id,
        chapter_id,
        book_id,
        chapter_title,
        content,
        word_count,
        reason,
        created_at
      FROM chapter_snapshots
      WHERE chapter_id = $1
        AND book_id = $2
      ORDER BY created_at DESC
      `,
      [
        chapterId,
        bookId,
      ]
    );

  return result.rows;
}

export async function createSnapshot(
  bookId: string,
  chapterId: string,
  userId: string,
  data: CreateSnapshotData
) {
  const owned =
    await verifyChapterOwnership(
      chapterId,
      bookId,
      userId
    );

  if (!owned) {
    return null;
  }

  /**
   * Backend menjadi source of truth.
   *
   * Word count snapshot dihitung dari content,
   * bukan dari nilai yang dikirim frontend.
   */
  const wordCount =
    countWords(data.content);

  const result =
    await pool.query(
      `
      INSERT INTO chapter_snapshots (
        chapter_id,
        book_id,
        chapter_title,
        content,
        word_count,
        reason
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
      )
      RETURNING
        id,
        chapter_id,
        book_id,
        chapter_title,
        content,
        word_count,
        reason,
        created_at
      `,
      [
        chapterId,
        bookId,
        data.chapterTitle.trim(),
        data.content,
        wordCount,
        data.reason ??
          null,
      ]
    );

  return result.rows[0];
}

export async function getSnapshotById(
  bookId: string,
  chapterId: string,
  snapshotId: string,
  userId: string
) {
  const owned =
    await verifyChapterOwnership(
      chapterId,
      bookId,
      userId
    );

  if (!owned) {
    return null;
  }

  const result =
    await pool.query(
      `
      SELECT
        id,
        chapter_id,
        book_id,
        chapter_title,
        content,
        word_count,
        reason,
        created_at
      FROM chapter_snapshots
      WHERE id = $1
        AND chapter_id = $2
        AND book_id = $3
      `,
      [
        snapshotId,
        chapterId,
        bookId,
      ]
    );

  return result.rows[0] ?? null;
}
