import { useState, useEffect, useCallback } from 'react';
import { WorldTheme, Avatar } from '../types';
import { ParticleBackground } from './ParticleBackground';
import { startWorldAmbient, playWhoosh, playSuccess } from '../soundEngine';

type Panel = { icon: string; text: string; subtext: string; isFinal?: boolean };

const WORLD_PANELS: Record<string, Panel[]> = {
  jungle: [
    {
      icon: '🌿',
      text: 'The jungle remembers who stole from it.',
      subtext: "Three hundred vines just turned in your direction. Something ancient — and hungry — has woken up.",
    },
    {
      icon: '👹',
      text: 'Demon eyes ignite between the ruins. They have been waiting for exactly this.',
      subtext: "The screams echoing through the corridors are the last recordings of people who hesitated.",
    },
    {
      icon: '💎',
      text: "Build the Sacred Form. Channel the idol's stolen power before the jungle closes the path you came from.",
      subtext: "One runner. One chance. The jungle is already moving.",
      isFinal: true,
    },
  ],
  snow: [
    {
      icon: '🌨️',
      text: 'The blizzard answers to nothing — not reason, not desperation, not will.',
      subtext: "The frozen temple has had no visitors in three centuries. It has been saving its patience for you.",
    },
    {
      icon: '🧊',
      text: 'Ice demons rise through the floor. Ancient. Patient. Absolutely certain.',
      subtext: "Your body heat is betraying your exact location to things that were old when the ice was young.",
    },
    {
      icon: '❄️',
      text: 'Forge the Frost Form before the blizzard erases all evidence you were ever here.',
      subtext: "The cold doesn't kill quickly. It waits. Build fast.",
      isFinal: true,
    },
  ],
  desert: [
    {
      icon: '🏺',
      text: "The Pharaoh's curse does not sleep. It accumulates.",
      subtext: "Five thousand years of concentrated fury — and you just walked into the middle of all of it.",
    },
    {
      icon: '🐍',
      text: "Mummies unwind from beneath the dunes — soldiers of an empire that refused to stay buried.",
      subtext: "The heat isn't the desert. It's the rage of something that has been waiting underground for millennia.",
    },
    {
      icon: '⭐',
      text: "Inscribe the Pharaoh's Form before the sands decide you belong beneath them permanently.",
      subtext: "Every grain is counting down. Move.",
      isFinal: true,
    },
  ],
  space: [
    {
      icon: '🌌',
      text: 'No air. No gravity. No mercy. The cosmic temple bridges six light-years of pure void.',
      subtext: "Earth is a pale dot somewhere behind you. That information is not currently useful.",
    },
    {
      icon: '👾',
      text: 'Alien demon-constructs materialize from folded space — entities that predate the solar system.',
      subtext: "Their weapons are light itself. Their patience is literally eternal. Yours is not.",
    },
    {
      icon: '🚀',
      text: "Encode the Celestial Form. The universe arranged this exact moment. Do not waste the cosmos's faith.",
      subtext: "Physics is optional here. The form is not. BUILD.",
      isFinal: true,
    },
  ],
  underwater: [
    {
      icon: '🌊',
      text: 'Twelve thousand meters below the surface. Pressure that turns diamonds to dust.',
      subtext: "The drowned temple existed before the continents separated. It has been waiting the entire time.",
    },
    {
      icon: '🦑',
      text: "Bioluminescent demons materialize from the darkness below — older than any creature with a name.",
      subtext: "Your oxygen gauge is lying. Time works differently at this depth.",
    },
    {
      icon: '💠',
      text: 'Decrypt the Aqua Form before the depth makes your decision for you.',
      subtext: "Something massive is rising from below. Enormous. Ancient. BUILD NOW.",
      isFinal: true,
    },
  ],
  volcano: [
    {
      icon: '🌋',
      text: 'The mountain is alive. Furious. And it is pointing directly at you.',
      subtext: "Magma has replaced three corridors since you entered. The mountain just doesn't want witnesses.",
    },
    {
      icon: '🔥',
      text: "Lava demons rise from the planet's core. They ARE the fire. They have always been here.",
      subtext: "Their touch doesn't burn. It absorbs. You would become part of the magma. That is not a metaphor.",
    },
    {
      icon: '💥',
      text: 'Ignite the Ember Form. The volcano holds the most powerful form ever forged. Claim it before it claims you.',
      subtext: "Either you build it, or you become it.",
      isFinal: true,
    },
  ],
  heaven: [
    {
      icon: '☁️',
      text: 'The gates opened for exactly 0.3 seconds. You barely made it. The angels are re-evaluating their criteria.',
      subtext: "The sky here doesn't have a floor. The clouds part politely for those who deserve to fall.",
    },
    {
      icon: '🏹',
      text: 'Celestial guardians descend — radiant, merciless, absolutely certain of your unworthiness.',
      subtext: "They have never failed a test. You are not the exception they have been waiting for.",
    },
    {
      icon: '✨',
      text: 'Forge the Sacred Form in the light. This is your one act of grace. Make it legendary.',
      subtext: "The gates are already closing. Earn your place — or fall forever.",
      isFinal: true,
    },
  ],
  hell: [
    {
      icon: '😈',
      text: 'You took a wrong turn. Several, actually. The underworld has been expecting you.',
      subtext: "The heat is not the problem. The problem is that the demons look genuinely happy to see you.",
    },
    {
      icon: '🔥',
      text: 'Arch-demons from the seventh circle give chase — entities cast out of hell for excessive enthusiasm.',
      subtext: "The brimstone rivers are rising. The exit you came from no longer exists. Classic.",
    },
    {
      icon: '⛓️',
      text: 'Build the Infernal Form. Claim your contract before the underworld claims your soul.',
      subtext: "The dark lords are watching. Impress them, or become them.",
      isFinal: true,
    },
  ],
  flower: [
    {
      icon: '🌸',
      text: 'The garden was paradise once. The flowers remember that. They have spent three centuries resenting it.',
      subtext: "Every petal is a trap. Every blossom exhales poison. The sweetest scent you have ever smelled means you are already surrounded.",
    },
    {
      icon: '🦋',
      text: 'Pollen demons drift between the blooms — beautiful, silent, and extraordinarily patient.',
      subtext: "The carnivorous vines move faster than your eye can track. The flowers here don't wait for insects. They have adapted for runners.",
    },
    {
      icon: '🌺',
      text: 'Weave the Blossom Form before the garden decides you belong in its soil permanently.',
      subtext: "Every form built here is fertilised by danger. Build fast. The thorns are already turning your way.",
      isFinal: true,
    },
  ],
};

