import React, { useState, useEffect, useRef } from 'react';
import { Book, Chapter, CharacterWiki, QuickNote } from '../../types';
import {
  Search,
  X,
  BookOpen,
  FileText,
  User,
  StickyNote,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  books: Book[];
  chapters: Chapter[];
  characters: CharacterWiki[];
  notes: QuickNote[];
  onClose: () => void;
  onSelectBook: (bookId: string) => void;
  onSelectChapter: (bookId: string, chapterId: string) => void;
  onSelectCharacter: (char: CharacterWiki) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  books,
  chapters,
  characters,
  notes,
  onClose,
  onSelectBook,
  onSelectChapter,
  onSelectCharacter,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Search Results
  const matchedBooks = q
    ? books.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.synopsis.toLowerCase().includes(q) ||
          b.genres.some((g) => g.toLowerCase().includes(q))
      )
    : [];

  const matchedChapters = q
    ? chapters.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.content.toLowerCase().includes(q)
      )
    : [];

  const matchedCharacters = q
    ? characters.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.alias.toLowerCase().includes(q) ||
          c.roleTag.toLowerCase().includes(q) ||
          c.backstory.toLowerCase().includes(q) ||
          c.physicalAppearance.toLowerCase().includes(q) ||
          c.personalityTraits.toLowerCase().includes(q) ||
          c.customAttributes.some(
            (a) =>
              a.key.toLowerCase().includes(q) || a.value.toLowerCase().includes(q)
          )
      )
    : [];

  const matchedNotes = q
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
      )
    : [];

  const totalResults =
    matchedBooks.length +
    matchedChapters.length +
    matchedCharacters.length +
    matchedNotes.length;

  return (
    <div
      id="global-search-modal-overlay"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#1E1E2E] border border-[#2A2A3C] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3 bg-[#181826] border-b border-[#2A2A3C]">
          <Search className="w-5 h-5 text-[#D4AF37] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari buku, bab naskah, karakter wiki, atau catatan kilat... (Esc untuk batal)"
            className="w-full bg-transparent text-sm text-[#FAF7EE] placeholder-[#6E6E85] outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#7E7E94] hover:text-[#FAF7EE] rounded-lg mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] text-[#6E6E85] font-mono border border-[#2A2A3C] px-1.5 py-0.5 rounded">
            ESC
          </span>
        </div>

        {/* Results Area */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {!query ? (
            <div className="py-12 text-center text-[#6E6E85] space-y-2">
              <Search className="w-8 h-8 mx-auto text-[#D4AF37]/40" />
              <p className="text-xs">
                Ketik nama buku, bab, tokoh, atribut khusus, atau isi catatan untuk mencari di seluruh database.
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-[#8E8EA4]">
              <p className="text-sm">Tidak ditemukan hasil untuk "{query}".</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Books */}
              {matchedBooks.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#D4AF37] mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Buku Proyek ({matchedBooks.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedBooks.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => {
                          onSelectBook(b.id);
                          onClose();
                        }}
                        className="w-full p-2.5 bg-[#161624] hover:bg-[#252538] border border-[#2A2A3C] rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-[#FAF7EE] group-hover:text-[#D4AF37]">
                            {b.title}
                          </div>
                          <div className="text-[11px] text-[#8E8EA4] line-clamp-1">
                            {b.synopsis || 'Tanpa sinopsis'}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#6E6E85] group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chapters */}
              {matchedChapters.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#D4AF37] mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Bab Naskah ({matchedChapters.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedChapters.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          onSelectChapter(c.bookId, c.id);
                          onClose();
                        }}
                        className="w-full p-2.5 bg-[#161624] hover:bg-[#252538] border border-[#2A2A3C] rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-[#FAF7EE] group-hover:text-[#D4AF37]">
                            Bab {c.chapterNumber}: {c.title}
                          </div>
                          <div className="text-[11px] text-[#8E8EA4] font-mono">
                            {c.wordCount} kata • Status: {c.status}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#6E6E85] group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Characters */}
              {matchedCharacters.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#D4AF37] mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Karakter Wiki ({matchedCharacters.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedCharacters.map((char) => (
                      <button
                        key={char.id}
                        onClick={() => {
                          onSelectCharacter(char);
                          onClose();
                        }}
                        className="w-full p-2.5 bg-[#161624] hover:bg-[#252538] border border-[#2A2A3C] rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full overflow-hidden bg-[#222234] border border-[#3A3A54] flex items-center justify-center shrink-0">
                            {char.avatarUrl ? (
                              <img
                                src={char.avatarUrl}
                                alt={char.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-[#FAF7EE] group-hover:text-[#D4AF37]">
                              {char.fullName}{' '}
                              {char.alias && (
                                <span className="text-[#8E8EA4] font-normal">
                                  ("{char.alias}")
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#D4AF37]">
                              {char.roleTag} • {char.status}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#6E6E85] group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {matchedNotes.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#D4AF37] mb-2 flex items-center gap-1.5">
                    <StickyNote className="w-3.5 h-3.5" />
                    <span>Catatan Kilat ({matchedNotes.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedNotes.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 bg-[#161624] border border-[#2A2A3C] rounded-xl text-left"
                      >
                        <div className="text-xs font-semibold text-[#FAF7EE]">
                          {n.title}
                        </div>
                        <div className="text-[11px] text-[#8E8EA4] line-clamp-2 mt-0.5">
                          {n.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
