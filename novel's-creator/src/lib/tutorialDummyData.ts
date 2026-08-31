import { Book, Chapter, CharacterWiki, QuickNote } from '../types';

export const TUTORIAL_DUMMY_BOOK_ID = 'tut-dummy-book-01';
export const TUTORIAL_DUMMY_CHAPTER_1_ID = 'tut-dummy-chap-01';
export const TUTORIAL_DUMMY_CHAPTER_2_ID = 'tut-dummy-chap-02';

export const TUTORIAL_DUMMY_BOOKS: Book[] = [
  {
    id: TUTORIAL_DUMMY_BOOK_ID,
    title: 'Ksatria Mahkota Surya',
    synopsis:
      'Di sebuah kekaisaran yang terancam oleh bayang-bayang kegelapan kuno, seorang ksatria muda menemukan bahwa pedang warisannya menyimpan rahasia para dewa matahari.',
    coverUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
    genres: ['Fantasi', 'Petualangan', 'Aksi'],
    targetWordCount: 50000,
    currentWordCount: 153,
    status: 'ongoing',
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: 'tut-dummy-book-02',
    title: 'Kronik Lembah Cybernetic',
    synopsis:
      'Tahun 2188 di Neo-Nusantara. Detektif sibernetik memburu hacker misterius yang mampu memanipulasi ingatan manusia.',
    coverUrl:
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
    genres: ['Sci-Fi', 'Misteri', 'Cyberpunk'],
    targetWordCount: 40000,
    currentWordCount: 0,
    status: 'draft',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 7200000,
  },
];

export const TUTORIAL_DUMMY_CHAPTERS: Chapter[] = [
  {
    id: TUTORIAL_DUMMY_CHAPTER_1_ID,
    bookId: TUTORIAL_DUMMY_BOOK_ID,
    chapterNumber: 1,
    title: 'Bab 1: Fajar di Benteng Aethelgard',
    content: `# Bab 1: Fajar di Benteng Aethelgard

Kabut tebal perlahan tersingkap dari puncak menara Benteng Aethelgard. Suara denting pedang para prajurit terdengar bersahut-sahutan di pelataran barat, memecah kesunyian fajar yang dingin.

Aria menatap ke ufuk timur, di mana mentari pertama menyinari lambang matahari terbit pada perisai bajanya.

— "Pedang ini tidak akan terhunus sia-sia," bisik Aria dalam hati.

Di sampingnya, Valen melangkah mendekat dengan jubah gelapnya yang berkibar pelan ditiup angin lembah. Tatapan matanya tajam, mengamati perbatasan benteng yang mulai dipenuhi kabut kehitaman.

— "Pertempuran sesungguhnya baru saja dimulai, Aria," ujar Valen dengan nada dingin. "Jangan biarkan keraguan memperlambat langkahmu."

* * *

Aria mengangguk pelan. Ia menarik napas panjang, merasakan aliran energi sihir matahari yang berdenyut di sepanjang urat nadinya. Hari ini, takdir seluruh benua akan ditentukan.`,
    wordCount: 142,
    characterCount: 885,
    status: 'draft',
    order: 1,
    lastSavedAt: Date.now() - 1800000,
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    id: TUTORIAL_DUMMY_CHAPTER_2_ID,
    bookId: TUTORIAL_DUMMY_BOOK_ID,
    chapterNumber: 2,
    title: 'Bab 2: Gerbang Kabut Hitam',
    content: `# Bab 2: Gerbang Kabut Hitam\n\nLangkah kaki mereka bergema di lorong batu kuno...`,
    wordCount: 11,
    characterCount: 65,
    status: 'draft',
    order: 2,
    lastSavedAt: Date.now() - 900000,
    createdAt: Date.now() - 86400000 * 2,
  },
];

