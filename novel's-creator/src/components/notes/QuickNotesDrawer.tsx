import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  QuickNote,
  Book,
  Chapter,
  CharacterWiki,
  NoteCategory,
  NoteScope,
} from "../../types";

import {
  StickyNote,
  X,
  Plus,
  Pin,
  Trash2,
  Copy,
  Check,
  Search,
  Pencil,
  RefreshCw,
  BookOpen,
  FileText,
  User,
} from "lucide-react";

/* =========================================================
 * PROPS
 * ========================================================= */

interface QuickNotesDrawerProps {
  isOpen: boolean;

  notes: QuickNote[];

  books: Book[];

  chapters: Chapter[];

  characters: CharacterWiki[];

  /**
   * Note ID yang harus difokuskan.
   *
   * Digunakan ketika note dibuka dari Global Search.
   */
  focusNoteId?: string | null;

  /**
   * Dipanggil setelah drawer selesai
   * memproses focusNoteId.
   */
  onFocusHandled?: () => void;

  onClose: () => void;

  onSaveNote: (
    note: QuickNote
  ) => Promise<void> | void;

  onDeleteNote: (
    noteId: string
  ) => Promise<void> | void;
}

/* =========================================================
 * CONSTANTS
 * ========================================================= */

const COLOR_OPTIONS: {
  label: string;
  value: string;
  border: string;
}[] = [
  {
    label: "Gold",
    value: "#D4AF37",
    border: "#B89225",
  },
  {
    label: "Crimson",
    value: "#E63946",
    border: "#C52233",
  },
  {
    label: "Purple",
    value: "#9D4EDD",
    border: "#7B2CBF",
  },
  {
    label: "Emerald",
    value: "#2A9D8F",
    border: "#21867A",
  },
  {
    label: "Cyan",
    value: "#4EA8DE",
    border: "#0077B6",
  },
  {
    label: "Slate",
    value: "#4A4E69",
    border: "#22223B",
  },
];

const NOTE_CATEGORIES: NoteCategory[] = [
  "Ide Spontan",
  "Dialog Draft",
  "Plot Hole",
  "Worldbuilding",
  "Lainnya",
];

const NOTE_SCOPES: {
  value: NoteScope;
  label: string;
}[] = [
  {
    value: "other",
    label: "Tidak dikaitkan",
  },
  {
    value: "book",
    label: "Buku",
  },
  {
    value: "chapter",
    label: "Chapter",
  },
  {
    value: "character",
    label: "Character",
  },
];

/* =========================================================
 * HELPERS
 * ========================================================= */

function getNoteScope(
  note: QuickNote
): NoteScope {
  if (note.noteScope) {
    return note.noteScope;
  }

  if (note.bookId) {
    return "book";
  }

  if (note.chapterId) {
    return "chapter";
  }

  if (note.characterId) {
    return "character";
  }

  return "other";
}

/* =========================================================
 * COMPONENT
 * ========================================================= */

export const QuickNotesDrawer: React.FC<
  QuickNotesDrawerProps
