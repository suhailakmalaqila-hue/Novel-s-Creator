import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Book, Chapter, ChapterSnapshot, SaveStatus, UserAuthorProfile } from '../../types';
import {
  countWords,
  countCharacters,
  saveSnapshot,
  getSnapshots,
} from '../../lib/storage';
import {
  Save,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Minus,
  Maximize2,
  Minimize2,
  History,
  Download,
  BookOpen,
  FileText,
  Sparkles,
  ChevronDown,
  Clock,
  Target,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  X,
} from 'lucide-react';

interface NovelEditorViewProps {
  books: Book[];
  chapters: Chapter[];
  initialBookId?: string | null;
  initialChapterId?: string | null;
  userProfile: UserAuthorProfile | null;
  onSaveChapter: (chapter: Chapter) => void;
  onSelectBook: (bookId: string) => void;
}

export const NovelEditorView: React.FC<NovelEditorViewProps> = ({
  books,
  chapters,
  initialBookId,
  initialChapterId,
  userProfile,
  onSaveChapter,
  onSelectBook,
}) => {
  // Current Book & Chapter Selection
  const [selectedBookId, setSelectedBookId] = useState<string>(
    initialBookId || (books.length > 0 ? books[0].id : '')
  );

  const availableChapters = chapters.filter((c) => c.bookId === selectedBookId);

  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    initialChapterId ||
      (availableChapters.length > 0 ? availableChapters[0].id : '')
  );

  const activeChapter =
    chapters.find((c) => c.id === selectedChapterId) || null;

  // Editor content states
  const [content, setContent] = useState(activeChapter?.content || '');
  const [chapterTitle, setChapterTitle] = useState(activeChapter?.title || '');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Tersimpan');

  // Distraction-free Focus Mode
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Typography styles
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [fontSize, setFontSize] = useState<number>(18);
  const [lineSpacing, setLineSpacing] = useState<number>(1.8);

  // History & Emergency Snapshots Drawer
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [snapshots, setSnapshots] = useState<ChapterSnapshot[]>([]);

  // Textarea Ref & Auto-save timeout
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update content when active chapter changes
  useEffect(() => {
    if (activeChapter) {
      setContent(activeChapter.content || '');
      setChapterTitle(activeChapter.title || '');
      setSaveStatus('saved');
      setLastSavedTime(
        activeChapter.lastSavedAt
          ? new Date(activeChapter.lastSavedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Tersimpan'
      );
      // Load emergency snapshots
      setSnapshots(getSnapshots(activeChapter.id));
    } else {
      setContent('');
      setChapterTitle('');
    }
  }, [activeChapter?.id]);

  // Keep selectedBookId in sync
  useEffect(() => {
    if (initialBookId && initialBookId !== selectedBookId) {
      setSelectedBookId(initialBookId);
    }
  }, [initialBookId]);

  // Keep selectedChapterId in sync
  useEffect(() => {
    if (initialChapterId && initialChapterId !== selectedChapterId) {
      setSelectedChapterId(initialChapterId);
    }
  }, [initialChapterId]);

  // Word and character counts
  const currentWordCount = countWords(content);
  const currentCharacterCount = countCharacters(content);
  const readingTimeMinutes = Math.max(1, Math.ceil(currentWordCount / 200));

  // Perform Save action
  const performSave = useCallback(
    (manual = false, reason = 'Auto-save draft') => {
      if (!activeChapter) return;

      setSaveStatus('saving');

      try {
        const words = countWords(content);
        const chars = countCharacters(content);

        const updatedChapter: Chapter = {
          ...activeChapter,
          title: chapterTitle.trim() || activeChapter.title,
          content,
          wordCount: words,
          characterCount: chars,
          lastSavedAt: Date.now(),
        };

        onSaveChapter(updatedChapter);

        // Also record an Emergency Draft Snapshot if manual or every significant change
        if (manual || Math.abs(words - (activeChapter.wordCount || 0)) > 20) {
          const snapshot: ChapterSnapshot = {
            id: 'snap_' + Date.now(),
            chapterId: activeChapter.id,
            bookId: activeChapter.bookId,
            chapterTitle: updatedChapter.title,
            content,
            wordCount: words,
            timestamp: Date.now(),
            reason,
          };
          saveSnapshot(snapshot);
          setSnapshots(getSnapshots(activeChapter.id));
        }

        setSaveStatus('saved');
        setLastSavedTime(
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      } catch (err) {
        console.error('Save failed:', err);
        setSaveStatus('error');
      }
    },
    [activeChapter, chapterTitle, content, onSaveChapter]
  );

  // Auto-save debouncing
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    setSaveStatus('unsaved');

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      performSave(false, 'Penyimpanan berkala otomatis');
    }, 1800);
  };

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        performSave(true, 'Disimpan manual (Ctrl+S)');
      }
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [performSave, isFocusMode]);

  // Insert formatting helper
  const insertFormatting = (prefix: string, suffix = '', placeholder = '') => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.substring(start, end) || placeholder;

    const replacement = prefix + selected + suffix;
    const newContent =
      content.substring(0, start) + replacement + content.substring(end);

    setContent(newContent);
    setSaveStatus('unsaved');

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selected.length
      );
    }, 10);
  };

  // Restore snapshot
  const handleRestoreSnapshot = (snap: ChapterSnapshot) => {
    if (
      window.confirm(
        `Pulihkan versi naskah dari ${new Date(
          snap.timestamp
        ).toLocaleString()} (${snap.wordCount} kata)? Draft saat ini akan digantikan.`
      )
    ) {
      setContent(snap.content);
      setChapterTitle(snap.chapterTitle);
      performSave(true, `Dipulihkan dari snapshot (${new Date(snap.timestamp).toLocaleTimeString()})`);
      setIsHistoryDrawerOpen(false);
    }
  };

  // Export functions
  const handleExportText = (format: 'txt' | 'md') => {
    if (!activeChapter) return;
    const ext = format === 'md' ? 'md' : 'txt';
    const textData = `# ${chapterTitle}\n\n${content}`;
    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chapterTitle.replace(/[^a-z0-9]/gi, '_')}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // IF NO BOOKS EXIST AT ALL (STRICT ZERO HARDCODED DUMMY DATA EMPTY STATE)
  if (books.length === 0) {
    return (
      <div
        id="empty-editor-state"
        className="py-16 px-4 text-center border-2 border-dashed border-[#2A2A3C] rounded-3xl bg-[#181826] flex flex-col items-center justify-center max-w-2xl mx-auto shadow-inner"
      >
        <div className="p-4 bg-[#222234] rounded-2xl border border-[#35354C] text-[#D4AF37] mb-4 shadow-lg">
          <BookOpen className="w-10 h-10" />
        </div>
        <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#FAF7EE] mb-2">
          Belum ada proyek buku untuk ditulis.
        </h3>
        <p className="text-xs sm:text-sm text-[#9E9EB2] max-w-md mb-6 leading-relaxed">
          Sebelum menggunakan Studio Editor, buat buku cerita pertamamu di Workspace dan tambahkan bab naskah.
        </p>
        <button
          onClick={() => onSelectBook('')}
          className="py-3 px-6 bg-gradient-to-r from-[#D4AF37] to-[#B89225] hover:from-[#E2BE4B] hover:to-[#C9A332] text-[#121212] font-semibold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>Buka Workspace & Buat Buku</span>
        </button>
      </div>
    );
  }

  // IF BOOK HAS NO CHAPTERS
  if (!activeChapter) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-[#1E1E2E] border border-[#2A2A3C] p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <label className="text-xs text-[#8E8EA4]">Pilih Buku:</label>
            <select
              value={selectedBookId}
              onChange={(e) => {
                setSelectedBookId(e.target.value);
                const firstChap = chapters.find((c) => c.bookId === e.target.value);
                if (firstChap) setSelectedChapterId(firstChap.id);
              }}
              className="px-3 py-1.5 bg-[#161624] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs text-[#FAF7EE] outline-none"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="py-16 text-center border-2 border-dashed border-[#2A2A3C] rounded-3xl bg-[#181826] max-w-2xl mx-auto p-6">
          <FileText className="w-10 h-10 mx-auto mb-3 text-[#D4AF37]/50" />
          <h3 className="font-editorial text-xl font-bold text-[#FAF7EE] mb-2">
            Buku ini belum memiliki bab naskah.
          </h3>
          <p className="text-xs text-[#9E9EB2] mb-6">
            Buka Workspace untuk menambahkan bab baru pada buku ini.
          </p>
          <button
            onClick={() => onSelectBook(selectedBookId)}
            className="py-2.5 px-5 bg-[#D4AF37] text-[#121212] font-semibold text-xs rounded-xl shadow-md cursor-pointer"
          >
            Buka Bab di Workspace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="novel-editor-container"
      className={`flex flex-col transition-all duration-300 ${
        isFocusMode
          ? 'fixed inset-0 z-50 bg-[#121212] p-4 sm:p-8 overflow-y-auto'
          : 'space-y-4'
      }`}
    >
      {/* Top Studio Control Bar */}
      <div className="bg-[#1E1E2E] border border-[#2A2A3C] rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Book & Chapter Switchers */}
        <div className="flex flex-wrap items-center gap-3" data-tour="editor-selector-bar">
          {/* Book Switcher */}
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <select
              value={selectedBookId}
              onChange={(e) => {
                setSelectedBookId(e.target.value);
                const nextChaps = chapters.filter((c) => c.bookId === e.target.value);
                if (nextChaps.length > 0) {
                  setSelectedChapterId(nextChaps[0].id);
                }
              }}
              className="max-w-[180px] sm:max-w-[220px] px-3 py-1.5 bg-[#161624] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs font-semibold text-[#FAF7EE] outline-none truncate cursor-pointer"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>

          {/* Chapter Switcher */}
          {availableChapters.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6E6E85]">/</span>
              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                className="max-w-[180px] sm:max-w-[220px] px-3 py-1.5 bg-[#161624] border border-[#2A2A3C] focus:border-[#D4AF37] rounded-xl text-xs font-semibold text-[#FAF7EE] outline-none truncate cursor-pointer"
              >
                {availableChapters.map((chap) => (
                  <option key={chap.id} value={chap.id}>
                    Bab {chap.chapterNumber}: {chap.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right: Save Status, Word Count & Emergency Draft Actions */}
        <div className="flex flex-wrap items-center gap-3" data-tour="editor-toolbar-actions">
          {/* Save Status Indicator & Manual Save */}
          <div className="flex items-center gap-2" data-tour="editor-save-indicator">
            <div
              id="editor-save-status-pill"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border"
              style={{
                backgroundColor:
                  saveStatus === 'saved'
                    ? 'rgba(16, 185, 129, 0.12)'
                    : saveStatus === 'saving'
                    ? 'rgba(59, 130, 246, 0.12)'
                    : saveStatus === 'unsaved'
                    ? 'rgba(245, 158, 11, 0.12)'
                    : 'rgba(239, 68, 68, 0.12)',
                borderColor:
                  saveStatus === 'saved'
                    ? 'rgba(16, 185, 129, 0.3)'
                    : saveStatus === 'saving'
                    ? 'rgba(59, 130, 246, 0.3)'
                    : saveStatus === 'unsaved'
                    ? 'rgba(245, 158, 11, 0.3)'
                    : 'rgba(239, 68, 68, 0.3)',
                color:
                  saveStatus === 'saved'
                    ? '#34D399'
                    : saveStatus === 'saving'
                    ? '#60A5FA'
                    : saveStatus === 'unsaved'
                    ? '#FBBF24'
                    : '#F87171',
              }}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  saveStatus === 'saving'
                    ? 'animate-ping bg-blue-400'
                    : saveStatus === 'unsaved'
                    ? 'bg-amber-400'
                    : saveStatus === 'saved'
                    ? 'bg-emerald-400'
                    : 'bg-red-400'
                }`}
              />
              <span>
                {saveStatus === 'saved'
                  ? `Tersimpan (${lastSavedTime})`
                  : saveStatus === 'saving'
                  ? 'Menyimpan...'
                  : saveStatus === 'unsaved'
                  ? 'Belum Tersimpan'
                  : 'Gagal Menyimpan'}
              </span>
            </div>

            {/* Quick Manual Save Button */}
            <button
              id="btn-manual-save"
              onClick={() => performSave(true, 'Simpan manual')}
              className="py-1.5 px-3 bg-[#242438] hover:bg-[#30304C] text-[#D4AF37] border border-[#D4AF37]/40 hover:border-[#D4AF37] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Simpan Naskah (Ctrl+S)"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan</span>
            </button>
          </div>

          {/* Emergency Draft History Vault Drawer Button */}
          <button
            id="btn-emergency-draft-history"
            data-tour="editor-history-vault"
            onClick={() => setIsHistoryDrawerOpen(!isHistoryDrawerOpen)}
            className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isHistoryDrawerOpen
                ? 'bg-[#D4AF37] text-[#121212]'
                : 'bg-[#222234] text-[#B0B0C4] hover:text-[#FAF7EE] border border-[#2A2A3C]'
            }`}
            title="Riwayat Draft Darurat & Pemulihan"
          >
            <History className="w-3.5 h-3.5" />
            <span>Draft Darurat ({snapshots.length})</span>
          </button>

          {/* Fullscreen / Focus Mode toggle */}
          <button
            id="btn-toggle-focus-mode"
            data-tour="editor-focus-btn"
            onClick={() => setIsFocusMode(!isFocusMode)}
            className="p-2 bg-[#222234] hover:bg-[#2E2E44] text-[#FAF7EE] rounded-xl text-xs border border-[#2A2A3C] transition-colors cursor-pointer"
            title={isFocusMode ? 'Keluar Mode Fokus (Esc)' : 'Mode Fokus Layar Penuh'}
          >
            {isFocusMode ? <Minimize2 className="w-4 h-4 text-[#D4AF37]" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Real-time Word & Reading Stats Ribbon */}
      <div
        data-tour="editor-stats-ribbon"
        className="bg-[#181826] border border-[#2A2A3C] px-5 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[#8E8EA4]">Jumlah Kata:</span>
            <span className="font-mono font-bold text-[#D4AF37] text-sm">
              {currentWordCount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#8E8EA4]">Karakter:</span>
            <span className="font-mono text-[#FAF7EE]">
              {currentCharacterCount.toLocaleString()}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#8E8EA4]" />
            <span className="text-[#8E8EA4]">Estimasi Baca: ~{readingTimeMinutes} mnt</span>
          </div>
        </div>

        {/* Daily Goal Mini-Progress */}
        <div className="flex items-center gap-3">
          <div className="text-[#8E8EA4]">
            Target Harian:{' '}
            <span className="font-mono text-[#FAF7EE]">
              {userProfile?.dailyWordGoal || 1000} kata
            </span>
          </div>
          <div className="w-24 bg-[#141420] rounded-full h-2 overflow-hidden border border-[#2A2A3C]">
            <div
              className="h-full bg-gradient-to-r from-[#8A1825] to-[#D4AF37] rounded-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  (currentWordCount / (userProfile?.dailyWordGoal || 1000)) * 100
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Rich Text Editor Toolbar */}
      <div
        data-tour="editor-export-tools"
        className="bg-[#1E1E2E] border border-[#2A2A3C] p-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-2"
      >
        {/* Formatting Group */}
        <div className="flex flex-wrap items-center gap-1" data-tour="editor-formatting-tools">
          <button
            type="button"
            onClick={() => insertFormatting('**', '**', 'Teks Tebal')}
            className="p-1.5 hover:bg-[#2A2A3E] text-[#B0B0C4] hover:text-[#FAF7EE] rounded-lg transition-colors cursor-pointer"
            title="Tebal (**teks**)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*', 'Teks Miring')}
            className="p-1.5 hover:bg-[#2A2A3E] text-[#B0B0C4] hover:text-[#FAF7EE] rounded-lg transition-colors cursor-pointer"
            title="Miring (*teks*)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('<u>', '</u>', 'Teks Garis Bawah')}
            className="p-1.5 hover:bg-[#2A2A3E] text-[#B0B0C4] hover:text-[#FAF7EE] rounded-lg transition-colors cursor-pointer"
            title="Garis Bawah"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('~~', '~~', 'Teks Coret')}
            className="p-1.5 hover:bg-[#2A2A3E] text-[#B0B0C4] hover:text-[#FAF7EE] rounded-lg transition-colors cursor-pointer"
            title="Coret (~~teks~~)"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-[#2A2A3C] mx-1" />

          <button
            type="button"
            onClick={() => insertFormatting('# ', '\n', 'Judul Utama')}
            className="p-1.5 hover:bg-[#2A2A3E] text-[#B0B0C4] hover:text-[#FAF7EE] rounded-lg transition-colors cursor-pointer"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('## ', '\n', 'Sub Judul')}
            className="p-1.5 hover:bg-[#2A2A3E] text-[#B0B0C4] hover:text-[#FAF7EE] rounded-lg transition-colors cursor-pointer"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('> ', '\n', 'Kutipan / Monolog batin')}
            className="p-1.5 hover:bg-[#2A2A3E] text-[#B0B0C4] hover:text-[#FAF7EE] rounded-lg transition-colors cursor-pointer"
            title="Kutipan Monolog"
          >
            <Quote className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-[#2A2A3C] mx-1" />

          {/* Dialogue dash & Scene Break Divider */}
          <button
            type="button"
            onClick={() => insertFormatting('— ', '', 'Dialog tokoh...')}
            className="py-1 px-2 hover:bg-[#2A2A3E] text-xs font-mono text-[#D4AF37] rounded-lg transition-colors cursor-pointer"
            title="Garis Dialog Panjang (—)"
          >
            — Dialog
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('\n\n* * *\n\n', '', '')}
            className="py-1 px-2 hover:bg-[#2A2A3E] text-xs font-mono text-[#FAF7EE] rounded-lg transition-colors cursor-pointer"
            title="Pembatas Adegan (* * *)"
          >
            * * * Adegan
          </button>
        </div>

        {/* Font & Export Settings */}
        <div className="flex items-center gap-2" data-tour="editor-typography-group">
          {/* Font Family Selector */}
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value as 'serif' | 'sans' | 'mono')}
            className="px-2.5 py-1 bg-[#161624] border border-[#2A2A3C] rounded-lg text-xs text-[#C8C8DC] outline-none cursor-pointer"
          >
            <option value="serif">Serif (Editorial)</option>
            <option value="sans">Sans-Serif</option>
            <option value="mono">Monospace</option>
          </select>

          {/* Font Size Selector */}
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="px-2 py-1 bg-[#161624] border border-[#2A2A3C] rounded-lg text-xs text-[#C8C8DC] outline-none cursor-pointer font-mono"
          >
            <option value={15}>15px</option>
            <option value={17}>17px</option>
            <option value={18}>18px</option>
            <option value={20}>20px</option>
            <option value={22}>22px</option>
          </select>

          {/* Download Dropdown */}
          <div className="flex items-center gap-1" data-tour="editor-export-btn">
            <button
              onClick={() => handleExportText('txt')}
              className="p-1.5 hover:bg-[#2A2A3E] text-[#B0B0C4] hover:text-[#FAF7EE] rounded-lg text-xs transition-colors cursor-pointer"
              title="Unduh sebagai Naskah .txt"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Writing Stage */}
      <div
        data-tour="editor-canvas-stage"
        className="relative flex flex-col bg-[#1A1A28] border border-[#2A2A3C] rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-2xl min-h-[550px]"
      >
        {/* Chapter Title Field */}
        <input
          id="editor-chapter-title-input"
          type="text"
          value={chapterTitle}
          onChange={(e) => {
            setChapterTitle(e.target.value);
            setSaveStatus('unsaved');
          }}
          placeholder="Judul Bab..."
          className="font-editorial text-2xl sm:text-3xl font-bold text-[#FAF7EE] bg-transparent border-b border-[#2A2A3C] pb-3 mb-6 outline-none placeholder-[#55556C] focus:border-[#D4AF37] transition-colors"
        />

        {/* Textarea Writing Surface */}
        <textarea
          id="editor-manuscript-textarea"
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder="Mulai tuliskan kisah petualangan, dialog menegangkan, atau monolog karaktermu di sini..."
          style={{
            fontFamily:
              fontFamily === 'serif'
                ? "'Cinzel', serif, Georgia, 'Times New Roman'"
                : fontFamily === 'mono'
                ? "'JetBrains Mono', monospace"
                : "'Plus Jakarta Sans', sans-serif",
            fontSize: `${fontSize}px`,
            lineHeight: lineSpacing,
          }}
          className="w-full flex-1 bg-transparent text-[#E0E0E0] outline-none resize-none placeholder-[#4E4E66] selection:bg-[#D4AF37]/30 min-h-[480px]"
          autoFocus
        />
      </div>

      {/* EMERGENCY DRAFT SNAPSHOTS DRAWER / MODAL */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#1E1E2E] border-l border-[#2A2A3C] h-full p-6 flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#2A2A3C] mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-editorial text-base font-bold text-[#FAF7EE]">
                  Brankas Draft Darurat
                </h3>
              </div>
              <button
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="p-1 text-[#8E8EA4] hover:text-[#FAF7EE] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#8E8EA4] mb-4">
              Novel's Creator secara otomatis mengamankan snapshot naskahmu. Jika kamu salah menghapus teks, pulihkan versi sebelumnya dengan satu klik:
            </p>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {snapshots.length === 0 ? (
                <div className="py-12 text-center text-[#6E6E85]">
                  <p className="text-xs">Belum ada riwayat snapshot untuk bab ini.</p>
                </div>
              ) : (
                snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="p-3.5 bg-[#161624] border border-[#2A2A3C] hover:border-[#D4AF37]/50 rounded-xl space-y-2 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[#D4AF37] font-semibold">
                        {new Date(snap.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                      <span className="text-[11px] text-[#8E8EA4] font-mono">
                        {snap.wordCount} kata
                      </span>
                    </div>

                    {snap.reason && (
                      <div className="text-[11px] text-[#A0A0B5] italic">
                        {snap.reason}
                      </div>
                    )}

                    <p className="text-xs text-[#7E7E94] line-clamp-2 bg-[#12121C] p-2 rounded border border-[#222234]">
                      {snap.content.slice(0, 120)}...
                    </p>

                    <button
                      onClick={() => handleRestoreSnapshot(snap)}
                      className="w-full py-1.5 px-3 bg-[#242438] hover:bg-[#D4AF37] hover:text-[#121212] text-xs font-semibold text-[#FAF7EE] rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Pulihkan Versi Ini</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
