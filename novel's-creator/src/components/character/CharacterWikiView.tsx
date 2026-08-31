import React, { useState } from 'react';
import { CharacterWiki, Book, RoleTag, CharacterStatus } from '../../types';
import { CharacterFormModal } from './CharacterFormModal';
import { CharacterDetailModal } from './CharacterDetailModal';
import { RelationshipGraphModal } from './RelationshipGraphModal';
import {
  Users,
  Plus,
  Search,
  User,
  Shield,
  Heart,
  Trash2,
  Edit3,
  Network,
  Tag,
  Filter,
  Sparkles,
} from 'lucide-react';

interface CharacterWikiViewProps {
  characters: CharacterWiki[];
  books: Book[];
  onSaveCharacter: (character: CharacterWiki) => void;
  onDeleteCharacter: (characterId: string) => void;
}

const ROLE_FILTERS: (RoleTag | 'all')[] = [
  'all',
  'Protagonis',
  'Antagonis',
  'Side',
  'Mentor',
  'Rival',
  'Netral',
];

export const CharacterWikiView: React.FC<CharacterWikiViewProps> = ({
  characters,
  books,
  onSaveCharacter,
  onDeleteCharacter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<RoleTag | 'all'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedBookFilter, setSelectedBookFilter] = useState<string>('all');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<CharacterWiki | null>(null);

  const [detailCharacter, setDetailCharacter] = useState<CharacterWiki | null>(null);
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered list
  const filteredCharacters = characters.filter((char) => {
    const matchesSearch =
      char.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.alias.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.physicalAppearance.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.personalityTraits.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.backstory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.customAttributes.some(
        (a) =>
          a.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.value.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesRole =
      selectedRoleFilter === 'all' || char.roleTag === selectedRoleFilter;

    const matchesStatus =
      selectedStatusFilter === 'all' || char.status === selectedStatusFilter;

    const matchesBook =
      selectedBookFilter === 'all' || (char.bookIds && char.bookIds.includes(selectedBookFilter));

    return matchesSearch && matchesRole && matchesStatus && matchesBook;
  });

  const handleOpenNewCharacter = () => {
    setEditingCharacter(null);
    setIsFormOpen(true);
  };

  const handleOpenEditCharacter = (char: CharacterWiki, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCharacter(char);
    setIsFormOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmId) return;
    onDeleteCharacter(deleteConfirmId);
    if (detailCharacter?.id === deleteConfirmId) {
      setDetailCharacter(null);
    }
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-8">
      {/* Top Bold Typography Header */}
      <header className="mb-2 sm:mb-4" data-tour="character-wiki-header">
        <div className="text-[#D4AF37] text-xs sm:text-sm uppercase tracking-[0.3em] font-bold mb-2 flex items-center gap-2">
          <span>Database Karakter</span>
          <span className="w-8 h-px bg-[#D4AF37]/40" />
          <span className="text-[10px] font-mono text-[#8E8EA4] tracking-normal">
            ({characters.length} Profil Terdaftar)
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light italic leading-tight text-[#FAF7EE]">
              Wiki Tokoh & Relasi
            </h2>
            <p className="text-xs sm:text-sm text-[#9E9EB2] mt-1.5 uppercase tracking-widest font-medium">
              Arsitektur tokoh cerita, atribut kustom, latar belakang, & relasi visual
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto shrink-0">
            <button
              data-tour="relationship-graph-btn"
              onClick={() => setIsGraphModalOpen(true)}
              className="py-2.5 px-4 bg-[#1E1E2E] hover:bg-[#282840] text-[#D4AF37] border border-[#D4AF37]/40 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Network className="w-4 h-4" />
              <span>Matriks Relasi</span>
            </button>
            <button
              id="btn-add-character-wiki"
              data-tour="add-character-btn"
              onClick={handleOpenNewCharacter}
              className="bg-[#D4AF37] text-[#121212] px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.25)] flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Karakter</span>
            </button>
          </div>
        </div>
      </header>

      {/* Search & Filter Bar */}
      {characters.length > 0 && (
        <div className="space-y-3 bg-[#181826] border border-[#2A2A3C] p-4 rounded-2xl" data-tour="character-filter-bar">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#7E7E94]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, alias, atribut, sifat, backstory..."
                className="w-full pl-9 pr-3 py-2 bg-[#141420] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs text-[#E0E0E0] outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 bg-[#141420] border border-[#2A2A3C] rounded-xl text-xs text-[#C8C8DC] outline-none cursor-pointer uppercase tracking-wider text-[10px] font-bold"
              >
                <option value="all">Semua Status</option>
                <option value="Hidup">Hidup</option>
                <option value="Mati">Mati</option>
                <option value="Hilang">Hilang</option>
                <option value="Disegel">Disegel</option>
                <option value="Reinkarnasi">Reinkarnasi</option>
              </select>

              {books.length > 0 && (
                <select
                  value={selectedBookFilter}
                  onChange={(e) => setSelectedBookFilter(e.target.value)}
                  className="px-3 py-2 bg-[#141420] border border-[#2A2A3C] rounded-xl text-xs text-[#C8C8DC] outline-none cursor-pointer uppercase tracking-wider text-[10px] font-bold"
                >
                  <option value="all">Semua Buku</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Role Tag Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#242436]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#7E7E94] mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Peran:
            </span>
            {ROLE_FILTERS.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRoleFilter(role)}
                className={`py-1 px-3 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedRoleFilter === role
                    ? 'bg-[#D4AF37] text-[#121212] shadow-sm'
                    : 'bg-[#141420] text-[#9E9EB2] hover:text-[#FAF7EE] border border-[#242436]'
                }`}
              >
                {role === 'all' ? 'Semua Peran' : role}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STRICT ZERO DUMMY DATA EMPTY STATE */}
      {characters.length === 0 ? (
        <div
          id="empty-characters-state"
          className="border-2 border-dashed border-[#2A2A3C] rounded-2xl flex flex-col items-center justify-center text-center p-12 sm:p-16 bg-[#1E1E2E]/30"
        >
          <div className="w-20 h-20 border border-[#D4AF37]/30 rounded-full flex items-center justify-center mb-6 bg-[#1E1E2E] shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <Users className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <p className="text-2xl sm:text-3xl font-serif mb-2 italic text-[#FAF7EE]">
            Belum ada karakter wiki.
          </p>
          <p className="text-[#D4AF37]/70 text-xs sm:text-sm max-w-md uppercase tracking-widest leading-loose mb-6">
            Database karakter masih kosong. Rancang protagonis, antagonis, dan relasi tokoh Anda sekarang.
          </p>
          <button
            id="btn-empty-add-character"
            data-tour="add-character-btn"
            onClick={handleOpenNewCharacter}
            className="bg-[#D4AF37] text-[#121212] px-8 py-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_20px_rgba(212,175,55,0.25)] cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Karakter</span>
          </button>
        </div>
      ) : filteredCharacters.length === 0 ? (
        <div className="py-12 text-center text-[#8E8EA4] bg-[#181826] border border-[#2A2A3C] rounded-2xl">
          <p className="font-serif italic text-lg text-[#FAF7EE]">Tidak ada karakter yang cocok dengan kriteria filter saat ini.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedRoleFilter('all');
              setSelectedStatusFilter('all');
              setSelectedBookFilter('all');
            }}
            className="mt-3 text-xs uppercase tracking-widest text-[#D4AF37] font-bold hover:underline"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        /* CHARACTER CARDS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-tour="character-cards-grid">
          {filteredCharacters.map((char) => (
            <div
              key={char.id}
              onClick={() => setDetailCharacter(char)}
              className="bg-[#1E1E2E] hover:bg-[#222236] border border-[#2A2A3C] hover:border-[#D4AF37]/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all duration-200 cursor-pointer group relative overflow-hidden"
            >
              <div>
                {/* Header Row with Avatar & Role */}
                <div className="flex gap-4 items-start mb-3.5">
                  {/* Avatar */}
                  <div className="w-20 h-24 rounded-xl overflow-hidden bg-[#161624] border border-[#303046] shrink-0 shadow-sm relative">
                    {char.avatarUrl ? (
                      <img
                        src={char.avatarUrl}
                        alt={char.fullName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#6E6E85] p-2 text-center">
                        <User className="w-7 h-7 mb-1 text-[#D4AF37]/40" />
                        <span className="text-[8px] uppercase text-[#8A8A9E]">Tokoh</span>
                      </div>
                    )}
                  </div>

                  {/* Character Name & Role */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                        {char.roleTag}
                      </span>
                      <span className="text-[10px] text-[#8E8EA4] font-mono">
                        {char.status}
                      </span>
                    </div>

                    <h3 className="font-editorial text-lg font-bold text-[#FAF7EE] group-hover:text-[#D4AF37] transition-colors truncate">
                      {char.fullName}
                    </h3>
                    {char.alias && (
                      <p className="text-xs text-[#A8A8C0] truncate italic">
                        "{char.alias}"
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-[#7E7E94] mt-1">
                      {char.age && <span>{char.age}</span>}
                      {char.age && char.gender && <span>•</span>}
                      {char.gender && <span>{char.gender}</span>}
                    </div>
                  </div>
                </div>

                {/* Backstory / Personality excerpt */}
                <p className="text-xs text-[#9E9EB2] line-clamp-2 mb-3 leading-relaxed">
                  {char.personalityTraits ||
                    char.physicalAppearance ||
                    char.backstory ||
                    'Belum ada rincian profil mendalam.'}
                </p>

                {/* Custom Attributes Preview */}
                {char.customAttributes && char.customAttributes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {char.customAttributes.slice(0, 2).map((attr) => (
                      <span
                        key={attr.id}
                        className="text-[10px] text-[#D4AF37] bg-[#161624] px-2 py-0.5 rounded border border-[#2A2A3C] truncate max-w-[140px]"
                      >
                        {attr.key}: {attr.value}
                      </span>
                    ))}
                    {char.customAttributes.length > 2 && (
                      <span className="text-[10px] text-[#7A7A8E] bg-[#161624] px-1.5 py-0.5 rounded border border-[#2A2A3C]">
                        +{char.customAttributes.length - 2} atribut
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Actions & Relational Count */}
              <div className="pt-3 border-t border-[#262638] flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-[#8E8EA4]">
                  <Heart className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{char.relationships?.length || 0} Relasi</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleOpenEditCharacter(char, e)}
                    className="p-1.5 text-[#8E8EA4] hover:text-[#FAF7EE] hover:bg-[#2A2A3E] rounded-lg transition-colors cursor-pointer"
                    title="Edit Profil"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(char.id);
                    }}
                    className="p-1.5 text-[#8E8EA4] hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Karakter"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALS */}
      <CharacterFormModal
        isOpen={isFormOpen}
        initialCharacter={editingCharacter}
        allCharacters={characters}
        books={books}
        onClose={() => setIsFormOpen(false)}
        onSave={(data) => {
          onSaveCharacter(data);
          setIsFormOpen(false);
        }}
      />

      <CharacterDetailModal
        isOpen={!!detailCharacter}
        character={detailCharacter}
        allCharacters={characters}
        books={books}
        onClose={() => setDetailCharacter(null)}
        onEdit={(char) => {
          setEditingCharacter(char);
          setIsFormOpen(true);
        }}
      />

      <RelationshipGraphModal
        isOpen={isGraphModalOpen}
        characters={characters}
        onClose={() => setIsGraphModalOpen(false)}
        onSelectCharacter={(char) => setDetailCharacter(char)}
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
                Hapus Karakter Wiki?
              </h3>
              <p className="text-xs text-[#9E9EB2] mt-1">
                Data profil, atribut kustom, dan seluruh tautan relasi karakter ini akan dihapus permanen.
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
