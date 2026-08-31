/**
 * Novel's Creator - Core Types and Data Models
 */

export type RoleTag = 'Protagonis' | 'Antagonis' | 'Side' | 'Mentor' | 'Rival' | 'Netral';
export type CharacterStatus = 'Hidup' | 'Mati' | 'Hilang' | 'Disegel' | 'Reinkarnasi' | 'Lainnya';
export type BookStatus = 'draft' | 'ongoing' | 'completed' | 'hiatus';
export type ChapterStatus = 'draft' | 'review' | 'published';
export type NoteCategory = 'Ide Spontan' | 'Dialog Draft' | 'Plot Hole' | 'Worldbuilding' | 'Lainnya';
export type SaveStatus = 'unsaved' | 'saving' | 'saved' | 'error';
export type AppView = 'splash' | 'auth' | 'workspace' | 'characters' | 'editor';

export interface UserAuthorProfile {
  id: string;
  username: string;
  email: string;
  authorName: string;
  penName: string;
  bio: string;
  avatarUrl: string; // Base64 or empty
  dailyWordGoal: number;
  todayWordCount: number;
  lastActiveDate: string; // YYYY-MM-DD
  theme: 'dark';
  soundEffects?: boolean;
  preferredGenre?: string;
  hasCompletedTutorial?: boolean;
  isAuthenticated?: boolean;
  createdAt: string;
}

export interface CustomAttribute {
  id: string;
  key: string;
  value: string;
}

export interface CharacterRelationship {
  id: string;
  targetCharacterId: string;
  relationType: string; // e.g. "Sahabat Masa Kecil", "Musuh Bebuyutan", "Murid", "Rival"
  description: string;
}

export interface CharacterWiki {
  id: string;
  fullName: string;
  alias: string;
  age: string;
  gender: string;
  roleTag: RoleTag;
  status: CharacterStatus;
  avatarUrl: string; // Base64 uploaded photo or empty
  physicalAppearance: string;
  personalityTraits: string;
  backstory: string;
  motivation: string;
  worldGoal: string;
  customAttributes: CustomAttribute[];
  relationships: CharacterRelationship[];
  bookIds: string[]; // Associated books
  createdAt: number;
  updatedAt: number;
}

export interface Chapter {
  id: string;
  bookId: string;
  chapterNumber: number;
  title: string;
  content: string;
  wordCount: number;
  characterCount: number;
  status: ChapterStatus;
  order: number;
  lastSavedAt: number;
  createdAt: number;
}

export interface ChapterSnapshot {
  id: string;
  chapterId: string;
  bookId: string;
  chapterTitle: string;
  content: string;
  wordCount: number;
  timestamp: number;
  reason?: string;
}

export interface Book {
  id: string;
  title: string;
  synopsis: string;
  coverUrl: string; // Base64 uploaded photo or empty
  genres: string[];
  targetWordCount: number;
  currentWordCount: number;
  status: BookStatus;
  createdAt: number;
  updatedAt: number;
}

export interface QuickNote {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  colorTag: string; // hex color for dark card accent
  isPinned: boolean;
  bookId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface TutorialStep {
  id: number;
  title: string;
  message: string;
  mascotMood: 'neutral' | 'happy' | 'thinking' | 'proud' | 'reading';
  highlightAction?: string;
}

export interface SearchResultItem {
  id: string;
  type: 'book' | 'chapter' | 'character' | 'note';
  title: string;
  subtitle: string;
  badge: string;
  metadata?: string;
  data: Book | Chapter | CharacterWiki | QuickNote;
}
