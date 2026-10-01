import React from 'react';
import { CharacterWiki, Book } from '../../types';
import {
  X,
  User,
  Shield,
  Heart,
  BookOpen,
  Edit3,
} from 'lucide-react';

interface CharacterDetailModalProps {
  isOpen: boolean;
  character: CharacterWiki | null;
  allCharacters: CharacterWiki[];
  books: Book[];
  onClose: () => void;
  onEdit: (character: CharacterWiki) => void;
}

export const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({
  isOpen,
  character,
  allCharacters,
  books,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !character) return null;

  const associatedBooks = books.filter((b) =>
    character.bookIds?.includes(b.id)
  );

  /**
   * =========================================================
   * RELATIONSHIP DISPLAY
   * =========================================================
   *
   * Database menyimpan relationship secara directional:
   *
   *     A -> B
   *
   * Relationship tersebut berada di:
   *
   *     A.relationships
   *
   * Ketika membuka Character B, kita tetap ingin B melihat
   * bahwa A mempunyai relationship menuju dirinya.
   *
   * Karena itu:
   *
   * - outgoing = relationship yang dibuat character ini
   * - incoming = relationship milik character lain yang
   *              targetCharacterId-nya adalah character ini
   *
   * Incoming relationship HANYA digunakan untuk DISPLAY.
   * Kita tidak memasukkannya ke character.relationships.
   *
   * Dengan demikian CharacterFormModal dan mekanisme save
   * relationship tetap aman.
   */

  const outgoingRelationships =
    character.relationships || [];

  const incomingRelationships = allCharacters.flatMap(
    (otherCharacter) => {
      // Jangan membandingkan character dengan dirinya sendiri.
      if (otherCharacter.id === character.id) {
        return [];
      }

      const relationships =
        otherCharacter.relationships || [];

      return relationships
        .filter(
          (rel) =>
            rel.targetCharacterId === character.id
        )
        .map((rel) => ({
          relationship: rel,
          sourceCharacter: otherCharacter,
        }));
    }
  );

  /**
   * Gabungkan relationship outgoing dan incoming untuk
   * kebutuhan tampilan saja.
   *
   * direction:
   * - outgoing = character -> target
   * - incoming = source -> character
   */
  const relationshipLinks = [
    ...outgoingRelationships.map((rel) => ({
      relationship: rel,
      direction: 'outgoing' as const,
      relatedCharacter: allCharacters.find(
        (c) => c.id === rel.targetCharacterId
      ),
    })),

    ...incomingRelationships.map(
      ({ relationship, sourceCharacter }) => ({
        relationship,
        direction: 'incoming' as const,
        relatedCharacter: sourceCharacter,
      })
    ),
  ];

  return (
    <div
      id="character-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-3xl bg-[#1E1E2E] border border-[#2A2A3C] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* =====================================================
            HEADER BAR
            ===================================================== */}

        <div className="flex items-center justify-between px-6 py-4 bg-[#181826] border-b border-[#2A2A3C]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37]">
              {character.roleTag}
            </span>

            <span className="text-xs text-[#8E8EA4] font-mono">
              Status: {character.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(character);
              }}
              className="py-1.5 px-3 bg-[#26263A] hover:bg-[#32324C] text-[#FAF7EE] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />

              <span>Edit Profil</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#7E7E94] hover:text-[#FAF7EE] hover:bg-[#252538] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =====================================================
            DOSSIER BODY
            ===================================================== */}

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* ===================================================
              TOP DOSSIER HERO BANNER
              =================================================== */}

          <div className="flex flex-col sm:flex-row gap-6 items-start p-5 bg-[#161624] border border-[#2A2A3C] rounded-2xl">
            {/* Character Avatar */}
            <div className="w-32 h-40 sm:w-36 sm:h-48 rounded-xl overflow-hidden bg-[#1A1A2A] border-2 border-[#D4AF37]/40 shrink-0 shadow-lg relative group">
              {character.avatarUrl ? (
                <img
                  src={character.avatarUrl}
                  alt={character.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#6E6E85] p-3 text-center bg-gradient-to-b from-[#202030] to-[#12121E]">
                  <User className="w-10 h-10 mb-2 text-[#D4AF37]/50" />

                  <span className="text-[10px] uppercase tracking-wider text-[#A0A0B5]">
                    Tanpa Foto
                  </span>
                </div>
              )}
            </div>

            {/* Core Info */}
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#FAF7EE]">
                  {character.fullName}
                </h2>

                {character.alias && (
                  <p className="text-xs text-[#D4AF37] font-medium tracking-wide mt-0.5">
                    "{character.alias}"
                  </p>
                )}
              </div>

              {/* Quick Bio Badges */}
              <div className="flex flex-wrap gap-2 pt-1">
                {character.age && (
                  <div className="px-2.5 py-1 bg-[#1E1E2E] border border-[#2A2A3C] rounded-lg text-xs text-[#C8C8DC]">
                    <span className="text-[#8E8EA4]">
                      Usia:
                    </span>{' '}
                    {character.age}
                  </div>
                )}

                {character.gender && (
                  <div className="px-2.5 py-1 bg-[#1E1E2E] border border-[#2A2A3C] rounded-lg text-xs text-[#C8C8DC]">
                    <span className="text-[#8E8EA4]">
                      Gender:
                    </span>{' '}
                    {character.gender}
                  </div>
                )}
              </div>

              {/* Associated Books */}
              {associatedBooks.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] text-[#8E8EA4] block mb-1">
                    Muncul dalam Novel:
                  </span>

                  <div className="flex flex-wrap gap-1.5">
                    {associatedBooks.map((b) => (
                      <span
                        key={b.id}
                        className="py-1 px-2.5 bg-[#202032] border border-[#303048] rounded-md text-xs text-[#E0E0E0] flex items-center gap-1.5"
                      >
                        <BookOpen className="w-3 h-3 text-[#D4AF37]" />

                        <span>{b.title}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ===================================================
              CUSTOM DYNAMIC ATTRIBUTES GRID
              =================================================== */}

          {character.customAttributes &&
            character.customAttributes.length > 0 && (
              <div className="p-4 bg-[#161624] border border-[#2A2A3C] rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                  <Shield className="w-4 h-4" />

                  <span>
                    Atribut Kustom & Spesifikasi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {character.customAttributes.map(
                    (attr) => (
                      <div
                        key={attr.id}
                        className="p-2.5 bg-[#1C1C2C] border border-[#28283C] rounded-xl flex items-center justify-between"
                      >
                        <span className="text-xs text-[#8E8EA4] font-medium">
                          {attr.key}
                        </span>

                        <span className="text-xs font-semibold text-[#FAF7EE] font-mono text-right pl-2">
                          {attr.value}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* ===================================================
              DEEP DOSSIER SECTIONS
              =================================================== */}

          <div className="space-y-4">
            {character.physicalAppearance && (
              <div className="p-4 bg-[#161624] border border-[#2A2A3C] rounded-2xl">
                <h4 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-1.5">
                  Deskripsi Fisik & Penampilan
                </h4>

                <p className="text-xs sm:text-sm text-[#C8C8DC] leading-relaxed whitespace-pre-line">
                  {character.physicalAppearance}
                </p>
              </div>
            )}

            {character.personalityTraits && (
              <div className="p-4 bg-[#161624] border border-[#2A2A3C] rounded-2xl">
                <h4 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-1.5">
                  Sifat & Pola Kepribadian
                </h4>

                <p className="text-xs sm:text-sm text-[#C8C8DC] leading-relaxed whitespace-pre-line">
                  {character.personalityTraits}
                </p>
              </div>
            )}

            {character.backstory && (
              <div className="p-4 bg-[#161624] border border-[#2A2A3C] rounded-2xl">
                <h4 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-1.5">
                  Latar Belakang & Masa Lalu
                  (Backstory)
                </h4>

                <p className="text-xs sm:text-sm text-[#C8C8DC] leading-relaxed whitespace-pre-line">
                  {character.backstory}
                </p>
              </div>
            )}

            {(character.motivation ||
              character.worldGoal) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {character.motivation && (
                  <div className="p-4 bg-[#161624] border border-[#2A2A3C] rounded-2xl">
                    <h4 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-1.5">
                      Motivasi Karakter
                    </h4>

                    <p className="text-xs sm:text-sm text-[#C8C8DC] leading-relaxed whitespace-pre-line">
                      {character.motivation}
                    </p>
                  </div>
                )}

                {character.worldGoal && (
                  <div className="p-4 bg-[#161624] border border-[#2A2A3C] rounded-2xl">
                    <h4 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-1.5">
                      Tujuan Dunia (World Goal)
                    </h4>

                    <p className="text-xs sm:text-sm text-[#C8C8DC] leading-relaxed whitespace-pre-line">
                      {character.worldGoal}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ===================================================
              RELATIONAL LINKS SECTION
              =================================================== */}

          {relationshipLinks.length > 0 && (
            <div className="p-4 bg-[#161624] border border-[#2A2A3C] rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                <Heart className="w-4 h-4" />

                <span>
                  Jejaring Hubungan Antar Karakter
                </span>
              </div>

              <div className="space-y-2">
                {relationshipLinks.map(
                  ({
                    relationship,
                    direction,
                    relatedCharacter,
                  }) => {
                    return (
                      <div
                        key={`${relationship.id}-${direction}`}
                        className="p-3 bg-[#1C1C2C] border border-[#2A2A3C] rounded-xl flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#252538] border border-[#3A3A54] flex items-center justify-center shrink-0">
                            {relatedCharacter?.avatarUrl ? (
                              <img
                                src={
                                  relatedCharacter.avatarUrl
                                }
                                alt={
                                  relatedCharacter.fullName
                                }
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-4 h-4 text-[#D4AF37]" />
                            )}
                          </div>

                          <div>
                            <div className="text-xs font-semibold text-[#FAF7EE]">
                              {relatedCharacter
                                ? relatedCharacter.fullName
                                : 'Karakter'}
                            </div>

                            {relationship.description && (
                              <div className="text-[11px] text-[#8E8EA4]">
                                {relationship.description}
                              </div>
                            )}

                            {/* Direction information */}
                            <div className="text-[10px] text-[#6F6F84] mt-0.5">
                              {direction ===
                              'outgoing'
                                ? 'Relasi dari karakter ini'
                                : 'Relasi menuju karakter ini'}
                            </div>
                          </div>
                        </div>

                        <span className="py-1 px-2.5 bg-[#252538] border border-[#3A3A54] rounded-lg text-xs font-semibold text-[#D4AF37]">
                          {relationship.relationType}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
