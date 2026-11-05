import React, { useState } from 'react';
import EquipmentBadge from './EquipmentBadge';

/**
 * Shows /exercises/<id>.webp when that file exists.
 * When missing, displays the high-fidelity EquipmentBadge according to its apparatus
 * (Barbell, Dumbbells, Cable, Machine, Smith, Bodyweight).
 */
export default function ExerciseImage({ id, name, equipment = '', size = 56, hideIfMissing = false, className = '' }) {
  const [missing, setMissing] = useState(false);
  if (missing && hideIfMissing) return null;

  if (missing) {
    return <EquipmentBadge equipment={equipment || name || ''} size={size} className={className} />;
  }

  return (
    <img
      src={`/exercises/${id}.webp`}
      alt={name}
      style={{ width: size, height: size }}
      loading="lazy"
      onError={() => setMissing(true)}
      className={`shrink-0 rounded-xl object-cover bg-zinc-800 ${className}`}
    />
  );
}
