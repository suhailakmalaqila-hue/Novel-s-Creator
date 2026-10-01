import pool from "../config/database";

const NOTE_CATEGORIES = [
  "Ide Spontan",
  "Dialog Draft",
  "Plot Hole",
  "Worldbuilding",
  "Lainnya",
] as const;

const NOTE_SCOPES = ["book", "chapter", "character", "other"] as const;

type NoteCategory = (typeof NOTE_CATEGORIES)[number];
type NoteScope = (typeof NOTE_SCOPES)[number];

type QuickNoteInput = {
  title?: unknown;
  content?: unknown;
  category?: unknown;
  colorTag?: unknown;
  isPinned?: unknown;
  noteScope?: unknown;
  bookId?: unknown;
  chapterId?: unknown;
  characterId?: unknown;
};

function normalizeCategory(value: unknown): NoteCategory {
  return NOTE_CATEGORIES.includes(value as NoteCategory)
    ? (value as NoteCategory)
    : "Lainnya";
}

function normalizeScope(value: unknown): NoteScope | null {
  if (
    typeof value !== "string" ||
    !NOTE_SCOPES.includes(value as NoteScope)
  ) {
    return null;
  }

  return value as NoteScope;
}

function normalizeOptionalUuid(value: unknown): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error("INVALID_REFERENCE_ID");
  }

  return value;
}

function normalizeTitle(value: unknown): string {
  const title = String(value ?? "").trim();
  return title || "Catatan Kilat";
}

function normalizeContent(value: unknown): string {
  return String(value ?? "");
}

function normalizeColorTag(value: unknown): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const color = String(value).trim();
  return color || null;
}

function normalizePinned(value: unknown): boolean {
  return Boolean(value);
}