> = ({
  isOpen,
  notes,
  books,
  chapters,
  characters,
  focusNoteId,
  onFocusHandled,
  onClose,
  onSaveNote,
  onDeleteNote,
}) => {
  /* =======================================================
   * SEARCH
   * ======================================================= */

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  /* =======================================================
   * CREATE / EDIT
   * ======================================================= */

  const [
    isCreating,
    setIsCreating,
  ] = useState(false);

  const [
    editingNoteId,
    setEditingNoteId,
  ] = useState<string | null>(
    null
  );

  const [
    newTitle,
    setNewTitle,
  ] = useState("");

  const [
    newContent,
    setNewContent,
  ] = useState("");

  const [
    newCategory,
    setNewCategory,
  ] = useState<NoteCategory>(
    "Ide Spontan"
  );

  const [
    newScope,
    setNewScope,
  ] = useState<NoteScope>(
    "other"
  );

  const [
    newBookId,
    setNewBookId,
  ] = useState("");

  const [
    newChapterId,
    setNewChapterId,
  ] = useState("");

  const [
    newCharacterId,
    setNewCharacterId,
  ] = useState("");

  const [
    newColor,
    setNewColor,
  ] = useState("#D4AF37");

  const [
    formError,
    setFormError,
  ] = useState("");

  /* =======================================================
   * UI STATE
   * ======================================================= */

  const [
    copiedId,
    setCopiedId,
  ] = useState<string | null>(
    null
  );

  const [
    savingId,
    setSavingId,
  ] = useState<string | null>(
    null
  );

  const [
    highlightedNoteId,
    setHighlightedNoteId,
  ] = useState<string | null>(
    null
  );

  const noteRefs =
    useRef<
      Record<
        string,
        HTMLDivElement | null
      >
    >({});

  /* =======================================================
   * CHAPTER OPTIONS
   * ======================================================= */

  const chapterOptions =
    useMemo(() => {
      return [...chapters].sort(
        (a, b) => {
          if (
            a.bookId ===
            b.bookId
          ) {
            return (
              a.order -
              b.order
            );
          }

          return a.bookId.localeCompare(
            b.bookId
          );
        }
      );
    }, [chapters]);

  /* =======================================================
   * RESET FORM
   * ======================================================= */

  const resetForm = () => {
    setNewTitle("");
    setNewContent("");

    setNewCategory(
      "Ide Spontan"
    );

    setNewScope(
      "other"
    );

    setNewBookId("");
    setNewChapterId("");
    setNewCharacterId("");

    setNewColor(
      "#D4AF37"
    );

    setEditingNoteId(
      null
    );

    setIsCreating(
      false
    );

    setFormError("");
  };

  /* =======================================================
   * GLOBAL SEARCH FOCUS
   * ======================================================= */

  useEffect(() => {
    if (
      !isOpen ||
      !focusNoteId
    ) {
      return;
    }

    const frame =
      window.requestAnimationFrame(
        () => {
          const element =
            noteRefs.current[
              focusNoteId
            ];

          if (element) {
            element.scrollIntoView({
              behavior:
                "smooth",
              block: "center",
            });

            setHighlightedNoteId(
              focusNoteId
            );

            window.setTimeout(
              () => {
                setHighlightedNoteId(
                  null
                );
              },
              2200
            );
          }

          onFocusHandled?.();
        }
      );

    return () => {
      window.cancelAnimationFrame(
        frame
      );
    };
  }, [
    isOpen,
    focusNoteId,
    onFocusHandled,
  ]);

  /* =======================================================
   * VALIDATION
   * ======================================================= */

  const validateContext =
    (): boolean => {
      if (
        newScope ===
        "book" &&
        !newBookId
      ) {
        setFormError(
          "Silakan pilih buku."
        );

        return false;
      }

      if (
        newScope ===
        "chapter" &&
        !newChapterId
      ) {
        setFormError(
          "Silakan pilih chapter."
        );

        return false;
      }

      if (
        newScope ===
        "character" &&
        !newCharacterId
      ) {
        setFormError(
          "Silakan pilih character."
        );

        return false;
      }

      setFormError("");

      return true;
    };

  /* =======================================================
   * ADD NOTE
   * ======================================================= */

  const handleAddNote =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      if (
        !newContent.trim() &&
        !newTitle.trim()
      ) {
        return;
      }

      if (!validateContext()) {
        return;
      }

      const now =
        Date.now();

      const note: QuickNote = {
        id: "",

        title:
          newTitle.trim() ||
          "Catatan Kilat",

        content:
          newContent.trim(),

        category:
          newCategory,

        noteScope:
          newScope,

        bookId:
          newScope === "book"
            ? newBookId
            : undefined,

        chapterId:
          newScope ===
          "chapter"
            ? newChapterId
            : undefined,

        characterId:
          newScope ===
          "character"
            ? newCharacterId
            : undefined,

        colorTag:
          newColor,

        isPinned:
          false,

        createdAt:
          now,

        updatedAt:
          now,
      };

      setSavingId(
        "new"
      );

      try {
        await onSaveNote(
          note
        );

        resetForm();
      } finally {
        setSavingId(
          null
        );
      }
    };

  /* =======================================================
   * START EDIT
   * ======================================================= */

  const handleStartEdit =
    (
      note: QuickNote
    ) => {
      setEditingNoteId(
        note.id
      );

      setNewTitle(
        note.title
      );

      setNewContent(
        note.content
      );

      setNewCategory(
        note.category
      );

      const scope =
        getNoteScope(
          note
        );

      setNewScope(
        scope
      );

      setNewBookId(
        note.bookId ??
          ""
      );

      setNewChapterId(
        note.chapterId ??
          ""
      );

      setNewCharacterId(
        note.characterId ??
          ""
      );

      setNewColor(
        note.colorTag ||
          "#D4AF37"
      );

      setFormError("");

      setIsCreating(
        false
      );
    };

  /* =======================================================
   * SAVE EDIT
   * ======================================================= */

  const handleSaveEdit =
    async (
      e: React.FormEvent,
      note: QuickNote
    ) => {
      e.preventDefault();

      if (
        !newContent.trim() &&
        !newTitle.trim()
      ) {
        return;
      }

      if (!validateContext()) {
        return;
      }

      setSavingId(
        note.id
      );

      try {
        await onSaveNote({
          ...note,

          title:
            newTitle.trim() ||
            "Catatan Kilat",

          content:
            newContent.trim(),

          category:
            newCategory,

          noteScope:
            newScope,

          bookId:
            newScope ===
            "book"
              ? newBookId
              : undefined,

          chapterId:
            newScope ===
            "chapter"
              ? newChapterId
              : undefined,

          characterId:
            newScope ===
            "character"
              ? newCharacterId
              : undefined,

          colorTag:
            newColor,

          updatedAt:
            Date.now(),
        });

        resetForm();
      } finally {
        setSavingId(
          null
        );
      }
    };

  /* =======================================================
   * TOGGLE PIN
   * ======================================================= */

  const handleTogglePin =
    async (
      note: QuickNote
    ) => {
      setSavingId(
        note.id
      );

      try {
        await onSaveNote({
          ...note,

          updatedAt:
            Date.now(),

          isPinned:
            !note.isPinned,
        });
      } finally {
        setSavingId(
          null
        );
      }
    };

  /* =======================================================
   * COPY
   * ======================================================= */

  const handleCopyNote =
    (
      note: QuickNote
    ) => {
      void navigator.clipboard.writeText(
        `${note.title}\n\n${note.content}`
      );

      setCopiedId(
        note.id
      );

      window.setTimeout(
        () =>
          setCopiedId(
            null
          ),
        2000
      );
    };

  /* =======================================================
   * DELETE
   * ======================================================= */

  const handleDelete =
    async (
      noteId: string
    ) => {
      setSavingId(
        noteId
      );

      try {
        await onDeleteNote(
          noteId
        );

        if (
          editingNoteId ===
          noteId
        ) {
          resetForm();
        }
      } finally {
        setSavingId(
          null
        );
      }
    };

  /* =======================================================
   * FILTER
   * ======================================================= */

  const filteredNotes =
    [...notes]
      .filter(
        (note) => {
          const query =
            searchQuery
              .toLowerCase()
              .trim();

          if (!query) {
            return true;
          }

          return (
            note.title
              .toLowerCase()
              .includes(query) ||
            note.content
              .toLowerCase()
              .includes(query)
          );
        }
      )
      .sort(
        (a, b) => {
          if (
            a.isPinned &&
            !b.isPinned
          ) {
            return -1;
          }

          if (
            !a.isPinned &&
            b.isPinned
          ) {
            return 1;
          }

          return (
            b.createdAt -
            a.createdAt
          );
        }
      );

  /* =======================================================
   * CONTEXT LABEL
   * ======================================================= */

  const getContextLabel =
    (
      note: QuickNote
    ): string => {
      const scope =
        getNoteScope(
          note
        );

      if (
        scope === "book"
      ) {
        const book =
          books.find(
            (item) =>
              item.id ===
              note.bookId
          );

        return book
          ? `Buku: ${book.title}`
          : "Buku";
      }

      if (
        scope ===
        "chapter"
      ) {
        const chapter =
          chapters.find(
            (item) =>
              item.id ===
              note.chapterId
          );

        if (!chapter) {
          return "Chapter";
        }

        const book =
          books.find(
            (item) =>
              item.id ===
              chapter.bookId
          );

        return book
          ? `${book.title} • Bab ${chapter.chapterNumber}: ${chapter.title}`
          : `Bab ${chapter.chapterNumber}: ${chapter.title}`;
      }

      if (
        scope ===
        "character"
      ) {
        const character =
          characters.find(
            (item) =>
              item.id ===
              note.characterId
          );

        return character
          ? `Character: ${character.fullName}`
          : "Character";
      }

      return "Standalone";
    };

  /* =======================================================
   * RENDER
   * ======================================================= */

  if (!isOpen) {
    return null;
  }

  return (
    <div
      id="quick-notes-drawer-overlay"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs"
    >
      <div className="w-full max-w-md bg-[#1E1E2E] border-l border-[#2A2A3C] h-full p-5 sm:p-6 flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">

        {/* =================================================
         * HEADER
         * ================================================= */}

        <div className="flex items-center justify-between pb-4 border-b border-[#2A2A3C] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#252538] rounded-xl border border-[#D4AF37]/30 text-[#D4AF37]">
              <StickyNote className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-editorial text-lg font-bold text-[#FAF7EE]">
                Catatan Kilat Penulis
              </h3>

              <p className="text-[11px] text-[#8E8EA4]">
                Tampung ide mendadak,
                fragmen dialog, atau
                lore rahasia
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="p-1.5 text-[#7E7E94] hover:text-[#FAF7EE] hover:bg-[#252538] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* =================================================
         * SEARCH
         * ================================================= */}

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6E85]" />

              <input
                type="text"
                value={
                  searchQuery
                }
                onChange={(
                  e
                ) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                placeholder="Cari catatan..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#141420] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs text-[#FAF7EE] outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                if (
                  editingNoteId
                ) {
                  resetForm();

                  return;
                }

                setIsCreating(
                  (
                    previous
                  ) =>
                    !previous
                );

                setFormError("");
              }}
              className="py-1.5 px-3 bg-linear-to-r from-[#D4AF37] to-[#B89225] hover:from-[#E2BE4B] text-[#121212] font-semibold text-xs rounded-xl flex items-center gap-1 shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />

              <span>
                {isCreating ||
                editingNoteId
                  ? "Tutup"
                  : "Catatan Baru"}
              </span>
            </button>
          </div>

          {/* =================================================
           * CREATE / EDIT
           * ================================================= */}

          {(isCreating ||
            editingNoteId) && (
            <form
              onSubmit={(
                e
              ) => {
                if (
                  editingNoteId
                ) {
                  const note =
                    notes.find(
                      (
                        item
                      ) =>
                        item.id ===
                        editingNoteId
                    );

                  if (
                    note
                  ) {
                    void handleSaveEdit(
                      e,
                      note
                    );
                  }

                  return;
                }

                void handleAddNote(
                  e
                );
              }}
              className="p-3.5 bg-[#161624] border border-[#D4AF37]/50 rounded-2xl space-y-3 shadow-lg animate-in fade-in duration-150"
            >
              {/* TITLE */}

              <input
                type="text"
                value={
                  newTitle
                }
                onChange={(
                  e
                ) =>
                  setNewTitle(
                    e.target.value
                  )
                }
                placeholder="Judul Ide / Topik..."
                className="w-full px-3 py-1.5 bg-[#1E1E2E] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-lg text-xs font-semibold text-[#FAF7EE] outline-none"
                autoFocus
              />

              {/* CONTENT */}

              <textarea
                value={
                  newContent
                }
                onChange={(
                  e
                ) =>
                  setNewContent(
                    e.target.value
                  )
                }
                rows={3}
                placeholder="Tuliskan gagasan cerita mendadak, kutipan dialog, atau plot twist..."
                className="w-full px-3 py-2 bg-[#1E1E2E] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-lg text-xs text-[#FAF7EE] outline-none resize-none"
              />

              {/* CATEGORY */}

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#8E8EA4] mb-1.5">
                  Kategori
                </label>

                <select
                  value={
                    newCategory
                  }
                  onChange={(
                    e
                  ) =>
                    setNewCategory(
                      e.target
                        .value as NoteCategory
                    )
                  }
                  className="w-full px-3 py-2 bg-[#1E1E2E] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-lg text-xs text-[#FAF7EE] outline-none"
                >
                  {NOTE_CATEGORIES.map(
                    (
                      category
                    ) => (
                      <option
                        key={
                          category
                        }
                        value={
                          category
                        }
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* CONTEXT */}

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#8E8EA4] mb-1.5">
                  Konteks
                </label>

                <select
                  value={
                    newScope
                  }
                  onChange={(
                    e
                  ) => {
                    const scope =
                      e.target
                        .value as NoteScope;

                    setNewScope(
                      scope
                    );

                    if (
                      scope !==
                      "book"
                    ) {
                      setNewBookId(
                        ""
                      );
                    }

                    if (
                      scope !==
                      "chapter"
                    ) {
                      setNewChapterId(
                        ""
                      );
                    }

                    if (
                      scope !==
                      "character"
                    ) {
                      setNewCharacterId(
                        ""
                      );
                    }

                    setFormError(
                      ""
                    );
                  }}
                  className="w-full px-3 py-2 bg-[#1E1E2E] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-lg text-xs text-[#FAF7EE] outline-none"
                >
                  {NOTE_SCOPES.map(
                    (
                      scope
                    ) => (
                      <option
                        key={
                          scope.value
                        }
                        value={
                          scope.value
                        }
                      >
                        {scope.label}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* BOOK CONTEXT */}

              {newScope ===
                "book" && (
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#8E8EA4] mb-1.5">
                    Pilih Buku
                  </label>

                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6E6E85]" />

                    <select
                      value={
                        newBookId
                      }
                      onChange={(
                        e
                      ) =>
                        setNewBookId(
                          e.target
                            .value
                        )
                      }
                      className="w-full pl-9 pr-3 py-2 bg-[#1E1E2E] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-lg text-xs text-[#FAF7EE] outline-none"
                    >
                      <option value="">
                        Pilih buku...
                      </option>

                      {books.map(
                        (
                          book
                        ) => (
                          <option
                            key={
                              book.id
                            }
                            value={
                              book.id
                            }
                          >
                            {
                              book.title
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              )}

              {/* CHAPTER CONTEXT */}

              {newScope ===
                "chapter" && (
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#8E8EA4] mb-1.5">
                    Pilih Chapter
                  </label>

                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6E6E85]" />

                    <select
                      value={
                        newChapterId
                      }
                      onChange={(
                        e
                      ) =>
                        setNewChapterId(
                          e.target
                            .value
                        )
                      }
                      className="w-full pl-9 pr-3 py-2 bg-[#1E1E2E] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-lg text-xs text-[#FAF7EE] outline-none"
                    >
                      <option value="">
                        Pilih chapter...
                      </option>

                      {chapterOptions.map(
                        (
                          chapter
                        ) => {
                          const book =
                            books.find(
                              (
                                item
                              ) =>
                                item.id ===
                                chapter.bookId
                            );

                          return (
                            <option
                              key={
                                chapter.id
                              }
                              value={
                                chapter.id
                              }
                            >
                              {book
                                ? `${book.title} — `
                                : ""}
                              Bab{" "}
                              {
                                chapter.chapterNumber
                              }
                              :{" "}
                              {
                                chapter.title
                              }
                            </option>
                          );
                        }
                      )}
                    </select>
                  </div>
                </div>
              )}

              {/* CHARACTER CONTEXT */}

              {newScope ===
                "character" && (
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#8E8EA4] mb-1.5">
                    Pilih Character
                  </label>

                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6E6E85]" />

                    <select
                      value={
                        newCharacterId
                      }
                      onChange={(
                        e
                      ) =>
                        setNewCharacterId(
                          e.target
                            .value
                        )
                      }
                      className="w-full pl-9 pr-3 py-2 bg-[#1E1E2E] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-lg text-xs text-[#FAF7EE] outline-none"
                    >
                      <option value="">
                        Pilih character...
                      </option>

                      {characters.map(
                        (
                          character
                        ) => (
                          <option
                            key={
                              character.id
                            }
                            value={
                              character.id
                            }
                          >
                            {
                              character.fullName
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              )}

              {/* ERROR */}

              {formError && (
                <p className="text-[10px] text-red-400">
                  {formError}
                </p>
              )}

              {/* COLOR + SAVE */}

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  {COLOR_OPTIONS.map(
                    (
                      color
                    ) => (
                      <button
                        key={
                          color.value
                        }
                        type="button"
                        onClick={() =>
                          setNewColor(
                            color.value
                          )
                        }
                        style={{
                          backgroundColor:
                            color.value,
                        }}
                        className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                          newColor ===
                          color.value
                            ? "scale-125 border-white shadow-md"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                        title={
                          color.label
                        }
                      />
                    )
                  )}
                </div>

                <button
                  type="submit"
                  disabled={
                    savingId !==
                    null
                  }
                  className="py-1.5 px-3 bg-[#D4AF37] disabled:opacity-50 text-[#121212] font-semibold text-xs rounded-lg shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                >
                  {savingId !==
                    null && (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  )}

                  <span>
                    {editingNoteId
                      ? "Simpan Perubahan"
                      : "Simpan Catatan"}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* =================================================
         * NOTES LIST
         * ================================================= */}

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {notes.length ===
          0 ? (
            <div
              id="empty-notes-state"
              className="py-16 text-center border-2 border-dashed border-[#2A2A3C] rounded-2xl bg-[#161624] px-4"
            >
              <StickyNote className="w-8 h-8 mx-auto mb-2 text-[#D4AF37]/50" />

              <h4 className="font-editorial text-sm font-bold text-[#FAF7EE] mb-1">
                Belum ada catatan kilat.
              </h4>

              <p className="text-xs text-[#8E8EA4]">
                Gunakan fitur ini
                untuk menuliskan
                inspirasi liar di
                tengah proses
                menulis.
              </p>
            </div>
          ) : filteredNotes.length ===
            0 ? (
            <div className="py-8 text-center text-[#8E8EA4] text-xs">
              Tidak ada catatan
              yang cocok dengan "
              {searchQuery}".
            </div>
          ) : (
            filteredNotes.map(
              (
                note
              ) => (
                <div
                  key={
                    note.id
                  }
                  ref={(
                    element
                  ) => {
                    noteRefs.current[
                      note.id
                    ] =
                      element;
                  }}
                  style={{
                    borderLeftColor:
                      note.colorTag ||
                      "#D4AF37",
                  }}
                  className={`p-3.5 bg-[#161624] border border-[#2A2A3C] border-l-4 rounded-xl space-y-2 shadow-sm relative group transition-all duration-300 ${
                    highlightedNoteId ===
                    note.id
                      ? "ring-2 ring-[#D4AF37]/70 bg-[#24243A] scale-[1.01]"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#FAF7EE]">
                        {
                          note.title
                        }
                      </h4>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#252538] text-[#D4AF37] border border-[#2A2A3C]">
                          {
                            note.category
                          }
                        </span>

                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#20202E] text-[#8E8EA4] border border-[#2A2A3C]">
                          {
                            getContextLabel(
                              note
                            )
                          }
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* EDIT */}

                      <button
                        type="button"
                        onClick={() =>
                          handleStartEdit(
                            note
                          )
                        }
                        disabled={
                          savingId !==
                          null
                        }
                        className="p-1 text-[#6E6E85] hover:text-[#FAF7EE] rounded-md text-xs transition-colors cursor-pointer disabled:opacity-30"
                        title="Edit Catatan"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* PIN */}

                      <button
                        type="button"
                        onClick={() =>
                          void handleTogglePin(
                            note
                          )
                        }
                        disabled={
                          savingId !==
                          null
                        }
                        className={`p-1 rounded-md text-xs transition-colors cursor-pointer disabled:opacity-30 ${
                          note.isPinned
                            ? "text-[#D4AF37] bg-[#28283C]"
                            : "text-[#6E6E85] hover:text-[#FAF7EE]"
                        }`}
                        title={
                          note.isPinned
                            ? "Lepas Pin"
                            : "Sematkan ke Atas"
                        }
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      {/* COPY */}

                      <button
                        type="button"
                        onClick={() =>
                          handleCopyNote(
                            note
                          )
                        }
                        className="p-1 text-[#6E6E85] hover:text-[#FAF7EE] rounded-md text-xs transition-colors cursor-pointer"
                        title="Salin Catatan"
                      >
                        {copiedId ===
                        note.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() =>
                          void handleDelete(
                            note.id
                          )
                        }
                        disabled={
                          savingId !==
                          null
                        }
                        className="p-1 text-[#6E6E85] hover:text-red-400 rounded-md text-xs transition-colors cursor-pointer disabled:opacity-30"
                        title="Hapus Catatan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#B0B0C4] whitespace-pre-line leading-relaxed">
                    {
                      note.content
                    }
                  </p>

                  <div className="text-[10px] text-[#6E6E85] font-mono pt-1">
                    {new Date(
                      note.createdAt
                    ).toLocaleDateString(
                      [],
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
};
