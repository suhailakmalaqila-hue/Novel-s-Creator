import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  CharacterWiki,
  CharacterMention,
} from "../types";

import {
  CharacterInput,
  RelationshipInput,
  CustomAttributeInput,
  CharacterMentionInput,
  CharacterMentionUpdateInput,

  getCharacters,
  createCharacter,
  updateCharacter,
  deleteCharacter,

  createRelationship,
  updateRelationship,
  deleteRelationship,

  createCustomAttribute,
  updateCustomAttribute,
  deleteCustomAttribute,

  getMentions,
  createMention,
  updateMention,
  deleteMention,
} from "../services/character.service";

import { useAuth } from "./AuthContext";

interface CharacterContextValue {
  characters: CharacterWiki[];

  loading: boolean;
  error: string | null;

  refreshCharacters: (
    bookId?: string
  ) => Promise<void>;

  addCharacter: (
    input: CharacterInput
  ) => Promise<CharacterWiki>;

  editCharacter: (
    characterId: string,
    input: Partial<CharacterInput>
  ) => Promise<CharacterWiki>;

  removeCharacter: (
    characterId: string
  ) => Promise<void>;

  addRelationship: (
    characterId: string,
    input: RelationshipInput
  ) => Promise<void>;

  editRelationship: (
    characterId: string,
    relationshipId: string,
    input: Partial<RelationshipInput>
  ) => Promise<void>;

  removeRelationship: (
    characterId: string,
    relationshipId: string
  ) => Promise<void>;

  addCustomAttribute: (
    characterId: string,
    input: CustomAttributeInput
  ) => Promise<void>;

  editCustomAttribute: (
    characterId: string,
    attributeId: string,
    input: Partial<CustomAttributeInput>
  ) => Promise<void>;

  removeCustomAttribute: (
    characterId: string,
    attributeId: string
  ) => Promise<void>;

  mentions: CharacterMention[];

  refreshMentions: (
    bookId: string,
    chapterId: string
  ) => Promise<void>;

  addMention: (
    bookId: string,
    chapterId: string,
    input: CharacterMentionInput
  ) => Promise<CharacterMention>;

  editMention: (
    bookId: string,
    chapterId: string,
    mentionId: string,
    input: CharacterMentionUpdateInput
  ) => Promise<CharacterMention>;

  removeMention: (
    bookId: string,
    chapterId: string,
    mentionId: string
  ) => Promise<void>;
}

const CharacterContext =
  createContext<CharacterContextValue | undefined>(
    undefined
  );

