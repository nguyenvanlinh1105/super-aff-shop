import React from "react";

// ── Logo MeowBack Full (Cat Head with Pink Ribbon + Typography) ──
export function LogoMeowBack({ className = "h-9 text-primary-500" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2.5 font-sans ${className}`} suppressHydrationWarning>
      {/* Lucky Cat (Mèo Thần Tài) icon logo */}
      <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 text-white shadow-cute overflow-hidden p-0.5 shrink-0" suppressHydrationWarning>
        <img
          src="/meowback_lucky_cat_logo.png"
          alt="MeowBack Lucky Cat Logo"
          className="w-full h-full object-cover rounded-xl"
        />
      </div>

      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1">
          <span className="font-extrabold text-xl tracking-tight text-neutral-900">
            Meow<span className="text-primary-500">Back</span>
          </span>
        </div>
        <span className="text-[10px] font-medium text-neutral-500 tracking-wider uppercase">
          Nơ Mèo Hoàn Tiền
        </span>
      </div>
    </div>
  );
}

// ── Icon Ribbon Bow ──
export function IconBow({ className = "w-5 h-5 text-accent-bow" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 11C11.2 8.2 7.8 4.8 4.5 7C1.5 9.2 4.2 13.2 9.5 13.5L6.5 21.5L11 18.8L12 17.2L13 18.8L17.5 21.5L14.5 13.5C19.8 13.2 22.5 9.2 19.5 7C16.2 4.8 12.8 8.2 12 11Z" />
      <circle cx="12" cy="12" r="2.2" fill="#FFFFFF" />
    </svg>
  );
}

// ── Icon Cat Paw Loading ──
export function IconCatPawLoading({ className = "w-8 h-8 text-primary-500" }: { className?: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <svg viewBox="0 0 32 32" fill="currentColor" className={`${className} animate-bounce`}>
        {/* Main pad */}
        <ellipse cx="16" cy="20" rx="7" ry="5.5" className="text-primary-400" />
        {/* Toe pads */}
        <ellipse cx="9" cy="12" rx="2.5" ry="3.5" transform="rotate(-15 9 12)" className="text-primary-300 paw-step" />
        <ellipse cx="13.5" cy="9.5" rx="2.5" ry="3.8" className="text-primary-400 paw-step" />
        <ellipse cx="18.5" cy="9.5" rx="2.5" ry="3.8" className="text-primary-400 paw-step" />
        <ellipse cx="23" cy="12" rx="2.5" ry="3.5" transform="rotate(15 23 12)" className="text-primary-300 paw-step" />
      </svg>
    </div>
  );
}

// ── Mascot Cat Mascot Illustration Components ──

// 1. Cat Welcome Onboarding Mascot
export function IllustCatWelcome({ className = "w-48 h-48" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 200 200" fill="none" className="w-full h-full float">
        {/* Soft background glow circle */}
        <circle cx="100" cy="110" r="75" fill="#FFE4EC" opacity="0.7" />
        <circle cx="100" cy="110" r="55" fill="#FFF5F8" />
        
        {/* Yarn ball */}
        <circle cx="150" cy="140" r="22" fill="#FF8AAF" />
        <path d="M135 140C140 130 160 130 165 140M138 148C145 155 158 155 162 145" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M165 150Q175 165 150 175T120 180" stroke="#FF4D8D" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Money Pouch */}
        <path d="M50 135 C50 120 62 110 75 110 C88 110 100 120 100 135 C100 155 85 165 75 165 C65 165 50 155 50 135 Z" fill="#F5C56B" />
        <path d="M62 110 L75 102 L88 110" stroke="#E5A84B" strokeWidth="3" />
        <circle cx="75" cy="138" r="8" fill="#FFF" opacity="0.9" />
        <text x="75" y="142" textAnchor="middle" fill="#5A4418" fontSize="11" fontWeight="bold">₫</text>
        {/* Bow tie on pouch */}
        <path d="M75 110 L70 105 L80 105 Z M75 110 L70 115 L80 115 Z" fill="#FF4D8D" />

        {/* Cat Body */}
        <ellipse cx="105" cy="120" rx="30" ry="25" fill="#FF6D9E" />
        {/* Cat Chest White */}
        <ellipse cx="105" cy="125" rx="16" ry="18" fill="#FFF5F8" />

        {/* Cat Head */}
        <ellipse cx="105" cy="80" rx="32" ry="26" fill="#FF6D9E" />
        {/* Cat Ears */}
        <polygon points="76,65 82,42 98,58" fill="#FF6D9E" />
        <polygon points="79,63 84,47 95,57" fill="#FFC9DA" />
        <polygon points="134,65 128,42 112,58" fill="#FF6D9E" />
        <polygon points="131,63 126,47 115,57" fill="#FFC9DA" />

        {/* Pink Ribbon Bow on left ear */}
        <g transform="translate(80, 45) scale(0.7)">
          <path d="M12 11C11.2 8.2 7.8 4.8 4.5 7C1.5 9.2 4.2 13.2 9.5 13.5L6.5 21.5L11 18.8L12 17.2L13 18.8L17.5 21.5L14.5 13.5C19.8 13.2 22.5 9.2 19.5 7C16.2 4.8 12.8 8.2 12 11Z" fill="#FF4D8D" />
          <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
        </g>

        {/* Face */}
        <ellipse cx="93" cy="78" rx="4" ry="5.5" fill="#3D2A30" />
        <ellipse cx="117" cy="78" rx="4" ry="5.5" fill="#3D2A30" />
        <circle cx="94.5" cy="76" r="1.5" fill="#FFF" />
        <circle cx="118.5" cy="76" r="1.5" fill="#FFF" />
        {/* Cheeks */}
        <circle cx="86" cy="86" r="5" fill="#FF8AAF" opacity="0.6" />
        <circle cx="124" cy="86" r="5" fill="#FF8AAF" opacity="0.6" />
        {/* Nose & Smile */}
        <polygon points="105,82 102,80 108,80" fill="#FF4D8D" />
        <path d="M100 87Q105 92 105 87Q105 92 110 87" stroke="#3D2A30" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        {/* Whiskers */}
        <line x1="75" y1="80" x2="62" y2="78" stroke="#FFF" strokeWidth="1.5" />
        <line x1="75" y1="84" x2="60" y2="86" stroke="#FFF" strokeWidth="1.5" />
        <line x1="135" y1="80" x2="148" y2="78" stroke="#FFF" strokeWidth="1.5" />
        <line x1="135" y1="84" x2="150" y2="86" stroke="#FFF" strokeWidth="1.5" />

        {/* Paws holding coin */}
        <ellipse cx="95" cy="115" rx="6" ry="5" fill="#FFF5F8" />
        <ellipse cx="115" cy="115" rx="6" ry="5" fill="#FFF5F8" />
      </svg>
    </div>
  );
}

// 2. Cat Empty Cart / Empty State Mascot
export function IllustCatEmpty({ className = "w-44 h-44" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 180 180" fill="none" className="w-full h-full">
        <circle cx="90" cy="100" r="65" fill="#FFF5F8" />
        <circle cx="90" cy="100" r="48" fill="#FFE4EC" opacity="0.5" />

        {/* Shopping bag with bow */}
        <rect x="55" y="90" width="70" height="55" rx="12" fill="#FFF" stroke="#FFC9DA" strokeWidth="3" />
        <path d="M72 90 C72 75 108 75 108 90" stroke="#FF8AAF" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        
        {/* Cat inside/behind bag */}
        <ellipse cx="90" cy="80" rx="22" ry="18" fill="#FF8AAF" />
        {/* Ears */}
        <polygon points="72,70 76,52 87,65" fill="#FF8AAF" />
        <polygon points="108,70 104,52 93,65" fill="#FF8AAF" />
        <polygon points="74,68 77,56 85,64" fill="#FFC9DA" />
        <polygon points="106,68 103,56 95,64" fill="#FFC9DA" />

        {/* Cat eyes curious */}
        <ellipse cx="82" cy="78" rx="3" ry="4" fill="#3D2A30" />
        <ellipse cx="98" cy="78" rx="3" ry="4" fill="#3D2A30" />
        <circle cx="83" cy="76.5" r="1" fill="#FFF" />
        <circle cx="99" cy="76.5" r="1" fill="#FFF" />
        {/* Nose */}
        <polygon points="90,82 88,80 92,80" fill="#FF4D8D" />
        <path d="M86 85 Q90 88 90 85 Q90 88 94 85" stroke="#3D2A30" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Ribbon Bow on Shopping Bag */}
        <g transform="translate(90, 110) scale(0.8)">
          <path d="M12 11C11.2 8.2 7.8 4.8 4.5 7C1.5 9.2 4.2 13.2 9.5 13.5L6.5 21.5L11 18.8L12 17.2L13 18.8L17.5 21.5L14.5 13.5C19.8 13.2 22.5 9.2 19.5 7C16.2 4.8 12.8 8.2 12 11Z" fill="#FF4D8D" />
          <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );
}

// 3. Cat Success Payment Mascot
export function IllustCatSuccess({ className = "w-44 h-44" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 180 180" fill="none" className="w-full h-full bounce-in">
        <circle cx="90" cy="90" r="70" fill="#E6F8EE" />
        
        {/* Gold Coins & Ribbon sparks */}
        <circle cx="45" cy="65" r="14" fill="#F5C56B" stroke="#FFF" strokeWidth="2" />
        <text x="45" y="70" textAnchor="middle" fill="#FFF" fontSize="12" fontWeight="bold">₫</text>

        <circle cx="135" cy="65" r="14" fill="#F5C56B" stroke="#FFF" strokeWidth="2" />
        <text x="135" y="70" textAnchor="middle" fill="#FFF" fontSize="12" fontWeight="bold">₫</text>

        {/* Cat Winking Happily */}
        <ellipse cx="90" cy="100" rx="30" ry="24" fill="#FF6D9E" />
        <polygon points="63,85 68,62 82,78" fill="#FF6D9E" />
        <polygon points="117,85 112,62 98,78" fill="#FF6D9E" />

        {/* Ribbon Bow */}
        <g transform="translate(68, 60) scale(0.7)">
          <path d="M12 11C11.2 8.2 7.8 4.8 4.5 7C1.5 9.2 4.2 13.2 9.5 13.5L6.5 21.5L11 18.8L12 17.2L13 18.8L17.5 21.5L14.5 13.5C19.8 13.2 22.5 9.2 19.5 7C16.2 4.8 12.8 8.2 12 11Z" fill="#FF4D8D" />
          <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
        </g>

        {/* Happy Eyes */}
        <path d="M76 96 Q82 90 88 96" stroke="#3D2A30" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M92 96 Q98 90 104 96" stroke="#3D2A30" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        
        {/* Checkmark Badge */}
        <circle cx="90" cy="138" r="14" fill="#7ED9A8" stroke="#FFF" strokeWidth="2" />
        <path d="M84 138 L88 142 L96 134" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// 4. Cat Admin No Data Mascot
export function IllustCatAdminNoData({ className = "w-44 h-44" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 180 180" fill="none" className="w-full h-full">
        <circle cx="90" cy="90" r="65" fill="#F7EEF2" />
        
        {/* Cat looking with Magnifying Glass */}
        <ellipse cx="90" cy="95" rx="28" ry="22" fill="#FF8AAF" />
        <polygon points="65,80 70,60 84,75" fill="#FF8AAF" />
        <polygon points="115,80 110,60 96,75" fill="#FF8AAF" />
        
        {/* Eyes wide */}
        <circle cx="80" cy="92" r="4" fill="#3D2A30" />
        <circle cx="100" cy="92" r="4" fill="#3D2A30" />
        <circle cx="81" cy="90" r="1.2" fill="#FFF" />
        <circle cx="101" cy="90" r="1.2" fill="#FFF" />

        {/* Magnifying Glass */}
        <circle cx="115" cy="105" r="16" fill="none" stroke="#FF4D8D" strokeWidth="4" />
        <line x1="126" y1="116" x2="140" y2="130" stroke="#FF4D8D" strokeWidth="5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
