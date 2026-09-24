import React, { useState, useRef } from 'react';
import { UserAuthorProfile } from '../../types';
import { apiRequest } from '../../services/api';
import {
  X,
  User,
  Upload,
  Camera,
  Trash2,
  Target,
  Lock,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  profile?: UserAuthorProfile | null;
  userProfile?: UserAuthorProfile | null;
  onClose: () => void;
  onSave?: (updatedProfile: UserAuthorProfile) => void;
  onSaveProfile?: (updatedProfile: UserAuthorProfile) => void;
  onDataImported?: () => void | Promise<void>;
  onDataRestored?: () => void | Promise<void>;
}

const DEFAULT_PROFILE_FALLBACK: UserAuthorProfile = {
  id: 'author_default',
  username: 'penulis',
  email: 'penulis@novelscreator.local',
  authorName: 'Penulis Hebat',
  penName: 'Penulis Hebat',
  bio: '',
  avatarUrl: '',
  dailyWordGoal: 1000,
  todayWordCount: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  theme: 'dark',
  soundEffects: true,
  createdAt: new Date().toISOString(),
};

interface BackupResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

export const ProfileSettingsModal: React.FC<
  ProfileSettingsModalProps
> = ({
  isOpen,
  profile,
  userProfile,
  onClose,
  onSave,
  onSaveProfile,
  onDataImported,
  onDataRestored,
}) => {
  const activeProfile =
    userProfile || profile || DEFAULT_PROFILE_FALLBACK;

  const [authorName, setAuthorName] = useState(
    activeProfile?.authorName || ''
  );

  const [penName, setPenName] = useState(
    activeProfile?.penName || ''
  );

  const [bio, setBio] = useState(activeProfile?.bio || '');

  const [avatarUrl, setAvatarUrl] = useState(
    activeProfile?.avatarUrl || ''
  );

  const [dailyWordGoal, setDailyWordGoal] = useState(
    activeProfile?.dailyWordGoal || 1000
  );

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<string | null>(
    null
  );

  const [activeTab, setActiveTab] = useState<
    'profile' | 'writing' | 'backup'
  >('profile');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupImportRef = useRef<HTMLInputElement>(null);

  // Sync state when incoming profile or modal visibility changes
  React.useEffect(() => {
    const current = userProfile || profile;

    if (current) {
      setAuthorName(current.authorName || '');
      setPenName(current.penName || '');
      setBio(current.bio || '');
      setAvatarUrl(current.avatarUrl || '');
      setDailyWordGoal(current.dailyWordGoal || 1000);
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMsg(null);
    setSuccessMsg(null);
    setErrorMsg(null);
    setIsExporting(false);
    setIsImporting(false);
  }, [userProfile, profile, isOpen]);

  if (!isOpen) return null;

  // ============================================================
  // AVATAR
  // ============================================================

  const handleAvatarFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(
        'Format file harus berupa gambar (JPG, PNG, WebP).'
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran gambar maksimal 5MB.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        setErrorMsg(null);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ============================================================
  // SAVE PROFILE
  // ============================================================

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMsg(null);
    setPasswordMsg(null);
    setSuccessMsg(null);

    if (!authorName.trim()) {
      setErrorMsg('Nama Penulis tidak boleh kosong.');
      return;
    }

    const isChangingPassword =
      Boolean(currentPassword) ||
      Boolean(newPassword) ||
      Boolean(confirmPassword);

    if (isChangingPassword) {
      if (!currentPassword.trim()) {
        setPasswordMsg('Masukkan kata sandi saat ini.');
        return;
      }

      if (!newPassword.trim()) {
        setPasswordMsg('Masukkan kata sandi baru.');
        return;
      }

      if (newPassword.length < 6) {
        setPasswordMsg(
          'Kata sandi baru minimal 6 karakter.'
        );
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordMsg(
          'Konfirmasi kata sandi baru tidak cocok.'
        );
        return;
      }

      if (currentPassword === newPassword) {
        setPasswordMsg(
          'Kata sandi baru harus berbeda dari kata sandi saat ini.'
        );
        return;
      }
    }

    try {
      // ==========================================================
      // UPDATE PASSWORD
      // ==========================================================

      if (isChangingPassword) {
        await apiRequest<{
          success: boolean;
          message?: string;
        }>('/users/me/password', {
          method: 'PATCH',
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        });

        setPasswordMsg(
          'Kata sandi berhasil diperbarui.'
        );

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }

      // ==========================================================
      // PROFILE TERBARU
      // ==========================================================

      const baseProfile =
        userProfile || profile || DEFAULT_PROFILE_FALLBACK;

      const updated: UserAuthorProfile = {
        ...baseProfile,
        authorName: authorName.trim(),
        penName:
          penName.trim() || authorName.trim(),
        bio: bio.trim(),
        avatarUrl,
        dailyWordGoal:
          Number(dailyWordGoal) || 1000,
      };

      // ==========================================================
      // SIMPAN PROFILE
      // ==========================================================

      if (onSave) {
        onSave(updated);
      }

      if (onSaveProfile) {
        await onSaveProfile(updated);
      }

      setSuccessMsg(
        isChangingPassword
          ? 'Profil dan kata sandi berhasil diperbarui!'
          : 'Profil penulis berhasil disimpan!'
      );

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 900);
    } catch (error) {
      console.error(
        'Gagal menyimpan pengaturan profil:',
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : 'Gagal menyimpan perubahan profil.';

      if (isChangingPassword) {
        setPasswordMsg(message);
      } else {
        setErrorMsg(message);
      }
    }
  };

  // ============================================================
  // BACKUP - EXPORT DARI BACKEND
  // ============================================================

  const handleExportJSON = async () => {
    if (isExporting || isImporting) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsExporting(true);

    try {
      const response =
        await apiRequest<BackupResponse>(
          '/backup/export'
        );

      if (!response?.success || !response.data) {
        throw new Error(
          response?.message ||
            'Data backup tidak tersedia.'
        );
      }

      const blob = new Blob(
        [JSON.stringify(response.data, null, 2)],
        {
          type: 'application/json;charset=utf-8',
        }
      );

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = url;
      anchor.download = `NovelsCreator_Backup_${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);

      setSuccessMsg(
        'Cadangan data berhasil diunduh dalam format JSON!'
      );

      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    } catch (error) {
      console.error(
        'Gagal mengekspor backup:',
        error
      );

      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'Gagal mengekspor data backup.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  // ============================================================
  // BACKUP - IMPORT KE BACKEND
  // ============================================================

  const handleImportJSON = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Reset input supaya file yang sama tetap bisa dipilih lagi
    e.target.value = '';

    if (isExporting || isImporting) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsImporting(true);

    try {
      if (
        file.type !== 'application/json' &&
        !file.name.toLowerCase().endsWith('.json')
      ) {
        throw new Error(
          'File harus berupa JSON (.json).'
        );
      }

      const fileText = await file.text();

      if (!fileText.trim()) {
        throw new Error(
          'File JSON kosong.'
        );
      }

      let backupData: unknown;

      try {
        backupData = JSON.parse(fileText);
      } catch {
        throw new Error(
          'Isi file bukan JSON yang valid.'
        );
      }

      // Validasi ringan di frontend.
      // Validasi utama tetap dilakukan oleh backend.
      if (
        !backupData ||
        typeof backupData !== 'object'
      ) {
        throw new Error(
          'Format backup tidak valid.'
        );
      }

      const data =
        backupData as Record<string, unknown>;

      if (data.format !== 'novels-creator') {
        throw new Error(
          'File bukan backup Novel\'s Creator.'
        );
      }

      if (data.version !== 1) {
        throw new Error(
          'Versi backup tidak didukung.'
        );
      }

      const response =
        await apiRequest<BackupResponse>(
          '/backup/import',
          {
            method: 'POST',
            body: JSON.stringify(backupData),
          }
        );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            'Gagal memulihkan data backup.'
        );
      }

      setSuccessMsg(
        response.message ||
          'Data berhasil dipulihkan. Memuat ulang data studio...'
      );

      // Beri kesempatan UI menampilkan pesan sukses
      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );

      // Refresh data dari backend
      if (onDataImported) {
        await onDataImported();
      }

      if (onDataRestored) {
        await onDataRestored();
      }

      setSuccessMsg(
        'Data berhasil dipulihkan dan studio telah diperbarui.'
      );

      setTimeout(() => {
        setSuccessMsg(null);
      }, 2500);
    } catch (error) {
      console.error(
        'Gagal mengimpor backup:',
        error
      );

      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'Gagal memulihkan data dari file backup.'
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div
      id="profile-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-2xl bg-[#1E1E2E] border border-[#2A2A3C] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#181826] border-b border-[#2A2A3C]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#252538] rounded-xl border border-[#D4AF37]/30 text-[#D4AF37]">
              <User className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-editorial text-lg font-bold text-[#FAF7EE]">
                Pengaturan Profil Penulis
              </h3>

              <p className="text-xs text-[#9E9EB2]">
                Kelola identitas kepenulisan, target harian, & data studio
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#7E7E94] hover:text-[#FAF7EE] hover:bg-[#252538] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex px-6 pt-3 bg-[#181826] border-b border-[#2A2A3C] gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-[#8A8A9E] hover:text-[#E0E0E0]'
            }`}
          >
            Identitas Penulis
          </button>

          <button
            onClick={() => setActiveTab('writing')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'writing'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-[#8A8A9E] hover:text-[#E0E0E0]'
            }`}
          >
            Target & Preferensi
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'backup'
                ? 'border-[#D4AF37] text-[#D4AF37]'
                : 'border-transparent text-[#8A8A9E] hover:text-[#E0E0E0]'
            }`}
          >
            Cadangan & Ekspor Data
          </button>
        </div>

        {/* Notification banners */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-950/50 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-950/50 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1 */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              {/* Avatar */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-[#161624] border border-[#2A2A3C] rounded-2xl">
                <div className="relative group w-24 h-24 rounded-full border-2 border-[#D4AF37]/40 bg-[#1E1E2E] overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={authorName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#6E6E85] bg-linear-to-b from-[#202030] to-[#141420]">
                      <Camera className="w-7 h-7 mb-1 text-[#D4AF37]/60" />

                      <span className="text-[9px] uppercase tracking-wider text-[#A0A0B5]">
                        Foto
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] transition-opacity cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mb-0.5 text-[#D4AF37]" />
                    <span>Ganti</span>
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-sm font-semibold text-[#FAF7EE] mb-1">
                    Foto Profil Penulis
                  </h4>

                  <p className="text-xs text-[#8E8EA4] mb-3">
                    Unggah foto lokal dari komputermu (JPG, PNG, WebP maks 5MB).
                  </p>

                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="py-1.5 px-3 bg-[#242438] hover:bg-[#303048] border border-[#3A3A54] rounded-lg text-xs text-[#E0E0E0] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Unggah Foto</span>
                    </button>

                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="py-1.5 px-3 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 rounded-lg text-xs text-red-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Foto</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#C8C8DC] mb-1.5">
                    Nama Penulis (Asli / Tampilan){' '}
                    <span className="text-[#D4AF37]">*</span>
                  </label>

                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) =>
                      setAuthorName(e.target.value)
                    }
                    placeholder="Nama Penulis"
                    className="w-full px-3.5 py-2.5 bg-[#161624] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs sm:text-sm text-[#E0E0E0] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#C8C8DC] mb-1.5">
                    Nama Pena (Nom de Plume)
                  </label>

                  <input
                    type="text"
                    value={penName}
                    onChange={(e) =>
                      setPenName(e.target.value)
                    }
                    placeholder="Contoh: Aria Ravenwood"
                    className="w-full px-3.5 py-2.5 bg-[#161624] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs sm:text-sm text-[#E0E0E0] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-medium text-[#C8C8DC] mb-1.5">
                  Bio / Tagline Penulis
                </label>

                <textarea
                  value={bio}
                  onChange={(e) =>
                    setBio(e.target.value)
                  }
                  rows={3}
                  placeholder="Ceritakan sekelumit visi kepenulisanmu atau fokus genre ceritamu..."
                  className="w-full px-3.5 py-2.5 bg-[#161624] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs sm:text-sm text-[#E0E0E0] outline-none transition-colors resize-none"
                />
              </div>

              {/* Password */}
              <div className="p-4 bg-[#161624] border border-[#2A2A3C] rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37]">
                  <Lock className="w-4 h-4" />
                  <span>Ubah Kata Sandi (Opsional)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#A0A0B5] mb-1">
                      Kata Sandi Saat Ini
                    </label>

                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) =>
                        setCurrentPassword(e.target.value)
                      }
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full px-3 py-2 bg-[#1C1C2C] border border-[#2A2A3C] rounded-lg text-xs text-[#E0E0E0] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#A0A0B5] mb-1">
                      Kata Sandi Baru
                    </label>

                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(e.target.value)
                      }
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full px-3 py-2 bg-[#1C1C2C] border border-[#2A2A3C] rounded-lg text-xs text-[#E0E0E0] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#A0A0B5] mb-1">
                      Konfirmasi Kata Sandi Baru
                    </label>

                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full px-3 py-2 bg-[#1C1C2C] border border-[#2A2A3C] rounded-lg text-xs text-[#E0E0E0] outline-none"
                    />
                  </div>
                </div>

                {passwordMsg && (
                  <p
                    className={`text-xs ${
                      passwordMsg
                        .toLowerCase()
                        .includes('berhasil')
                        ? 'text-emerald-400'
                        : 'text-red-300'
                    }`}
                  >
                    {passwordMsg}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2 */}
          {activeTab === 'writing' && (
            <div className="space-y-5">
              <div className="p-4 bg-[#161624] border border-[#2A2A3C] rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-[#D4AF37]" />

                  <h4 className="text-xs font-semibold text-[#FAF7EE]">
                    Target Kata Harian (Daily Word Goal)
                  </h4>
                </div>

                <p className="text-xs text-[#8E8EA4] mb-3">
                  Tentukan berapa jumlah kata yang ingin kamu capai setiap hari untuk memantau konsistensi menulismu.
                </p>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={100}
                    max={20000}
                    step={100}
                    value={dailyWordGoal}
                    onChange={(e) =>
                      setDailyWordGoal(
                        Number(e.target.value)
                      )
                    }
                    className="w-36 px-3 py-2 bg-[#1C1C2C] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-sm font-mono text-[#FAF7EE] outline-none"
                  />

                  <span className="text-xs text-[#A0A0B5]">
                    kata / hari
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3 */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              {/* EXPORT */}
              <div className="p-4 bg-[#161624] border border-[#2A2A3C] rounded-2xl">
                <h4 className="text-xs font-semibold text-[#FAF7EE] mb-1 flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#D4AF37]" />

                  <span>
                    Ekspor Cadangan Semua Data (JSON)
                  </span>
                </h4>

                <p className="text-xs text-[#8E8EA4] mb-3">
                  Unduh seluruh novel, bab, database karakter wiki, relasi, dan catatan cepat dalam satu berkas file JSON yang aman.
                </p>

                <button
                  type="button"
                  onClick={handleExportJSON}
                  disabled={
                    isExporting || isImporting
                  }
                  className="py-2 px-4 bg-[#242438] hover:bg-[#30304C] border border-[#3A3A56] rounded-xl text-xs font-medium text-[#FAF7EE] flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-3.5 h-3.5 text-[#D4AF37]" />

                  <span>
                    {isExporting
                      ? 'Menyiapkan Cadangan...'
                      : 'Unduh File Cadangan (.json)'}
                  </span>
                </button>
              </div>

              {/* IMPORT */}
              <div className="p-4 bg-[#161624] border border-[#2A2A3C] rounded-2xl">
                <h4 className="text-xs font-semibold text-[#FAF7EE] mb-1 flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-[#D4AF37]" />

                  <span>
                    Pulihkan Data dari Cadangan (Import JSON)
                  </span>
                </h4>

                <p className="text-xs text-[#8E8EA4] mb-3">
                  Pulihkan kembali proyek ceritamu dari file cadangan yang pernah kamu ekspor sebelumnya.
                </p>

                <input
                  ref={backupImportRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJSON}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={
                    isExporting || isImporting
                  }
                  onClick={() =>
                    backupImportRef.current?.click()
                  }
                  className="py-2 px-4 bg-[#242438] hover:bg-[#30304C] border border-[#3A3A56] rounded-xl text-xs font-medium text-[#FAF7EE] flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-[#D4AF37]" />

                  <span>
                    {isImporting
                      ? 'Memulihkan Data...'
                      : 'Pilih Berkas Cadangan (.json)'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#181826] border-t border-[#2A2A3C]">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 bg-[#222234] hover:bg-[#2C2C42] text-xs font-semibold text-[#C0C0D4] rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={
              isExporting || isImporting
            }
            className="py-2 px-5 bg-linear-to-r from-[#D4AF37] to-[#B89225] hover:from-[#E2BE4B] hover:to-[#C9A332] text-[#121212] font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />

            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