export const CharacterProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const {
    user,
    isAuthenticated,
  } = useAuth();

  const [characters, setCharacters] =
    useState<CharacterWiki[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [mentions, setMentions] =
    useState<CharacterMention[]>([]);

  /**
   * =========================================================
   * REQUEST VERSION
   * =========================================================
   *
   * Setiap perubahan user membuat request sebelumnya
   * tidak lagi valid.
   *
   * IMPORTANT:
   * Request version hanya dinaikkan ketika memang
   * ada perubahan identity atau ketika refresh baru dimulai.
   */
  const characterRequestIdRef =
    useRef(0);

  /**
   * Identity user yang sedang aktif.
   *
   * Kita simpan di ref agar callback async dapat
   * memeriksa bahwa response masih milik user yang benar.
   */
  const activeUserIdRef =
    useRef<string | null>(null);

  /**
   * =========================================================
   * RESET KETIKA IDENTITY USER BERUBAH
   * =========================================================
   *
   * Effect ini HANYA:
   *
   * - membatalkan request lama
   * - membersihkan data user sebelumnya
   * - membersihkan error
   *
   * Effect ini TIDAK memanggil refreshCharacters().
   *
   * Loading karakter dilakukan oleh effect khusus di bawah.
   */
  useEffect(() => {
    const nextUserId =
      isAuthenticated && user?.id
        ? user.id
        : null;

    const previousUserId =
      activeUserIdRef.current;

    /**
     * Tidak melakukan reset jika identity
     * sebenarnya masih sama.
     */
    if (
      previousUserId ===
      nextUserId
    ) {
      return;
    }

    /**
     * Tandai identity baru.
     */
    activeUserIdRef.current =
      nextUserId;

    /**
     * Invalidasi semua request sebelumnya.
     */
    characterRequestIdRef.current += 1;

    /**
     * Jangan pernah membawa data character
     * user sebelumnya ke user baru.
     */
    setCharacters([]);

    setMentions([]);

    setError(null);

    if (!nextUserId) {
      setLoading(false);
    }
  }, [
    isAuthenticated,
    user?.id,
  ]);

  /**
   * =========================================================
   * REFRESH CHARACTERS
   * =========================================================
   */
  const refreshCharacters =
    useCallback(
      async (bookId?: string) => {
        const currentUserId =
          activeUserIdRef.current;

        /**
         * Jangan request jika belum ada user aktif.
         */
        if (
          !isAuthenticated ||
          !user?.id ||
          !currentUserId
        ) {
          setCharacters([]);
          setLoading(false);
          return;
        }

        /**
         * Pastikan ref identity masih sama
         * dengan AuthContext.
         */
        if (
          currentUserId !==
          user.id
        ) {
          return;
        }

        /**
         * Request baru membatalkan request lama.
         */
        const requestId =
          ++characterRequestIdRef.current;

        try {
          setLoading(true);
          setError(null);

          const data =
            await getCharacters(bookId);

          /**
           * Jangan biarkan response request lama
           * menimpa state.
           */
          if (
            requestId !==
            characterRequestIdRef.current
          ) {
            return;
          }

          /**
           * Jangan memasukkan response jika
           * user sudah berganti ketika request berjalan.
           */
          if (
            activeUserIdRef.current !==
            user.id
          ) {
            return;
          }

          setCharacters(
            Array.isArray(data)
              ? data
              : []
          );
        } catch (err: any) {
          /**
           * Request lama tidak boleh mengubah error
           * user yang sekarang.
           */
          if (
            requestId !==
            characterRequestIdRef.current
          ) {
            return;
          }

          if (
            activeUserIdRef.current !==
            user.id
          ) {
            return;
          }

          console.error(
            "Gagal mengambil characters:",
            err
          );

          setError(
            err?.message ??
              "Gagal mengambil characters"
          );

          setCharacters([]);

          throw err;
        } finally {
          if (
            requestId ===
            characterRequestIdRef.current
          ) {
            setLoading(false);
          }
        }
      },
      [
        isAuthenticated,
        user?.id,
      ]
    );

  /**
   * =========================================================
   * INITIAL LOAD / USER CHANGE
   * =========================================================
   *
   * CharacterContext sendiri yang melakukan
   * initial character loading.
   *
   * Dengan demikian App.tsx tidak perlu lagi
   * memanggil refreshCharacters() saat user berubah.
   */
  useEffect(() => {
    if (
      !isAuthenticated ||
      !user?.id
    ) {
      return;
    }

    /**
     * Identity ref sudah diset oleh effect
     * reset di atas.
     *
     * Jalankan request hanya dari sini.
     */
    void refreshCharacters();
  }, [
    isAuthenticated,
    user?.id,
    refreshCharacters,
  ]);

  /**
   * =========================================================
   * ADD CHARACTER
   * =========================================================
   */
  const addCharacter =
    useCallback(
      async (
        input: CharacterInput
      ) => {
        const character =
          await createCharacter(input);

        /**
         * Hanya update state jika user masih aktif.
         */
        if (
          isAuthenticated &&
          user?.id &&
          activeUserIdRef.current ===
            user.id
        ) {
          setCharacters((prev) => [
            character,
            ...prev,
          ]);
        }

        return character;
      },
      [
        isAuthenticated,
        user?.id,
      ]
    );

  /**
   * =========================================================
   * EDIT CHARACTER
   * =========================================================
   */
  const editCharacter =
    useCallback(
      async (
        characterId: string,
        input: Partial<CharacterInput>
      ) => {
        const character =
          await updateCharacter(
            characterId,
            input
          );

        if (
          isAuthenticated &&
          user?.id &&
          activeUserIdRef.current ===
            user.id
        ) {
          setCharacters((prev) =>
            prev.map((item) =>
              item.id === characterId
                ? character
                : item
            )
          );
        }

        return character;
      },
      [
        isAuthenticated,
        user?.id,
      ]
    );

  /**
   * =========================================================
   * DELETE CHARACTER
   * =========================================================
   */
  const removeCharacter =
    useCallback(
      async (
        characterId: string
      ) => {
        await deleteCharacter(
          characterId
        );

        setCharacters((prev) =>
          prev.filter(
            (item) =>
              item.id !== characterId
          )
        );
      },
      []
    );

  /**
   * =========================================================
   * ADD RELATIONSHIP
   * =========================================================
   */
  const addRelationship =
    useCallback(
      async (
        characterId: string,
        input: RelationshipInput
      ) => {
        await createRelationship(
          characterId,
          input
        );

        await refreshCharacters();
      },
      [
        refreshCharacters,
      ]
    );

  /**
   * =========================================================
   * EDIT RELATIONSHIP
   * =========================================================
   */
  const editRelationship =
    useCallback(
      async (
        characterId: string,
        relationshipId: string,
        input: Partial<RelationshipInput>
      ) => {
        await updateRelationship(
          characterId,
          relationshipId,
          input
        );

        await refreshCharacters();
      },
      [
        refreshCharacters,
      ]
    );

  /**
   * =========================================================
   * DELETE RELATIONSHIP
   * =========================================================
   */
  const removeRelationship =
    useCallback(
      async (
        characterId: string,
        relationshipId: string
      ) => {
        await deleteRelationship(
          characterId,
          relationshipId
        );

        await refreshCharacters();
      },
      [
        refreshCharacters,
      ]
    );

  /**
   * =========================================================
   * ADD CUSTOM ATTRIBUTE
   * =========================================================
   */
  const addCustomAttribute =
    useCallback(
      async (
        characterId: string,
        input: CustomAttributeInput
      ) => {
        await createCustomAttribute(
          characterId,
          input
        );

        await refreshCharacters();
      },
      [
        refreshCharacters,
      ]
    );

  /**
   * =========================================================
   * EDIT CUSTOM ATTRIBUTE
   * =========================================================
   */
  const editCustomAttribute =
    useCallback(
      async (
        characterId: string,
        attributeId: string,
        input: Partial<CustomAttributeInput>
      ) => {
        await updateCustomAttribute(
          characterId,
          attributeId,
          input
        );

        await refreshCharacters();
      },
      [
        refreshCharacters,
      ]
    );

  /**
   * =========================================================
   * DELETE CUSTOM ATTRIBUTE
   * =========================================================
   */
  const removeCustomAttribute =
    useCallback(
      async (
        characterId: string,
        attributeId: string
      ) => {
        await deleteCustomAttribute(
          characterId,
          attributeId
        );

        await refreshCharacters();
      },
      [
        refreshCharacters,
      ]
    );

  /**
   * =========================================================
   * MENTIONS
   * =========================================================
   */

  const refreshMentions =
    useCallback(
      async (
        bookId: string,
        chapterId: string
      ) => {
        if (
          !isAuthenticated ||
          !user?.id ||
          activeUserIdRef.current !==
            user.id
        ) {
          setMentions([]);
          return;
        }

        const data =
          await getMentions(
            bookId,
            chapterId
          );

        /**
         * Jangan memasukkan mention jika user
         * sudah berganti ketika request berjalan.
         */
        if (
          activeUserIdRef.current !==
          user.id
        ) {
          return;
        }

        setMentions(data);
      },
      [
        isAuthenticated,
        user?.id,
      ]
    );

  const addMention =
    useCallback(
      async (
        bookId: string,
        chapterId: string,
        input: CharacterMentionInput
      ) => {
        const mention =
          await createMention(
            bookId,
            chapterId,
            input
          );

        if (
          activeUserIdRef.current ===
          user?.id
        ) {
          setMentions((prev) => [
            ...prev,
            mention,
          ]);
        }

        return mention;
      },
      [
        user?.id,
      ]
    );

  const editMention =
    useCallback(
      async (
        bookId: string,
        chapterId: string,
        mentionId: string,
        input: CharacterMentionUpdateInput
      ) => {
        const mention =
          await updateMention(
            bookId,
            chapterId,
            mentionId,
            input
          );

        if (
          activeUserIdRef.current ===
          user?.id
        ) {
          setMentions((prev) =>
            prev.map((item) =>
              item.id === mentionId
                ? mention
                : item
            )
          );
        }

        return mention;
      },
      [
        user?.id,
      ]
    );

  const removeMention =
    useCallback(
      async (
        bookId: string,
        chapterId: string,
        mentionId: string
      ) => {
        await deleteMention(
          bookId,
          chapterId,
          mentionId
        );

        setMentions((prev) =>
          prev.filter(
            (item) =>
              item.id !== mentionId
          )
        );
      },
      []
    );

  return (
    <CharacterContext.Provider
      value={{
        characters,
        loading,
        error,

        refreshCharacters,
        addCharacter,
        editCharacter,
        removeCharacter,

        addRelationship,
        editRelationship,
        removeRelationship,

        addCustomAttribute,
        editCustomAttribute,
        removeCustomAttribute,

        mentions,
        refreshMentions,
        addMention,
        editMention,
        removeMention,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
};

export function useCharacters() {
  const context =
    useContext(CharacterContext);

  if (!context) {
    throw new Error(
      "useCharacters harus digunakan di dalam CharacterProvider"
    );
  }

  return context;
}
