import React, { useState, useEffect } from 'react';
import {
  AppView,
  Book,
  Chapter,
  CharacterWiki,
  QuickNote,
} from './types';

// Context (REST API Backend)
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BookProvider, useBooks } from './contexts/BookContext';
import {
  ChapterProvider,
  useChapters,
} from "./contexts/ChapterContext";

// Local Storage Fallback untuk data pendukung
import {
  getCharacters,
  saveCharacter,
  deleteCharacter,
  getQuickNotes,
  saveQuickNote,
  deleteQuickNote,
  getCustomGenres,
  saveCustomGenre,
  purgeTutorialDummyData,
} from './lib/storage';

import {
  TUTORIAL_DUMMY_BOOKS,
  TUTORIAL_DUMMY_CHAPTERS,
  TUTORIAL_DUMMY_CHARACTERS,
  TUTORIAL_DUMMY_QUICK_NOTES,
  TUTORIAL_DUMMY_BOOK_ID,
  TUTORIAL_DUMMY_CHAPTER_1_ID,
} from './lib/tutorialDummyData';

// Components
import { SplashScreen } from './components/splash/SplashScreen';
import { UnifiedAuthCard } from './components/auth/UnifiedAuthCard';
import { VisualNovelTutorial } from './components/tutorial/VisualNovelTutorial';
import { ProfileSettingsModal } from './components/profile/ProfileSettingsModal';
import { Navbar } from './components/common/Navbar';
import { WorkspaceView } from './components/workspace/WorkspaceView';
import { CharacterWikiView } from './components/character/CharacterWikiView';
import { NovelEditorView } from './components/editor/NovelEditorView';
import { QuickNotesDrawer } from './components/notes/QuickNotesDrawer';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';

function MainAppContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const { books: contextBooks, addBook, editBook, removeBook, refreshBooks } = useBooks();
  const { chapters, refreshChapters, addChapter, editChapter, removeChapter } = useChapters();

  const [appStage, setAppStage] = useState<'splash' | 'auth' | 'app'>('splash');
  const [currentView, setCurrentView] = useState<AppView>('workspace');

  // Local state pendukung
  const [characters, setCharacters] = useState<CharacterWiki[]>([]);
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
  const [customGenres, setCustomGenres] = useState<string[]>([]);

  // Navigation targets
  const [targetBookId, setTargetBookId] = useState<string | null>(null);
  const [targetChapterId, setTargetChapterId] = useState<string | null>(null);

  // Modals
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickNotesOpen, setIsQuickNotesOpen] = useState(false);

  // Normalisasi data books agar aman dan tidak undefined di WorkspaceView
  const books: Book[] = (contextBooks || []).map((b: any) => ({
    ...b,
    targetWordCount: b.targetWordCount || b.target_word_count || 50000,
    currentWordCount: b.currentWordCount || b.current_word_count || 0,
    genres: b.genres || (b.genre ? [b.genre] : []),
    chapters: b.chapters || [],
  }));

  const refreshLocalData = () => {
    setCharacters(getCharacters());
    setQuickNotes(getQuickNotes());
    setCustomGenres(getCustomGenres());
  };

  useEffect(() => {
    if (
      isAuthenticated &&
      contextBooks.length > 0
    ) {
      const bookId =
        targetBookId ||
        contextBooks[0]?.id;

      if (bookId) {
        refreshChapters(bookId);
      }
    }
  }, [
    isAuthenticated,
    targetBookId,
    contextBooks,
  ]);

  const handleSplashFinish = () => {
    if (isAuthenticated) {
      setAppStage('app');
    } else {
      setAppStage('auth');
    }
  };

  const handleAuthSuccess = () => {
    setAppStage('app');
    refreshBooks();
  };

  const handleCloseTutorial = () => {
    setIsTutorialOpen(false);
    purgeTutorialDummyData();
    if (targetBookId && (targetBookId.startsWith('tut-dummy') || targetBookId === TUTORIAL_DUMMY_BOOK_ID)) {
      setTargetBookId(null);
    }
    if (targetChapterId && (targetChapterId.startsWith('tut-dummy') || targetChapterId === TUTORIAL_DUMMY_CHAPTER_1_ID)) {
      setTargetChapterId(null);
    }
    refreshLocalData();
  };

  const handleTutorialComplete = () => {
    handleCloseTutorial();
  };

  const handleLogout = () => {
    logout();
    setAppStage('auth');
  };

  // Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsQuickNotesOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handler Simpan Buku Murni REST API
  const handleSaveBook = async (book: Book) => {
    const targetWords = book.targetWordCount || (book as any).target_word_count || 50000;

    if (book.id) {
      // Jika ada ID (UUID dari PostgreSQL), lakukan UPDATE (PUT)
      await editBook(book.id, {
        title: book.title,
        synopsis: book.synopsis,
        targetWordCount: Number(targetWords),
        status: book.status,
      });
    } else {
      // Jika belum ada ID, buat BUKU BARU (POST)
      await addBook({
        title: book.title,
        synopsis: book.synopsis,
        targetWordCount: Number(targetWords),
        status: book.status || 'draft',
      });
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (bookId) {
      await removeBook(bookId);
    }
  };

  const handleSaveChapter = async (
    chapter: Chapter
  ) => {
    try {
      await editChapter(
        chapter.bookId,
        chapter.id,
        {
          chapterNumber: chapter.chapterNumber,
          title: chapter.title,
          content: chapter.content,
          wordCount: chapter.wordCount,
          characterCount: chapter.characterCount,
          status: chapter.status,
          sortOrder: chapter.order,
        }
      );
    } catch (error) {
      console.error(
        "Gagal menyimpan chapter:",
        error
      );
      throw error;
    }
  };

  const handleDeleteChapter = async (
    chapterId: string
  ) => {
    const chapter =
      chapters.find(
        (item) => item.id === chapterId
      );

    if (!chapter) {
      return;
    }

    try {
      await removeChapter(
        chapter.bookId,
        chapterId
      );
    } catch (error) {
      console.error(
        "Gagal menghapus chapter:",
        error
      );
      throw error;
    }
  };

  const handleSaveCharacter = (char: CharacterWiki) => {
    saveCharacter(char);
    setCharacters(getCharacters());
  };

  const handleDeleteCharacter = (characterId: string) => {
    deleteCharacter(characterId);
    setCharacters(getCharacters());
  };

  const handleSaveQuickNote = (note: QuickNote) => {
    saveQuickNote(note);
    setQuickNotes(getQuickNotes());
  };

  const handleDeleteQuickNote = (noteId: string) => {
    deleteQuickNote(noteId);
    setQuickNotes(getQuickNotes());
  };

  const handleAddCustomGenre = (genre: string) => {
    saveCustomGenre(genre);
    setCustomGenres(getCustomGenres());
  };

  const handleOpenEditor = (bookId: string, chapterId?: string) => {
    setTargetBookId(bookId);
    if (chapterId) {
      setTargetChapterId(chapterId);
    }
    setCurrentView('editor');
  };

  const isDummyActive = isTutorialOpen;
  const displayBooks = isDummyActive && books.length === 0 ? TUTORIAL_DUMMY_BOOKS : books;
  const displayChapters = isDummyActive && chapters.length === 0 ? TUTORIAL_DUMMY_CHAPTERS : chapters;
  const displayCharacters = isDummyActive && characters.length === 0 ? TUTORIAL_DUMMY_CHARACTERS : characters;
  const displayQuickNotes = isDummyActive && quickNotes.length === 0 ? TUTORIAL_DUMMY_QUICK_NOTES : quickNotes;

  const activeEditorBookId =
    targetBookId || (isDummyActive && displayBooks.length > 0 ? displayBooks[0].id : null);
  const activeEditorChapterId =
    targetChapterId ||
    (isDummyActive && displayChapters.length > 0
      ? displayChapters.find((c) => c.bookId === activeEditorBookId)?.id || displayChapters[0]?.id
      : null);

  if (appStage === 'splash') {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (appStage === 'auth' || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <UnifiedAuthCard onAuthSuccess={handleAuthSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] flex flex-col font-sans selection:bg-[#D4AF37]/25 selection:text-[#FAF7EE]">
      <Navbar
        currentView={currentView}
        userProfile={user as any}
        notesCount={displayQuickNotes.length}
        onNavigate={(view) => setCurrentView(view)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleNotes={() => setIsQuickNotesOpen(!isQuickNotesOpen)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenProfileSettings={() => setIsProfileSettingsOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentView === 'workspace' && (
          <WorkspaceView
            books={displayBooks}
            chapters={displayChapters}
            customGenres={customGenres}
            userProfile={user as any}
            onSaveBook={handleSaveBook}
            onDeleteBook={handleDeleteBook}
            onSaveChapter={handleSaveChapter}
            onDeleteChapter={handleDeleteChapter}
            onAddCustomGenre={handleAddCustomGenre}
            onOpenEditor={handleOpenEditor}
            onOpenCharactersWiki={() => setCurrentView('characters')}
          />
        )}

        {currentView === 'characters' && (
          <CharacterWikiView
            characters={displayCharacters}
            books={displayBooks}
            onSaveCharacter={handleSaveCharacter}
            onDeleteCharacter={handleDeleteCharacter}
          />
        )}

        {currentView === 'editor' && (
          <NovelEditorView
            books={displayBooks}
            chapters={displayChapters}
            initialBookId={activeEditorBookId}
            initialChapterId={activeEditorChapterId}
            userProfile={user as any}
            onSaveChapter={handleSaveChapter}
            onSelectBook={(bookId) => {
              setTargetBookId(bookId);
              setCurrentView('workspace');
            }}
          />
        )}
      </main>

      <footer className="h-10 bg-[#1E1E2E] border-t border-[#2A2A3C] flex items-center justify-between px-4 sm:px-8 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[#D4AF37]">Status: Sistem Aktif</span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span className="hidden sm:inline">
            Database: Karakter ({displayCharacters.length}) | Cerita ({displayBooks.length})
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono">
          <span className="hidden sm:inline text-white/40">Storage: REST API & PostgreSQL</span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span className="text-[#D4AF37]/80">V 1.0.0 Stable</span>
        </div>
      </footer>

      <QuickNotesDrawer
        isOpen={isQuickNotesOpen}
        notes={displayQuickNotes}
        onClose={() => setIsQuickNotesOpen(false)}
        onSaveNote={handleSaveQuickNote}
        onDeleteNote={handleDeleteQuickNote}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        books={displayBooks}
        chapters={displayChapters}
        characters={displayCharacters}
        notes={displayQuickNotes}
        onClose={() => setIsSearchOpen(false)}
        onSelectBook={(bId) => {
          setTargetBookId(bId);
          setCurrentView('workspace');
        }}
        onSelectChapter={(bId, cId) => {
          setTargetBookId(bId);
          setTargetChapterId(cId);
          setCurrentView('editor');
        }}
        onSelectCharacter={() => {
          setCurrentView('characters');
        }}
      />

      <VisualNovelTutorial
        isOpen={isTutorialOpen}
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onClose={handleCloseTutorial}
        onComplete={handleTutorialComplete}
      />

      <ProfileSettingsModal
        isOpen={isProfileSettingsOpen}
        userProfile={user as any}
        onClose={() => setIsProfileSettingsOpen(false)}
        onSaveProfile={() => { }}
        onDataRestored={refreshBooks}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BookProvider>
        <ChapterProvider>
          <MainAppContent />
        </ChapterProvider>
      </BookProvider>
    </AuthProvider>
  );
}