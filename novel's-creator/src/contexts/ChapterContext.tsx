import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
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

  chaptersByBook: Record<string, Chapter[]>;

  loading: boolean;

  loadingByBook: Record<string, boolean>;

  loadedBooks: Record<string, boolean>;

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

  clearChapters: (
    bookId: string
  ) => void;

  clearAllChapters: () => void;

  snapshots: ChapterSnapshot[];

  snapshotsByChapter: Record<
    string,
    ChapterSnapshot[]
  >;

  snapshotsLoading: boolean;

  snapshotsLoadingByChapter: Record<
    string,
    boolean
  >;

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
  /**
   * Source of truth frontend:
   *
   * chaptersByBook[bookId]
   *
   * Setiap Book memiliki cache chapter sendiri.
   */
  const [
    chaptersByBook,
    setChaptersByBook,
  ] = useState<
    Record<string, Chapter[]>
  >({});

  /**
   * Loading state per Book.
   *
   * Jangan menggunakan satu boolean global
   * untuk seluruh Book karena Book A dan Book B
   * dapat dimuat secara independen.
   */
  const [
    loadingByBook,
    setLoadingByBook,
  ] = useState<
    Record<string, boolean>
  >({});

  /**
   * Menandai Book yang sudah berhasil dimuat.
   */
  const [
    loadedBooks,
    setLoadedBooks,
  ] = useState<
    Record<string, boolean>
  >({});

  /**
   * Request sequence per Book.
   *
   * Kalau request lama datang setelah request baru,
   * response lama tidak boleh menimpa data terbaru.
   */
  const chapterRequestSequence =
    useRef<Record<string, number>>({});

  /**
   * Snapshot disimpan per Chapter.
   *
   * Key:
   * `${bookId}:${chapterId}`
   */
  const [
    snapshotsByChapter,
    setSnapshotsByChapter,
  ] = useState<
    Record<string, ChapterSnapshot[]>
  >({});

  const [
    snapshotsLoadingByChapter,
    setSnapshotsLoadingByChapter,
  ] = useState<
    Record<string, boolean>
  >({});

  const snapshotRequestSequence =
    useRef<Record<string, number>>({});

  /**
   * Compatibility:
   *
   * Komponen lama masih dapat menggunakan `chapters`.
   *
   * Tetapi source of truth sebenarnya tetap:
   *
   * chaptersByBook
   */
  const chapters = useMemo(
    () =>
      Object.values(
        chaptersByBook
      ).flat(),
    [chaptersByBook]
  );

  const loading = useMemo(
    () =>
      Object.values(
        loadingByBook
      ).some(Boolean),
    [loadingByBook]
  );

  /**
   * Compatibility:
   *
   * snapshots lama masih tersedia.
   *
   * Nilainya berasal dari snapshot chapter
   * yang tersimpan di cache.
   */
  const snapshots = useMemo(
    () =>
      Object.values(
        snapshotsByChapter
      ).flat(),
    [snapshotsByChapter]
  );

  const snapshotsLoading = useMemo(
    () =>
      Object.values(
        snapshotsLoadingByChapter
      ).some(Boolean),
    [snapshotsLoadingByChapter]
  );

  /**
   * Ambil semua chapter untuk satu Book.
   */
  const refreshChapters = useCallback(
    async (bookId: string) => {
      if (!bookId) {
        return;
      }

      const nextSequence =
        (chapterRequestSequence.current[
          bookId
        ] ?? 0) + 1;

      chapterRequestSequence.current[
        bookId
      ] = nextSequence;

      setLoadingByBook(
        (current) => ({
          ...current,
          [bookId]: true,
        })
      );

      try {
        const data =
          await getChaptersRequest(
            bookId
          );

        /**
         * Abaikan response lama.
         */
        if (
          chapterRequestSequence.current[
            bookId
          ] !== nextSequence
        ) {
          return;
        }

        const sorted =
          [...data].sort(
            (a, b) => {
              if (
                a.order !== b.order
              ) {
                return (
                  a.order - b.order
                );
              }

              return (
                a.chapterNumber -
                b.chapterNumber
              );
            }
          );

        setChaptersByBook(
          (current) => ({
            ...current,
            [bookId]: sorted,
          })
        );

        setLoadedBooks(
          (current) => ({
            ...current,
            [bookId]: true,
          })
        );
      } catch (error) {
        console.error(
          `Gagal mengambil chapter untuk Book ${bookId}:`,
          error
        );

        /**
         * Jangan tandai loaded jika request gagal.
         * Dengan begitu App dapat mencoba lagi.
         */
        setLoadedBooks(
          (current) => {
            const next = {
              ...current,
            };

            delete next[bookId];

            return next;
          }
        );
      } finally {
        if (
          chapterRequestSequence.current[
            bookId
          ] === nextSequence
        ) {
          setLoadingByBook(
            (current) => ({
              ...current,
              [bookId]: false,
            })
          );
        }
      }
    },
    []
  );

  /**
   * Create Chapter.
   */
  const addChapter = useCallback(
    async (
      bookId: string,
      data: CreateChapterInput
    ) => {
      const chapter =
        await createChapterRequest(
          bookId,
          data
        );

      setChaptersByBook(
        (current) => {
          const existing =
            current[bookId] ?? [];

          const next = [
            ...existing.filter(
              (item) =>
                item.id !==
                chapter.id
            ),
            chapter,
          ].sort(
            (a, b) => {
              if (
                a.order !== b.order
              ) {
                return (
                  a.order - b.order
                );
              }

              return (
                a.chapterNumber -
                b.chapterNumber
              );
            }
          );

          return {
            ...current,
            [bookId]: next,
          };
        }
      );

      setLoadedBooks(
        (current) => ({
          ...current,
          [bookId]: true,
        })
      );

      return chapter;
    },
    []
  );

  /**
   * Update Chapter.
   */
  const editChapter = useCallback(
    async (
      bookId: string,
      chapterId: string,
      data: UpdateChapterInput
    ) => {
      const updated =
        await updateChapterRequest(
          bookId,
          chapterId,
          data
        );

      setChaptersByBook(
        (current) => {
          const existing =
            current[bookId] ?? [];

          const next =
            existing
              .map((chapter) =>
                chapter.id ===
                chapterId
                  ? updated
                  : chapter
              )
              .sort(
                (a, b) => {
                  if (
                    a.order !== b.order
                  ) {
                    return (
                      a.order -
                      b.order
                    );
                  }

                  return (
                    a.chapterNumber -
                    b.chapterNumber
                  );
                }
              );

          return {
            ...current,
            [bookId]: next,
          };
        }
      );

      return updated;
    },
    []
  );

  /**
   * Delete Chapter.
   */
  const removeChapter = useCallback(
    async (
      bookId: string,
      chapterId: string
    ) => {
      await deleteChapterRequest(
        bookId,
        chapterId
      );

      setChaptersByBook(
        (current) => {
          const existing =
            current[bookId] ?? [];

          return {
            ...current,
            [bookId]: existing.filter(
              (chapter) =>
                chapter.id !==
                chapterId
            ),
          };
        }
      );

      const snapshotKey =
        `${bookId}:${chapterId}`;

      setSnapshotsByChapter(
        (current) => {
          const next = {
            ...current,
          };

          delete next[snapshotKey];

          return next;
        }
      );

      setSnapshotsLoadingByChapter(
        (current) => {
          const next = {
            ...current,
          };

          delete next[snapshotKey];

          return next;
        }
      );
    },
    []
  );

  /**
   * Hapus cache hanya untuk satu Book.
   */
  const clearChapters = useCallback(
    (bookId: string) => {
      if (!bookId) {
        return;
      }

      setChaptersByBook(
        (current) => {
          const next = {
            ...current,
          };

          delete next[bookId];

          return next;
        }
      );

      setLoadingByBook(
        (current) => {
          const next = {
            ...current,
          };

          delete next[bookId];

          return next;
        }
      );

      setLoadedBooks(
        (current) => {
          const next = {
            ...current,
          };

          delete next[bookId];

          return next;
        }
      );

      /**
       * Hapus seluruh snapshot yang
       * berasal dari Book tersebut.
       */
      setSnapshotsByChapter(
        (current) => {
          const next: Record<
            string,
            ChapterSnapshot[]
          > = {};

          for (
            const [
              key,
              value,
            ] of Object.entries(
              current
            )
          ) {
            if (
              !key.startsWith(
                `${bookId}:`
              )
            ) {
              next[key] = value;
            }
          }

          return next;
        }
      );

      setSnapshotsLoadingByChapter(
        (current) => {
          const next = {
            ...current,
          };

          for (
            const key of Object.keys(
              next
            )
          ) {
            if (
              key.startsWith(
                `${bookId}:`
              )
            ) {
              delete next[key];
            }
          }

          return next;
        }
      );

      delete chapterRequestSequence
        .current[bookId];
    },
    []
  );

  /**
   * Hapus seluruh cache chapter.
   *
   * Berguna ketika logout / user berganti.
   */
  const clearAllChapters =
    useCallback(() => {
      setChaptersByBook({});
      setLoadingByBook({});
      setLoadedBooks({});
      setSnapshotsByChapter({});
      setSnapshotsLoadingByChapter({});
      chapterRequestSequence.current =
        {};
      snapshotRequestSequence.current =
        {};
    }, []);

  /**
   * Ambil snapshot untuk Chapter tertentu.
   */
  const refreshSnapshots =
    useCallback(
      async (
        bookId: string,
        chapterId: string
      ) => {
        if (
          !bookId ||
          !chapterId
        ) {
          return;
        }

        const key =
          `${bookId}:${chapterId}`;

        const nextSequence =
          (snapshotRequestSequence
            .current[key] ?? 0) + 1;

        snapshotRequestSequence.current[
          key
        ] = nextSequence;

        setSnapshotsLoadingByChapter(
          (current) => ({
            ...current,
            [key]: true,
          })
        );

        try {
          const data =
            await getSnapshotsRequest(
              bookId,
              chapterId
            );

          if (
            snapshotRequestSequence
              .current[key] !==
            nextSequence
          ) {
            return;
          }

          setSnapshotsByChapter(
            (current) => ({
              ...current,
              [key]: data,
            })
          );
        } catch (error) {
          console.error(
            `Gagal mengambil snapshot ${key}:`,
            error
          );

          if (
            snapshotRequestSequence
              .current[key] ===
            nextSequence
          ) {
            setSnapshotsByChapter(
              (current) => ({
                ...current,
                [key]: [],
              })
            );
          }
        } finally {
          if (
            snapshotRequestSequence
              .current[key] ===
            nextSequence
          ) {
            setSnapshotsLoadingByChapter(
              (current) => ({
                ...current,
                [key]: false,
              })
            );
          }
        }
      },
      []
    );

  /**
   * Create Snapshot.
   */
  const addSnapshot =
    useCallback(
      async (
        bookId: string,
        chapterId: string,
        data: CreateSnapshotInput
      ) => {
        const snapshot =
          await createSnapshotRequest(
            bookId,
            chapterId,
            data
          );

        const key =
          `${bookId}:${chapterId}`;

        setSnapshotsByChapter(
          (current) => ({
            ...current,
            [key]: [
              snapshot,
              ...(current[key] ??
                []),
            ],
          })
        );

        return snapshot;
      },
      []
    );

  const value =
    useMemo<ChapterContextValue>(
      () => ({
        chapters,

        chaptersByBook,

        loading,

        loadingByBook,

        loadedBooks,

        refreshChapters,

        addChapter,

        editChapter,

        removeChapter,

        clearChapters,

        clearAllChapters,

        snapshots,

        snapshotsByChapter,

        snapshotsLoading,

        snapshotsLoadingByChapter,

        refreshSnapshots,

        addSnapshot,
      }),
      [
        chapters,
        chaptersByBook,
        loading,
        loadingByBook,
        loadedBooks,
        refreshChapters,
        addChapter,
        editChapter,
        removeChapter,
        clearChapters,
        clearAllChapters,
        snapshots,
        snapshotsByChapter,
        snapshotsLoading,
        snapshotsLoadingByChapter,
        refreshSnapshots,
        addSnapshot,
      ]
    );

  return (
    <ChapterContext.Provider
      value={value}
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