const AVATAR_QUOTES: Record<string, Record<string, string>> = {
  guy: {
    jungle: "I started this. I'll end it.",
    snow: "Cold never scared me.",
    desert: "Sand's just more track.",
    space: "Zero gravity. Interesting obstacle.",
    underwater: "Pressure's just resistance.",
    volcano: "I've outrun worse than fire.",
    heaven: "Even angels can't keep up.",
    hell: "I've outrun worse. Actually no. But I'm still running.",
    flower: "Beautiful trap. Seen worse.",
  },
  scarlett: {
    jungle: "Try to keep up.",
    snow: "The blizzard won't see me coming.",
    desert: "Gone before the sand settles.",
    space: "Speed works in every dimension.",
    underwater: "I swim faster than I run.",
    volcano: "Fire? Adorable.",
    heaven: "Pretty up here. Won't last.",
    hell: "Hot. Rude. I've dated worse.",
    flower: "I move faster than pollen drifts.",
  },
  barry: {
    jungle: "The jungle fears the already-dead.",
    snow: "Cold? Death was colder.",
    desert: "Mummies. Finally — company.",
    space: "Death transcends gravity.",
    underwater: "The drowned have nothing to teach me.",
    volcano: "Fire cannot kill what death already owns.",
    heaven: "I was not supposed to get in here.",
    hell: "Home.",
    flower: "I am immune to poison. Technically.",
  },
  karma: {
    jungle: "The jungle is an extension of my will.",
    snow: "My chi burns warmer than any blizzard.",
    desert: "The Pharaoh's curse bows to ancient chi.",
    space: "Space is just inner silence, amplified.",
    underwater: "I breathe through stillness.",
    volcano: "Magma yields to those who are at peace.",
    heaven: "I belong here. I have always known.",
    hell: "Hell is merely a state of mind. I transcend.",
    flower: "The flowers sense my chi. They will not strike.",
  },
  montana: {
    jungle: "Mapped three jungles harder than this.",
    snow: "A blizzard is just a cold cave system.",
    desert: "Found seventeen relics in worse conditions.",
    space: "Never been to space. Adapting quickly.",
    underwater: "My compass works at any depth. Probably.",
    volcano: "Every artifact I've found was on fire.",
    heaven: "Never catalogued celestial architecture before. Fascinating.",
    hell: "I have found relics in worse excavation sites.",
    flower: "Carnivorous garden. Five specimens already catalogued.",
  },
  francisco: {
    jungle: "My blade splits any vine.",
    snow: "Ice shatters like any enemy.",
    desert: "The Pharaoh should have built better traps.",
    space: "No formation in zero gravity. Advantage: mine.",
    underwater: "Pressure sharpens the warrior's mind.",
    volcano: "Steel holds in any temperature.",
    heaven: "No honour in an easy battlefield.",
    hell: "The demons will learn to fear the blade.",
    flower: "Even the most beautiful things fall to the blade.",
  },
};

