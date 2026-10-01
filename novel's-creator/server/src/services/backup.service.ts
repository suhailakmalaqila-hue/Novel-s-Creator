import pool from "../config/database";

export type BackupData = {
    format: "novels-creator";
    version: 1;
    exportedAt: string;
    project: {
        books: any[];
        genres: any[];
        bookGenres: any[];
        chapters: any[];
        chapterSnapshots: any[];
        characters: any[];
        bookCharacters: any[];
        customAttributes: any[];
        relationships: any[];
        mentions: any[];
        quickNotes: any[];
    };
};

export async function exportUserBackup(
    userId: string
): Promise<BackupData> {
    /*
     * Semua data diambil berdasarkan userId.
     *
     * Jangan mengambil seluruh database karena backup
     * hanya boleh berisi data milik user yang sedang login.
     */

    const [
        booksResult,
        genresResult,
        bookGenresResult,
        chaptersResult,
        snapshotsResult,
        charactersResult,
        bookCharactersResult,
        customAttributesResult,
        relationshipsResult,
        mentionsResult,
        quickNotesResult,
    ] = await Promise.all([
        /*
         * =========================
         * BOOKS
         * =========================
         */
        pool.query(
            `
      SELECT
        b.id,
        b.user_id,
        b.title,
        b.synopsis,
        b.cover_url,
        b.target_word_count,
        b.current_word_count,
        b.status,
        b.created_at,
        b.updated_at
      FROM books b
      WHERE b.user_id = $1
      ORDER BY b.created_at ASC
      `,
            [userId]
        ),

        /*
         * =========================
         * GENRES
         * =========================
         *
         * Genre bisa bersifat global.
         *
         * Kita hanya mengambil genre yang benar-benar
         * digunakan oleh book milik user ini.
         */
        pool.query(
            `
      SELECT DISTINCT
        g.id,
        g.name
      FROM genres g
      INNER JOIN book_genres bg
        ON bg.genre_id = g.id
      INNER JOIN books b
        ON b.id = bg.book_id
      WHERE b.user_id = $1
      ORDER BY g.name ASC
      `,
            [userId]
        ),

        /*
         * =========================
         * BOOK GENRES
         * =========================
         */
        pool.query(
            `
      SELECT
        bg.book_id,
        bg.genre_id
      FROM book_genres bg
      INNER JOIN books b
        ON b.id = bg.book_id
      WHERE b.user_id = $1
      ORDER BY bg.book_id, bg.genre_id
      `,
            [userId]
        ),

        /*
         * =========================
         * CHAPTERS
         * =========================
         */
        pool.query(
            `
      SELECT
        c.id,
        c.book_id,
        c.chapter_number,
        c.title,
        c.content,
        c.word_count,
        c.character_count,
        c.status,
        c.sort_order,
        c.last_saved_at,
        c.created_at,
        c.updated_at
      FROM chapters c
      INNER JOIN books b
        ON b.id = c.book_id
      WHERE b.user_id = $1
      ORDER BY
        c.book_id,
        c.sort_order ASC,
        c.chapter_number ASC,
        c.created_at ASC
      `,
            [userId]
        ),

        /*
         * =========================
         * CHAPTER SNAPSHOTS
         * =========================
         */
        pool.query(
            `
      SELECT
        cs.id,
        cs.chapter_id,
        cs.book_id,
        cs.chapter_title,
        cs.content,
        cs.word_count,
        cs.reason,
        cs.created_at
      FROM chapter_snapshots cs
      INNER JOIN books b
        ON b.id = cs.book_id
      WHERE b.user_id = $1
      ORDER BY
        cs.book_id,
        cs.chapter_id,
        cs.created_at ASC
      `,
            [userId]
        ),

        /*
         * =========================
         * CHARACTERS
         * =========================
         */
        pool.query(
            `
      SELECT
        c.id,
        c.user_id,
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
        c.updated_at
      FROM characters c
      WHERE c.user_id = $1
      ORDER BY c.created_at ASC
      `,
            [userId]
        ),

        /*
         * =========================
         * BOOK CHARACTERS
         * =========================
         */
        pool.query(
            `
      SELECT
        bc.book_id,
        bc.character_id
      FROM book_characters bc
      INNER JOIN books b
        ON b.id = bc.book_id
      INNER JOIN characters c
        ON c.id = bc.character_id
      WHERE b.user_id = $1
        AND c.user_id = $1
      ORDER BY
        bc.book_id,
        bc.character_id
      `,
            [userId]
        ),

        /*
         * =========================
         * CUSTOM ATTRIBUTES
         * =========================
         */
        pool.query(
            `
      SELECT
        ca.id,
        ca.character_id,
        ca.attribute_key,
        ca.attribute_value,
        ca.created_at,
        ca.updated_at
      FROM character_custom_attributes ca
      INNER JOIN characters c
        ON c.id = ca.character_id
      WHERE c.user_id = $1
      ORDER BY
        ca.character_id,
        ca.created_at ASC
      `,
            [userId]
        ),

        /*
         * =========================
         * CHARACTER RELATIONSHIPS
         * =========================
         *
         * Relationship bersifat directional:
         *
         * character_id
         *      ↓
         * target_character_id
         *
         * Kita hanya mengambil relationship yang
         * kedua karakter-nya milik user yang sama.
         */
        pool.query(
            `
      SELECT
        cr.id,
        cr.character_id,
        cr.target_character_id,
        cr.relation_type,
        cr.description,
        cr.created_at,
        cr.updated_at
      FROM character_relationships cr
      INNER JOIN characters c1
        ON c1.id = cr.character_id
      INNER JOIN characters c2
        ON c2.id = cr.target_character_id
      WHERE c1.user_id = $1
        AND c2.user_id = $1
      ORDER BY
        cr.character_id,
        cr.created_at ASC
      `,
            [userId]
        ),

        /*
         * =========================
         * CHARACTER MENTIONS
         * =========================
         */
        pool.query(
            `
      SELECT
        cm.id,
        cm.chapter_id,
        cm.character_id,
        cm.display_text,
        cm.start_offset,
        cm.end_offset,
        cm.created_at
      FROM chapter_character_mentions cm
      INNER JOIN chapters ch
        ON ch.id = cm.chapter_id
      INNER JOIN books b
        ON b.id = ch.book_id
      INNER JOIN characters c
        ON c.id = cm.character_id
      WHERE b.user_id = $1
        AND c.user_id = $1
      ORDER BY
        cm.chapter_id,
        cm.start_offset ASC,
        cm.created_at ASC
      `,
            [userId]
        ),

        /*
         * =========================
         * QUICK NOTES
         * =========================
         *
         * Quick notes bisa global/user-level,
         * book-level, chapter-level, atau character-level.
         *
         * Karena itu kita cek user_id langsung sebagai
         * source utama ownership.
         */
        pool.query(
            `
      SELECT
        qn.id,
        qn.user_id,
        qn.note_scope,
        qn.note_category,
        qn.book_id,
        qn.chapter_id,
        qn.character_id,
        qn.title,
        qn.content,
        qn.color_tag,
        qn.is_pinned,
        qn.created_at,
        qn.updated_at
      FROM quick_notes qn
      WHERE qn.user_id = $1
      ORDER BY qn.created_at ASC
      `,
            [userId]
        ),
    ]);

    return {
        format: "novels-creator",
        version: 1,
        exportedAt: new Date().toISOString(),

        project: {
            books: booksResult.rows,
            genres: genresResult.rows,
            bookGenres: bookGenresResult.rows,
            chapters: chaptersResult.rows,
            chapterSnapshots: snapshotsResult.rows,
            characters: charactersResult.rows,
            bookCharacters: bookCharactersResult.rows,
            customAttributes: customAttributesResult.rows,
            relationships: relationshipsResult.rows,
            mentions: mentionsResult.rows,
            quickNotes: quickNotesResult.rows,
        },
    };
}

