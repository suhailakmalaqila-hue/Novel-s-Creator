import React, {
  useMemo,
} from 'react';

import {
  AtSign,
  ChevronRight,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';

import {
  CharacterMention,
  CharacterWiki,
} from '../../types';

interface CharacterMentionPanelProps {
  characters: CharacterWiki[];
  mentions: CharacterMention[];
  content: string;
  disabled?: boolean;
  onNavigate: (
    mention: CharacterMention
  ) => void;
  onRemove: (
    mention: CharacterMention
  ) => Promise<void>;
  onClose?: () => void;
}

interface MentionGroup {
  character: CharacterWiki | null;
  characterId: string;
  mentions: CharacterMention[];
}

export const CharacterMentionPanel: React.FC<
  CharacterMentionPanelProps
> = ({
  characters,
  mentions,
  content,
  disabled = false,
  onNavigate,
  onRemove,
  onClose,
}) => {
  const characterMap =
    useMemo(() => {
      return new Map(
        characters.map(
          (character) => [
            character.id,
            character,
          ]
        )
      );
    }, [characters]);

  const groups =
    useMemo<MentionGroup[]>(() => {
      const grouped =
        new Map<
          string,
          CharacterMention[]
        >();

      for (const mention of mentions) {
        const current =
          grouped.get(
            mention.characterId
          ) ?? [];

        current.push(mention);

        grouped.set(
          mention.characterId,
          current
        );
      }

      return Array.from(
        grouped.entries()
      )
        .map(
          ([
            characterId,
            characterMentions,
          ]) => ({
            character:
              characterMap.get(
                characterId
              ) ?? null,
            characterId,
            mentions:
              [...characterMentions].sort(
                (a, b) =>
                  (a.startOffset ??
                    0) -
                  (b.startOffset ??
                    0)
              ),
          })
        )
        .sort((a, b) => {
          const aPosition =
            a.mentions[0]
              ?.startOffset ?? 0;

          const bPosition =
            b.mentions[0]
              ?.startOffset ?? 0;

          return (
            aPosition - bPosition
          );
        });
    }, [
      mentions,
      characterMap,
    ]);

  const getMentionText =
    (
      mention: CharacterMention
    ) => {
      if (
        mention.startOffset ===
          undefined ||
        mention.endOffset ===
          undefined
      ) {
        return mention.displayText;
      }

      const text =
        content.slice(
          mention.startOffset,
          mention.endOffset
        );

      return (
        text ||
        mention.displayText
      );
    };

  const getMentionNumber =
    (
      mention: CharacterMention
    ) => {
      const index =
        mentions
          .filter(
            (item) =>
              item.characterId ===
              mention.characterId
          )
          .sort(
            (a, b) =>
              (a.startOffset ??
                0) -
              (b.startOffset ??
                0)
          )
          .findIndex(
            (item) =>
              item.id ===
              mention.id
          );

      return index + 1;
    };

  return (
    <aside className="w-full lg:w-[300px] xl:w-[320px] shrink-0 bg-[#1E1E2E] border border-[#2A2A3C] rounded-2xl overflow-hidden flex flex-col max-h-[650px]">
      {/* HEADER */}
      <div className="px-4 py-3.5 border-b border-[#2A2A3C] bg-[#202032]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
              <AtSign className="w-4 h-4 text-[#D4AF37]" />
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[#FAF7EE]">
                Character Mentions
              </h3>

              <p className="text-[10px] text-[#77778F] mt-0.5">
                Mention dalam chapter ini
              </p>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#6E6E85] hover:text-[#FAF7EE] hover:bg-[#2A2A3E] rounded-lg transition-colors cursor-pointer"
              title="Tutup panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-[#77778F]">
            Total mention
          </span>

          <span className="text-xs font-mono font-semibold text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-2 py-0.5 rounded-full">
            {mentions.length}
          </span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-2.5">
        {mentions.length === 0 ? (
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center px-5">
            <div className="w-11 h-11 rounded-xl bg-[#242438] border border-[#35354C] flex items-center justify-center mb-3">
              <AtSign className="w-5 h-5 text-[#55556C]" />
            </div>

            <h4 className="text-xs font-semibold text-[#B8B8CB] mb-1">
              Belum ada character mention
            </h4>

            <p className="text-[10px] text-[#6E6E85] leading-relaxed">
              Pilih teks pada naskah lalu
              gunakan tombol{' '}
              <span className="text-[#D4AF37]">
                Character
              </span>{' '}
              di toolbar untuk membuat
              mention.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => {
              const character =
                group.character;

              return (
                <div
                  key={
                    group.characterId
                  }
                  className="bg-[#181826] border border-[#2A2A3C] rounded-xl overflow-hidden"
                >
                  {/* CHARACTER HEADER */}
                  <div className="px-3 py-2.5 flex items-center gap-2.5 border-b border-[#2A2A3C]">
                    <div className="w-8 h-8 rounded-lg bg-[#242438] border border-[#35354C] flex items-center justify-center overflow-hidden shrink-0">
                      {character?.avatarUrl ? (
                        <img
                          src={
                            character.avatarUrl
                          }
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserRound className="w-4 h-4 text-[#D4AF37]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-[#FAF7EE] truncate">
                        {character
                          ?.fullName ??
                          'Character'}
                      </div>

                      {character?.alias && (
                        <div className="text-[9px] text-[#77778F] truncate">
                          {
                            character.alias
                          }
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-1.5 py-0.5 rounded-full">
                      {
                        group.mentions
                          .length
                      }x
                    </span>
                  </div>

                  {/* MENTIONS */}
                  <div className="p-1.5 space-y-1">
                    {group.mentions.map(
                      (mention) => {
                        const mentionText =
                          getMentionText(
                            mention
                          );

                        const position =
                          mention.startOffset ??
                          0;

                        const mentionNumber =
                          getMentionNumber(
                            mention
                          );

                        return (
                          <div
                            key={
                              mention.id
                            }
                            className="group flex items-center gap-1 rounded-lg hover:bg-[#242438] transition-colors"
                          >
                            <button
                              type="button"
                              disabled={
                                disabled
                              }
                              onClick={() =>
                                onNavigate(
                                  mention
                                )
                              }
                              className="flex-1 min-w-0 px-2.5 py-2 text-left cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                              title="Pergi ke mention pada naskah"
                            >
                              <div className="flex items-start gap-2">
                                <span className="text-[9px] font-mono text-[#5F5F76] mt-0.5 shrink-0">
                                  #
                                  {
                                    mentionNumber
                                  }
                                </span>

                                <div className="min-w-0 flex-1">
                                  <div className="text-[11px] text-[#D8D8E6] truncate">
                                    “
                                    {
                                      mentionText
                                    }
                                    ”
                                  </div>

                                  <div className="text-[9px] text-[#5F5F76] mt-0.5">
                                    Posisi{' '}
                                    {position.toLocaleString()}
                                  </div>
                                </div>

                                <ChevronRight className="w-3 h-3 text-[#55556C] group-hover:text-[#D4AF37] shrink-0 mt-0.5 transition-colors" />
                              </div>
                            </button>

                            <button
                              type="button"
                              disabled={
                                disabled
                              }
                              onClick={() =>
                                void onRemove(
                                  mention
                                )
                              }
                              className="mr-1 p-1.5 text-[#55556C] hover:text-red-300 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:cursor-not-allowed"
                              title="Hapus character mention"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FOOTER */}
      {mentions.length > 0 && (
        <div className="px-3 py-2.5 border-t border-[#2A2A3C] bg-[#181826]">
          <p className="text-[9px] text-[#606077] leading-relaxed">
            Klik mention untuk menuju
            lokasinya di naskah. Menghapus
            mention tidak menghapus teks
            naskah.
          </p>
        </div>
      )}
    </aside>
  );
};

export default CharacterMentionPanel;
