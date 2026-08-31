import React, { useState, useEffect, useCallback } from 'react';
import {
  AppView,
  UserAuthorProfile,
  Book,
  Chapter,
  CharacterWiki,
  QuickNote,
} from './types';
import {
  getUserProfile,
  saveUserProfile,
  clearAuthSession,
  getBooks,
  saveBook,
  deleteBook,
  getChapters,
  saveChapter,
  deleteChapter,
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

export default function App() {
  // Application Stage Flow
  const [appStage, setAppStage] = useState<'splash' | 'auth' | 'app'>('splash');
  const [currentView, setCurrentView] = useState<AppView>('workspace');

  // Core Data Collections (Starts completely empty if new session - STRICT ZERO HARDCODED DUMMY DATA)
  const [userProfile, setUserProfile] = useState<UserAuthorProfile | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [characters, setCharacters] = useState<CharacterWiki[]>([]);
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
  const [customGenres, setCustomGenres] = useState<string[]>([]);

  // Navigation targets for editor
  const [targetBookId, setTargetBookId] = useState<string | null>(null);
  const [targetChapterId, setTargetChapterId] = useState<string | null>(null);

  // Overlay / Modal states
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickNotesOpen, setIsQuickNotesOpen] = useState(false);

  // Reload all storage data
  const refreshStorageData = useCallback(() => {
    const profile = getUserProfile();
    setUserProfile(profile);
    setBooks(getBooks());
    setChapters(getChapters());
    setCharacters(getCharacters());
    setQuickNotes(getQuickNotes());
    setCustomGenres(getCustomGenres());
  }, []);

  // Initial load
  useEffect(() => {
    refreshStorageData();
  }, [refreshStorageData]);

  // Handle Splash Screen Completion
  const handleSplashFinish = () => {
    const profile = getUserProfile();
    if (profile && profile.isAuthenticated) {
      setAppStage('app');
    } else {
      setAppStage('auth');
    }
  };

  // Handle Auth Login / Registration Success
  const handleAuthSuccess = (profile: UserAuthorProfile) => {
    setUserProfile(profile);
    setAppStage('app');
    refreshStorageData();

    // If first time login, launch Tutorial
    if (!profile.hasCompletedTutorial) {
      setIsTutorialOpen(true);
    }
  };

  // Handle Tutorial Close (Clean up dummy data immediately)
  const handleCloseTutorial = () => {
    setIsTutorialOpen(false);
    purgeTutorialDummyData();
    if (targetBookId && (targetBookId.startsWith('tut-dummy') || targetBookId === TUTORIAL_DUMMY_BOOK_ID)) {
      setTargetBookId(null);
    }
    if (targetChapterId && (targetChapterId.startsWith('tut-dummy') || targetChapterId === TUTORIAL_DUMMY_CHAPTER_1_ID)) {
      setTargetChapterId(null);
    }
    refreshStorageData();
  };

  // Handle Tutorial Completion
  const handleTutorialComplete = () => {
    handleCloseTutorial();
    if (userProfile) {
      const updated = { ...userProfile, hasCompletedTutorial: true };
      saveUserProfile(updated);
      setUserProfile(updated);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    clearAuthSession();
    setUserProfile(null);
    setAppStage('auth');
  };

  // Keyboard Shortcuts (Ctrl+K = Search, Ctrl+M = Quick Notes)
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

  // Data Actions with state sync
  const handleSaveBook = (book: Book) => {
    saveBook(book);
    setBooks(getBooks());
  };

  const handleDeleteBook = (bookId: string) => {
    deleteBook(bookId);
    setBooks(getBooks());
    setChapters(getChapters());
  };

  const handleSaveChapter = (chapter: Chapter) => {
    saveChapter(chapter);
    setChapters(getChapters());
    setBooks(getBooks()); // Updates total words count
  };

  const handleDeleteChapter = (chapterId: string) => {
    deleteChapter(chapterId);
    setChapters(getChapters());
    setBooks(getBooks());
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

  // Active Data Sets (Injects rich dummy data during tutorial so all tour spotlights/elements render and focus properly; purges immediately upon tutorial close/complete)
  const isDummyActive = isTutorialOpen;
  const displayBooks = isDummyActive && books.length === 0 ? TUTORIAL_DUMMY_BOOKS : books;
  const displayChapters = isDummyActive && chapters.length === 0 ? TUTORIAL_DUMMY_CHAPTERS : chapters;
  const displayCharacters = isDummyActive && characters.length === 0 ? TUTORIAL_DUMMY_CHARACTERS : characters;
  const displayQuickNotes = isDummyActive && quickNotes.length === 0 ? TUTORIAL_DUMMY_QUICK_NOTES : quickNotes;

  // Editor selected book & chapter target
  const activeEditorBookId =
    targetBookId || (isDummyActive && displayBooks.length > 0 ? displayBooks[0].id : null);
  const activeEditorChapterId =
    targetChapterId ||
    (isDummyActive && displayChapters.length > 0
      ? displayChapters.find((c) => c.bookId === activeEditorBookId)?.id || displayChapters[0]?.id
      : null);

  // 1. SPLASH SCREEN STAGE
  if (appStage === 'splash') {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // 2. AUTHENTICATION STAGE
  if (appStage === 'auth') {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <UnifiedAuthCard onAuthSuccess={handleAuthSuccess} />
      </div>
    );
  }

  // 3. MAIN DASHBOARD APPLICATION STAGE
  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] flex flex-col font-sans selection:bg-[#D4AF37]/25 selection:text-[#FAF7EE]">
      {/* Top Editorial Navbar */}
      <Navbar
        currentView={currentView}
        userProfile={userProfile}
        notesCount={displayQuickNotes.length}
        onNavigate={(view) => setCurrentView(view)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleNotes={() => setIsQuickNotesOpen(!isQuickNotesOpen)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenProfileSettings={() => setIsProfileSettingsOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Workspace / View Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentView === 'workspace' && (
          <WorkspaceView
            books={displayBooks}
            chapters={displayChapters}
            customGenres={customGenres}
            userProfile={userProfile}
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
            userProfile={userProfile}
            onSaveChapter={handleSaveChapter}
            onSelectBook={(bookId) => {
              setTargetBookId(bookId);
              setCurrentView('workspace');
            }}
          />
        )}
      </main>

      {/* Bold Typography Status Footer */}
      <footer className="h-10 bg-[#1E1E2E] border-t border-[#2A2A3C] flex items-center justify-between px-4 sm:px-8 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[#D4AF37]">Status: Sistem Aktif</span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span className="hidden sm:inline">
            Database: Karakter ({displayCharacters.length}) | Cerita ({displayBooks.length})
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono">
          <span className="hidden sm:inline text-white/40">Storage: LocalStorage</span>
          <span className="hidden sm:inline text-white/20">•</span>
          <span className="text-[#D4AF37]/80">V 1.0.0 Stable</span>
        </div>
      </footer>

      {/* Quick Notes Floating Action Button / Drawer */}
      <QuickNotesDrawer
        isOpen={isQuickNotesOpen}
        notes={displayQuickNotes}
        onClose={() => setIsQuickNotesOpen(false)}
        onSaveNote={handleSaveQuickNote}
        onDeleteNote={handleDeleteQuickNote}
      />

      {/* Global Search Modal (Ctrl+K) */}
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

      {/* Visual Novel Interactive Mascot Tutorial */}
      <VisualNovelTutorial
        isOpen={isTutorialOpen}
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onClose={handleCloseTutorial}
        onComplete={handleTutorialComplete}
      />

      {/* Profile & Backup Settings Modal */}
      <ProfileSettingsModal
        isOpen={isProfileSettingsOpen}
        userProfile={userProfile}
        onClose={() => setIsProfileSettingsOpen(false)}
        onSaveProfile={(updated) => {
          saveUserProfile(updated);
          setUserProfile(updated);
        }}
        onDataRestored={refreshStorageData}
      />
    </div>
  );
}
