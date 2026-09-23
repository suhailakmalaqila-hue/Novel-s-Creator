import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  AtSign,
  Check,
  ChevronDown,
  UserRound,
} from 'lucide-react';

import {
  CharacterMention,
  CharacterWiki,
} from '../../types';

interface CharacterMentionPickerProps {
  characters: CharacterWiki[];
  mentions: CharacterMention[];
  disabled?: boolean;
  error?: string | null;
  onCreateMention: (
    character: CharacterWiki,
    selectionStart: number,
    selectionEnd: number
  ) => Promise<void>;
}

export const CharacterMentionPicker: React.FC<
  CharacterMentionPickerProps
> = ({
  characters,
  mentions,
  disabled = false,
  error = null,
  onCreateMention,
}) => {
  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState('');

  const wrapperRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown =
      (event: MouseEvent) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(
            event.target as Node
          )
        ) {
          setIsOpen(false);
        }
      };

    document.addEventListener(
      'mousedown',
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handlePointerDown
      );
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  const filteredCharacters =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return characters;
      }

      return characters.filter(
        (character) => {
          const fullName =
            character.fullName
              .toLowerCase();

          const alias =
            character.alias
              ?.toLowerCase() ?? '';

          return (
            fullName.includes(
              keyword
            ) ||
            alias.includes(
              keyword
            )
          );
        }
      );
    }, [
      characters,
      search,
    ]);

  const handleCharacterClick =
    async (
      character: CharacterWiki
    ) => {
      const textarea =
        document.getElementById(
          'editor-manuscript-textarea'
        ) as HTMLTextAreaElement | null;

      if (!textarea) {
        return;
      }

      const start =
        textarea.selectionStart;

      const end =
        textarea.selectionEnd;

      await onCreateMention(
        character,
        start,
        end
      );

      setSearch('');
      setIsOpen(false);

      requestAnimationFrame(() => {
        textarea.focus();
      });
    };

  const characterMentionCount =
    (characterId: string) =>
      mentions.filter(
        (mention) =>
          mention.characterId ===
          characterId
      ).length;

  return (
    <div
      ref={wrapperRef}
      className="relative"
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          setIsOpen(
            (current) => !current
          )
        }
        className={`py-1 px-2.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen
            ? 'bg-[#D4AF37] text-[#121212]'
            : 'text-[#D4AF37] hover:bg-[#2A2A3E]'
        }`}
        title="Tambahkan Character Mention"
      >
        <AtSign className="w-3.5 h-3.5" />

        <span>Character</span>

        <ChevronDown
          className={`w-3 h-3 transition-transform ${
            isOpen
              ? 'rotate-180'
              : ''
          }`}
        />

        {mentions.length > 0 && (
          <span
            className={`min-w-[18px] h-[18px] px-1 rounded-full text-[9px] flex items-center justify-center font-mono ${
              isOpen
                ? 'bg-[#121212]/15'
                : 'bg-[#D4AF37]/15 text-[#D4AF37]'
            }`}
          >
            {mentions.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-[60] w-[310px] bg-[#1E1E2E] border border-[#35354C] rounded-xl shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-[#2A2A3C]">
            <div className="flex items-center gap-2 mb-2">
              <AtSign className="w-3.5 h-3.5 text-[#D4AF37]" />

              <div>
                <p className="text-xs font-semibold text-[#FAF7EE]">
                  Character Mention
                </p>

                <p className="text-[10px] text-[#77778F]">
                  Tandai teks dengan karakter
                  tertentu.
                </p>
              </div>
            </div>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Cari karakter..."
              autoFocus
              className="w-full px-3 py-2 bg-[#161624] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-lg text-xs text-[#FAF7EE] placeholder-[#5F5F76] outline-none"
            />
          </div>

          <div className="max-h-72 overflow-y-auto p-1.5">
            {filteredCharacters.length ===
            0 ? (
              <div className="px-3 py-7 text-center">
                <div className="w-9 h-9 mx-auto mb-2 rounded-xl bg-[#242438] border border-[#35354C] flex items-center justify-center">
                  <UserRound className="w-4 h-4 text-[#55556C]" />
                </div>

                <p className="text-xs text-[#7E7E94]">
                  {characters.length ===
                  0
                    ? 'Belum ada karakter yang terhubung dengan buku ini.'
                    : 'Karakter tidak ditemukan.'}
                </p>
              </div>
            ) : (
              filteredCharacters.map(
                (character) => {
                  const mentionCount =
                    characterMentionCount(
                      character.id
                    );

                  return (
                    <button
                      key={
                        character.id
                      }
                      type="button"
                      disabled={
                        disabled
                      }
                      onClick={() =>
                        void handleCharacterClick(
                          character
                        )
                      }
                      className="w-full px-3 py-2.5 rounded-lg hover:bg-[#2A2A3E] disabled:opacity-50 text-left transition-colors flex items-center gap-2.5 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#242438] border border-[#35354C] flex items-center justify-center shrink-0 overflow-hidden">
                        {character.avatarUrl ? (
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
                          {
                            character.fullName
                          }
                        </div>

                        {character.alias && (
                          <div className="text-[10px] text-[#7E7E94] truncate">
                            {character.alias}
                          </div>
                        )}
                      </div>

                      {mentionCount >
                      0 && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-1.5 py-0.5 rounded-full">
                            {mentionCount}x
                          </span>

                          <Check className="w-3.5 h-3.5 text-[#34D399]" />
                        </div>
                      )}
                    </button>
                  );
                }
              )
            )}
          </div>

          <div className="px-3 py-2.5 border-t border-[#2A2A3C] bg-[#181826]">
            <p className="text-[10px] text-[#77778F] leading-relaxed">
              <span className="text-[#D4AF37] font-semibold">
                Pilih teks
              </span>{' '}
              di editor untuk menjadikannya
              mention. Jika tidak ada teks
              yang dipilih, nama karakter akan
              dimasukkan otomatis.
            </p>

            {error && (
              <div className="mt-2 px-2.5 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-[10px] text-red-300">
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterMentionPicker;
