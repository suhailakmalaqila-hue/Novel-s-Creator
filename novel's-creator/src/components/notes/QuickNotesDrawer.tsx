import React, { useState } from 'react';
import { QuickNote } from '../../types';
import {
  StickyNote,
  X,
  Plus,
  Pin,
  Trash2,
  Copy,
  Check,
  Search,
  Tag,
} from 'lucide-react';

interface QuickNotesDrawerProps {
  isOpen: boolean;
  notes: QuickNote[];
  onClose: () => void;
  onSaveNote: (note: QuickNote) => void;
  onDeleteNote: (noteId: string) => void;
}

const COLOR_OPTIONS: { label: string; value: string; border: string }[] = [
  { label: 'Gold', value: '#D4AF37', border: '#B89225' },
  { label: 'Crimson', value: '#E63946', border: '#C52233' },
  { label: 'Purple', value: '#9D4EDD', border: '#7B2CBF' },
  { label: 'Emerald', value: '#2A9D8F', border: '#21867A' },
  { label: 'Cyan', value: '#4EA8DE', border: '#0077B6' },
  { label: 'Slate', value: '#4A4E69', border: '#22223B' },
];

export const QuickNotesDrawer: React.FC<QuickNotesDrawerProps> = ({
  isOpen,
  notes,
  onClose,
  onSaveNote,
  onDeleteNote,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState('#D4AF37');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() && !newTitle.trim()) return;

    const note: QuickNote = {
      id: 'note_' + Date.now(),
      title: newTitle.trim() || 'Catatan Kilat',
      content: newContent.trim(),
      category: 'Ide Spontan',
      colorTag: newColor,
      isPinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onSaveNote(note);
    setNewTitle('');
    setNewContent('');
    setIsCreating(false);
  };

  const handleTogglePin = (note: QuickNote) => {
    onSaveNote({
      ...note,
      isPinned: !note.isPinned,
      updatedAt: Date.now(),
    });
  };

  const handleCopyNote = (note: QuickNote) => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Sort: Pinned first, then newest
  const filteredNotes = notes
    .filter(
      (n) =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt - a.createdAt;
    });

  return (
    <div
      id="quick-notes-drawer-overlay"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs"
    >
      <div className="w-full max-w-md bg-[#1E1E2E] border-l border-[#2A2A3C] h-full p-5 sm:p-6 flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
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
                Tampung ide mendadak, fragmen dialog, atau lore rahasia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#7E7E94] hover:text-[#FAF7EE] hover:bg-[#252538] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Add New Toggle */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6E85]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari catatan..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#141420] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs text-[#FAF7EE] outline-none"
              />
            </div>
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="py-1.5 px-3 bg-gradient-to-r from-[#D4AF37] to-[#B89225] hover:from-[#E2BE4B] text-[#121212] font-semibold text-xs rounded-xl flex items-center gap-1 shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>{isCreating ? 'Tutup' : 'Catatan Baru'}</span>
            </button>
          </div>

          {/* New Note Creator Card */}
          {isCreating && (
            <form
              onSubmit={handleAddNote}
              className="p-3.5 bg-[#161624] border border-[#D4AF37]/50 rounded-2xl space-y-3 shadow-lg animate-in fade-in duration-150"
            >
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Judul Ide / Topik..."
                className="w-full px-3 py-1.5 bg-[#1E1E2E] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-lg text-xs font-semibold text-[#FAF7EE] outline-none"
                autoFocus
              />
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={3}
                placeholder="Tuliskan gagasan cerita mendadak, kutipan dialog, atau plot twist..."
                className="w-full px-3 py-2 bg-[#1E1E2E] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-lg text-xs text-[#FAF7EE] outline-none resize-none"
              />

              {/* Color Tag Selection */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setNewColor(c.value)}
                      style={{ backgroundColor: c.value }}
                      className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                        newColor === c.value
                          ? 'scale-125 border-white shadow-md'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  className="py-1.5 px-3 bg-[#D4AF37] text-[#121212] font-semibold text-xs rounded-lg shadow-sm cursor-pointer"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          )}
        </div>

        {/* STRICT ZERO DUMMY DATA EMPTY STATE */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {notes.length === 0 ? (
            <div
              id="empty-notes-state"
              className="py-16 text-center border-2 border-dashed border-[#2A2A3C] rounded-2xl bg-[#161624] px-4"
            >
              <StickyNote className="w-8 h-8 mx-auto mb-2 text-[#D4AF37]/50" />
              <h4 className="font-editorial text-sm font-bold text-[#FAF7EE] mb-1">
                Belum ada catatan kilat.
              </h4>
              <p className="text-xs text-[#8E8EA4]">
                Gunakan fitur ini untuk menuliskan inspirasi liar di tengah proses menulis.
              </p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="py-8 text-center text-[#8E8EA4] text-xs">
              Tidak ada catatan yang cocok dengan "{searchQuery}".
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                style={{ borderLeftColor: note.colorTag || '#D4AF37' }}
                className="p-3.5 bg-[#161624] border border-[#2A2A3C] border-l-4 rounded-xl space-y-2 shadow-sm relative group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-[#FAF7EE]">
                    {note.title}
                  </h4>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePin(note)}
                      className={`p-1 rounded-md text-xs transition-colors cursor-pointer ${
                        note.isPinned
                          ? 'text-[#D4AF37] bg-[#28283C]'
                          : 'text-[#6E6E85] hover:text-[#FAF7EE]'
                      }`}
                      title={note.isPinned ? 'Lepas Pin' : 'Sematkan ke Atas'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopyNote(note)}
                      className="p-1 text-[#6E6E85] hover:text-[#FAF7EE] rounded-md text-xs transition-colors cursor-pointer"
                      title="Salin Catatan"
                    >
                      {copiedId === note.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1 text-[#6E6E85] hover:text-red-400 rounded-md text-xs transition-colors cursor-pointer"
                      title="Hapus Catatan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#B0B0C4] whitespace-pre-line leading-relaxed">
                  {note.content}
                </p>

                <div className="text-[10px] text-[#6E6E85] font-mono pt-1">
                  {new Date(note.createdAt).toLocaleDateString([], {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
