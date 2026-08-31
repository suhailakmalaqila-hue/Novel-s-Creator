import React from 'react';
import { CharacterWiki } from '../../types';
import { X, Network, User, ArrowRight } from 'lucide-react';

interface RelationshipGraphModalProps {
  isOpen: boolean;
  characters: CharacterWiki[];
  onClose: () => void;
  onSelectCharacter: (char: CharacterWiki) => void;
}

export const RelationshipGraphModal: React.FC<RelationshipGraphModalProps> = ({
  isOpen,
  characters,
  onClose,
  onSelectCharacter,
}) => {
  if (!isOpen) return null;

  // Flatten all relationship links
  const allLinks: {
    source: CharacterWiki;
    target: CharacterWiki;
    relationType: string;
    description: string;
  }[] = [];

  characters.forEach((source) => {
    source.relationships.forEach((rel) => {
      const target = characters.find((c) => c.id === rel.targetCharacterId);
      if (target) {
        allLinks.push({
          source,
          target,
          relationType: rel.relationType,
          description: rel.description,
        });
      }
    });
  });

  return (
    <div
      id="relationship-graph-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-4xl bg-[#1E1E2E] border border-[#2A2A3C] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#181826] border-b border-[#2A2A3C]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#252538] rounded-xl border border-[#D4AF37]/30 text-[#D4AF37]">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#FAF7EE]">
                Matriks Jejaring & Relasi Karakter
              </h3>
              <p className="text-xs text-[#9E9EB2]">
                Peta relasi antar tokoh (Sahabat, Rival, Musuh Bebuyutan, Pasangan, dll.)
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {characters.length < 2 ? (
            <div className="py-12 text-center text-[#8E8EA4] border border-dashed border-[#2A2A3C] rounded-2xl bg-[#161624]">
              <Network className="w-10 h-10 mx-auto mb-2 text-[#D4AF37]/40" />
              <p className="text-sm font-semibold text-[#FAF7EE] mb-1">
                Minimal butuh 2 karakter untuk melihat matriks relasi.
              </p>
              <p className="text-xs text-[#8E8EA4]">
                Tambahkan lebih banyak karakter di wiki dan buat hubungan relasi antar tokoh.
              </p>
            </div>
          ) : allLinks.length === 0 ? (
            <div className="py-12 text-center text-[#8E8EA4] border border-dashed border-[#2A2A3C] rounded-2xl bg-[#161624]">
              <Network className="w-10 h-10 mx-auto mb-2 text-[#D4AF37]/40" />
              <p className="text-sm font-semibold text-[#FAF7EE] mb-1">
                Belum ada relasi yang dihubungkan antar karakter.
              </p>
              <p className="text-xs text-[#8E8EA4]">
                Buka salah satu profil karakter dan tambahkan relasi di tab "Jejaring Relasi".
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                Total {allLinks.length} Tautan Hubungan Terdeteksi:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allLinks.map((link, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-[#161624] border border-[#2A2A3C] hover:border-[#D4AF37]/40 rounded-2xl flex flex-col justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      {/* Source Character */}
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectCharacter(link.source);
                        }}
                        className="flex items-center gap-2 text-left hover:text-[#D4AF37] transition-colors cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#222234] border border-[#3A3A54] flex items-center justify-center shrink-0">
                          {link.source.avatarUrl ? (
                            <img
                              src={link.source.avatarUrl}
                              alt={link.source.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-[#D4AF37]" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-[#FAF7EE]">
                            {link.source.fullName}
                          </div>
                          <div className="text-[10px] text-[#8E8EA4]">
                            {link.source.roleTag}
                          </div>
                        </div>
                      </button>

                      {/* Relationship Pill */}
                      <div className="flex flex-col items-center px-2">
                        <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] whitespace-nowrap">
                          {link.relationType}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#6E6E85] mt-0.5" />
                      </div>

                      {/* Target Character */}
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectCharacter(link.target);
                        }}
                        className="flex items-center gap-2 text-right hover:text-[#D4AF37] transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="text-xs font-semibold text-[#FAF7EE]">
                            {link.target.fullName}
                          </div>
                          <div className="text-[10px] text-[#8E8EA4]">
                            {link.target.roleTag}
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#222234] border border-[#3A3A54] flex items-center justify-center shrink-0">
                          {link.target.avatarUrl ? (
                            <img
                              src={link.target.avatarUrl}
                              alt={link.target.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-[#D4AF37]" />
                          )}
                        </div>
                      </button>
                    </div>

                    {link.description && (
                      <p className="text-[11px] text-[#9E9EB2] bg-[#1A1A28] p-2 rounded-lg border border-[#242436] italic">
                        "{link.description}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
