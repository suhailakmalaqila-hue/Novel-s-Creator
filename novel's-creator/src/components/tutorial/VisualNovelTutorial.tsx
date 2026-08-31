import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppView } from '../../types';
import {
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  RotateCcw,
  Glasses,
  FolderKanban,
  PlusCircle,
  Users,
  Wrench,
  CheckCircle2,
  BarChart3,
  Network,
  Feather,
  ShieldCheck,
  StickyNote,
  Search,
  UserCheck,
  BookOpen,
  Filter,
  Type,
  Maximize2,
  Save,
  History,
  Download,
  HelpCircle,
  UserPlus,
} from 'lucide-react';

interface VisualNovelTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  currentView?: AppView;
  onNavigate?: (view: AppView) => void;
}

interface StepConfig {
  id: number;
  title: string;
  subtitle: string;
  message: string;
  targetSelector?: string;
  requiredView?: AppView;
  icon: React.ReactNode;
}

const TUTORIAL_STEPS: StepConfig[] = [
  {
    id: 1,
    title: 'Selamat Datang di Novel\'s Creator',
    subtitle: 'Studio Penulisan & Ensiklopedia Fiksi',
    message:
      'Selamat datang di Novel’s Creator! Studio all-in-one tempat Anda menyusun novel mahakarya, membangun ensiklopedia karakter mendalam, merancang matriks relasi antartokoh, dan menulis naskah bebas distraksi. Mari pelajari seluruh fitur studio dari awal hingga mahir.',
    icon: <Sparkles className="w-4 h-4 text-[#D4AF37]" />,
  },
  {
    id: 2,
    title: 'Tiga Pilar Ruang Kerja',
    subtitle: 'Navigasi Antar Mode Studio',
    message:
      'Bilah navigasi atas menghubungkan 3 pilar studio utama: Workspace (Pusat Manajemen Naskah & Bab), Wiki Karakter (Database Tokoh & Matriks Relasi), dan Studio Editor (Kanvas Penulisan Naskah Bebas Distraksi). Anda dapat berpindah mode dengan mulus kapan pun.',
    targetSelector: '[data-tour="nav-tabs-group"]',
    requiredView: 'workspace',
    icon: <FolderKanban className="w-4 h-4 text-[#D4AF37]" />,
  },
  {
    id: 3,
    title: 'Workspace: Manajemen Cerita',
    subtitle: 'Pusat Naskah & Status Produksi',
    message:
      'Di Workspace, Anda mengorganisir seluruh proyek novel dan serial cerita. Setiap buku dilengkapi judul, sampul gambar kustom, sinopsis, target jumlah kata, serta filter genre dinamis dan status produksi (Draft, Berjalan, Tamat, atau Hiatus).',
    targetSelector: '[data-tour="workspace-dashboard"]',
    requiredView: 'workspace',
    icon: <FolderKanban className="w-4 h-4 text-[#D4AF37]" />,
  },
  {
    id: 4,
    title: 'Inisiasi Buku & Struktur Bab',
    subtitle: 'Memulai Proyek Naskah Baru',
    message:
      'Klik tombol "Buat Buku Baru" untuk memulai novel baru. Di dalamnya, Anda dapat menyusun urutan bab, mengatur judul dan sinopsis per bab, serta memantau akumulasi total kata naskah secara dinamis.',
    targetSelector: '[data-tour="create-book"]',
    requiredView: 'workspace',
    icon: <PlusCircle className="w-4 h-4 text-[#D4AF37]" />,
  },
  {
    id: 5,
    title: 'Pelacak Produktivitas Studio',
    subtitle: 'Target Kata Harian & Statistik',
    message:
      'Pantau jumlah kata yang berhasil ditulis, total bab terselesaikan, dan progres target harian Anda secara real-time. Fitur ini membantu Anda menjaga ritme produktivitas dan konsistensi menulis setiap hari.',
    targetSelector: '[data-tour="writing-progress"]',
    requiredView: 'workspace',
    icon: <BarChart3 className="w-4 h-4 text-[#D4AF37]" />,
  },
  {
    id: 6,
    title: 'Filter Status & Pencarian Naskah',
    subtitle: 'Menemukan Proyek Cerita Secara Cepat',
    message:
      'Gunakan bilah pencarian dan filter status untuk menyaring buku berdasarkan judul, sinopsis, genre, atau status produksi (Ongoing, Draft, Selesai, Hiatus) secara instan.',
    targetSelector: '[data-tour="workspace-filters"]',
    requiredView: 'workspace',
    icon: <Filter className="w-4 h-4 text-[#D4AF37]" />,
  },
  {
    id: 7,
    title: 'Wiki Karakter: Profil & Lore Tokoh',
    subtitle: 'Ensiklopedia Karakter Mendalam',
    message:
      'Wiki Karakter memungkinkan Anda merancang profil tokoh yang sangat mendalam: nama lengkap, alias, peran (Protagonis, Antagonis, Mentor, Rival, Side, Netral), umur, penampilan fisik, sifat kepribadian, latar belakang, hingga atribut kustom seperti status atau kekuatan.',
    targetSelector: '[data-tour="character-wiki-header"]',
    requiredView: 'characters',
    icon: <Users className="w-4 h-4 text-[#D4AF37]" />,
  },
  {
    id: 8,
    title: 'Tambah Karakter & Kustomisasi Atribut',
    subtitle: 'Perkaya Detail & Parameter Karakter',
    message:
      'Klik tombol "Tambah Karakter" untuk membuka formulir lengkap. Anda dapat mengunggah foto avatar, menentukan peran dalam cerita, menyematkan kutipan khas, serta menambahkan atribut statistik kustom tanpa batas.',
    targetSelector: '[data-tour="add-character-btn"]',
    requiredView: 'characters',
    icon: <UserPlus className="w-4 h-4 text-[#D4AF37]" />,
  },
  {
    id: 9,
    title: 'Filter Peran & Pencarian Lore Karakter',
    subtitle: 'Eksplorasi Database Tokoh',
    message:
      'Temukan karakter dengan cepat melalui filter peran cerita (Protagonis, Antagonis, Mentor, Rival, Side, Netral), filter status kehidupan (Hidup, Mati, Hilang, Disegel, Reinkarnasi), atau filter keterlibatan buku.',
    targetSelector: '[data-tour="character-filter-bar"]',
    requiredView: 'characters',
    icon: <Filter className="w-4 h-4 text-[#D4AF37]" />,
  },
  {
    id: 10,
    title: 'Matriks Relasi Antartokoh',
    subtitle: 'Visualisasi Dinamika Emosional & Aliansi',
    message:
      'Klik tombol "Matriks Relasi" untuk membuka graf visual interaktif. Anda dapat memetakan ikatan antartokoh: Sekutu, Musuh/Konflik, Percintaan, Mentor, Keluarga, atau Rivalitas guna menjaga konsistensi intrik dan drama cerita.',
    targetSelector: '[data-tour="relationship-graph-btn"]',
    requiredView: 'characters',
    icon: <Network className="w-4 h-4 text-[#D4AF37]" />,
  },
  {
    id: 11,
    title: 'Studio Editor: Pemilih Naskah & Bab',
    subtitle: 'Peralihan Proyek Cepat Tanpa Jeda',
    message:
      'Di bilah atas Studio Editor, Anda dapat langsung beralih di antara berbagai judul buku dan bab cerita yang sedang aktif melalui dropdown pemilih cepat.',
    targetSelector: '[data-tour="editor-selector-bar"]',
    requiredView: 'editor',
    icon: <BookOpen className="w-4 h-4 text-[#D4AF37]" />,
  },
  {
    id: 12,
    title: 'Statistik Kata & Estimasi Waktu Baca',
    subtitle: 'Metrik Real-time Sesi Menulis',
    message:
      'Pantau jumlah kata, jumlah karakter, perkiraan durasi membaca pembaca dalam hitungan menit, serta progres persentase target kata harian yang terus diperbarui saat Anda mengetik.',
    targetSelector: '[data-tour="editor-stats-ribbon"]',
    requiredView: 'editor',
    icon: <BarChart3 className="w-4 h-4 text-[#D4AF37]" />,
  },
  {
    id: 13,
    title: 'Kanvas Penulisan Naskah Editorial',
    subtitle: 'Lingkungan Menulis Mewah & Responsif',
    message:
      'Studio Editor memberikan kanvas penulisan berkelas editorial dengan input judul bab dinamis, penataan spasi naskah yang nyaman, dan responsivitas penuh.',
    targetSelector: '[data-tour="editor-canvas-stage"]',
    requiredView: 'editor',
    icon: <Feather className="w-4 h-4 text-[#D4AF37]" />,
  },
  {
    id: 14,
    title: 'Tipografi & Pengaturan Tampilan Naskah',
    subtitle: 'Kustomisasi Tipografi Sesuai Kenyamanan Mata',
    message:
      'Pilih jenis font editorial favorit Anda: Serif (Nuansa Novel Klasik), Sans-Serif (Modern Bersih), atau Monospace (Gaya Naskah Skenario), serta atur ukuran huruf dari 15px hingga 22px.',
    targetSelector: '[data-tour="editor-typography-group"]',
    requiredView: 'editor',
    icon: <Type className="w-4 h-4 text-[#D4AF37]" />,
  },
  {
    id: 15,
    title: 'Toolbar Pemformatan & Pintasan Narasi',
    subtitle: 'Format Teks, Kutipan, & Pembatas Babak',
    message:
      'Gunakan toolbar untuk menerapkan Teks Tebal, Miring, Garis Bawah, Coret, Heading babak, Kutipan/Monolog batin, garis dialog panjang (—), serta pembatas adegan (* * *) dengan satu klik.',
    targetSelector: '[data-tour="editor-formatting-tools"]',
    requiredView: 'editor',
    icon: <Wrench className="w-4 h-4 text-[#D4AF37]" />,
  },
  {
    id: 16,
    title: 'Ekspor Naskah Cepat (.txt)',
    subtitle: 'Unduh Naskah Siap Publikasi',
    message:
      'Unduh dan ekspor naskah bab yang sedang Anda kerjakan dalam format file teks murni (.txt) kapan pun untuk keperluan pencadangan offline atau publikasi.',
    targetSelector: '[data-tour="editor-export-btn"]',
    requiredView: 'editor',
    icon: <Download className="w-4 h-4 text-[#D4AF37]" />,
  },
  {
    id: 17,
    title: 'Mode Fokus Layar Penuh (Esc)',
    subtitle: 'Konsentrasi Penuh Tanpa Distraksi',
    message:
      'Aktifkan Mode Fokus untuk menyembunyikan seluruh antarmuka samping dan bilah navigasi luar, memberikan ruang penuh bagi imajinasi Anda (tekan Esc atau ikon untuk keluar).',
    targetSelector: '[data-tour="editor-focus-btn"]',
    requiredView: 'editor',
    icon: <Maximize2 className="w-4 h-4 text-[#D4AF37]" />,
  },
  {
    id: 18,
    title: 'Penyimpanan Otomatis (Auto-Save & Ctrl+S)',
    subtitle: 'Keamanan Data Naskah Real-Time',
    message:
      'Naskah Anda disimpan secara otomatis secara berkala dengan indikator status waktu nyata. Anda juga dapat menekan Ctrl+S atau tombol Simpan untuk penyimpanan manual instan.',
    targetSelector: '[data-tour="editor-save-indicator"]',
    requiredView: 'editor',
    icon: <Save className="w-4 h-4 text-[#D4AF37]" />,
  },
  {
    id: 19,
    title: 'Kubah Draft Darurat & Pemulihan Riwayat',
    subtitle: 'Snapshot Otomatis & Anti Kehilangan Data',
    message:
      'Kubah Draft Darurat menyimpan snapshot riwayat naskah otomatis. Jika Anda salah menyunting atau ingin kembali ke versi sebelumnya, Anda dapat memulihkan (*restore*) revisi naskah terdahulu dengan mudah.',
    targetSelector: '[data-tour="editor-history-vault"]',
    requiredView: 'editor',
    icon: <History className="w-4 h-4 text-[#D4AF37]" />,
  },
  {
    id: 20,
    title: 'Catatan Kilat (Ctrl+M)',
    subtitle: 'Tangkap Inspirasi Spontan Kapan Saja',
    message:
      'Mendapatkan ide plot atau dialog mendadak saat tengah menulis? Buka Catatan Kilat (Ctrl+M) untuk mencatat cepat ide Anda dengan kartu warna, pin prioritas, dan tag tanpa perlu meninggalkan halaman editor.',
    targetSelector: '[data-tour="quick-notes"]',
    icon: <StickyNote className="w-4 h-4 text-[#D4AF37]" />,
  },
  {
    id: 21,
    title: 'Pencarian Global (Ctrl+K)',
    subtitle: 'Pencarian Kilat Lintas Naskah & Tokoh',
    message:
      'Tekan Ctrl+K untuk membuka Command Palette pencarian instan. Temukan judul novel, bab, profil tokoh, atau catatan ide dalam hitungan milidetik dari mana saja di dalam aplikasi.',
    targetSelector: '[data-tour="global-search"]',
    icon: <Search className="w-4 h-4 text-[#D4AF37]" />,
  },
  {
    id: 22,
    title: 'Profil & Kustomisasi Studio',
    subtitle: 'Identitas Penulis & Pengaturan Studio',
    message:
      'Atur nama pena Anda, bio kepenulisan, preferensi genre utama, target kata harian, pencadangan & pemulihan seluruh naskah studio (Ekspor & Impor JSON), serta sesi akun melalui menu Profil Penulis di pojok kanan atas.',
    targetSelector: '[data-tour="author-profile"]',
    icon: <UserCheck className="w-4 h-4 text-[#D4AF37]" />,
  },
  {
    id: 23,
    title: 'Pusat Bantuan & Panduan Studio',
    subtitle: 'Akses Panduan Kapan Saja',
    message:
      'Butuh menyegarkan kembali pemahaman fitur studio? Anda dapat membuka kembali seluruh panduan interaktif langkah demi langkah ini kapan saja dengan menekan tombol Panduan Studio.',
    targetSelector: '[data-tour="writing-guide"]',
    icon: <HelpCircle className="w-4 h-4 text-[#D4AF37]" />,
  },
  {
    id: 24,
    title: 'Siap Menulis Mahakarya!',
    subtitle: 'Langkah Awal Menuju Publikasi Cerita',
    message:
      'Kini Anda telah memahami seluruh fitur andalan Novel’s Creator. Wujudkan imajinasi dan dunia ceritamu menjadi karya nyata. Panduan ini selalu siap dibuka kembali melalui tombol "Panduan Studio" di bilah atas. Selamat berkarya!',
    icon: <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />,
  },
];

