import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useLayoutEffect,
} from 'react';

import {
  Book,
  Chapter,
  ChapterSnapshot,
  SaveStatus,
  UserAuthorProfile,
} from '../../types';

import { countWords, countCharacters } from '../../lib/storage';

import { useChapters } from '../../contexts/ChapterContext';

import {
  Save,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Quote,
  Maximize2,
  Minimize2,
  History,
  Download,
  BookOpen,
  FileText,
  Clock,
  RotateCcw,
  X,
} from 'lucide-react';

interface NovelEditorViewProps {
  books: Book[];
  chapters: Chapter[];
  chaptersByBook: Record<string, Chapter[]>;
  initialBookId?: string | null;
  initialChapterId?: string | null;
  userProfile: UserAuthorProfile | null;
  onSaveChapter: (chapter: Chapter) => void | Promise<void>;
  onSelectBook: (bookId: string) => void;
}

export const NovelEditorView: React.FC<NovelEditorViewProps> = ({
  books,
  chapters,
  chaptersByBook,
  initialBookId,
  initialChapterId,
  userProfile,
  onSaveChapter,
  onSelectBook,
}) => {
  const {
    loadingByBook,
    loadedBooks,
    snapshots,
    snapshotsLoading,
    refreshChapters,
    refreshSnapshots,
    addSnapshot,
  } = useChapters();

  /*
   * ============================================================
   * SELECTED BOOK & CHAPTER
   * ============================================================
   */

  const resolvedInitialBookId = useMemo(() => {
    if (initialBookId && books.some((book) => book.id === initialBookId)) {
      return initialBookId;
    }

    return books[0]?.id || '';
  }, [initialBookId, books]);

  const [selectedBookId, setSelectedBookId] = useState<string>(
    resolvedInitialBookId
  );

  useEffect(() => {
    if (!resolvedInitialBookId) {
      setSelectedBookId('');
      return;
    }

    setSelectedBookId((currentBookId) => {
      if (currentBookId === resolvedInitialBookId) {
        return currentBookId;
      }

      return resolvedInitialBookId;
    });
  }, [resolvedInitialBookId]);

  const availableChapters = useMemo(() => {
    if (!selectedBookId) {
      return [];
    }

    return [...(chaptersByBook[selectedBookId] ?? [])].sort(
      (a, b) => a.order - b.order
    );
  }, [chaptersByBook, selectedBookId]);

  const resolvedInitialChapterId = useMemo(() => {
    if (
      initialChapterId &&
      availableChapters.some((chapter) => chapter.id === initialChapterId)
    ) {
      return initialChapterId;
    }

    return availableChapters[0]?.id || '';
  }, [initialChapterId, availableChapters]);

  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    resolvedInitialChapterId
  );

  useEffect(() => {
    setSelectedChapterId((currentChapterId) => {
      if (
        currentChapterId &&
        availableChapters.some(
          (chapter) => chapter.id === currentChapterId
        )
      ) {
        return currentChapterId;
      }

      return resolvedInitialChapterId;
    });
  }, [availableChapters, resolvedInitialChapterId]);

  const activeChapter = useMemo(() => {
    if (!selectedBookId || !selectedChapterId) {
      return null;
    }

    return (
      (chaptersByBook[selectedBookId] ?? []).find(
        (chapter) => chapter.id === selectedChapterId
      ) || null
    );
  }, [chaptersByBook, selectedBookId, selectedChapterId]);

  /*
   * Sinkronisasi target dari App -> Editor.
   */
  useEffect(() => {
    if (!initialBookId) {
      return;
    }

    if (books.some((book) => book.id === initialBookId)) {
      setSelectedBookId(initialBookId);
    }
  }, [initialBookId, books]);

  useEffect(() => {
    if (!initialChapterId) {
      return;
    }

    const bookId = initialBookId || selectedBookId;

    if (!bookId) {
      return;
    }

    const bookChapters = chaptersByBook[bookId] || [];

    const chapterExists = bookChapters.some(
      (chapter) => chapter.id === initialChapterId
    );

    if (chapterExists) {
      setSelectedChapterId(initialChapterId);
    }
  }, [
    initialChapterId,
    initialBookId,
    selectedBookId,
    chaptersByBook,
  ]);

  /*
   * Pastikan chapter selalu milik buku aktif.
   */
  useEffect(() => {
    if (!selectedBookId) {
      setSelectedChapterId('');
      return;
    }

    const bookChapters = chaptersByBook[selectedBookId] || [];

    if (bookChapters.length === 0) {
      setSelectedChapterId('');
      return;
    }

    const currentChapterStillExists = bookChapters.some(
      (chapter) => chapter.id === selectedChapterId
    );

    if (!currentChapterStillExists) {
      const sortedChapters = [...bookChapters].sort(
        (a, b) => a.order - b.order
      );

      setSelectedChapterId(sortedChapters[0]?.id || '');
    }
  }, [
    selectedBookId,
    selectedChapterId,
    chaptersByBook,
  ]);

  /*
   * Pastikan chapter untuk buku aktif sudah diambil.
   */
  useEffect(() => {
    if (!selectedBookId) {
      return;
    }

    if (
      !loadedBooks[selectedBookId] &&
      !loadingByBook[selectedBookId]
    ) {
      void refreshChapters(selectedBookId);
    }
  }, [
    selectedBookId,
    loadedBooks,
    loadingByBook,
    refreshChapters,
  ]);

  /*
   * ============================================================
   * EDITOR STATE
   * ============================================================
   */

  const [content, setContent] = useState(
    activeChapter?.content || ''
  );

  const [chapterTitle, setChapterTitle] = useState(
    activeChapter?.title || ''
  );

  const [saveStatus, setSaveStatus] =
    useState<SaveStatus>('saved');

  const [lastSavedTime, setLastSavedTime] =
    useState<string>('Tersimpan');

  const [isFocusMode, setIsFocusMode] =
    useState(false);

  const [fontFamily, setFontFamily] =
    useState<'serif' | 'sans' | 'mono'>('serif');

  const [fontSize, setFontSize] =
    useState<number>(18);

  const [lineSpacing] =
    useState<number>(1.8);

  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] =
    useState(false);

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  const autoSaveTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const pendingSelectionRef =
    useRef<{ start: number; end: number } | null>(null);

  /*
   * Refs untuk menghindari stale closure.
   */
  const contentRef = useRef(content);

  const chapterTitleRef =
    useRef(chapterTitle);

  const activeChapterRef =
    useRef(activeChapter);

  const saveStatusRef =
    useRef<SaveStatus>(saveStatus);

  /*
   * Menyimpan promise save yang sedang berjalan.
   * Ini dipakai oleh flushPendingSave() agar perpindahan
   * chapter/buku tidak terjadi sebelum save yang sedang
   * berjalan selesai.
   */
  const saveInFlightRef =
    useRef<Promise<void> | null>(null);

  /*
   * ID operasi save.
   * Berguna agar hasil save lama tidak menimpa status
   * editor yang sudah berpindah ke chapter lain.
   */
  const saveOperationRef =
    useRef(0);

  /*
   * ID perpindahan chapter/buku.
   * Kalau user melakukan rapid switching, request lama
   * tidak boleh mengubah state setelah request terbaru masuk.
   */
  const transitionRequestRef =
    useRef(0);

  /*
   * Sinkronisasi refs setiap render.
   */
  useEffect(() => {
    contentRef.current = content;
    chapterTitleRef.current = chapterTitle;
    activeChapterRef.current = activeChapter;
    saveStatusRef.current = saveStatus;
  }, [
    content,
    chapterTitle,
    activeChapter,
    saveStatus,
  ]);

  /*
   * ============================================================
   * SAVE
   * ============================================================
   */

  const performSave = useCallback(
    async (
      manual = false,
      reason = 'Auto-save draft',
      overrides?: {
        content?: string;
        title?: string;
      }
    ) => {
      const targetChapter =
        activeChapterRef.current;

      if (!targetChapter) {
        return;
      }

      const operationId =
        ++saveOperationRef.current;

      const latestContent =
        overrides?.content ??
        contentRef.current;

      const latestTitle =
        overrides?.title ??
        chapterTitleRef.current;

      saveStatusRef.current = 'saving';
      setSaveStatus('saving');

      const savePromise = (async () => {
        try {
          const words =
            countWords(latestContent);

          const chars =
            countCharacters(latestContent);

          const updatedChapter: Chapter = {
            ...targetChapter,
            title:
              latestTitle.trim() ||
              targetChapter.title,
            content: latestContent,
            wordCount: words,
            characterCount: chars,
            lastSavedAt: Date.now(),
          };

          await onSaveChapter(updatedChapter);

          /*
           * Snapshot tetap scoped:
           * bookId + chapterId.
           */
          if (
            manual ||
            Math.abs(
              words -
                (targetChapter.wordCount || 0)
            ) > 20
          ) {
            await addSnapshot(
              targetChapter.bookId,
              targetChapter.id,
              {
                chapterTitle:
                  updatedChapter.title,
                content: latestContent,
                wordCount: words,
                reason,
              }
            );
          }

          /*
           * Jangan mengubah status editor jika save ini
           * sudah bukan operasi terbaru.
           */
          if (
            operationId !==
            saveOperationRef.current
          ) {
            return;
          }

          /*
           * Jangan menandai chapter baru sebagai saved
           * jika editor sudah berpindah ke chapter lain.
           */
          if (
            activeChapterRef.current?.id !==
            targetChapter.id
          ) {
            return;
          }

          /*
           * Kalau user sudah mengetik lagi selama save
           * berlangsung, jangan menghapus status unsaved.
           */
          if (
            saveStatusRef.current ===
            'unsaved'
          ) {
            return;
          }

          saveStatusRef.current = 'saved';
          setSaveStatus('saved');

          setLastSavedTime(
            new Date().toLocaleTimeString(
              [],
              {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              }
            )
          );
        } catch (error) {
          console.error(
            'Save failed:',
            error
          );

          /*
           * Error dari save lama tidak boleh menimpa
           * status chapter yang sekarang.
           */
          if (
            operationId ===
              saveOperationRef.current &&
            activeChapterRef.current?.id ===
              targetChapter.id
          ) {
            saveStatusRef.current = 'error';
            setSaveStatus('error');
          }

          throw error;
        }
      })();

      saveInFlightRef.current =
        savePromise;

      try {
        await savePromise;
      } finally {
        if (
          saveInFlightRef.current ===
          savePromise
        ) {
          saveInFlightRef.current =
            null;
        }
      }
    },
    [
      onSaveChapter,
      addSnapshot,
    ]
  );

  /*
   * ============================================================
   * AUTOSAVE TIMER
   * ============================================================
   */

  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(
        autoSaveTimerRef.current
      );

      autoSaveTimerRef.current = null;
    }

    autoSaveTimerRef.current =
      setTimeout(() => {
        autoSaveTimerRef.current =
          null;

        void performSave(
          false,
          'Penyimpanan berkala otomatis'
        );
      }, 1800);
  }, [performSave]);

  /*
   * ============================================================
   * FLUSH PENDING SAVE
   * ============================================================
   */

  const flushPendingSave =
    useCallback(async () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(
          autoSaveTimerRef.current
        );

        autoSaveTimerRef.current =
          null;
      }

      /*
       * Tunggu save yang sedang berjalan.
       */
      if (saveInFlightRef.current) {
        try {
          await saveInFlightRef.current;
        } catch {
          /*
           * Error sudah ditangani oleh performSave.
           * Kita tetap melanjutkan proses flush.
           */
        }
      }

      /*
       * Jika setelah save sebelumnya masih ada
       * perubahan baru, simpan lagi.
       */
      if (
        saveStatusRef.current ===
        'unsaved'
      ) {
        try {
          await performSave(
            false,
            'Flush otomatis sebelum ganti/keluar'
          );
        } catch {
          /*
           * Status error sudah ditangani performSave.
           */
        }
      }
    }, [performSave]);

  /*
   * ============================================================
   * GANTI CHAPTER / BUKU
   * ============================================================
   */

  const handleChapterChange =
    useCallback(
      async (newChapterId: string) => {
        const chapterExists =
          availableChapters.some(
            (chapter) =>
              chapter.id === newChapterId
          );

        if (!chapterExists) {
          return;
        }

        const requestId =
          ++transitionRequestRef.current;

        await flushPendingSave();

        /*
         * Jika user sudah memilih chapter lain
         * selama proses flush berlangsung, request ini
         * tidak boleh mengambil alih.
         */
        if (
          requestId !==
          transitionRequestRef.current
        ) {
          return;
        }

        setSelectedChapterId(
          newChapterId
        );
      },
      [
        availableChapters,
        flushPendingSave,
      ]
    );

  const handleBookChange =
    useCallback(
      async (newBookId: string) => {
        const bookExists =
          books.some(
            (book) =>
              book.id === newBookId
          );

        if (!bookExists) {
          return;
        }

        const requestId =
          ++transitionRequestRef.current;

        await flushPendingSave();

        if (
          requestId !==
          transitionRequestRef.current
        ) {
          return;
        }

        setSelectedBookId(
          newBookId
        );

        const nextChapters = [
          ...(chaptersByBook[
            newBookId
          ] ?? []),
        ].sort(
          (a, b) =>
            a.order - b.order
        );

        setSelectedChapterId(
          nextChapters[0]?.id || ''
        );

        onSelectBook(newBookId);
      },
      [
        books,
        chaptersByBook,
        flushPendingSave,
        onSelectBook,
      ]
    );

  /*
   * ============================================================
   * SYNC ACTIVE CHAPTER -> EDITOR
   * ============================================================
   */

  useEffect(() => {
    if (!activeChapter) {
      setContent('');
      contentRef.current = '';

      setChapterTitle('');
      chapterTitleRef.current = '';

      saveStatusRef.current =
        'saved';

      setSaveStatus('saved');
      setLastSavedTime(
        'Tersimpan'
      );

      return;
    }

    /*
     * Hentikan timer lama ketika chapter berganti.
     */
    if (autoSaveTimerRef.current) {
      clearTimeout(
        autoSaveTimerRef.current
      );

      autoSaveTimerRef.current =
        null;
    }

    const nextContent =
      activeChapter.content || '';

    const nextTitle =
      activeChapter.title || '';

    setContent(nextContent);
    contentRef.current =
      nextContent;

    setChapterTitle(nextTitle);
    chapterTitleRef.current =
      nextTitle;

    saveStatusRef.current =
      'saved';

    setSaveStatus('saved');

    setLastSavedTime(
      activeChapter.lastSavedAt
        ? new Date(
            activeChapter.lastSavedAt
          ).toLocaleTimeString(
            [],
            {
              hour: '2-digit',
              minute: '2-digit',
            }
          )
        : 'Tersimpan'
    );

    void refreshSnapshots(
      activeChapter.bookId,
      activeChapter.id
    );
  }, [
    activeChapter?.id,
    activeChapter?.bookId,
    activeChapter?.content,
    activeChapter?.title,
    activeChapter?.lastSavedAt,
    refreshSnapshots,
  ]);

  /*
   * ============================================================
   * UNMOUNT / CLOSE WINDOW
   * ============================================================
   */

  useEffect(() => {
    const handleBeforeUnload =
      () => {
        void flushPendingSave();
      };

    window.addEventListener(
      'beforeunload',
      handleBeforeUnload
    );

    return () => {
      window.removeEventListener(
        'beforeunload',
        handleBeforeUnload
      );

      if (
        autoSaveTimerRef.current
      ) {
        clearTimeout(
          autoSaveTimerRef.current
        );

        autoSaveTimerRef.current =
          null;
      }

      void flushPendingSave();
    };
  }, [flushPendingSave]);

  /*
   * ============================================================
   * PRESERVASI KURSOR
   * ============================================================
   */

  useLayoutEffect(() => {
    if (
      pendingSelectionRef.current &&
      textareaRef.current
    ) {
      const {
        start,
        end,
      } = pendingSelectionRef.current;

      textareaRef.current.setSelectionRange(
        start,
        end
      );

      pendingSelectionRef.current =
        null;
    }
  }, [content]);

  /*
   * ============================================================
   * STATISTIK
   * ============================================================
   */

  const currentWordCount =
    useMemo(
      () =>
        countWords(content),
      [content]
    );

  const currentCharacterCount =
    useMemo(
      () =>
        countCharacters(content),
      [content]
    );

  const readingTimeMinutes =
    useMemo(
      () =>
        Math.max(
          1,
          Math.ceil(
            currentWordCount / 200
          )
        ),
      [currentWordCount]
    );

  /*
   * ============================================================
   * CONTENT CHANGE
   * ============================================================
   */

  const handleContentChange =
    (
      e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
      const val =
        e.target.value;

      setContent(val);

      /*
       * Update ref langsung.
       * Tidak menunggu React render/effect.
       */
      contentRef.current = val;

      saveStatusRef.current =
        'unsaved';

      setSaveStatus('unsaved');

      scheduleAutoSave();
    };

  /*
   * ============================================================
   * KEYBOARD SHORTCUT
   * ============================================================
   */

  useEffect(() => {
    const handleKeyDown =
      (e: KeyboardEvent) => {
        if (
          (e.ctrlKey || e.metaKey) &&
          e.key.toLowerCase() === 's'
        ) {
          e.preventDefault();

          void performSave(
            true,
            'Disimpan manual (Ctrl+S)'
          );
        }

        if (
          e.key === 'Escape' &&
          isFocusMode
        ) {
          setIsFocusMode(false);
        }
      };

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
  }, [
    performSave,
    isFocusMode,
  ]);

  /*
   * ============================================================
   * FORMATTING
   * ============================================================
   */

  const insertFormatting = (
    prefix: string,
    suffix = '',
    placeholder = ''
  ) => {
    if (!textareaRef.current) {
      return;
    }

    const el =
      textareaRef.current;

    const start =
      el.selectionStart;

    const end =
      el.selectionEnd;

    const selected =
      content.substring(
        start,
        end
      ) || placeholder;

    const replacement =
      prefix +
      selected +
      suffix;

    const newContent =
      content.substring(
        0,
        start
      ) +
      replacement +
      content.substring(end);

    pendingSelectionRef.current =
      {
        start:
          start +
          prefix.length,
        end:
          start +
          prefix.length +
          selected.length,
      };

    setContent(newContent);

    contentRef.current =
      newContent;

    saveStatusRef.current =
      'unsaved';

    setSaveStatus('unsaved');

    scheduleAutoSave();

    el.focus();
  };

  /*
   * ============================================================
   * RESTORE SNAPSHOT
   * ============================================================
   */

  const handleRestoreSnapshot =
    (
      snap: ChapterSnapshot
    ) => {
      if (
        !window.confirm(
          `Pulihkan versi naskah dari ${new Date(
            snap.timestamp
          ).toLocaleString()} (${snap.wordCount} kata)? Draft saat ini akan digantikan.`
        )
      ) {
        return;
      }

      /*
       * Hentikan timer autosave lama.
       */
      if (
        autoSaveTimerRef.current
      ) {
        clearTimeout(
          autoSaveTimerRef.current
        );

        autoSaveTimerRef.current =
          null;
      }

      /*
       * Update state DAN ref secara langsung.
       */
      setContent(
        snap.content
      );

      setChapterTitle(
        snap.chapterTitle
      );

      contentRef.current =
        snap.content;

      chapterTitleRef.current =
        snap.chapterTitle;

      saveStatusRef.current =
        'unsaved';

      setSaveStatus('unsaved');

      /*
       * Sangat penting:
       * performSave menerima overrides sehingga tidak
       * bergantung pada timing React state update.
       */
      void performSave(
        true,
        `Dipulihkan dari snapshot (${new Date(
          snap.timestamp
        ).toLocaleTimeString()})`,
        {
          content: snap.content,
          title: snap.chapterTitle,
        }
      );

      setIsHistoryDrawerOpen(
        false
      );
    };

  /*
   * ============================================================
   * EXPORT
   * ============================================================
   */

  const handleExportText = (
    format: 'txt' | 'md'
  ) => {
    if (!activeChapter) {
      return;
    }

    const ext =
      format === 'md'
        ? 'md'
        : 'txt';

    const textData =
      `# ${chapterTitle}\n\n${content}`;

    const blob = new Blob(
      [textData],
      {
        type:
          'text/plain;charset=utf-8',
      }
    );

    const url =
      URL.createObjectURL(
        blob
      );

    const a =
      document.createElement(
        'a'
      );

    a.href = url;

    a.download =
      `${chapterTitle.replace(
        /[^a-z0-9]/gi,
        '_'
      )}.${ext}`;

    a.click();

    URL.revokeObjectURL(
      url
    );
  };

  /*
   * ============================================================
   * EMPTY BOOK STATE
   * ============================================================
   */

  if (books.length === 0) {
    return (
      <div
        id="empty-editor-state"
        className="py-16 px-4 text-center border-2 border-dashed border-[#2A2A3C] rounded-3xl bg-[#181826] flex flex-col items-center justify-center max-w-2xl mx-auto shadow-inner"
      >
        <div className="p-4 bg-[#222234] rounded-2xl border border-[#35354C] text-[#D4AF37] mb-4 shadow-lg">
          <BookOpen className="w-10 h-10" />
        </div>

        <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#FAF7EE] mb-2">
          Belum ada proyek buku untuk ditulis.
        </h3>

        <p className="text-xs sm:text-sm text-[#9E9EB2] max-w-md mb-6 leading-relaxed">
          Sebelum menggunakan Studio Editor,
          buat buku cerita pertamamu di Workspace
          dan tambahkan bab naskah.
        </p>

        <button
          onClick={() =>
            onSelectBook('')
          }
          className="py-3 px-6 bg-gradient-to-r from-[#D4AF37] to-[#B89225] hover:from-[#E2BE4B] hover:to-[#C9A332] text-[#121212] font-semibold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>
            Buka Workspace & Buat Buku
          </span>
        </button>
      </div>
    );
  }

  /*
   * ============================================================
   * BOOK LOADING STATE
   * ============================================================
   */

  const activeBookLoading =
    selectedBookId
      ? Boolean(
          loadingByBook[
            selectedBookId
          ]
        )
      : false;

  const activeBookLoaded =
    selectedBookId
      ? Boolean(
          loadedBooks[
            selectedBookId
          ]
        )
      : false;

  if (
    !activeChapter &&
    activeBookLoading
  ) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-[#2A2A3C] rounded-3xl bg-[#181826] max-w-2xl mx-auto p-6">
        <FileText className="w-10 h-10 mx-auto mb-3 text-[#D4AF37]/50 animate-pulse" />

        <h3 className="font-editorial text-xl font-bold text-[#FAF7EE] mb-2">
          Memuat bab naskah...
        </h3>

        <p className="text-xs text-[#9E9EB2]">
          Data chapter sedang diambil
          dari database.
        </p>
      </div>
    );
  }

  /*
   * Kondisi benar-benar kosong:
   * buku sudah selesai di-load tetapi belum
   * mempunyai bab.
   */
  if (!activeChapter) {
    if (!activeBookLoaded) {
      return (
        <div className="py-16 text-center border-2 border-dashed border-[#2A2A3C] rounded-3xl bg-[#181826] max-w-2xl mx-auto p-6">
          <FileText className="w-10 h-10 mx-auto mb-3 text-[#D4AF37]/50 animate-pulse" />

          <h3 className="font-editorial text-xl font-bold text-[#FAF7EE] mb-2">
            Menyiapkan data buku...
          </h3>

          <p className="text-xs text-[#9E9EB2]">
            Mohon tunggu sebentar.
          </p>
        </div>
      );
    }

    return (
      <div
        id="empty-chapter-state"
        className="py-16 px-4 text-center border-2 border-dashed border-[#2A2A3C] rounded-3xl bg-[#181826] flex flex-col items-center justify-center max-w-2xl mx-auto shadow-inner"
      >
        <div className="p-4 bg-[#222234] rounded-2xl border border-[#35354C] text-[#D4AF37] mb-4 shadow-lg">
          <FileText className="w-10 h-10" />
        </div>

        <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#FAF7EE] mb-2">
          Buku ini belum memiliki bab naskah.
        </h3>

        <p className="text-xs sm:text-sm text-[#9E9EB2] max-w-md leading-relaxed">
          Tambahkan bab baru dari Workspace
          untuk mulai menulis naskahmu di sini.
        </p>
      </div>
    );
  }

  /*
   * ============================================================
   * MAIN EDITOR
   * ============================================================
   */

  return (
    <div
      id="novel-editor-container"
      className={`flex flex-col transition-all duration-300 ${
        isFocusMode
          ? 'fixed inset-0 z-50 bg-[#121212] p-4 sm:p-8 overflow-y-auto'
          : 'space-y-4'
      }`}
    >
      <div className="bg-[#1E1E2E] border border-[#2A2A3C] rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div
          className="flex flex-wrap items-center gap-3"
          data-tour="editor-selector-bar"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#D4AF37] shrink-0" />

            <select
              value={selectedBookId}
              onChange={(e) =>
                void handleBookChange(
                  e.target.value
                )
              }
              className="max-w-[180px] sm:max-w-[220px] px-3 py-1.5 bg-[#161624] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs font-semibold text-[#FAF7EE] outline-none truncate cursor-pointer"
            >
              {books.map((b) => (
                <option
                  key={b.id}
                  value={b.id}
                >
                  {b.title}
                </option>
              ))}
            </select>
          </div>

          {availableChapters.length >
            0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6E6E85]">
                /
              </span>

              <select
                value={
                  selectedChapterId
                }
                onChange={(e) =>
                  void handleChapterChange(
                    e.target.value
                  )
                }
                className="max-w-[180px] sm:max-w-[220px] px-3 py-1.5 bg-[#161624] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs font-semibold text-[#FAF7EE] outline-none truncate cursor-pointer"
              >
                {availableChapters.map(
                  (chap) => (
                    <option
                      key={chap.id}
                      value={chap.id}
                    >
                      Bab{' '}
                      {
                        chap.chapterNumber
                      }
                      : {chap.title}
                    </option>
                  )
                )}
              </select>
            </div>
          )}
        </div>

        <div
          className="flex flex-wrap items-center gap-3"
          data-tour="editor-toolbar-actions"
        >
          <div
            className="flex items-center gap-2"
            data-tour="editor-save-indicator"
          >
            <div
              id="editor-save-status-pill"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border"
              style={{
                backgroundColor:
                  saveStatus ===
                  'saved'
                    ? 'rgba(16, 185, 129, 0.12)'
                    : saveStatus ===
                      'saving'
                    ? 'rgba(59, 130, 246, 0.12)'
                    : saveStatus ===
                      'unsaved'
                    ? 'rgba(245, 158, 11, 0.12)'
                    : 'rgba(239, 68, 68, 0.12)',
                borderColor:
                  saveStatus ===
                  'saved'
                    ? 'rgba(16, 185, 129, 0.3)'
                    : saveStatus ===
                      'saving'
                    ? 'rgba(59, 130, 246, 0.3)'
                    : saveStatus ===
                      'unsaved'
                    ? 'rgba(245, 158, 11, 0.3)'
                    : 'rgba(239, 68, 68, 0.3)',
                color:
                  saveStatus ===
                  'saved'
                    ? '#34D399'
                    : saveStatus ===
                      'saving'
                    ? '#60A5FA'
                    : saveStatus ===
                      'unsaved'
                    ? '#FBBF24'
                    : '#F87171',
              }}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  saveStatus ===
                  'saving'
                    ? 'animate-ping bg-blue-400'
                    : saveStatus ===
                      'unsaved'
                    ? 'bg-amber-400'
                    : saveStatus ===
                      'saved'
                    ? 'bg-emerald-400'
                    : 'bg-red-400'
                }`}
              />

              <span>
                {saveStatus ===
                'saved'
                  ? `Tersimpan (${lastSavedTime})`
                  : saveStatus ===
                    'saving'
                  ? 'Menyimpan...'
                  : saveStatus ===
                    'unsaved'
                  ? 'Belum Tersimpan'
                  : 'Gagal Menyimpan'}
              </span>
            </div>

            <button
              id="btn-manual-save"
              onClick={() =>
                void performSave(
                  true,
                  'Simpan manual'
                )
              }
              className="py-1.5 px-3 bg-[#242438] hover:bg-[#30304C] text-[#D4AF37] border border-[#D4AF37]/40 hover:border-[#D4AF37] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Simpan Naskah (Ctrl+S)"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan</span>
            </button>
          </div>

          <button
            id="btn-emergency-draft-history"
            data-tour="editor-history-vault"
            onClick={() =>
              setIsHistoryDrawerOpen(
                !isHistoryDrawerOpen
              )
            }
            className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isHistoryDrawerOpen
                ? 'bg-[#D4AF37] text-[#121212]'
                : 'bg-[#222234] text-[#B0B0C4] hover:text-[#FAF7EE] border border-[#2A2A3C]'
            }`}
            title="Riwayat Draft Darurat & Pemulihan"
          >
            <History className="w-3.5 h-3.5" />
            <span>
              Draft Darurat (
              {snapshots.length})
            </span>
          </button>

          <button
            id="btn-toggle-focus-mode"
            data-tour="editor-focus-btn"
            onClick={() =>
              setIsFocusMode(
                !isFocusMode
              )
            }
            className="p-2 bg-[#222234] hover:bg-[#2E2E44] text-[#FAF7EE] rounded-xl text-xs border border-[#2A2A3C] transition-colors cursor-pointer"
            title={
              isFocusMode
                ? 'Keluar Mode Fokus (Esc)'
                : 'Mode Fokus Layar Penuh'
            }
          >
            {isFocusMode ? (
              <Minimize2 className="w-4 h-4 text-[#D4AF37]" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div
        data-tour="editor-stats-ribbon"
        className="bg-[#181826] border border-[#2A2A3C] px-5 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[#8E8EA4]">
              Jumlah Kata:
            </span>

            <span className="font-mono font-bold text-[#D4AF37] text-sm">
              {currentWordCount.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#8E8EA4]">
              Karakter:
            </span>

            <span className="font-mono text-[#FAF7EE]">
              {currentCharacterCount.toLocaleString()}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#8E8EA4]" />

            <span className="text-[#8E8EA4]">
              Estimasi Baca: ~
              {readingTimeMinutes} mnt
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[#8E8EA4]">
            Target Harian:{' '}
            <span className="font-mono text-[#FAF7EE]">
              {userProfile?.dailyWordGoal ||
                1000}{' '}
              kata
            </span>
          </div>

          <div className="w-24 bg-[#141420] rounded-full h-2 overflow-hidden border border-[#2A2A3C]">
            <div
              className="h-full bg-gradient-to-r from-[#8A1825] to-[#D4AF37] rounded-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  (currentWordCount /
                    (userProfile?.dailyWordGoal ||
                      1000)) *
                    100
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div
        data-tour="editor-export-tools"
        className="bg-[#1E1E2E] border border-[#2A2A3C] p-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-2"
      >
        <div
          className="flex flex-wrap items-center gap-1"
          data-tour="editor-formatting-tools"
        >
          <button
            type="button"
            onClick={() =>
              insertFormatting(
                '**',
                '**',
                'Teks Tebal'
              )
            }
            className="p-1.5 hover:bg-[#2A2A3E] text-[#B0B0C4] hover:text-[#FAF7EE] rounded-lg transition-colors cursor-pointer"
            title="Tebal (**teks**)"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              insertFormatting(
                '*',
                '*',
                'Teks Miring'
              )
            }
            className="p-1.5 hover:bg-[#2A2A3E] text-[#B0B0C4] hover:text-[#FAF7EE] rounded-lg transition-colors cursor-pointer"
            title="Miring (*teks*)"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              insertFormatting(
                '<u>',
                '</u>',
                'Teks Garis Bawah'
              )
            }
            className="p-1.5 hover:bg-[#2A2A3E] text-[#B0B0C4] hover:text-[#FAF7EE] rounded-lg transition-colors cursor-pointer"
            title="Garis Bawah"
          >
            <Underline className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              insertFormatting(
                '~~',
                '~~',
                'Teks Coret'
              )
            }
            className="p-1.5 hover:bg-[#2A2A3E] text-[#B0B0C4] hover:text-[#FAF7EE] rounded-lg transition-colors cursor-pointer"
            title="Coret (~~teks~~)"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-[#2A2A3C] mx-1" />

          <button
            type="button"
            onClick={() =>
              insertFormatting(
                '# ',
                '\n',
                'Judul Utama'
              )
            }
            className="p-1.5 hover:bg-[#2A2A3E] text-[#B0B0C4] hover:text-[#FAF7EE] rounded-lg transition-colors cursor-pointer"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              insertFormatting(
                '## ',
                '\n',
                'Sub Judul'
              )
            }
            className="p-1.5 hover:bg-[#2A2A3E] text-[#B0B0C4] hover:text-[#FAF7EE] rounded-lg transition-colors cursor-pointer"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              insertFormatting(
                '> ',
                '\n',
                'Kutipan / Monolog batin'
              )
            }
            className="p-1.5 hover:bg-[#2A2A3E] text-[#B0B0C4] hover:text-[#FAF7EE] rounded-lg transition-colors cursor-pointer"
            title="Kutipan Monolog"
          >
            <Quote className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-[#2A2A3C] mx-1" />

          <button
            type="button"
            onClick={() =>
              insertFormatting(
                '— ',
                '',
                'Dialog tokoh...'
              )
            }
            className="py-1 px-2 hover:bg-[#2A2A3E] text-xs font-mono text-[#D4AF37] rounded-lg transition-colors cursor-pointer"
            title="Garis Dialog Panjang (—)"
          >
            — Dialog
          </button>

          <button
            type="button"
            onClick={() =>
              insertFormatting(
                '\n\n* * *\n\n',
                '',
                ''
              )
            }
            className="py-1 px-2 hover:bg-[#2A2A3E] text-xs font-mono text-[#FAF7EE] rounded-lg transition-colors cursor-pointer"
            title="Pembatas Adegan (* * *)"
          >
            * * * Adegan
          </button>
        </div>

        <div
          className="flex items-center gap-2"
          data-tour="editor-typography-group"
        >
          <select
            value={fontFamily}
            onChange={(e) =>
              setFontFamily(
                e.target.value as
                  | 'serif'
                  | 'sans'
                  | 'mono'
              )
            }
            className="px-2.5 py-1 bg-[#161624] border border-[#2A2A3C] rounded-lg text-xs text-[#C8C8DC] outline-none cursor-pointer"
          >
            <option value="serif">
              Serif (Editorial)
            </option>
            <option value="sans">
              Sans-Serif
            </option>
            <option value="mono">
              Monospace
            </option>
          </select>

          <select
            value={fontSize}
            onChange={(e) =>
              setFontSize(
                Number(e.target.value)
              )
            }
            className="px-2 py-1 bg-[#161624] border border-[#2A2A3C] rounded-lg text-xs text-[#C8C8DC] outline-none cursor-pointer font-mono"
          >
            <option value={15}>
              15px
            </option>
            <option value={17}>
              17px
            </option>
            <option value={18}>
              18px
            </option>
            <option value={20}>
              20px
            </option>
            <option value={22}>
              22px
            </option>
          </select>

          <div
            className="flex items-center gap-1"
            data-tour="editor-export-btn"
          >
            <button
              onClick={() =>
                handleExportText('txt')
              }
              className="p-1.5 hover:bg-[#2A2A3E] text-[#B0B0C4] hover:text-[#FAF7EE] rounded-lg text-xs transition-colors cursor-pointer"
              title="Unduh sebagai Naskah .txt"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        data-tour="editor-canvas-stage"
        className="relative flex flex-col bg-[#1A1A28] border border-[#2A2A3C] rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-2xl min-h-[550px]"
      >
        <input
          id="editor-chapter-title-input"
          type="text"
          value={chapterTitle}
          onChange={(e) => {
            const nextTitle =
              e.target.value;

            setChapterTitle(
              nextTitle
            );

            chapterTitleRef.current =
              nextTitle;

            saveStatusRef.current =
              'unsaved';

            setSaveStatus('unsaved');

            scheduleAutoSave();
          }}
          placeholder="Judul Bab..."
          className="font-editorial text-2xl sm:text-3xl font-bold text-[#FAF7EE] bg-transparent border-b border-[#2A2A3C] pb-3 mb-6 outline-none placeholder-[#55556C] focus:border-[#D4AF37] transition-colors"
        />

        <textarea
          id="editor-manuscript-textarea"
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder="Mulai tuliskan kisah petualangan, dialog menegangkan, atau monolog karaktermu di sini..."
          style={{
            fontFamily:
              fontFamily === 'serif'
                ? "'Cinzel', serif, Georgia, 'Times New Roman'"
                : fontFamily ===
                  'mono'
                ? "'JetBrains Mono', monospace"
                : "'Plus Jakarta Sans', sans-serif",
            fontSize: `${fontSize}px`,
            lineHeight:
              lineSpacing,
          }}
          className="w-full flex-1 bg-transparent text-[#E0E0E0] outline-none resize-none placeholder-[#4E4E66] selection:bg-[#D4AF37]/30 min-h-[480px]"
          autoFocus
        />
      </div>

      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#1E1E2E] border-l border-[#2A2A3C] h-full p-6 flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#2A2A3C] mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#D4AF37]" />

                <h3 className="font-editorial text-base font-bold text-[#FAF7EE]">
                  Brankas Draft Darurat
                </h3>
              </div>

              <button
                onClick={() =>
                  setIsHistoryDrawerOpen(
                    false
                  )
                }
                className="p-1 text-[#8E8EA4] hover:text-[#FAF7EE] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#8E8EA4] mb-4">
              Novel's Creator secara otomatis
              mengamankan snapshot naskahmu. Jika
              kamu salah menghapus teks, pulihkan
              versi sebelumnya dengan satu klik:
            </p>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {snapshotsLoading ? (
                <div className="py-12 text-center text-[#6E6E85]">
                  <p className="text-xs animate-pulse">
                    Memuat riwayat draft...
                  </p>
                </div>
              ) : snapshots.length ===
                0 ? (
                <div className="py-12 text-center text-[#6E6E85]">
                  <p className="text-xs">
                    Belum ada riwayat snapshot
                    untuk bab ini.
                  </p>
                </div>
              ) : (
                snapshots.map(
                  (snap) => (
                    <div
                      key={snap.id}
                      className="p-3.5 bg-[#161624] border border-[#2A2A3C] hover:border-[#D4AF37]/50 rounded-xl space-y-2 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[#D4AF37] font-semibold">
                          {new Date(
                            snap.timestamp
                          ).toLocaleTimeString(
                            [],
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            }
                          )}
                        </span>

                        <span className="text-[11px] text-[#8E8EA4] font-mono">
                          {snap.wordCount}{' '}
                          kata
                        </span>
                      </div>

                      {snap.reason && (
                        <div className="text-[11px] text-[#A0A0B5] italic">
                          {snap.reason}
                        </div>
                      )}

                      <p className="text-xs text-[#7E7E94] line-clamp-2 bg-[#12121C] p-2 rounded border border-[#222234]">
                        {snap.content.slice(
                          0,
                          120
                        )}
                        ...
                      </p>

                      <button
                        onClick={() =>
                          handleRestoreSnapshot(
                            snap
                          )
                        }
                        className="w-full py-1.5 px-3 bg-[#242438] hover:bg-[#D4AF37] hover:text-[#121212] text-xs font-semibold text-[#FAF7EE] rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />

                        <span>
                          Pulihkan Versi Ini
                        </span>
                      </button>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
