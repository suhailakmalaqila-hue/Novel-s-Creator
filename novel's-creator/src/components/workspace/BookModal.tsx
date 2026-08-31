import React, { useState, useRef } from 'react';
import { Book, BookStatus } from '../../types';
import { DEFAULT_STANDARD_GENRES } from '../../lib/storage';
import {
  X,
  BookOpen,
  Upload,
  Camera,
  Trash2,
  Plus,
  Target,
  Sparkles,
  Tag,
} from 'lucide-react';

interface BookModalProps {
  isOpen: boolean;
  initialBook?: Book | null;
  customGenres: string[];
  onClose: () => void;
  onSave: (bookData: Partial<Book>) => void;
  onAddCustomGenre: (genreName: string) => void;
}

export const BookModal: React.FC<BookModalProps> = ({
  isOpen,
  initialBook,
  customGenres,
  onClose,
  onSave,
  onAddCustomGenre,
}) => {
  const [title, setTitle] = useState(initialBook?.title || '');
  const [synopsis, setSynopsis] = useState(initialBook?.synopsis || '');
  const [coverUrl, setCoverUrl] = useState(initialBook?.coverUrl || '');
  const [targetWordCount, setTargetWordCount] = useState(
    initialBook?.targetWordCount || 50000
  );
  const [status, setStatus] = useState<BookStatus>(initialBook?.status || 'ongoing');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    initialBook?.genres || []
  );

  // Custom genre input field state
  const [newGenreInput, setNewGenreInput] = useState('');
  const [showCustomGenreInput, setShowCustomGenreInput] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Combine standard genres + custom genres uniquely
  const allAvailableGenres = Array.from(
    new Set([...DEFAULT_STANDARD_GENRES, ...customGenres])
  );

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Format file sampul harus berupa gambar.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Ukuran gambar sampul maksimal 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCoverUrl(reader.result);
        setErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleToggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleCreateCustomGenre = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newGenreInput.trim();
    if (!clean) return;

    onAddCustomGenre(clean);
    if (!selectedGenres.includes(clean)) {
      setSelectedGenres([...selectedGenres, clean]);
    }
    setNewGenreInput('');
    setShowCustomGenreInput(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Judul buku tidak boleh kosong.');
      return;
    }

    onSave({
      id: initialBook ? initialBook.id : 'book_' + Date.now(),
      title: title.trim(),
      synopsis: synopsis.trim(),
      coverUrl,
      genres: selectedGenres,
      targetWordCount: Number(targetWordCount) || 50000,
      status,
      currentWordCount: initialBook?.currentWordCount || 0,
    });

    onClose();
  };

  return (
    <div
      id="book-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-2xl bg-[#1E1E2E] border border-[#2A2A3C] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#181826] border-b border-[#2A2A3C]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#252538] rounded-xl border border-[#D4AF37]/30 text-[#D4AF37]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#FAF7EE]">
                {initialBook ? 'Edit Detail Buku Cerita' : 'Buat Buku Cerita Baru'}
              </h3>
              <p className="text-xs text-[#9E9EB2]">
                Tentukan judul, sinopsis, target kata, dan genre kustom tanpa batas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#7E7E94] hover:text-[#FAF7EE] hover:bg-[#252538] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-950/50 border border-red-800 rounded-xl text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        {/* Modal Form Body */}
        <form id="form-book" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Cover & Basic Info Row */}
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Book Cover Container */}
            <div className="w-full sm:w-40 flex flex-col items-center shrink-0">
              <div className="relative group w-36 h-48 rounded-xl border-2 border-dashed border-[#3A3A54] hover:border-[#D4AF37]/60 bg-[#161624] overflow-hidden flex flex-col items-center justify-center shadow-lg transition-all">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="p-3 text-center text-[#6E6E85]">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-[#D4AF37]/50" />
                    <span className="text-[10px] text-[#A0A0B5] block font-medium">
                      Unggah Sampul
                    </span>
                    <span className="text-[9px] text-[#6E6E85] block mt-0.5">
                      JPG / PNG / WebP
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs transition-opacity cursor-pointer"
                >
                  <Upload className="w-5 h-5 mb-1 text-[#D4AF37]" />
                  <span>{coverUrl ? 'Ganti Sampul' : 'Pilih Gambar'}</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />

              {coverUrl && (
                <button
                  type="button"
                  onClick={() => setCoverUrl('')}
                  className="mt-2 text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus Sampul</span>
                </button>
              )}
            </div>

            {/* Title & Status Inputs */}
            <div className="flex-1 w-full space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#C8C8DC] mb-1.5">
                  Judul Buku / Proyek Novel <span className="text-[#D4AF37]">*</span>
                </label>
                <input
                  id="book-input-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Mahkota Bayangan: Kebangkitan Sang Penyihir"
                  className="w-full px-3.5 py-2.5 bg-[#161624] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs sm:text-sm text-[#E0E0E0] outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#C8C8DC] mb-1.5">
                    Target Jumlah Kata
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#75758C]">
                      <Target className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <input
                      type="number"
                      min={1000}
                      max={500000}
                      step={1000}
                      value={targetWordCount}
                      onChange={(e) => setTargetWordCount(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 bg-[#161624] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs sm:text-sm text-[#E0E0E0] outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#C8C8DC] mb-1.5">
                    Status Proyek
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as BookStatus)}
                    className="w-full px-3 py-2 bg-[#161624] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs sm:text-sm text-[#E0E0E0] outline-none cursor-pointer"
                  >
                    <option value="ongoing">Berjalan (Ongoing)</option>
                    <option value="draft">Konsep / Draft Awal</option>
                    <option value="completed">Tamat / Selesai</option>
                    <option value="hiatus">Hiatus / Ditunda</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C8C8DC] mb-1.5">
                  Sinopsis / Logline Cerita
                </label>
                <textarea
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  rows={3}
                  placeholder="Ringkas konflik utama, premis dunia, atau tujuan protagonis dalam cerita ini..."
                  className="w-full px-3.5 py-2 bg-[#161624] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs sm:text-sm text-[#E0E0E0] outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* GENRE SELECTION & CUSTOM GENRE SECTION */}
          <div className="p-4 bg-[#161624] border border-[#2A2A3C] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#D4AF37]" />
                <h4 className="text-xs font-semibold text-[#FAF7EE]">
                  Pilihan Genre & Tag Kustom
                </h4>
              </div>
              <span className="text-[11px] text-[#8E8EA4]">
                {selectedGenres.length} genre dipilih
              </span>
            </div>

            {/* Genre Pills List */}
            <div className="flex flex-wrap gap-1.5">
              {allAvailableGenres.map((genre) => {
                const isSelected = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => handleToggleGenre(genre)}
                    className={`py-1 px-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#D4AF37] text-[#121212] font-semibold shadow-sm shadow-[#D4AF37]/30'
                        : 'bg-[#1E1E2E] text-[#B0B0C4] hover:text-[#FAF7EE] border border-[#2A2A3C] hover:border-[#3D3D58]'
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}

              {/* + Custom Genre Trigger Button */}
              {!showCustomGenreInput && (
                <button
                  id="btn-trigger-custom-genre"
                  type="button"
                  onClick={() => setShowCustomGenreInput(true)}
                  className="py-1 px-3 rounded-lg text-xs font-semibold bg-[#222238] hover:bg-[#2C2C48] text-[#D4AF37] border border-[#D4AF37]/40 hover:border-[#D4AF37] flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Custom Genre</span>
                </button>
              )}
            </div>

            {/* Dynamic Custom Genre Input Form */}
            {showCustomGenreInput && (
              <div className="flex items-center gap-2 pt-2 border-t border-[#26263A]">
                <input
                  id="input-custom-genre-name"
                  type="text"
                  value={newGenreInput}
                  onChange={(e) => setNewGenreInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateCustomGenre();
                    }
                  }}
                  placeholder="Ketik nama genre unik (misal: LitRPG, Grimdark, Wuxia Otome)..."
                  className="flex-1 px-3 py-1.5 bg-[#1C1C2C] border border-[#3A3A54] focus:border-[#D4AF37] rounded-lg text-xs text-[#FAF7EE] outline-none"
                  autoFocus
                />
                <button
                  id="btn-add-custom-genre-submit"
                  type="button"
                  onClick={() => handleCreateCustomGenre()}
                  className="py-1.5 px-3 bg-[#D4AF37] hover:bg-[#E2BE4B] text-[#121212] text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Tambah</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomGenreInput(false);
                    setNewGenreInput('');
                  }}
                  className="py-1.5 px-2.5 bg-[#222234] hover:bg-[#2C2C42] text-xs text-[#9E9EB2] rounded-lg cursor-pointer"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#181826] border-t border-[#2A2A3C]">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 bg-[#222234] hover:bg-[#2C2C42] text-xs font-semibold text-[#C0C0D4] rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            id="btn-submit-book"
            type="button"
            onClick={handleSubmit}
            className="py-2 px-5 bg-gradient-to-r from-[#D4AF37] to-[#B89225] hover:from-[#E2BE4B] hover:to-[#C9A332] text-[#121212] font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>{initialBook ? 'Simpan Perubahan' : 'Buat Buku Cerita'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
