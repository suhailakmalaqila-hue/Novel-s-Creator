import { apiRequest } from "./api";
import type { QuickNote } from "../types";

function mapQuickNote(data: any): QuickNote {
  return {
    id: String(data.id),
    title: data.title ?? "",
    content: data.content ?? "",
    category:
      data.note_category ??
      data.category ??
      "Lainnya",
    colorTag:
      data.color_tag ??
      data.colorTag ??
      "#D4AF37",
    isPinned: Boolean(
      data.is_pinned ?? data.isPinned
    ),
    bookId:
      data.book_id ??
      data.bookId ??
      undefined,
    createdAt: data.created_at
      ? new Date(data.created_at).getTime()
      : Date.now(),
    updatedAt: data.updated_at
      ? new Date(data.updated_at).getTime()
      : Date.now(),
  };
}

function unwrapResponse<T>(
  response: T | { data?: T }
): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    return (response as { data: T }).data as T;
  }

  return response as T;
}

export async function getQuickNotes(): Promise<QuickNote[]> {
  const response = await apiRequest<
    QuickNote[] | { data: any[] }
  >("/quick-notes");

  const data = unwrapResponse<any[]>(
    response
  );

  return Array.isArray(data)
    ? data.map(mapQuickNote)
    : [];
}

export async function createQuickNote(
  note: QuickNote
): Promise<QuickNote> {
  const response = await apiRequest<{
    data: any;
  }>("/quick-notes", {
    method: "POST",
    body: JSON.stringify({
      title: note.title,
      content: note.content,
      category: note.category,
      colorTag: note.colorTag,
      isPinned: note.isPinned,
      bookId:
        note.bookId ?? null,
    }),
  });

  return mapQuickNote(
    unwrapResponse<any>(response)
  );
}

export async function updateQuickNote(
  noteId: string,
  note: QuickNote
): Promise<QuickNote> {
  const response = await apiRequest<{
    data: any;
  }>(`/quick-notes/${noteId}`, {
    method: "PATCH",
    body: JSON.stringify({
      title: note.title,
      content: note.content,
      category: note.category,
      colorTag: note.colorTag,
      isPinned: note.isPinned,
      bookId:
        note.bookId ?? null,
    }),
  });

  return mapQuickNote(
    unwrapResponse<any>(response)
  );
}

export async function deleteQuickNote(
  noteId: string
): Promise<void> {
  await apiRequest(
    `/quick-notes/${noteId}`,
    { method: "DELETE" }
  );
}
