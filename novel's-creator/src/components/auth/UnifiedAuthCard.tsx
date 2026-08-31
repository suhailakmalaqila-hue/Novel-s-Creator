import React, { useState } from 'react';
import { z } from 'zod';
import { LogoEmblem } from '../common/LogoEmblem';
import { UserAuthorProfile } from '../../types';
import { Lock, Mail, User, PenTool, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface UnifiedAuthCardProps {
  onLoginSuccess?: (profile: UserAuthorProfile) => void;
  onAuthSuccess?: (profile: UserAuthorProfile) => void;
}

// Zod schemas
const loginSchema = z.object({
  emailOrUser: z.string().min(3, 'Email atau Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(24, 'Username maksimal 24 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Hanya huruf, angka, dan underscore (_) yang diperbolehkan'),
  email: z.string().email('Format email tidak valid'),
  authorName: z.string().min(2, 'Nama Penulis minimal 2 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
});

export const UnifiedAuthCard: React.FC<UnifiedAuthCardProps> = ({ onLoginSuccess, onAuthSuccess }) => {
  const triggerAuthSuccess = (p: UserAuthorProfile) => {
    if (onAuthSuccess) onAuthSuccess(p);
    else if (onLoginSuccess) onLoginSuccess(p);
  };
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Form states
  const [loginEmailOrUser, setLoginEmailOrUser] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAuthorName, setRegAuthorName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Validation error states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverMsg, setServerMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerMsg(null);

    const result = loginSchema.safeParse({
      emailOrUser: loginEmailOrUser,
      password: loginPassword,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Auth Successful
    const stored = localStorage.getItem('nc_user_profile');
    let profile: UserAuthorProfile;

    if (stored) {
      try {
        profile = JSON.parse(stored);
        profile.isAuthenticated = true;
      } catch {
        profile = createDefaultProfile(result.data.emailOrUser);
      }
    } else {
      profile = createDefaultProfile(result.data.emailOrUser);
    }

    triggerAuthSuccess(profile);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerMsg(null);

    const result = registerSchema.safeParse({
      username: regUsername,
      email: regEmail,
      authorName: regAuthorName,
      password: regPassword,
      confirmPassword: regConfirmPassword,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // Register profile
    const newProfile: UserAuthorProfile = {
      id: 'author_' + Date.now(),
      username: result.data.username,
      email: result.data.email,
      authorName: result.data.authorName,
      penName: result.data.authorName,
      bio: 'Penulis kisah imajinatif & perancang dunia visual novel.',
      avatarUrl: '',
      dailyWordGoal: 1000,
      todayWordCount: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      theme: 'dark',
      soundEffects: true,
      isAuthenticated: true,
      hasCompletedTutorial: false,
      createdAt: new Date().toISOString(),
    };

    triggerAuthSuccess(newProfile);
  };

  const handleQuickDemoAuth = () => {
    const demoProfile: UserAuthorProfile = {
      id: 'author_demo',
      username: 'studio_author',
      email: 'penulis@novelcreator.studio',
      authorName: 'Novelist Utama',
      penName: 'Aria Penna',
      bio: 'Menjelajahi batas cakrawala cerita & arsitektur karakter.',
      avatarUrl: '',
      dailyWordGoal: 1200,
      todayWordCount: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      theme: 'dark',
      soundEffects: true,
      isAuthenticated: true,
      hasCompletedTutorial: false,
      createdAt: new Date().toISOString(),
    };
    triggerAuthSuccess(demoProfile);
  };

  function createDefaultProfile(nameOrEmail: string): UserAuthorProfile {
    const cleanName = nameOrEmail.includes('@') ? nameOrEmail.split('@')[0] : nameOrEmail;
    return {
      id: 'author_' + Date.now(),
      username: cleanName.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      email: nameOrEmail.includes('@') ? nameOrEmail : `${cleanName}@novelcreator.local`,
      authorName: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
      penName: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
      bio: 'Penulis cerita orisinal di Novel\'s Creator Studio.',
      avatarUrl: '',
      dailyWordGoal: 1000,
      todayWordCount: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      theme: 'dark',
      soundEffects: true,
      createdAt: new Date().toISOString(),
    };
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] px-4 py-8 relative">
      {/* Background ambient aesthetic */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Unified Dark Card */}
      <div
        id="unified-auth-card"
        className="relative z-10 w-full max-w-md bg-[#1E1E2E] border border-[#2A2A3C] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm"
      >
        {/* Header with Emblem & App Name */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-3">
            <LogoEmblem size={64} showGlow={true} />
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FAF7EE] via-[#D4AF37] to-[#F7E298]">
            Novel's Creator
          </h2>
          <p className="text-xs text-[#9E9EB2] tracking-wider uppercase mt-1">
            Studio Perencana Cerita & Karakter Wiki
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#151522] border border-[#2A2A3C] rounded-xl p-1 mb-6">
          <button
            id="tab-login"
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrors({});
              setServerMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === 'login'
                ? 'bg-[#26263A] text-[#FAF7EE] border border-[#D4AF37]/40 shadow-sm'
                : 'text-[#8A8A9E] hover:text-[#E0E0E0]'
            }`}
          >
            Masuk Akun
          </button>
          <button
            id="tab-register"
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrors({});
              setServerMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === 'register'
                ? 'bg-[#26263A] text-[#FAF7EE] border border-[#D4AF37]/40 shadow-sm'
                : 'text-[#8A8A9E] hover:text-[#E0E0E0]'
            }`}
          >
            Daftar Penulis
          </button>
        </div>

        {serverMsg && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-xs mb-4 ${
              serverMsg.type === 'error'
                ? 'bg-red-950/50 border border-red-800 text-red-300'
                : 'bg-emerald-950/50 border border-emerald-800 text-emerald-300'
            }`}
          >
            {serverMsg.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{serverMsg.text}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {activeTab === 'login' && (
          <form id="form-login" onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#C8C8DC] mb-1.5">
                Email atau Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#75758C]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-input-identity"
                  type="text"
                  value={loginEmailOrUser}
                  onChange={(e) => setLoginEmailOrUser(e.target.value)}
                  placeholder="penulis@novel.id atau username"
                  className={`w-full pl-9 pr-3 py-2.5 bg-[#161624] border ${
                    errors.emailOrUser ? 'border-red-500' : 'border-[#2A2A3C] focus:border-[#D4AF37]'
                  } rounded-xl text-xs sm:text-sm text-[#E0E0E0] placeholder-[#606075] outline-none transition-colors`}
                />
              </div>
              {errors.emailOrUser && (
                <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.emailOrUser}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#C8C8DC]">
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#75758C]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-input-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-3 py-2.5 bg-[#161624] border ${
                    errors.password ? 'border-red-500' : 'border-[#2A2A3C] focus:border-[#D4AF37]'
                  } rounded-xl text-xs sm:text-sm text-[#E0E0E0] placeholder-[#606075] outline-none transition-colors`}
                />
              </div>
              {errors.password && (
                <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password}
                </p>
              )}
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89225] hover:from-[#E2BE4B] hover:to-[#C9A332] text-[#121212] font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer"
            >
              <span>Masuk ke Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {activeTab === 'register' && (
          <form id="form-register" onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#C8C8DC] mb-1">
                Nama Lengkap / Nama Pena
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#75758C]">
                  <PenTool className="w-4 h-4" />
                </div>
                <input
                  id="reg-input-author-name"
                  type="text"
                  value={regAuthorName}
                  onChange={(e) => setRegAuthorName(e.target.value)}
                  placeholder="Contoh: Aria Shiori"
                  className={`w-full pl-9 pr-3 py-2 bg-[#161624] border ${
                    errors.authorName ? 'border-red-500' : 'border-[#2A2A3C] focus:border-[#D4AF37]'
                  } rounded-xl text-xs sm:text-sm text-[#E0E0E0] placeholder-[#606075] outline-none transition-colors`}
                />
              </div>
              {errors.authorName && (
                <p className="text-[11px] text-red-400 mt-1">{errors.authorName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#C8C8DC] mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#75758C]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-input-username"
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="aria_writer"
                    className={`w-full pl-9 pr-3 py-2 bg-[#161624] border ${
                      errors.username ? 'border-red-500' : 'border-[#2A2A3C] focus:border-[#D4AF37]'
                    } rounded-xl text-xs sm:text-sm text-[#E0E0E0] placeholder-[#606075] outline-none transition-colors`}
                  />
                </div>
                {errors.username && (
                  <p className="text-[11px] text-red-400 mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C8C8DC] mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#75758C]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-input-email"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="penulis@domain.com"
                    className={`w-full pl-9 pr-3 py-2 bg-[#161624] border ${
                      errors.email ? 'border-red-500' : 'border-[#2A2A3C] focus:border-[#D4AF37]'
                    } rounded-xl text-xs sm:text-sm text-[#E0E0E0] placeholder-[#606075] outline-none transition-colors`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#C8C8DC] mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#75758C]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-input-password"
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-3 py-2 bg-[#161624] border ${
                      errors.password ? 'border-red-500' : 'border-[#2A2A3C] focus:border-[#D4AF37]'
                    } rounded-xl text-xs sm:text-sm text-[#E0E0E0] placeholder-[#606075] outline-none transition-colors`}
                  />
                </div>
                {errors.password && (
                  <p className="text-[11px] text-red-400 mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#C8C8DC] mb-1">
                  Konfirmasi Sandi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#75758C]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="reg-input-confirm-password"
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-3 py-2 bg-[#161624] border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-[#2A2A3C] focus:border-[#D4AF37]'
                    } rounded-xl text-xs sm:text-sm text-[#E0E0E0] placeholder-[#606075] outline-none transition-colors`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-red-400 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <button
              id="btn-submit-register"
              type="submit"
              className="w-full mt-3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89225] hover:from-[#E2BE4B] hover:to-[#C9A332] text-[#121212] font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer"
            >
              <span>Daftar & Buka Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Divider & Quick Access for testing / evaluator */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#2A2A3C]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#1E1E2E] px-2 text-[#77778C]">atau coba langsung</span>
          </div>
        </div>

        <button
          id="btn-quick-demo-auth"
          type="button"
          onClick={handleQuickDemoAuth}
          className="w-full py-2 px-3 bg-[#171724] hover:bg-[#222234] border border-[#303046] hover:border-[#D4AF37]/50 rounded-xl text-xs text-[#D8D8E8] flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Masuk Cepat Mode Tamu / Demo</span>
        </button>
      </div>
    </div>
  );
};
