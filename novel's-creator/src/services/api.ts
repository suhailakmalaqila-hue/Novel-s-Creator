const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const TOKEN_KEY = "auth_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

interface ApiRequestOptions
  extends RequestInit {
  auth?: boolean;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    auth = true,
    headers,
    ...fetchOptions
  } = options;

  const token = getToken();

  /* Kode lama (belum fix)
  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (auth && token) {
    requestHeaders.Authorization =
      `Bearer ${token}`;
  }
      */

  // KODE BARU (SUDAH FIX)
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (auth && token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }
    
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...fetchOptions,
      headers: requestHeaders,
    }
  );

  let result: any = null;

  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearToken();
      localStorage.removeItem(
        "auth_user"
      );
    }

    throw new Error(
      result?.message ||
        "Terjadi kesalahan pada server"
    );
  }

  return result as T;
}