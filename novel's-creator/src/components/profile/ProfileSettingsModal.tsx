import React, { useState, useRef } from 'react';
import { UserAuthorProfile } from '../../types';
import { exportAllDataAsJSON, importAllDataFromJSON } from '../../lib/storage';
import {
  X,
  User,
  Upload,
  Camera,
  Trash2,
  Target,
  FileText,
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
  onDataImported?: () => void;
  onDataRestored?: () => void;
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

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  profile,
  userProfile,
  onClose,
  onSave,
  onSaveProfile,
  onDataImported,
  onDataRestored,
}) => {
  const activeProfile = userProfile || profile || DEFAULT_PROFILE_FALLBACK;

  const [authorName, setAuthorName] = useState(activeProfile?.authorName || '');
  const [penName, setPenName] = useState(activeProfile?.penName || '');
  const [bio, setBio] = useState(activeProfile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(activeProfile?.avatarUrl || '');
  const [dailyWordGoal, setDailyWordGoal] = useState(activeProfile?.dailyWordGoal || 1000);

  // Sync state when incoming profile or modal visibility changes
  React.useEffect(() => {
    const current = userProfile || profile;
    if (current) {
      setAuthorName(current?.authorName || '');
      setPenName(current?.penName || '');
      setBio(current?.bio || '');
      setAvatarUrl(current?.avatarUrl || '');
      setDailyWordGoal(current?.dailyWordGoal || 1000);
    }
  }, [userProfile, profile, isOpen]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'writing' | 'backup'>('profile');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupImportRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle local avatar photo upload using FileReader Base64
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Format file harus berupa gambar (JPG, PNG, WebP).');
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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setPasswordMsg(null);

    if (!authorName.trim()) {
      setErrorMsg('Nama Penulis tidak boleh kosong.');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setErrorMsg('Kata sandi baru minimal 6 karakter.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('Konfirmasi kata sandi baru tidak cocok.');
        return;
      }
      setPasswordMsg('Kata sandi berhasil diperbarui.');
    }

    const baseProfile = userProfile || profile || DEFAULT_PROFILE_FALLBACK;
    const updated: UserAuthorProfile = {
      ...baseProfile,
      authorName: authorName.trim(),
      penName: penName.trim() || authorName.trim(),
      bio: bio.trim(),
      avatarUrl,
      dailyWordGoal: Number(dailyWordGoal) || 1000,
    };

    if (onSave) onSave(updated);
    if (onSaveProfile) onSaveProfile(updated);
    setSuccessMsg('Profil penulis berhasil disimpan!');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 900);
  };

  const handleExportJSON = () => {
    const dataStr = exportAllDataAsJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NovelsCreator_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccessMsg('Cadangan data berhasil diunduh dalam format JSON!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const ok = importAllDataFromJSON(reader.result);
        if (ok) {
          setSuccessMsg('Data berhasil dipulihkan! Memuat ulang studio...');
          if (onDataImported) onDataImported();
          if (onDataRestored) onDataRestored();
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } else {
          setErrorMsg('Format file JSON tidak valid untuk cadangan Novel\'s Creator.');
        }
      }
    };
    reader.readAsText(file);
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

        {/* Modal Body with Scroll */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: IDENTITAS PENULIS */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              {/* Avatar Upload Section */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-[#161624] border border-[#2A2A3C] rounded-2xl">
                <div className="relative group w-24 h-24 rounded-full border-2 border-[#D4AF37]/40 bg-[#1E1E2E] overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={authorName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#6E6E85] bg-gradient-to-b from-[#202030] to-[#141420]">
                      <Camera className="w-7 h-7 mb-1 text-[#D4AF37]/60" />
                      <span className="text-[9px] uppercase tracking-wider text-[#A0A0B5]">
                        Foto
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
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
                      onClick={() => fileInputRef.current?.click()}
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

              {/* Author Names & Pen Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#C8C8DC] mb-1.5">
                    Nama Penulis (Asli / Tampilan) <span className="text-[#D4AF37]">*</span>
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
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
                    onChange={(e) => setPenName(e.target.value)}
                    placeholder="Contoh: Aria Ravenwood"
                    className="w-full px-3.5 py-2.5 bg-[#161624] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs sm:text-sm text-[#E0E0E0] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Bio / Author Tagline */}
              <div>
                <label className="block text-xs font-medium text-[#C8C8DC] mb-1.5">
                  Bio / Tagline Penulis
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Ceritakan sekelumit visi kepenulisanmu atau fokus genre ceritamu..."
                  className="w-full px-3.5 py-2.5 bg-[#161624] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs sm:text-sm text-[#E0E0E0] outline-none transition-colors resize-none"
                />
              </div>

              {/* Password update section */}
              <div className="p-4 bg-[#161624] border border-[#2A2A3C] rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37]">
                  <Lock className="w-4 h-4" />
                  <span>Ubah Kata Sandi (Opsional)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#A0A0B5] mb-1">
                      Kata Sandi Baru
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
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
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-[#1C1C2C] border border-[#2A2A3C] rounded-lg text-xs text-[#E0E0E0] outline-none"
                    />
                  </div>
                </div>
                {passwordMsg && (
                  <p className="text-xs text-emerald-400">{passwordMsg}</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TARGET & PREFERENSI */}
          {activeTab === 'writing' && (
            <div className="space-y-5">
              {/* Daily Word Goal */}
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
                    onChange={(e) => setDailyWordGoal(Number(e.target.value))}
                    className="w-36 px-3 py-2 bg-[#1C1C2C] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-sm font-mono text-[#FAF7EE] outline-none"
                  />
                  <span className="text-xs text-[#A0A0B5]">kata / hari</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CADANGAN & EKSPOR DATA */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#161624] border border-[#2A2A3C] rounded-2xl">
                <h4 className="text-xs font-semibold text-[#FAF7EE] mb-1 flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#D4AF37]" />
                  <span>Ekspor Cadangan Semua Data (JSON)</span>
                </h4>
                <p className="text-xs text-[#8E8EA4] mb-3">
                  Unduh seluruh novel, bab, database karakter wiki, relasi, dan catatan cepat dalam satu berkas file JSON yang aman.
                </p>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="py-2 px-4 bg-[#242438] hover:bg-[#30304C] border border-[#3A3A56] rounded-xl text-xs font-medium text-[#FAF7EE] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Unduh File Cadangan (.json)</span>
                </button>
              </div>

              <div className="p-4 bg-[#161624] border border-[#2A2A3C] rounded-2xl">
                <h4 className="text-xs font-semibold text-[#FAF7EE] mb-1 flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
                  <span>Pulihkan Data dari Cadangan (Import JSON)</span>
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
                  onClick={() => backupImportRef.current?.click()}
                  className="py-2 px-4 bg-[#242438] hover:bg-[#30304C] border border-[#3A3A56] rounded-xl text-xs font-medium text-[#FAF7EE] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Pilih Berkas Cadangan (.json)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
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
            className="py-2 px-5 bg-gradient-to-r from-[#D4AF37] to-[#B89225] hover:from-[#E2BE4B] hover:to-[#C9A332] text-[#121212] font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