export const VisualNovelTutorial: React.FC<VisualNovelTutorialProps> = ({
  isOpen,
  onClose,
  onComplete,
  onNavigate,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);

  const step = TUTORIAL_STEPS[currentStepIndex];
  const isFinalStep = currentStepIndex === TUTORIAL_STEPS.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // Update target bounding rect dynamically
  const updateTargetRect = useCallback(() => {
    if (!isOpen || !step.targetSelector) {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(step.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [isOpen, step.targetSelector]);

  // Navigate view and scroll to target when step changes
  useEffect(() => {
    if (!isOpen) return;

    if (step.requiredView && onNavigate) {
      onNavigate(step.requiredView);
    }

    // Allow DOM to settle before measuring
    const timeout = setTimeout(() => {
      if (step.targetSelector) {
        const el = document.querySelector(step.targetSelector);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      updateTargetRect();
    }, 150);

    return () => clearTimeout(timeout);
  }, [currentStepIndex, isOpen, step, onNavigate, updateTargetRect]);

  // Continuously monitor target position on scroll or resize
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updateTargetRect();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    const interval = setInterval(updateTargetRect, 500);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      clearInterval(interval);
    };
  }, [isOpen, updateTargetRect]);

  // Typewriter effect
  useEffect(() => {
    if (!isOpen) return;

    setDisplayedText('');
    setIsTypingComplete(false);

    let charIdx = 0;
    const fullText = step.message;

    const timer = setInterval(() => {
      if (charIdx <= fullText.length) {
        setDisplayedText(fullText.slice(0, charIdx));
        charIdx++;
      } else {
        setIsTypingComplete(true);
        clearInterval(timer);
      }
    }, 14);

    return () => clearInterval(timer);
  }, [currentStepIndex, isOpen, step.message]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (!isTypingComplete) {
      setDisplayedText(step.message);
      setIsTypingComplete(true);
      return;
    }

    if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
    onClose();
  };

  const handleReplay = () => {
    setCurrentStepIndex(0);
  };

  const handleFinish = () => {
    onComplete();
    onClose();
  };

  return (
    <div
      id="visual-novel-tutorial-container"
      className="fixed inset-0 z-50 overflow-hidden select-none"
    >
      {/* 1. SEMI-TRANSPARENT DARK OVERLAY WITH SPOTLIGHT PUNCH-OUT */}
      {targetRect ? (
        <svg
          className="fixed inset-0 w-full h-full pointer-events-none z-40 transition-all duration-300"
          style={{ width: '100vw', height: '100vh' }}
        >
          <defs>
            <mask id="spotlight-mask">
              {/* White background reveals the dark overlay */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {/* Black rounded rectangle punches out the spotlight hole */}
              <rect
                x={Math.max(0, targetRect.left - 10)}
                y={Math.max(0, targetRect.top - 10)}
                width={targetRect.width + 20}
                height={targetRect.height + 20}
                rx="16"
                ry="16"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(10, 10, 18, 0.78)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      ) : (
        <div className="fixed inset-0 bg-[#0A0A12]/80 backdrop-blur-[2px] pointer-events-none z-40 transition-opacity duration-300" />
      )}

      {/* 2. SPOTLIGHT HIGHLIGHT BORDER & DIRECTIONAL ARROW */}
      {targetRect && (
        <div
          className="fixed pointer-events-none z-40 transition-all duration-300"
          style={{
            top: Math.max(0, targetRect.top - 10),
            left: Math.max(0, targetRect.left - 10),
            width: targetRect.width + 20,
            height: targetRect.height + 20,
          }}
        >
          {/* Animated Gold Ring */}
          <div className="w-full h-full rounded-2xl border-2 border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.45)] animate-pulse" />

          {/* Directional Indicator Badge */}
          <div className="absolute -top-7 left-3 bg-[#D4AF37] text-[#121212] font-black text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#121212] animate-ping" />
            <span>Target Aktif</span>
          </div>
        </div>
      )}

      {/* 3. WIDE VISUAL NOVEL BOTTOM DIALOGUE BAR */}
      <div
        className="fixed inset-x-3 sm:inset-x-6 md:inset-x-12 lg:inset-x-16 bottom-3 sm:bottom-6 z-50 flex flex-col max-w-6xl mx-auto pointer-events-auto transition-all duration-300"
      >
        {/* WIDE DIALOGUE BOX SPANNING ACROSS THE BOTTOM */}
        <div
          id="tutorial-dialogue-box"
          className="w-full bg-[#141422]/95 backdrop-blur-2xl border-2 border-[#D4AF37]/70 rounded-3xl p-5 sm:p-7 md:px-8 shadow-[0_15px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(212,175,55,0.2)] flex flex-col justify-between relative overflow-hidden group"
        >
          {/* Gold Decorative Corner Lines */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#D4AF37]/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#D4AF37]/10 to-transparent pointer-events-none" />

          {/* Top Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
            <div
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#FAF7EE] transition-all duration-300"
              style={{
                width: `${((currentStepIndex + 1) / TUTORIAL_STEPS.length) * 100}%`,
              }}
            />
          </div>

          {/* Top Header Row: Speaker Label & Step Progress */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 relative z-10">
            {/* Mascot Speaker Name Tag Badge */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-[#D4AF37] to-[#B89225] text-[#121212] px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] rounded-full shadow-[0_2px_12px_rgba(212,175,55,0.4)] flex items-center gap-1.5">
                <Glasses className="w-3.5 h-3.5" />
                <span>Suhail • Pemandu Studio</span>
              </div>
              <span className="text-xs text-[#A0A0B8] hidden sm:inline font-mono">
                {step.subtitle}
              </span>
            </div>

            {/* Step Counter Indicator */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#D4AF37] px-3 py-1 bg-[#1E1E30] rounded-lg border border-[#D4AF37]/30">
                {currentStepIndex + 1} / {TUTORIAL_STEPS.length}
              </span>
              <button
                id="btn-tutorial-skip-x"
                onClick={handleSkip}
                className="text-[#8E8EA4] hover:text-[#FAF7EE] p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                title="Lewati Tutorial"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dialogue Text Content with Typewriter Effect */}
          <div
            onClick={() => {
              if (!isTypingComplete) {
                setDisplayedText(step.message);
                setIsTypingComplete(true);
              }
            }}
            className="cursor-pointer min-h-[85px] sm:min-h-[95px] flex flex-col justify-center py-1 relative z-10"
          >
            <div className="flex items-center gap-2 mb-2">
              {step.icon}
              <h4 className="font-serif text-lg sm:text-2xl font-bold text-[#FAF7EE] tracking-tight">
                {step.title}
              </h4>
            </div>

            <p className="font-sans text-sm sm:text-base md:text-lg text-[#FAF7EE]/95 leading-relaxed antialiased font-normal">
              "{displayedText}"
              {!isTypingComplete && (
                <span className="inline-block w-2 h-4 bg-[#D4AF37] ml-1.5 animate-pulse" />
              )}
            </p>

            {!isTypingComplete && (
              <span className="text-[9px] font-mono text-[#D4AF37]/70 uppercase tracking-widest mt-2 self-end">
                Klik untuk menampilkan semua ↵
              </span>
            )}
          </div>

          {/* Bottom Action Controls: Back | Next | Skip */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 mt-2 border-t border-white/10 relative z-10">
            {/* Left: Back Button or Replay on completion */}
            <div className="flex items-center gap-3">
              {!isFirstStep && (
                <button
                  id="btn-tutorial-back"
                  type="button"
                  onClick={handlePrev}
                  className="py-2.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-[#C8C8DC] hover:text-white border border-white/10 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>
              )}

              {isFinalStep && (
                <button
                  id="btn-tutorial-replay"
                  type="button"
                  onClick={handleReplay}
                  className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ulangi Panduan</span>
                </button>
              )}

              {/* Skip Tutorial Button */}
              {!isFinalStep && (
                <button
                  id="btn-tutorial-skip"
                  type="button"
                  onClick={handleSkip}
                  className="py-2 px-3 text-[#8E8EA4] hover:text-[#FAF7EE] text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                >
                  Lewati Tutorial
                </button>
              )}
            </div>

            {/* Right: Primary Action Button (Next / Start Writing) */}
            <div className="flex items-center gap-3 justify-end">
              {isFinalStep && (
                <label className="flex items-center gap-1.5 text-xs text-[#A6A6BC] mr-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={doNotShowAgain}
                    onChange={(e) => setDoNotShowAgain(e.target.checked)}
                    className="rounded border-[#2A2A3C] text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  <span>Jangan Tampilkan Lagi</span>
                </label>
              )}

              <button
                id="btn-tutorial-next"
                type="button"
                onClick={handleNext}
                className="py-3 px-8 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89225] hover:from-[#E4BF47] hover:to-[#CA9F2A] text-[#121212] font-black text-xs sm:text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(212,175,55,0.35)] transition-all cursor-pointer whitespace-nowrap"
              >
                <span>
                  {isFirstStep
                    ? 'Mulai Tutorial'
                    : isFinalStep
                    ? 'Mulai Menulis'
                    : isTypingComplete
                    ? 'Lanjut'
                    : 'Tampilkan Lengkap'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
