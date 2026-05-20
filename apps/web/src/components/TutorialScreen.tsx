import { useState, useEffect, useCallback } from 'react';
import { ParticleBackground } from './ParticleBackground';
import { playWhoosh, playSuccess, playClick } from '../soundEngine';

type Panel = {
  step: number;
  icon: string;
  title: string;
  text: string;
  subtext: string;
  hint: string;
  bg: string;
  accent: string;
  glow: string;
  particles: string[];
  isFinal?: boolean;
};

const PANELS: Panel[] = [
  {
    step: 0,
    icon: '🏛️',
    title: 'FORM QUEST',
    text: 'Build forms that feel like an adventure — not a chore.',
    subtext: "A cinematic form builder with 6 worlds, 6 runners, 17+ field types, real-time preview, version history, and instant sharing.",
    hint: 'CLICK ANYWHERE TO ADVANCE',
    bg: 'radial-gradient(ellipse at 50% 20%, #1a0a00 0%, #0d0800 50%, #060605 100%)',
    accent: '#ffd700',
    glow: '#cc9900',
    particles: ['⭐', '✨', '🌟', '💫', '🏛️'],
  },
  {
    step: 1,
    icon: '🏃',
    title: 'STEP 1: CHOOSE YOUR RUNNER',
    text: 'Pick your avatar from 6 legendary characters — each with unique stats, lore, and a special ability.',
    subtext: "Guy Dangerous, Scarlett Fox, Barry Bones, Karma Lee, Montana Smith, Francisco Montoya. Each one runs differently. Each one has a story.",
    hint: '6 LEGENDARY CHARACTERS → SPEED · POWER · AGILITY',
    bg: 'radial-gradient(ellipse at 30% 40%, #1a0050 0%, #0a0020 55%, #040012 100%)',
    accent: '#b39ddb',
    glow: '#7c4dff',
    particles: ['🏃', '💀', '🦊', '⚔️', '🐉', '🪖'],
  },
  {
    step: 2,
    icon: '🌍',
    title: 'STEP 2: ENTER YOUR WORLD',
    text: 'Six worlds. Each one sounds, looks, and feels completely different.',
    subtext: "Jungle, Snow, Desert, Space, Underwater, Volcano — your chosen world sets the visual theme for your entire form. When you enter, a cinematic story plays.",
    hint: 'WORLD THEME = FORM THEME → AMBIENT SOUNDS INCLUDED',
    bg: 'radial-gradient(ellipse at 70% 30%, #0d1f0d 0%, #050a04 55%, #020401 100%)',
    accent: '#5ab55a',
    glow: '#3a9a3a',
    particles: ['🌴', '❄️', '🏜️', '🚀', '🌊', '🌋'],
  },
  {
    step: 3,
    icon: '🔧',
    title: 'STEP 3: BUILD YOUR FORM',
    text: 'The left palette has 17+ field types. Click any field to add it instantly.',
    subtext: "Text, email, phone, dropdowns, ratings, sliders, file uploads, currency fields, section dividers. Or drop a whole Collection — Bank Details, Address Block, or Tax Info in one click.",
    hint: 'PALETTE → FIELD TYPES + COLLECTIONS → DRAG TO REORDER',
    bg: 'radial-gradient(ellipse at 50% 80%, #1a0800 0%, #0d0400 55%, #060200 100%)',
    accent: '#ffd700',
    glow: '#cc8800',
    particles: ['📋', '🔧', '✏️', '📦', '🎯', '⚡'],
  },
  {
    step: 4,
    icon: '✏️',
    title: 'STEP 4: CUSTOMIZE FIELDS',
    text: 'Click any field in the canvas to open its editor — three tabs of options.',
    subtext: "Basic tab: label, placeholder, required toggle. Rules tab: min/max length, validation presets (PAN, GST, IFSC, email, URL). Display tab: half-width layout, section headers.",
    hint: '3-TAB EDITOR → BASIC · RULES · DISPLAY',
    bg: 'radial-gradient(ellipse at 60% 20%, #001428 0%, #000a18 55%, #000508 100%)',
    accent: '#00e5ff',
    glow: '#00aacc',
    particles: ['⚙️', '✏️', '🎨', '📐', '🔒', '✅'],
  },
  {
    step: 5,
    icon: '🕐',
    title: 'STEP 5: PUBLISH & SHARE',
    text: "Hit VERSIONS to save named snapshots — restore any old version instantly. Hit SHARE to copy a link.",
    subtext: "Anyone with your share link can fill the form in their browser — no account, no setup, no friction. The form renders in your exact world theme.",
    hint: '🕐 VERSIONS = SAVE HISTORY → 🔗 SHARE = INSTANT LINK',
    bg: 'radial-gradient(ellipse at 40% 60%, #001a00 0%, #000d00 55%, #000400 100%)',
    accent: '#69f0ae',
    glow: '#00c853',
    particles: ['🔗', '🕐', '📤', '💾', '✨', '🌐'],
  },
  {
    step: 6,
    icon: '⚡',
    title: 'YOU ARE READY TO RUN',
    text: 'Choose your runner. Enter your world. Build something legendary.',
    subtext: "The demons are already running. The idol is in your hands. The clock started the moment you entered the temple.",
    hint: '',
    bg: 'radial-gradient(ellipse at 50% 50%, #1a0500 0%, #0d0700 55%, #060800 100%)',
    accent: '#ffd700',
    glow: '#cc8800',
    particles: ['🏛️', '⚡', '🔥', '💎', '🪙', '✨'],
    isFinal: true,
  },
];

