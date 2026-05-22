import { useEffect, useState } from 'react';
import type { FormField } from '../types';

type MissionOption = {
  id: string;
  emoji: string;
  name: string;
  description: string;
  fieldCount: number;
  suggestedTitle: string;
  buildFields: () => FormField[];
};

type Props = {
  destinationLabel: string;
  accentColor: string;
  glowColor: string;
  background: string;
  missionTitle: string;
  missionText: string;
  currentMissionId?: string;
  options: MissionOption[];
  onSelect: (fields: FormField[], title: string, missionId: string) => void;
  onBack: () => void;
};

export function LibraryMissionScreen({
  destinationLabel,
  accentColor,
  glowColor,
  background,
  missionTitle,
  missionText,
  currentMissionId,
  options,
  onSelect,
  onBack,
}: Props) {
  const defaultOptionId = options[0]?.id || '';
  const [selectedId, setSelectedId] = useState(() => currentMissionId || defaultOptionId);

  useEffect(() => {
    setSelectedId(currentMissionId || defaultOptionId);
  }, [currentMissionId, defaultOptionId]);

  const selectedOption = options.find((option) => option.id === selectedId) ?? options[0] ?? null;

  return (
    <div className="library-mission-root" style={{ background }}>
      {['✧', '📚', '❋', '✦', '📜', '🪶', '🔮'].map((symbol, index) => (
        <div
          key={`${symbol}-${index}`}
          className="library-mission-ambient"
          style={{
            left: `${6 + ((index * 13) % 84)}%`,
            top: `${9 + ((index * 11) % 72)}%`,
            fontSize: `${18 + (index % 3) * 12}px`,
            color: index % 2 === 0 ? accentColor : '#fff',
            animationDelay: `${index * 0.42}s`,
          }}
        >
          {symbol}
        </div>
      ))}

      <div className="library-mission-overlay" style={{ background: `radial-gradient(circle at 22% 18%, ${glowColor} 0%, transparent 24%), radial-gradient(circle at 82% 4%, ${accentColor}22 0%, transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0)), repeating-linear-gradient(90deg, transparent 0, transparent 64px, rgba(255,255,255,0.018) 64px, rgba(255,255,255,0.018) 65px)` }} />

      <div className="library-mission-header">
        <button onClick={onBack} className="library-mission-back">← Back</button>
        <div className="library-mission-breadcrumb">
          <span className="library-mission-pill" style={{ borderColor: `${accentColor}44`, background: `${accentColor}16` }}>The Library</span>
          <span>Cinematic Reading Room</span>
          <span style={{ color: accentColor }}>•</span>
          <span>{destinationLabel}</span>
        </div>
      </div>

      <div className="library-mission-shell">
        <section className="library-mission-stage" style={{ borderColor: `${accentColor}30`, boxShadow: `0 28px 76px ${glowColor}` }}>
          <div className="library-mission-copy">
            <div className="library-mission-eyebrow" style={{ color: accentColor }}>{destinationLabel} archive wing</div>
            <h1 className="library-mission-title">{missionTitle}</h1>
            <p className="library-mission-text">{missionText}</p>

            <div className="library-mission-note" style={{ borderColor: `${accentColor}2e`, background: `${accentColor}10` }}>
              <div className="library-mission-mini-label" style={{ color: accentColor }}>Reading Note</div>
              <p>Each mission opens as a curated volume instead of a plain form template. Pick the story frame first, then edit the manuscript.</p>
            </div>
          </div>

          <div className="library-mission-visual" style={{ borderColor: `${accentColor}22` }}>
            <div className="library-mission-vault-glow" style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }} />
            <div className="library-mission-vault" style={{ borderColor: `${accentColor}36`, boxShadow: `0 0 36px ${glowColor}` }}>
              <div className="library-mission-arch" style={{ borderColor: `${accentColor}44` }} />
              <div className="library-mission-shelf library-mission-shelf-top" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}55, transparent)` }} />
              <div className="library-mission-shelf library-mission-shelf-mid" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}38, transparent)` }} />
              <div className="library-mission-books">
                {['24%', '36%', '48%', '60%'].map((left, index) => (
                  <div
                    key={left}
                    className="library-mission-book"
                    style={{
                      left,
                      height: `${82 - index * 8}px`,
                      background: `linear-gradient(180deg, ${accentColor}${index === 0 ? '88' : '55'}, rgba(7,8,18,0.96))`,
                      animationDelay: `${index * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="library-mission-visual-caption">
              <div className="library-mission-mini-label">Archive Index</div>
              <div className="library-mission-mini-value">{destinationLabel}</div>
            </div>
          </div>
        </section>

        <section className="library-mission-stack">
          <div className="library-mission-stack-head">
            <div>
              <div className="library-mission-mini-label" style={{ color: accentColor }}>Volumes</div>
              <div className="library-mission-stack-title">Choose the manuscript you want to open.</div>
            </div>
            <div className="library-mission-stack-count">{options.length} volumes</div>
          </div>

          <div className="library-mission-cards">
            {options.map((option, index) => {
              const selected = option.id === selectedId;
              return (
                <button
                  key={option.id}
                  type="button"
                  className="library-mission-card"
                  onClick={() => setSelectedId(option.id)}
                  style={{
                    borderColor: selected ? accentColor : 'rgba(255,255,255,0.08)',
                    background: selected
                      ? `linear-gradient(160deg, ${accentColor}18, rgba(17,10,28,0.94) 42%, rgba(8,6,16,0.98) 100%)`
                      : 'linear-gradient(180deg, rgba(16,10,26,0.88), rgba(7,6,16,0.96))',
                    boxShadow: selected ? `0 16px 42px ${glowColor}` : 'none',
                  }}
                >
                  <div className="library-mission-bookmark" style={{ background: selected ? accentColor : 'rgba(255,255,255,0.14)' }} />
                  <div className="library-mission-card-top">
                    <div className="library-mission-card-emoji">{option.emoji}</div>
                    <div className="library-mission-card-number" style={{ color: selected ? accentColor : 'rgba(255,255,255,0.28)' }}>{String(index + 1).padStart(2, '0')}</div>
                  </div>
                  <div className="library-mission-card-name">{option.name}</div>
                  <div className="library-mission-card-status" style={{ color: accentColor }}>{selected ? 'Open chapter' : 'Available chapter'}</div>
                  <p className="library-mission-card-description">{option.description}</p>
                  <div className="library-mission-card-foot">
                    <span style={{ color: accentColor }}>{option.fieldCount === 0 ? 'Blank manuscript' : `${option.fieldCount} seeded fields`}</span>
                    <span>{selected ? 'ready' : 'preview'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {selectedOption && (
        <div className="library-mission-dock" style={{ borderColor: `${accentColor}34`, boxShadow: `0 22px 60px rgba(0,0,0,0.46), 0 0 30px ${glowColor}` }}>
          <div className="library-mission-dock-main">
            <div className="library-mission-dock-kicker" style={{ color: accentColor }}>Selected Volume</div>
            <div className="library-mission-dock-title">{selectedOption.name}</div>
            <div className="library-mission-dock-text">{selectedOption.fieldCount === 0 ? 'Blank manuscript with cinematic framing.' : `${selectedOption.fieldCount} prebuilt fields ready to load.`} {selectedOption.suggestedTitle}</div>
          </div>
          <div className="library-mission-dock-side" style={{ borderColor: `${accentColor}24`, background: `${accentColor}12` }}>
            <div className="library-mission-mini-label">Collection Focus</div>
            <div className="library-mission-mini-value">{destinationLabel}</div>
          </div>
          <button
            type="button"
            className="library-mission-open"
            style={{ background: `linear-gradient(135deg, ${accentColor}, rgba(255,255,255,0.95))` }}
            onClick={() => onSelect(selectedOption.buildFields(), selectedOption.suggestedTitle, selectedOption.id)}
          >
            Open This Volume →
          </button>
        </div>
      )}

      <style>{`
        .library-mission-root { position: fixed; inset: 0; overflow-y: auto; color: #fff; }
        .library-mission-overlay { position: absolute; inset: 0; pointer-events: none; }
        .library-mission-ambient { position: absolute; opacity: 0.065; pointer-events: none; animation: libraryMissionFloat 5.4s ease-in-out infinite alternate; }
        .library-mission-header { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 20px; background: linear-gradient(180deg, rgba(9,4,16,0.92), rgba(9,4,16,0.44) 68%, transparent); backdrop-filter: blur(12px); }
        .library-mission-back, .library-mission-open { border: none; cursor: pointer; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; }
        .library-mission-back { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); border-radius: 999px; color: #fff; padding: 10px 18px; font-size: 12px; }
        .library-mission-breadcrumb { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; color: rgba(255,255,255,0.52); font-size: 12px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; }
        .library-mission-pill { display: inline-flex; align-items: center; padding: 8px 14px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.12); }
        .library-mission-shell { position: relative; z-index: 1; width: min(1240px, calc(100% - 32px)); margin: 0 auto; padding: 10px 0 180px; }
        .library-mission-stage { display: grid; grid-template-columns: minmax(0, 1.04fr) minmax(320px, 0.96fr); gap: 24px; padding: 28px; border: 1px solid rgba(255,255,255,0.08); border-radius: 32px; background: linear-gradient(145deg, rgba(18,10,28,0.9), rgba(7,5,16,0.98)); backdrop-filter: blur(18px); overflow: hidden; }
        .library-mission-eyebrow, .library-mission-mini-label, .library-mission-card-foot, .library-mission-card-status, .library-mission-dock-kicker { font-size: 11px; font-weight: 900; letter-spacing: 0.16em; text-transform: uppercase; }
        .library-mission-title { margin: 0; font-size: clamp(38px, 5vw, 66px); line-height: 0.95; font-weight: 950; max-width: 9ch; }
        .library-mission-text { margin: 18px 0 0; max-width: 60ch; font-size: 17px; line-height: 1.76; color: rgba(255,255,255,0.76); }
        .library-mission-note { margin-top: 22px; border: 1px solid rgba(255,255,255,0.08); border-radius: 22px; padding: 18px 20px; }
        .library-mission-note p { margin: 10px 0 0; font-size: 14px; line-height: 1.75; color: rgba(255,255,255,0.68); }
        .library-mission-visual { position: relative; min-height: 420px; border-radius: 28px; border: 1px solid rgba(255,255,255,0.06); background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .library-mission-vault-glow { position: absolute; inset: 16%; filter: blur(10px); opacity: 0.9; }
        .library-mission-vault { position: relative; width: min(320px, 72%); aspect-ratio: 0.9; border-radius: 30px; border: 1px solid rgba(255,255,255,0.08); background: linear-gradient(180deg, rgba(12,8,18,0.78), rgba(5,4,10,0.98)); overflow: hidden; }
        .library-mission-arch { position: absolute; left: 50%; top: 12%; transform: translateX(-50%); width: 58%; height: 42%; border-radius: 999px 999px 0 0; border: 1px solid rgba(255,255,255,0.12); border-bottom: none; }
        .library-mission-shelf { position: absolute; left: 12%; right: 12%; height: 2px; }
        .library-mission-shelf-top { top: 38%; }
        .library-mission-shelf-mid { top: 66%; }
        .library-mission-books { position: absolute; inset: 0; }
        .library-mission-book { position: absolute; bottom: 14%; width: 30px; border-radius: 8px 8px 2px 2px; box-shadow: 0 0 16px rgba(255,255,255,0.08); animation: libraryMissionFloat 4.8s ease-in-out infinite alternate; }
        .library-mission-visual-caption { position: absolute; left: 22px; right: 22px; bottom: 18px; padding: 14px 16px; border-radius: 18px; background: rgba(8,4,12,0.74); border: 1px solid rgba(255,255,255,0.08); }
        .library-mission-mini-value { margin-top: 6px; font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.82); }
        .library-mission-stack { margin-top: 22px; padding: 22px; border-radius: 28px; background: rgba(10,6,18,0.76); border: 1px solid rgba(255,255,255,0.07); backdrop-filter: blur(14px); }
        .library-mission-stack-head { display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
        .library-mission-stack-title { margin-top: 6px; font-size: 24px; font-weight: 900; line-height: 1.12; }
        .library-mission-stack-count { color: rgba(255,255,255,0.42); font-size: 11px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; }
        .library-mission-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
        .library-mission-card { position: relative; min-height: 286px; padding: 22px 20px 18px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.08); text-align: left; color: #fff; cursor: pointer; overflow: hidden; transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
        .library-mission-card:hover { transform: translateY(-4px); }
        .library-mission-bookmark { position: absolute; top: 0; right: 24px; width: 16px; height: 54px; clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 84%, 0 100%); }
        .library-mission-card-top { display: flex; align-items: start; justify-content: space-between; gap: 12px; }
        .library-mission-card-emoji { font-size: 34px; line-height: 1; }
        .library-mission-card-number { font-size: 12px; font-weight: 900; letter-spacing: 0.16em; text-transform: uppercase; }
        .library-mission-card-name { margin-top: 20px; font-size: 22px; font-weight: 900; line-height: 1.12; max-width: 14ch; }
        .library-mission-card-status { margin-top: 8px; }
        .library-mission-card-description { margin: 14px 0 0; color: rgba(255,255,255,0.66); font-size: 14px; line-height: 1.7; }
        .library-mission-card-foot { margin-top: 20px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .library-mission-card-foot span:last-child { color: rgba(255,255,255,0.42); }
        .library-mission-dock { position: fixed; left: 18px; right: 18px; bottom: 18px; z-index: 22; display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 16px; align-items: center; padding: 16px 18px; border-radius: 26px; border: 1px solid rgba(255,255,255,0.08); background: rgba(10,6,16,0.94); backdrop-filter: blur(20px); }
        .library-mission-dock-main { min-width: 0; }
        .library-mission-dock-title { margin-top: 4px; font-size: 23px; font-weight: 900; line-height: 1.08; }
        .library-mission-dock-text { margin-top: 6px; color: rgba(255,255,255,0.56); font-size: 13px; line-height: 1.6; }
        .library-mission-dock-side { padding: 12px 14px; border-radius: 18px; border: 1px solid rgba(255,255,255,0.08); min-width: 180px; }
        .library-mission-open { min-width: 220px; padding: 16px 24px; border-radius: 999px; color: #06101c; font-size: 13px; }
        @keyframes libraryMissionFloat { from { transform: translateY(0px) rotate(0deg); } to { transform: translateY(-14px) rotate(4deg); } }
        @media (max-width: 980px) { .library-mission-stage { grid-template-columns: 1fr; } .library-mission-visual { min-height: 320px; } .library-mission-dock { grid-template-columns: 1fr; } }
        @media (max-width: 720px) { .library-mission-header { align-items: start; flex-direction: column; } .library-mission-shell { width: min(100%, calc(100% - 20px)); padding-bottom: 240px; } .library-mission-stage, .library-mission-stack { padding: 18px; } .library-mission-stack-head { align-items: start; flex-direction: column; } .library-mission-dock { left: 10px; right: 10px; bottom: 10px; } .library-mission-open { width: 100%; } }
      `}</style>
    </div>
  );
}