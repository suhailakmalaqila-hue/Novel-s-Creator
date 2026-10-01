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

interface ApiRequestOptions extends RequestInit {
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
    /*
     * 401 hanya digunakan untuk masalah autentikasi/session,
     * misalnya:
     * - token tidak valid
     * - token expired
     * - token tidak dapat diverifikasi
     * - endpoint protected dipanggil tanpa autentikasi
     *
     * Jika response 401, session lokal dibersihkan agar
     * aplikasi tidak terus menggunakan token yang sudah tidak valid.
     */
    if (response.status === 401) {
      clearToken();
      localStorage.removeItem("auth_user");
    }

    /*
     * Error 400, 403, 404, 409, 500, dan status lainnya
     * tidak menghapus token.
     *
     * Contohnya:
     * - 400: password saat ini salah
     * - 403: user tidak memiliki hak akses
     * - 404: resource tidak ditemukan
     * - 409: konflik data
     * - 500: kesalahan server
     */
    throw new Error(
      result?.message ||
        "Terjadi kesalahan pada server"
    );
  }

  return result as T;
}