const TYPING_SPEED = 20;
const AUTO_ADVANCE = 5200;

type Props = { onComplete: () => void };

export function TutorialScreen({ onComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const [chars, setChars] = useState(0);
  const [showSub, setShowSub] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [fading, setFading] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [cursorOn, setCursorOn] = useState(true);

  const panel = PANELS[idx];
  const isTypingDone = chars >= panel.text.length;

  useEffect(() => {
    setChars(0);
    setShowSub(false);
    setShowHint(false);
    setShowCTA(false);
    setCursorOn(true);
  }, [idx]);

  useEffect(() => {
    if (isTypingDone) return;
    const t = setInterval(() => setCursorOn(v => !v), 480);
    return () => clearInterval(t);
  }, [isTypingDone]);

  useEffect(() => {
    if (isTypingDone) return;
    const t = setTimeout(() => setChars(c => c + 1), TYPING_SPEED);
    return () => clearTimeout(t);
  }, [chars, isTypingDone]);

  useEffect(() => {
    if (!isTypingDone) return;
    const t = setTimeout(() => setShowSub(true), 350);
    return () => clearTimeout(t);
  }, [isTypingDone]);

  useEffect(() => {
    if (!showSub) return;
    const t = setTimeout(() => setShowHint(true), 500);
    return () => clearTimeout(t);
  }, [showSub]);

  useEffect(() => {
    if (!isTypingDone || !showSub) return;
    if (panel.isFinal) {
      const t = setTimeout(() => setShowCTA(true), 700);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => doAdvance(), AUTO_ADVANCE);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTypingDone, showSub, idx]);

  const doAdvance = useCallback(() => {
    if (fading || idx >= PANELS.length - 1) return;
    setFading(true);
    playWhoosh();
    setTimeout(() => { setIdx(i => i + 1); setFading(false); }, 380);
  }, [idx, fading]);

  const handleClick = useCallback(() => {
    if (!isTypingDone) { setChars(panel.text.length); return; }
    if (!panel.isFinal) doAdvance();
  }, [isTypingDone, panel, doAdvance]);

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed', inset: 0, background: panel.bg,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        opacity: fading ? 0 : 1, transition: 'opacity 0.38s ease',
        cursor: panel.isFinal ? 'default' : 'pointer',
      }}
    >
      <ParticleBackground particles={panel.particles} count={18} />

      {/* Scan line */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 4, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: '80px', background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.016) 50%, transparent 100%)', animation: 'scan-line 12s linear infinite' }} />
      </div>

      {/* Letterbox */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60px', background: 'rgba(0,0,0,0.97)', zIndex: 10 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'rgba(0,0,0,0.97)', zIndex: 10 }} />

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60px', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '10px', color: 'rgba(255,215,0,0.38)', letterSpacing: '0.22em' }}>⚡ FORM QUEST · HOW TO RUN</span>
        <button
          onClick={e => { e.stopPropagation(); playClick(); onComplete(); }}
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '5px', color: 'rgba(255,255,255,0.32)', fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', padding: '4px 14px', cursor: 'pointer', letterSpacing: '0.15em' }}
        >
          SKIP ↠
        </button>
      </div>

      {/* Step dots */}
      <div style={{ position: 'absolute', top: '68px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 20 }}>
        {PANELS.map((_, i) => (
          <div key={i} style={{ width: i === idx ? '28px' : '8px', height: '3px', borderRadius: '2px', background: i <= idx ? panel.accent : 'rgba(255,255,255,0.18)', transition: 'all 0.3s ease' }} />
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 48px', zIndex: 5 }}>

        {/* Icon */}
        <div style={{ fontSize: '88px', marginBottom: '20px', filter: `drop-shadow(0 0 28px ${panel.glow})`, animation: 'float 3s ease-in-out infinite' }}>
          {panel.icon}
        </div>

        {/* Step badge */}
        <div style={{ marginBottom: '20px', background: `${panel.accent}18`, border: `1px solid ${panel.accent}44`, borderRadius: '5px', padding: '4px 18px' }}>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', color: panel.accent, letterSpacing: '0.24em', fontWeight: 700 }}>{panel.title}</span>
        </div>

        {/* Typewriter */}
        <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '21px', lineHeight: 1.6, color: '#fff', textAlign: 'center', maxWidth: '720px', marginBottom: '20px', textShadow: `0 0 28px ${panel.glow}88` }}>
          {panel.text.slice(0, chars)}
          {!isTypingDone && <span style={{ opacity: cursorOn ? 1 : 0, color: panel.accent, transition: 'opacity 0.1s' }}>▊</span>}
        </p>

        {showSub && (
          <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '15px', color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: '620px', letterSpacing: '0.06em', lineHeight: 1.7, animation: 'fade-in 0.5s ease-out' }}>
            {panel.subtext}
          </p>
        )}

        {showHint && panel.hint && !panel.isFinal && (
          <div style={{ marginTop: '24px', fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', color: `${panel.accent}88`, letterSpacing: '0.2em', animation: 'fade-in 0.5s ease-out 0.2s both' }}>
            ● {panel.hint}
          </div>
        )}

        {showCTA && (
          <div style={{ marginTop: '44px', display: 'flex', gap: '16px', animation: 'slide-up 0.6s ease-out' }}>
            <button
              onClick={e => { e.stopPropagation(); playSuccess(); onComplete(); }}
              className="tr-btn"
              style={{
                background: 'linear-gradient(135deg, #5c2800 0%, #8B4513 35%, #cd853f 70%, #ffd700 100%)',
                color: '#0d0500',
                border: 'none',
                borderRadius: '8px',
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: '13px',
                fontWeight: 700,
                padding: '18px 40px',
                cursor: 'pointer',
                letterSpacing: '0.12em',
                boxShadow: '0 0 32px rgba(255,180,0,0.6), 0 6px 24px rgba(0,0,0,0.4)',
                animation: 'pulse-glow 2s ease-in-out infinite',
              }}
            >
              ⚡ ENTER TEMPLE
            </button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {!panel.isFinal && isTypingDone && showSub && (
        <div style={{ position: 'absolute', bottom: '60px', left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.08)', zIndex: 20 }}>
          <div style={{ height: '100%', background: panel.accent, animation: `progress-fill ${AUTO_ADVANCE}ms linear forwards` }} />
        </div>
      )}
    </div>
  );
}
