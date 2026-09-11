import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useBooks } from "../contexts/BookContext";
import type { Book } from "../types/book";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { books, loading, refreshBooks, addBook, editBook, removeBook } = useBooks();

  // State Form Tambah Buku
  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [targetWordCount, setTargetWordCount] = useState(50000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Edit Buku
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    refreshBooks();
  }, []);

  // 15. Handler Buat Buku Baru
  async function handleCreateBook(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await addBook({
        title,
        synopsis,
        targetWordCount: Number(targetWordCount),
        status: "draft",
      });
      setTitle("");
      setSynopsis("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal membuat buku");
    } finally {
      setIsSubmitting(false);
    }
  }

  // 16. Handler Edit Buku
  async function handleUpdateBook(bookId: string) {
    if (!editTitle.trim()) return;

    try {
      await editBook(bookId, { title: editTitle });
      setEditingBookId(null);
      setEditTitle("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal memperbarui buku");
    }
  }

  // 17. Handler Hapus Buku
  async function handleDeleteBook(bookId: string) {
    if (!confirm("Apakah kamu yakin ingin menghapus buku ini?")) return;

    try {
      await removeBook(bookId);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal menghapus buku");
    }
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
      {/* 18. Navbar / Header + Logout */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Dashboard Novel's Creator</h2>
        <div>
          <span>Halo, <strong>{user?.author_name || user?.email}</strong></span>
          <button onClick={logout} style={{ marginLeft: "15px", padding: "8px 12px", cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </header>

      <hr />

      {/* Form Tambah Buku (Poin 15) */}
      <section style={{ margin: "20px 0", padding: "15px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h3>Buat Novel Baru</h3>
        <form onSubmit={handleCreateBook} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            type="text"
            placeholder="Judul Novel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ padding: "8px" }}
          />
          <textarea
            placeholder="Sinopsis"
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            rows={3}
            style={{ padding: "8px" }}
          />
          <input
            type="number"
            placeholder="Target Kata (misal: 50000)"
            value={targetWordCount}
            onChange={(e) => setTargetWordCount(Number(e.target.value))}
            style={{ padding: "8px" }}
          />
          <button type="submit" disabled={isSubmitting} style={{ padding: "10px", cursor: "pointer" }}>
            {isSubmitting ? "Menyimpan..." : "+ Buat Buku"}
          </button>
        </form>
      </section>

      {/* Daftar Buku & Fitur Edit/Delete (Poin 16 & 17) */}
      <section>
        <h3>Daftar Novel Kamu</h3>
        {loading ? (
          <p>Memuat daftar buku...</p>
        ) : books.length === 0 ? (
          <p>Belum ada buku. Silakan buat buku baru di atas!</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {books.map((book: Book) => (
              <div key={book.id} style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  {editingBookId === book.id ? (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        style={{ padding: "5px" }}
                      />
                      <button onClick={() => handleUpdateBook(book.id)}>Simpan</button>
                      <button onClick={() => setEditingBookId(null)}>Batal</button>
                    </div>
                  ) : (
                    <h4>{book.title}</h4>
                  )}
                  <p style={{ color: "#666", margin: "5px 0" }}>{book.synopsis || "Tidak ada sinopsis"}</p>
                  <small>Target: {book.target_word_count} kata | Status: {book.status}</small>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => {
                      setEditingBookId(book.id);
                      setEditTitle(book.title);
                    }}
                    style={{ padding: "6px 10px", cursor: "pointer" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBook(book.id)}
                    style={{ padding: "6px 10px", backgroundColor: "#ff4d4d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}