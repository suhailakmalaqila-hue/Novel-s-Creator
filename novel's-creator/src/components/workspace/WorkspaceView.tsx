import React, { useState } from 'react';
import { Book, Chapter, UserAuthorProfile } from '../../types';
import { BookModal } from './BookModal';
import { ChapterModal } from './ChapterModal';
import {
  Plus,
  BookOpen,
  FolderPlus,
  FileText,
  Trash2,
  Edit3,
  Search,
  Tag,
  Target,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  BarChart3,
  SlidersHorizontal,
} from 'lucide-react';

interface WorkspaceViewProps {
  books: Book[];
  chapters: Chapter[];
  customGenres: string[];
  userProfile: UserAuthorProfile | null;
  onSaveBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
  onSaveChapter: (chapter: Chapter) => void;
  onDeleteChapter: (chapterId: string) => void;
  onAddCustomGenre: (genre: string) => void;
  onOpenEditor: (bookId: string, chapterId?: string) => void;
  onOpenCharactersWiki: () => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  books,
  chapters,
  customGenres,
  userProfile,
  onSaveBook,
  onDeleteBook,
  onSaveChapter,
  onDeleteChapter,
  onAddCustomGenre,
  onOpenEditor,
  onOpenCharactersWiki,
}) => {
  // Selected Book for Detailed Chapter View
  const [activeBookId, setActiveBookId] = useState<string | null>(null);

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmType, setDeleteConfirmType] = useState<'book' | 'chapter'>('book');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const activeBook = books.find((b) => b.id === activeBookId) || null;
  const activeBookChapters = activeBookId
    ? chapters.filter((c) => c.bookId === activeBookId).sort((a, b) => a.order - b.order)
    : [];

  // Filtered books
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.synopsis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGenre =
      selectedGenreFilter === 'all' || book.genres.includes(selectedGenreFilter);

    const matchesStatus =
      statusFilter === 'all' || book.status === statusFilter;

    return matchesSearch && matchesGenre && matchesStatus;
  });

  // Calculate overall stats
  const totalBooksCount = books.length;
  const totalChaptersCount = chapters.length;
  const totalWordsWritten = books.reduce((acc, b) => acc + (b.currentWordCount || 0), 0);

  const handleOpenNewBookModal = () => {
    setEditingBook(null);
    setIsBookModalOpen(true);
  };

  const handleOpenEditBookModal = (book: Book, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBook(book);
    setIsBookModalOpen(true);
  };

  const handleOpenNewChapterModal = () => {
    if (!activeBookId) return;
    setEditingChapter(null);
    setIsChapterModalOpen(true);
  };

  const handleOpenEditChapterModal = (chapter: Chapter, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChapter(chapter);
    setIsChapterModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmId) return;
    if (deleteConfirmType === 'book') {
      onDeleteBook(deleteConfirmId);
      if (activeBookId === deleteConfirmId) {
        setActiveBookId(null);
      }
    } else {
      onDeleteChapter(deleteConfirmId);
    }
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-8">
      {/* Top Bold Typography Header */}
      <header className="mb-2 sm:mb-4" data-tour="workspace-dashboard">
        <div className="text-[#D4AF37] text-xs sm:text-sm uppercase tracking-[0.3em] font-bold mb-2 flex items-center gap-2">
          <span>Studio Utama</span>
          <span className="w-8 h-px bg-[#D4AF37]/40" />
          <span className="text-[10px] font-mono text-[#8E8EA4] tracking-normal">
            ({totalBooksCount} Proyek Aktif)
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light italic leading-tight text-[#FAF7EE]">
              Manajemen Cerita
            </h2>
            <p className="text-xs sm:text-sm text-[#9E9EB2] mt-1.5 uppercase tracking-widest font-medium">
              Arsip naskah novel, bab cerita, dan target produktivitas studio
            </p>
          </div>

          <button
            id="btn-create-new-book"
            data-tour="create-book"
            onClick={handleOpenNewBookModal}
            className="bg-[#D4AF37] text-[#121212] px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.25)] shrink-0 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Buku Baru</span>
          </button>
        </div>
      </header>

      {/* Workspace Quick Stats & Target Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-tour="writing-progress">
        <div className="bg-[#181826] border border-[#2A2A3C] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">
              Total Buku Proyek
            </div>
            <div className="text-2xl sm:text-3xl font-serif italic text-[#FAF7EE] mt-1">
              {totalBooksCount} <span className="text-xs font-sans not-italic text-[#8E8EA4]">Buku</span>
            </div>
          </div>
          <div className="p-3 bg-[#1E1E2E] text-[#D4AF37] rounded-xl border border-[#2A2A3C]">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#181826] border border-[#2A2A3C] p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">
              Total Bab Naskah
            </div>
            <div className="text-2xl sm:text-3xl font-serif italic text-[#FAF7EE] mt-1">
              {totalChaptersCount} <span className="text-xs font-sans not-italic text-[#8E8EA4]">Bab</span>
            </div>
          </div>
          <div className="p-3 bg-[#1E1E2E] text-[#D4AF37] rounded-xl border border-[#2A2A3C]">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">
              Target Menulis Studio
            </div>
            <div className="text-2xl sm:text-3xl font-serif italic text-[#FAF7EE] mt-1">
              {totalWordsWritten.toLocaleString()}{' '}
              <span className="text-xs font-sans not-italic text-[#8E8EA4]">Kata</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37] flex items-center justify-center font-bold text-xs font-mono text-[#D4AF37] bg-[#1E1E2E] shadow-sm">
            {books.length > 0
              ? `${Math.min(
                  100,
                  Math.round(
                    (totalWordsWritten /
                      (books.reduce((acc, b) => acc + (b.targetWordCount || 50000), 0) || 1)) *
                      100
                  )
                )}%`
              : '0%'}
          </div>
        </div>
      </div>

      {/* IF A BOOK IS SELECTED: DETAILED CHAPTER WORKBENCH */}
      {activeBook ? (
        <div className="space-y-4">
          {/* Back to all books breadcrumb */}
          <button
            onClick={() => setActiveBookId(null)}
            className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>&larr; Kembali ke Semua Buku</span>
          </button>

          {/* Book Banner & Chapter Control */}
          <div className="bg-[#1E1E2E] border border-[#2A2A3C] rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Cover */}
              <div className="w-32 h-44 sm:w-36 sm:h-48 rounded-xl overflow-hidden bg-[#161624] border border-[#303048] shrink-0 shadow-md">
                {activeBook.coverUrl ? (
                  <img
                    src={activeBook.coverUrl}
                    alt={activeBook.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center text-[#6E6E85]">
                    <BookOpen className="w-8 h-8 mb-1 text-[#D4AF37]/50" />
                    <span className="text-[10px] text-[#A0A0B5]">Tanpa Sampul</span>
                  </div>
                )}
              </div>

              {/* Book Details */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]">
                      {activeBook.status === 'completed'
                        ? 'Selesai'
                        : activeBook.status === 'draft'
                        ? 'Draft Awal'
                        : activeBook.status === 'hiatus'
                        ? 'Hiatus'
                        : 'Ongoing'}
                    </span>
                    <span className="text-xs text-[#8E8EA4] font-mono">
                      {activeBookChapters.length} Bab
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleOpenEditBookModal(activeBook, e)}
                      className="p-2 bg-[#26263A] hover:bg-[#32324C] text-[#C8C8DC] hover:text-[#FAF7EE] rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Buku</span>
                    </button>
                    <button
                      onClick={() => {
                        setDeleteConfirmType('book');
                        setDeleteConfirmId(activeBook.id);
                      }}
                      className="p-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>

                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#FAF7EE]">
                  {activeBook.title}
                </h2>

                <p className="text-xs sm:text-sm text-[#B0B0C4] leading-relaxed">
                  {activeBook.synopsis || 'Belum ada sinopsis untuk buku cerita ini.'}
                </p>

                {/* Genres */}
                {activeBook.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeBook.genres.map((genre) => (
                      <span
                        key={genre}
                        className="py-0.5 px-2 rounded-md bg-[#252538] border border-[#3A3A54] text-[11px] text-[#D4AF37]"
                      >
                        #{genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* Progress Bar vs Target */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#8E8EA4]">
                      Progres:{' '}
                      <span className="font-mono text-[#FAF7EE] font-semibold">
                        {activeBook.currentWordCount.toLocaleString()}
                      </span>{' '}
                      / {activeBook.targetWordCount.toLocaleString()} kata
                    </span>
                    <span className="text-[#D4AF37] font-mono font-semibold">
                      {Math.min(
                        100,
                        Math.round(
                          (activeBook.currentWordCount / (activeBook.targetWordCount || 1)) *
                            100
                        )
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-[#161624] rounded-full h-2 overflow-hidden border border-[#2A2A3C]">
                    <div
                      className="h-full bg-gradient-to-r from-[#8A1825] to-[#D4AF37] rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          (activeBook.currentWordCount / (activeBook.targetWordCount || 1)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chapters Section */}
          <div className="bg-[#1E1E2E] border border-[#2A2A3C] rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-editorial text-lg font-bold text-[#FAF7EE]">
                  Daftar Bab Naskah
                </h3>
              </div>
              <button
                id="btn-add-chapter"
                onClick={handleOpenNewChapterModal}
                className="py-2 px-3.5 bg-[#252538] hover:bg-[#32324C] border border-[#3A3A54] hover:border-[#D4AF37]/50 text-[#FAF7EE] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <span>Tambah Bab Baru</span>
              </button>
            </div>

            {/* EMPTY STATE CHAPTERS */}
            {activeBookChapters.length === 0 ? (
              <div
                id="empty-chapters-state"
                className="py-12 px-4 text-center border-2 border-dashed border-[#2A2A3C] rounded-2xl bg-[#161624] flex flex-col items-center justify-center"
              >
                <div className="p-3 bg-[#202030] rounded-2xl border border-[#303046] text-[#D4AF37]/70 mb-3">
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="font-editorial text-base font-bold text-[#FAF7EE] mb-1">
                  Belum ada bab untuk buku ini
                </h4>
                <p className="text-xs text-[#8E8EA4] max-w-sm mb-4">
                  Mulai petualangan ceritamu dengan menambahkan bab pembuka (Bab 1) dan tulis di Studio Editor.
                </p>
                <button
                  onClick={handleOpenNewChapterModal}
                  className="py-2 px-4 bg-gradient-to-r from-[#D4AF37] to-[#B89225] text-[#121212] font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Bab Pertama</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {activeBookChapters.map((chap) => (
                  <div
                    key={chap.id}
                    className="p-4 bg-[#161624] hover:bg-[#1c1c2e] border border-[#2A2A3C] hover:border-[#3A3A54] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#222234] border border-[#303048] flex items-center justify-center text-xs font-mono font-bold text-[#D4AF37] shrink-0">
                        {chap.chapterNumber}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#FAF7EE] group-hover:text-[#D4AF37] transition-colors">
                          {chap.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-[#8E8EA4] mt-0.5">
                          <span className="font-mono">
                            {chap.wordCount?.toLocaleString() || 0} kata
                          </span>
                          <span>•</span>
                          <span className="capitalize">
                            {chap.status === 'published'
                              ? 'Siap Terbit'
                              : chap.status === 'review'
                              ? 'Revisi'
                              : 'Draft'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => onOpenEditor(activeBook.id, chap.id)}
                        className="py-1.5 px-3 bg-gradient-to-r from-[#D4AF37] to-[#B89225] hover:from-[#E2BE4B] hover:to-[#C9A332] text-[#121212] font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Buka di Editor</span>
                      </button>
                      <button
                        onClick={(e) => handleOpenEditChapterModal(chap, e)}
                        className="p-2 bg-[#222234] hover:bg-[#2E2E44] text-[#A0A0B5] hover:text-[#FAF7EE] rounded-lg text-xs transition-colors cursor-pointer"
                        title="Edit Info Bab"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteConfirmType('chapter');
                          setDeleteConfirmId(chap.id);
                        }}
                        className="p-2 bg-red-950/30 hover:bg-red-900/50 text-red-400 rounded-lg text-xs transition-colors cursor-pointer"
                        title="Hapus Bab"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ALL BOOKS VIEW / EMPTY STATE */
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-xl sm:text-2xl font-serif text-[#D4AF37]">Buku Saya</h3>
              <p className="text-xs text-[#8E8EA4] uppercase tracking-wider mt-0.5">
                Daftar serial & naskah novel yang sedang dikembangkan
              </p>
            </div>
            {books.length > 0 && (
              <button
                onClick={handleOpenNewBookModal}
                className="bg-[#D4AF37] text-[#121212] px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Buku Baru</span>
              </button>
            )}
          </div>

          {/* Search and Filters bar */}
          {books.length > 0 && (
            <div
              data-tour="workspace-filters"
              className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#181826] border border-[#2A2A3C] p-3.5 rounded-xl"
            >
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7E7E94]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul, sinopsis, atau genre..."
                  className="w-full pl-9 pr-3 py-1.5 bg-[#141420] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-lg text-xs text-[#E0E0E0] outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#141420] border border-[#2A2A3C] rounded-lg text-xs text-[#C8C8DC] outline-none cursor-pointer uppercase tracking-wider text-[10px] font-bold"
                >
                  <option value="all">Semua Status</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="draft">Draft</option>
                  <option value="completed">Selesai</option>
                  <option value="hiatus">Hiatus</option>
                </select>
              </div>
            </div>
          )}

          {/* EMPTY STATE UI - STRICT ZERO HARDCODED DUMMY DATA */}
          {books.length === 0 ? (
            <div
              id="empty-books-state"
              className="border-2 border-dashed border-[#2A2A3C] rounded-2xl flex flex-col items-center justify-center text-center p-12 sm:p-16 bg-[#1E1E2E]/30"
            >
              <div className="w-20 h-20 border border-[#D4AF37]/30 rounded-full flex items-center justify-center mb-6 bg-[#1E1E2E] shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                <FolderPlus className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <p className="text-2xl sm:text-3xl font-serif mb-2 italic text-[#FAF7EE]">
                Belum ada buku cerita.
              </p>
              <p className="text-[#D4AF37]/70 text-xs sm:text-sm max-w-sm uppercase tracking-widest leading-loose mb-6">
                Mulai perjalanan narasi Anda dengan menekan tombol buat buku di atas.
              </p>
              <button
                id="btn-empty-create-book"
                data-tour="create-book"
                onClick={handleOpenNewBookModal}
                className="bg-[#D4AF37] text-[#121212] px-8 py-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_20px_rgba(212,175,55,0.25)] cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Buku Baru</span>
              </button>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="py-12 text-center text-[#8E8EA4] bg-[#181826] border border-[#2A2A3C] rounded-2xl">
              <p className="text-sm font-serif italic text-lg text-[#FAF7EE]">Tidak ada buku yang cocok dengan pencarian "{searchQuery}".</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGenreFilter('all');
                  setStatusFilter('all');
                }}
                className="mt-3 text-xs uppercase tracking-widest text-[#D4AF37] font-bold hover:underline"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            /* BOOKS GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-tour="workspace-books-grid">
              {filteredBooks.map((book) => {
                const bookChaptersCount = chapters.filter((c) => c.bookId === book.id).length;
                const progressPct = Math.min(
                  100,
                  Math.round(((book.currentWordCount || 0) / (book.targetWordCount || 1)) * 100)
                );

                return (
                  <div
                    key={book.id}
                    onClick={() => setActiveBookId(book.id)}
                    className="bg-[#1E1E2E] hover:bg-[#222236] border border-[#2A2A3C] hover:border-[#D4AF37]/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all duration-200 cursor-pointer group relative overflow-hidden"
                  >
                    {/* Top row: Cover & Header */}
                    <div>
                      <div className="flex gap-4 items-start mb-3">
                        {/* Book Thumbnail */}
                        <div className="w-20 h-28 rounded-lg overflow-hidden bg-[#161624] border border-[#303046] shrink-0 shadow-sm">
                          {book.coverUrl ? (
                            <img
                              src={book.coverUrl}
                              alt={book.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-[#6E6E85] p-2 text-center">
                              <BookOpen className="w-6 h-6 mb-1 text-[#D4AF37]/40" />
                              <span className="text-[8px] uppercase text-[#8A8A9E]">Buku</span>
                            </div>
                          )}
                        </div>

                        {/* Title & Status */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                              {book.status === 'completed'
                                ? 'Selesai'
                                : book.status === 'draft'
                                ? 'Draft'
                                : book.status === 'hiatus'
                                ? 'Hiatus'
                                : 'Ongoing'}
                            </span>
                            <span className="text-[11px] text-[#7E7E94] font-mono">
                              {bookChaptersCount} Bab
                            </span>
                          </div>

                          <h3 className="font-editorial text-base font-bold text-[#FAF7EE] group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                            {book.title}
                          </h3>

                          {book.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {book.genres.slice(0, 2).map((g) => (
                                <span
                                  key={g}
                                  className="text-[10px] text-[#A0A0B5] bg-[#161624] px-1.5 py-0.5 rounded border border-[#2A2A3C]"
                                >
                                  {g}
                                </span>
                              ))}
                              {book.genres.length > 2 && (
                                <span className="text-[10px] text-[#7A7A8E]">
                                  +{book.genres.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Synopsis Preview */}
                      <p className="text-xs text-[#9E9EB2] line-clamp-2 mb-4">
                        {book.synopsis || 'Belum ada deskripsi sinopsis.'}
                      </p>
                    </div>

                    {/* Bottom: Progress & Actions */}
                    <div className="pt-3 border-t border-[#262638] space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#8E8EA4]">
                          <span className="font-mono text-[#FAF7EE] font-semibold">
                            {(book.currentWordCount || 0).toLocaleString()}
                          </span>{' '}
                          / {(book.targetWordCount || 0).toLocaleString()} kata
                        </span>
                        <span className="text-[#D4AF37] font-mono font-semibold">
                          {progressPct}%
                        </span>
                      </div>
                      <div className="w-full bg-[#161624] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#8A1825] to-[#D4AF37] rounded-full"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-[#D4AF37] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Buka Bab & Detail</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleOpenEditBookModal(book, e)}
                            className="p-1.5 text-[#8E8EA4] hover:text-[#FAF7EE] hover:bg-[#2A2A3E] rounded-lg transition-colors cursor-pointer"
                            title="Edit Buku"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmType('book');
                              setDeleteConfirmId(book.id);
                            }}
                            className="p-1.5 text-[#8E8EA4] hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Buku"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      <BookModal
        isOpen={isBookModalOpen}
        initialBook={editingBook}
        customGenres={customGenres}
        onClose={() => setIsBookModalOpen(false)}
        onSave={(data) => {
          onSaveBook(data as Book);
          setIsBookModalOpen(false);
        }}
        onAddCustomGenre={onAddCustomGenre}
      />

      <ChapterModal
        isOpen={isChapterModalOpen}
        bookId={activeBookId || ''}
        initialChapter={editingChapter}
        existingChaptersCount={activeBookChapters.length}
        onClose={() => setIsChapterModalOpen(false)}
        onSave={(data) => {
          onSaveChapter(data as Chapter);
          setIsChapterModalOpen(false);
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1E1E2E] border border-red-900/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800 text-red-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#FAF7EE]">
                Hapus {deleteConfirmType === 'book' ? 'Buku' : 'Bab'}?
              </h3>
              <p className="text-xs text-[#9E9EB2] mt-1">
                Tindakan ini tidak dapat dibatalkan. Seluruh naskah yang berkaitan akan dihapus dari penyimpanan.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-2 px-4 bg-[#252538] hover:bg-[#32324C] text-xs font-semibold text-[#C0C0D4] rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="py-2 px-4 bg-red-600 hover:bg-red-700 text-xs font-semibold text-white rounded-xl shadow-lg cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
