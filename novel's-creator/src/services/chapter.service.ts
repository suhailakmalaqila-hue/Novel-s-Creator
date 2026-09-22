import { apiRequest } from "./api";

import type {
  Chapter,
  ChapterSnapshot,
} from "../types";

interface ChaptersResponse {
  success: boolean;
  data: any[];
}

interface ChapterResponse {
  success: boolean;
  data: any;
}

interface SnapshotsResponse {
  success: boolean;
  data: any[];
}

interface SnapshotResponse {
  success: boolean;
  data: any;
}

export interface CreateChapterInput {
  chapterNumber?: number;
  title: string;
  content?: string;
  status?: "draft" | "review" | "published";
  sortOrder?: number;
}

export interface UpdateChapterInput {
  chapterNumber?: number;
  title?: string;
  content?: string;
  wordCount?: number;
  characterCount?: number;
  status?: "draft" | "review" | "published";
  sortOrder?: number;
}

export interface CreateSnapshotInput {
  chapterTitle: string;
  content: string;
  wordCount?: number;
  reason?: string;
}

function mapChapter(
  chapter: any
): Chapter {
  return {
    id: chapter.id,
    bookId: chapter.book_id,
    chapterNumber:
      Number(chapter.chapter_number),
    title: chapter.title,
    content:
      chapter.content ?? "",
    wordCount:
      Number(chapter.word_count),
    characterCount:
      Number(chapter.character_count),
    status: chapter.status,
    order:
      Number(chapter.sort_order),
    lastSavedAt:
      chapter.last_saved_at
        ? new Date(
            chapter.last_saved_at
          ).getTime()
        : 0,
    createdAt:
      new Date(
        chapter.created_at
      ).getTime(),
  };
}

function mapSnapshot(
  snapshot: any
): ChapterSnapshot {
  return {
    id: snapshot.id,
    chapterId:
      snapshot.chapter_id,
    bookId:
      snapshot.book_id,
    chapterTitle:
      snapshot.chapter_title,
    content:
      snapshot.content,
    wordCount:
      Number(snapshot.word_count),
    timestamp:
      new Date(
        snapshot.created_at
      ).getTime(),
    reason:
      snapshot.reason ??
      undefined,
  };
}

export async function getChapters(
  bookId: string
): Promise<Chapter[]> {
  const response =
    await apiRequest<ChaptersResponse>(
      `/books/${bookId}/chapters`
    );

  return response.data.map(
    mapChapter
  );
}

export async function getChapter(
  bookId: string,
  chapterId: string
): Promise<Chapter> {
  const response =
    await apiRequest<ChapterResponse>(
      `/books/${bookId}/chapters/${chapterId}`
    );

  return mapChapter(
    response.data
  );
}

export async function createChapter(
  bookId: string,
  data: CreateChapterInput
): Promise<Chapter> {
  const response =
    await apiRequest<ChapterResponse>(
      `/books/${bookId}/chapters`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

  return mapChapter(
    response.data
  );
}

export async function updateChapter(
  bookId: string,
  chapterId: string,
  data: UpdateChapterInput
): Promise<Chapter> {
  const response =
    await apiRequest<ChapterResponse>(
      `/books/${bookId}/chapters/${chapterId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );

  return mapChapter(
    response.data
  );
}

export async function deleteChapter(
  bookId: string,
  chapterId: string
): Promise<void> {
  await apiRequest(
    `/books/${bookId}/chapters/${chapterId}`,
    {
      method: "DELETE",
    }
  );
}

export async function getSnapshots(
  bookId: string,
  chapterId: string
): Promise<ChapterSnapshot[]> {
  const response =
    await apiRequest<SnapshotsResponse>(
      `/books/${bookId}/chapters/${chapterId}/snapshots`
    );

  return response.data.map(
    mapSnapshot
  );
}

export async function createSnapshot(
  bookId: string,
  chapterId: string,
  data: CreateSnapshotInput
): Promise<ChapterSnapshot> {
  const response =
    await apiRequest<SnapshotResponse>(
      `/books/${bookId}/chapters/${chapterId}/snapshots`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

  return mapSnapshot(
    response.data
  );
}

export async function getSnapshot(
  bookId: string,
  chapterId: string,
  snapshotId: string
): Promise<ChapterSnapshot> {
  const response =
    await apiRequest<SnapshotResponse>(
      `/books/${bookId}/chapters/${chapterId}/snapshots/${snapshotId}`
    );

  return mapSnapshot(
    response.data
  );
}
