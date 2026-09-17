import pool from "../config/database";

export interface CreateCharacterInput {
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

export interface UpdateCharacterInput {
  fullName?: string;
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

async function verifyBookOwnership(
  bookId: string,
  userId: string
): Promise<boolean> {
  const result = await pool.query(
    `
    SELECT 1
    FROM books
    WHERE id = $1
      AND user_id = $2
    `,
    [bookId, userId]
  );

  return result.rowCount === 1;
}

async function verifyCharacterOwnership(
  characterId: string,
  userId: string
): Promise<boolean> {
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

async function syncBookCharacters(
  characterId: string,
  userId: string,
  bookIds: string[] = []
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `
      DELETE FROM book_characters
      WHERE character_id = $1
      `,
      [characterId]
    );

    for (const bookId of bookIds) {
      const ownership = await client.query(
        `
        SELECT 1
        FROM books
        WHERE id = $1
          AND user_id = $2
        `,
        [bookId, userId]
      );

      if (ownership.rowCount === 0) {
        throw new Error("BOOK_NOT_OWNED");
      }

      await client.query(
        `
        INSERT INTO book_characters (
          book_id,
          character_id
        )
        VALUES ($1, $2)
        ON CONFLICT (book_id, character_id)
        DO NOTHING
        `,
        [bookId, characterId]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getCharacters(userId: string, bookId?: string) {
  const params: unknown[] = [userId];

  let bookCondition = "";

  if (bookId) {
    params.push(bookId);
    bookCondition = `
      AND EXISTS (
        SELECT 1
        FROM book_characters bc_filter
        WHERE bc_filter.character_id = c.id
          AND bc_filter.book_id = $2
      )
    `;
  }

  const result = await pool.query(
    `
    SELECT
      c.id,
      c.full_name,
      c.alias,
      c.age,
      c.gender,
      c.role_tag,
      c.status,
      c.avatar_url,
      c.physical_appearance,
      c.personality_traits,
      c.backstory,
      c.motivation,
      c.world_goal,
      c.created_at,
      c.updated_at,

      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', ca.id,
              'key', ca.attribute_key,
              'value', ca.attribute_value
            )
            ORDER BY ca.created_at ASC
          )
          FROM character_custom_attributes ca
          WHERE ca.character_id = c.id
        ),
        '[]'::json
      ) AS custom_attributes,

      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', cr.id,
              'targetCharacterId', cr.target_character_id,
              'relationType', cr.relation_type,
              'description', cr.description
            )
            ORDER BY cr.created_at ASC
          )
          FROM character_relationships cr
          WHERE cr.character_id = c.id
        ),
        '[]'::json
      ) AS relationships,

      COALESCE(
        (
          SELECT json_agg(bc.book_id)
          FROM book_characters bc
          WHERE bc.character_id = c.id
        ),
        '[]'::json
      ) AS book_ids

    FROM characters c

    WHERE c.user_id = $1
    ${bookCondition}

    ORDER BY c.created_at DESC
    `,
    params
  );

  return result.rows;
}

export async function getCharacterById(
  characterId: string,
  userId: string
) {
  const result = await pool.query(
    `
    SELECT
      c.id,
      c.full_name,
      c.alias,
      c.age,
      c.gender,
      c.role_tag,
      c.status,
      c.avatar_url,
      c.physical_appearance,
      c.personality_traits,
      c.backstory,
      c.motivation,
      c.world_goal,
      c.created_at,
      c.updated_at,

      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', ca.id,
              'key', ca.attribute_key,
              'value', ca.attribute_value
            )
            ORDER BY ca.created_at ASC
          )
          FROM character_custom_attributes ca
          WHERE ca.character_id = c.id
        ),
        '[]'::json
      ) AS custom_attributes,

      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', cr.id,
              'targetCharacterId', cr.target_character_id,
              'relationType', cr.relation_type,
              'description', cr.description
            )
            ORDER BY cr.created_at ASC
          )
          FROM character_relationships cr
          WHERE cr.character_id = c.id
        ),
        '[]'::json
      ) AS relationships,

      COALESCE(
        (
          SELECT json_agg(bc.book_id)
          FROM book_characters bc
          WHERE bc.character_id = c.id
        ),
        '[]'::json
      ) AS book_ids

    FROM characters c
    WHERE c.id = $1
      AND c.user_id = $2
    `,
    [characterId, userId]
  );

  return result.rows[0] ?? null;
}

export async function createCharacter(
  userId: string,
  input: CreateCharacterInput
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const characterResult = await client.query(
      `
      INSERT INTO characters (
        user_id,
        full_name,
        alias,
        age,
        gender,
        role_tag,
        status,
        avatar_url,
        physical_appearance,
        personality_traits,
        backstory,
        motivation,
        world_goal
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6::character_role_tag,
        $7::character_status,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13
      )
      RETURNING id
      `,
      [
        userId,
        input.fullName.trim(),
        input.alias ?? "",
        input.age ?? "",
        input.gender ?? "",
        input.roleTag ?? "Netral",
        input.status ?? "Hidup",
        input.avatarUrl ?? "",
        input.physicalAppearance ?? "",
        input.personalityTraits ?? "",
        input.backstory ?? "",
        input.motivation ?? "",
        input.worldGoal ?? "",
      ]
    );

    const characterId = characterResult.rows[0].id;

    for (const bookId of input.bookIds ?? []) {
      const ownership = await client.query(
        `
        SELECT 1
        FROM books
        WHERE id = $1
          AND user_id = $2
        `,
        [bookId, userId]
      );

      if (ownership.rowCount === 0) {
        throw new Error("BOOK_NOT_OWNED");
      }

      await client.query(
        `
        INSERT INTO book_characters (
          book_id,
          character_id
        )
        VALUES ($1, $2)
        ON CONFLICT (book_id, character_id)
        DO NOTHING
        `,
        [bookId, characterId]
      );
    }

    await client.query("COMMIT");

    return getCharacterById(characterId, userId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateCharacter(
  characterId: string,
  userId: string,
  input: UpdateCharacterInput
) {
  const exists = await verifyCharacterOwnership(
    characterId,
    userId
  );

  if (!exists) {
    return null;
  }

  const fields: string[] = [];
  const values: unknown[] = [];
  let index = 1;

  const addField = (column: string, value: unknown) => {
    fields.push(`${column} = $${index++}`);
    values.push(value);
  };

  if (input.fullName !== undefined) {
    addField("full_name", input.fullName.trim());
  }

  if (input.alias !== undefined) {
    addField("alias", input.alias);
  }

  if (input.age !== undefined) {
    addField("age", input.age);
  }

  if (input.gender !== undefined) {
    addField("gender", input.gender);
  }

  if (input.roleTag !== undefined) {
    fields.push(`role_tag = $${index++}::character_role_tag`);
    values.push(input.roleTag);
  }

  if (input.status !== undefined) {
    fields.push(`status = $${index++}::character_status`);
    values.push(input.status);
  }

  if (input.avatarUrl !== undefined) {
    addField("avatar_url", input.avatarUrl);
  }

  if (input.physicalAppearance !== undefined) {
    addField("physical_appearance", input.physicalAppearance);
  }

  if (input.personalityTraits !== undefined) {
    addField("personality_traits", input.personalityTraits);
  }

  if (input.backstory !== undefined) {
    addField("backstory", input.backstory);
  }

  if (input.motivation !== undefined) {
    addField("motivation", input.motivation);
  }

  if (input.worldGoal !== undefined) {
    addField("world_goal", input.worldGoal);
  }

  if (fields.length > 0) {
    fields.push("updated_at = CURRENT_TIMESTAMP");

    values.push(characterId);
    values.push(userId);

    await pool.query(
      `
      UPDATE characters
      SET ${fields.join(", ")}
      WHERE id = $${index}
        AND user_id = $${index + 1}
      `,
      values
    );
  }

  if (input.bookIds !== undefined) {
    await syncBookCharacters(
      characterId,
      userId,
      input.bookIds
    );
  }

  return getCharacterById(characterId, userId);
}

export async function deleteCharacter(
  characterId: string,
  userId: string
) {
  const result = await pool.query(
    `
    DELETE FROM characters
    WHERE id = $1
      AND user_id = $2
    RETURNING id
    `,
    [characterId, userId]
  );

  return result.rowCount === 1;
}
