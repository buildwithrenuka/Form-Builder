import { useState, useEffect, useCallback } from 'react';
import { ParticleBackground } from './ParticleBackground';

type StoryPanel = {
  id: number;
  emoji: string;
  text: string;
  subtext?: string;
  bg: string;
  accentColor: string;
  glowColor: string;
  particles: string[];
  isFinal?: boolean;
};

type Props = {
  playerName: string;
  onComplete: () => void;
  onBack: () => void;
};

const PANELS: StoryPanel[] = [
  {
    id: 0,
    emoji: '🗺️',
    text: 'The year is unknown. Deep within the uncharted jungle, ancient ruins lay hidden for centuries...',
    subtext: 'You have spent your entire life searching for this moment.',
    bg: 'linear-gradient(160deg, #020901 0%, #0b2004 50%, #061503 100%)',
    accentColor: '#90d050',
    glowColor: '#60a030',
    particles: ['🌿', '🍃', '🌺', '✨', '🦋'],
  },
  {
    id: 1,
    emoji: '🏛️',
    text: 'Then you found it. The Ancient Temple — eternal keeper of the Sacred Forms of Power.',
    subtext: 'Every legend warned: whoever enters... never returns.',
    bg: 'linear-gradient(160deg, #030210 0%, #0a0928 50%, #050418 100%)',
    accentColor: '#c8b0ff',
    glowColor: '#8060d0',
    particles: ['✨', '💫', '⭐', '🌟'],
  },
  {
    id: 2,
    emoji: '💎',
    text: 'You entered anyway. You reached the inner chamber. You took the Sacred Idol.',
    subtext: 'The ground began to tremble. Dust fell from the ceiling. That was... a mistake.',
    bg: 'linear-gradient(160deg, #100400 0%, #350e00 50%, #1e0800 100%)',
    accentColor: '#ffd700',
    glowColor: '#cc8800',
    particles: ['💎', '🪙', '⚡', '✨'],
  },
  {
    id: 3,
    emoji: '👹',
    text: 'The Demon Guardians have awakened. Ancient. Relentless. Right behind you.',
    subtext: 'Run. Build. Survive. It is the only way out.',
    bg: 'linear-gradient(160deg, #080000 0%, #1f0000 50%, #120000 100%)',
    accentColor: '#ff5050',
    glowColor: '#cc0000',
    particles: ['🔥', '💀', '⚡', '👹'],
  },
  {
    id: 4,
    emoji: '⚡',
    text: 'This is your moment of destiny.',
    subtext: '',
    bg: 'linear-gradient(160deg, #060500 0%, #181200 50%, #221a00 100%)',
    accentColor: '#ffd700',
    glowColor: '#cc9900',
    particles: ['⭐', '🌟', '💫', '✨', '🪙'],
    isFinal: true,
  },
];

// Auto-advance timer in ms (non-final panels)
const AUTO_ADVANCE_MS = 3800;
const TYPING_SPEED_MS = 34;

