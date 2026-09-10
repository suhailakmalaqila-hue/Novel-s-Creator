-- =========================================================
-- Novel's Creator
-- Initial Database Schema
-- PostgreSQL
-- =========================================================


-- =========================================================
-- ENUM TYPES
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM (
    'admin',
    'user'
);

CREATE TYPE book_status AS ENUM (
    'draft',
    'ongoing',
    'completed',
    'hiatus'
);

CREATE TYPE chapter_status AS ENUM (
    'draft',
    'review',
    'published'
);

CREATE TYPE note_category AS ENUM (
    'Ide Spontan',
    'Dialog Draft',
    'Plot Hole',
    'Worldbuilding',
    'Lainnya'
);

CREATE TYPE note_scope AS ENUM (
    'book',
    'chapter',
    'character',
    'other'
);

CREATE TYPE character_role_tag AS ENUM (
    'Protagonis',
    'Antagonis',
    'Side',
    'Mentor',
    'Rival',
    'Netral'
);

CREATE TYPE character_status AS ENUM (
    'Hidup',
    'Mati',
    'Hilang',
    'Disegel',
    'Reinkarnasi',
    'Lainnya'
);


-- =========================================================
-- USERS
-- D1 - User Profile & Role
-- =========================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    role user_role NOT NULL DEFAULT 'user',

    author_name VARCHAR(100),
    pen_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,

    daily_word_goal INTEGER NOT NULL DEFAULT 0,
    today_word_count INTEGER NOT NULL DEFAULT 0,

    last_active_date DATE,

    theme VARCHAR(20) NOT NULL DEFAULT 'dark',
    sound_effects BOOLEAN NOT NULL DEFAULT true,

    preferred_genre VARCHAR(100),

    tutorial_completed BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- BOOKS
-- D2 - Data Buku & Book-Genre
-- =========================================================

CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    title VARCHAR(255) NOT NULL,
    synopsis TEXT,
    cover_url TEXT,

    target_word_count INTEGER NOT NULL DEFAULT 0,
    current_word_count INTEGER NOT NULL DEFAULT 0,

    status book_status NOT NULL DEFAULT 'draft',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_books_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


CREATE INDEX idx_books_user_id
    ON books(user_id);


-- =========================================================
-- GENRES
-- D7 - Data Genre
-- =========================================================

CREATE TABLE genres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL UNIQUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================
-- BOOK GENRES
-- =========================================================

