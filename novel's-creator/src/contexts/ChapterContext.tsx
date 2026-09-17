import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type {
  Chapter,
  ChapterSnapshot,
} from "../types";

import {
  getChapters as getChaptersRequest,
  createChapter as createChapterRequest,
  updateChapter as updateChapterRequest,
  deleteChapter as deleteChapterRequest,
  getSnapshots as getSnapshotsRequest,
  createSnapshot as createSnapshotRequest,
  type CreateChapterInput,
  type UpdateChapterInput,
  type CreateSnapshotInput,
} from "../services/chapter.service";

interface ChapterContextValue {
  chapters: Chapter[];
  loading: boolean;

  refreshChapters: (
    bookId: string
  ) => Promise<void>;

  addChapter: (
    bookId: string,
    data: CreateChapterInput
  ) => Promise<Chapter>;

  editChapter: (
    bookId: string,
    chapterId: string,
    data: UpdateChapterInput
  ) => Promise<Chapter>;

  removeChapter: (
    bookId: string,
    chapterId: string
  ) => Promise<void>;

  snapshots: ChapterSnapshot[];
  snapshotsLoading: boolean;

  refreshSnapshots: (
    bookId: string,
    chapterId: string
  ) => Promise<void>;

  addSnapshot: (
    bookId: string,
    chapterId: string,
    data: CreateSnapshotInput
  ) => Promise<ChapterSnapshot>;
}

const ChapterContext =
  createContext<
    ChapterContextValue | undefined
  >(undefined);

interface ChapterProviderProps {
  children: ReactNode;
}

export function ChapterProvider({
  children,
}: ChapterProviderProps) {
  const [chapters, setChapters] =
    useState<Chapter[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [snapshots, setSnapshots] =
    useState<ChapterSnapshot[]>([]);

  const [
    snapshotsLoading,
    setSnapshotsLoading,
  ] = useState(false);

  async function refreshChapters(
    bookId: string
  ) {
    setLoading(true);

    try {
      const data =
        await getChaptersRequest(
          bookId
        );

      setChapters(data);
    } catch (error) {
      console.error(
        "Gagal mengambil chapter:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function addChapter(
    bookId: string,
    data: CreateChapterInput
  ) {
    const chapter =
      await createChapterRequest(
        bookId,
        data
      );

    setChapters((current) =>
      [...current, chapter].sort(
        (a, b) =>
          a.order - b.order
      )
    );

    return chapter;
  }

  async function editChapter(
    bookId: string,
    chapterId: string,
    data: UpdateChapterInput
  ) {
    const updated =
      await updateChapterRequest(
        bookId,
        chapterId,
        data
      );

    setChapters((current) =>
      current.map((chapter) =>
        chapter.id === chapterId
          ? updated
          : chapter
      )
    );

    return updated;
  }

  async function removeChapter(
    bookId: string,
    chapterId: string
  ) {
    await deleteChapterRequest(
      bookId,
      chapterId
    );

    setChapters((current) =>
      current.filter(
        (chapter) =>
          chapter.id !== chapterId
      )
    );

    setSnapshots((current) =>
      current.filter(
        (snapshot) =>
          snapshot.chapterId !==
          chapterId
      )
    );
  }

  async function refreshSnapshots(
    bookId: string,
    chapterId: string
  ) {
    setSnapshotsLoading(true);

    try {
      const data =
        await getSnapshotsRequest(
          bookId,
          chapterId
        );

      setSnapshots(data);
    } catch (error) {
      console.error(
        "Gagal mengambil snapshot:",
        error
      );
      setSnapshots([]);
    } finally {
      setSnapshotsLoading(false);
    }
  }

  async function addSnapshot(
    bookId: string,
    chapterId: string,
    data: CreateSnapshotInput
  ) {
    const snapshot =
      await createSnapshotRequest(
        bookId,
        chapterId,
        data
      );

    setSnapshots((current) => [
      snapshot,
      ...current,
    ]);

    return snapshot;
  }

  return (
    <ChapterContext.Provider
      value={{
        chapters,
        loading,

        refreshChapters,
        addChapter,
        editChapter,
        removeChapter,

        snapshots,
        snapshotsLoading,

        refreshSnapshots,
        addSnapshot,
      }}
    >
      {children}
    </ChapterContext.Provider>
  );
}

export function useChapters() {
  const context =
    useContext(ChapterContext);

  if (!context) {
    throw new Error(
      "useChapters harus digunakan di dalam ChapterProvider"
    );
  }

  return context;
}
