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
  CharacterMention,
  CharacterWiki,
} from '../../types';

import { useCharacters } from '../../contexts/CharacterContext';

import CharacterMentionPicker from './CharacterMentionPicker';
import CharacterMentionPanel from './CharacterMentionPanel';

import {
  countWords,
  countCharacters,
} from '../../lib/storage';

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
  AtSign,
  PanelRight,
} from 'lucide-react';

interface NovelEditorViewProps {
  books: Book[];
  chapters: Chapter[];
  chaptersByBook: Record<
    string,
    Chapter[]
  >;
  initialBookId?: string | null;
  initialChapterId?: string | null;
  userProfile: UserAuthorProfile | null;
  onSaveChapter: (
    chapter: Chapter
  ) => void | Promise<void>;
  onSelectBook: (
    bookId: string
  ) => void;
}

export const NovelEditorView: React.FC<
  NovelEditorViewProps
> = ({
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
    snapshotsByChapter,
    snapshotsLoadingByChapter,
    refreshChapters,
    refreshSnapshots,
    addSnapshot,
  } = useChapters();

  const {
    characters,
    mentions,
    refreshCharacters,
    refreshMentions,
    addMention,
    editMention,
    removeMention,
  } = useCharacters();

  /*
   * ============================================================
   * SELECTED BOOK & CHAPTER
   * ============================================================
   */

  const resolvedInitialBookId =
    useMemo(() => {
      if (
        initialBookId &&
        books.some(
          (book) =>
            book.id === initialBookId
        )
      ) {
        return initialBookId;
      }

      return books[0]?.id || '';
    }, [initialBookId, books]);

  const [
    selectedBookId,
    setSelectedBookId,
  ] = useState<string>(
    resolvedInitialBookId
  );

  useEffect(() => {
    if (!resolvedInitialBookId) {
      setSelectedBookId('');
      return;
    }

    setSelectedBookId(
      (currentBookId) => {
        if (
          currentBookId ===
          resolvedInitialBookId
        ) {
          return currentBookId;
        }

        return resolvedInitialBookId;
      }
    );
  }, [resolvedInitialBookId]);

  const availableChapters =
    useMemo(() => {
      if (!selectedBookId) {
        return [];
      }

      return [
        ...(chaptersByBook[
          selectedBookId
        ] ?? []),
      ].sort(
        (a, b) =>
          a.order - b.order
      );
    }, [
      chaptersByBook,
      selectedBookId,
    ]);

  const resolvedInitialChapterId =
    useMemo(() => {
      if (
        initialChapterId &&
        availableChapters.some(
          (chapter) =>
            chapter.id ===
            initialChapterId
        )
      ) {
        return initialChapterId;
      }

      return (
        availableChapters[0]?.id ||
        ''
      );
    }, [
      initialChapterId,
      availableChapters,
    ]);

  const [
    selectedChapterId,
    setSelectedChapterId,
  ] = useState<string>(
    resolvedInitialChapterId
  );

  useEffect(() => {
    setSelectedChapterId(
      (currentChapterId) => {
        if (
          currentChapterId &&
          availableChapters.some(
            (chapter) =>
              chapter.id ===
              currentChapterId
          )
        ) {
          return currentChapterId;
        }

        return resolvedInitialChapterId;
      }
    );
  }, [
    availableChapters,
    resolvedInitialChapterId,
  ]);

  const activeChapter =
    useMemo(() => {
      if (
        !selectedBookId ||
        !selectedChapterId
      ) {
        return null;
      }

      return (
        (
          chaptersByBook[
            selectedBookId
          ] ?? []
        ).find(
          (chapter) =>
            chapter.id ===
            selectedChapterId
        ) || null
      );
    }, [
      chaptersByBook,
      selectedBookId,
      selectedChapterId,
    ]);

  /*
   * ============================================================
   * SNAPSHOT
   * ============================================================
   */

  const snapshotKey =
    activeChapter
      ? `${activeChapter.bookId}:${activeChapter.id}`
      : '';

  const activeSnapshots =
    snapshotKey
      ? snapshotsByChapter[
          snapshotKey
        ] ?? []
      : [];

  const activeSnapshotsLoading =
    snapshotKey
      ? Boolean(
          snapshotsLoadingByChapter[
            snapshotKey
          ]
        )
      : false;

  /*
   * ============================================================
   * SYNC TARGET APP -> EDITOR
   * ============================================================
   */

  useEffect(() => {
    if (!initialBookId) {
      return;
    }

    if (
      books.some(
        (book) =>
          book.id === initialBookId
      )
    ) {
      setSelectedBookId(
        initialBookId
      );
    }
  }, [
    initialBookId,
    books,
  ]);

  useEffect(() => {
    if (!initialChapterId) {
      return;
    }

    const bookId =
      initialBookId ||
      selectedBookId;

    if (!bookId) {
      return;
    }

    const bookChapters =
      chaptersByBook[bookId] ||
      [];

    const chapterExists =
      bookChapters.some(
        (chapter) =>
          chapter.id ===
          initialChapterId
      );

    if (chapterExists) {
      setSelectedChapterId(
        initialChapterId
      );
    }
  }, [
    initialChapterId,
    initialBookId,
    selectedBookId,
    chaptersByBook,
  ]);

  useEffect(() => {
    if (!selectedBookId) {
      setSelectedChapterId('');
      return;
    }

    const bookChapters =
      chaptersByBook[
        selectedBookId
      ] || [];

    if (bookChapters.length === 0) {
      setSelectedChapterId('');
      return;
    }

    const currentChapterStillExists =
      bookChapters.some(
        (chapter) =>
          chapter.id ===
          selectedChapterId
      );

    if (
      !currentChapterStillExists
    ) {
      const sortedChapters =
        [...bookChapters].sort(
          (a, b) =>
            a.order - b.order
        );

      setSelectedChapterId(
        sortedChapters[0]?.id ||
          ''
      );
    }
  }, [
    selectedBookId,
    selectedChapterId,
    chaptersByBook,
  ]);

  useEffect(() => {
    if (!selectedBookId) {
      return;
    }

    if (
      !loadedBooks[selectedBookId] &&
      !loadingByBook[selectedBookId]
    ) {
      void refreshChapters(
        selectedBookId
      );
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

  const [content, setContent] =
    useState(
      activeChapter?.content || ''
    );

  const [
    chapterTitle,
    setChapterTitle,
  ] = useState(
    activeChapter?.title || ''
  );

  const [
    saveStatus,
    setSaveStatus,
  ] = useState<SaveStatus>(
    'saved'
  );

  const [
    lastSavedTime,
    setLastSavedTime,
  ] = useState<string>(
    'Tersimpan'
  );

  const [
    isFocusMode,
    setIsFocusMode,
  ] = useState(false);

  const [
    fontFamily,
    setFontFamily,
  ] = useState<
    'serif' | 'sans' | 'mono'
  >('serif');

  const [
    fontSize,
    setFontSize,
  ] = useState<number>(18);

  const [lineSpacing] =
    useState<number>(1.8);

  const [
    isHistoryDrawerOpen,
    setIsHistoryDrawerOpen,
  ] = useState(false);

  const [
    isMentionPanelOpen,
    setIsMentionPanelOpen,
  ] = useState(true);

  const [
    mentionOperationLoading,
    setMentionOperationLoading,
  ] = useState(false);

  const [
    mentionError,
    setMentionError,
  ] = useState<string | null>(
    null
  );

  const previousContentRef =
    useRef(
      activeChapter?.content || ''
    );

  const textareaRef =
    useRef<HTMLTextAreaElement>(
      null
    );

  const mentionHighlightRef =
    useRef<HTMLDivElement>(null);

  const mentionScrollSyncingRef =
    useRef(false);

  const autoSaveTimerRef =
    useRef<
      ReturnType<typeof setTimeout> | null
    >(null);

  const pendingSelectionRef =
    useRef<{
      start: number;
      end: number;
    } | null>(null);

  const contentRef =
    useRef(content);

  const chapterTitleRef =
    useRef(chapterTitle);

  const activeChapterRef =
    useRef(activeChapter);

  const saveStatusRef =
    useRef<SaveStatus>(
      saveStatus
    );

  const saveInFlightRef =
    useRef<Promise<void> | null>(
      null
    );

  const saveOperationRef =
    useRef(0);

  const transitionRequestRef =
    useRef(0);

  /*
   * ============================================================
   * REFS SYNC
   * ============================================================
   */

  useEffect(() => {
    contentRef.current =
      content;

    chapterTitleRef.current =
      chapterTitle;

    activeChapterRef.current =
      activeChapter;

    saveStatusRef.current =
      saveStatus;
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

  const performSave =
    useCallback(
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

        saveStatusRef.current =
          'saving';

        setSaveStatus('saving');

        const savePromise =
          (async () => {
            try {
              const words =
                countWords(
                  latestContent
                );

              const chars =
                countCharacters(
                  latestContent
                );

              const updatedChapter: Chapter =
                {
                  ...targetChapter,
                  title:
                    latestTitle.trim() ||
                    targetChapter.title,
                  content:
                    latestContent,
                  wordCount: words,
                  characterCount:
                    chars,
                  lastSavedAt:
                    Date.now(),
                };

              await onSaveChapter(
                updatedChapter
              );

              if (
                manual ||
                Math.abs(
                  words -
                    (targetChapter.wordCount ||
                      0)
                ) > 20
              ) {
                await addSnapshot(
                  targetChapter.bookId,
                  targetChapter.id,
                  {
                    chapterTitle:
                      updatedChapter.title,
                    content:
                      latestContent,
                    wordCount:
                      words,
                    reason,
                  }
                );
              }

              if (
                operationId !==
                saveOperationRef.current
              ) {
                return;
              }

              if (
                activeChapterRef.current
                  ?.id !==
                targetChapter.id
              ) {
                return;
              }

              if (
                saveStatusRef.current ===
                'unsaved'
              ) {
                return;
              }

              saveStatusRef.current =
                'saved';

              setSaveStatus(
                'saved'
              );

              setLastSavedTime(
                new Date().toLocaleTimeString(
                  [],
                  {
                    hour: '2-digit',
                    minute:
                      '2-digit',
                    second:
                      '2-digit',
                  }
                )
              );
            } catch (error) {
              console.error(
                'Save failed:',
                error
              );

              if (
                operationId ===
                  saveOperationRef.current &&
                activeChapterRef.current
                  ?.id ===
                  targetChapter.id
              ) {
                saveStatusRef.current =
                  'error';

                setSaveStatus(
                  'error'
                );
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
   * AUTOSAVE
   * ============================================================
   */

  const scheduleAutoSave =
    useCallback(() => {
      if (
        autoSaveTimerRef.current
      ) {
        clearTimeout(
          autoSaveTimerRef.current
        );

        autoSaveTimerRef.current =
          null;
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
   * FLUSH
   * ============================================================
   */

  const flushPendingSave =
    useCallback(async () => {
      if (
        autoSaveTimerRef.current
      ) {
        clearTimeout(
          autoSaveTimerRef.current
        );

        autoSaveTimerRef.current =
          null;
      }

      if (
        saveInFlightRef.current
      ) {
        try {
          await saveInFlightRef.current;
        } catch {
          // Error sudah ditangani.
        }
      }

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
          // Error sudah ditangani.
        }
      }
    }, [performSave]);

  /*
   * ============================================================
   * GANTI CHAPTER
   * ============================================================
   */

  const handleChapterChange =
    useCallback(
      async (
        newChapterId: string
      ) => {
        const chapterExists =
          availableChapters.some(
            (chapter) =>
              chapter.id ===
              newChapterId
          );

        if (!chapterExists) {
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

        setSelectedChapterId(
          newChapterId
        );
      },
      [
        availableChapters,
        flushPendingSave,
      ]
    );

  /*
   * ============================================================
   * GANTI BUKU
   * ============================================================
   */

  const handleBookChange =
    useCallback(
      async (
        newBookId: string
      ) => {
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
          nextChapters[0]?.id ||
            ''
        );

        onSelectBook(
          newBookId
        );
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
   * LOAD ACTIVE CHAPTER
   * ============================================================
   */

  useEffect(() => {
    if (!activeChapter) {
      setContent('');
      contentRef.current =
        '';

      setChapterTitle('');
      chapterTitleRef.current =
        '';

      saveStatusRef.current =
        'saved';

      setSaveStatus('saved');

      setLastSavedTime(
        'Tersimpan'
      );

      setMentionError(null);

      return;
    }

    if (
      autoSaveTimerRef.current
    ) {
      clearTimeout(
        autoSaveTimerRef.current
      );

      autoSaveTimerRef.current =
        null;
    }

    const nextContent =
      activeChapter.content ||
      '';

    const nextTitle =
      activeChapter.title ||
      '';

    setContent(nextContent);
    contentRef.current =
      nextContent;

    previousContentRef.current =
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
              minute:
                '2-digit',
            }
          )
        : 'Tersimpan'
    );

    setMentionError(null);

    void refreshSnapshots(
      activeChapter.bookId,
      activeChapter.id
    );

    void refreshCharacters(
      activeChapter.bookId
    );

    void refreshMentions(
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
    refreshCharacters,
    refreshMentions,
  ]);

  /*
   * ============================================================
   * BEFORE UNLOAD
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
   * CURSOR
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
      } =
        pendingSelectionRef.current;

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
            currentWordCount /
              200
          )
        ),
      [currentWordCount]
    );

  /*
   * ============================================================
   * CHARACTER UNTUK BUKU AKTIF
   * ============================================================
   */

  const activeBookCharacters =
    useMemo(() => {
      if (!selectedBookId) {
        return [];
      }

      return characters.filter(
        (character) =>
          character.bookIds?.includes(
            selectedBookId
          )
      );
    }, [
      characters,
      selectedBookId,
    ]);

  /*
   * ============================================================
   * MENTION OVERLAP
   * ============================================================
   */

  const isMentionOverlapping =
    useCallback(
      (
        start: number,
        end: number,
        ignoreMentionId?: string
      ) => {
        return mentions.some(
          (mention) => {
            if (
              ignoreMentionId &&
              mention.id ===
                ignoreMentionId
            ) {
              return false;
            }

            const mentionStart =
              mention.startOffset;

            const mentionEnd =
              mention.endOffset;

            if (
              mentionStart ===
                undefined ||
              mentionEnd ===
                undefined
            ) {
              return false;
            }

            return (
              start <
                mentionEnd &&
              end >
                mentionStart
            );
          }
        );
      },
      [mentions]
    );

  /*
   * ============================================================
   * RECONCILE MENTION OFFSET
   * ============================================================
   */

  const reconcileMentionsAfterTextChange =
    useCallback(
      async (
        oldText: string,
        newText: string
      ) => {
        if (!activeChapter) {
          return;
        }

        if (
          oldText === newText ||
          mentions.length === 0
        ) {
          return;
        }

        let prefixLength = 0;

        while (
          prefixLength <
            oldText.length &&
          prefixLength <
            newText.length &&
          oldText[
            prefixLength
          ] ===
            newText[
              prefixLength
            ]
        ) {
          prefixLength += 1;
        }

        let suffixLength = 0;

        while (
          suffixLength <
            oldText.length -
              prefixLength &&
          suffixLength <
            newText.length -
              prefixLength &&
          oldText[
            oldText.length -
              1 -
              suffixLength
          ] ===
            newText[
              newText.length -
                1 -
                suffixLength
            ]
        ) {
          suffixLength += 1;
        }

        const oldChangeEnd =
          oldText.length -
          suffixLength;

        const newChangeEnd =
          newText.length -
          suffixLength;

        const delta =
          newText.length -
          oldText.length;

        const isPureInsertion =
          prefixLength ===
          oldChangeEnd;

        for (
          const mention of mentions
        ) {
          const start =
            mention.startOffset;

          const end =
            mention.endOffset;

          if (
            start === undefined ||
            end === undefined
          ) {
            continue;
          }

          /*
           * Pure insertion.
           *
           * Teks yang berada sebelum
           * titik insertion tetap.
           *
           * Mention pada/setelah titik
           * insertion ikut bergeser.
           */
          if (isPureInsertion) {
            if (
              end <=
              prefixLength
            ) {
              continue;
            }

            if (
              start >=
              prefixLength
            ) {
              try {
                await editMention(
                  activeChapter.bookId,
                  activeChapter.id,
                  mention.id,
                  {
                    startOffset:
                      start +
                      delta,
                    endOffset:
                      end +
                      delta,
                  }
                );
              } catch (error) {
                console.error(
                  'Gagal menggeser character mention:',
                  error
                );
              }

              continue;
            }

            /*
             * Insertion berada di
             * tengah mention.
             *
             * Offset tidak lagi aman.
             */
            try {
              await removeMention(
                activeChapter.bookId,
                activeChapter.id,
                mention.id
              );
            } catch (error) {
              console.error(
                'Gagal menghapus character mention lama:',
                error
              );
            }

            continue;
          }

          /*
           * Mention sebelum perubahan.
           */
          if (
            end <=
            prefixLength
          ) {
            continue;
          }

          /*
           * Mention setelah perubahan.
           */
          if (
            start >=
            oldChangeEnd
          ) {
            try {
              await editMention(
                activeChapter.bookId,
                activeChapter.id,
                mention.id,
                {
                  startOffset:
                    start +
                    delta,
                  endOffset:
                    end +
                    delta,
                }
              );
            } catch (error) {
              console.error(
                'Gagal menggeser character mention:',
                error
              );
            }

            continue;
          }

          /*
           * Mention terkena replacement/
           * deletion.
           */
          try {
            await removeMention(
              activeChapter.bookId,
              activeChapter.id,
              mention.id
            );
          } catch (error) {
            console.error(
              'Gagal menghapus character mention lama:',
              error
            );
          }
        }

        await refreshMentions(
          activeChapter.bookId,
          activeChapter.id
        );

        void newChangeEnd;
      },
      [
        activeChapter,
        mentions,
        editMention,
        removeMention,
        refreshMentions,
      ]
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

      const previousContent =
        previousContentRef.current;

      setContent(val);

      contentRef.current =
        val;

      previousContentRef.current =
        val;

      saveStatusRef.current =
        'unsaved';

      setSaveStatus('unsaved');

      scheduleAutoSave();

      void reconcileMentionsAfterTextChange(
        previousContent,
        val
      );
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
          (e.ctrlKey ||
            e.metaKey) &&
          e.key.toLowerCase() ===
            's'
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

  const insertFormatting =
    (
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

      const previousContent =
        contentRef.current;

      setContent(newContent);

      contentRef.current =
        newContent;

      previousContentRef.current =
        newContent;

      saveStatusRef.current =
        'unsaved';

      setSaveStatus('unsaved');

      scheduleAutoSave();

      void reconcileMentionsAfterTextChange(
        previousContent,
        newContent
      );

      el.focus();
    };

  /*
   * ============================================================
   * CREATE CHARACTER MENTION
   * ============================================================
   */

  const handleCreateCharacterMention =
    useCallback(
      async (
        character: CharacterWiki,
        selectionStart: number,
        selectionEnd: number
      ) => {
        if (!activeChapter) {
          return;
        }

        const originalContent =
          contentRef.current;

        const safeStart = Math.max(
          0,
          Math.min(
            selectionStart,
            originalContent.length
          )
        );

        const safeEnd = Math.max(
          safeStart,
          Math.min(
            selectionEnd,
            originalContent.length
          )
        );

        const hasSelection =
          safeEnd > safeStart;

        const selectedText =
          originalContent.slice(
            safeStart,
            safeEnd
          );

        const displayText =
          hasSelection
            ? selectedText
            : character.fullName;

        if (
          !displayText.trim()
        ) {
          setMentionError(
            'Teks mention tidak boleh kosong.'
          );

          return;
        }

        let startOffset =
          safeStart;

        let endOffset =
          safeEnd;

        let nextContent =
          originalContent;

        if (!hasSelection) {
          startOffset =
            safeStart;

          endOffset =
            safeStart +
            character.fullName
              .length;

          nextContent =
            originalContent.slice(
              0,
              safeStart
            ) +
            character.fullName +
            originalContent.slice(
              safeStart
            );
        }

        if (
          isMentionOverlapping(
            startOffset,
            endOffset
          )
        ) {
          setMentionError(
            'Bagian teks tersebut sudah memiliki character mention.'
          );

          return;
        }

        setMentionError(null);

        setMentionOperationLoading(
          true
        );

        try {
          if (!hasSelection) {
            /*
             * Reconcile mention lama terlebih
             * dahulu karena kita menyisipkan
             * nama karakter ke content.
             */
            await reconcileMentionsAfterTextChange(
              originalContent,
              nextContent
            );

            setContent(
              nextContent
            );

            contentRef.current =
              nextContent;

            previousContentRef.current =
              nextContent;

            pendingSelectionRef.current =
              {
                start: endOffset,
                end: endOffset,
              };

            saveStatusRef.current =
              'unsaved';

            setSaveStatus(
              'unsaved'
            );
          }

          await addMention(
            activeChapter.bookId,
            activeChapter.id,
            {
              characterId:
                character.id,
              displayText,
              startOffset,
              endOffset,
            }
          );

          if (!hasSelection) {
            scheduleAutoSave();
          }

          await refreshMentions(
            activeChapter.bookId,
            activeChapter.id
          );
        } catch (error) {
          console.error(
            'Gagal membuat character mention:',
            error
          );

          if (!hasSelection) {
            /*
             * Rollback content.
             */
            setContent(
              originalContent
            );

            contentRef.current =
              originalContent;

            previousContentRef.current =
              originalContent;

            pendingSelectionRef.current =
              {
                start:
                  safeStart,
                end:
                  safeStart,
              };

            saveStatusRef.current =
              'unsaved';

            setSaveStatus(
              'unsaved'
            );

            /*
             * Kembalikan offset mention
             * lama jika tadi sempat digeser.
             */
            try {
              await reconcileMentionsAfterTextChange(
                nextContent,
                originalContent
              );
            } catch {
              // Error sudah dilaporkan oleh reconcile.
            }
          }

          setMentionError(
            error instanceof Error
              ? error.message
              : 'Gagal membuat character mention.'
          );
        } finally {
          setMentionOperationLoading(
            false
          );
        }
      },
      [
        activeChapter,
        addMention,
        isMentionOverlapping,
        reconcileMentionsAfterTextChange,
        scheduleAutoSave,
        refreshMentions,
      ]
    );

  /*
   * ============================================================
   * NAVIGATE TO MENTION
   * ============================================================
   */

  const handleNavigateToMention =
    useCallback(
      (
        mention: CharacterMention
      ) => {
        if (
          !textareaRef.current ||
          mention.startOffset ===
            undefined ||
          mention.endOffset ===
            undefined
        ) {
          return;
        }

        const textarea =
          textareaRef.current;

        const maxLength =
          contentRef.current.length;

        const start = Math.max(
          0,
          Math.min(
            mention.startOffset,
            maxLength
          )
        );

        const end = Math.max(
          start,
          Math.min(
            mention.endOffset,
            maxLength
          )
        );

        pendingSelectionRef.current =
          {
            start,
            end,
          };

        textarea.focus();

        requestAnimationFrame(() => {
          textarea.setSelectionRange(
            start,
            end
          );

          const lineHeight =
            parseFloat(
              getComputedStyle(
                textarea
              ).lineHeight
            ) || 32;

          const lineNumber =
            contentRef.current
              .slice(
                0,
                start
              )
              .split('\n')
              .length;

          const targetScrollTop =
            Math.max(
              0,
              (lineNumber - 3) *
                lineHeight
            );

          textarea.scrollTop =
            targetScrollTop;
        });
      },
      []
    );

  /*
   * ============================================================
   * REMOVE CHARACTER MENTION
   * ============================================================
   */

  const handleRemoveMention =
    useCallback(
      async (
        mention: CharacterMention
      ) => {
        if (!activeChapter) {
          return;
        }

        setMentionOperationLoading(
          true
        );

        setMentionError(null);

        try {
          await removeMention(
            activeChapter.bookId,
            activeChapter.id,
            mention.id
          );

          await refreshMentions(
            activeChapter.bookId,
            activeChapter.id
          );
        } catch (error) {
          console.error(
            'Gagal menghapus character mention:',
            error
          );

          setMentionError(
            error instanceof Error
              ? error.message
              : 'Gagal menghapus character mention.'
          );
        } finally {
          setMentionOperationLoading(
            false
          );
        }
      },
      [
        activeChapter,
        removeMention,
        refreshMentions,
      ]
    );

  /*
   * ============================================================
   * MENTION HIGHLIGHT
   * ============================================================
   */

  const mentionSegments =
    useMemo(() => {
      if (
        !content ||
        mentions.length === 0
      ) {
        return [
          {
            type: 'text' as const,
            value: content,
          },
        ];
      }

      const validMentions =
        mentions
          .filter(
            (mention) =>
              mention.startOffset !==
                undefined &&
              mention.endOffset !==
                undefined &&
              mention.startOffset >=
                0 &&
              mention.endOffset >
                mention.startOffset &&
              mention.startOffset <
                content.length
          )
          .map((mention) => ({
            mention,
            start:
              mention.startOffset!,
            end: Math.min(
              mention.endOffset!,
              content.length
            ),
          }))
          .sort(
            (a, b) =>
              a.start - b.start
          );

      if (
        validMentions.length ===
        0
      ) {
        return [
          {
            type: 'text' as const,
            value: content,
          },
        ];
      }

      const segments: Array<
        | {
            type: 'text';
            value: string;
          }
        | {
            type: 'mention';
            value: string;
            mention: CharacterMention;
          }
      > = [];

      let cursor = 0;

      for (const item of validMentions) {
        if (
          item.start < cursor
        ) {
          continue;
        }

        if (
          item.start > cursor
        ) {
          segments.push({
            type: 'text',
            value:
              content.slice(
                cursor,
                item.start
              ),
          });
        }

        segments.push({
          type: 'mention',
          value:
            content.slice(
              item.start,
              item.end
            ),
          mention:
            item.mention,
        });

        cursor = item.end;
      }

      if (
        cursor < content.length
      ) {
        segments.push({
          type: 'text',
          value:
            content.slice(cursor),
        });
      }

      return segments;
    }, [
      content,
      mentions,
    ]);

  const handleMentionHighlightScroll =
    useCallback(() => {
      if (
        !textareaRef.current ||
        !mentionHighlightRef.current
      ) {
        return;
      }

      if (
        mentionScrollSyncingRef.current
      ) {
        return;
      }

      mentionScrollSyncingRef.current =
        true;

      mentionHighlightRef.current.scrollTop =
        textareaRef.current.scrollTop;

      mentionHighlightRef.current.scrollLeft =
        textareaRef.current.scrollLeft;

      requestAnimationFrame(() => {
        mentionScrollSyncingRef.current =
          false;
      });
    }, []);

  /*
   * ============================================================
   * RESTORE SNAPSHOT
   * ============================================================
   */

  const handleRestoreSnapshot =
    async (
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

      if (
        autoSaveTimerRef.current
      ) {
        clearTimeout(
          autoSaveTimerRef.current
        );

        autoSaveTimerRef.current =
          null;
      }

      if (activeChapter) {
        try {
          const currentMentions =
            [...mentions];

          await Promise.all(
            currentMentions.map(
              (mention) =>
                removeMention(
                  activeChapter.bookId,
                  activeChapter.id,
                  mention.id
                )
            )
          );

          await refreshMentions(
            activeChapter.bookId,
            activeChapter.id
          );
        } catch (error) {
          console.error(
            'Gagal membersihkan character mention saat restore snapshot:',
            error
          );

          setMentionError(
            'Snapshot dipulihkan, tetapi sebagian character mention lama gagal dibersihkan.'
          );
        }
      }

      setContent(
        snap.content
      );

      setChapterTitle(
        snap.chapterTitle
      );

      contentRef.current =
        snap.content;

      previousContentRef.current =
        snap.content;

      chapterTitleRef.current =
        snap.chapterTitle;

      saveStatusRef.current =
        'unsaved';

      setSaveStatus('unsaved');

      pendingSelectionRef.current =
        {
          start: 0,
          end: 0,
        };

      void performSave(
        true,
        `Dipulihkan dari snapshot (${new Date(
          snap.timestamp
        ).toLocaleTimeString()})`,
        {
          content:
            snap.content,
          title:
            snap.chapterTitle,
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

  const handleExportText =
    (
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
          Belum ada proyek buku untuk
          ditulis.
        </h3>

        <p className="text-xs sm:text-sm text-[#9E9EB2] max-w-md mb-6 leading-relaxed">
          Sebelum menggunakan Studio
          Editor, buat buku cerita
          pertamamu di Workspace dan
          tambahkan bab naskah.
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
          Buku ini belum memiliki bab
          naskah.
        </h3>

        <p className="text-xs sm:text-sm text-[#9E9EB2] max-w-md leading-relaxed">
          Tambahkan bab baru dari
          Workspace untuk mulai menulis
          naskahmu di sini.
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
      {/* ======================================================
          BOOK / CHAPTER BAR
          ====================================================== */}

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
              {books.map((book) => (
                <option
                  key={book.id}
                  value={book.id}
                >
                  {book.title}
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
              {activeSnapshots.length})
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

      {/* ======================================================
          STATS
          ====================================================== */}

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
              {readingTimeMinutes}{' '}
              mnt
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

      {/* ======================================================
          TOOLBAR
          ====================================================== */}

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

          <span className="w-px h-5 bg-[#2A2A3C] mx-1" />

          <CharacterMentionPicker
            characters={
              activeBookCharacters
            }
            mentions={mentions}
            disabled={
              mentionOperationLoading
            }
            error={mentionError}
            onCreateMention={
              handleCreateCharacterMention
            }
          />

          <button
            type="button"
            onClick={() =>
              setIsMentionPanelOpen(
                (current) => !current
              )
            }
            className={`py-1 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isMentionPanelOpen
                ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30'
                : 'text-[#B0B0C4] hover:text-[#FAF7EE] hover:bg-[#2A2A3E]'
            }`}
            title="Tampilkan Character Mentions"
          >
            <PanelRight className="w-3.5 h-3.5" />

            <span>
              Mentions
            </span>

            {mentions.length >
              0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-[9px] font-mono flex items-center justify-center">
                {
                  mentions.length
                }
              </span>
            )}
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
                Number(
                  e.target.value
                )
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
                handleExportText(
                  'txt'
                )
              }
              className="p-1.5 hover:bg-[#2A2A3E] text-[#B0B0C4] hover:text-[#FAF7EE] rounded-lg text-xs transition-colors cursor-pointer"
              title="Unduh sebagai Naskah .txt"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================
          MENTION ERROR
          ====================================================== */}

      {mentionError && (
        <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center justify-between gap-3">
          <span>
            {mentionError}
          </span>

          <button
            type="button"
            onClick={() =>
              setMentionError(
                null
              )
            }
            className="text-red-300 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ======================================================
          EDITOR + CHARACTER MENTION PANEL
          ====================================================== */}

      <div
        className={`flex flex-col ${
          isMentionPanelOpen
            ? 'lg:flex-row'
            : ''
        } gap-4 items-stretch`}
      >
        {/* EDITOR CANVAS */}

        <div
          data-tour="editor-canvas-stage"
          className="relative flex flex-col flex-1 min-w-0 bg-[#1A1A28] border border-[#2A2A3C] rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-2xl min-h-[550px] overflow-hidden"
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

              setSaveStatus(
                'unsaved'
              );

              scheduleAutoSave();
            }}
            placeholder="Judul Bab..."
            className="font-editorial text-2xl sm:text-3xl font-bold text-[#FAF7EE] bg-transparent border-b border-[#2A2A3C] pb-3 mb-6 outline-none placeholder-[#55556C] focus:border-[#D4AF37] transition-colors shrink-0"
          />

          <div className="relative flex-1 min-h-[480px]">
            {/* ==================================================
                MENTION HIGHLIGHT LAYER
                ================================================== */}

            <div
              ref={
                mentionHighlightRef
              }
              aria-hidden="true"
              className="absolute inset-0 w-full min-h-[480px] overflow-hidden pointer-events-none whitespace-pre-wrap break-words"
              style={{
                fontFamily:
                  fontFamily ===
                  'serif'
                    ? "'Cinzel', serif, Georgia, 'Times New Roman'"
                    : fontFamily ===
                      'mono'
                    ? "'JetBrains Mono', monospace"
                    : "'Plus Jakarta Sans', sans-serif",
                fontSize: `${fontSize}px`,
                lineHeight:
                  lineSpacing,
                padding: 0,
              }}
            >
              {mentionSegments.map(
                (segment, index) => {
                  if (
                    segment.type ===
                    'mention'
                  ) {
                    const character =
                      activeBookCharacters.find(
                        (item) =>
                          item.id ===
                          segment
                            .mention
                            .characterId
                      );

                    return (
                      <span
                        key={`${segment.mention.id}-${index}`}
                        className="bg-[#D4AF37]/20 text-[#F3D77A] border-b border-[#D4AF37]/70 rounded-sm"
                        title={
                          character
                            ? `Character: ${character.fullName}`
                            : 'Character Mention'
                        }
                      >
                        {
                          segment.value
                        }
                      </span>
                    );
                  }

                  return (
                    <React.Fragment
                      key={`text-${index}`}
                    >
                      {
                        segment.value
                      }
                    </React.Fragment>
                  );
                }
              )}
            </div>

            {/* ==================================================
                REAL TEXTAREA
                ================================================== */}

            <textarea
              id="editor-manuscript-textarea"
              ref={textareaRef}
              value={content}
              onChange={
                handleContentChange
              }
              onScroll={
                handleMentionHighlightScroll
              }
              placeholder="Mulai tuliskan kisah petualangan, dialog menegangkan, atau monolog karaktermu di sini..."
              style={{
                fontFamily:
                  fontFamily ===
                  'serif'
                    ? "'Cinzel', serif, Georgia, 'Times New Roman'"
                    : fontFamily ===
                      'mono'
                    ? "'JetBrains Mono', monospace"
                    : "'Plus Jakarta Sans', sans-serif",
                fontSize: `${fontSize}px`,
                lineHeight:
                  lineSpacing,
              }}
              className="relative z-10 w-full h-full min-h-[480px] bg-transparent text-transparent caret-[#FAF7EE] outline-none resize-none placeholder-[#4E4E66] selection:bg-[#D4AF37]/40 selection:text-transparent"
              autoFocus
            />
          </div>
        </div>

        {/* ======================================================
            CHARACTER MENTION PANEL
            ====================================================== */}

        {isMentionPanelOpen && (
          <CharacterMentionPanel
            characters={
              activeBookCharacters
            }
            mentions={mentions}
            content={content}
            disabled={
              mentionOperationLoading
            }
            onNavigate={
              handleNavigateToMention
            }
            onRemove={
              handleRemoveMention
            }
            onClose={() =>
              setIsMentionPanelOpen(
                false
              )
            }
          />
        )}
      </div>

      {/* ======================================================
          HISTORY DRAWER
          ====================================================== */}

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
              Novel's Creator secara
              otomatis mengamankan snapshot
              naskahmu. Jika kamu salah
              menghapus teks, pulihkan versi
              sebelumnya dengan satu klik:
            </p>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {activeSnapshotsLoading ? (
                <div className="py-12 text-center text-[#6E6E85]">
                  <p className="text-xs animate-pulse">
                    Memuat riwayat draft...
                  </p>
                </div>
              ) : activeSnapshots.length ===
                0 ? (
                <div className="py-12 text-center text-[#6E6E85]">
                  <p className="text-xs">
                    Belum ada riwayat
                    snapshot untuk bab ini.
                  </p>
                </div>
              ) : (
                activeSnapshots.map(
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
                              minute:
                                '2-digit',
                              second:
                                '2-digit',
                            }
                          )}
                        </span>

                        <span className="text-[11px] text-[#8E8EA4] font-mono">
                          {
                            snap.wordCount
                          }{' '}
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
                          void handleRestoreSnapshot(
                            snap
                          )
                        }
                        className="w-full py-1.5 px-3 bg-[#242438] hover:bg-[#D4AF37] hover:text-[#121212] text-xs font-semibold text-[#FAF7EE] rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />

                        <span>
                          Pulihkan Versi
                          Ini
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

export default NovelEditorView;
