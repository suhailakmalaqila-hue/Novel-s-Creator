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

export async function getCustomAttributes(
  characterId: string,
  userId: string
) {
  const owned =
    await verifyCharacterOwnership(
      characterId,
      userId
    );

  if (!owned) {
    return null;
  }

  const result = await pool.query(
    `
    SELECT
      id,
      character_id,
      attribute_key,
      attribute_value,
      created_at,
      updated_at
    FROM character_custom_attributes
    WHERE character_id = $1
    ORDER BY created_at ASC
    `,
    [characterId]
  );

  return result.rows;
}

export async function createCustomAttribute(
  characterId: string,
  userId: string,
  input: {
    key: string;
    value?: string;
  }
) {
  const owned =
    await verifyCharacterOwnership(
      characterId,
      userId
    );

  if (!owned) {
    return null;
  }

  const result = await pool.query(
    `
    INSERT INTO character_custom_attributes (
      character_id,
      attribute_key,
      attribute_value
    )
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [
      characterId,
      input.key.trim(),
      input.value ?? "",
    ]
  );

  return result.rows[0];
}

export async function updateCustomAttribute(
  attributeId: string,
  userId: string,
  input: {
    key?: string;
    value?: string;
  }
) {
  const result = await pool.query(
    `
    UPDATE character_custom_attributes ca
    SET
      attribute_key =
        COALESCE($1, ca.attribute_key),
      attribute_value =
        COALESCE($2, ca.attribute_value),
      updated_at = CURRENT_TIMESTAMP
    FROM characters c
    WHERE ca.id = $3
      AND ca.character_id = c.id
      AND c.user_id = $4
    RETURNING ca.*
    `,
    [
      input.key !== undefined
        ? input.key.trim()
        : null,
      input.value !== undefined
        ? input.value
        : null,
      attributeId,
      userId,
    ]
  );

  return result.rows[0] ?? null;
}

export async function deleteCustomAttribute(
  attributeId: string,
  userId: string
) {
  const result = await pool.query(
    `
    DELETE FROM character_custom_attributes ca
    USING characters c
    WHERE ca.id = $1
      AND ca.character_id = c.id
      AND c.user_id = $2
    RETURNING ca.id
    `,
    [attributeId, userId]
  );

  return result.rowCount === 1;
}
