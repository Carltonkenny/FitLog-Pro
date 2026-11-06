import React from 'react';

/**
 * High-fidelity vector badges for the 6 core gym apparatuses.
 * Replaces missing photos with authentic, tactile equipment representations.
 */
export default function EquipmentBadge({ equipment = '', size = 48, className = '' }) {
  const eq = equipment.toLowerCase();
  const boxStyle = { width: size, height: size };

  // 1. Olympic Barbell
  if (eq.includes('barbell')) {
    return (
      <div
        style={boxStyle}
        className={`shrink-0 rounded-xl bg-zinc-850 border border-white/[0.08] flex items-center justify-center p-1.5 shadow-sm group-hover:border-emerald-500/30 transition ${className}`}
        title="Olympic Barbell (20kg / 45lb)"
      >
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
          {/* Steel Bar Sleeve */}
          <rect x="4" y="30" width="56" height="4" rx="2" fill="#94a3b8" />
          <rect x="8" y="28" width="8" height="8" rx="1" fill="#cbd5e1" />
          <rect x="48" y="28" width="8" height="8" rx="1" fill="#cbd5e1" />
          {/* Outer Collars */}
          <rect x="18" y="26" width="3" height="12" rx="1" fill="#64748b" />
          <rect x="43" y="26" width="3" height="12" rx="1" fill="#64748b" />
          {/* Olympic 20kg Red / Blue Bumper Plates */}
          <rect x="13" y="14" width="4" height="36" rx="2" fill="#ef4444" />
          <rect x="47" y="14" width="4" height="36" rx="2" fill="#ef4444" />
          <rect x="9" y="18" width="3.5" height="28" rx="1.5" fill="#3b82f6" />
          <rect x="51.5" y="18" width="3.5" height="28" rx="1.5" fill="#3b82f6" />
          {/* Knurling center marks */}
          <line x1="26" y1="32" x2="38" y2="32" stroke="#64748b" strokeWidth="1" strokeDasharray="1 1" />
        </svg>
      </div>
    );
  }

  // 2. Dumbbells
  if (eq.includes('dumbbell')) {
    return (
      <div
        style={boxStyle}
        className={`shrink-0 rounded-xl bg-zinc-850 border border-white/[0.08] flex items-center justify-center p-1.5 shadow-sm group-hover:border-emerald-500/30 transition ${className}`}
        title="Hex Dumbbells"
      >
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
          {/* Diagonal Handle */}
          <line x1="22" y1="22" x2="42" y2="42" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
          {/* Chrome Knurling */}
          <line x1="27" y1="27" x2="37" y2="37" stroke="#64748b" strokeWidth="2" strokeDasharray="1 1" />
          {/* Top-Left Hex Head */}
          <polygon
            points="14,24 22,16 28,22 26,32 18,36 12,30"
            fill="#334155"
            stroke="#10b981"
            strokeWidth="1.5"
          />
          {/* Bottom-Right Hex Head */}
          <polygon
            points="38,48 46,40 52,46 50,56 42,60 36,54"
            fill="#334155"
            stroke="#10b981"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    );
  }

  // 3. Cable Tower / Pulley
  if (eq.includes('cable')) {
    return (
      <div
        style={boxStyle}
        className={`shrink-0 rounded-xl bg-zinc-850 border border-white/[0.08] flex items-center justify-center p-1.5 shadow-sm group-hover:border-emerald-500/30 transition ${className}`}
        title="Cable Station"
      >
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
          {/* Cable Column Frame */}
          <rect x="18" y="8" width="6" height="48" rx="2" fill="#334155" />
          <circle cx="21" cy="14" r="4" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Steel Cable wire */}
          <path d="M21 18 L21 28 L42 36" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          {/* D-Handle Attachment */}
          <path d="M42 36 C46 38 48 44 45 48 C42 51 38 48 42 36" stroke="#10b981" strokeWidth="2" fill="none" />
          <rect x="42" y="44" width="7" height="3" rx="1" fill="#cbd5e1" transform="rotate(30 42 44)" />
          {/* Weight Stack */}
          <rect x="12" y="34" width="18" height="20" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          <line x1="12" y1="38" x2="30" y2="38" stroke="#334155" />
          <line x1="12" y1="42" x2="30" y2="42" stroke="#334155" />
          <line x1="12" y1="46" x2="30" y2="46" stroke="#334155" />
          <line x1="12" y1="50" x2="30" y2="50" stroke="#334155" />
          {/* Selector Pin */}
          <circle cx="21" cy="42" r="1.5" fill="#f59e0b" />
        </svg>
      </div>
    );
  }

  // 4. Selectorized Gym Machine
  if (eq.includes('machine') && !eq.includes('smith')) {
    return (
      <div
        style={boxStyle}
        className={`shrink-0 rounded-xl bg-zinc-850 border border-white/[0.08] flex items-center justify-center p-1.5 shadow-sm group-hover:border-emerald-500/30 transition ${className}`}
        title="Gym Machine"
      >
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
          {/* Machine Seat / Pad */}
          <rect x="14" y="34" width="16" height="5" rx="2" fill="#10b981" />
          <rect x="14" y="20" width="5" height="16" rx="2" fill="#10b981" />
          {/* Steel Frame */}
          <path d="M12 48 L18 39 L18 16 L28 16" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          <line x1="12" y1="48" x2="52" y2="48" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          {/* Enclosed Weight Stack Tower */}
          <rect x="36" y="12" width="16" height="36" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          <rect x="40" y="16" width="8" height="28" rx="1" fill="#0f172a" />
          {/* Pin */}
          <circle cx="44" cy="28" r="2" fill="#f59e0b" />
          {/* Lever Arm */}
          <path d="M24 20 L36 18" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 5. Smith Machine
  if (eq.includes('smith')) {
    return (
      <div
        style={boxStyle}
        className={`shrink-0 rounded-xl bg-zinc-850 border border-white/[0.08] flex items-center justify-center p-1.5 shadow-sm group-hover:border-emerald-500/30 transition ${className}`}
        title="Smith Machine"
      >
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
          {/* Vertical Guide Rods */}
          <rect x="16" y="8" width="3" height="48" rx="1.5" fill="#cbd5e1" />
          <rect x="45" y="8" width="3" height="48" rx="1.5" fill="#cbd5e1" />
          {/* Machine Frame */}
          <rect x="12" y="6" width="40" height="4" rx="2" fill="#334155" />
          <rect x="12" y="54" width="40" height="4" rx="2" fill="#334155" />
          {/* Safety Hooks / Notches */}
          <line x1="20" y1="16" x2="23" y2="16" stroke="#64748b" strokeWidth="1.5" />
          <line x1="20" y1="24" x2="23" y2="24" stroke="#64748b" strokeWidth="1.5" />
          <line x1="20" y1="32" x2="23" y2="32" stroke="#64748b" strokeWidth="1.5" />
          <line x1="20" y1="40" x2="23" y2="40" stroke="#64748b" strokeWidth="1.5" />
          {/* Guided Bar */}
          <rect x="10" y="28" width="44" height="4" rx="2" fill="#94a3b8" />
          <rect x="22" y="27" width="20" height="6" rx="2" fill="#10b981" fillOpacity="0.4" stroke="#10b981" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  // 6. Bodyweight / Pull-up Bar
  return (
    <div
      style={boxStyle}
      className={`shrink-0 rounded-xl bg-zinc-850 border border-white/[0.08] flex items-center justify-center p-1.5 shadow-sm group-hover:border-emerald-500/30 transition ${className}`}
      title="Bodyweight / Pull-up Bar"
    >
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        {/* Overhead Pull-up Bar */}
        <path d="M10 18 L18 14 L46 14 L54 18" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {/* Wall / Rig Mounts */}
        <line x1="18" y1="14" x2="18" y2="28" stroke="#475569" strokeWidth="2.5" />
        <line x1="46" y1="14" x2="46" y2="28" stroke="#475569" strokeWidth="2.5" />
        {/* Human Silhouette / Grip icon */}
        <circle cx="32" cy="30" r="5" fill="#10b981" />
        <path d="M22 46 C22 38 42 38 42 46" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <line x1="25" y1="20" x2="39" y2="20" stroke="#34d399" strokeWidth="2" strokeDasharray="2 2" />
      </svg>
    </div>
  );
}

