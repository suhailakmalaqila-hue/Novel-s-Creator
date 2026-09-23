import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AppView,
  Book,
  Chapter,
  CharacterWiki,
  QuickNote,
  UserAuthorProfile,
} from "./types";

import type { User } from "./types/auth";

import {
  AuthProvider,
  useAuth,
} from "./contexts/AuthContext";

import {
  BookProvider,
  useBooks,
} from "./contexts/BookContext";

import {
  ChapterProvider,
  useChapters,
} from "./contexts/ChapterContext";

import {
  CharacterProvider,
  useCharacters,
} from "./contexts/CharacterContext";

import {
  getQuickNotes,
  saveQuickNote,
  deleteQuickNote,
  getCustomGenres,
  saveCustomGenre,
  purgeTutorialDummyData,
} from "./lib/storage";

import {
  TUTORIAL_DUMMY_BOOKS,
  TUTORIAL_DUMMY_CHAPTERS,
  TUTORIAL_DUMMY_CHARACTERS,
  TUTORIAL_DUMMY_QUICK_NOTES,
  TUTORIAL_DUMMY_BOOK_ID,
  TUTORIAL_DUMMY_CHAPTER_1_ID,
} from "./lib/tutorialDummyData";

import {
  apiRequest,
} from "./services/api";

import {
  SplashScreen,
} from "./components/splash/SplashScreen";

import {
  UnifiedAuthCard,
} from "./components/auth/UnifiedAuthCard";

import {
  VisualNovelTutorial,
} from "./components/tutorial/VisualNovelTutorial";

import {
  ProfileSettingsModal,
} from "./components/profile/ProfileSettingsModal";

import {
  Navbar,
} from "./components/common/Navbar";

import {
  WorkspaceView,
} from "./components/workspace/WorkspaceView";

import {
  CharacterWikiView,
} from "./components/character/CharacterWikiView";

import {
  NovelEditorView,
} from "./components/editor/NovelEditorView";

import {
  QuickNotesDrawer,
} from "./components/notes/QuickNotesDrawer";

import {
  GlobalSearchModal,
} from "./components/search/GlobalSearchModal";

