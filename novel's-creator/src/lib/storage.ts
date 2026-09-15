/**
 * Novel's Creator - Storage Persistence & Utility Layer
 * MIGRATION NOTE (Tahap 3.5):
 * - AUTH & BOOKS data have migrated to Express Backend + PostgreSQL.
 * - LocalStorage is strictly maintained for Auth Tokens (`auth_token`, `auth_user`)
 *   and unmigrated features (chapters, characters, quick_notes).
 */

import {
  Book,
  Chapter,
  ChapterSnapshot,
  CharacterWiki,
  QuickNote,
  UserAuthorProfile,
} from '../types';

const STORAGE_KEYS = {
  // New Auth Keys for Express JWT
  AUTH_TOKEN: 'auth_token',
  AUTH_USER: 'auth_user',

  // Legacy Keys (Maintained for unmigrated features)
  CHAPTERS: 'nc_chapters_v1',
  CHARACTERS: 'nc_characters_v1',
  QUICK_NOTES: 'nc_quick_notes_v1',
  CUSTOM_GENRES: 'nc_custom_genres_v1',
  CHAPTER_SNAPSHOTS: 'nc_snapshots_v1',
  TUTORIAL_COMPLETED: 'nc_tutorial_completed_v1',
  ACTIVE_BOOK_ID: 'nc_active_book_id',
  ACTIVE_CHAPTER_ID: 'nc_active_chapter_id',
};

export const DEFAULT_STANDARD_GENRES = [
  'Fantasi',
  'Sci-Fi',
  'Romansa',
  'Misteri',
  'Isekai',
  'Horor',
  'Thriller',
  'Petualangan',
  'Drama',
  'Slice of Life',
  'Aksi',
  'Historis',
  'Supernatural',
  'Cyberpunk',
  'Wuxia / Xianxia',
];

// Helper to safely parse JSON from localStorage
function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue;
    }
    const raw = localStorage.getItem(key);
    if (!raw || raw === 'undefined' || raw === 'null') return defaultValue;
    const parsed = JSON.parse(raw);
    return (parsed !== null && parsed !== undefined) ? (parsed as T) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    if (value === undefined) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

// -------------------------------------------------------------
// 1. MIGRATED: USER PROFILE & AUTH (Membaca Token JWT & User API)
// -------------------------------------------------------------

export function getStoredUser(): UserAuthorProfile | null {
  return getLocalItem<UserAuthorProfile | null>(STORAGE_KEYS.AUTH_USER, null);
}

export function saveStoredUser(profile: UserAuthorProfile): void {
  setLocalItem(STORAGE_KEYS.AUTH_USER, profile);
}

export const getUserProfile = getStoredUser;
export const saveUserProfile = saveStoredUser;

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  return Boolean(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN));
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
}

export function setAuthenticated(isAuth: boolean): void {
  if (!isAuth) {
    clearAuthSession();
  }
}

export function isTutorialCompleted(): boolean {
  return getLocalItem<boolean>(STORAGE_KEYS.TUTORIAL_COMPLETED, false);
}

export function setTutorialCompleted(completed: boolean): void {
  setLocalItem(STORAGE_KEYS.TUTORIAL_COMPLETED, completed);
}

// -------------------------------------------------------------
// 2. MIGRATED: BOOKS (DEPRECATED - Gunakan BookContext & REST API)
// -------------------------------------------------------------

export function getBooks(): Book[] {
  console.warn('[DEPRECATED] getBooks() via storage.ts is deprecated. Use BookContext / REST API.');
  return [];
}

export function saveBook(book: Book): void {
  console.warn('[DEPRECATED] saveBook() via storage.ts is deprecated. Use BookContext / REST API.', book);
}

export function deleteBook(bookId: string): void {
  console.warn('[DEPRECATED] deleteBook() via storage.ts is deprecated. Use BookContext / REST API.', bookId);
}

