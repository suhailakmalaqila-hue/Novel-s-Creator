export type BookStatus =
  | "draft"
  | "ongoing"
  | "completed"
  | "hiatus";

export interface Genre {
  id: string;
  name: string;
}

export interface Book {
  id: string;
  user_id: string;

  title: string;
  synopsis: string | null;
  cover_url: string | null;

  target_word_count: number;
  current_word_count: number;

  status: BookStatus;

  genres?: Genre[];

  created_at: string;
  updated_at: string;
}

export interface CreateBookInput {
  title: string;
  synopsis?: string;
  coverUrl?: string;
  targetWordCount?: number;
  status?: BookStatus;
}

export interface UpdateBookInput {
  title?: string;
  synopsis?: string;
  coverUrl?: string;
  targetWordCount?: number;
  currentWordCount?: number;
  status?: BookStatus;
}