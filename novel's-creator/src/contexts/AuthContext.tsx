import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { User } from "../types/auth";

import {
  login as loginRequest,
  register as registerRequest,
  logout as logoutRequest,
  getMe,
} from "../services/auth.service";

interface RegisterData {
  email: string;
  password: string;
  authorName?: string;
  penName?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (
    data: LoginData
  ) => Promise<void>;

  register: (
    data: RegisterData
  ) => Promise<void>;

  logout: () => void;

  refreshUser: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined
  );

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  async function initializeAuth() {
    const token =
      localStorage.getItem(
        "auth_token"
      );

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const currentUser =
        await getMe();

      setUser(currentUser);
    } catch {
      localStorage.removeItem(
        "auth_token"
      );

      localStorage.removeItem(
        "auth_user"
      );

      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(data: LoginData) {
    const response = await loginRequest(data);
    
    // Simpan token & user ke Local Storage
    if (response.data.token) {
      localStorage.setItem("auth_token", response.data.token);
      localStorage.setItem("auth_user", JSON.stringify(response.data.user));
    }
    
    setUser(response.data.user);
  }

  async function register(data: RegisterData) {
    const response = await registerRequest(data);

    // Simpan token & user ke Local Storage
    if (response.data.token) {
      localStorage.setItem("auth_token", response.data.token);
      localStorage.setItem("auth_user", JSON.stringify(response.data.user));
    }

    setUser(response.data.user);
  }

  function logout() {
    logoutRequest();
    setUser(null);
  }

  async function refreshUser() {
    const currentUser =
      await getMe();

    setUser(currentUser);
  }

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth harus digunakan di dalam AuthProvider"
    );
  }

  return context;
}