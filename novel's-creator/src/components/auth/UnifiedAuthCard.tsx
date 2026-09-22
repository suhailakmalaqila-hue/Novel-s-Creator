import React, { useState } from 'react';
import { z } from 'zod';
import { LogoEmblem } from '../common/LogoEmblem';
import { UserAuthorProfile } from '../../types';
import {
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { useBooks } from '../../contexts/BookContext';

interface UnifiedAuthCardProps {
  onLoginSuccess?: (profile: UserAuthorProfile) => void;
  onAuthSuccess?: (profile: UserAuthorProfile) => void;
}

/**
 * ============================================================
 * LOGIN VALIDATION
 * ============================================================
 *
 * Self-registration memang disabled pada sistem.
 * Karena itu UnifiedAuthCard hanya menangani login.
 */
const loginSchema = z.object({
  emailOrUser: z
    .string()
    .min(3, 'Email atau Username minimal 3 karakter'),
  password: z
    .string()
    .min(6, 'Password minimal 6 karakter'),
});

export const UnifiedAuthCard: React.FC<UnifiedAuthCardProps> = ({
  onLoginSuccess,
  onAuthSuccess,
}) => {
  const { refreshBooks } = useBooks();
  const { login: authLogin } = useAuth();

  const [loginEmailOrUser, setLoginEmailOrUser] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverMsg, setServerMsg] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);

  /**
   * ============================================================
   * AUTH SUCCESS HANDLER
   * ============================================================
   */
  const triggerAuthSuccess = (profile: UserAuthorProfile) => {
    if (onAuthSuccess) {
      onAuthSuccess(profile);
      return;
    }

    if (onLoginSuccess) {
      onLoginSuccess(profile);
    }
  };

  /**
   * ============================================================
   * LOGIN
   * ============================================================
   */
  const handleLoginSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setErrors({});
    setServerMsg(null);

    const result = loginSchema.safeParse({
      emailOrUser: loginEmailOrUser.trim(),
      password: loginPassword,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};

      result.error.issues.forEach((err) => {
        const field = err.path[0];

        if (field) {
          fieldErrors[field.toString()] = err.message;
        }
      });

      setErrors(fieldErrors);
      return;
    }

    try {
      /**
       * Login melalui AuthContext.
       *
       * AuthContext bertanggung jawab:
       * - request ke backend
       * - menyimpan JWT
       * - menyimpan user
       */
      await authLogin({
        email: result.data.emailOrUser,
        password: result.data.password,
      });

      /**
       * Setelah token berhasil disimpan,
       * refresh buku milik user yang sedang login.
       */
      await refreshBooks();

      /**
       * Ambil user yang sudah disimpan oleh AuthContext.
       */
      const storedUser = localStorage.getItem('auth_user');

      const userData = storedUser
        ? JSON.parse(storedUser)
        : null;

      /**
       * Bentuk profile yang dibutuhkan UI writer.
       */
      const profile: UserAuthorProfile = {
        id:
          userData?.id ||
          'author_test',

        username:
          userData?.username ||
          result.data.emailOrUser.split('@')[0],

        email:
          userData?.email ||
          result.data.emailOrUser,

        authorName:
          userData?.author_name ||
          'Penulis Novel',

        penName:
          userData?.pen_name ||
          'Penulis Novel',

        bio:
          userData?.bio ||
          "Penulis di Novel's Creator Studio",

        avatarUrl:
          userData?.avatar_url ||
          '',

        dailyWordGoal:
          userData?.daily_word_goal ||
          1000,

        todayWordCount:
          userData?.today_word_count ||
          0,

        lastActiveDate:
          userData?.last_active_date ||
          new Date()
            .toISOString()
            .split('T')[0],

        theme:
          userData?.theme ||
          'dark',

        soundEffects:
          userData?.sound_effects ??
          true,

        isAuthenticated: true,

        hasCompletedTutorial:
          userData?.tutorial_completed ??
          false,

        createdAt:
          userData?.created_at ||
          new Date().toISOString(),
      };

      setServerMsg({
        type: 'success',
        text: 'Login berhasil. Membuka studio...',
      });

      triggerAuthSuccess(profile);
    } catch (error: any) {
      console.error(
        'Error login:',
        error
      );

      setServerMsg({
        type: 'error',
        text:
          error?.message ||
          'Email atau password salah. Silakan coba lagi.',
      });
    }
  };

  /**
   * ============================================================
   * RENDER
   * ============================================================
   */
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] px-4 py-8 relative">
      {/* Background ambient aesthetic */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Authentication Card */}
      <div
        id="unified-auth-card"
        className="relative z-10 w-full max-w-md bg-[#1E1E2E] border border-[#2A2A3C] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm"
      >
        {/* =====================================================
            HEADER
            ===================================================== */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-3">
            <LogoEmblem
              size={64}
              showGlow={true}
            />
          </div>

          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FAF7EE] via-[#D4AF37] to-[#F7E298]">
            Novel's Creator
          </h2>

          <p className="text-xs text-[#9E9EB2] tracking-wider uppercase mt-1">
            Studio Perencana Cerita & Karakter Wiki
          </p>
        </div>

        {/* =====================================================
            LOGIN TITLE
            ===================================================== */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-5 rounded-full bg-[#D4AF37]" />

            <h3 className="font-editorial text-lg font-bold text-[#FAF7EE]">
              Masuk ke Studio
            </h3>
          </div>

          <p className="text-xs text-[#8E8EA4] pl-3">
            Gunakan akun yang telah diberikan oleh administrator.
          </p>
        </div>

        {/* =====================================================
            SERVER MESSAGE
            ===================================================== */}
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

            <span>
              {serverMsg.text}
            </span>
          </div>
        )}

        {/* =====================================================
            LOGIN FORM
            ===================================================== */}
        <form
          id="form-login"
          onSubmit={handleLoginSubmit}
          className="space-y-4"
        >
          {/* Email / Username */}
          <div>
            <label
              htmlFor="login-input-identity"
              className="block text-xs font-medium text-[#C8C8DC] mb-1.5"
            >
              Email atau Username
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#75758C]">
                <Mail className="w-4 h-4" />
              </div>

              <input
                id="login-input-identity"
                type="text"
                autoComplete="username"
                value={loginEmailOrUser}
                onChange={(e) =>
                  setLoginEmailOrUser(
                    e.target.value
                  )
                }
                placeholder="penulis@novel.id atau username"
                className={`w-full pl-9 pr-3 py-2.5 bg-[#161624] border ${
                  errors.emailOrUser
                    ? 'border-red-500'
                    : 'border-[#2A2A3C] focus:border-[#D4AF37]'
                } rounded-xl text-xs sm:text-sm text-[#E0E0E0] placeholder-[#606075] outline-none transition-colors`}
              />
            </div>

            {errors.emailOrUser && (
              <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />

                {errors.emailOrUser}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="login-input-password"
              className="block text-xs font-medium text-[#C8C8DC] mb-1.5"
            >
              Kata Sandi
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#75758C]">
                <Lock className="w-4 h-4" />
              </div>

              <input
                id="login-input-password"
                type="password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) =>
                  setLoginPassword(
                    e.target.value
                  )
                }
                placeholder="••••••••"
                className={`w-full pl-9 pr-3 py-2.5 bg-[#161624] border ${
                  errors.password
                    ? 'border-red-500'
                    : 'border-[#2A2A3C] focus:border-[#D4AF37]'
                } rounded-xl text-xs sm:text-sm text-[#E0E0E0] placeholder-[#606075] outline-none transition-colors`}
              />
            </div>

            {errors.password && (
              <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />

                {errors.password}
              </p>
            )}
          </div>

          {/* Login Button */}
          <button
            id="btn-submit-login"
            type="submit"
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89225] hover:from-[#E2BE4B] hover:to-[#C9A332] text-[#121212] font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer"
          >
            <span>
              Masuk ke Studio
            </span>

            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* =====================================================
            INFORMATION
            ===================================================== */}
        <div className="mt-6 pt-5 border-t border-[#2A2A3C]">
          <p className="text-[11px] text-[#77778C] text-center leading-relaxed">
            Akun pengguna dibuat dan dikelola oleh
            administrator. Jika Anda belum memiliki
            akun, silakan hubungi administrator.
          </p>
        </div>
      </div>
    </div>
  );
};