export async function importUserBackup(
    userId: string,
    backup: BackupData
) {
    if (!backup || typeof backup !== "object") {
        throw new Error("INVALID_BACKUP");
    }

    if (backup.format !== "novels-creator") {
        throw new Error("INVALID_BACKUP_FORMAT");
    }

    if (backup.version !== 1) {
        throw new Error("UNSUPPORTED_BACKUP_VERSION");
    }

    if (!backup.project || typeof backup.project !== "object") {
        throw new Error("INVALID_BACKUP_PROJECT");
    }

    const {
        books = [],
        genres = [],
        bookGenres = [],
        chapters = [],
        chapterSnapshots = [],
        characters = [],
        bookCharacters = [],
        customAttributes = [],
        relationships = [],
        mentions = [],
        quickNotes = [],
    } = backup.project;

    if (
        !Array.isArray(books) ||
        !Array.isArray(genres) ||
        !Array.isArray(bookGenres) ||
        !Array.isArray(chapters) ||
        !Array.isArray(chapterSnapshots) ||
        !Array.isArray(characters) ||
        !Array.isArray(bookCharacters) ||
        !Array.isArray(customAttributes) ||
        !Array.isArray(relationships) ||
        !Array.isArray(mentions) ||
        !Array.isArray(quickNotes)
    ) {
        throw new Error("INVALID_BACKUP_STRUCTURE");
    }

    const client = await pool.connect();

    const bookIdMap = new Map<string, string>();
    const genreIdMap = new Map<string, string>();
    const chapterIdMap = new Map<string, string>();
    const characterIdMap = new Map<string, string>();

    try {
        await client.query("BEGIN");

        /*
         * ============================================================
         * 1. BOOKS
         * ============================================================
         *
         * Jangan memasukkan id lama.
         * PostgreSQL akan membuat UUID baru.
         */
        for (const book of books) {
            if (!book?.id || typeof book.id !== "string") {
                throw new Error("INVALID_BOOK_ID");
            }

            const result = await client.query(
                `
        INSERT INTO books (
          user_id,
          title,
          synopsis,
          cover_url,
          target_word_count,
          current_word_count,
          status
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7::book_status
        )
        RETURNING id
        `,
                [
                    userId,
                    book.title ?? "",
                    book.synopsis ?? null,
                    book.cover_url ?? null,
                    Number(book.target_word_count ?? 0),
                    Number(book.current_word_count ?? 0),
                    book.status ?? "draft",
                ]
            );

            const newBookId = result.rows[0].id;

            bookIdMap.set(
                String(book.id),
                String(newBookId)
            );
        }

        /*
         * ============================================================
         * 2. GENRES
         * ============================================================
         *
         * Genre dapat dipakai oleh banyak book.
         *
         * Jika genre dengan nama yang sama sudah ada,
         * gunakan genre tersebut.
         *
         * Jika belum ada, buat genre baru.
         */
        for (const genre of genres) {
            if (!genre?.id || typeof genre.id !== "string") {
                throw new Error("INVALID_GENRE_ID");
            }

            const genreName = String(
                genre.name ?? ""
            ).trim();

            if (!genreName) {
                throw new Error("INVALID_GENRE_NAME");
            }

            const existingResult = await client.query(
                `
        SELECT id
        FROM genres
        WHERE LOWER(name) = LOWER($1)
        LIMIT 1
        `,
                [genreName]
            );

            let newGenreId: string;

            if (existingResult.rows.length > 0) {
                newGenreId = String(
                    existingResult.rows[0].id
                );
            } else {
                const insertResult = await client.query(
                    `
          INSERT INTO genres (
            name
          )
          VALUES ($1)
          RETURNING id
          `,
                    [genreName]
                );

                newGenreId = String(
                    insertResult.rows[0].id
                );
            }

            genreIdMap.set(
                String(genre.id),
                newGenreId
            );
        }

        /*
         * ============================================================
         * 3. BOOK GENRES
         * ============================================================
         */
        for (const item of bookGenres) {
            const newBookId = bookIdMap.get(
                String(item.book_id)
            );

            const newGenreId = genreIdMap.get(
                String(item.genre_id)
            );

            if (!newBookId || !newGenreId) {
                throw new Error(
                    "INVALID_BOOK_GENRE_REFERENCE"
                );
            }

            await client.query(
                `
        INSERT INTO book_genres (
          book_id,
          genre_id
        )
        VALUES ($1, $2)
        ON CONFLICT (
          book_id,
          genre_id
        )
        DO NOTHING
        `,
                [
                    newBookId,
                    newGenreId,
                ]
            );
        }

        /*
         * ============================================================
         * 4. CHAPTERS
         * ============================================================
         *
         * Chapter number dan metadata dipulihkan.
         *
         * Word count tetap berasal dari backup pada tahap insert,
         * lalu books.current_word_count akan disinkronkan kembali
         * berdasarkan chapter setelah seluruh chapter selesai.
         */
        for (const chapter of chapters) {
            const newBookId = bookIdMap.get(
                String(chapter.book_id)
            );

            if (!newBookId) {
                throw new Error(
                    "INVALID_CHAPTER_BOOK_REFERENCE"
                );
            }

            if (
                !chapter?.id ||
                typeof chapter.id !== "string"
            ) {
                throw new Error(
                    "INVALID_CHAPTER_ID"
                );
            }

            const result = await client.query(
                `
        INSERT INTO chapters (
          book_id,
          chapter_number,
          title,
          content,
          word_count,
          character_count,
          status,
          sort_order,
          last_saved_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7::chapter_status,
          $8,
          $9
        )
        RETURNING id
        `,
                [
                    newBookId,
                    Number(
                        chapter.chapter_number ?? 1
                    ),
                    chapter.title ?? "",
                    chapter.content ?? "",
                    Number(
                        chapter.word_count ?? 0
                    ),
                    Number(
                        chapter.character_count ?? 0
                    ),
                    chapter.status ?? "draft",
                    Number(
                        chapter.sort_order ?? 0
                    ),
                    chapter.last_saved_at
                        ? new Date(
                            chapter.last_saved_at
                        )
                        : new Date(),
                ]
            );

            const newChapterId =
                result.rows[0].id;

            chapterIdMap.set(
                String(chapter.id),
                String(newChapterId)
            );
        }

        /*
         * ============================================================
         * 5. CHAPTER SNAPSHOTS
         * ============================================================
         */
        for (const snapshot of chapterSnapshots) {
            const newBookId = bookIdMap.get(
                String(snapshot.book_id)
            );

            const newChapterId = chapterIdMap.get(
                String(snapshot.chapter_id)
            );

            if (!newBookId || !newChapterId) {
                throw new Error(
                    "INVALID_SNAPSHOT_REFERENCE"
                );
            }

            await client.query(
                `
        INSERT INTO chapter_snapshots (
          chapter_id,
          book_id,
          chapter_title,
          content,
          word_count,
          reason,
          created_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7
        )
        `,
                [
                    newChapterId,
                    newBookId,
                    snapshot.chapter_title ?? "",
                    snapshot.content ?? "",
                    Number(
                        snapshot.word_count ?? 0
                    ),
                    snapshot.reason ?? null,
                    snapshot.created_at
                        ? new Date(
                            snapshot.created_at
                        )
                        : new Date(),
                ]
            );
        }

        /*
         * ============================================================
         * 6. CHARACTERS
         * ============================================================
         *
         * Character selalu menjadi milik user yang melakukan import.
         */
        for (const character of characters) {
            if (
                !character?.id ||
                typeof character.id !== "string"
            ) {
                throw new Error(
                    "INVALID_CHARACTER_ID"
                );
            }

            const result = await client.query(
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
          $6,
          $7,
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
                    character.full_name ?? "",
                    character.alias ?? null,
                    character.age ?? null,
                    character.gender ?? null,
                    character.role_tag ?? null,
                    character.status ?? null,
                    character.avatar_url ?? null,
                    character.physical_appearance ?? null,
                    character.personality_traits ?? null,
                    character.backstory ?? null,
                    character.motivation ?? null,
                    character.world_goal ?? null,
                ]
            );

            const newCharacterId =
                result.rows[0].id;

            characterIdMap.set(
                String(character.id),
                String(newCharacterId)
            );
        }

        /*
         * ============================================================
         * 7. BOOK CHARACTERS
         * ============================================================
         */
        for (const item of bookCharacters) {
            const newBookId = bookIdMap.get(
                String(item.book_id)
            );

            const newCharacterId =
                characterIdMap.get(
                    String(item.character_id)
                );

            if (!newBookId || !newCharacterId) {
                throw new Error(
                    "INVALID_BOOK_CHARACTER_REFERENCE"
                );
            }

            await client.query(
                `
        INSERT INTO book_characters (
          book_id,
          character_id
        )
        VALUES ($1, $2)
        ON CONFLICT (
          book_id,
          character_id
        )
        DO NOTHING
        `,
                [
                    newBookId,
                    newCharacterId,
                ]
            );
        }

        /*
         * ============================================================
         * 8. CUSTOM ATTRIBUTES
         * ============================================================
         */
        for (const attribute of customAttributes) {
            const newCharacterId =
                characterIdMap.get(
                    String(attribute.character_id)
                );

            if (!newCharacterId) {
                throw new Error(
                    "INVALID_CUSTOM_ATTRIBUTE_REFERENCE"
                );
            }

            await client.query(
                `
        INSERT INTO character_custom_attributes (
          character_id,
          attribute_key,
          attribute_value
        )
        VALUES ($1, $2, $3)
        `,
                [
                    newCharacterId,
                    attribute.attribute_key ?? "",
                    attribute.attribute_value ?? "",
                ]
            );
        }

        /*
         * ============================================================
         * 9. CHARACTER RELATIONSHIPS
         * ============================================================
         *
         * Relationship tetap directional.
         *
         * old A -> old B
         *
         * menjadi:
         *
         * new A -> new B
         */
        for (const relationship of relationships) {
            const newCharacterId =
                characterIdMap.get(
                    String(relationship.character_id)
                );

            const newTargetCharacterId =
                characterIdMap.get(
                    String(
                        relationship.target_character_id
                    )
                );

            if (
                !newCharacterId ||
                !newTargetCharacterId
            ) {
                throw new Error(
                    "INVALID_RELATIONSHIP_REFERENCE"
                );
            }

            if (
                newCharacterId ===
                newTargetCharacterId
            ) {
                throw new Error(
                    "INVALID_SELF_RELATIONSHIP"
                );
            }

            await client.query(
                `
        INSERT INTO character_relationships (
          character_id,
          target_character_id,
          relation_type,
          description
        )
        VALUES ($1, $2, $3, $4)
        `,
                [
                    newCharacterId,
                    newTargetCharacterId,
                    relationship.relation_type ?? "",
                    relationship.description ?? null,
                ]
            );
        }

        /*
         * ============================================================
         * 10. CHARACTER MENTIONS
         * ============================================================
         */
        for (const mention of mentions) {
            const newChapterId =
                chapterIdMap.get(
                    String(mention.chapter_id)
                );

            const newCharacterId =
                characterIdMap.get(
                    String(mention.character_id)
                );

            if (!newChapterId || !newCharacterId) {
                throw new Error(
                    "INVALID_MENTION_REFERENCE"
                );
            }

            await client.query(
                `
        INSERT INTO chapter_character_mentions (
          chapter_id,
          character_id,
          display_text,
          start_offset,
          end_offset
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
                [
                    newChapterId,
                    newCharacterId,
                    mention.display_text ?? "",
                    mention.start_offset ?? 0,
                    mention.end_offset ?? 0,
                ]
            );
        }

        /*
         * ============================================================
         * 11. QUICK NOTES
         * ============================================================
         *
         * user_id selalu diganti dengan user yang sedang melakukan
         * import.
         *
         * Reference book/chapter/character juga di-remap.
         */
        for (const note of quickNotes) {
            const newBookId = note.book_id
                ? bookIdMap.get(
                    String(note.book_id)
                ) ?? null
                : null;

            const newChapterId = note.chapter_id
                ? chapterIdMap.get(
                    String(note.chapter_id)
                ) ?? null
                : null;

            const newCharacterId =
                note.character_id
                    ? characterIdMap.get(
                        String(note.character_id)
                    ) ?? null
                    : null;

            if (
                note.book_id &&
                !newBookId
            ) {
                throw new Error(
                    "INVALID_QUICK_NOTE_BOOK_REFERENCE"
                );
            }

            if (
                note.chapter_id &&
                !newChapterId
            ) {
                throw new Error(
                    "INVALID_QUICK_NOTE_CHAPTER_REFERENCE"
                );
            }

            if (
                note.character_id &&
                !newCharacterId
            ) {
                throw new Error(
                    "INVALID_QUICK_NOTE_CHARACTER_REFERENCE"
                );
            }

            await client.query(
                `
        INSERT INTO quick_notes (
          user_id,
          note_scope,
          note_category,
          book_id,
          chapter_id,
          character_id,
          title,
          content,
          color_tag,
          is_pinned
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10
        )
        `,
                [
                    userId,
                    note.note_scope ?? "other",
                    note.note_category ?? "Lainnya",
                    newBookId,
                    newChapterId,
                    newCharacterId,
                    note.title ?? "",
                    note.content ?? "",
                    note.color_tag ?? null,
                    Boolean(note.is_pinned),
                ]
            );
        }

        /*
         * ============================================================
         * 12. SYNC BOOK WORD COUNTS
         * ============================================================
         *
         * Source of truth:
         *
         * SUM(chapters.word_count)
         *
         * Jadi nilai current_word_count dari JSON tidak
         * dijadikan source of truth.
         */
        for (const newBookId of bookIdMap.values()) {
            await client.query(
                `
        UPDATE books
        SET
          current_word_count = COALESCE(
            (
              SELECT SUM(c.word_count)
              FROM chapters c
              WHERE c.book_id = books.id
            ),
            0
          ),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND user_id = $2
        `,
                [
                    newBookId,
                    userId,
                ]
            );
        }

        /*
         * ============================================================
         * COMMIT
         * ============================================================
         */
        await client.query("COMMIT");

        return {
            imported: true,
            counts: {
                books: bookIdMap.size,
                genres: genreIdMap.size,
                chapters: chapterIdMap.size,
                characters: characterIdMap.size,
                chapterSnapshots:
                    chapterSnapshots.length,
                bookGenres:
                    bookGenres.length,
                bookCharacters:
                    bookCharacters.length,
                customAttributes:
                    customAttributes.length,
                relationships:
                    relationships.length,
                mentions:
                    mentions.length,
                quickNotes:
                    quickNotes.length,
            },
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
