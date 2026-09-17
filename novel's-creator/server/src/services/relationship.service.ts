import pool from "../config/database";

async function verifyCharacterOwnership(
  characterId: string,
  userId: string
) {
  const result = await pool.query(
    `
    SELECT 1
    FROM characters
    WHERE id = $1
      AND user_id = $2
    `,
    [characterId, userId]
  );

  return result.rowCount === 1;
}

export async function getRelationships(
  characterId: string,
  userId: string
) {
  const owned = await verifyCharacterOwnership(
    characterId,
    userId
  );

  if (!owned) {
    return null;
  }

  const result = await pool.query(
    `
    SELECT
      cr.id,
      cr.character_id,
      cr.target_character_id,
      cr.relation_type,
      cr.description,
      cr.created_at,
      cr.updated_at,

      target.full_name AS target_character_name,
      target.avatar_url AS target_character_avatar

    FROM character_relationships cr

    JOIN characters target
      ON target.id = cr.target_character_id

    WHERE cr.character_id = $1
      AND target.user_id = $2

    ORDER BY cr.created_at ASC
    `,
    [characterId, userId]
  );

  return result.rows;
}

export async function createRelationship(
  characterId: string,
  userId: string,
  input: {
    targetCharacterId: string;
    relationType: string;
    description?: string;
  }
) {
  const sourceOwned =
    await verifyCharacterOwnership(
      characterId,
      userId
    );

  if (!sourceOwned) {
    return null;
  }

  const targetOwned =
    await verifyCharacterOwnership(
      input.targetCharacterId,
      userId
    );

  if (!targetOwned) {
    throw new Error("TARGET_NOT_OWNED");
  }

  if (
    characterId === input.targetCharacterId
  ) {
    throw new Error("SELF_RELATIONSHIP");
  }

  const result = await pool.query(
    `
    INSERT INTO character_relationships (
      character_id,
      target_character_id,
      relation_type,
      description
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [
      characterId,
      input.targetCharacterId,
      input.relationType,
      input.description ?? "",
    ]
  );

  return result.rows[0];
}

export async function updateRelationship(
  relationshipId: string,
  userId: string,
  input: {
    relationType?: string;
    description?: string;
    targetCharacterId?: string;
  }
) {
  const current = await pool.query(
    `
    SELECT cr.*
    FROM character_relationships cr
    JOIN characters c
      ON c.id = cr.character_id
    WHERE cr.id = $1
      AND c.user_id = $2
    `,
    [relationshipId, userId]
  );

  if (current.rowCount === 0) {
    return null;
  }

  const relation = current.rows[0];

  if (input.targetCharacterId) {
    const targetOwned =
      await verifyCharacterOwnership(
        input.targetCharacterId,
        userId
      );

    if (!targetOwned) {
      throw new Error("TARGET_NOT_OWNED");
    }

    if (
      relation.character_id ===
      input.targetCharacterId
    ) {
      throw new Error("SELF_RELATIONSHIP");
    }
  }

  const result = await pool.query(
    `
    UPDATE character_relationships
    SET
      target_character_id = COALESCE($1, target_character_id),
      relation_type = COALESCE($2, relation_type),
      description = COALESCE($3, description),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *
    `,
    [
      input.targetCharacterId ?? null,
      input.relationType ?? null,
      input.description ?? null,
      relationshipId,
    ]
  );

  return result.rows[0];
}

export async function deleteRelationship(
  relationshipId: string,
  userId: string
) {
  const result = await pool.query(
    `
    DELETE FROM character_relationships cr
    USING characters c
    WHERE cr.id = $1
      AND cr.character_id = c.id
      AND c.user_id = $2
    RETURNING cr.id
    `,
    [relationshipId, userId]
  );

  return result.rowCount === 1;
}
