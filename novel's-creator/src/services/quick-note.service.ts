import { apiRequest } from "./api";
import type {
  QuickNote,
  NoteCategory,
  NoteScope,
} from "../types";

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

function inferNoteScope(data: any): NoteScope {
  if (data?.note_scope) {
    return data.note_scope;
  }

  if (data?.noteScope) {
    return data.noteScope;
  }

  if (data?.book_id || data?.bookId) {
    return "book";
  }

  if (data?.chapter_id || data?.chapterId) {
    return "chapter";
  }

  if (
    data?.character_id ||
    data?.characterId
  ) {
    return "character";
  }

  return "other";
}

/**
 * Convert response backend -> frontend QuickNote.
 */
function mapQuickNote(data: any): QuickNote {
  return {
    id: String(data.id),

    title: data.title ?? "",

    content: data.content ?? "",

    category:
      (data.note_category ??
        data.category ??
        "Lainnya") as NoteCategory,

    noteScope:
      inferNoteScope(data),

    bookId:
      data.book_id ??
      data.bookId ??
      undefined,

    chapterId:
      data.chapter_id ??
      data.chapterId ??
      undefined,

    characterId:
      data.character_id ??
      data.characterId ??
      undefined,

    colorTag:
      data.color_tag ??
      data.colorTag ??
      "#D4AF37",

    isPinned: Boolean(
      data.is_pinned ??
      data.isPinned
    ),

    createdAt: data.created_at
      ? new Date(
          data.created_at
        ).getTime()
      : Date.now(),

    updatedAt: data.updated_at
      ? new Date(
          data.updated_at
        ).getTime()
      : Date.now(),
  };
}

/**
 * Backend API kadang membungkus response
 * dengan { data: ... }.
 */
function unwrapResponse<T>(
  response: T | { data?: T }
): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    return (
      response as {
        data: T;
      }
    ).data as T;
  }

  return response as T;
}

/**
 * =========================================================
 * GET
 * =========================================================
 */

export async function getQuickNotes(): Promise<
  QuickNote[]
> {
  const response =
    await apiRequest<
      QuickNote[] | {
        data: any[];
      }
    >("/quick-notes");

  const data =
    unwrapResponse<any[]>(
      response
    );

  return Array.isArray(data)
    ? data.map(mapQuickNote)
    : [];
}

/**
 * =========================================================
 * CREATE
 * =========================================================
 */

export async function createQuickNote(
  note: QuickNote
): Promise<QuickNote> {
  const response =
    await apiRequest<{
      data: any;
    }>("/quick-notes", {
      method: "POST",

      body: JSON.stringify({
        title: note.title,

        content: note.content,

        category:
          note.category,

        colorTag:
          note.colorTag,

        isPinned:
          note.isPinned,

        /**
         * CONTEXT
         */
        noteScope:
          note.noteScope,

        bookId:
          note.bookId ??
          null,

        chapterId:
          note.chapterId ??
          null,

        characterId:
          note.characterId ??
          null,
      }),
    });

  return mapQuickNote(
    unwrapResponse<any>(
      response
    )
  );
}

/**
 * =========================================================
 * UPDATE
 * =========================================================
 */

export async function updateQuickNote(
  noteId: string,
  note: QuickNote
): Promise<QuickNote> {
  const response =
    await apiRequest<{
      data: any;
    }>(
      `/quick-notes/${noteId}`,
      {
        method: "PATCH",

        body: JSON.stringify({
          title:
            note.title,

          content:
            note.content,

          category:
            note.category,

          colorTag:
            note.colorTag,

          isPinned:
            note.isPinned,

          /**
           * CONTEXT
           */
          noteScope:
            note.noteScope,

          bookId:
            note.bookId ??
            null,

          chapterId:
            note.chapterId ??
            null,

          characterId:
            note.characterId ??
            null,
        }),
      }
    );

  return mapQuickNote(
    unwrapResponse<any>(
      response
    )
  );
}

/**
 * =========================================================
 * DELETE
 * =========================================================
 */

export async function deleteQuickNote(
  noteId: string
): Promise<void> {
  await apiRequest(
    `/quick-notes/${noteId}`,
    {
      method: "DELETE",
    }
  );
}
