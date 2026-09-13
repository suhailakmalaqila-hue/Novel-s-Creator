import type { Book, CreateBookInput, UpdateBookInput } from "../types/book";

const API_URL = "http://localhost:5000/api/books";

// Helper untuk mengambil Token dari Local Storage
const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export async function getBooks(): Promise<Book[]> {
  const token = localStorage.getItem("auth_token");

  // Jika user belum login / tidak ada token, kembalikan array kosong tanpa nembak API
  if (!token) {
    return [];
  }

  const response = await fetch(API_URL, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengambil daftar buku");
  }

  return result.data;
}

export async function createBook(data: CreateBookInput): Promise<Book> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal membuat buku");
  }

  return result.data;
}

export async function updateBook(bookId: string, data: UpdateBookInput): Promise<Book> {
  const response = await fetch(`${API_URL}/${bookId}`, {
    method: "PATCH", // <-- Ubah PUT menjadi PATCH di sini
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal mengupdate buku");
  }

  return result.data;
}

export async function deleteBook(bookId: string): Promise<void> {
  const response = await fetch(`${API_URL}/${bookId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Gagal menghapus buku");
  }
}