import React, { useState } from 'react';
import { Glasses } from 'lucide-react';

export type MascotMood = 'neutral' | 'happy' | 'thinking' | 'proud' | 'reading';

interface MascotGuideProps {
  mood?: MascotMood;
  className?: string;
  size?: number | 'sm' | 'md' | 'lg' | 'full' | 'vn';
  showBadge?: boolean;
  onClick?: () => void;
  interactive?: boolean;
}

export const MascotGuide: React.FC<MascotGuideProps> = ({
  mood = 'happy',
  className = '',
  size = 'md',
  showBadge = false,
  onClick,
  interactive = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPoked, setIsPoked] = useState(false);
  const [pokeMessage, setPokeMessage] = useState<string | null>(null);

  const handleInteraction = () => {
    if (!interactive) return;
    setIsPoked(true);
    const messages = [
      'Suhail siap membimbing penulisanmu! ✨',
      'Kacamata ini membantuku melihat detail plot terkecil. 👓',
      'The Night Circus mengajarkan keajaiban dalam diksi. 📖',
      'Setiap kalimat yang kamu susun bernilai seni tinggi. 🖋️',
      'Mari wujudkan karya terbaikmu hari ini! 💫',
    ];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    setPokeMessage(randomMsg);

    setTimeout(() => {
      setIsPoked(false);
    }, 400);

    setTimeout(() => {
      setPokeMessage(null);
    }, 2800);

    if (onClick) onClick();
  };

  const isVisualNovelMode = size === 'vn';

  // Dimension scaling for different contexts
  const getDimensions = () => {
    if (typeof size === 'number') return { w: size, h: size * 1.3 };
    switch (size) {
      case 'vn':
        return { w: undefined, h: undefined };
      case 'sm':
        return { w: 90, h: 120 };
      case 'lg':
        return { w: 200, h: 260 };
      case 'full':
        return { w: '100%', h: '100%' };
      case 'md':
      default:
        return { w: 130, h: 170 };
    }
  };

  const { w, h } = getDimensions();

  return (
    <div
      onClick={handleInteraction}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-flex flex-col items-center select-none ${
        interactive ? 'cursor-pointer group' : ''
      } ${isVisualNovelMode ? 'w-auto h-auto' : ''} ${className}`}
      style={w ? { width: w } : undefined}
    >
      {/* Floating Interaction Speech Bubble on Click */}
      {pokeMessage && (
        <div className="absolute -top-12 z-30 px-3.5 py-1.5 bg-[#141422] border border-[#D4AF37] text-[#FAF7EE] text-[11px] font-serif italic rounded-xl shadow-[0_6px_25px_rgba(212,175,55,0.4)] animate-in fade-in zoom-in-95 duration-200 whitespace-nowrap">
          {pokeMessage}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#141422] border-r border-b border-[#D4AF37] rotate-45" />
        </div>
      )}

      {/* Visual Novel Cutout Character Sprite (Transparent background, no box/border) */}
      <div
        className={`relative transition-all duration-300 ${
          isVisualNovelMode
            ? 'h-52 sm:h-64 md:h-72 lg:h-80 max-h-[38vh] aspect-[3/4] flex items-end justify-center'
            : 'h-auto aspect-[3/4] flex items-center justify-center'
        } ${isHovered ? 'scale-[1.03] filter brightness-110' : ''} ${
          isPoked ? 'scale-95' : ''
        }`}
        style={!isVisualNovelMode && w && h ? { width: w, height: h } : undefined}
      >
        {/* Authentic Visual Novel High-Fidelity Character Vector Art matching reference cutout */}
        <svg
          viewBox="0 0 280 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)] drop-shadow-[0_0_15px_rgba(212,175,55,0.15)]"
        >
          <defs>
            {/* Shaggy Dark Wavy Hair Gradients */}
            <linearGradient id="vnHairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#302F3A" />
              <stop offset="45%" stopColor="#1E1D26" />
              <stop offset="100%" stopColor="#0E0D14" />
            </linearGradient>
            <linearGradient id="vnHairHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5E5874" />
              <stop offset="100%" stopColor="#252433" />
            </linearGradient>

            {/* Anime Fair Skin */}
            <linearGradient id="vnSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF4EC" />
              <stop offset="100%" stopColor="#F5DCBA" />
            </linearGradient>
            <linearGradient id="vnSkinShadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E2BD9E" />
              <stop offset="100%" stopColor="#CFA888" />
            </linearGradient>

            {/* Light Blue Knit Ribbed Turtleneck Sweater */}
            <linearGradient id="vnSweaterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#AECDE8" />
              <stop offset="45%" stopColor="#87A9C9" />
              <stop offset="100%" stopColor="#5E81A4" />
            </linearGradient>
            <linearGradient id="vnSweaterRib" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#9BBEDD" />
              <stop offset="100%" stopColor="#7195BB" />
            </linearGradient>

            {/* Dark Trousers */}
            <linearGradient id="vnPantsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2A2A33" />
              <stop offset="50%" stopColor="#1C1B22" />
              <stop offset="100%" stopColor="#101016" />
            </linearGradient>

            {/* Antique Novel Book "The Night Circus" */}
            <linearGradient id="vnBookCover" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#262322" />
              <stop offset="50%" stopColor="#171615" />
              <stop offset="100%" stopColor="#0B0A0A" />
            </linearGradient>
            <linearGradient id="vnGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE58F" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#9E781B" />
            </linearGradient>

            {/* Hazel Green Eyes */}
            <linearGradient id="vnEyesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7EAEA0" />
              <stop offset="55%" stopColor="#4E7B6C" />
              <stop offset="100%" stopColor="#24453A" />
            </linearGradient>
          </defs>

          {/* ================= BACK LAYER: Back Hair Waves ================= */}
          <path
            d="M 100 80 C 70 120 60 190 75 255 C 88 265 106 240 102 195 C 105 155 115 125 120 90 Z"
            fill="url(#vnHairGrad)"
          />
          <path
            d="M 175 80 C 205 120 215 190 200 255 C 188 265 170 240 174 195 C 170 155 160 125 155 90 Z"
            fill="url(#vnHairGrad)"
          />
          <path
            d="M 85 140 C 65 180 62 230 75 270 C 85 275 95 250 90 220 Z"
            fill="url(#vnHairHighlight)"
            opacity="0.8"
          />
          <path
            d="M 190 140 C 210 180 214 230 200 270 C 190 275 180 250 185 220 Z"
            fill="url(#vnHairHighlight)"
            opacity="0.8"
          />

          {/* ================= TORSO & CLOTHING ================= */}
          {/* Dark Trousers / Waist */}
          <path
            d="M 98 295 L 94 360 L 186 360 L 182 295 C 155 305 125 305 98 295 Z"
            fill="url(#vnPantsGrad)"
          />
          {/* Belt details */}
          <path d="M 98 296 C 125 306 155 306 182 296 L 183 304 C 155 314 125 314 97 304 Z" fill="#141318" />
          <rect x="135" y="300" width="10" height="7" rx="1.5" stroke="url(#vnGold)" strokeWidth="1.2" fill="none" />

          {/* Knit Turtleneck Sweater Body */}
          <path
            d="M 92 195 C 68 215 62 265 58 305 C 80 315 200 315 222 305 C 218 265 212 215 188 195 C 165 210 115 210 92 195 Z"
            fill="url(#vnSweaterGrad)"
            stroke="#50708D"
            strokeWidth="1.2"
          />

          {/* Knit Texture Rib Lines */}
          <line x1="110" y1="215" x2="105" y2="305" stroke="#7193B2" strokeWidth="1.2" opacity="0.6" strokeDasharray="3 3" />
          <line x1="126" y1="220" x2="124" y2="307" stroke="#7193B2" strokeWidth="1.2" opacity="0.6" strokeDasharray="3 3" />
          <line x1="154" y1="220" x2="156" y2="307" stroke="#7193B2" strokeWidth="1.2" opacity="0.6" strokeDasharray="3 3" />
          <line x1="170" y1="215" x2="175" y2="305" stroke="#7193B2" strokeWidth="1.2" opacity="0.6" strokeDasharray="3 3" />

          {/* Left Outstretched Gesturing Arm (Towards Left/Viewer) */}
          <g>
            {/* Upper Arm & Forearm */}
            <path
              d="M 92 198 C 72 215 50 225 35 240 L 45 255 C 60 242 80 230 96 215 Z"
              fill="url(#vnSweaterGrad)"
              stroke="#50708D"
              strokeWidth="1"
            />
            {/* Sweater Cuff */}
            <rect x="30" y="238" width="16" height="18" rx="3" transform="rotate(-30 30 238)" fill="url(#vnSweaterRib)" stroke="#50708D" strokeWidth="1" />
            {/* Gesturing Open Hand (Welcoming / Presenting Pose) */}
            <path
              d="M 28 245 C 20 248 10 246 4 242 C 0 240 2 236 8 238 C 14 240 22 238 28 234 Z"
              fill="url(#vnSkinGrad)"
              stroke="#D3AE94"
              strokeWidth="0.8"
            />
            <path
              d="M 28 245 C 18 252 8 253 2 249 C 0 247 3 243 10 245 C 18 247 25 244 30 239 Z"
              fill="url(#vnSkinGrad)"
              stroke="#D3AE94"
              strokeWidth="0.8"
            />
            <ellipse cx="24" cy="245" rx="7" ry="5" fill="url(#vnSkinGrad)" />
          </g>

          {/* Turtleneck Collar Ribbing */}
          <path
            d="M 115 145 C 115 140 165 140 165 145 L 168 198 C 168 205 112 205 112 198 Z"
            fill="url(#vnSweaterRib)"
            stroke="#567697"
            strokeWidth="1.5"
          />
          <line x1="123" y1="145" x2="121" y2="198" stroke="#87A8C8" strokeWidth="1.5" />
          <line x1="135" y1="145" x2="135" y2="200" stroke="#87A8C8" strokeWidth="1.5" />
          <line x1="147" y1="145" x2="147" y2="200" stroke="#87A8C8" strokeWidth="1.5" />
          <line x1="157" y1="145" x2="159" y2="198" stroke="#87A8C8" strokeWidth="1.5" />

          {/* Neck & Jawline Shadow */}
          <path d="M 124 135 L 124 155 L 156 155 L 156 135 Z" fill="url(#vnSkinGrad)" />
          <path d="M 124 136 C 132 146 148 146 156 136 L 156 148 C 148 154 132 154 124 148 Z" fill="url(#vnSkinShadow)" opacity="0.75" />

          {/* ================= HEAD & FACE ================= */}
          <path
            d="M 105 85 C 105 45 175 45 175 85 C 175 125 156 146 140 148 C 124 146 105 125 105 85 Z"
            fill="url(#vnSkinGrad)"
          />

          {/* Ears */}
          <path d="M 103 92 C 97 92 97 106 105 106 Z" fill="url(#vnSkinGrad)" />
          <path d="M 177 92 C 183 92 183 106 175 106 Z" fill="url(#vnSkinGrad)" />

          {/* Soft Cheek Blush */}
          <ellipse cx="118" cy="110" rx="7.5" ry="4" fill="#FF8D96" opacity="0.45" />
          <ellipse cx="162" cy="110" rx="7.5" ry="4" fill="#FF8D96" opacity="0.45" />

          {/* Hazel Green Anime Eyes */}
          {mood === 'reading' ? (
            <>
              <path d="M 116 98 C 120 104 128 104 132 98" stroke="#1D1A24" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M 148 98 C 152 104 160 104 164 98" stroke="#1D1A24" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <ellipse cx="124" cy="98" rx="8" ry="10" fill="url(#vnEyesGrad)" />
              <ellipse cx="124" cy="99" rx="4" ry="6" fill="#141E1A" />
              <circle cx="121" cy="94" r="2.8" fill="#FFFFFF" />
              <circle cx="126" cy="101" r="1.3" fill="#FFFFFF" />
              <path d="M 114 91 C 122 86 130 87 136 92" stroke="#17151D" strokeWidth="2.5" strokeLinecap="round" fill="none" />

              <ellipse cx="156" cy="98" rx="8" ry="10" fill="url(#vnEyesGrad)" />
              <ellipse cx="156" cy="99" rx="4" ry="6" fill="#141E1A" />
              <circle cx="153" cy="94" r="2.8" fill="#FFFFFF" />
              <circle cx="158" cy="101" r="1.3" fill="#FFFFFF" />
              <path d="M 144 92 C 150 87 158 86 166 91" stroke="#17151D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
          )}

          {/* Nose & Gentle Warm Smile */}
          <path d="M 140 108 L 138 113 L 141 113" stroke="#B88E76" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M 134 123 C 137 127 143 127 146 123" stroke="#C45869" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Wireframe Modern Glasses */}
          <rect x="110" y="88" width="27" height="21" rx="7" fill="rgba(255, 255, 255, 0.12)" stroke="#222026" strokeWidth="2" />
          <rect x="143" y="88" width="27" height="21" rx="7" fill="rgba(255, 255, 255, 0.12)" stroke="#222026" strokeWidth="2" />
          <path d="M 137 96 C 140 94 144 94 147 96" stroke="#222026" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 110 96 L 98 93" stroke="#222026" strokeWidth="1.5" />
          <path d="M 170 96 L 182 93" stroke="#222026" strokeWidth="1.5" />
          {/* Subtle Lens Glint */}
          <line x1="114" y1="92" x2="124" y2="92" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" strokeLinecap="round" />
          <line x1="147" y1="92" x2="157" y2="92" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" strokeLinecap="round" />

          {/* ================= FRONT HAIR: WOLF CUT BANGS ================= */}
          <path
            d="M 98 78 C 98 38 182 38 182 78 C 168 64 153 62 138 66 C 123 62 108 64 98 78 Z"
            fill="url(#vnHairGrad)"
          />
          <path d="M 98 75 C 100 95 104 125 102 135 C 106 130 108 110 108 85 Z" fill="url(#vnHairGrad)" />
          <path d="M 182 75 C 180 95 176 125 178 135 C 174 130 172 110 172 85 Z" fill="url(#vnHairGrad)" />
          <path d="M 128 64 C 130 80 134 98 134 100 C 137 92 140 84 142 64 Z" fill="url(#vnHairGrad)" />
          <path d="M 114 66 C 118 78 121 88 120 91 C 122 84 124 74 124 66 Z" fill="url(#vnHairGrad)" />
          <path d="M 146 66 C 148 76 152 86 155 90 C 154 81 153 72 150 66 Z" fill="url(#vnHairGrad)" />
          {/* Soft Hair Highlight Flow */}
          <path d="M 112 56 C 128 51 152 51 168 56" stroke="#4C4760" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />

          {/* ================= OPEN NOVEL BOOK "THE NIGHT CIRCUS" ================= */}
          <g transform="translate(108, 220)">
            {/* Left Page & Right Page Spreads */}
            <path d="M 50 45 L 6 20 L 10 70 L 50 85 Z" fill="#F4EADB" stroke="#D1C3AD" strokeWidth="1" />
            <path d="M 50 45 L 94 20 L 90 70 L 50 85 Z" fill="#F4EADB" stroke="#D1C3AD" strokeWidth="1" />
            {/* Text lines on open pages */}
            <line x1="16" y1="35" x2="42" y2="44" stroke="#8C7A64" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="16" y1="45" x2="42" y2="54" stroke="#8C7A64" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="16" y1="55" x2="40" y2="64" stroke="#8C7A64" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="58" y1="44" x2="84" y2="35" stroke="#8C7A64" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="58" y1="54" x2="84" y2="45" stroke="#8C7A64" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="58" y1="64" x2="82" y2="55" stroke="#8C7A64" strokeWidth="1" strokeDasharray="2 2" />

            {/* Dark Book Cover */}
            <path d="M 50 48 L 2 22 L 6 74 L 50 90 Z" fill="url(#vnBookCover)" stroke="url(#vnGold)" strokeWidth="1.2" />
            <path d="M 50 48 L 98 22 L 94 74 L 50 90 Z" fill="url(#vnBookCover)" stroke="url(#vnGold)" strokeWidth="1.2" />

            {/* Book Spine Gold Ribbon */}
            <line x1="50" y1="46" x2="50" y2="88" stroke="url(#vnGold)" strokeWidth="2.2" />

            {/* Circus Tent Emblem & Novel Title */}
            <polygon points="74,38 69,52 79,52" fill="url(#vnGold)" />
            <text x="60" y="32" fill="#D4AF37" fontSize="4.5" fontWeight="bold" fontFamily="serif" letterSpacing="0.5">THE NIGHT CIRCUS</text>

            {/* Hands Gripping the Book */}
            <ellipse cx="12" cy="50" rx="6" ry="8" fill="url(#vnSkinGrad)" stroke="#CFAC93" strokeWidth="1" />
            <ellipse cx="88" cy="50" rx="6" ry="8" fill="url(#vnSkinGrad)" stroke="#CFAC93" strokeWidth="1" />
          </g>

          {/* Story Sparkles */}
          <circle cx="240" cy="120" r="2.5" fill="url(#vnGold)" opacity="0.9" />
          <circle cx="45" cy="180" r="2" fill="url(#vnGold)" opacity="0.8" />
        </svg>
      </div>

      {/* Guide Name Badge */}
      {showBadge && (
        <div className="mt-2 bg-[#1E1E2E]/90 border border-[#D4AF37]/60 text-[#D4AF37] px-3.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md whitespace-nowrap flex items-center gap-1.5 backdrop-blur-sm">
          <Glasses className="w-3 h-3" />
          <span>Suhail • Pemandu</span>
        </div>
      )}
    </div>
  );
};