// -------------------------------------------------------------
// 3. CHAPTERS (MAINTAINED - Belum Pindah ke PostgreSQL)
// -------------------------------------------------------------

export function getChapters(bookId?: string): Chapter[] {
  const all = getLocalItem<Chapter[]>(STORAGE_KEYS.CHAPTERS, []);
  if (bookId) {
    return all
      .filter((c) => c.bookId === bookId)
      .sort((a, b) => a.order - b.order);
  }
  return all.sort((a, b) => a.order - b.order);
}

export function saveChapter(chapter: Chapter): void {
  const chapters = getLocalItem<Chapter[]>(STORAGE_KEYS.CHAPTERS, []);
  const index = chapters.findIndex((c) => c.id === chapter.id);

  if (index >= 0) {
    chapters[index] = { ...chapter, lastSavedAt: Date.now() };
  } else {
    chapters.push({ ...chapter, createdAt: Date.now(), lastSavedAt: Date.now() });
  }

  setLocalItem(STORAGE_KEYS.CHAPTERS, chapters);
}

export function deleteChapter(chapterId: string): void {
  const chapters = getLocalItem<Chapter[]>(STORAGE_KEYS.CHAPTERS, []);
  const filtered = chapters.filter((c) => c.id !== chapterId);
  setLocalItem(STORAGE_KEYS.CHAPTERS, filtered);
}

// -------------------------------------------------------------
// 4. CHAPTER EMERGENCY DRAFT SNAPSHOTS
// -------------------------------------------------------------

