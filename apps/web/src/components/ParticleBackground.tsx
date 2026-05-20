import { useEffect, useMemo, useRef } from 'react';

type Particle = {
  id: number;
  emoji: string;
  left: number;
  duration: number;
  delay: number;
  size: number;
};

type Props = {
  particles: string[];
  count?: number;
};

export function ParticleBackground({ particles, count = 22 }: Props) {
  const items = useMemo<Particle[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        emoji: particles[i % particles.length],
        left: (i / count) * 100 + Math.random() * (100 / count),
        duration: 9 + Math.random() * 14,
        delay: Math.random() * 12,
        size: 14 + Math.random() * 18,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [particles.join('')]
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {items.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: '-80px',
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animation: `particle-fall ${p.duration}s linear ${p.delay}s infinite`,
            opacity: 0.55,
            userSelect: 'none',
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

type StarFieldProps = { count?: number };

export function StarField({ count = 80 }: StarFieldProps) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 1 + Math.random() * 2.5,
        delay: Math.random() * 4,
        duration: 2 + Math.random() * 3,
      })),
    []
  );

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {stars.map((s) => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: '50%',
            background: '#fff',
            animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function RunnerCharacter({ color = '#ffd700' }: { color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        bottom: '80px',
        fontSize: '48px',
        animation: 'runner 6s linear infinite',
        zIndex: 2,
        filter: `drop-shadow(0 0 8px ${color})`,
      }}
    >
      🏃
    </div>
  );
}
