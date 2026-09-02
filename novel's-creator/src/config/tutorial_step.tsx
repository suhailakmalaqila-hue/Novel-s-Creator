import { AppView } from '../types';
import {
  X,
  Sparkles,
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

export interface StepConfig {
  id: number;
  title: string;
  subtitle: string;
  message: string;
  targetSelector?: string;
  requiredView?: AppView;
  icon: React.ReactNode;
}

export const TUTORIAL_STEPS: StepConfig[] = [
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