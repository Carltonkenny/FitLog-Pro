import React from 'react';

const MOUTH = {
  happy: 'M 24 40 Q 32 47 40 40',
  pumped: 'M 22 38 Q 32 52 42 38 Z',
  sleepy: 'M 27 42 Q 32 44 37 42',
  thinking: 'M 27 43 L 37 43',
};

/** The companion's face. Mood: happy, pumped (recent record), sleepy (idle days) or thinking. */
export default function PetAvatar({ mood = 'happy', size = 40, className = '' }) {
  const asleep = mood === 'sleepy';
  const up = mood === 'thinking' ? -2 : 0;
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label={`Companion looks ${mood}`}
      className={`${asleep ? '' : 'pet-bob'} ${className}`}
    >
      {/* dumbbell "ears" */}
      <rect x="2" y="24" width="8" height="16" rx="3" fill="#00B873" />
      <rect x="54" y="24" width="8" height="16" rx="3" fill="#00B873" />
      <rect x="9" y="30" width="6" height="4" rx="2" fill="#00B873" />
      <rect x="49" y="30" width="6" height="4" rx="2" fill="#00B873" />
      {/* body */}
      <circle cx="32" cy="34" r="20" fill="#00F59B" />
      <circle cx="32" cy="34" r="20" fill="none" stroke="#00D485" strokeWidth="2" />
      {/* eyes */}
      {asleep ? (
        <>
          <path d="M 21 31 Q 25 34 29 31" stroke="#07120D" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M 35 31 Q 39 34 43 31" stroke="#07120D" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <text x="46" y="18" fontSize="9" fontWeight="700" fill="#00F59B">z</text>
        </>
      ) : (
        <>
          <circle cx="25" cy={31 + up} r="3.2" fill="#07120D" />
          <circle cx="39" cy={31 + up} r="3.2" fill="#07120D" />
          <circle cx="26" cy={30 + up} r="1" fill="#fff" />
          <circle cx="40" cy={30 + up} r="1" fill="#fff" />
        </>
      )}
      {mood === 'pumped' && (
        <>
          <path d="M 20 25 L 29 27" stroke="#07120D" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M 44 25 L 35 27" stroke="#07120D" strokeWidth="2.4" strokeLinecap="round" />
        </>
      )}
      <path d={MOUTH[mood] || MOUTH.happy} stroke="#07120D" strokeWidth="2.4" fill={mood === 'pumped' ? '#07120D' : 'none'} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
