import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Novel's Creator API",
      version: "1.0.0",
      description:
        "Complete API documentation for Novel's Creator.",
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
    ],

    tags: [
      {
        name: "Health",
        description: "API health check",
      },
      {
        name: "Authentication",
        description: "Login and authentication",
      },
      {
        name: "Admin",
        description: "Admin-only user management",
      },
      {
        name: "Users",
        description: "Authenticated user profile management",
      },
      {
        name: "Books",
        description: "Book management",
      },
      {
        name: "Genres",
        description: "Genre management",
      },
      {
        name: "Chapters",
        description: "Chapter management",
      },
      {
        name: "Snapshots",
        description: "Chapter snapshot management",
      },
      {
        name: "Characters",
        description: "Character management",
      },
      {
        name: "Relationships",
        description: "Character relationship management",
      },
      {
        name: "Custom Attributes",
        description: "Character custom attributes",
      },
      {
        name: "Mentions",
        description: "Character mentions inside chapters",
      },
      {
        name: "Quick Notes",
        description: "Quick notes management",
      },
      {
        name: "Backup",
        description: "Backup export and import",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Masukkan JWT yang diperoleh dari POST /api/auth/login",
        },
      },

      schemas: {
        /*
         * ============================================================
         * COMMON
         * ============================================================
         */

        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Terjadi kesalahan",
            },
          },
        },

        MessageResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Operasi berhasil",
            },
          },
        },

        /*
         * ============================================================
         * AUTHENTICATION
         * ============================================================
         */

        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "password123",
            },
          },
        },

        LoginResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Login berhasil",
            },
            data: {
              type: "object",
              properties: {
                user: {
                  $ref: "#/components/schemas/User",
                },
                token: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
              },
            },
          },
        },

        /*
         * ============================================================
         * USER
         * ============================================================
         */

        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              example: "550e8400-e29b-41d4-a716-446655440000",
            },
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            role: {
              type: "string",
              enum: ["admin", "user"],
              example: "user",
            },
            author_name: {
              type: "string",
              nullable: true,
              example: "John Doe",
            },
            pen_name: {
              type: "string",
              nullable: true,
              example: "J. Doe",
            },
            bio: {
              type: "string",
              nullable: true,
              example: "A novelist who loves fantasy stories.",
            },
            avatar_url: {
              type: "string",
              nullable: true,
              example: "https://example.com/avatar.png",
            },
            daily_word_goal: {
              type: "integer",
              nullable: true,
              example: 1000,
            },
            today_word_count: {
              type: "integer",
              nullable: true,
              example: 450,
            },
            last_active_date: {
              type: "string",
              format: "date",
              nullable: true,
              example: "2026-09-28",
            },
            theme: {
              type: "string",
              nullable: true,
              example: "dark",
            },
            sound_effects: {
              type: "boolean",
              nullable: true,
              example: true,
            },
            preferred_genre: {
              type: "string",
              nullable: true,
              example: "Fantasy",
            },
            tutorial_completed: {
              type: "boolean",
              nullable: true,
              example: false,
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
          },
        },

        AdminUserRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "newuser@example.com",
            },
            password: {
              type: "string",
              format: "password",
              minLength: 6,
              example: "password123",
            },
            authorName: {
              type: "string",
              example: "John Doe",
            },
            penName: {
              type: "string",
              example: "J. Doe",
            },
            role: {
              type: "string",
              enum: ["admin", "user"],
              default: "user",
              example: "user",
            },
          },
        },

        AdminUserUpdateRequest: {
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "updated@example.com",
            },
            password: {
              type: "string",
              format: "password",
              minLength: 6,
              example: "newpassword123",
            },
            authorName: {
              type: "string",
              example: "Updated Name",
            },
            penName: {
              type: "string",
              example: "Updated Pen Name",
            },
            role: {
              type: "string",
              enum: ["admin", "user"],
              example: "user",
            },
          },
        },

        UpdateProfileRequest: {
          type: "object",
          properties: {
            authorName: {
              type: "string",
              example: "John Doe",
            },
            penName: {
              type: "string",
              example: "J. Doe",
            },
            bio: {
              type: "string",
              example: "Fantasy novelist.",
            },
            avatarUrl: {
              type: "string",
              example: "https://example.com/avatar.png",
            },
            dailyWordGoal: {
              type: "integer",
              minimum: 0,
              example: 1000,
            },
            theme: {
              type: "string",
              example: "dark",
            },
            soundEffects: {
              type: "boolean",
              example: true,
            },
            preferredGenre: {
              type: "string",
              example: "Fantasy",
            },
            tutorialCompleted: {
              type: "boolean",
              example: true,
            },
          },
        },

        ChangePasswordRequest: {
          type: "object",
          required: ["currentPassword", "newPassword"],
          properties: {
            currentPassword: {
              type: "string",
              format: "password",
              example: "oldpassword123",
            },
            newPassword: {
              type: "string",
              format: "password",
              minLength: 6,
              example: "newpassword123",
            },
          },
        },

        /*
         * ============================================================
         * BOOK
         * ============================================================
         */

        GenreSummary: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            name: {
              type: "string",
              example: "Fantasy",
            },
          },
        },

        Book: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            user_id: {
              type: "string",
              format: "uuid",
            },
            title: {
              type: "string",
              example: "The Lost Kingdom",
            },
            synopsis: {
              type: "string",
              nullable: true,
              example: "A young hero discovers a forgotten kingdom.",
            },
            cover_url: {
              type: "string",
              nullable: true,
              description: "Cover image URL or Base64 data",
            },
            target_word_count: {
              type: "integer",
              example: 50000,
            },
            current_word_count: {
              type: "integer",
              example: 12500,
            },
            status: {
              type: "string",
              example: "draft",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
            genres: {
              type: "array",
              items: {
                $ref: "#/components/schemas/GenreSummary",
              },
            },
          },
        },

        CreateBookRequest: {
          type: "object",
          required: ["title"],
          properties: {
            title: {
              type: "string",
              example: "The Lost Kingdom",
            },
            synopsis: {
              type: "string",
              example: "A young hero discovers a forgotten kingdom.",
            },
            coverUrl: {
              type: "string",
              description: "Cover URL or Base64 image",
              example: "data:image/png;base64,iVBORw0KGgo...",
            },
            targetWordCount: {
              type: "integer",
              minimum: 0,
              example: 50000,
            },
            status: {
              type: "string",
              example: "draft",
            },
          },
        },

        UpdateBookRequest: {
          type: "object",
          properties: {
            title: {
              type: "string",
              example: "The Lost Kingdom - Revised",
            },
            synopsis: {
              type: "string",
            },
            coverUrl: {
              type: "string",
              description: "Cover URL or Base64 image",
            },
            targetWordCount: {
              type: "integer",
              minimum: 0,
              example: 60000,
            },
            currentWordCount: {
              type: "integer",
              minimum: 0,
              example: 12500,
            },
            status: {
              type: "string",
              example: "draft",
            },
          },
        },

        /*
         * ============================================================
         * GENRE
         * ============================================================
         */

        Genre: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            name: {
              type: "string",
              example: "Fantasy",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
          },
        },

        CreateGenreRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
              example: "Fantasy",
            },
          },
        },

        BookGenre: {
          type: "object",
          properties: {
            book_id: {
              type: "string",
              format: "uuid",
            },
            genre_id: {
              type: "string",
              format: "uuid",
            },
          },
        },

        /*
         * ============================================================
         * CHAPTER
         * ============================================================
         */

        Chapter: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            book_id: {
              type: "string",
              format: "uuid",
            },
            chapter_number: {
              type: "integer",
              example: 1,
            },
            title: {
              type: "string",
              example: "The Beginning",
            },
            content: {
              type: "string",
              example: "Once upon a time...",
            },
            word_count: {
              type: "integer",
              example: 350,
            },
            character_count: {
              type: "integer",
              example: 2100,
            },
            status: {
              type: "string",
              enum: ["draft", "review", "published"],
              example: "draft",
            },
            sort_order: {
              type: "integer",
              example: 1,
            },
            last_saved_at: {
              type: "string",
              format: "date-time",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
          },
        },

        CreateChapterRequest: {
          type: "object",
          required: ["title"],
          properties: {
            chapterNumber: {
              type: "integer",
              minimum: 1,
              example: 1,
            },
            title: {
              type: "string",
              example: "The Beginning",
            },
            content: {
              type: "string",
              example: "Once upon a time...",
            },
            status: {
              type: "string",
              enum: ["draft", "review", "published"],
              default: "draft",
            },
            sortOrder: {
              type: "integer",
              example: 1,
            },
          },
        },

        UpdateChapterRequest: {
          type: "object",
          properties: {
            chapterNumber: {
              type: "integer",
              minimum: 1,
              example: 1,
            },
            title: {
              type: "string",
              example: "The Beginning - Revised",
            },
            content: {
              type: "string",
              example: "Updated chapter content...",
            },
            wordCount: {
              type: "integer",
              example: 400,
              description:
                "Accepted by API type, but backend recalculates this from content when content is supplied.",
            },
            characterCount: {
              type: "integer",
              example: 2500,
              description:
                "Accepted by API type, but backend recalculates this from content when content is supplied.",
            },
            status: {
              type: "string",
              enum: ["draft", "review", "published"],
            },
            sortOrder: {
              type: "integer",
              example: 1,
            },
          },
        },

        /*
         * ============================================================
         * SNAPSHOT
         * ============================================================
         */

        ChapterSnapshot: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            chapter_id: {
              type: "string",
              format: "uuid",
            },
            book_id: {
              type: "string",
              format: "uuid",
            },
            chapter_title: {
              type: "string",
              example: "The Beginning",
            },
            content: {
              type: "string",
              example: "Previous chapter content...",
            },
            word_count: {
              type: "integer",
              example: 350,
            },
            reason: {
              type: "string",
              nullable: true,
              example: "Before major revision",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
          },
        },

        CreateSnapshotRequest: {
          type: "object",
          required: ["chapterTitle", "content"],
          properties: {
            chapterTitle: {
              type: "string",
              example: "The Beginning",
            },
            content: {
              type: "string",
              example: "Snapshot content...",
            },
            reason: {
              type: "string",
              example: "Before rewriting the ending",
            },
          },
        },

        /*
         * ============================================================
         * CHARACTER
         * ============================================================
         */

        Character: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            full_name: {
              type: "string",
              example: "Ariana Valen",
            },
            alias: {
              type: "string",
              nullable: true,
              example: "Ari",
            },
            age: {
              type: "string",
              nullable: true,
              example: "21",
            },
            gender: {
              type: "string",
              nullable: true,
              example: "Female",
            },
            role_tag: {
              type: "string",
              nullable: true,
              example: "Protagonist",
            },
            status: {
              type: "string",
              nullable: true,
              example: "Hidup",
            },
            avatar_url: {
              type: "string",
              nullable: true,
              example: "https://example.com/character.png",
            },
            physical_appearance: {
              type: "string",
              nullable: true,
              example: "Long black hair and blue eyes.",
            },
            personality_traits: {
              type: "string",
              nullable: true,
              example: "Brave, curious and stubborn.",
            },
            backstory: {
              type: "string",
              nullable: true,
              example: "Raised in a small village.",
            },
            motivation: {
              type: "string",
              nullable: true,
              example: "Protect her family.",
            },
            world_goal: {
              type: "string",
              nullable: true,
              example: "Restore peace to the kingdom.",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
            custom_attributes: {
              type: "array",
              items: {
                $ref: "#/components/schemas/CustomAttributeSummary",
              },
            },
            relationships: {
              type: "array",
              items: {
                $ref: "#/components/schemas/RelationshipSummary",
              },
            },
            book_ids: {
              type: "array",
              items: {
                type: "string",
                format: "uuid",
              },
            },
          },
        },

        CreateCharacterRequest: {
          type: "object",
          required: ["fullName"],
          properties: {
            fullName: {
              type: "string",
              example: "Ariana Valen",
            },
            alias: {
              type: "string",
              example: "Ari",
            },
            age: {
              type: "string",
              example: "21",
            },
            gender: {
              type: "string",
              example: "Female",
            },
            roleTag: {
              type: "string",
              example: "Protagonist",
            },
            status: {
              type: "string",
              example: "Hidup",
            },
            avatarUrl: {
              type: "string",
              example: "https://example.com/avatar.png",
            },
            physicalAppearance: {
              type: "string",
            },
            personalityTraits: {
              type: "string",
            },
            backstory: {
              type: "string",
            },
            motivation: {
              type: "string",
            },
            worldGoal: {
              type: "string",
            },
            bookIds: {
              type: "array",
              items: {
                type: "string",
                format: "uuid",
              },
              example: [
                "550e8400-e29b-41d4-a716-446655440000",
              ],
            },
          },
        },

        UpdateCharacterRequest: {
          allOf: [
            {
              $ref: "#/components/schemas/CreateCharacterRequest",
            },
          ],
          required: [],
        },

        /*
         * ============================================================
         * RELATIONSHIP
         * ============================================================
         */

        Relationship: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            character_id: {
              type: "string",
              format: "uuid",
            },
            target_character_id: {
              type: "string",
              format: "uuid",
            },
            relation_type: {
              type: "string",
              example: "Friend",
            },
            description: {
              type: "string",
              nullable: true,
              example: "They grew up together.",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
            target_character_name: {
              type: "string",
              nullable: true,
              example: "Luna",
            },
            target_character_avatar: {
              type: "string",
              nullable: true,
            },
          },
        },

        RelationshipSummary: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            targetCharacterId: {
              type: "string",
              format: "uuid",
            },
            relationType: {
              type: "string",
              example: "Friend",
            },
            description: {
              type: "string",
              nullable: true,
            },
          },
        },

        CreateRelationshipRequest: {
          type: "object",
          required: ["targetCharacterId", "relationType"],
          properties: {
            targetCharacterId: {
              type: "string",
              format: "uuid",
            },
            relationType: {
              type: "string",
              example: "Friend",
            },
            description: {
              type: "string",
              example: "They grew up together.",
            },
          },
        },

        UpdateRelationshipRequest: {
          type: "object",
          properties: {
            targetCharacterId: {
              type: "string",
              format: "uuid",
            },
            relationType: {
              type: "string",
              example: "Rival",
            },
            description: {
              type: "string",
            },
          },
        },

        /*
         * ============================================================
         * CUSTOM ATTRIBUTE
         * ============================================================
         */

        CustomAttribute: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            character_id: {
              type: "string",
              format: "uuid",
            },
            attribute_key: {
              type: "string",
              example: "Height",
            },
            attribute_value: {
              type: "string",
              example: "170 cm",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
          },
        },

        CustomAttributeSummary: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            key: {
              type: "string",
              example: "Height",
            },
            value: {
              type: "string",
              example: "170 cm",
            },
          },
        },

        CreateCustomAttributeRequest: {
          type: "object",
          required: ["key"],
          properties: {
            key: {
              type: "string",
              example: "Height",
            },
            value: {
              type: "string",
              example: "170 cm",
            },
          },
        },

        UpdateCustomAttributeRequest: {
          type: "object",
          properties: {
            key: {
              type: "string",
              example: "Hair Color",
            },
            value: {
              type: "string",
              example: "Black",
            },
          },
        },

        /*
         * ============================================================
         * MENTION
         * ============================================================
         */

        Mention: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            chapter_id: {
              type: "string",
              format: "uuid",
            },
            character_id: {
              type: "string",
              format: "uuid",
            },
            display_text: {
              type: "string",
              example: "Ariana",
            },
            start_offset: {
              type: "integer",
              nullable: true,
              example: 125,
            },
            end_offset: {
              type: "integer",
              nullable: true,
              example: 131,
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            character_name: {
              type: "string",
              nullable: true,
              example: "Ariana Valen",
            },
            character_alias: {
              type: "string",
              nullable: true,
              example: "Ari",
            },
          },
        },

        CreateMentionRequest: {
          type: "object",
          required: ["characterId", "displayText"],
          properties: {
            characterId: {
              type: "string",
              format: "uuid",
            },
            displayText: {
              type: "string",
              example: "Ariana",
            },
            startOffset: {
              type: "integer",
              minimum: 0,
              example: 125,
            },
            endOffset: {
              type: "integer",
              minimum: 0,
              example: 131,
            },
          },
        },

        UpdateMentionRequest: {
          type: "object",
          properties: {
            characterId: {
              type: "string",
              format: "uuid",
            },
            displayText: {
              type: "string",
              example: "Ari",
            },
            startOffset: {
              type: "integer",
              minimum: 0,
              example: 125,
            },
            endOffset: {
              type: "integer",
              minimum: 0,
              example: 128,
            },
          },
        },

        /*
         * ============================================================
         * QUICK NOTES
         * ============================================================
         */

        QuickNote: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            user_id: {
              type: "string",
              format: "uuid",
            },
            note_scope: {
              type: "string",
              enum: [
                "book",
                "chapter",
                "character",
                "other",
              ],
              example: "book",
            },
            note_category: {
              type: "string",
              enum: [
                "Ide Spontan",
                "Dialog Draft",
                "Plot Hole",
                "Worldbuilding",
                "Lainnya",
              ],
              example: "Ide Spontan",
            },
            book_id: {
              type: "string",
              format: "uuid",
              nullable: true,
            },
            chapter_id: {
              type: "string",
              format: "uuid",
              nullable: true,
            },
            character_id: {
              type: "string",
              format: "uuid",
              nullable: true,
            },
            title: {
              type: "string",
              example: "Important scene",
            },
            content: {
              type: "string",
              example: "Remember to revise this scene.",
            },
            color_tag: {
              type: "string",
              nullable: true,
              example: "#FFD700",
            },
            is_pinned: {
              type: "boolean",
              example: true,
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
          },
        },

        QuickNoteRequest: {
          type: "object",
          properties: {
            title: {
              type: "string",
              example: "Important scene",
            },
            content: {
              type: "string",
              example: "Remember to revise this scene.",
            },
            category: {
              type: "string",
              enum: [
                "Ide Spontan",
                "Dialog Draft",
                "Plot Hole",
                "Worldbuilding",
                "Lainnya",
              ],
              example: "Ide Spontan",
            },
            colorTag: {
              type: "string",
              example: "#FFD700",
            },
            isPinned: {
              type: "boolean",
              example: false,
            },
            noteScope: {
              type: "string",
              enum: [
                "book",
                "chapter",
                "character",
                "other",
              ],
              example: "book",
            },
            bookId: {
              type: "string",
              format: "uuid",
            },
            chapterId: {
              type: "string",
              format: "uuid",
            },
            characterId: {
              type: "string",
              format: "uuid",
            },
          },
          description:
            "Quick note dapat memiliki maksimal satu referensi: bookId, chapterId, atau characterId.",
        },

        /*
         * ============================================================
         * BACKUP
         * ============================================================
         */

        BackupBook: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            user_id: {
              type: "string",
              format: "uuid",
            },
            title: {
              type: "string",
            },
            synopsis: {
              type: "string",
              nullable: true,
            },
            cover_url: {
              type: "string",
              nullable: true,
            },
            target_word_count: {
              type: "integer",
            },
            current_word_count: {
              type: "integer",
            },
            status: {
              type: "string",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
          },
        },

        BackupGenre: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            name: {
              type: "string",
            },
          },
        },

        BackupBookGenre: {
          type: "object",
          properties: {
            book_id: {
              type: "string",
              format: "uuid",
            },
            genre_id: {
              type: "string",
              format: "uuid",
            },
          },
        },

        BackupChapter: {
          allOf: [
            {
              $ref: "#/components/schemas/Chapter",
            },
          ],
        },

        BackupCharacter: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            user_id: {
              type: "string",
              format: "uuid",
            },
            full_name: {
              type: "string",
            },
            alias: {
              type: "string",
              nullable: true,
            },
            age: {
              type: "string",
              nullable: true,
            },
            gender: {
              type: "string",
              nullable: true,
            },
            role_tag: {
              type: "string",
              nullable: true,
            },
            status: {
              type: "string",
              nullable: true,
            },
            avatar_url: {
              type: "string",
              nullable: true,
            },
            physical_appearance: {
              type: "string",
              nullable: true,
            },
            personality_traits: {
              type: "string",
              nullable: true,
            },
            backstory: {
              type: "string",
              nullable: true,
            },
            motivation: {
              type: "string",
              nullable: true,
            },
            world_goal: {
              type: "string",
              nullable: true,
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
          },
        },

        BackupProject: {
          type: "object",
          required: [
            "books",
            "genres",
            "bookGenres",
            "chapters",
            "chapterSnapshots",
            "characters",
            "bookCharacters",
            "customAttributes",
            "relationships",
            "mentions",
            "quickNotes",
          ],
          properties: {
            books: {
              type: "array",
              items: {
                $ref: "#/components/schemas/BackupBook",
              },
            },
            genres: {
              type: "array",
              items: {
                $ref: "#/components/schemas/BackupGenre",
              },
            },
            bookGenres: {
              type: "array",
              items: {
                $ref: "#/components/schemas/BackupBookGenre",
              },
            },
            chapters: {
              type: "array",
              items: {
                $ref: "#/components/schemas/BackupChapter",
              },
            },
            chapterSnapshots: {
              type: "array",
              items: {
                $ref: "#/components/schemas/ChapterSnapshot",
              },
            },
            characters: {
              type: "array",
              items: {
                $ref: "#/components/schemas/BackupCharacter",
              },
            },
            bookCharacters: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  book_id: {
                    type: "string",
                    format: "uuid",
                  },
                  character_id: {
                    type: "string",
                    format: "uuid",
                  },
                },
              },
            },
            customAttributes: {
              type: "array",
              items: {
                $ref: "#/components/schemas/CustomAttribute",
              },
            },
            relationships: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Relationship",
              },
            },
            mentions: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Mention",
              },
            },
            quickNotes: {
              type: "array",
              items: {
                $ref: "#/components/schemas/QuickNote",
              },
            },
          },
        },

        BackupData: {
          type: "object",
          required: ["format", "version", "exportedAt", "project"],
          properties: {
            format: {
              type: "string",
              enum: ["novels-creator"],
              example: "novels-creator",
            },
            version: {
              type: "integer",
              enum: [1],
              example: 1,
            },
            exportedAt: {
              type: "string",
              format: "date-time",
            },
            project: {
              $ref: "#/components/schemas/BackupProject",
            },
          },
        },

        BackupImportResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Backup berhasil diimport",
            },
            data: {
              type: "object",
              properties: {
                imported: {
                  type: "boolean",
                  example: true,
                },
                counts: {
                  type: "object",
                  properties: {
                    books: {
                      type: "integer",
                    },
                    genres: {
                      type: "integer",
                    },
                    chapters: {
                      type: "integer",
                    },
                    characters: {
                      type: "integer",
                    },
                    chapterSnapshots: {
                      type: "integer",
                    },
                    bookGenres: {
                      type: "integer",
                    },
                    bookCharacters: {
                      type: "integer",
                    },
                    customAttributes: {
                      type: "integer",
                    },
                    relationships: {
                      type: "integer",
                    },
                    mentions: {
                      type: "integer",
                    },
                    quickNotes: {
                      type: "integer",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    /*
     * ================================================================
     * PATHS
     * ================================================================
     */

    paths: {
      /*
       * ============================================================
       * HEALTH
       * ============================================================
       */

      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Check API and database health",
          responses: {
            "200": {
              description: "API and database are running",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                        example: "Novel's Creator API is running",
                      },
                      database: {
                        type: "string",
                        example: "connected",
                      },
                      timestamp: {
                        type: "string",
                        format: "date-time",
                      },
                    },
                  },
                },
              },
            },
            "500": {
              description: "Database connection failed",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },

      /*
       * ============================================================
       * AUTHENTICATION
       * ============================================================
       */

      "/api/auth/login": {
        post: {
          tags: ["Authentication"],
          summary: "Login",
          description:
            "Login menggunakan email dan password untuk mendapatkan JWT.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LoginRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Login berhasil",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/LoginResponse",
                  },
                },
              },
            },
            "400": {
              description:
                "Email dan password wajib diisi",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "401": {
              description: "Email atau password salah",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "500": {
              description: "Login gagal",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },

      /*
       * ============================================================
       * ADMIN
       * ============================================================
       */

      "/api/admin/users": {
        get: {
          tags: ["Admin"],
          summary: "Get all users",
          description:
            "Mengambil seluruh user. Hanya Admin yang dapat mengakses endpoint ini.",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Daftar user",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/User",
                        },
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "JWT tidak valid atau tidak ada",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "403": {
              description: "User bukan Admin",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "500": {
              description: "Gagal mengambil data user",
            },
          },
        },

        post: {
          tags: ["Admin"],
          summary: "Create user",
          description:
            "Admin membuat akun baru dan dapat menentukan role admin atau user.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AdminUserRequest",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "User berhasil dibuat",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                        example: "User berhasil dibuat",
                      },
                      data: {
                        $ref: "#/components/schemas/User",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Input tidak valid",
            },
            "401": {
              description: "Unauthorized",
            },
            "403": {
              description: "Admin access required",
            },
            "409": {
              description: "Email sudah digunakan",
            },
            "500": {
              description: "Gagal membuat user",
            },
          },
        },
      },

      "/api/admin/users/{userId}": {
        patch: {
          tags: ["Admin"],
          summary: "Update user",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "userId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AdminUserUpdateRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "User berhasil diperbarui",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                      },
                      data: {
                        $ref: "#/components/schemas/User",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Input atau operasi role tidak valid",
            },
            "401": {
              description: "Unauthorized",
            },
            "403": {
              description: "Admin access required",
            },
            "404": {
              description: "User tidak ditemukan",
            },
            "409": {
              description: "Email sudah digunakan",
            },
            "500": {
              description: "Gagal memperbarui user",
            },
          },
        },

        delete: {
          tags: ["Admin"],
          summary: "Delete user",
          description:
            "Admin dapat menghapus user. Admin tidak dapat menghapus dirinya sendiri atau Admin terakhir.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "userId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          responses: {
            "200": {
              description: "User berhasil dihapus",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                        example: "User berhasil dihapus",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description:
                "Tidak dapat menghapus diri sendiri atau Admin terakhir",
            },
            "401": {
              description: "Unauthorized",
            },
            "403": {
              description: "Admin access required",
            },
            "404": {
              description: "User tidak ditemukan",
            },
            "500": {
              description: "Gagal menghapus user",
            },
          },
        },
      },

      /*
       * ============================================================
       * USERS
       * ============================================================
       */

      "/api/users/me": {
        get: {
          tags: ["Users"],
          summary: "Get current user profile",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Profile user",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        $ref: "#/components/schemas/User",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description: "User tidak ditemukan",
            },
            "500": {
              description: "Gagal mengambil profil",
            },
          },
        },

        patch: {
          tags: ["Users"],
          summary: "Update current user profile",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UpdateProfileRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Profile berhasil diperbarui",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                        example: "Profil berhasil diperbarui",
                      },
                      data: {
                        $ref: "#/components/schemas/User",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description: "User tidak ditemukan",
            },
            "500": {
              description: "Gagal memperbarui profil",
            },
          },
        },
      },

      "/api/users/me/password": {
        patch: {
          tags: ["Users"],
          summary: "Change current user password",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ChangePasswordRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Password berhasil diperbarui",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/MessageResponse",
                  },
                },
              },
            },
            "400": {
              description:
                "Password lama salah, kosong, terlalu pendek, atau sama dengan password lama",
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description: "User tidak ditemukan",
            },
            "500": {
              description: "Gagal memperbarui password",
            },
          },
        },
      },

      /*
       * ============================================================
       * BOOKS
       * ============================================================
       */

      "/api/books": {
        get: {
          tags: ["Books"],
          summary: "Get all books owned by current user",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Daftar buku",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/Book",
                        },
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "500": {
              description: "Gagal mengambil daftar buku",
            },
          },
        },

        post: {
          tags: ["Books"],
          summary: "Create a book",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateBookRequest",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Buku berhasil dibuat",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                        example: "Buku berhasil dibuat",
                      },
                      data: {
                        $ref: "#/components/schemas/Book",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Judul buku wajib diisi",
            },
            "401": {
              description: "Unauthorized",
            },
            "500": {
              description: "Gagal membuat buku",
            },
          },
        },
      },

      "/api/books/{bookId}": {
        get: {
          tags: ["Books"],
          summary: "Get book by ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "bookId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          responses: {
            "200": {
              description: "Detail buku",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        $ref: "#/components/schemas/Book",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description: "Buku tidak ditemukan",
            },
            "500": {
              description: "Gagal mengambil data buku",
            },
          },
        },

        put: {
          tags: ["Books"],
          summary: "Replace/update a book",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "bookId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UpdateBookRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Buku berhasil diperbarui",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                      },
                      data: {
                        $ref: "#/components/schemas/Book",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description: "Buku tidak ditemukan",
            },
            "500": {
              description: "Gagal memperbarui buku",
            },
          },
        },

        patch: {
          tags: ["Books"],
          summary: "Partially update a book",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "bookId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UpdateBookRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Buku berhasil diperbarui",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                      },
                      data: {
                        $ref: "#/components/schemas/Book",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description: "Buku tidak ditemukan",
            },
            "500": {
              description: "Gagal memperbarui buku",
            },
          },
        },

        delete: {
          tags: ["Books"],
          summary: "Delete a book",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "bookId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          responses: {
            "200": {
              description: "Buku berhasil dihapus",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/MessageResponse",
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description: "Buku tidak ditemukan",
            },
            "500": {
              description: "Gagal menghapus buku",
            },
          },
        },
      },

      /*
       * ============================================================
       * GENRES
       * ============================================================
       */

      "/api/genres": {
        get: {
          tags: ["Genres"],
          summary: "Get all genres",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Daftar genre",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/Genre",
                        },
                      },
                    },
                  },
                },
              },
            },
            "500": {
              description: "Gagal mengambil genre",
            },
          },
        },

        post: {
          tags: ["Genres"],
          summary: "Create a genre",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateGenreRequest",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Genre berhasil dibuat",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                        example: "Genre berhasil dibuat",
                      },
                      data: {
                        $ref: "#/components/schemas/Genre",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Nama genre wajib diisi",
            },
            "500": {
              description: "Gagal membuat genre",
            },
          },
        },
      },

      "/api/genres/books/{bookId}/{genreId}": {
        post: {
          tags: ["Genres"],
          summary: "Attach genre to book",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "bookId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
            {
              name: "genreId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          responses: {
            "201": {
              description: "Genre berhasil ditambahkan ke buku",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                      },
                      data: {
                        $ref: "#/components/schemas/BookGenre",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description: "Buku atau genre tidak ditemukan",
            },
            "500": {
              description: "Gagal menambahkan genre ke buku",
            },
          },
        },

        delete: {
          tags: ["Genres"],
          summary: "Detach genre from book",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "bookId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
            {
              name: "genreId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          responses: {
            "200": {
              description: "Genre berhasil dihapus dari buku",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/MessageResponse",
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description: "Relasi genre tidak ditemukan",
            },
            "500": {
              description: "Gagal menghapus genre dari buku",
            },
          },
        },
      },

      /*
       * ============================================================
       * CHAPTERS
       * ============================================================
       */

      "/api/books/{bookId}/chapters": {
        get: {
          tags: ["Chapters"],
          summary: "Get all chapters of a book",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "bookId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          responses: {
            "200": {
              description: "Daftar chapter",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/Chapter",
                        },
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "500": {
              description: "Gagal mengambil chapter",
            },
          },
        },

        post: {
          tags: ["Chapters"],
          summary: "Create chapter",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "bookId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateChapterRequest",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Chapter berhasil dibuat",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                        example: "Chapter berhasil dibuat",
                      },
                      data: {
                        $ref: "#/components/schemas/Chapter",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Judul chapter wajib diisi",
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description: "Buku tidak ditemukan",
            },
            "409": {
              description: "Nomor chapter sudah digunakan",
            },
            "500": {
              description: "Gagal membuat chapter",
            },
          },
        },
      },

      "/api/books/{bookId}/chapters/{chapterId}": {
        get: {
          tags: ["Chapters"],
          summary: "Get chapter by ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "bookId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
            {
              name: "chapterId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          responses: {
            "200": {
              description: "Detail chapter",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        $ref: "#/components/schemas/Chapter",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description: "Chapter tidak ditemukan",
            },
            "500": {
              description: "Gagal mengambil chapter",
            },
          },
        },

        patch: {
          tags: ["Chapters"],
          summary: "Update chapter",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "bookId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
            {
              name: "chapterId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UpdateChapterRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Chapter berhasil diperbarui",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                      },
                      data: {
                        $ref: "#/components/schemas/Chapter",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description: "Chapter tidak ditemukan",
            },
            "409": {
              description: "Nomor chapter sudah digunakan",
            },
            "500": {
              description: "Gagal memperbarui chapter",
            },
          },
        },

        delete: {
          tags: ["Chapters"],
          summary: "Delete chapter",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "bookId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
            {
              name: "chapterId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          responses: {
            "200": {
              description: "Chapter berhasil dihapus",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/MessageResponse",
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description: "Chapter tidak ditemukan",
            },
            "500": {
              description: "Gagal menghapus chapter",
            },
          },
        },
      },

      /*
       * ============================================================
       * SNAPSHOTS
       * ============================================================
       */

      "/api/books/{bookId}/chapters/{chapterId}/snapshots": {
        get: {
          tags: ["Snapshots"],
          summary: "List chapter snapshots",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "bookId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
            {
              name: "chapterId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          responses: {
            "200": {
              description: "Daftar snapshot",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/ChapterSnapshot",
                        },
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description: "Chapter tidak ditemukan",
            },
            "500": {
              description: "Gagal mengambil snapshot",
            },
          },
        },

        post: {
          tags: ["Snapshots"],
          summary: "Create chapter snapshot",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "bookId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
            {
              name: "chapterId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateSnapshotRequest",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Snapshot berhasil dibuat",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                      },
                      data: {
                        $ref: "#/components/schemas/ChapterSnapshot",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Data snapshot tidak lengkap",
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description: "Chapter tidak ditemukan",
            },
            "500": {
              description: "Gagal membuat snapshot",
            },
          },
        },
      },

      "/api/books/{bookId}/chapters/{chapterId}/snapshots/{snapshotId}": {
        get: {
          tags: ["Snapshots"],
          summary: "Get snapshot by ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "bookId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
            {
              name: "chapterId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
            {
              name: "snapshotId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          responses: {
            "200": {
              description: "Detail snapshot",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        $ref: "#/components/schemas/ChapterSnapshot",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description: "Snapshot tidak ditemukan",
            },
            "500": {
              description: "Gagal mengambil snapshot",
            },
          },
        },
      },

      /*
       * ============================================================
       * CHARACTERS
       * ============================================================
       */

      "/api/characters": {
        get: {
          tags: ["Characters"],
          summary: "List characters",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "bookId",
              in: "query",
              required: false,
              description:
                "Filter character yang terhubung dengan book tertentu.",
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          responses: {
            "200": {
              description: "Daftar character",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Character",
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "500": {
              description: "Gagal mengambil karakter",
            },
          },
        },

        post: {
          tags: ["Characters"],
          summary: "Create character",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateCharacterRequest",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Character berhasil dibuat",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Character",
                  },
                },
              },
            },
            "400": {
              description: "fullName wajib diisi",
            },
            "401": {
              description: "Unauthorized",
            },
            "403": {
              description: "Buku tidak dimiliki user",
            },
            "500": {
              description: "Gagal membuat karakter",
            },
          },
        },
      },

      "/api/characters/{characterId}": {
        get: {
          tags: ["Characters"],
          summary: "Get character by ID",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "characterId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          responses: {
            "200": {
              description: "Detail character",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Character",
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description: "Karakter tidak ditemukan",
            },
            "500": {
              description: "Gagal mengambil karakter",
            },
          },
        },

        patch: {
          tags: ["Characters"],
          summary: "Update character",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "characterId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UpdateCharacterRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Character berhasil diperbarui",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Character",
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "403": {
              description: "Buku tidak dimiliki user",
            },
            "404": {
              description: "Karakter tidak ditemukan",
            },
            "500": {
              description: "Gagal memperbarui karakter",
            },
          },
        },

        delete: {
          tags: ["Characters"],
          summary: "Delete character",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "characterId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          responses: {
            "200": {
              description: "Character berhasil dihapus",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Karakter berhasil dihapus",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description: "Karakter tidak ditemukan",
            },
            "500": {
              description: "Gagal menghapus karakter",
            },
          },
        },
      },

      /*
       * ============================================================
       * RELATIONSHIPS
       * ============================================================
       */

      "/api/characters/{characterId}/relationships": {
        get: {
          tags: ["Relationships"],
          summary: "List character relationships",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "characterId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          responses: {
            "200": {
              description: "Daftar relationship",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Relationship",
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description: "Karakter tidak ditemukan",
            },
            "500": {
              description: "Gagal mengambil relationship",
            },
          },
        },

        post: {
          tags: ["Relationships"],
          summary: "Create character relationship",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "characterId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateRelationshipRequest",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Relationship berhasil dibuat",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Relationship",
                  },
                },
              },
            },
            "400": {
              description:
                "targetCharacterId/relationType tidak valid atau self relationship",
            },
            "401": {
              description: "Unauthorized",
            },
            "403": {
              description: "Target character tidak dimiliki user",
            },
            "404": {
              description: "Karakter tidak ditemukan",
            },
            "500": {
              description: "Gagal membuat relationship",
            },
          },
        },
      },

      "/api/characters/{characterId}/relationships/{relationshipId}": {
        patch: {
          tags: ["Relationships"],
          summary: "Update character relationship",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "characterId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
            {
              name: "relationshipId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UpdateRelationshipRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Relationship berhasil diperbarui",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Relationship",
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "403": {
              description: "Target character tidak dimiliki user",
            },
            "404": {
              description: "Relationship tidak ditemukan",
            },
            "500": {
              description: "Gagal memperbarui relationship",
            },
          },
        },

        delete: {
          tags: ["Relationships"],
          summary: "Delete character relationship",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "characterId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
            {
              name: "relationshipId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          responses: {
            "200": {
              description: "Relationship berhasil dihapus",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example:
                          "Relationship berhasil dihapus",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description: "Relationship tidak ditemukan",
            },
            "500": {
              description: "Gagal menghapus relationship",
            },
          },
        },
      },

      /*
       * ============================================================
       * CUSTOM ATTRIBUTES
       * ============================================================
       */

      "/api/characters/{characterId}/attributes": {
        get: {
          tags: ["Custom Attributes"],
          summary: "List custom attributes",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "characterId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          responses: {
            "200": {
              description: "Daftar custom attributes",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/CustomAttribute",
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description: "Karakter tidak ditemukan",
            },
            "500": {
              description:
                "Gagal mengambil custom attributes",
            },
          },
        },

        post: {
          tags: ["Custom Attributes"],
          summary: "Create custom attribute",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "characterId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateCustomAttributeRequest",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Custom attribute berhasil dibuat",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/CustomAttribute",
                  },
                },
              },
            },
            "400": {
              description: "key wajib diisi",
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description: "Karakter tidak ditemukan",
            },
            "500": {
              description:
                "Gagal membuat custom attribute",
            },
          },
        },
      },

      "/api/characters/{characterId}/attributes/{attributeId}": {
        patch: {
          tags: ["Custom Attributes"],
          summary: "Update custom attribute",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "characterId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
            {
              name: "attributeId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UpdateCustomAttributeRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description:
                "Custom attribute berhasil diperbarui",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/CustomAttribute",
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description:
                "Custom attribute tidak ditemukan",
            },
            "500": {
              description:
                "Gagal memperbarui custom attribute",
            },
          },
        },

        delete: {
          tags: ["Custom Attributes"],
          summary: "Delete custom attribute",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "characterId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
            {
              name: "attributeId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          responses: {
            "200": {
              description:
                "Custom attribute berhasil dihapus",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example:
                          "Custom attribute berhasil dihapus",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description:
                "Custom attribute tidak ditemukan",
            },
            "500": {
              description:
                "Gagal menghapus custom attribute",
            },
          },
        },
      },

      /*
       * ============================================================
       * MENTIONS
       * ============================================================
       */

      "/api/books/{bookId}/chapters/{chapterId}/mentions": {
        get: {
          tags: ["Mentions"],
          summary: "List character mentions",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "bookId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
            {
              name: "chapterId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          responses: {
            "200": {
              description: "Daftar character mentions",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Mention",
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description: "Chapter tidak ditemukan",
            },
            "500": {
              description:
                "Gagal mengambil character mentions",
            },
          },
        },

        post: {
          tags: ["Mentions"],
          summary: "Create character mention",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "bookId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
            {
              name: "chapterId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateMentionRequest",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Mention berhasil dibuat",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Mention",
                  },
                },
              },
            },
            "400": {
              description:
                "characterId/displayText tidak valid atau character belum terhubung dengan buku",
            },
            "401": {
              description: "Unauthorized",
            },
            "403": {
              description: "Character tidak dimiliki user",
            },
            "404": {
              description: "Chapter tidak ditemukan",
            },
            "500": {
              description:
                "Gagal membuat character mention",
            },
          },
        },
      },

      "/api/books/{bookId}/chapters/{chapterId}/mentions/{mentionId}": {
        patch: {
          tags: ["Mentions"],
          summary: "Update character mention",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "bookId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
            {
              name: "chapterId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
            {
              name: "mentionId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UpdateMentionRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Mention berhasil diperbarui",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Mention",
                  },
                },
              },
            },
            "400": {
              description:
                "Character belum terhubung dengan buku",
            },
            "401": {
              description: "Unauthorized",
            },
            "403": {
              description: "Character tidak dimiliki user",
            },
            "404": {
              description:
                "Character mention tidak ditemukan",
            },
            "500": {
              description:
                "Gagal memperbarui character mention",
            },
          },
        },

        delete: {
          tags: ["Mentions"],
          summary: "Delete character mention",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "bookId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
            {
              name: "chapterId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
            {
              name: "mentionId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          responses: {
            "200": {
              description: "Mention berhasil dihapus",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example:
                          "Character mention berhasil dihapus",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description:
                "Character mention tidak ditemukan",
            },
            "500": {
              description:
                "Gagal menghapus character mention",
            },
          },
        },
      },

      /*
       * ============================================================
       * QUICK NOTES
       * ============================================================
       */

      "/api/quick-notes": {
        get: {
          tags: ["Quick Notes"],
          summary: "Get current user's quick notes",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Daftar quick notes",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      data: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/QuickNote",
                        },
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "500": {
              description:
                "Gagal mengambil quick notes",
            },
          },
        },

        post: {
          tags: ["Quick Notes"],
          summary: "Create quick note",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/QuickNoteRequest",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Quick note berhasil dibuat",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                        example:
                          "Quick note berhasil dibuat",
                      },
                      data: {
                        $ref: "#/components/schemas/QuickNote",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description:
                "Input note/reference tidak valid",
            },
            "401": {
              description: "Unauthorized",
            },
            "403": {
              description:
                "Reference book/chapter/character bukan milik user",
            },
            "500": {
              description:
                "Gagal membuat quick note",
            },
          },
        },
      },

      "/api/quick-notes/{noteId}": {
        patch: {
          tags: ["Quick Notes"],
          summary: "Update quick note",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "noteId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/QuickNoteRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description:
                "Quick note berhasil diperbarui",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                      },
                      data: {
                        $ref: "#/components/schemas/QuickNote",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description:
                "Input note/reference tidak valid",
            },
            "401": {
              description: "Unauthorized",
            },
            "403": {
              description:
                "Reference bukan milik user",
            },
            "404": {
              description: "Quick note tidak ditemukan",
            },
            "500": {
              description:
                "Gagal memperbarui quick note",
            },
          },
        },

        delete: {
          tags: ["Quick Notes"],
          summary: "Delete quick note",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "noteId",
              in: "path",
              required: true,
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          responses: {
            "200": {
              description:
                "Quick note berhasil dihapus",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        example: true,
                      },
                      message: {
                        type: "string",
                        example:
                          "Quick note berhasil dihapus",
                      },
                      data: {
                        type: "object",
                        properties: {
                          id: {
                            type: "string",
                            format: "uuid",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "404": {
              description:
                "Quick note tidak ditemukan",
            },
            "500": {
              description:
                "Gagal menghapus quick note",
            },
          },
        },
      },

      /*
       * ============================================================
       * BACKUP
       * ============================================================
       */

      "/api/backup/export": {
        get: {
          tags: ["Backup"],
          summary: "Export user's project backup",
          description:
            "Menghasilkan seluruh data project milik user dalam format JSON backup.",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description:
                "Backup JSON berhasil dibuat",
              headers: {
                "Content-Disposition": {
                  description:
                    "Nama file backup JSON",
                  schema: {
                    type: "string",
                    example:
                      'attachment; filename="novels-creator-backup-2026-09-28.json"',
                  },
                },
              },
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/BackupData",
                  },
                },
              },
            },
            "401": {
              description: "Authentication required",
            },
            "500": {
              description:
                "Gagal melakukan export backup",
            },
          },
        },
      },

      "/api/backup/import": {
        post: {
          tags: ["Backup"],
          summary: "Import user's project backup",
          description:
            "Import backup JSON dengan format novels-creator version 1. ID lama akan dipetakan ke ID baru.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/BackupData",
                },
              },
            },
          },
          responses: {
            "200": {
              description:
                "Backup berhasil diimport",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/BackupImportResponse",
                  },
                },
              },
            },
            "400": {
              description:
                "Backup JSON, format, version, structure, atau reference tidak valid",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "401": {
              description: "Authentication required",
            },
          },
        },
      },
    },
  },

  /*
   * Semua endpoint ditulis langsung di definition.paths.
   * Jadi tidak diperlukan @openapi di file routes.
   */
  apis: [],
  failOnErrors: true,
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