export function StoryIntro({ playerName, onComplete, onBack }: Props) {
  const [panelIndex, setPanelIndex] = useState(0);
  const [displayedChars, setDisplayedChars] = useState(0);
  const [showSubtext, setShowSubtext] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  const panel = PANELS[panelIndex];
  const fullText = panel.text;
  const isTypingDone = displayedChars >= fullText.length;
  const displayedText = fullText.slice(0, displayedChars);

  // Subtext for final panel uses playerName
  const subtext = panel.isFinal
    ? `Are you ready, ${playerName}? Choose your runner. Enter your world. Build before the demons catch you!`
    : panel.subtext;

  // Reset state when panel changes
  useEffect(() => {
    setDisplayedChars(0);
    setShowSubtext(false);
  }, [panelIndex]);

  // Typewriter: tick one char at a time
  useEffect(() => {
    if (isTypingDone) return;
    const t = setTimeout(
      () => setDisplayedChars((c) => c + 1),
      TYPING_SPEED_MS
    );
    return () => clearTimeout(t);
  }, [displayedChars, isTypingDone]);

  // Show subtext shortly after typing finishes
  useEffect(() => {
    if (!isTypingDone) return;
    const t = setTimeout(() => setShowSubtext(true), 380);
    return () => clearTimeout(t);
  }, [isTypingDone]);

  // Auto-advance non-final panels after subtext appears
  useEffect(() => {
    if (!isTypingDone || !showSubtext || panel.isFinal) return;
    const t = setTimeout(() => doAdvance(), AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTypingDone, showSubtext, panelIndex]);

  const doAdvance = useCallback(() => {
    if (fadingOut) return;
    if (panelIndex >= PANELS.length - 1) return;
    setFadingOut(true);
    setTimeout(() => {
      setPanelIndex((p) => p + 1);
      setFadingOut(false);
    }, 380);
  }, [panelIndex, fadingOut]);

  const handleScreenClick = useCallback(() => {
    if (!isTypingDone) {
      // Skip typing → jump to end
      setDisplayedChars(fullText.length);
    } else if (!panel.isFinal) {
      doAdvance();
    }
  }, [isTypingDone, panel.isFinal, fullText.length, doAdvance]);

  // Auto-progress bar width (resets each panel)
  const progressKey = `${panelIndex}-${showSubtext}`;

  return (
    <div
      onClick={handleScreenClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: panel.bg,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: panel.isFinal && isTypingDone ? 'default' : 'pointer',
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 0.38s ease',
      }}
    >
      <ParticleBackground particles={panel.particles} count={14} />

      {/* ── Scan line overlay ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '100px',
            background:
              'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.018) 50%, transparent 100%)',
            animation: 'scan-line 10s linear infinite',
          }}
        />
      </div>

      <button
        onClick={(event) => {
          event.stopPropagation();
          onBack();
        }}
        style={{
          position: 'absolute',
          top: 18,
          left: 20,
          zIndex: 30,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 9,
          color: '#fff',
          fontSize: 12,
          fontWeight: 700,
          padding: '8px 16px',
          cursor: 'pointer',
          fontFamily: "'Rajdhani', sans-serif",
          letterSpacing: '0.08em',
        }}
      >
        ← Back
      </button>

      {/* ── Cinematic TOP bar ── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '56px',
          background: 'rgba(0,0,0,0.97)',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <div
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: '11px',
            color: 'rgba(255,215,0,0.35)',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
          }}
        >
          ⚡ FormVerse
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete();
          }}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '5px',
            color: 'rgba(255,255,255,0.35)',
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '11px',
            fontWeight: 600,
            padding: '5px 14px',
            cursor: 'pointer',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.color = '#fff';
            b.style.borderColor = 'rgba(255,255,255,0.45)';
          }}
          onMouseLeave={(e) => {
            const b = e.currentTarget as HTMLButtonElement;
            b.style.color = 'rgba(255,255,255,0.35)';
            b.style.borderColor = 'rgba(255,255,255,0.15)';
          }}
        >
          SKIP ↠
        </button>
      </div>

      {/* ── Story content area ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          flex: 1,
          marginTop: '56px',
          marginBottom: '68px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 clamp(24px, 8vw, 120px)',
          textAlign: 'center',
        }}
      >
        {/* Chapter label */}
        <div
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '11px',
            color: `${panel.accentColor}55`,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            marginBottom: '32px',
            animation: 'fade-in 0.6s ease-out both',
          }}
        >
          CHAPTER {panelIndex + 1} OF {PANELS.length}
        </div>

        {/* Main emoji — floats */}
        <div
          style={{
            fontSize: 'clamp(68px, 11vw, 104px)',
            marginBottom: '36px',
            animation: 'float 4.5s ease-in-out infinite',
            filter: `drop-shadow(0 0 22px ${panel.glowColor}) drop-shadow(0 0 50px ${panel.glowColor}55)`,
            display: 'inline-block',
          }}
        >
          {panel.emoji}
        </div>

        {/* Main text with typewriter cursor */}
        <div
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: 'clamp(15px, 2.4vw, 26px)',
            fontWeight: 700,
            color: panel.accentColor,
            lineHeight: 1.6,
            maxWidth: '720px',
            letterSpacing: '0.02em',
            minHeight: '90px',
            filter: `drop-shadow(0 0 10px ${panel.glowColor}88)`,
          }}
        >
          {displayedText}
          {!isTypingDone && (
            <span
              style={{
                display: 'inline-block',
                width: '3px',
                height: '1em',
                background: panel.accentColor,
                marginLeft: '4px',
                verticalAlign: 'text-bottom',
                animation: 'cursor-blink 0.75s step-end infinite',
              }}
            />
          )}
        </div>

        {/* Subtext fades in */}
        {showSubtext && subtext && (
          <p
            style={{
              fontFamily: "'Exo 2', sans-serif",
              fontSize: 'clamp(13px, 1.8vw, 19px)',
              fontStyle: 'italic',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.48)',
              marginTop: '24px',
              maxWidth: '580px',
              lineHeight: 1.6,
              letterSpacing: '0.04em',
              animation: 'slide-up 0.55s ease-out both',
            }}
          >
            {subtext}
          </p>
        )}

        {/* ── Final panel CTA ── */}
        {panel.isFinal && isTypingDone && showSubtext && (
          <div style={{ animation: 'stone-reveal 0.55s ease-out 0.1s both' }}>
            {/* Gold coin row */}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'center',
                marginTop: '32px',
                marginBottom: '28px',
              }}
            >
              {['🪙', '🌟', '⚡', '🌟', '🪙'].map((e, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '26px',
                    animation: `bounce 1.2s ease-in-out ${i * 0.1}s infinite`,
                    filter: 'drop-shadow(0 0 8px #ffd700)',
                  }}
                >
                  {e}
                </span>
              ))}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete();
              }}
              className="tr-btn"
              style={{
                background:
                  'linear-gradient(135deg, #6B2F0D 0%, #cd853f 30%, #ffd700 60%, #f7931e 100%)',
                color: '#1a0800',
                fontSize: 'clamp(14px, 2vw, 18px)',
                padding: '18px 52px',
                letterSpacing: '0.2em',
                borderRadius: '8px',
                boxShadow:
                  '0 0 32px rgba(255,215,0,0.5), 0 0 64px rgba(255,215,0,0.2), 0 6px 24px rgba(0,0,0,0.6)',
                animation: 'pulse-glow 2.5s ease-in-out infinite',
              }}
            >
              ⚡ BEGIN YOUR QUEST
            </button>
          </div>
        )}

        {/* Click-to-continue hint (non-final) */}
        {!panel.isFinal && isTypingDone && showSubtext && (
          <div
            style={{
              marginTop: '36px',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '12px',
              color: 'rgba(255,255,255,0.2)',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              animation: 'flicker 2.5s ease-in-out infinite',
            }}
          >
            CLICK TO CONTINUE ▶
          </div>
        )}

        {/* Auto-advance progress bar (non-final) */}
        {!panel.isFinal && isTypingDone && showSubtext && (
          <div
            style={{
              marginTop: '16px',
              width: '140px',
              height: '2px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '1px',
              overflow: 'hidden',
            }}
          >
            <div
              key={progressKey}
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${panel.accentColor}88, ${panel.accentColor})`,
                borderRadius: '1px',
                animation: `progress-fill ${AUTO_ADVANCE_MS}ms linear both`,
              }}
            />
          </div>
        )}
      </div>

      {/* ── Cinematic BOTTOM bar ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '68px',
          background: 'rgba(0,0,0,0.97)',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        {PANELS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === panelIndex ? '28px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background:
                i === panelIndex
                  ? panel.accentColor
                  : i < panelIndex
                  ? 'rgba(255,255,255,0.28)'
                  : 'rgba(255,255,255,0.1)',
              transition: 'all 0.35s ease',
              boxShadow:
                i === panelIndex ? `0 0 10px ${panel.accentColor}` : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}