async function resolveScopeAndValidateReferences(
  userId: string,
  input: QuickNoteInput
): Promise<{
  noteScope: NoteScope;
  bookId: string | null;
  chapterId: string | null;
  characterId: string | null;
}> {
  const bookId = normalizeOptionalUuid(input.bookId);
  const chapterId = normalizeOptionalUuid(input.chapterId);
  const characterId = normalizeOptionalUuid(input.characterId);
  const explicitScope = normalizeScope(input.noteScope);

  const referenceCount =
    Number(Boolean(bookId)) +
    Number(Boolean(chapterId)) +
    Number(Boolean(characterId));

  if (referenceCount > 1) {
    throw new Error("MULTIPLE_NOTE_REFERENCES");
  }

  let inferredScope: NoteScope = "other";

  if (bookId) {
    inferredScope = "book";
  } else if (chapterId) {
    inferredScope = "chapter";
  } else if (characterId) {
    inferredScope = "character";
  }

  if (explicitScope && explicitScope !== inferredScope) {
    throw new Error("INVALID_NOTE_SCOPE");
  }

  if (bookId) {
    const result = await pool.query(
      `
      SELECT id
      FROM books
      WHERE id = $1
        AND user_id = $2
      `,
      [bookId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error("BOOK_NOT_OWNED");
    }
  }

  if (chapterId) {
    const result = await pool.query(
      `
      SELECT c.id
      FROM chapters c
      INNER JOIN books b
        ON b.id = c.book_id
      WHERE c.id = $1
        AND b.user_id = $2
      `,
      [chapterId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error("CHAPTER_NOT_OWNED");
    }
  }

  if (characterId) {
    const result = await pool.query(
      `
      SELECT id
      FROM characters
      WHERE id = $1
        AND user_id = $2
      `,
      [characterId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error("CHARACTER_NOT_OWNED");
    }
  }

  return {
    noteScope: inferredScope,
    bookId,
    chapterId,
    characterId,
  };
}

export async function getQuickNotes(userId: string) {
  const result = await pool.query(
    `
    SELECT
      id,
      user_id,
      note_scope,
      note_category,
      book_id,
      chapter_id,
      character_id,
      title,
      content,
      color_tag,
      is_pinned,
      created_at,
      updated_at
    FROM quick_notes
    WHERE user_id = $1
    ORDER BY
      is_pinned DESC,
      updated_at DESC,
      created_at DESC
    `,
    [userId]
  );

  return result.rows;
}

export async function createQuickNote(userId: string, input: QuickNoteInput) {
  const references = await resolveScopeAndValidateReferences(userId, input);

  const result = await pool.query(
    `
    INSERT INTO quick_notes (
      user_id,
      note_scope,
      note_category,
      book_id,
      chapter_id,
      character_id,
      title,
      content,
      color_tag,
      is_pinned
    )
    VALUES (
      $1,
      $2::note_scope,
      $3::note_category,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10
    )
    RETURNING
      id,
      user_id,
      note_scope,
      note_category,
      book_id,
      chapter_id,
      character_id,
      title,
      content,
      color_tag,
      is_pinned,
      created_at,
      updated_at
    `,
    [
      userId,
      references.noteScope,
      normalizeCategory(input.category),
      references.bookId,
      references.chapterId,
      references.characterId,
      normalizeTitle(input.title),
      normalizeContent(input.content),
      normalizeColorTag(input.colorTag),
      normalizePinned(input.isPinned),
    ]
  );

  return result.rows[0];
}

export async function updateQuickNote(
  userId: string,
  noteId: string,
  input: QuickNoteInput
) {
  const current = await pool.query(
    `
    SELECT
      id,
      note_scope,
      book_id,
      chapter_id,
      character_id,
      note_category,
      title,
      content,
      color_tag,
      is_pinned
    FROM quick_notes
    WHERE id = $1
      AND user_id = $2
    `,
    [noteId, userId]
  );

  if (current.rows.length === 0) {
    return null;
  }

  const currentNote = current.rows[0];

  const references = await resolveScopeAndValidateReferences(userId, {
    ...input,
    bookId:
      input.bookId !== undefined ? input.bookId : currentNote.book_id,
    chapterId:
      input.chapterId !== undefined ? input.chapterId : currentNote.chapter_id,
    characterId:
      input.characterId !== undefined
        ? input.characterId
        : currentNote.character_id,
    noteScope:
      input.noteScope !== undefined ? input.noteScope : currentNote.note_scope,
  });

  const title =
    input.title !== undefined
      ? normalizeTitle(input.title)
      : currentNote.title;

  const content =
    input.content !== undefined
      ? normalizeContent(input.content)
      : currentNote.content;

  const category =
    input.category !== undefined
      ? normalizeCategory(input.category)
      : currentNote.note_category;

  const colorTag =
    input.colorTag !== undefined
      ? normalizeColorTag(input.colorTag)
      : currentNote.color_tag;

  const isPinned =
    input.isPinned !== undefined
      ? normalizePinned(input.isPinned)
      : currentNote.is_pinned;

  const result = await pool.query(
    `
    UPDATE quick_notes
    SET
      note_scope = $1::note_scope,
      note_category = $2::note_category,
      book_id = $3,
      chapter_id = $4,
      character_id = $5,
      title = $6,
      content = $7,
      color_tag = $8,
      is_pinned = $9,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $10
      AND user_id = $11
    RETURNING
      id,
      user_id,
      note_scope,
      note_category,
      book_id,
      chapter_id,
      character_id,
      title,
      content,
      color_tag,
      is_pinned,
      created_at,
      updated_at
    `,
    [
      references.noteScope,
      category,
      references.bookId,
      references.chapterId,
      references.characterId,
      title,
      content,
      colorTag,
      isPinned,
      noteId,
      userId,
    ]
  );

  return result.rows[0] ?? null;
}

export async function deleteQuickNote(userId: string, noteId: string) {
  const result = await pool.query(
    `
    DELETE FROM quick_notes
    WHERE id = $1
      AND user_id = $2
    RETURNING id
    `,
    [noteId, userId]
  );

  return result.rows[0] ?? null;
}
