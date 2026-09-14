import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

import {
  CharacterWiki,
} from "../types";

import {
  CharacterInput,
  RelationshipInput,
  CustomAttributeInput,
  CharacterMentionInput,

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
  deleteMention,
} from "../services/character.service";

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

  mentions: any[];

  refreshMentions: (
    bookId: string,
    chapterId: string
  ) => Promise<void>;

  addMention: (
    bookId: string,
    chapterId: string,
    input: CharacterMentionInput
  ) => Promise<void>;

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
  const [characters, setCharacters] =
    useState<CharacterWiki[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [mentions, setMentions] =
    useState<any[]>([]);

  const refreshCharacters =
    useCallback(async (bookId?: string) => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await getCharacters(bookId);

        setCharacters(data);
      } catch (err: any) {
        console.error(
          "Gagal mengambil characters:",
          err
        );

        setError(
          err?.message ??
            "Gagal mengambil characters"
        );

        throw err;
      } finally {
        setLoading(false);
      }
    }, []);

  const addCharacter =
    useCallback(
      async (input: CharacterInput) => {
        const character =
          await createCharacter(input);

        setCharacters((prev) => [
          character,
          ...prev,
        ]);

        return character;
      },
      []
    );

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

        setCharacters((prev) =>
          prev.map((item) =>
            item.id === characterId
              ? character
              : item
          )
        );

        return character;
      },
      []
    );

  const removeCharacter =
    useCallback(
      async (characterId: string) => {
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

        const updated =
          await getCharacters();

        setCharacters(updated);
      },
      []
    );

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

        const updated =
          await getCharacters();

        setCharacters(updated);
      },
      []
    );

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

        const updated =
          await getCharacters();

        setCharacters(updated);
      },
      []
    );

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

        const updated =
          await getCharacters();

        setCharacters(updated);
      },
      []
    );

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

        const updated =
          await getCharacters();

        setCharacters(updated);
      },
      []
    );

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

        const updated =
          await getCharacters();

        setCharacters(updated);
      },
      []
    );

  const refreshMentions =
    useCallback(
      async (
        bookId: string,
        chapterId: string
      ) => {
        const data =
          await getMentions(
            bookId,
            chapterId
          );

        setMentions(data);
      },
      []
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

        setMentions((prev) => [
          ...prev,
          mention,
        ]);
      },
      []
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