const TYPING_SPEED = 26;
const AUTO_ADVANCE_MS = 4800;

type Props = { world: WorldTheme; avatar: Avatar; onComplete: () => void; onBack: () => void };

export function WorldCinematic({ world, avatar, onComplete, onBack }: Props) {
  const panels = WORLD_PANELS[world.id] ?? WORLD_PANELS.jungle;
  const [idx, setIdx] = useState(0);
  const [chars, setChars] = useState(0);
  const [showSub, setShowSub] = useState(false);
  const [fading, setFading] = useState(false);
  const [showReady, setShowReady] = useState(false);
  const [cursorOn, setCursorOn] = useState(true);

  const panel = panels[idx];
  const isTypingDone = chars >= panel.text.length;

  // Start world ambient sound
  useEffect(() => {
    const handle = startWorldAmbient(world.id);
    playWhoosh();
    return () => handle.stop();
  }, [world.id]);

  // Cursor blink
  useEffect(() => {
    if (isTypingDone) return;
    const t = setInterval(() => setCursorOn(v => !v), 480);
    return () => clearInterval(t);
  }, [isTypingDone]);

  // Reset on panel change
  useEffect(() => {
    setChars(0);
    setShowSub(false);
    setShowReady(false);
    setCursorOn(true);
  }, [idx]);

  // Typewriter
  useEffect(() => {
    if (isTypingDone) return;
    const t = setTimeout(() => setChars(c => c + 1), TYPING_SPEED);
    return () => clearTimeout(t);
  }, [chars, isTypingDone]);

  // Show subtext
  useEffect(() => {
    if (!isTypingDone) return;
    const t = setTimeout(() => setShowSub(true), 360);
    return () => clearTimeout(t);
  }, [isTypingDone]);

  // Auto-advance or show CTA
  useEffect(() => {
    if (!isTypingDone || !showSub) return;
    if (panel.isFinal) {
      const t = setTimeout(() => setShowReady(true), 700);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => doAdvance(), AUTO_ADVANCE_MS);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTypingDone, showSub, idx]);

  const doAdvance = useCallback(() => {
    if (fading || idx >= panels.length - 1) return;
    setFading(true);
    playWhoosh();
    setTimeout(() => { setIdx(i => i + 1); setFading(false); }, 380);
  }, [idx, fading, panels.length]);

  const handleClick = useCallback(() => {
    if (!isTypingDone) { setChars(panel.text.length); return; }
    if (!panel.isFinal) doAdvance();
  }, [isTypingDone, panel, doAdvance]);

  const quote = AVATAR_QUOTES[avatar.id]?.[world.id] ?? "Let's move.";

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed', inset: 0, background: world.bg,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        opacity: fading ? 0 : 1, transition: 'opacity 0.38s ease',
        cursor: panel.isFinal ? 'default' : 'pointer',
      }}
    >
      <ParticleBackground particles={world.particles} count={22} />

      {/* Letterbox bars */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '64px', background: 'rgba(0,0,0,0.97)', zIndex: 10 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '64px', background: 'rgba(0,0,0,0.97)', zIndex: 10 }} />

      {/* Scan line */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 4, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: '80px', background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.016) 50%, transparent 100%)', animation: 'scan-line 12s linear infinite' }} />
      </div>

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '64px', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={e => { e.stopPropagation(); onBack(); }}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '5px', color: 'rgba(255,255,255,0.72)', fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', padding: '4px 12px', cursor: 'pointer', letterSpacing: '0.18em' }}
          >
            ← BACK
          </button>
          <span style={{ fontSize: '24px', filter: `drop-shadow(0 0 10px ${world.glowColor})` }}>{world.emoji}</span>
          <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '11px', color: world.accentColor, letterSpacing: '0.2em' }}>{world.name.toUpperCase()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', color: avatar.color, letterSpacing: '0.14em' }}>{avatar.name.toUpperCase()}</span>
          <span style={{ fontSize: '22px' }}>{avatar.emoji}</span>
          <button
            onClick={e => { e.stopPropagation(); onComplete(); }}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '5px', color: 'rgba(255,255,255,0.3)', fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', padding: '4px 12px', cursor: 'pointer', letterSpacing: '0.18em' }}
          >
            SKIP ↠
          </button>
        </div>
      </div>

      {/* Panel dots */}
      <div style={{ position: 'absolute', top: '72px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 20 }}>
        {panels.map((_, i) => (
          <div key={i} style={{ width: i === idx ? '28px' : '8px', height: '3px', borderRadius: '2px', background: i <= idx ? world.accentColor : 'rgba(255,255,255,0.2)', transition: 'all 0.3s ease' }} />
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 48px', zIndex: 5 }}>

        {/* Big world icon */}
        <div style={{ fontSize: '96px', marginBottom: '32px', filter: `drop-shadow(0 0 40px ${world.glowColor})`, animation: 'float 3s ease-in-out infinite' }}>
          {panel.icon}
        </div>

        {/* Avatar entry badge — first panel only */}
        {idx === 0 && (
          <div style={{ marginBottom: '28px', background: `${avatar.color}1a`, border: `1px solid ${avatar.color}55`, borderRadius: '28px', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '12px', animation: 'slide-up 0.5s ease-out' }}>
            <span style={{ fontSize: '22px' }}>{avatar.emoji}</span>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', color: avatar.color, letterSpacing: '0.16em', fontWeight: 700 }}>
              {avatar.name.toUpperCase()} ENTERS {world.name.toUpperCase()}
            </span>
          </div>
        )}

        {/* Typewriter text */}
        <div style={{ maxWidth: '760px', textAlign: 'center' }}>
          <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '22px', lineHeight: 1.6, color: '#fff', marginBottom: '24px', textShadow: `0 0 40px ${world.glowColor}99`, letterSpacing: '0.02em' }}>
            {panel.text.slice(0, chars)}
            {!isTypingDone && (
              <span style={{ opacity: cursorOn ? 1 : 0, color: world.accentColor, transition: 'opacity 0.1s' }}>▊</span>
            )}
          </p>
          {showSub && (
            <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '15px', color: world.mutedColor, letterSpacing: '0.08em', lineHeight: 1.7, animation: 'fade-in 0.5s ease-out' }}>
              {panel.subtext}
            </p>
          )}
        </div>

        {/* Final panel: avatar quote + CTA */}
        {panel.isFinal && showSub && showReady && (
          <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px', animation: 'slide-up 0.6s ease-out' }}>
            {/* Avatar quote card */}
            <div style={{ background: `${avatar.color}12`, border: `1px solid ${avatar.color}44`, borderRadius: '12px', padding: '16px 28px', maxWidth: '480px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>{avatar.emoji}</div>
              <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '13px', color: avatar.color, letterSpacing: '0.08em', fontStyle: 'italic' }}>
                &ldquo;{quote}&rdquo;
              </div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.18em', marginTop: '6px' }}>
                — {avatar.name.toUpperCase()}
              </div>
            </div>

            <button
              onClick={e => { e.stopPropagation(); playSuccess(); onComplete(); }}
              className="tr-btn"
              style={{
                background: world.buttonGradient,
                color: world.buttonText,
                border: 'none',
                borderRadius: '8px',
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: '14px',
                fontWeight: 700,
                padding: '18px 48px',
                cursor: 'pointer',
                letterSpacing: '0.14em',
                boxShadow: `0 0 32px ${world.glowColor}99, 0 6px 28px rgba(0,0,0,0.5)`,
                animation: 'pulse-glow 2s ease-in-out infinite',
              }}
            >
              ⚡ BEGIN BUILDING
            </button>
          </div>
        )}
      </div>

      {/* Auto-advance progress bar */}
      {!panel.isFinal && isTypingDone && showSub && (
        <div style={{ position: 'absolute', bottom: '64px', left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.08)', zIndex: 20 }}>
          <div style={{ height: '100%', background: world.accentColor, animation: `progress-fill ${AUTO_ADVANCE_MS}ms linear forwards` }} />
        </div>
      )}
    </div>
  );
}
