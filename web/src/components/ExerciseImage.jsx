import React, { useState } from 'react';
import { Dumbbell } from 'lucide-react';

/**
 * Shows /exercises/<id>.webp when that file exists (drop images into web/public/exercises/ and they
 * appear with no code change). Without a file it shows a neutral placeholder, or nothing when
 * `hideIfMissing` is set.
 */
export default function ExerciseImage({ id, name, size = 56, hideIfMissing = false, className = '' }) {
  const [missing, setMissing] = useState(false);
  if (missing && hideIfMissing) return null;
  const box = { width: size, height: size };
  if (missing) {
    return (
      <span aria-hidden="true" style={box} className={`shrink-0 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center ${className}`}>
        <Dumbbell style={{ width: size * 0.4, height: size * 0.4 }} />
      </span>
    );
  }
  return (
    <img
      src={`/exercises/${id}.webp`}
      alt={name}
      style={box}
      loading="lazy"
      onError={() => setMissing(true)}
      className={`shrink-0 rounded-xl object-cover bg-zinc-800 ${className}`}
    />
  );
}
