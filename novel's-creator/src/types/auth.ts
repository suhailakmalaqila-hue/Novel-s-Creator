export type UserRole = "admin" | "user";

export interface User {
  id: string;
  email: string;
  role: UserRole;

  author_name: string | null;
  pen_name: string | null;

  bio?: string | null;
  avatar_url?: string | null;

  daily_word_goal?: number;
  today_word_count?: number;

  last_active_date?: string | null;

  theme?: string;
  sound_effects?: boolean;

  preferred_genre?: string | null;

  tutorial_completed?: boolean;

  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}