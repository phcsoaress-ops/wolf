import React from 'react';

// Deterministic hue from the name so each player keeps a stable colour.
function hueFromName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}

interface AvatarProps {
  name: string;
  size?: number;        // px
  dead?: boolean;
  highlight?: boolean;  // draws a glowing ring (e.g. selected / acted)
  className?: string;
}

export function Avatar({ name, size = 44, dead = false, highlight = false, className = '' }: AvatarProps) {
  const initial = (name?.trim()?.[0] || '?').toUpperCase();
  const hue = hueFromName(name || '');
  const bg = `hsl(${hue} 65% 42%)`;
  const ring = highlight ? `0 0 0 3px hsl(${hue} 90% 70%)` : 'none';

  return (
    <div
      className={`flex items-center justify-center rounded-full font-extrabold select-none shrink-0 ${dead ? 'opacity-40 grayscale' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        background: bg,
        boxShadow: ring,
        fontSize: size * 0.42,
        color: 'white',
        textShadow: '0 1px 2px rgba(0,0,0,0.45)',
      }}
      aria-label={name}
      title={name}
    >
      {initial}
    </div>
  );
}
