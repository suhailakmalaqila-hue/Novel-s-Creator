import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type {
  Book,
  CreateBookInput,
  UpdateBookInput,
} from "../types/book";

import {
  getBooks as getBooksRequest,
  createBook as createBookRequest,
  updateBook as updateBookRequest,
  deleteBook as deleteBookRequest,
} from "../services/book.service";

interface BookContextValue {
  books: Book[];
  loading: boolean;

  refreshBooks: () => Promise<void>;

  addBook: (
    data: CreateBookInput
  ) => Promise<Book>;

  editBook: (
    bookId: string,
    data: UpdateBookInput
  ) => Promise<Book>;

  removeBook: (
    bookId: string
  ) => Promise<void>;
}

const BookContext =
  createContext<BookContextValue | undefined>(
    undefined
  );

interface BookProviderProps {
  children: ReactNode;
}

export function BookProvider({
  children,
}: BookProviderProps) {
  const [books, setBooks] =
    useState<Book[]>([]);

  const [loading, setLoading] =
    useState(false);

  async function refreshBooks() {
    setLoading(true);

    try {
      const data =
        await getBooksRequest();

      setBooks(data);
    } finally {
      setLoading(false);
    }
  }

  async function addBook(
    data: CreateBookInput
  ) {
    const book =
      await createBookRequest(data);

    setBooks((current) => [
      book,
      ...current,
    ]);

    return book;
  }

  async function editBook(
    bookId: string,
    data: UpdateBookInput
  ) {
    const updated =
      await updateBookRequest(
        bookId,
        data
      );

    setBooks((current) =>
      current.map((book) =>
        book.id === bookId
          ? updated
          : book
      )
    );

    return updated;
  }

  async function removeBook(
    bookId: string
  ) {
    await deleteBookRequest(bookId);

    setBooks((current) =>
      current.filter(
        (book) =>
          book.id !== bookId
      )
    );
  }

  return (
    <BookContext.Provider
      value={{
        books,
        loading,
        refreshBooks,
        addBook,
        editBook,
        removeBook,
      }}
    >
      {children}
    </BookContext.Provider>
  );
}

export function useBooks() {
  const context =
    useContext(BookContext);

  if (!context) {
    throw new Error(
      "useBooks harus digunakan di dalam BookProvider"
    );
  }

  return context;
}