import {
  Users,
  UserPlus,
  Pencil,
  Trash2,
  ShieldCheck,
  UserRound,
  RefreshCw,
  X,
  LogOut,
  Mail,
  Lock,
  UserPen,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

/* =========================================================
 * ADMIN TYPES
 * ========================================================= */

type AdminUser = {
  id: string;
  email: string;
  role: "admin" | "user";
  author_name: string | null;
  pen_name: string | null;
  created_at?: string;
  updated_at?: string;
};

type AdminUserForm = {
  email: string;
  password: string;
  authorName: string;
  penName: string;
  role: "admin" | "user";
};

const EMPTY_ADMIN_USER_FORM: AdminUserForm = {
  email: "",
  password: "",
  authorName: "",
  penName: "",
  role: "user",
};

/* =========================================================
 * ADMIN DASHBOARD
 * =========================================================
 *
 * Frontend Stage 2:
 *
 * - GET    /api/admin/users
 * - POST   /api/admin/users
 * - PATCH  /api/admin/users/:userId
 * - DELETE /api/admin/users/:userId
 *
 * Backend tetap menjadi security boundary karena seluruh
 * endpoint /api/admin/* sudah dilindungi authMiddleware +
 * requireRole("admin").
 * ========================================================= */

interface AdminDashboardViewProps {
  currentUser: User;
  onLogout: () => void;
}

function AdminDashboardView({
  currentUser,
  onLogout,
}: AdminDashboardViewProps) {
  const [
    users,
    setUsers,
  ] = useState<AdminUser[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(null);

  const [
    isModalOpen,
    setIsModalOpen,
  ] = useState(false);

  const [
    editingUser,
    setEditingUser,
  ] = useState<AdminUser | null>(null);

  const [
    form,
    setForm,
  ] = useState<AdminUserForm>(
    EMPTY_ADMIN_USER_FORM
  );

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  /**
   * Load seluruh user.
   */
  const loadUsers = useCallback(
    async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const response =
          await apiRequest<{
            success: boolean;
            data: AdminUser[];
          }>("/admin/users");

        setUsers(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (error) {
        console.error(
          "Gagal mengambil data user admin:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data user."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  /**
   * Buka modal Create.
   */
  const handleOpenCreate = useCallback(
    () => {
      setEditingUser(null);

      setForm(
        EMPTY_ADMIN_USER_FORM
      );

      setErrorMessage(null);
      setSuccessMessage(null);
      setIsModalOpen(true);
    },
    []
  );

  /**
   * Buka modal Edit.
   */
  const handleOpenEdit = useCallback(
    (targetUser: AdminUser) => {
      setEditingUser(targetUser);

      setForm({
        email:
          targetUser.email ?? "",

        password: "",

        authorName:
          targetUser.author_name ?? "",

        penName:
          targetUser.pen_name ?? "",

        role:
          targetUser.role,
      });

      setErrorMessage(null);
      setSuccessMessage(null);
      setIsModalOpen(true);
    },
    []
  );

  /**
   * Tutup modal.
   */
  const handleCloseModal =
    useCallback(() => {
      if (submitting) {
        return;
      }

      setIsModalOpen(false);
      setEditingUser(null);

      setForm(
        EMPTY_ADMIN_USER_FORM
      );
    }, [submitting]);

  /**
   * Update form.
   */
  const handleFormChange = useCallback(
    (
      field: keyof AdminUserForm,
      value: string
    ) => {
      setForm((previous) => ({
        ...previous,
        [field]: value,
      }));
    },
    []
  );

  /**
   * Submit Create / Edit.
   */
  const handleSubmit =
    useCallback(
      async (
        event: React.FormEvent
      ) => {
        event.preventDefault();

        setErrorMessage(null);
        setSuccessMessage(null);

        const email =
          form.email.trim();

        const authorName =
          form.authorName.trim();

        const penName =
          form.penName.trim();

        if (!email) {
          setErrorMessage(
            "Email wajib diisi."
          );
          return;
        }

        if (
          !editingUser &&
          !form.password.trim()
        ) {
          setErrorMessage(
            "Password wajib diisi untuk user baru."
          );
          return;
        }

        setSubmitting(true);

        try {
          if (editingUser) {
            const payload: {
              email: string;
              authorName?: string;
              penName?: string;
              role: "admin" | "user";
              password?: string;
            } = {
              email,
              authorName:
                authorName || undefined,
              penName:
                penName || undefined,
              role: form.role,
            };

            /**
             * Password kosong ketika edit berarti
             * password lama dipertahankan.
             */
            if (
              form.password.trim()
            ) {
              payload.password =
                form.password.trim();
            }

            const response =
              await apiRequest<{
                success: boolean;
                message?: string;
                data: AdminUser;
              }>(
                `/admin/users/${editingUser.id}`,
                {
                  method: "PATCH",
                  body: JSON.stringify(
                    payload
                  ),
                }
              );

            /**
             * Update lokal jika response memiliki
             * user hasil update.
             */
            if (response.data) {
              setUsers(
                (previous) =>
                  previous.map(
                    (item) =>
                      item.id ===
                        editingUser.id
                        ? response.data
                        : item
                  )
              );
            } else {
              await loadUsers();
            }

            setSuccessMessage(
              response.message ||
              "User berhasil diperbarui."
            );
          } else {
            const response =
              await apiRequest<{
                success: boolean;
                message?: string;
                data: AdminUser;
              }>(
                "/admin/users",
                {
                  method: "POST",
                  body: JSON.stringify({
                    email,
                    password:
                      form.password.trim(),
                    authorName:
                      authorName ||
                      undefined,
                    penName:
                      penName ||
                      undefined,
                    role: form.role,
                  }),
                }
              );

            if (response.data) {
              setUsers(
                (previous) => [
                  response.data,
                  ...previous,
                ]
              );
            } else {
              await loadUsers();
            }

            setSuccessMessage(
              response.message ||
              "User berhasil dibuat."
            );
          }

          setIsModalOpen(false);
          setEditingUser(null);

          setForm(
            EMPTY_ADMIN_USER_FORM
          );

          /**
           * Refresh dari backend setelah mutation
           * agar source of truth tetap PostgreSQL.
           */
          await loadUsers();
        } catch (error) {
          console.error(
            "Gagal menyimpan user admin:",
            error
          );

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Gagal menyimpan user."
          );
        } finally {
          setSubmitting(false);
        }
      },
      [
        editingUser,
        form,
        loadUsers,
      ]
    );

  /**
   * Delete user.
   */
  const handleDelete =
    useCallback(
      async (
        targetUser: AdminUser
      ) => {
        /**
         * Self-delete dicegah di frontend.
         *
         * Backend tetap melakukan validasi
         * CANNOT_DELETE_SELF.
         */
        if (
          targetUser.id ===
          currentUser.id
        ) {
          setErrorMessage(
            "Admin tidak dapat menghapus akun sendiri."
          );

          return;
        }

        const confirmed =
          window.confirm(
            `Hapus user ${targetUser.email}? Tindakan ini tidak dapat dibatalkan.`
          );

        if (!confirmed) {
          return;
        }

        setErrorMessage(null);
        setSuccessMessage(null);
        setSubmitting(true);

        try {
          const response =
            await apiRequest<{
              success: boolean;
              message?: string;
            }>(
              `/admin/users/${targetUser.id}`,
              {
                method: "DELETE",
              }
            );

          setUsers(
            (previous) =>
              previous.filter(
                (item) =>
                  item.id !==
                  targetUser.id
              )
          );

          setSuccessMessage(
            response.message ||
            "User berhasil dihapus."
          );

          /**
           * Refresh dari backend untuk memastikan
           * tabel benar-benar sesuai database.
           */
          await loadUsers();
        } catch (error) {
          console.error(
            "Gagal menghapus user:",
            error
          );

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Gagal menghapus user."
          );
        } finally {
          setSubmitting(false);
        }
      },
      [
        currentUser.id,
        loadUsers,
      ]
    );

  /**
   * Search hanya di frontend.
   *
   * Tidak mengubah endpoint backend.
   */
  const filteredUsers =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      if (!query) {
        return users;
      }

      return users.filter(
        (item) => {
          const email =
            item.email
              ?.toLowerCase() ??
            "";

          const authorName =
            item.author_name
              ?.toLowerCase() ??
            "";

          const penName =
            item.pen_name
              ?.toLowerCase() ??
            "";

          const role =
            item.role
              ?.toLowerCase() ??
            "";

          return (
            email.includes(query) ||
            authorName.includes(
              query
            ) ||
            penName.includes(
              query
            ) ||
            role.includes(query)
          );
        }
      );
    }, [
      users,
      searchQuery,
    ]);

  const adminCount =
    users.filter(
      (item) =>
        item.role === "admin"
    ).length;

  const userCount =
    users.filter(
      (item) =>
        item.role === "user"
    ).length;

  const formatDate =
    (value?: string) => {
      if (!value) {
        return "-";
      }

      const date =
        new Date(value);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return value;
      }

      return date.toLocaleDateString(
        "id-ID",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    };

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] flex flex-col">
      {/* =====================================================
          ADMIN HEADER
          ===================================================== */}

      <header className="border-b border-[#2A2A3C] bg-[#1E1E2E] shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
              </div>

              <div className="min-w-0">
                <h1 className="font-editorial text-lg sm:text-xl font-bold text-[#FAF7EE] truncate">
                  Novel's Creator
                </h1>

                <p className="text-[10px] sm:text-xs uppercase tracking-[0.16em] text-[#8A8A9E] truncate">
                  Admin Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#151522] border border-[#2A2A3C]">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />

                <span className="text-xs text-[#C8C8DC]">
                  {currentUser.email}
                </span>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-[#3A3A50] bg-[#171724] hover:bg-[#242438] hover:border-[#D4AF37]/40 text-xs text-[#D8D8E8] transition-colors"
              >
                <LogOut className="w-4 h-4" />

                <span className="hidden sm:inline">
                  Keluar
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          ADMIN CONTENT
          ===================================================== */}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page heading */}

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-2">
              System Administration
            </p>

            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#FAF7EE]">
              User Management
            </h2>

            <p className="text-sm text-[#8A8A9E] mt-2 max-w-2xl">
              Kelola akun pengguna Novel's Creator,
              role, dan akses akun dari satu tempat.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSuccessMessage(null);
                setErrorMessage(null);
                void loadUsers();
              }}
              disabled={
                loading ||
                submitting
              }
              className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-[#303046] bg-[#171724] hover:bg-[#222234] hover:border-[#D4AF37]/40 disabled:opacity-50 disabled:cursor-not-allowed text-xs text-[#D8D8E8] transition-colors"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading
                    ? "animate-spin"
                    : ""
                  }`}
              />

              <span>
                Refresh
              </span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreate}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E2BE4B] disabled:opacity-50 disabled:cursor-not-allowed text-[#121212] text-xs font-bold transition-colors"
            >
              <UserPlus className="w-4 h-4" />

              <span>
                Tambah User
              </span>
            </button>
          </div>
        </div>

        {/* ===================================================
            SUMMARY
            =================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl border border-[#2A2A3C] bg-[#1E1E2E] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#85859A]">
                  Total User
                </p>

                <p className="text-2xl font-bold text-[#FAF7EE] mt-1">
                  {users.length}
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#2A2A3C] bg-[#1E1E2E] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#85859A]">
                  Admin
                </p>

                <p className="text-2xl font-bold text-[#FAF7EE] mt-1">
                  {adminCount}
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#2A2A3C] bg-[#1E1E2E] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#85859A]">
                  Writer User
                </p>

                <p className="text-2xl font-bold text-[#FAF7EE] mt-1">
                  {userCount}
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-[#171724] border border-[#303046] flex items-center justify-center">
                <UserRound className="w-5 h-5 text-[#8A8A9E]" />
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            ALERTS
            =================================================== */}

        {errorMessage && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-900/70 bg-red-950/40 px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />

            <div className="text-xs text-red-300 flex-1">
              {errorMessage}
            </div>

            <button
              type="button"
              onClick={() =>
                setErrorMessage(null)
              }
              className="text-red-400 hover:text-red-200"
              aria-label="Tutup pesan error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-900/70 bg-emerald-950/40 px-4 py-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />

            <div className="text-xs text-emerald-300 flex-1">
              {successMessage}
            </div>

            <button
              type="button"
              onClick={() =>
                setSuccessMessage(null)
              }
              className="text-emerald-400 hover:text-emerald-200"
              aria-label="Tutup pesan sukses"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ===================================================
            USER TABLE CARD
            =================================================== */}

        <section className="rounded-2xl border border-[#2A2A3C] bg-[#1E1E2E] overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-[#2A2A3C] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#FAF7EE]">
                Daftar Pengguna
              </h3>

              <p className="text-[11px] text-[#77778C] mt-1">
                {filteredUsers.length} user ditampilkan
              </p>
            </div>

            <div className="w-full sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Cari email, nama, role..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#151522] border border-[#303046] focus:border-[#D4AF37]/60 outline-none text-xs text-[#E0E0E0] placeholder-[#606075]"
              />
            </div>
          </div>

          {loading ? (
            <div className="min-h-[240px] flex items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-[#8A8A9E]">
                <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />

                <span>
                  Memuat data user...
                </span>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="min-h-[240px] flex flex-col items-center justify-center text-center px-6">
              <Users className="w-10 h-10 text-[#45455A] mb-3" />

              <p className="text-sm text-[#C8C8DC]">
                Tidak ada user ditemukan.
              </p>

              <p className="text-xs text-[#6E6E82] mt-1">
                Coba ubah kata pencarian atau
                tambahkan user baru.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="border-b border-[#2A2A3C] bg-[#191925]">
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-[0.14em] text-[#77778C] font-bold">
                      User
                    </th>

                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-[0.14em] text-[#77778C] font-bold">
                      Nama Penulis
                    </th>

                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-[0.14em] text-[#77778C] font-bold">
                      Role
                    </th>

                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-[0.14em] text-[#77778C] font-bold">
                      Dibuat
                    </th>

                    <th className="text-right px-5 py-3 text-[10px] uppercase tracking-[0.14em] text-[#77778C] font-bold">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map(
                    (item) => {
                      const isCurrentUser =
                        item.id ===
                        currentUser.id;

                      return (
                        <tr
                          key={item.id}
                          className="border-b border-[#242437] last:border-b-0 hover:bg-[#222234]/50 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#171724] border border-[#34344A] flex items-center justify-center shrink-0">
                                {item.role ===
                                  "admin" ? (
                                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                                ) : (
                                  <UserRound className="w-4 h-4 text-[#8A8A9E]" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-medium text-[#E0E0E0] truncate">
                                    {item.email}
                                  </p>

                                  {isCurrentUser && (
                                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 shrink-0">
                                      Anda
                                    </span>
                                  )}
                                </div>

                                <p className="text-[10px] text-[#626278] mt-0.5">
                                  ID:{" "}
                                  {item.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div>
                              <p className="text-xs text-[#C8C8DC]">
                                {item.author_name ||
                                  "-"}
                              </p>

                              <p className="text-[10px] text-[#77778C] mt-0.5">
                                {item.pen_name ||
                                  "-"}
                              </p>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            {item.role ===
                              "admin" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[10px] font-semibold text-[#D4AF37]">
                                <ShieldCheck className="w-3 h-3" />
                                Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#171724] border border-[#303046] text-[10px] font-semibold text-[#A2A2B6]">
                                <UserRound className="w-3 h-3" />
                                User
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-xs text-[#8A8A9E]">
                            {formatDate(
                              item.created_at
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenEdit(
                                    item
                                  )
                                }
                                disabled={
                                  submitting
                                }
                                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#303046] bg-[#171724] hover:bg-[#25253A] hover:border-[#D4AF37]/40 text-[#BDBDCE] hover:text-[#FAF7EE] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Edit user"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void handleDelete(
                                    item
                                  )
                                }
                                disabled={
                                  submitting ||
                                  isCurrentUser
                                }
                                className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#3A3038] bg-[#21171C] hover:bg-red-950/60 hover:border-red-800 text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                title={
                                  isCurrentUser
                                    ? "Tidak dapat menghapus akun sendiri"
                                    : "Hapus user"
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="h-10 bg-[#1E1E2E] border-t border-[#2A2A3C] flex items-center justify-between px-4 sm:px-8 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[#D4AF37]">
            Admin: Sistem Aktif
          </span>

          <span className="hidden sm:inline text-white/20">
            •
          </span>

          <span className="hidden sm:inline">
            Users: {users.length}
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span className="hidden sm:inline text-white/40">
            REST API & PostgreSQL
          </span>

          <span className="hidden sm:inline text-white/20">
            •
          </span>

          <span className="text-[#D4AF37]/80">
            V 1.0.0 Stable
          </span>
        </div>
      </footer>

      {/* =====================================================
          CREATE / EDIT MODAL
          ===================================================== */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1E1E2E] border border-[#303046] rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal header */}

            <div className="px-5 py-4 border-b border-[#2A2A3C] flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#FAF7EE]">
                  {editingUser
                    ? "Edit User"
                    : "Tambah User"}
                </h3>

                <p className="text-[11px] text-[#77778C] mt-1">
                  {editingUser
                    ? "Perbarui informasi dan role user."
                    : "Buat akun user dari panel admin."}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleCloseModal
                }
                disabled={submitting}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8A8A9E] hover:text-[#FAF7EE] hover:bg-[#29293B] disabled:opacity-50"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal form */}

            <form
              onSubmit={
                handleSubmit
              }
              className="p-5 space-y-4"
            >
              {/* Email */}

              <div>
                <label className="block text-xs font-medium text-[#C8C8DC] mb-1.5">
                  Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66667B]" />

                  <input
                    type="email"
                    value={
                      form.email
                    }
                    onChange={(
                      event
                    ) =>
                      handleFormChange(
                        "email",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="user@novel.id"
                    disabled={
                      submitting
                    }
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#151522] border border-[#303046] focus:border-[#D4AF37]/60 outline-none text-xs sm:text-sm text-[#E0E0E0] placeholder-[#606075] disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password */}

              <div>
                <label className="block text-xs font-medium text-[#C8C8DC] mb-1.5">
                  Password
                  {editingUser && (
                    <span className="text-[#68687D] font-normal ml-1">
                      (kosongkan jika tidak diubah)
                    </span>
                  )}
                </label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66667B]" />

                  <input
                    type="password"
                    value={
                      form.password
                    }
                    onChange={(
                      event
                    ) =>
                      handleFormChange(
                        "password",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="••••••••"
                    disabled={
                      submitting
                    }
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#151522] border border-[#303046] focus:border-[#D4AF37]/60 outline-none text-xs sm:text-sm text-[#E0E0E0] placeholder-[#606075] disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Author / Pen name */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#C8C8DC] mb-1.5">
                    Nama Penulis
                  </label>

                  <div className="relative">
                    <UserPen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66667B]" />

                    <input
                      type="text"
                      value={
                        form.authorName
                      }
                      onChange={(
                        event
                      ) =>
                        handleFormChange(
                          "authorName",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Nama Penulis"
                      disabled={
                        submitting
                      }
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#151522] border border-[#303046] focus:border-[#D4AF37]/60 outline-none text-xs sm:text-sm text-[#E0E0E0] placeholder-[#606075] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#C8C8DC] mb-1.5">
                    Nama Pena
                  </label>

                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66667B]" />

                    <input
                      type="text"
                      value={
                        form.penName
                      }
                      onChange={(
                        event
                      ) =>
                        handleFormChange(
                          "penName",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Nama Pena"
                      disabled={
                        submitting
                      }
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#151522] border border-[#303046] focus:border-[#D4AF37]/60 outline-none text-xs sm:text-sm text-[#E0E0E0] placeholder-[#606075] disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Role */}

              <div>
                <label className="block text-xs font-medium text-[#C8C8DC] mb-1.5">
                  Role
                </label>

                <select
                  value={
                    form.role
                  }
                  onChange={(
                    event
                  ) =>
                    handleFormChange(
                      "role",
                      event
                        .target
                        .value as
                      | "admin"
                      | "user"
                    )
                  }
                  disabled={
                    submitting ||
                    (
                      !!editingUser &&
                      editingUser.id ===
                      currentUser.id
                    )
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-[#151522] border border-[#303046] focus:border-[#D4AF37]/60 outline-none text-xs sm:text-sm text-[#E0E0E0] disabled:opacity-50"
                >
                  <option value="user">
                    User / Writer
                  </option>

                  <option value="admin">
                    Admin
                  </option>
                </select>

                {editingUser &&
                  editingUser.id ===
                  currentUser.id && (
                    <p className="text-[10px] text-[#77778C] mt-1.5">
                      Role akun admin yang sedang
                      digunakan tidak dapat
                      diturunkan melalui UI.
                    </p>
                  )}
              </div>

              {/* Form actions */}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={
                    handleCloseModal
                  }
                  disabled={
                    submitting
                  }
                  className="px-4 py-2.5 rounded-xl border border-[#303046] bg-[#171724] hover:bg-[#25253A] text-xs text-[#C8C8DC] disabled:opacity-50 transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E2BE4B] disabled:opacity-50 disabled:cursor-not-allowed text-[#121212] text-xs font-bold transition-colors"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />

                      <span>
                        Menyimpan...
                      </span>
                    </>
                  ) : (
                    <>
                      {editingUser ? (
                        <Pencil className="w-4 h-4" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}

                      <span>
                        {editingUser
                          ? "Simpan Perubahan"
                          : "Buat User"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
 * MAIN APP CONTENT
 * ========================================================= */

function MainAppContent() {
  const {
    user,
    isAuthenticated,
    logout,
    refreshUser,
  } = useAuth();

  const {
    books: contextBooks,
    addBook,
    editBook,
    removeBook,
    refreshBooks,
  } = useBooks();

  const {
    chapters,
    chaptersByBook,
    loadingByBook,
    loadedBooks,
    refreshChapters,
    addChapter,
    editChapter,
    removeChapter,
    clearChapters,
    clearAllChapters,
  } = useChapters();

  const {
    characters,
    refreshCharacters,
    addCharacter,
    editCharacter,
    removeCharacter,
    addRelationship,
    removeRelationship,
    addCustomAttribute,
    removeCustomAttribute,
  } = useCharacters();

  const [
    appStage,
    setAppStage,
  ] = useState<
    "splash" | "auth" | "app"
  >("splash");

  const [
    currentView,
    setCurrentView,
  ] = useState<AppView>(
    "workspace"
  );

  const [
    quickNotes,
    setQuickNotes,
  ] = useState<QuickNote[]>(
    []
  );

  const [
    customGenres,
    setCustomGenres,
  ] = useState<string[]>(
    []
  );

  const [
    targetBookId,
    setTargetBookId,
  ] = useState<string | null>(
    null
  );

  const [
    targetChapterId,
    setTargetChapterId,
  ] = useState<string | null>(
    null
  );

  const [
    isTutorialOpen,
    setIsTutorialOpen,
  ] = useState(false);

  const [
    isProfileSettingsOpen,
    setIsProfileSettingsOpen,
  ] = useState(false);

  const [
    isSearchOpen,
    setIsSearchOpen,
  ] = useState(false);

  const [
    isQuickNotesOpen,
    setIsQuickNotesOpen,
  ] = useState(false);

  /**
   * Normalisasi data Book dari API.
   *
   * currentWordCount HARUS berasal dari:
   *
   * books.current_word_count
   *
   * yang sudah disinkronkan oleh backend
   * berdasarkan SUM(chapters.word_count).
   */
  const books: Book[] =
    useMemo(
      () =>
        (contextBooks || []).map(
          (b: any) => ({
            ...b,

            targetWordCount:
              Number(
                b.targetWordCount ??
                b.target_word_count ??
                50000
              ),

            currentWordCount:
              Number(
                b.currentWordCount ??
                b.current_word_count ??
                0
              ),

            coverUrl:
              b.coverUrl ??
              b.cover_url ??
              "",

            genres: Array.isArray(b.genres)
              ? b.genres
                .map((genre: any) =>
                  typeof genre === "string"
                    ? genre
                    : genre?.name
                )
                .filter(Boolean)
              : b.genre
                ? [b.genre]
                : [],

            chapters:
              b.chapters || [],
          })
        ),
      [contextBooks]
    );

  const refreshLocalData =
    useCallback(() => {
      setCustomGenres(
        getCustomGenres()
      );
    }, []);

  const refreshQuickNotes =
    useCallback(() => {
      if (!isAuthenticated) {
        setQuickNotes([]);
        return;
      }

      setQuickNotes(getQuickNotes());
    }, [isAuthenticated]);

  useEffect(() => {
    refreshQuickNotes();
  }, [refreshQuickNotes]);

  /**
   * Load character data.
   */
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void refreshCharacters();
  }, [
    isAuthenticated,
    refreshCharacters,
  ]);

  /**
   * =========================================================
   * LOAD SEMUA CHAPTER SEMUA BOOK
   * =========================================================
   */
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (
      contextBooks.length === 0
    ) {
      return;
    }

    const booksToLoad =
      contextBooks.filter(
        (book) =>
          !loadedBooks[book.id] &&
          !loadingByBook[book.id]
      );

    if (
      booksToLoad.length === 0
    ) {
      return;
    }

    void Promise.all(
      booksToLoad.map(
        (book) =>
          refreshChapters(
            book.id
          )
      )
    );
  }, [
    isAuthenticated,
    contextBooks,
    loadedBooks,
    loadingByBook,
    refreshChapters,
  ]);

  /**
   * Setelah login.
   *
   * Tidak perlu memaksa currentView ke workspace.
   *
   * User admin akan otomatis dirender sebagai
   * AdminDashboardView berdasarkan role pada
   * AuthContext.
   *
   * User biasa tetap masuk Workspace.
   */
  const handleAuthSuccess =
    useCallback(() => {
      setAppStage("app");

      void refreshBooks();
    }, [refreshBooks]);

  /**
   * Splash selesai.
   */
  const handleSplashFinish =
    useCallback(() => {
      if (isAuthenticated) {
        setAppStage("app");
      } else {
        setAppStage("auth");
      }
    }, [isAuthenticated]);

  /**
   * Tutorial close.
   */
  const handleCloseTutorial =
    useCallback(() => {
      setIsTutorialOpen(false);

      purgeTutorialDummyData();

      if (
        targetBookId &&
        (
          targetBookId.startsWith(
            "tut-dummy"
          ) ||
          targetBookId ===
          TUTORIAL_DUMMY_BOOK_ID
        )
      ) {
        setTargetBookId(null);
      }

      if (
        targetChapterId &&
        (
          targetChapterId.startsWith(
            "tut-dummy"
          ) ||
          targetChapterId ===
          TUTORIAL_DUMMY_CHAPTER_1_ID
        )
      ) {
        setTargetChapterId(null);
      }

      refreshLocalData();
    }, [
      targetBookId,
      targetChapterId,
      refreshLocalData,
    ]);

  const handleTutorialComplete =
    useCallback(() => {
      handleCloseTutorial();
    }, [
      handleCloseTutorial,
    ]);

  /**
   * Logout.
   */
  const handleLogout =
    useCallback(() => {
      logout();

      clearAllChapters();
      setQuickNotes([]);

      setTargetBookId(null);
      setTargetChapterId(null);

      setIsTutorialOpen(false);
      setIsProfileSettingsOpen(
        false
      );
      setIsSearchOpen(false);
      setIsQuickNotesOpen(false);

      setCurrentView(
        "workspace"
      );

      setAppStage("auth");
    }, [
      logout,
      clearAllChapters,
    ]);

  /**
   * Keyboard shortcuts.
   */
  useEffect(() => {
    const handleKeyDown = (
      e: KeyboardEvent
    ) => {
      if (
        (e.ctrlKey ||
          e.metaKey) &&
        e.key.toLowerCase() ===
        "k"
      ) {
        e.preventDefault();

        setIsSearchOpen(
          (prev) => !prev
        );
      }

      if (
        (e.ctrlKey ||
          e.metaKey) &&
        e.key.toLowerCase() ===
        "m"
      ) {
        e.preventDefault();

        setIsQuickNotesOpen(
          (prev) => !prev
        );
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  /**
   * Sinkronisasi genre Book melalui endpoint genre yang
   * memang tersedia pada branch repair/fix.
   *
   * BookContext saat ini belum menerima field genres pada
   * CreateBookInput / UpdateBookInput, sehingga relasi
   * book_genres dikelola di App setelah book tersimpan.
   */
  const syncBookGenres = useCallback(
    async (
      bookId: string,
      genreNames: string[],
      currentGenres: any[] = []
    ) => {
      const normalizedNames = Array.from(
        new Set(
          (genreNames || [])
            .map((name) => String(name).trim())
            .filter(Boolean)
        )
      );

      const genreResponse =
        await apiRequest<{
          success: boolean;
          data: Array<{ id: string; name: string }>;
        }>("/genres");

      const genreMap = new Map<string, string>();

      for (const genre of genreResponse.data || []) {
        genreMap.set(genre.name.trim().toLowerCase(), genre.id);
      }

      const desiredGenreIds: string[] = [];

      for (const name of normalizedNames) {
        const key = name.toLowerCase();
        let genreId = genreMap.get(key);

        if (!genreId) {
          const created =
            await apiRequest<{
              success: boolean;
              data: { id: string; name: string };
            }>("/genres", {
              method: "POST",
              body: JSON.stringify({ name }),
            });

          genreId = created.data.id;
          genreMap.set(key, genreId);
        }

        desiredGenreIds.push(genreId);
      }

      const currentGenreIds = (currentGenres || [])
        .map((genre) => genre?.id)
        .filter(Boolean) as string[];

      for (const genreId of currentGenreIds) {
        if (!desiredGenreIds.includes(genreId)) {
          await apiRequest(
            `/genres/books/${encodeURIComponent(bookId)}/${encodeURIComponent(genreId)}`,
            { method: "DELETE" }
          );
        }
      }

      for (const genreId of desiredGenreIds) {
        if (!currentGenreIds.includes(genreId)) {
          await apiRequest(
            `/genres/books/${encodeURIComponent(bookId)}/${encodeURIComponent(genreId)}`,
            {
              method: "POST",
              body: JSON.stringify({}),
            }
          );
        }
      }
    },
    []
  );

  /**
   * Save Book.
   */
  const handleSaveBook =
    useCallback(
      async (book: Book) => {
        const targetWords = Number(
          book.targetWordCount ??
          (book as any).target_word_count ??
          50000
        );

        const coverUrl =
          (book as any).coverUrl ??
          (book as any).cover_url ??
          "";

        if (!book.id) {
          const created = await addBook({
            title: book.title,
            synopsis: book.synopsis,
            coverUrl,
            targetWordCount: targetWords,
            status: book.status || "draft",
          });

          await syncBookGenres(
            created.id,
            book.genres ?? [],
            []
          );

          await refreshBooks();
          return;
        }

        const existingBook =
          contextBooks.find(
            (item) => item.id === book.id
          );

        await editBook(book.id, {
          title: book.title,
          synopsis: book.synopsis,
          coverUrl,
          targetWordCount: targetWords,
          status: book.status,
        });

        await syncBookGenres(
          book.id,
          book.genres ?? [],
          existingBook?.genres ?? []
        );

        await refreshBooks();
      },
      [
        addBook,
        editBook,
        contextBooks,
        refreshBooks,
        syncBookGenres,
      ]
    );

  /**
   * Delete Book.
   */
  const handleDeleteBook =
    useCallback(
      async (bookId: string) => {
        if (!bookId) {
          return;
        }

        try {
          await removeBook(
            bookId
          );

          clearChapters(
            bookId
          );

          if (
            targetBookId ===
            bookId
          ) {
            setTargetBookId(null);
            setTargetChapterId(
              null
            );
          }
        } catch (error) {
          console.error(
            "Gagal menghapus book:",
            error
          );

          throw error;
        }
      },
      [
        removeBook,
        clearChapters,
        targetBookId,
      ]
    );

  /**
   * =========================================================
   * SAVE CHAPTER
   * =========================================================
   */
  const handleSaveChapter =
    useCallback(
      async (
        chapter: Chapter
      ) => {
        if (!chapter.bookId) {
          return;
        }

        const bookId =
          chapter.bookId;

        try {
          const isNewChapter =
            !chapter.id ||
            chapter.id.startsWith(
              "chap_"
            ) ||
            chapter.id.startsWith(
              "tut-dummy"
            );

          if (
            isNewChapter
          ) {
            await addChapter(
              bookId,
              {
                chapterNumber:
                  chapter.chapterNumber,

                title:
                  chapter.title,

                content:
                  chapter.content,

                status:
                  chapter.status,

                sortOrder:
                  chapter.order,
              }
            );
          } else {
            await editChapter(
              bookId,
              chapter.id,
              {
                chapterNumber:
                  chapter.chapterNumber,

                title:
                  chapter.title,

                content:
                  chapter.content,

                status:
                  chapter.status,

                sortOrder:
                  chapter.order,
              }
            );
          }

          /**
           * Backend sudah memperbarui:
           *
           * books.current_word_count
           *
           * berdasarkan SUM(chapters.word_count).
           */
          await refreshBooks();

          /**
           * Sinkronkan cache chapter.
           */
          await refreshChapters(
            bookId
          );
        } catch (error) {
          console.error(
            "Gagal menyimpan chapter:",
            error
          );

          throw error;
        }
      },
      [
        addChapter,
        editChapter,
        refreshBooks,
        refreshChapters,
      ]
    );

  /**
   * Delete Chapter.
   */
  const handleDeleteChapter =
    useCallback(
      async (
        chapterId: string
      ) => {
        if (
          !targetBookId ||
          !chapterId
        ) {
          return;
        }

        const bookChapters =
          chaptersByBook[
          targetBookId
          ] ?? [];

        const chapter =
          bookChapters.find(
            (item) =>
              item.id ===
              chapterId
          );

        if (!chapter) {
          return;
        }

        try {
          await removeChapter(
            targetBookId,
            chapterId
          );

          await refreshBooks();

          await refreshChapters(
            targetBookId
          );

          if (
            targetChapterId ===
            chapterId
          ) {
            setTargetChapterId(
              null
            );
          }
        } catch (error) {
          console.error(
            "Gagal menghapus chapter:",
            error
          );

          throw error;
        }
      },
      [
        targetBookId,
        targetChapterId,
        chaptersByBook,
        removeChapter,
        refreshBooks,
        refreshChapters,
      ]
    );

  /**
   * Save Character.
   */
  const handleSaveCharacter =
    useCallback(
      async (character: CharacterWiki) => {
        try {
          const payload = {
            fullName: character.fullName,
            alias: character.alias,
            age: character.age,
            gender: character.gender,
            roleTag: character.roleTag,
            status: character.status,
            avatarUrl: character.avatarUrl,
            physicalAppearance: character.physicalAppearance,
            personalityTraits: character.personalityTraits,
            backstory: character.backstory,
            motivation: character.motivation,
            worldGoal: character.worldGoal,
            bookIds: character.bookIds,
          };

          const isPersistedCharacter =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
              character.id
            );

          const previousCharacter =
            isPersistedCharacter
              ? characters.find(
                (item) => item.id === character.id
              )
              : undefined;

          const savedCharacter =
            isPersistedCharacter
              ? await editCharacter(
                character.id,
                payload
              )
              : await addCharacter(payload);

          // Backend branch repair/fix memiliki endpoint terpisah
          // untuk custom attributes dan relationships.
          // Sinkronkan nested data setelah karakter utama tersimpan.
          if (previousCharacter) {
            for (const attr of previousCharacter.customAttributes || []) {
              if (attr.id) {
                await removeCustomAttribute(
                  savedCharacter.id,
                  attr.id
                );
              }
            }

            for (const rel of previousCharacter.relationships || []) {
              if (rel.id) {
                await removeRelationship(
                  savedCharacter.id,
                  rel.id
                );
              }
            }
          }

          for (const attr of character.customAttributes || []) {
            const key = attr.key.trim();
            const value = attr.value.trim();

            if (!key && !value) {
              continue;
            }

            await addCustomAttribute(
              savedCharacter.id,
              { key, value }
            );
          }

          for (const rel of character.relationships || []) {
            if (!rel.targetCharacterId || rel.targetCharacterId === savedCharacter.id) {
              continue;
            }

            await addRelationship(
              savedCharacter.id,
              {
                targetCharacterId: rel.targetCharacterId,
                relationType: rel.relationType.trim(),
                description: rel.description?.trim() || "",
              }
            );
          }

          await refreshCharacters();
        } catch (error) {
          console.error(
            "Gagal menyimpan character:",
            error
          );

          throw error;
        }
      },
      [
        characters,
        editCharacter,
        addCharacter,
        removeCustomAttribute,
        removeRelationship,
        addCustomAttribute,
        addRelationship,
        refreshCharacters,
      ]
    );

  /**
   * Delete Character.
   */
  const handleDeleteCharacter =
    useCallback(
      async (
        characterId: string
      ) => {
        try {
          await removeCharacter(
            characterId
          );
        } catch (error) {
          console.error(
            "Gagal menghapus character:",
            error
          );

          throw error;
        }
      },
      [removeCharacter]
    );

  /**
   * Save Quick Note.
   */
  const handleSaveQuickNote =
    useCallback((note: QuickNote) => {
      saveQuickNote(note);
      setQuickNotes(getQuickNotes());
    }, []);

  /**
   * Delete Quick Note.
   */
  const handleDeleteQuickNote =
    useCallback((noteId: string) => {
      deleteQuickNote(noteId);
      setQuickNotes(getQuickNotes());
    }, []);

  /**
   * Add custom genre.
   */
  const handleAddCustomGenre =
    useCallback(
      (genre: string) => {
        saveCustomGenre(
          genre
        );

        setCustomGenres(
          getCustomGenres()
        );
      },
      []
    );

  /**
   * Open Editor.
   */
  const handleOpenEditor =
    useCallback(
      (
        bookId: string,
        chapterId?: string
      ) => {
        const bookExists =
          books.some(
            (book) =>
              book.id ===
              bookId
          );

        const dummyBookExists =
          isTutorialOpen &&
          displayTutorialBookIds().has(
            bookId
          );

        if (
          !bookExists &&
          !dummyBookExists
        ) {
          return;
        }

        setTargetBookId(
          bookId
        );

        setTargetChapterId(
          chapterId ?? null
        );

        setCurrentView(
          "editor"
        );
      },
      [
        books,
        isTutorialOpen,
      ]
    );

  const userProfileForUI: UserAuthorProfile | null =
    user
      ? {
        id: user.id,
        username: user.email,
        email: user.email,
        authorName: user.author_name ?? "",
        penName: user.pen_name ?? "",
        bio: user.bio ?? "",
        avatarUrl: user.avatar_url ?? "",
        dailyWordGoal: Number(user.daily_word_goal ?? 0),
        todayWordCount: Number(user.today_word_count ?? 0),
        lastActiveDate:
          user.last_active_date ??
          new Date().toISOString().split("T")[0],
        theme: "dark",
        soundEffects: user.sound_effects ?? true,
        preferredGenre: user.preferred_genre ?? undefined,
        hasCompletedTutorial: Boolean(user.tutorial_completed),
        isAuthenticated: isAuthenticated,
        createdAt: user.created_at ?? new Date().toISOString(),
      }
      : null;

  const isDummyActive =
    isTutorialOpen;

  const displayBooks =
    isDummyActive &&
      books.length === 0
      ? TUTORIAL_DUMMY_BOOKS
      : books;

  const displayChapters =
    isDummyActive &&
      chapters.length === 0
      ? TUTORIAL_DUMMY_CHAPTERS
      : chapters;

  const displayCharacters =
    isDummyActive &&
      characters.length === 0
      ? TUTORIAL_DUMMY_CHARACTERS
      : characters;

  const displayQuickNotes =
    isDummyActive &&
      quickNotes.length === 0
      ? TUTORIAL_DUMMY_QUICK_NOTES
      : quickNotes;

  function displayTutorialBookIds(): Set<string> {
    return new Set(
      TUTORIAL_DUMMY_BOOKS.map(
        (book) =>
          book.id
      )
    );
  }

  /**
   * Active Editor Book.
   */
  const activeEditorBookId =
    useMemo(() => {
      if (
        targetBookId &&
        displayBooks.some(
          (book) =>
            book.id ===
            targetBookId
        )
      ) {
        return targetBookId;
      }

      if (
        isDummyActive &&
        displayBooks.length >
        0
      ) {
        return displayBooks[0]
          .id;
      }

      return (
        displayBooks[0]?.id ??
        null
      );
    }, [
      targetBookId,
      displayBooks,
      isDummyActive,
    ]);

  /**
   * Active Editor Chapter.
   */
  const activeEditorChapterId =
    useMemo(() => {
      if (
        !activeEditorBookId
      ) {
        return null;
      }

      const isDummyBook =
        isDummyActive &&
        TUTORIAL_DUMMY_BOOKS.some(
          (book) =>
            book.id ===
            activeEditorBookId
        );

      const availableChapters =
        isDummyBook
          ? displayChapters.filter(
            (chapter) =>
              chapter.bookId ===
              activeEditorBookId
          )
          : (
            chaptersByBook[
            activeEditorBookId
            ] ?? []
          );

      if (
        targetChapterId &&
        availableChapters.some(
          (chapter) =>
            chapter.id ===
            targetChapterId
        )
      ) {
        return targetChapterId;
      }

      return (
        availableChapters[0]
          ?.id ?? null
      );
    }, [
      activeEditorBookId,
      targetChapterId,
      chaptersByBook,
      displayChapters,
      isDummyActive,
    ]);

  /**
   * Bersihkan target Book jika Book
   * sudah tidak tersedia.
   */
  useEffect(() => {
    if (!targetBookId) {
      return;
    }

    const bookExists =
      displayBooks.some(
        (book) =>
          book.id ===
          targetBookId
      );

    if (!bookExists) {
      setTargetBookId(null);
      setTargetChapterId(null);
    }
  }, [
    targetBookId,
    displayBooks,
  ]);

  /**
   * Bersihkan target Chapter jika
   * sudah tidak menjadi milik Book aktif.
   */
  useEffect(() => {
    if (
      !targetBookId ||
      !targetChapterId
    ) {
      return;
    }

    const isDummyBook =
      isDummyActive &&
      TUTORIAL_DUMMY_BOOKS.some(
        (book) =>
          book.id ===
          targetBookId
      );

    const availableChapters =
      isDummyBook
        ? displayChapters.filter(
          (chapter) =>
            chapter.bookId ===
            targetBookId
        )
        : (
          chaptersByBook[
          targetBookId
          ] ?? []
        );

    const chapterExists =
      availableChapters.some(
        (chapter) =>
          chapter.id ===
          targetChapterId
      );

    if (!chapterExists) {
      setTargetChapterId(
        null
      );
    }
  }, [
    targetBookId,
    targetChapterId,
    chaptersByBook,
    displayChapters,
    isDummyActive,
  ]);

  /**
   * Local data.
   */
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    refreshLocalData();
  }, [
    isAuthenticated,
    refreshLocalData,
  ]);

  /**
   * =========================================================
   * SPLASH
   * =========================================================
   */

  if (
    appStage ===
    "splash"
  ) {
    return (
      <SplashScreen
        onFinish={
          handleSplashFinish
        }
      />
    );
  }

  /**
   * =========================================================
   * AUTHENTICATION
   * =========================================================
   */

  if (
    appStage === "auth" ||
    !isAuthenticated
  ) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <UnifiedAuthCard
          onAuthSuccess={
            handleAuthSuccess
          }
        />
      </div>
    );
  }

  /**
   * =========================================================
   * ROLE-BASED APPLICATION ENTRY
   * =========================================================
   *
   * Ini adalah bagian penting Stage 2.
   *
   * role = admin
   *     -> AdminDashboardView
   *
   * role = user
   *     -> Writer Workspace
   *
   * Security tetap berada di backend.
   * Frontend hanya menentukan UI yang ditampilkan.
   * =========================================================
   */

  if (
    user?.role ===
    "admin"
  ) {
    return (
      <AdminDashboardView
        currentUser={
          user
        }
        onLogout={
          handleLogout
        }
      />
    );
  }

  /**
   * =========================================================
   * MAIN WRITER APPLICATION
   * =========================================================
   */

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] flex flex-col font-sans selection:bg-[#D4AF37]/25 selection:text-[#FAF7EE]">
      <Navbar
        currentView={
          currentView
        }
        userProfile={
          userProfileForUI
        }
        notesCount={
          displayQuickNotes.length
        }
        onNavigate={(view) =>
          setCurrentView(view)
        }
        onOpenSearch={() =>
          setIsSearchOpen(
            true
          )
        }
        onToggleNotes={() =>
          setIsQuickNotesOpen(
            !isQuickNotesOpen
          )
        }
        onOpenTutorial={() =>
          setIsTutorialOpen(
            true
          )
        }
        onOpenProfileSettings={() =>
          setIsProfileSettingsOpen(
            true
          )
        }
        onLogout={
          handleLogout
        }
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentView ===
          "workspace" && (
            <WorkspaceView
              books={
                displayBooks
              }
              chapters={
                displayChapters
              }
              chaptersByBook={
                chaptersByBook
              }
              loadingByBook={
                loadingByBook
              }
              activeBookId={
                targetBookId
              }
              customGenres={
                customGenres
              }
              userProfile={
                userProfileForUI
              }
              onSaveBook={
                handleSaveBook
              }
              onDeleteBook={
                handleDeleteBook
              }
              onSaveChapter={
                handleSaveChapter
              }
              onDeleteChapter={
                handleDeleteChapter
              }
              onAddCustomGenre={
                handleAddCustomGenre
              }
              onOpenEditor={
                handleOpenEditor
              }
              onSelectBook={(
                bookId
              ) => {
                setTargetBookId(
                  bookId
                );

                setTargetChapterId(
                  null
                );
              }}
              onOpenCharactersWiki={() =>
                setCurrentView(
                  "characters"
                )
              }
            />
          )}

        {currentView ===
          "characters" && (
            <CharacterWikiView
              characters={
                displayCharacters
              }
              books={
                displayBooks
              }
              onSaveCharacter={
                handleSaveCharacter
              }
              onDeleteCharacter={
                handleDeleteCharacter
              }
            />
          )}

        {currentView ===
          "editor" && (
            <NovelEditorView
              books={
                displayBooks
              }
              chapters={
                displayChapters
              }
              chaptersByBook={
                chaptersByBook
              }
              initialBookId={
                activeEditorBookId
              }
              initialChapterId={
                activeEditorChapterId
              }
              userProfile={
                userProfileForUI
              }
              onSaveChapter={
                handleSaveChapter
              }
              onSelectBook={(
                bookId
              ) => {
                setTargetBookId(
                  bookId
                );

                setTargetChapterId(
                  null
                );

                setCurrentView(
                  "workspace"
                );
              }}
            />
          )}
      </main>

      <footer className="h-10 bg-[#1E1E2E] border-t border-[#2A2A3C] flex items-center justify-between px-4 sm:px-8 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[#D4AF37]">
            Status: Sistem Aktif
          </span>

          <span className="hidden sm:inline text-white/20">
            •
          </span>

          <span className="hidden sm:inline">
            Database: Karakter (
            {
              displayCharacters.length
            }
            ) | Cerita (
            {
              displayBooks.length
            }
            )
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span className="hidden sm:inline text-white/40">
            Storage: REST API & PostgreSQL
          </span>

          <span className="hidden sm:inline text-white/20">
            •
          </span>

          <span className="text-[#D4AF37]/80">
            V 1.0.0 Stable
          </span>
        </div>
      </footer>

      <QuickNotesDrawer
        isOpen={
          isQuickNotesOpen
        }
        notes={
          displayQuickNotes
        }
        onClose={() =>
          setIsQuickNotesOpen(
            false
          )
        }
        onSaveNote={
          handleSaveQuickNote
        }
        onDeleteNote={
          handleDeleteQuickNote
        }
      />

      <GlobalSearchModal
        isOpen={
          isSearchOpen
        }
        books={
          displayBooks
        }
        chapters={
          displayChapters
        }
        characters={
          displayCharacters
        }
        notes={
          displayQuickNotes
        }
        onClose={() =>
          setIsSearchOpen(
            false
          )
        }
        onSelectBook={(
          bookId
        ) => {
          const bookExists =
            displayBooks.some(
              (book) =>
                book.id ===
                bookId
            );

          if (!bookExists) {
            return;
          }

          setTargetBookId(
            bookId
          );

          setTargetChapterId(
            null
          );

          setCurrentView(
            "workspace"
          );
        }}
        onSelectChapter={(
          bookId,
          chapterId
        ) => {
          const bookExists =
            displayBooks.some(
              (book) =>
                book.id ===
                bookId
            );

          if (!bookExists) {
            return;
          }

          const isDummyBook =
            isDummyActive &&
            TUTORIAL_DUMMY_BOOKS.some(
              (book) =>
                book.id ===
                bookId
            );

          const availableChapters =
            isDummyBook
              ? displayChapters.filter(
                (chapter) =>
                  chapter.bookId ===
                  bookId
              )
              : (
                chaptersByBook[
                bookId
                ] ?? []
              );

          const chapterExists =
            availableChapters.some(
              (chapter) =>
                chapter.id ===
                chapterId
            );

          if (!chapterExists) {
            return;
          }

          setTargetBookId(
            bookId
          );

          setTargetChapterId(
            chapterId
          );

          setCurrentView(
            "editor"
          );
        }}
        onSelectCharacter={() =>
          setCurrentView(
            "characters"
          )
        }
      />

      <VisualNovelTutorial
        isOpen={
          isTutorialOpen
        }
        currentView={
          currentView
        }
        onNavigate={(view) =>
          setCurrentView(view)
        }
        onClose={
          handleCloseTutorial
        }
        onComplete={
          handleTutorialComplete
        }
      />

      <ProfileSettingsModal
        isOpen={
          isProfileSettingsOpen
        }
        userProfile={
          userProfileForUI
        }
        onClose={() =>
          setIsProfileSettingsOpen(
            false
          )
        }
        onSaveProfile={async (updatedProfile) => {
          await apiRequest<{
            success: boolean;
            message?: string;
            data: User;
          }>("/users/me", {
            method: "PATCH",
            body: JSON.stringify({
              authorName: updatedProfile.authorName,
              penName: updatedProfile.penName,
              bio: updatedProfile.bio,
              avatarUrl: updatedProfile.avatarUrl,
              dailyWordGoal: updatedProfile.dailyWordGoal,
              theme: updatedProfile.theme,
              soundEffects: updatedProfile.soundEffects,
              preferredGenre: updatedProfile.preferredGenre,
            }),
          });

          await refreshUser();
        }}
        onDataRestored={
          refreshBooks
        }
      />
    </div>
  );
}

/* =========================================================
 * APP PROVIDERS
 * ========================================================= */

export default function App() {
  return (
    <AuthProvider>
      <BookProvider>
        <ChapterProvider>
          <CharacterProvider>
            <MainAppContent />
          </CharacterProvider>
        </ChapterProvider>
      </BookProvider>
    </AuthProvider>
  );
}