export const TUTORIAL_DUMMY_CHARACTERS: CharacterWiki[] = [
  {
    id: 'tut-dummy-char-01',
    fullName: 'Aria Pendragon',
    alias: 'Ksatria Surya Terpilih',
    age: '21 Tahun',
    gender: 'Perempuan',
    roleTag: 'Protagonis',
    status: 'Hidup',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    physicalAppearance: 'Rambut pirang keemasan sebahu, mengenakan zirah pelat baja perak berukir matahari suci.',
    personalityTraits: 'Berjiwa ksatria, pantang menyerah, setia kawan, dan memiliki rasa keadilan yang tinggi.',
    backstory:
      'Tumbuh di biara matahari kuno setelah desa kelahirannya diserang pasukan bayangan sepuluh tahun silam.',
    motivation: 'Mengembalikan kedamaian kerajaan dan membuktikan warisan sejati pedang Surya.',
    worldGoal: 'Menutup retakan dimensi kegelapan di Benua Aethelgard.',
    customAttributes: [
      { id: 'attr-1', key: 'Kekuatan Pedang', value: 'Level 94 / 100' },
      { id: 'attr-2', key: 'Afinitas Sihir', value: 'Cahaya Suci (Kudus)' },
      { id: 'attr-3', key: 'Fraksi', value: 'Ordo Penjaga Surya' },
    ],
    relationships: [
      {
        id: 'rel-1',
        targetCharacterId: 'tut-dummy-char-02',
        relationType: 'Rivalitas Takdir',
        description: 'Mantan rekan seperguruan yang kini memilih jalan kegelapan.',
      },
    ],
    bookIds: [TUTORIAL_DUMMY_BOOK_ID],
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: 'tut-dummy-char-02',
    fullName: 'Valen Ashford',
    alias: 'Pangeran Bayangan Raven',
    age: '23 Tahun',
    gender: 'Laki-laki',
    roleTag: 'Rival',
    status: 'Hidup',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    physicalAppearance: 'Jubah hitam kelam dengan sulaman perak, pedang tipis bermata dua.',
    personalityTraits: 'Dingin, penuh perhitungan taktis, namun memegang teguh kehormatannya.',
    backstory: 'Bangsawan terbuang yang mempelajari rahasia sihir bayangan terlarang.',
    motivation: 'Membongkar konspirasi busuk dewan bangsawan tinggi kekaisaran.',
    worldGoal: 'Menciptakan tatanan dunia baru yang tidak dikuasai dogma munafik.',
    customAttributes: [
      { id: 'attr-4', key: 'Sihir Bayangan', value: 'Tingkat Mahir IX' },
      { id: 'attr-5', key: 'Kecerdasan Taktis', value: 'Jenius Strategi' },
    ],
    relationships: [
      {
        id: 'rel-2',
        targetCharacterId: 'tut-dummy-char-01',
        relationType: 'Rivalitas Takdir',
        description: 'Menganggap Aria sebagai satu-satunya lawan yang sepadan.',
      },
    ],
    bookIds: [TUTORIAL_DUMMY_BOOK_ID],
    createdAt: Date.now() - 86400000 * 6,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: 'tut-dummy-char-03',
    fullName: 'Master Sylvia Ravencrest',
    alias: 'Sang Penjaga Lore Arkana',
    age: '54 Tahun',
    gender: 'Perempuan',
    roleTag: 'Mentor',
    status: 'Hidup',
    avatarUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
    physicalAppearance: 'Tongkat kristal arkana bercahaya biru redup, jubah ungu tua bertabur bintang.',
    personalityTraits: 'Bijaksana, tenang, penuh teka-teki, dan mengayomi.',
    backstory: 'Pustakawan agung yang telah menjaga naskah kuno selama empat dekade.',
    motivation: 'Membimbing generasi baru ksatria menghadapi ramalan gerhana besar.',
    worldGoal: 'Menyelamatkan seluruh catatan peradaban dari kepunahan total.',
    customAttributes: [
      { id: 'attr-6', key: 'Pengetahuan Arkana', value: 'Ensiklopedia Hidup' },
    ],
    relationships: [],
    bookIds: [TUTORIAL_DUMMY_BOOK_ID],
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 3600000,
  },
];

export const TUTORIAL_DUMMY_QUICK_NOTES: QuickNote[] = [
  {
    id: 'tut-dummy-note-01',
    title: 'Plot Twist Bab 5: Ramalan Gerhana',
    content:
      'Ternyata pedang surya dan segel bayangan harus disatukan pada malam gerhana untuk membuka gerbang dimensi kuno.',
    category: 'Plot Hole',
    colorTag: '#D4AF37',
    isPinned: true,
    bookId: TUTORIAL_DUMMY_BOOK_ID,
    createdAt: Date.now() - 172800000,
    updatedAt: Date.now() - 86400000,
  },
];
