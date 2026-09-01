import React, { useState } from 'react';
import { AppView, UserAuthorProfile } from '../../types';
import { LogoEmblem } from './LogoEmblem';
import {
  FolderKanban,
  Users,
  Feather,
  Search,
  StickyNote,
  HelpCircle,
  User,
  Settings,
  LogOut,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  currentView: AppView;
  userProfile: UserAuthorProfile | null;
  notesCount: number;
  onNavigate: (view: AppView) => void;
  onOpenSearch: () => void;
  onToggleNotes: () => void;
  onOpenTutorial: () => void;
  onOpenProfileSettings: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  userProfile,
  notesCount,
  onNavigate,
  onOpenSearch,
  onToggleNotes,
  onOpenTutorial,
  onOpenProfileSettings,
  onLogout,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#121212]/95 backdrop-blur-md border-b border-[#2A2A3C] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Title */}
        <div
          onClick={() => onNavigate('workspace')}
          className="flex items-center gap-3.5 cursor-pointer group"
        >
          <div className="w-10 h-10 flex items-center justify-center bg-[#D4AF37] rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-transform group-hover:scale-105">
            <LogoEmblem size={24} />
          </div>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#D4AF37] group-hover:text-white transition-colors leading-tight">
              Novel's Creator
            </h1>
            <p className="text-[10px] text-[#A0A0B5] font-mono tracking-[0.25em] uppercase">
              Author Studio & Wiki
            </p>
          </div>
        </div>

        {/* Center: Main View Navigation with Bold Tracking */}
        <nav
          data-tour="nav-tabs-group"
          className="hidden sm:flex items-center gap-6 text-xs sm:text-sm uppercase tracking-widest font-bold"
        >
          <button
            id="nav-tab-workspace"
            data-tour="nav-workspace"
            onClick={() => onNavigate('workspace')}
            className={`py-2 px-3 transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
              currentView === 'workspace'
                ? 'text-[#D4AF37] border-[#D4AF37]'
                : 'text-[#8E8EA4] border-transparent hover:text-[#FAF7EE] hover:border-[#3A3A54]'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Workspace</span>
          </button>

          <button
            id="nav-tab-characters"
            data-tour="character-wiki"
            onClick={() => onNavigate('characters')}
            className={`py-2 px-3 transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
              currentView === 'characters'
                ? 'text-[#D4AF37] border-[#D4AF37]'
                : 'text-[#8E8EA4] border-transparent hover:text-[#FAF7EE] hover:border-[#3A3A54]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Wiki Karakter</span>
          </button>

          <button
            id="nav-tab-editor"
            data-tour="nav-editor"
            onClick={() => onNavigate('editor')}
            className={`py-2 px-3 transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
              currentView === 'editor'
                ? 'text-[#D4AF37] border-[#D4AF37]'
                : 'text-[#8E8EA4] border-transparent hover:text-[#FAF7EE] hover:border-[#3A3A54]'
            }`}
          >
            <Feather className="w-4 h-4" />
            <span>Studio Editor</span>
          </button>
        </nav>

        {/* Right: Search, Quick Notes, Tutorial Guide & Author Profile Info */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Global Search trigger */}
          <button
            id="btn-nav-search"
            data-tour="global-search"
            onClick={onOpenSearch}
            className="p-2.5 text-[#9E9EB2] hover:text-[#FAF7EE] hover:bg-[#1E1E2E] rounded-xl border border-transparent hover:border-[#2A2A3C] transition-colors cursor-pointer relative"
            title="Pencarian Global (Ctrl+K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Quick Notes trigger */}
          <button
            id="btn-nav-quick-notes"
            data-tour="quick-notes"
            onClick={onToggleNotes}
            className="p-2.5 text-[#9E9EB2] hover:text-[#FAF7EE] hover:bg-[#1E1E2E] rounded-xl border border-transparent hover:border-[#2A2A3C] transition-colors cursor-pointer relative"
            title="Catatan Kilat (Ctrl+M)"
          >
            <StickyNote className="w-4 h-4" />
            {notesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D4AF37] text-[#121212] font-mono text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {notesCount}
              </span>
            )}
          </button>

          {/* Tutorial Guide trigger */}
          <button
            id="btn-nav-guide"
            data-tour="writing-guide"
            onClick={onOpenTutorial}
            className="hidden lg:flex items-center gap-1.5 py-1.5 px-3 bg-[#1E1E2E] hover:bg-[#282840] border border-[#2A2A3C] hover:border-[#D4AF37]/50 text-[#D4AF37] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            title="Bantuan Panduan Penulis Studio"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Panduan Studio</span>
          </button>

          {/* Author Badge & Profile dropdown menu */}
          <div className="relative pl-3 sm:pl-5 border-l border-[#2A2A3C]" data-tour="author-profile">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-3 p-1.5 hover:bg-[#1E1E2E] rounded-xl border border-transparent hover:border-[#2A2A3C] transition-all cursor-pointer"
            >
              <div className="text-right hidden sm:block">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                  Author
                </div>
                <div className="text-xs sm:text-sm font-medium text-[#FAF7EE] max-w-[120px] truncate">
                  {userProfile?.penName || 'Penulis Hebat'}
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#1E1E2E] border border-[#2A2A3C] flex items-center justify-center text-xs font-bold text-[#D4AF37] shrink-0 overflow-hidden shadow-inner">
                {userProfile?.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.penName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (userProfile?.penName || 'PH')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                )}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#7E7E94]" />
            </button>

            {isProfileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-[#1E1E2E] border border-[#2A2A3C] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <div className="px-4 py-2.5 border-b border-[#2A2A3C]">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                    Profil Penulis
                  </div>
                  <div className="text-xs font-bold text-[#FAF7EE] truncate">
                    {userProfile?.penName || 'Penulis'}
                  </div>
                  <div className="text-[10px] text-[#9E9EB2] font-mono mt-0.5">
                    {userProfile?.preferredGenre || 'Visual Novel & Fiksi'}
                  </div>
                </div>

                <button
                  onClick={onOpenProfileSettings}
                  className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#C8C8DC] hover:text-[#FAF7EE] hover:bg-[#282840] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-[#D4AF37]" />
                  <span>Pengaturan & Ekspor Data</span>
                </button>

                <button
                  onClick={onOpenTutorial}
                  className="w-full px-4 py-2.5 text-left text-xs font-medium text-[#C8C8DC] hover:text-[#FAF7EE] hover:bg-[#282840] flex items-center gap-2 transition-colors cursor-pointer lg:hidden"
                >
                  <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
                  <span>Panduan Aria</span>
                </button>

                <div className="my-1 border-t border-[#2A2A3C]" />

                <button
                  onClick={onLogout}
                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/30 flex items-center gap-2 transition-colors cursor-pointer uppercase tracking-wider"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav bar row */}
      <div className="sm:hidden flex items-center justify-around border-t border-[#2A2A3C] bg-[#161624] py-2 px-2 text-[11px] font-bold uppercase tracking-wider">
        <button
          onClick={() => onNavigate('workspace')}
          className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 ${
            currentView === 'workspace' ? 'bg-[#D4AF37] text-[#121212]' : 'text-[#8E8EA4]'
          }`}
        >
          <FolderKanban className="w-3.5 h-3.5" />
          <span>Workspace</span>
        </button>
        <button
          onClick={() => onNavigate('characters')}
          className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 ${
            currentView === 'characters' ? 'bg-[#D4AF37] text-[#121212]' : 'text-[#8E8EA4]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Karakter</span>
        </button>
        <button
          onClick={() => onNavigate('editor')}
          className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 ${
            currentView === 'editor' ? 'bg-[#D4AF37] text-[#121212]' : 'text-[#8E8EA4]'
          }`}
        >
          <Feather className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>
      </div>
    </header>
  );
};
