import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCog,
  Users,
  X,
} from "lucide-react";

import type { User } from "../../types/auth";

import {
  AdminRole,
  AdminUser,
  AdminUserPayload,
  createAdminUser,
  deleteAdminUser,
  getAdminUsers,
  updateAdminUser,
} from "../../services/admin.service";

import { LogoEmblem } from "../common/LogoEmblem";

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

type FormMode =
  | "create"
  | "edit";

interface UserFormState {
  email: string;
  password: string;
  authorName: string;
  penName: string;
  role: AdminRole;
}

const EMPTY_FORM: UserFormState = {
  email: "",
  password: "",
  authorName: "",
  penName: "",
  role: "user",
};

function formatDate(
  value: string
): string {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}

export const AdminDashboard: React.FC<
  AdminDashboardProps
> = ({
  user,
  onLogout,
}) => {
  const [
    users,
    setUsers,
  ] = useState<AdminUser[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deletingUserId,
    setDeletingUserId,
  ] = useState<string | null>(
    null
  );

  const [
    roleChangingUserId,
    setRoleChangingUserId,
  ] = useState<string | null>(
    null
  );

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    roleFilter,
    setRoleFilter,
  ] = useState<
    "all" | AdminRole
  >("all");

  const [
    formMode,
    setFormMode,
  ] = useState<FormMode | null>(
    null
  );

  const [
    editingUser,
    setEditingUser,
  ] = useState<AdminUser | null>(
    null
  );

  const [
    form,
    setForm,
  ] = useState<UserFormState>(
    EMPTY_FORM
  );

  const loadUsers =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const data =
            await getAdminUsers();

          setUsers(data);
        } catch (
          requestError: any
        ) {
          setError(
            requestError?.message ||
              "Gagal mengambil daftar pengguna."
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

  const stats =
    useMemo(() => {
      let admins = 0;

      for (const item of users) {
        if (
          item.role ===
          "admin"
        ) {
          admins += 1;
        }
      }

      return {
        total: users.length,
        admins,
        writers:
          users.length -
          admins,
      };
    }, [users]);

  const filteredUsers =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return users.filter(
        (item) => {
          const matchesRole =
            roleFilter === "all" ||
            item.role ===
              roleFilter;

          if (!matchesRole) {
            return false;
          }

          if (
            !normalizedSearch
          ) {
            return true;
          }

          return [
            item.email,
            item.author_name ||
              "",
            item.pen_name ||
              "",
          ].some(
            (value) =>
              value
                .toLowerCase()
                .includes(
                  normalizedSearch
                )
          );
        }
      );
    }, [
      users,
      search,
      roleFilter,
    ]);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function openCreateModal() {
    clearMessages();

    setEditingUser(null);
    setFormMode("create");
    setForm(
      EMPTY_FORM
    );
  }

  function openEditModal(
    item: AdminUser
  ) {
    clearMessages();

    setEditingUser(item);
    setFormMode("edit");

    setForm({
      email: item.email,
      password: "",
      authorName:
        item.author_name ||
        "",
      penName:
        item.pen_name ||
        "",
      role: item.role,
    });
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setFormMode(null);
    setEditingUser(null);
    setForm(
      EMPTY_FORM
    );
  }

  function updateForm(
    field: keyof UserFormState,
    value: string
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    clearMessages();

    const email =
      form.email.trim();

    const authorName =
      form.authorName.trim();

    const penName =
      form.penName.trim();

    const password =
      form.password;

    if (!email) {
      setError(
        "Email wajib diisi."
      );
      return;
    }

    if (
      formMode ===
        "create" &&
      password.length < 6
    ) {
      setError(
        "Password minimal 6 karakter."
      );
      return;
    }

    if (
      formMode ===
        "edit" &&
      password &&
      password.length < 6
    ) {
      setError(
        "Password baru minimal 6 karakter."
      );
      return;
    }

    const payload: AdminUserPayload =
      {
        email,
        authorName:
          authorName ||
          undefined,
        penName:
          penName ||
          undefined,
        role: form.role,
      };

    if (password) {
      payload.password =
        password;
    }

    setSaving(true);

    try {
      if (
        formMode ===
        "create"
      ) {
        const created =
          await createAdminUser(
            {
              ...payload,
              email,
              password,
            }
          );

        setUsers(
          (current) => [
            created,
            ...current,
          ]
        );

        setSuccess(
          "User berhasil dibuat."
        );
      } else if (
        formMode ===
          "edit" &&
        editingUser
      ) {
        const updated =
          await updateAdminUser(
            editingUser.id,
            payload
          );

        setUsers(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                updated.id
                  ? updated
                  : item
            )
        );

        setSuccess(
          "User berhasil diperbarui."
        );
      }

      closeModal();
    } catch (
      requestError: any
    ) {
      setError(
        requestError?.message ||
          "Operasi user gagal dilakukan."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(
    item: AdminUser,
    nextRole: AdminRole
  ) {
    if (
      item.role ===
      nextRole
    ) {
      return;
    }

    clearMessages();

    setRoleChangingUserId(
      item.id
    );

    try {
      const updated =
        await updateAdminUser(
          item.id,
          {
            role: nextRole,
          }
        );

      setUsers(
        (current) =>
          current.map(
            (currentUser) =>
              currentUser.id ===
              updated.id
                ? updated
                : currentUser
          )
      );

      setSuccess(
        `Role ${updated.email} berhasil diubah menjadi ${updated.role}.`
      );
    } catch (
      requestError: any
    ) {
      setError(
        requestError?.message ||
          "Gagal mengubah role user."
      );
    } finally {
      setRoleChangingUserId(
        null
      );
    }
  }

  async function handleDelete(
    item: AdminUser
  ) {
    if (
      item.id === user.id
    ) {
      setError(
        "Admin tidak dapat menghapus akun sendiri."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Hapus user "${item.email}"?`
      );

    if (!confirmed) {
      return;
    }

    clearMessages();

    setDeletingUserId(
      item.id
    );

    try {
      await deleteAdminUser(
        item.id
      );

      setUsers(
        (current) =>
          current.filter(
            (currentUser) =>
              currentUser.id !==
              item.id
          )
      );

      setSuccess(
        "User berhasil dihapus."
      );
    } catch (
      requestError: any
    ) {
      setError(
        requestError?.message ||
          "Gagal menghapus user."
      );
    } finally {
      setDeletingUserId(
        null
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] font-sans">
      <header className="border-b border-[#2A2A3C] bg-[#121212]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 flex items-center justify-center bg-[#D4AF37] rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              <LogoEmblem size={24} />
            </div>

            <div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#D4AF37]">
                Novel's Creator
              </h1>

              <p className="text-[10px] text-[#A0A0B5] font-mono tracking-[0.25em] uppercase">
                Administration Studio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                Administrator
              </div>

              <div className="text-xs text-[#FAF7EE] max-w-[220px] truncate">
                {user.email}
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-[#2A2A3C] bg-[#1E1E2E] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#C8C8DC] hover:text-[#FAF7EE] hover:border-[#D4AF37]/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
            Admin Dashboard
          </p>

          <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-[#FAF7EE]">
            Manajemen Pengguna
          </h2>

          <p className="mt-2 max-w-2xl text-sm text-[#9E9EB2]">
            Kelola akun, informasi penulis, dan role pengguna Novel's Creator.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-900/70 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-900/70 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl border border-[#2A2A3C] bg-[#1E1E2E] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8E8EA4]">
                Total User
              </span>
              <Users className="w-5 h-5 text-[#D4AF37]" />
            </div>

            <div className="mt-3 text-3xl font-serif text-[#FAF7EE]">
              {stats.total}
            </div>
          </div>

          <div className="rounded-2xl border border-[#2A2A3C] bg-[#1E1E2E] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8E8EA4]">
                Admin
              </span>
              <Shield className="w-5 h-5 text-[#D4AF37]" />
            </div>

            <div className="mt-3 text-3xl font-serif text-[#FAF7EE]">
              {stats.admins}
            </div>
          </div>

          <div className="rounded-2xl border border-[#2A2A3C] bg-[#1E1E2E] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8E8EA4]">
                User / Writer
              </span>
              <UserCog className="w-5 h-5 text-[#D4AF37]" />
            </div>

            <div className="mt-3 text-3xl font-serif text-[#FAF7EE]">
              {stats.writers}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#2A2A3C] bg-[#1E1E2E] overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#2A2A3C]">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#FAF7EE]">
                  Daftar Pengguna
                </h3>

                <p className="text-xs text-[#8E8EA4] mt-1">
                  {filteredUsers.length} dari {users.length} user ditampilkan
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <label className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77778D]" />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Cari email / nama..."
                    className="w-full sm:w-64 rounded-xl border border-[#2A2A3C] bg-[#151522] pl-9 pr-3 py-2.5 text-sm text-[#FAF7EE] outline-none focus:border-[#D4AF37]/70"
                  />
                </label>

                <label className="relative">
                  <select
                    value={roleFilter}
                    onChange={(event) =>
                      setRoleFilter(
                        event.target.value as
                          | "all"
                          | AdminRole
                      )
                    }
                    className="appearance-none w-full sm:w-36 rounded-xl border border-[#2A2A3C] bg-[#151522] px-3 pr-9 py-2.5 text-sm text-[#FAF7EE] outline-none focus:border-[#D4AF37]/70"
                  >
                    <option value="all">
                      Semua Role
                    </option>

                    <option value="admin">
                      Admin
                    </option>

                    <option value="user">
                      User
                    </option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77778D]" />
                </label>

                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    void loadUsers();
                  }}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#2A2A3C] bg-[#151522] px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-[#C8C8DC] hover:text-[#FAF7EE] hover:border-[#D4AF37]/50 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${
                      loading
                        ? "animate-spin"
                        : ""
                    }`}
                  />

                  <span className="hidden sm:inline">
                    Refresh
                  </span>
                </button>

                <button
                  type="button"
                  onClick={openCreateModal}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#121212] hover:bg-[#E2C15A] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create User
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-[#9E9EB2]">
              Memuat daftar pengguna...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-10 text-center">
              <Users className="mx-auto w-8 h-8 text-[#55556A]" />

              <p className="mt-3 text-sm text-[#9E9EB2]">
                Tidak ada user yang sesuai.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px]">
                <thead className="bg-[#171724]">
                  <tr className="text-left text-[10px] uppercase tracking-wider text-[#77778D]">
                    <th className="px-5 py-3 font-bold">
                      Pengguna
                    </th>

                    <th className="px-5 py-3 font-bold">
                      Nama Penulis
                    </th>

                    <th className="px-5 py-3 font-bold">
                      Role
                    </th>

                    <th className="px-5 py-3 font-bold">
                      Dibuat
                    </th>

                    <th className="px-5 py-3 font-bold text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#2A2A3C]">
                  {filteredUsers.map(
                    (item) => {
                      const isSelf =
                        item.id ===
                        user.id;

                      const isRoleChanging =
                        roleChangingUserId ===
                        item.id;

                      const isDeleting =
                        deletingUserId ===
                        item.id;

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-[#242437]/50 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full border border-[#2A2A3C] bg-[#151522] flex items-center justify-center text-sm font-bold text-[#D4AF37]">
                                {(
                                  item.pen_name ||
                                  item.author_name ||
                                  item.email
                                )
                                  .slice(
                                    0,
                                    2
                                  )
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-[#FAF7EE] truncate max-w-[280px]">
                                  {item.email}
                                </div>

                                <div className="text-[11px] text-[#77778D] font-mono">
                                  ID:{" "}
                                  {item.id.slice(
                                    0,
                                    8
                                  )}

                                  {isSelf &&
                                    " • Anda"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="text-sm text-[#C8C8DC]">
                              {item.pen_name ||
                                item.author_name ||
                                "-"}
                            </div>

                            {item.pen_name &&
                              item.author_name && (
                                <div className="text-[11px] text-[#77778D]">
                                  {
                                    item.author_name
                                  }
                                </div>
                              )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="relative inline-block">
                              <select
                                value={
                                  item.role
                                }
                                disabled={
                                  isSelf ||
                                  isRoleChanging
                                }
                                onChange={(
                                  event
                                ) =>
                                  void handleRoleChange(
                                    item,
                                    event
                                      .target
                                      .value as AdminRole
                                  )
                                }
                                className="appearance-none rounded-lg border border-[#3A3A54] bg-[#151522] pl-3 pr-8 py-1.5 text-xs font-bold uppercase tracking-wider text-[#D4AF37] outline-none focus:border-[#D4AF37]/70 disabled:opacity-60"
                              >
                                <option value="admin">
                                  Admin
                                </option>

                                <option value="user">
                                  User
                                </option>
                              </select>

                              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#77778D]" />
                            </div>
                          </td>

                          <td className="px-5 py-4 text-xs text-[#9E9EB2]">
                            {formatDate(
                              item.created_at
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    item
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#2A2A3C] bg-[#151522] px-3 py-2 text-xs font-bold text-[#C8C8DC] hover:text-[#FAF7EE] hover:border-[#D4AF37]/50"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void handleDelete(
                                    item
                                  )
                                }
                                disabled={
                                  isSelf ||
                                  isDeleting
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-900/60 bg-red-950/20 px-3 py-2 text-xs font-bold text-red-300 hover:text-red-200 disabled:opacity-40"
                              >
                                <Trash2 className="w-3.5 h-3.5" />

                                {isDeleting
                                  ? "..."
                                  : "Delete"}
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

      {formMode && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="w-full max-w-lg rounded-2xl border border-[#2A2A3C] bg-[#1E1E2E] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2A2A3C] px-5 py-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                  {formMode ===
                  "create"
                    ? "Create User"
                    : "Edit User"}
                </p>

                <h3 className="mt-1 text-lg font-bold text-[#FAF7EE]">
                  {formMode ===
                  "create"
                    ? "Tambah pengguna baru"
                    : editingUser?.email}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-[#77778D] hover:text-[#FAF7EE] hover:bg-[#282840]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="p-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-[#C8C8DC] mb-1.5">
                  Email
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(
                    event
                  ) =>
                    updateForm(
                      "email",
                      event.target
                        .value
                    )
                  }
                  autoComplete="off"
                  className="w-full rounded-xl border border-[#2A2A3C] bg-[#151522] px-3 py-2.5 text-sm text-[#FAF7EE] outline-none focus:border-[#D4AF37]/70"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#C8C8DC] mb-1.5">
                  {formMode ===
                  "create"
                    ? "Password"
                    : "Password Baru (opsional)"}
                </label>

                <input
                  type="password"
                  value={form.password}
                  onChange={(
                    event
                  ) =>
                    updateForm(
                      "password",
                      event.target
                        .value
                    )
                  }
                  autoComplete="new-password"
                  placeholder={
                    formMode ===
                    "edit"
                      ? "Kosongkan jika tidak diubah"
                      : ""
                  }
                  className="w-full rounded-xl border border-[#2A2A3C] bg-[#151522] px-3 py-2.5 text-sm text-[#FAF7EE] outline-none focus:border-[#D4AF37]/70"
                  required={
                    formMode ===
                    "create"
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#C8C8DC] mb-1.5">
                    Author Name
                  </label>

                  <input
                    value={
                      form.authorName
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "authorName",
                        event.target
                          .value
                      )
                    }
                    className="w-full rounded-xl border border-[#2A2A3C] bg-[#151522] px-3 py-2.5 text-sm text-[#FAF7EE] outline-none focus:border-[#D4AF37]/70"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#C8C8DC] mb-1.5">
                    Pen Name
                  </label>

                  <input
                    value={
                      form.penName
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "penName",
                        event.target
                          .value
                      )
                    }
                    className="w-full rounded-xl border border-[#2A2A3C] bg-[#151522] px-3 py-2.5 text-sm text-[#FAF7EE] outline-none focus:border-[#D4AF37]/70"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#C8C8DC] mb-1.5">
                  Role
                </label>

                <select
                  value={form.role}
                  onChange={(
                    event
                  ) =>
                    updateForm(
                      "role",
                      event.target
                        .value
                    )
                  }
                  className="w-full rounded-xl border border-[#2A2A3C] bg-[#151522] px-3 py-2.5 text-sm text-[#FAF7EE] outline-none focus:border-[#D4AF37]/70"
                >
                  <option value="user">
                    User
                  </option>

                  <option value="admin">
                    Admin
                  </option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-[#2A2A3C] bg-[#151522] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#C8C8DC] hover:text-[#FAF7EE] disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#121212] hover:bg-[#E2C15A] disabled:opacity-50"
                >
                  {saving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}

                  {formMode ===
                  "create"
                    ? "Create User"
                    : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
