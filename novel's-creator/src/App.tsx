import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AppView,
  Book,
  Chapter,
  CharacterWiki,
  QuickNote,
} from "./types";

import {
  AuthProvider,
  useAuth,
} from "./contexts/AuthContext";

import {
  BookProvider,
  useBooks,
} from "./contexts/BookContext";

import {
  ChapterProvider,
  useChapters,
} from "./contexts/ChapterContext";

import {
  CharacterProvider,
  useCharacters,
} from "./contexts/CharacterContext";

import {
  getQuickNotes,
  saveQuickNote,
  deleteQuickNote,
  getCustomGenres,
  saveCustomGenre,
  purgeTutorialDummyData,
} from "./lib/storage";

import {
  TUTORIAL_DUMMY_BOOKS,
  TUTORIAL_DUMMY_CHAPTERS,
  TUTORIAL_DUMMY_CHARACTERS,
  TUTORIAL_DUMMY_QUICK_NOTES,
  TUTORIAL_DUMMY_BOOK_ID,
  TUTORIAL_DUMMY_CHAPTER_1_ID,
} from "./lib/tutorialDummyData";

import {
  SplashScreen,
} from "./components/splash/SplashScreen";

import {
  UnifiedAuthCard,
} from "./components/auth/UnifiedAuthCard";

import {
  VisualNovelTutorial,
} from "./components/tutorial/VisualNovelTutorial";

import {
  ProfileSettingsModal,
} from "./components/profile/ProfileSettingsModal";

import {
  Navbar,
} from "./components/common/Navbar";

import {
  WorkspaceView,
} from "./components/workspace/WorkspaceView";

import {
  CharacterWikiView,
} from "./components/character/CharacterWikiView";

import {
  NovelEditorView,
} from "./components/editor/NovelEditorView";

import {
  QuickNotesDrawer,
} from "./components/notes/QuickNotesDrawer";

import {
  GlobalSearchModal,
} from "./components/search/GlobalSearchModal";

