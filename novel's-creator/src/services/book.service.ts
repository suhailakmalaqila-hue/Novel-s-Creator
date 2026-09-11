import {
  apiRequest,
} from "./api";

import type {
  Book,
  CreateBookInput,
  UpdateBookInput,
} from "../types/book";

interface BooksResponse {
  success: boolean;
  data: Book[];
}

interface BookResponse {
  success: boolean;
  data: Book;
}

export async function getBooks(): Promise<Book[]> {
  const response =
    await apiRequest<BooksResponse>(
      "/books"
    );

  return response.data;
}

export async function getBook(
  bookId: string
): Promise<Book> {
  const response =
    await apiRequest<BookResponse>(
      `/books/${bookId}`
    );

  return response.data;
}

export async function createBook(
  data: CreateBookInput
): Promise<Book> {
  const response =
    await apiRequest<BookResponse>(
      "/books",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

  return response.data;
}

export async function updateBook(
  bookId: string,
  data: UpdateBookInput
): Promise<Book> {
  const response =
    await apiRequest<BookResponse>(
      `/books/${bookId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );

  return response.data;
}

export async function deleteBook(
  bookId: string
): Promise<void> {
  await apiRequest(
    `/books/${bookId}`,
    {
      method: "DELETE",
    }
  );
}