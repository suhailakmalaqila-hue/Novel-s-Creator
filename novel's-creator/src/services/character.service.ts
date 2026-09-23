import { apiRequest } from "./api";

import {
  CharacterWiki,
  CharacterRelationship,
  CustomAttribute,
  CharacterMention,
} from "../types";

function mapCharacter(data: any): CharacterWiki {
  return {
    id: data.id,
    fullName: data.full_name ?? "",
    alias: data.alias ?? "",
    age: data.age ?? "",
    gender: data.gender ?? "",
    roleTag: data.role_tag,
    status: data.status,
    avatarUrl: data.avatar_url ?? "",
    physicalAppearance:
      data.physical_appearance ?? "",
    personalityTraits:
      data.personality_traits ?? "",
    backstory: data.backstory ?? "",
    motivation: data.motivation ?? "",
    worldGoal: data.world_goal ?? "",

    customAttributes: (
      data.custom_attributes ?? []
    ).map((item: any): CustomAttribute => ({
      id: item.id,
      key: item.key,
      value: item.value ?? "",
    })),

    relationships: (
      data.relationships ?? []
    ).map(
      (item: any): CharacterRelationship => ({
        id: item.id,
        targetCharacterId:
          item.targetCharacterId ??
          item.target_character_id,
        relationType:
          item.relationType ??
          item.relation_type ??
          "",
        description:
          item.description ?? "",
      })
    ),

    bookIds:
      data.book_ids ??
      data.bookIds ??
      [],

    createdAt: new Date(
      data.created_at
    ).getTime(),

    updatedAt: new Date(
      data.updated_at
    ).getTime(),
  };
}

/**
 * ============================================================
 * CHARACTER MENTION MAPPER
 * ============================================================
 *
 * Backend menggunakan snake_case dari PostgreSQL/API.
 * Frontend menggunakan camelCase.
 *
 * Jangan mengembalikan response mention mentah ke React.
 */
function mapCharacterMention(
  data: any
): CharacterMention {
  return {
    id: String(data.id),

    chapterId:
      data.chapterId ??
      data.chapter_id ??
      "",

    characterId:
      data.characterId ??
      data.character_id ??
      "",

    displayText:
      data.displayText ??
      data.display_text ??
      "",

    startOffset:
      data.startOffset ??
      data.start_offset ??
      undefined,

    endOffset:
      data.endOffset ??
      data.end_offset ??
      undefined,

    characterName:
      data.characterName ??
      data.character_name ??
      undefined,

    characterAlias:
      data.characterAlias ??
      data.character_alias ??
      undefined,

    createdAt: data.createdAt
      ? new Date(
          data.createdAt
        ).getTime()
      : data.created_at
      ? new Date(
          data.created_at
        ).getTime()
      : Date.now(),
  };
}

export interface CharacterInput {
  fullName: string;
  alias?: string;
  age?: string;
  gender?: string;
  roleTag?: string;
  status?: string;
  avatarUrl?: string;
  physicalAppearance?: string;
  personalityTraits?: string;
  backstory?: string;
  motivation?: string;
  worldGoal?: string;
  bookIds?: string[];
}

export async function getCharacters(
  bookId?: string
): Promise<CharacterWiki[]> {
  const query = bookId
    ? `?bookId=${encodeURIComponent(bookId)}`
    : "";

  const response = await apiRequest<any[]>(
    `/characters${query}`
  );

  return response.map(mapCharacter);
}

export async function getCharacter(
  characterId: string
): Promise<CharacterWiki> {
  const response =
    await apiRequest<any>(
      `/characters/${characterId}`
    );

  return mapCharacter(response);
}

export async function createCharacter(
  input: CharacterInput
): Promise<CharacterWiki> {
  const response =
    await apiRequest<any>(
      "/characters",
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    );

  return mapCharacter(response);
}

export async function updateCharacter(
  characterId: string,
  input: Partial<CharacterInput>
): Promise<CharacterWiki> {
  const response =
    await apiRequest<any>(
      `/characters/${characterId}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      }
    );

  return mapCharacter(response);
}

export async function deleteCharacter(
  characterId: string
): Promise<void> {
  await apiRequest(
    `/characters/${characterId}`,
    {
      method: "DELETE",
    }
  );
}

export interface RelationshipInput {
  targetCharacterId: string;
  relationType: string;
  description?: string;
}

export async function getRelationships(
  characterId: string
) {
  return apiRequest<any[]>(
    `/characters/${characterId}/relationships`
  );
}

export async function createRelationship(
  characterId: string,
  input: RelationshipInput
) {
  return apiRequest<any>(
    `/characters/${characterId}/relationships`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export async function updateRelationship(
  characterId: string,
  relationshipId: string,
  input: Partial<RelationshipInput>
) {
  return apiRequest<any>(
    `/characters/${characterId}/relationships/${relationshipId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );
}

export async function deleteRelationship(
  characterId: string,
  relationshipId: string
) {
  return apiRequest(
    `/characters/${characterId}/relationships/${relationshipId}`,
    {
      method: "DELETE",
    }
  );
}

export interface CustomAttributeInput {
  key: string;
  value?: string;
}

export async function getCustomAttributes(
  characterId: string
) {
  return apiRequest<any[]>(
    `/characters/${characterId}/attributes`
  );
}

export async function createCustomAttribute(
  characterId: string,
  input: CustomAttributeInput
) {
  return apiRequest<any>(
    `/characters/${characterId}/attributes`,
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export async function updateCustomAttribute(
  characterId: string,
  attributeId: string,
  input: Partial<CustomAttributeInput>
) {
  return apiRequest<any>(
    `/characters/${characterId}/attributes/${attributeId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );
}

export async function deleteCustomAttribute(
  characterId: string,
  attributeId: string
) {
  return apiRequest(
    `/characters/${characterId}/attributes/${attributeId}`,
    {
      method: "DELETE",
    }
  );
}

/* ============================================================
   CHARACTER MENTION
   ============================================================ */

export interface CharacterMentionInput {
  characterId: string;
  displayText: string;
  startOffset?: number;
  endOffset?: number;
}

export interface CharacterMentionUpdateInput {
  characterId?: string;
  displayText?: string;
  startOffset?: number | null;
  endOffset?: number | null;
}

export async function getMentions(
  bookId: string,
  chapterId: string
): Promise<CharacterMention[]> {
  const response = await apiRequest<any[]>(
    `/books/${bookId}/chapters/${chapterId}/mentions`
  );

  return response.map(
    mapCharacterMention
  );
}

export async function createMention(
  bookId: string,
  chapterId: string,
  input: CharacterMentionInput
): Promise<CharacterMention> {
  const response =
    await apiRequest<any>(
      `/books/${bookId}/chapters/${chapterId}/mentions`,
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    );

  return mapCharacterMention(
    response
  );
}

export async function updateMention(
  bookId: string,
  chapterId: string,
  mentionId: string,
  input: CharacterMentionUpdateInput
): Promise<CharacterMention> {
  const response =
    await apiRequest<any>(
      `/books/${bookId}/chapters/${chapterId}/mentions/${mentionId}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      }
    );

  return mapCharacterMention(
    response
  );
}

export async function deleteMention(
  bookId: string,
  chapterId: string,
  mentionId: string
): Promise<void> {
  await apiRequest(
    `/books/${bookId}/chapters/${chapterId}/mentions/${mentionId}`,
    {
      method: "DELETE",
    }
  );
}