export function getSnapshots(chapterId?: string): ChapterSnapshot[] {
  const all = getLocalItem<ChapterSnapshot[]>(STORAGE_KEYS.CHAPTER_SNAPSHOTS, []);
  if (chapterId) {
    return all
      .filter((s) => s.chapterId === chapterId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }
  return all.sort((a, b) => b.timestamp - a.timestamp);
}

export function saveSnapshot(snapshot: ChapterSnapshot): void {
  const snapshots = getSnapshots();
  const updated = [snapshot, ...snapshots].slice(0, 50);
  setLocalItem(STORAGE_KEYS.CHAPTER_SNAPSHOTS, updated);
}

// -------------------------------------------------------------
// 5. CHARACTER WIKI (MAINTAINED)
// -------------------------------------------------------------

export function getCharacters(): CharacterWiki[] {
  return getLocalItem<CharacterWiki[]>(STORAGE_KEYS.CHARACTERS, []);
}

export function saveCharacter(character: CharacterWiki): void {
  const characters = getCharacters();
  const index = characters.findIndex((c) => c.id === character.id);
  if (index >= 0) {
    characters[index] = { ...character, updatedAt: Date.now() };
  } else {
    characters.unshift({
      ...character,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
  setLocalItem(STORAGE_KEYS.CHARACTERS, characters);
}

export function deleteCharacter(characterId: string): void {
  const characters = getCharacters().filter((c) => c.id !== characterId);
  const cleaned = characters.map((char) => ({
    ...char,
    relationships: char.relationships.filter(
      (rel) => rel.targetCharacterId !== characterId
    ),
  }));
  setLocalItem(STORAGE_KEYS.CHARACTERS, cleaned);
}

// -------------------------------------------------------------
// 6. QUICK NOTES (MAINTAINED)
// -------------------------------------------------------------

export function getQuickNotes(): QuickNote[] {
  return getLocalItem<QuickNote[]>(STORAGE_KEYS.QUICK_NOTES, []);
}

export function saveQuickNote(note: QuickNote): void {
  const notes = getQuickNotes();
  const index = notes.findIndex((n) => n.id === note.id);
  if (index >= 0) {
    notes[index] = { ...note, updatedAt: Date.now() };
  } else {
    notes.unshift({ ...note, createdAt: Date.now(), updatedAt: Date.now() });
  }
  setLocalItem(STORAGE_KEYS.QUICK_NOTES, notes);
}

export function deleteQuickNote(noteId: string): void {
  const notes = getQuickNotes().filter((n) => n.id !== noteId);
  setLocalItem(STORAGE_KEYS.QUICK_NOTES, notes);
}

// -------------------------------------------------------------
// 7. CUSTOM GENRES
// -------------------------------------------------------------

export function getCustomGenres(): string[] {
  return getLocalItem<string[]>(STORAGE_KEYS.CUSTOM_GENRES, []);
}

export function saveCustomGenre(genre: string): string[] {
  const trimmed = genre.trim();
  if (!trimmed) return getCustomGenres();
  const current = getCustomGenres();
  if (!current.includes(trimmed) && !DEFAULT_STANDARD_GENRES.includes(trimmed)) {
    const updated = [...current, trimmed];
    setLocalItem(STORAGE_KEYS.CUSTOM_GENRES, updated);
    return updated;
  }
  return current;
}

// -------------------------------------------------------------
// 8. DATA BACKUP & EXPORT / IMPORT
// -------------------------------------------------------------

export interface AppBackupData {
  version: string;
  exportedAt: string;
  profile: UserAuthorProfile | null;
  books: Book[];
  chapters: Chapter[];
  characters: CharacterWiki[];
  quickNotes: QuickNote[];
  customGenres: string[];
}

export function exportAllDataAsJSON(): string {
  const backup: AppBackupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    profile: getStoredUser(),
    books: [],
    chapters: getChapters(),
    characters: getCharacters(),
    quickNotes: getQuickNotes(),
    customGenres: getCustomGenres(),
  };
  return JSON.stringify(backup, null, 2);
}

export function importAllDataFromJSON(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString) as Partial<AppBackupData>;
    if (parsed.chapters && Array.isArray(parsed.chapters)) {
      setLocalItem(STORAGE_KEYS.CHAPTERS, parsed.chapters);
    }
    if (parsed.characters && Array.isArray(parsed.characters)) {
      setLocalItem(STORAGE_KEYS.CHARACTERS, parsed.characters);
    }
    if (parsed.quickNotes && Array.isArray(parsed.quickNotes)) {
      setLocalItem(STORAGE_KEYS.QUICK_NOTES, parsed.quickNotes);
    }
    if (parsed.customGenres && Array.isArray(parsed.customGenres)) {
      setLocalItem(STORAGE_KEYS.CUSTOM_GENRES, parsed.customGenres);
    }
    if (parsed.profile) {
      setLocalItem(STORAGE_KEYS.AUTH_USER, parsed.profile);
    }
    return true;
  } catch (err) {
    console.error('Import backup failed:', err);
    return false;
  }
}

// -------------------------------------------------------------
// 9. TEXT & WORD COUNT UTILS (MAINTAINED)
// -------------------------------------------------------------

export function countWords(text: string): number {
  if (!text) return 0;
  const clean = text.replace(/<[^>]*>/g, ' ').trim();
  if (!clean) return 0;
  const matches = clean.match(/[\w\d\u00C0-\u024F\u1E00-\u1EFF'-]+/g);
  return matches ? matches.length : 0;
}

export function countCharacters(text: string): number {
  if (!text) return 0;
  const clean = text.replace(/<[^>]*>/g, '');
  return clean.length;
}

export function purgeTutorialDummyData(): void {
  const chapters = getChapters().filter((c) => !(c as unknown as { isTutorialDummy?: boolean }).isTutorialDummy && !c.id.startsWith('tut-dummy'));
  const characters = getCharacters().filter((c) => !(c as unknown as { isTutorialDummy?: boolean }).isTutorialDummy && !c.id.startsWith('tut-dummy'));
  const notes = getQuickNotes().filter((n) => !(n as unknown as { isTutorialDummy?: boolean }).isTutorialDummy && !n.id.startsWith('tut-dummy'));

  setLocalItem(STORAGE_KEYS.CHAPTERS, chapters);
  setLocalItem(STORAGE_KEYS.CHARACTERS, characters);
  setLocalItem(STORAGE_KEYS.QUICK_NOTES, notes);
}


// /**
//  * Novel's Creator - LocalStorage Persistence & Data Layer
//  * STRICT ZERO HARDCODED DUMMY DATA RULE: Everything starts as empty array [].
//  */

// import {
//   Book,
//   Chapter,
//   ChapterSnapshot,
//   CharacterWiki,
//   QuickNote,
//   UserAuthorProfile,
// } from '../types';

// const STORAGE_KEYS = {
//   USER_PROFILE: 'nc_user_profile',
//   AUTH_SESSION: 'nc_auth_session',
//   BOOKS: 'nc_books_v1',
//   CHAPTERS: 'nc_chapters_v1',
//   CHARACTERS: 'nc_characters_v1',
//   QUICK_NOTES: 'nc_quick_notes_v1',
//   CUSTOM_GENRES: 'nc_custom_genres_v1',
//   CHAPTER_SNAPSHOTS: 'nc_snapshots_v1',
//   TUTORIAL_COMPLETED: 'nc_tutorial_completed_v1',
//   ACTIVE_BOOK_ID: 'nc_active_book_id',
//   ACTIVE_CHAPTER_ID: 'nc_active_chapter_id',
// };

// export const DEFAULT_STANDARD_GENRES = [
//   'Fantasi',
//   'Sci-Fi',
//   'Romansa',
//   'Misteri',
//   'Isekai',
//   'Horor',
//   'Thriller',
//   'Petualangan',
//   'Drama',
//   'Slice of Life',
//   'Aksi',
//   'Historis',
//   'Supernatural',
//   'Cyberpunk',
//   'Wuxia / Xianxia',
// ];

// // Helper to safely parse JSON from localStorage
// function getLocalItem<T>(key: string, defaultValue: T): T {
//   try {
//     if (typeof window === 'undefined' || !window.localStorage) {
//       return defaultValue;
//     }
//     const raw = localStorage.getItem(key);
//     if (!raw || raw === 'undefined' || raw === 'null') return defaultValue;
//     const parsed = JSON.parse(raw);
//     return (parsed !== null && parsed !== undefined) ? parsed as T : defaultValue;
//   } catch (err) {
//     console.error(`Error reading ${key} from localStorage:`, err);
//     return defaultValue;
//   }
// }

// function setLocalItem<T>(key: string, value: T): void {
//   try {
//     if (typeof window === 'undefined' || !window.localStorage) {
//       return;
//     }
//     if (value === undefined) {
//       localStorage.removeItem(key);
//       return;
//     }
//     localStorage.setItem(key, JSON.stringify(value));
//   } catch (err) {
//     console.error(`Error writing ${key} to localStorage:`, err);
//   }
// }

// // -------------------------------------------------------------
// // USER PROFILE & AUTH
// // -------------------------------------------------------------

// export function getStoredUser(): UserAuthorProfile | null {
//   return getLocalItem<UserAuthorProfile | null>(STORAGE_KEYS.USER_PROFILE, null);
// }

// export function saveStoredUser(profile: UserAuthorProfile): void {
//   setLocalItem(STORAGE_KEYS.USER_PROFILE, profile);
// }

// export const getUserProfile = getStoredUser;
// export const saveUserProfile = saveStoredUser;

// export function clearAuthSession(): void {
//   setLocalItem(STORAGE_KEYS.AUTH_SESSION, false);
// }

// export function isAuthenticated(): boolean {
//   return getLocalItem<boolean>(STORAGE_KEYS.AUTH_SESSION, false);
// }

// export function setAuthenticated(isAuth: boolean): void {
//   setLocalItem(STORAGE_KEYS.AUTH_SESSION, isAuth);
// }

// export function isTutorialCompleted(): boolean {
//   return getLocalItem<boolean>(STORAGE_KEYS.TUTORIAL_COMPLETED, false);
// }

// export function setTutorialCompleted(completed: boolean): void {
//   setLocalItem(STORAGE_KEYS.TUTORIAL_COMPLETED, completed);
// }

// // -------------------------------------------------------------
// // BOOKS (EMPTY BY DEFAULT)
// // -------------------------------------------------------------

// export function getBooks(): Book[] {
//   return getLocalItem<Book[]>(STORAGE_KEYS.BOOKS, []);
// }

// export function saveBook(book: Book): void {
//   const books = getBooks();
//   const index = books.findIndex((b) => b.id === book.id);
//   if (index >= 0) {
//     books[index] = { ...book, updatedAt: Date.now() };
//   } else {
//     books.unshift({ ...book, createdAt: Date.now(), updatedAt: Date.now() });
//   }
//   setLocalItem(STORAGE_KEYS.BOOKS, books);
// }

// export function deleteBook(bookId: string): void {
//   const books = getBooks().filter((b) => b.id !== bookId);
//   setLocalItem(STORAGE_KEYS.BOOKS, books);

//   // Also remove chapters for this book
//   const chapters = getChapters().filter((c) => c.bookId !== bookId);
//   setLocalItem(STORAGE_KEYS.CHAPTERS, chapters);

//   // Also remove snapshots for this book
//   const snapshots = getSnapshots().filter((s) => s.bookId !== bookId);
//   setLocalItem(STORAGE_KEYS.CHAPTER_SNAPSHOTS, snapshots);
// }

// // -------------------------------------------------------------
// // CHAPTERS (EMPTY BY DEFAULT)
// // -------------------------------------------------------------

// export function getChapters(bookId?: string): Chapter[] {
//   const all = getLocalItem<Chapter[]>(STORAGE_KEYS.CHAPTERS, []);
//   if (bookId) {
//     return all
//       .filter((c) => c.bookId === bookId)
//       .sort((a, b) => a.order - b.order);
//   }
//   return all.sort((a, b) => a.order - b.order);
// }

// export function saveChapter(chapter: Chapter): void {
//   const chapters = getLocalItem<Chapter[]>(STORAGE_KEYS.CHAPTERS, []);
//   const index = chapters.findIndex((c) => c.id === chapter.id);

//   if (index >= 0) {
//     chapters[index] = { ...chapter, lastSavedAt: Date.now() };
//   } else {
//     chapters.push({ ...chapter, createdAt: Date.now(), lastSavedAt: Date.now() });
//   }

//   setLocalItem(STORAGE_KEYS.CHAPTERS, chapters);

//   // Recalculate book total word count
//   updateBookTotalWordCount(chapter.bookId);
// }

// export function deleteChapter(chapterId: string): void {
//   const chapters = getLocalItem<Chapter[]>(STORAGE_KEYS.CHAPTERS, []);
//   const target = chapters.find((c) => c.id === chapterId);
//   const filtered = chapters.filter((c) => c.id !== chapterId);
//   setLocalItem(STORAGE_KEYS.CHAPTERS, filtered);

//   if (target) {
//     updateBookTotalWordCount(target.bookId);
//   }
// }

// function updateBookTotalWordCount(bookId: string): void {
//   const bookChapters = getChapters(bookId);
//   const totalWords = bookChapters.reduce((acc, c) => acc + (c.wordCount || 0), 0);

//   const books = getBooks();
//   const index = books.findIndex((b) => b.id === bookId);
//   if (index >= 0) {
//     books[index].currentWordCount = totalWords;
//     books[index].updatedAt = Date.now();
//     setLocalItem(STORAGE_KEYS.BOOKS, books);
//   }
// }

// // -------------------------------------------------------------
// // CHAPTER EMERGENCY DRAFT SNAPSHOTS
// // -------------------------------------------------------------

// export function getSnapshots(chapterId?: string): ChapterSnapshot[] {
//   const all = getLocalItem<ChapterSnapshot[]>(STORAGE_KEYS.CHAPTER_SNAPSHOTS, []);
//   if (chapterId) {
//     return all
//       .filter((s) => s.chapterId === chapterId)
//       .sort((a, b) => b.timestamp - a.timestamp);
//   }
//   return all.sort((a, b) => b.timestamp - a.timestamp);
// }

// export function saveSnapshot(snapshot: ChapterSnapshot): void {
//   const snapshots = getSnapshots();
//   // Keep max 50 recent snapshots to avoid storage quota bloat
//   const updated = [snapshot, ...snapshots].slice(0, 50);
//   setLocalItem(STORAGE_KEYS.CHAPTER_SNAPSHOTS, updated);
// }

// // -------------------------------------------------------------
// // CHARACTER WIKI (EMPTY BY DEFAULT)
// // -------------------------------------------------------------

// export function getCharacters(): CharacterWiki[] {
//   return getLocalItem<CharacterWiki[]>(STORAGE_KEYS.CHARACTERS, []);
// }

// export function saveCharacter(character: CharacterWiki): void {
//   const characters = getCharacters();
//   const index = characters.findIndex((c) => c.id === character.id);
//   if (index >= 0) {
//     characters[index] = { ...character, updatedAt: Date.now() };
//   } else {
//     characters.unshift({
//       ...character,
//       createdAt: Date.now(),
//       updatedAt: Date.now(),
//     });
//   }
//   setLocalItem(STORAGE_KEYS.CHARACTERS, characters);
// }

// export function deleteCharacter(characterId: string): void {
//   const characters = getCharacters().filter((c) => c.id !== characterId);
//   // Also clean up any relationship referencing this character
//   const cleaned = characters.map((char) => ({
//     ...char,
//     relationships: char.relationships.filter(
//       (rel) => rel.targetCharacterId !== characterId
//     ),
//   }));
//   setLocalItem(STORAGE_KEYS.CHARACTERS, cleaned);
// }

// // -------------------------------------------------------------
// // QUICK NOTES (EMPTY BY DEFAULT)
// // -------------------------------------------------------------

// export function getQuickNotes(): QuickNote[] {
//   return getLocalItem<QuickNote[]>(STORAGE_KEYS.QUICK_NOTES, []);
// }

// export function saveQuickNote(note: QuickNote): void {
//   const notes = getQuickNotes();
//   const index = notes.findIndex((n) => n.id === note.id);
//   if (index >= 0) {
//     notes[index] = { ...note, updatedAt: Date.now() };
//   } else {
//     notes.unshift({ ...note, createdAt: Date.now(), updatedAt: Date.now() });
//   }
//   setLocalItem(STORAGE_KEYS.QUICK_NOTES, notes);
// }

// export function deleteQuickNote(noteId: string): void {
//   const notes = getQuickNotes().filter((n) => n.id !== noteId);
//   setLocalItem(STORAGE_KEYS.QUICK_NOTES, notes);
// }

// // -------------------------------------------------------------
// // CUSTOM GENRES
// // -------------------------------------------------------------

// export function getCustomGenres(): string[] {
//   return getLocalItem<string[]>(STORAGE_KEYS.CUSTOM_GENRES, []);
// }

// export function saveCustomGenre(genre: string): string[] {
//   const trimmed = genre.trim();
//   if (!trimmed) return getCustomGenres();
//   const current = getCustomGenres();
//   if (!current.includes(trimmed) && !DEFAULT_STANDARD_GENRES.includes(trimmed)) {
//     const updated = [...current, trimmed];
//     setLocalItem(STORAGE_KEYS.CUSTOM_GENRES, updated);
//     return updated;
//   }
//   return current;
// }

// // -------------------------------------------------------------
// // DATA BACKUP & EXPORT / IMPORT
// // -------------------------------------------------------------

// export interface AppBackupData {
//   version: string;
//   exportedAt: string;
//   profile: UserAuthorProfile | null;
//   books: Book[];
//   chapters: Chapter[];
//   characters: CharacterWiki[];
//   quickNotes: QuickNote[];
//   customGenres: string[];
// }

// export function exportAllDataAsJSON(): string {
//   const backup: AppBackupData = {
//     version: '1.0.0',
//     exportedAt: new Date().toISOString(),
//     profile: getStoredUser(),
//     books: getBooks(),
//     chapters: getChapters(),
//     characters: getCharacters(),
//     quickNotes: getQuickNotes(),
//     customGenres: getCustomGenres(),
//   };
//   return JSON.stringify(backup, null, 2);
// }

// export function importAllDataFromJSON(jsonString: string): boolean {
//   try {
//     const parsed = JSON.parse(jsonString) as Partial<AppBackupData>;
//     if (parsed.books && Array.isArray(parsed.books)) {
//       setLocalItem(STORAGE_KEYS.BOOKS, parsed.books);
//     }
//     if (parsed.chapters && Array.isArray(parsed.chapters)) {
//       setLocalItem(STORAGE_KEYS.CHAPTERS, parsed.chapters);
//     }
//     if (parsed.characters && Array.isArray(parsed.characters)) {
//       setLocalItem(STORAGE_KEYS.CHARACTERS, parsed.characters);
//     }
//     if (parsed.quickNotes && Array.isArray(parsed.quickNotes)) {
//       setLocalItem(STORAGE_KEYS.QUICK_NOTES, parsed.quickNotes);
//     }
//     if (parsed.customGenres && Array.isArray(parsed.customGenres)) {
//       setLocalItem(STORAGE_KEYS.CUSTOM_GENRES, parsed.customGenres);
//     }
//     if (parsed.profile) {
//       setLocalItem(STORAGE_KEYS.USER_PROFILE, parsed.profile);
//     }
//     return true;
//   } catch (err) {
//     console.error('Import backup failed:', err);
//     return false;
//   }
// }

// // -------------------------------------------------------------
// // TEXT & WORD COUNT UTILS
// // -------------------------------------------------------------

// export function countWords(text: string): number {
//   if (!text) return 0;
//   // Strip HTML tags if content is rich text or markdown-ish
//   const clean = text.replace(/<[^>]*>/g, ' ').trim();
//   if (!clean) return 0;
//   const matches = clean.match(/[\w\d\u00C0-\u024F\u1E00-\u1EFF'-]+/g);
//   return matches ? matches.length : 0;
// }

// export function countCharacters(text: string): number {
//   if (!text) return 0;
//   const clean = text.replace(/<[^>]*>/g, '');
//   return clean.length;
// }

// export function purgeTutorialDummyData(): void {
//   const books = getBooks().filter((b) => !(b as unknown as { isTutorialDummy?: boolean }).isTutorialDummy && !b.id.startsWith('tut-dummy'));
//   const chapters = getChapters().filter((c) => !(c as unknown as { isTutorialDummy?: boolean }).isTutorialDummy && !c.id.startsWith('tut-dummy'));
//   const characters = getCharacters().filter((c) => !(c as unknown as { isTutorialDummy?: boolean }).isTutorialDummy && !c.id.startsWith('tut-dummy'));
//   const notes = getQuickNotes().filter((n) => !(n as unknown as { isTutorialDummy?: boolean }).isTutorialDummy && !n.id.startsWith('tut-dummy'));

//   setLocalItem(STORAGE_KEYS.BOOKS, books);
//   setLocalItem(STORAGE_KEYS.CHAPTERS, chapters);
//   setLocalItem(STORAGE_KEYS.CHARACTERS, characters);
//   setLocalItem(STORAGE_KEYS.QUICK_NOTES, notes);
// }