CREATE TABLE book_genres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    book_id UUID NOT NULL,
    genre_id UUID NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_book_genres_book
        FOREIGN KEY (book_id)
        REFERENCES books(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_book_genres_genre
        FOREIGN KEY (genre_id)
        REFERENCES genres(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_book_genre
        UNIQUE (book_id, genre_id)
);


CREATE INDEX idx_book_genres_book_id
    ON book_genres(book_id);

CREATE INDEX idx_book_genres_genre_id
    ON book_genres(genre_id);


-- =========================================================
-- CHAPTERS
-- D3 - Data Chapter
-- =========================================================

CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    book_id UUID NOT NULL,

    chapter_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,

    content TEXT NOT NULL DEFAULT '',

    word_count INTEGER NOT NULL DEFAULT 0,
    character_count INTEGER NOT NULL DEFAULT 0,

    status chapter_status NOT NULL DEFAULT 'draft',

    sort_order INTEGER NOT NULL DEFAULT 0,

    last_saved_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_chapters_book
        FOREIGN KEY (book_id)
        REFERENCES books(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_chapter_number_per_book
        UNIQUE (book_id, chapter_number)
);


CREATE INDEX idx_chapters_book_id
    ON chapters(book_id);


-- =========================================================
-- CHAPTER SNAPSHOTS
-- D4 - Chapter Snapshots
-- =========================================================

CREATE TABLE chapter_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    chapter_id UUID NOT NULL,
    book_id UUID NOT NULL,

    chapter_title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL DEFAULT '',

    word_count INTEGER NOT NULL DEFAULT 0,

    reason VARCHAR(255),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_snapshots_chapter
        FOREIGN KEY (chapter_id)
        REFERENCES chapters(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_snapshots_book
        FOREIGN KEY (book_id)
        REFERENCES books(id)
        ON DELETE CASCADE
);


CREATE INDEX idx_snapshots_chapter_id
    ON chapter_snapshots(chapter_id);

CREATE INDEX idx_snapshots_book_id
    ON chapter_snapshots(book_id);


-- =========================================================
-- CHARACTERS
-- D5 - Data Karakter & Relasi
-- =========================================================

CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    full_name VARCHAR(255) NOT NULL,
    alias VARCHAR(255),

    age VARCHAR(50),
    gender VARCHAR(50),

    role_tag character_role_tag NOT NULL DEFAULT 'Netral',
    status character_status NOT NULL DEFAULT 'Hidup',

    avatar_url TEXT,

    physical_appearance TEXT,
    personality_traits TEXT,
    backstory TEXT,
    motivation TEXT,
    world_goal TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_characters_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


CREATE INDEX idx_characters_user_id
    ON characters(user_id);


-- =========================================================
-- BOOK CHARACTERS
-- =========================================================

CREATE TABLE book_characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    book_id UUID NOT NULL,
    character_id UUID NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_book_characters_book
        FOREIGN KEY (book_id)
        REFERENCES books(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_book_characters_character
        FOREIGN KEY (character_id)
        REFERENCES characters(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_book_character
        UNIQUE (book_id, character_id)
);


CREATE INDEX idx_book_characters_book_id
    ON book_characters(book_id);

CREATE INDEX idx_book_characters_character_id
    ON book_characters(character_id);


-- =========================================================
-- CHARACTER CUSTOM ATTRIBUTES
-- =========================================================

CREATE TABLE character_custom_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    character_id UUID NOT NULL,

    attribute_key VARCHAR(100) NOT NULL,
    attribute_value TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_custom_attributes_character
        FOREIGN KEY (character_id)
        REFERENCES characters(id)
        ON DELETE CASCADE
);


CREATE INDEX idx_custom_attributes_character_id
    ON character_custom_attributes(character_id);


-- =========================================================
-- CHARACTER RELATIONSHIPS
-- =========================================================

CREATE TABLE character_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    character_id UUID NOT NULL,
    target_character_id UUID NOT NULL,

    relation_type VARCHAR(100) NOT NULL,
    description TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_relationship_character
        FOREIGN KEY (character_id)
        REFERENCES characters(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_relationship_target
        FOREIGN KEY (target_character_id)
        REFERENCES characters(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_relationship_not_self
        CHECK (character_id <> target_character_id)
);


CREATE INDEX idx_relationship_character_id
    ON character_relationships(character_id);

CREATE INDEX idx_relationship_target_id
    ON character_relationships(target_character_id);


-- =========================================================
-- CHAPTER CHARACTER MENTIONS
-- D8 - Character Mentions in Chapter
-- =========================================================

CREATE TABLE chapter_character_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    chapter_id UUID NOT NULL,
    character_id UUID NOT NULL,

    display_text VARCHAR(255) NOT NULL,

    start_offset INTEGER,
    end_offset INTEGER,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_mentions_chapter
        FOREIGN KEY (chapter_id)
        REFERENCES chapters(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_mentions_character
        FOREIGN KEY (character_id)
        REFERENCES characters(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_mention_offsets
        CHECK (
            start_offset IS NULL
            OR end_offset IS NULL
            OR (
                start_offset >= 0
                AND end_offset >= start_offset
            )
        )
);


CREATE INDEX idx_mentions_chapter_id
    ON chapter_character_mentions(chapter_id);

CREATE INDEX idx_mentions_character_id
    ON chapter_character_mentions(character_id);


-- =========================================================
-- QUICK NOTES
-- D6 - Quick Notes
-- =========================================================

CREATE TABLE quick_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    note_scope note_scope NOT NULL DEFAULT 'other',
    note_category note_category NOT NULL DEFAULT 'Lainnya',

    book_id UUID,
    chapter_id UUID,
    character_id UUID,

    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL DEFAULT '',

    color_tag VARCHAR(20),

    is_pinned BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notes_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notes_book
        FOREIGN KEY (book_id)
        REFERENCES books(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notes_chapter
        FOREIGN KEY (chapter_id)
        REFERENCES chapters(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notes_character
        FOREIGN KEY (character_id)
        REFERENCES characters(id)
        ON DELETE CASCADE
);


CREATE INDEX idx_quick_notes_user_id
    ON quick_notes(user_id);

CREATE INDEX idx_quick_notes_book_id
    ON quick_notes(book_id);

CREATE INDEX idx_quick_notes_chapter_id
    ON quick_notes(chapter_id);

CREATE INDEX idx_quick_notes_character_id
    ON quick_notes(character_id);