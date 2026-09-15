import {
  apiRequest,
  setToken,
  clearToken,
} from "./api";

import type {
  AuthResponse,
  User,
} from "../types/auth";

export interface RegisterInput {
  email: string;
  password: string;
  authorName?: string;
  penName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function register(
  data: RegisterInput
): Promise<AuthResponse> {
  const response =
    await apiRequest<AuthResponse>(
      "/auth/register",
      {
        method: "POST",
        auth: false,
        body: JSON.stringify(data),
      }
    );

  setToken(response.data.token);

  localStorage.setItem(
    "auth_user",
    JSON.stringify(response.data.user)
  );

  return response;
}

export async function login(
  data: LoginInput
): Promise<AuthResponse> {
  const response =
    await apiRequest<AuthResponse>(
      "/auth/login",
      {
        method: "POST",
        auth: false,
        body: JSON.stringify(data),
      }
    );

  setToken(response.data.token);

  localStorage.setItem(
    "auth_user",
    JSON.stringify(response.data.user)
  );

  return response;
}

export function logout(): void {
  clearToken();

  localStorage.removeItem(
    "auth_user"
  );
}

export async function getMe(): Promise<User> {
  const response =
    await apiRequest<{
      success: boolean;
      data: User;
    }>("/users/me");

  localStorage.setItem(
    "auth_user",
    JSON.stringify(response.data)
  );

  return response.data;
}