function MainAppContent() {
  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  const {
    books: contextBooks,
    addBook,
    editBook,
    removeBook,
    refreshBooks,
  } = useBooks();

  const {
    chapters,
    chaptersByBook,
    loadingByBook,
    loadedBooks,
    refreshChapters,
    addChapter,
    editChapter,
    removeChapter,
    clearChapters,
    clearAllChapters,
  } = useChapters();

  const {
    characters,
    refreshCharacters,
    addCharacter,
    editCharacter,
    removeCharacter,
  } = useCharacters();

  const [
    appStage,
    setAppStage,
  ] = useState<
    "splash" | "auth" | "app"
  >("splash");

  const [
    currentView,
    setCurrentView,
  ] = useState<AppView>(
    "workspace"
  );

  const [
    quickNotes,
    setQuickNotes,
  ] = useState<QuickNote[]>(
    []
  );

  const [
    customGenres,
    setCustomGenres,
  ] = useState<string[]>(
    []
  );

  const [
    targetBookId,
    setTargetBookId,
  ] = useState<string | null>(
    null
  );

  const [
    targetChapterId,
    setTargetChapterId,
  ] = useState<string | null>(
    null
  );

  const [
    isTutorialOpen,
    setIsTutorialOpen,
  ] = useState(false);

  const [
    isProfileSettingsOpen,
    setIsProfileSettingsOpen,
  ] = useState(false);

  const [
    isSearchOpen,
    setIsSearchOpen,
  ] = useState(false);

  const [
    isQuickNotesOpen,
    setIsQuickNotesOpen,
  ] = useState(false);

  /**
   * Normalisasi data Book dari API.
   *
   * currentWordCount HARUS berasal dari:
   *
   * books.current_word_count
   *
   * yang sudah disinkronkan oleh backend
   * berdasarkan SUM(chapters.word_count).
   */
  const books: Book[] =
    useMemo(
      () =>
        (contextBooks || []).map(
          (b: any) => ({
            ...b,

            targetWordCount:
              Number(
                b.targetWordCount ??
                  b.target_word_count ??
                  50000
              ),

            currentWordCount:
              Number(
                b.currentWordCount ??
                  b.current_word_count ??
                  0
              ),

            genres:
              b.genres ||
              (b.genre
                ? [b.genre]
                : []),

            chapters:
              b.chapters || [],
          })
        ),
      [contextBooks]
    );

  const refreshLocalData =
    useCallback(() => {
      setQuickNotes(
        getQuickNotes()
      );

      setCustomGenres(
        getCustomGenres()
      );
    }, []);

  /**
   * Load character data.
   */
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void refreshCharacters();
  }, [
    isAuthenticated,
    refreshCharacters,
  ]);

  /**
   * =========================================================
   * LOAD SEMUA CHAPTER SEMUA BOOK
   * =========================================================
   *
   * Sebelumnya hanya Book aktif/pertama yang dimuat.
   *
   * Akibatnya:
   *
   * Workspace baru masuk:
   *   chapters = []
   *   total bab = 0
   *
   * Setelah user membuka Book:
   *   refreshChapters(bookId)
   *   chapters menjadi terisi
   *
   * Sekarang semua Book yang sudah ada
   * dimuat paralel setelah daftar Book tersedia.
   *
   * Ini membuat total bab di Workspace
   * langsung berasal dari seluruh Book.
   */
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (
      contextBooks.length === 0
    ) {
      return;
    }

    const booksToLoad =
      contextBooks.filter(
        (book) =>
          !loadedBooks[book.id] &&
          !loadingByBook[book.id]
      );

    if (
      booksToLoad.length === 0
    ) {
      return;
    }

    void Promise.all(
      booksToLoad.map(
        (book) =>
          refreshChapters(
            book.id
          )
      )
    );
  }, [
    isAuthenticated,
    contextBooks,
    loadedBooks,
    loadingByBook,
    refreshChapters,
  ]);

  /**
   * Setelah login.
   */
  const handleAuthSuccess =
    useCallback(() => {
      setAppStage("app");

      void refreshBooks();
    }, [refreshBooks]);

  /**
   * Splash selesai.
   */
  const handleSplashFinish =
    useCallback(() => {
      if (isAuthenticated) {
        setAppStage("app");
      } else {
        setAppStage("auth");
      }
    }, [isAuthenticated]);

  /**
   * Tutorial close.
   */
  const handleCloseTutorial =
    useCallback(() => {
      setIsTutorialOpen(false);

      purgeTutorialDummyData();

      if (
        targetBookId &&
        (
          targetBookId.startsWith(
            "tut-dummy"
          ) ||
          targetBookId ===
            TUTORIAL_DUMMY_BOOK_ID
        )
      ) {
        setTargetBookId(null);
      }

      if (
        targetChapterId &&
        (
          targetChapterId.startsWith(
            "tut-dummy"
          ) ||
          targetChapterId ===
            TUTORIAL_DUMMY_CHAPTER_1_ID
        )
      ) {
        setTargetChapterId(null);
      }

      refreshLocalData();
    }, [
      targetBookId,
      targetChapterId,
      refreshLocalData,
    ]);

  const handleTutorialComplete =
    useCallback(() => {
      handleCloseTutorial();
    }, [
      handleCloseTutorial,
    ]);

  /**
   * Logout.
   */
  const handleLogout =
    useCallback(() => {
      logout();

      clearAllChapters();

      setTargetBookId(null);
      setTargetChapterId(null);

      setAppStage("auth");
    }, [
      logout,
      clearAllChapters,
    ]);

  /**
   * Keyboard shortcuts.
   */
  useEffect(() => {
    const handleKeyDown = (
      e: KeyboardEvent
    ) => {
      if (
        (e.ctrlKey ||
          e.metaKey) &&
        e.key.toLowerCase() ===
          "k"
      ) {
        e.preventDefault();

        setIsSearchOpen(
          (prev) => !prev
        );
      }

      if (
        (e.ctrlKey ||
          e.metaKey) &&
        e.key.toLowerCase() ===
          "m"
      ) {
        e.preventDefault();

        setIsQuickNotesOpen(
          (prev) => !prev
        );
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  /**
   * Save Book.
   */
  const handleSaveBook =
    useCallback(
      async (book: Book) => {
        const targetWords =
          Number(
            book.targetWordCount ??
              (book as any)
                .target_word_count ??
              50000
          );

        /**
         * Book baru harus TIDAK memiliki ID.
         *
         * BookModal yang sudah diperbaiki
         * sekarang tidak boleh membuat fake ID.
         */
        if (!book.id) {
          await addBook({
            title: book.title,
            synopsis:
              book.synopsis,
            targetWordCount:
              targetWords,
            status:
              book.status ||
              "draft",
          });

          return;
        }

        await editBook(
          book.id,
          {
            title: book.title,
            synopsis:
              book.synopsis,
            targetWordCount:
              targetWords,
            status:
              book.status,
          }
        );
      },
      [
        editBook,
        addBook,
      ]
    );

  /**
   * Delete Book.
   */
  const handleDeleteBook =
    useCallback(
      async (bookId: string) => {
        if (!bookId) {
          return;
        }

        try {
          await removeBook(
            bookId
          );

          /**
           * Hapus cache chapter
           * hanya milik Book tersebut.
           */
          clearChapters(
            bookId
          );

          if (
            targetBookId ===
            bookId
          ) {
            setTargetBookId(null);
            setTargetChapterId(
              null
            );
          }
        } catch (error) {
          console.error(
            "Gagal menghapus book:",
            error
          );

          throw error;
        }
      },
      [
        removeBook,
        clearChapters,
        targetBookId,
      ]
    );

  /**
   * =========================================================
   * SAVE CHAPTER
   * =========================================================
   *
   * Setelah backend menyimpan chapter:
   *
   * Chapter:
   *   word_count = hasil countWords(content)
   *
   * lalu backend:
   *   books.current_word_count =
   *   SUM(chapters.word_count)
   *
   * Setelah itu frontend:
   *   refreshBooks()
   *
   * Jadi progress berasal dari PostgreSQL.
   */
  const handleSaveChapter =
    useCallback(
      async (
        chapter: Chapter
      ) => {
        if (!chapter.bookId) {
          return;
        }

        const bookId =
          chapter.bookId;

        try {
          const isNewChapter =
            !chapter.id ||
            chapter.id.startsWith(
              "chap_"
            ) ||
            chapter.id.startsWith(
              "tut-dummy"
            );

          if (
            isNewChapter
          ) {
            await addChapter(
              bookId,
              {
                chapterNumber:
                  chapter.chapterNumber,

                title:
                  chapter.title,

                content:
                  chapter.content,

                status:
                  chapter.status,

                sortOrder:
                  chapter.order,
              }
            );
          } else {
            await editChapter(
              bookId,
              chapter.id,
              {
                chapterNumber:
                  chapter.chapterNumber,

                title:
                  chapter.title,

                content:
                  chapter.content,

                status:
                  chapter.status,

                sortOrder:
                  chapter.order,
              }
            );
          }

          /**
           * Backend sekarang sudah memperbarui:
           *
           * books.current_word_count
           *
           * berdasarkan SUM(chapters.word_count).
           *
           * Ambil ulang Book dari PostgreSQL
           * agar Workspace menggunakan nilai
           * source of truth terbaru.
           */
          await refreshBooks();

          /**
           * Refresh chapter Book tersebut
           * supaya cache chapter juga sama
           * dengan DB.
           */
          await refreshChapters(
            bookId
          );
        } catch (error) {
          console.error(
            "Gagal menyimpan chapter:",
            error
          );

          throw error;
        }
      },
      [
        addChapter,
        editChapter,
        refreshBooks,
        refreshChapters,
      ]
    );

  /**
   * Delete Chapter.
   */
  const handleDeleteChapter =
    useCallback(
      async (
        chapterId: string
      ) => {
        if (
          !targetBookId ||
          !chapterId
        ) {
          return;
        }

        const bookChapters =
          chaptersByBook[
            targetBookId
          ] ?? [];

        const chapter =
          bookChapters.find(
            (item) =>
              item.id ===
              chapterId
          );

        if (!chapter) {
          return;
        }

        try {
          await removeChapter(
            targetBookId,
            chapterId
          );

          /**
           * Backend sudah menghitung ulang
           * books.current_word_count setelah
           * chapter dihapus.
           */
          await refreshBooks();

          /**
           * Pastikan cache Book tetap
           * sinkron dengan DB.
           */
          await refreshChapters(
            targetBookId
          );

          if (
            targetChapterId ===
            chapterId
          ) {
            setTargetChapterId(
              null
            );
          }
        } catch (error) {
          console.error(
            "Gagal menghapus chapter:",
            error
          );

          throw error;
        }
      },
      [
        targetBookId,
        targetChapterId,
        chaptersByBook,
        removeChapter,
        refreshBooks,
        refreshChapters,
      ]
    );

  /**
   * Save Character.
   */
  const handleSaveCharacter =
    useCallback(
      async (
        character: CharacterWiki
      ) => {
        try {
          const payload = {
            fullName:
              character.fullName,

            alias:
              character.alias,

            age:
              character.age,

            gender:
              character.gender,

            roleTag:
              character.roleTag,

            status:
              character.status,

            avatarUrl:
              character.avatarUrl,

            physicalAppearance:
              character.physicalAppearance,

            personalityTraits:
              character.personalityTraits,

            backstory:
              character.backstory,

            motivation:
              character.motivation,

            worldGoal:
              character.worldGoal,

            bookIds:
              character.bookIds,
          };

          if (
            character.id
          ) {
            await editCharacter(
              character.id,
              payload
            );
          } else {
            await addCharacter(
              payload
            );
          }
        } catch (error) {
          console.error(
            "Gagal menyimpan character:",
            error
          );

          throw error;
        }
      },
      [
        editCharacter,
        addCharacter,
      ]
    );

  /**
   * Delete Character.
   */
  const handleDeleteCharacter =
    useCallback(
      async (
        characterId: string
      ) => {
        try {
          await removeCharacter(
            characterId
          );
        } catch (error) {
          console.error(
            "Gagal menghapus character:",
            error
          );

          throw error;
        }
      },
      [removeCharacter]
    );

  /**
   * Save Quick Note.
   */
  const handleSaveQuickNote =
    useCallback(
      (note: QuickNote) => {
        saveQuickNote(note);

        setQuickNotes(
          getQuickNotes()
        );
      },
      []
    );

  /**
   * Delete Quick Note.
   */
  const handleDeleteQuickNote =
    useCallback(
      (noteId: string) => {
        deleteQuickNote(
          noteId
        );

        setQuickNotes(
          getQuickNotes()
        );
      },
      []
    );

  /**
   * Add custom genre.
   */
  const handleAddCustomGenre =
    useCallback(
      (genre: string) => {
        saveCustomGenre(
          genre
        );

        setCustomGenres(
          getCustomGenres()
        );
      },
      []
    );

  /**
   * Open Editor.
   */
  const handleOpenEditor =
    useCallback(
      (
        bookId: string,
        chapterId?: string
      ) => {
        const bookExists =
          books.some(
            (book) =>
              book.id ===
              bookId
          );

        const dummyBookExists =
          isTutorialOpen &&
          displayTutorialBookIds().has(
            bookId
          );

        if (
          !bookExists &&
          !dummyBookExists
        ) {
          return;
        }

        setTargetBookId(
          bookId
        );

        setTargetChapterId(
          chapterId ?? null
        );

        setCurrentView(
          "editor"
        );
      },
      [
        books,
        isTutorialOpen,
      ]
    );

  const isDummyActive =
    isTutorialOpen;

  const displayBooks =
    isDummyActive &&
    books.length === 0
      ? TUTORIAL_DUMMY_BOOKS
      : books;

  const displayChapters =
    isDummyActive &&
    chapters.length === 0
      ? TUTORIAL_DUMMY_CHAPTERS
      : chapters;

  const displayCharacters =
    isDummyActive &&
    characters.length === 0
      ? TUTORIAL_DUMMY_CHARACTERS
      : characters;

  const displayQuickNotes =
    isDummyActive &&
    quickNotes.length === 0
      ? TUTORIAL_DUMMY_QUICK_NOTES
      : quickNotes;

  function displayTutorialBookIds(): Set<string> {
    return new Set(
      TUTORIAL_DUMMY_BOOKS.map(
        (book) =>
          book.id
      )
    );
  }

  /**
   * Active Editor Book.
   */
  const activeEditorBookId =
    useMemo(() => {
      if (
        targetBookId &&
        displayBooks.some(
          (book) =>
            book.id ===
            targetBookId
        )
      ) {
        return targetBookId;
      }

      if (
        isDummyActive &&
        displayBooks.length >
          0
      ) {
        return displayBooks[0]
          .id;
      }

      return (
        displayBooks[0]?.id ??
        null
      );
    }, [
      targetBookId,
      displayBooks,
      isDummyActive,
    ]);

  /**
   * Active Editor Chapter.
   */
  const activeEditorChapterId =
    useMemo(() => {
      if (
        !activeEditorBookId
      ) {
        return null;
      }

      const isDummyBook =
        isDummyActive &&
        TUTORIAL_DUMMY_BOOKS.some(
          (book) =>
            book.id ===
            activeEditorBookId
        );

      const availableChapters =
        isDummyBook
          ? displayChapters.filter(
              (chapter) =>
                chapter.bookId ===
                activeEditorBookId
            )
          : (
              chaptersByBook[
                activeEditorBookId
              ] ?? []
            );

      if (
        targetChapterId &&
        availableChapters.some(
          (chapter) =>
            chapter.id ===
            targetChapterId
        )
      ) {
        return targetChapterId;
      }

      return (
        availableChapters[0]
          ?.id ?? null
      );
    }, [
      activeEditorBookId,
      targetChapterId,
      chaptersByBook,
      displayChapters,
      isDummyActive,
    ]);

  /**
   * Bersihkan target Book jika Book
   * sudah tidak tersedia.
   */
  useEffect(() => {
    if (!targetBookId) {
      return;
    }

    const bookExists =
      displayBooks.some(
        (book) =>
          book.id ===
          targetBookId
      );

    if (!bookExists) {
      setTargetBookId(null);
      setTargetChapterId(null);
    }
  }, [
    targetBookId,
    displayBooks,
  ]);

  /**
   * Bersihkan target Chapter jika
   * sudah tidak menjadi milik Book aktif.
   */
  useEffect(() => {
    if (
      !targetBookId ||
      !targetChapterId
    ) {
      return;
    }

    const isDummyBook =
      isDummyActive &&
      TUTORIAL_DUMMY_BOOKS.some(
        (book) =>
          book.id ===
          targetBookId
      );

    const availableChapters =
      isDummyBook
        ? displayChapters.filter(
            (chapter) =>
              chapter.bookId ===
              targetBookId
          )
        : (
            chaptersByBook[
              targetBookId
            ] ?? []
          );

    const chapterExists =
      availableChapters.some(
        (chapter) =>
          chapter.id ===
          targetChapterId
      );

    if (!chapterExists) {
      setTargetChapterId(
        null
      );
    }
  }, [
    targetBookId,
    targetChapterId,
    chaptersByBook,
    displayChapters,
    isDummyActive,
  ]);

  /**
   * Local data.
   */
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    refreshLocalData();
  }, [
    isAuthenticated,
    refreshLocalData,
  ]);

  /**
   * Splash.
   */
  if (
    appStage ===
    "splash"
  ) {
    return (
      <SplashScreen
        onFinish={
          handleSplashFinish
        }
      />
    );
  }

  /**
   * Authentication.
   */
  if (
    appStage === "auth" ||
    !isAuthenticated
  ) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <UnifiedAuthCard
          onAuthSuccess={
            handleAuthSuccess
          }
        />
      </div>
    );
  }

  /**
   * Main Application.
   */
  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] flex flex-col font-sans selection:bg-[#D4AF37]/25 selection:text-[#FAF7EE]">
      <Navbar
        currentView={
          currentView
        }
        userProfile={
          user as any
        }
        notesCount={
          displayQuickNotes.length
        }
        onNavigate={(view) =>
          setCurrentView(view)
        }
        onOpenSearch={() =>
          setIsSearchOpen(
            true
          )
        }
        onToggleNotes={() =>
          setIsQuickNotesOpen(
            !isQuickNotesOpen
          )
        }
        onOpenTutorial={() =>
          setIsTutorialOpen(
            true
          )
        }
        onOpenProfileSettings={() =>
          setIsProfileSettingsOpen(
            true
          )
        }
        onLogout={
          handleLogout
        }
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentView ===
          "workspace" && (
          <WorkspaceView
            books={
              displayBooks
            }
            chapters={
              displayChapters
            }
            chaptersByBook={
              chaptersByBook
            }
            loadingByBook={
              loadingByBook
            }
            activeBookId={
              targetBookId
            }
            customGenres={
              customGenres
            }
            userProfile={
              user as any
            }
            onSaveBook={
              handleSaveBook
            }
            onDeleteBook={
              handleDeleteBook
            }
            onSaveChapter={
              handleSaveChapter
            }
            onDeleteChapter={
              handleDeleteChapter
            }
            onAddCustomGenre={
              handleAddCustomGenre
            }
            onOpenEditor={
              handleOpenEditor
            }
            onSelectBook={(
              bookId
            ) => {
              setTargetBookId(
                bookId
              );

              setTargetChapterId(
                null
              );
            }}
            onOpenCharactersWiki={() =>
              setCurrentView(
                "characters"
              )
            }
          />
        )}

        {currentView ===
          "characters" && (
          <CharacterWikiView
            characters={
              displayCharacters
            }
            books={
              displayBooks
            }
            onSaveCharacter={
              handleSaveCharacter
            }
            onDeleteCharacter={
              handleDeleteCharacter
            }
          />
        )}

        {currentView ===
          "editor" && (
          <NovelEditorView
            books={
              displayBooks
            }
            chapters={
              displayChapters
            }
            chaptersByBook={
              chaptersByBook
            }
            initialBookId={
              activeEditorBookId
            }
            initialChapterId={
              activeEditorChapterId
            }
            userProfile={
              user as any
            }
            onSaveChapter={
              handleSaveChapter
            }
            onSelectBook={(
              bookId
            ) => {
              setTargetBookId(
                bookId
              );

              setTargetChapterId(
                null
              );

              setCurrentView(
                "workspace"
              );
            }}
          />
        )}
      </main>

      <footer className="h-10 bg-[#1E1E2E] border-t border-[#2A2A3C] flex items-center justify-between px-4 sm:px-8 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[#D4AF37]">
            Status: Sistem Aktif
          </span>

          <span className="hidden sm:inline text-white/20">
            •
          </span>

          <span className="hidden sm:inline">
            Database: Karakter (
            {
              displayCharacters.length
            }
            ) | Cerita (
            {
              displayBooks.length
            }
            )
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span className="hidden sm:inline text-white/40">
            Storage: REST API & PostgreSQL
          </span>

          <span className="hidden sm:inline text-white/20">
            •
          </span>

          <span className="text-[#D4AF37]/80">
            V 1.0.0 Stable
          </span>
        </div>
      </footer>

      <QuickNotesDrawer
        isOpen={
          isQuickNotesOpen
        }
        notes={
          displayQuickNotes
        }
        onClose={() =>
          setIsQuickNotesOpen(
            false
          )
        }
        onSaveNote={
          handleSaveQuickNote
        }
        onDeleteNote={
          handleDeleteQuickNote
        }
      />

      <GlobalSearchModal
        isOpen={
          isSearchOpen
        }
        books={
          displayBooks
        }
        chapters={
          displayChapters
        }
        characters={
          displayCharacters
        }
        notes={
          displayQuickNotes
        }
        onClose={() =>
          setIsSearchOpen(
            false
          )
        }
        onSelectBook={(
          bookId
        ) => {
          const bookExists =
            displayBooks.some(
              (book) =>
                book.id ===
                bookId
            );

          if (!bookExists) {
            return;
          }

          setTargetBookId(
            bookId
          );

          setTargetChapterId(
            null
          );

          setCurrentView(
            "workspace"
          );
        }}
        onSelectChapter={(
          bookId,
          chapterId
        ) => {
          const bookExists =
            displayBooks.some(
              (book) =>
                book.id ===
                bookId
            );

          if (!bookExists) {
            return;
          }

          const isDummyBook =
            isDummyActive &&
            TUTORIAL_DUMMY_BOOKS.some(
              (book) =>
                book.id ===
                bookId
            );

          const availableChapters =
            isDummyBook
              ? displayChapters.filter(
                  (chapter) =>
                    chapter.bookId ===
                    bookId
                )
              : (
                  chaptersByBook[
                    bookId
                  ] ?? []
                );

          const chapterExists =
            availableChapters.some(
              (chapter) =>
                chapter.id ===
                chapterId
            );

          if (!chapterExists) {
            return;
          }

          setTargetBookId(
            bookId
          );

          setTargetChapterId(
            chapterId
          );

          setCurrentView(
            "editor"
          );
        }}
        onSelectCharacter={() =>
          setCurrentView(
            "characters"
          )
        }
      />

      <VisualNovelTutorial
        isOpen={
          isTutorialOpen
        }
        currentView={
          currentView
        }
        onNavigate={(view) =>
          setCurrentView(view)
        }
        onClose={
          handleCloseTutorial
        }
        onComplete={
          handleTutorialComplete
        }
      />

      <ProfileSettingsModal
        isOpen={
          isProfileSettingsOpen
        }
        userProfile={
          user as any
        }
        onClose={() =>
          setIsProfileSettingsOpen(
            false
          )
        }
        onSaveProfile={() => {}}
        onDataRestored={
          refreshBooks
        }
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BookProvider>
        <ChapterProvider>
          <CharacterProvider>
            <MainAppContent />
          </CharacterProvider>
        </ChapterProvider>
      </BookProvider>
    </AuthProvider>
  );
}
