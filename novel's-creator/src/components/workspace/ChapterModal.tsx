import React, { useState } from 'react';
import { Chapter, ChapterStatus } from '../../types';
import { X, FileText, Plus } from 'lucide-react';

interface ChapterModalProps {
  isOpen: boolean;
  bookId: string;
  initialChapter?: Chapter | null;
  existingChaptersCount: number;
  onClose: () => void;
  onSave: (chapterData: Partial<Chapter>) => void;
}

export const ChapterModal: React.FC<ChapterModalProps> = ({
  isOpen,
  bookId,
  initialChapter,
  existingChaptersCount,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(initialChapter?.title || '');
  const [chapterNumber, setChapterNumber] = useState(
    initialChapter?.chapterNumber || existingChaptersCount + 1
  );
  const [status, setStatus] = useState<ChapterStatus>(
    initialChapter?.status || 'draft'
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Judul bab tidak boleh kosong.');
      return;
    }

    onSave({
      id: initialChapter ? initialChapter.id : 'chap_' + Date.now(),
      bookId,
      title: title.trim(),
      chapterNumber: Number(chapterNumber) || 1,
      status,
      content: initialChapter?.content || '',
      wordCount: initialChapter?.wordCount || 0,
      characterCount: initialChapter?.characterCount || 0,
      order: initialChapter ? initialChapter.order : existingChaptersCount,
    });

    onClose();
  };

  return (
    <div
      id="chapter-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md bg-[#1E1E2E] border border-[#2A2A3C] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#181826] border-b border-[#2A2A3C]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#252538] rounded-xl border border-[#D4AF37]/30 text-[#D4AF37]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-editorial text-base font-bold text-[#FAF7EE]">
                {initialChapter ? 'Edit Informasi Bab' : 'Tambah Bab Baru'}
              </h3>
              <p className="text-xs text-[#9E9EB2]">
                Atur nomor bab, judul bab, dan status naskah
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#C8C8DC] mb-1">
                Nomor Bab
              </label>
              <input
                type="number"
                min={1}
                value={chapterNumber}
                onChange={(e) => setChapterNumber(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#161624] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs sm:text-sm text-[#E0E0E0] outline-none font-mono"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#C8C8DC] mb-1">
                Status Bab
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ChapterStatus)}
                className="w-full px-3 py-2 bg-[#161624] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs sm:text-sm text-[#E0E0E0] outline-none cursor-pointer"
              >
                <option value="draft">Draft (Sedang Ditulis)</option>
                <option value="review">Revisi / Review</option>
                <option value="published">Siap Terbit / Final</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#C8C8DC] mb-1">
              Judul Bab <span className="text-[#D4AF37]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Bab 1: Pertemuan di Bawah Bulan Merah"
              className="w-full px-3.5 py-2.5 bg-[#161624] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs sm:text-sm text-[#E0E0E0] outline-none transition-colors"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2A2A3C]">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-[#222234] hover:bg-[#2C2C42] text-xs font-semibold text-[#C0C0D4] rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="py-2 px-5 bg-gradient-to-r from-[#D4AF37] to-[#B89225] hover:from-[#E2BE4B] hover:to-[#C9A332] text-[#121212] font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{initialChapter ? 'Simpan Bab' : 'Buat Bab'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
