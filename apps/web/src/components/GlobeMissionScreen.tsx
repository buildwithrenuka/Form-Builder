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

function intensityWidth(fieldCount: number) {
  if (fieldCount === 0) return 14;
  return Math.min(100, 24 + fieldCount * 11);
}

export function GlobeMissionScreen({
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
    <div className="globe-mission-root" style={{ background }}>
      {['✦', '◎', '✺', '◌', '🛰️', '📡'].map((symbol, index) => (
        <div
          key={`${symbol}-${index}`}
          className="globe-mission-ambient"
          style={{
            left: `${7 + ((index * 14) % 82)}%`,
            top: `${10 + ((index * 13) % 70)}%`,
            fontSize: `${18 + (index % 3) * 14}px`,
            color: index % 2 === 0 ? accentColor : '#fff',
            animationDelay: `${index * 0.45}s`,
          }}
        >
          {symbol}
        </div>
      ))}

      <div
        className="globe-mission-overlay"
        style={{
          background: `radial-gradient(circle at 20% 18%, ${glowColor} 0%, transparent 24%), radial-gradient(circle at 84% 6%, ${accentColor}26 0%, transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0)), repeating-linear-gradient(0deg, transparent 0, transparent 46px, rgba(255,255,255,0.025) 46px, rgba(255,255,255,0.025) 47px)`,
        }}
      />

      <div className="globe-mission-header">
        <button onClick={onBack} className="globe-mission-back">← Back</button>
        <div className="globe-mission-breadcrumb">
          <span className="globe-mission-pill" style={{ borderColor: `${accentColor}44`, background: `${accentColor}18` }}>Globe Explorer</span>
          <span>Orbital Mission Deck</span>
          <span style={{ color: accentColor }}>•</span>
          <span>{destinationLabel}</span>
        </div>
      </div>

      <div className="globe-mission-shell">
        <section className="globe-mission-stage" style={{ borderColor: `${accentColor}30`, boxShadow: `0 28px 80px ${glowColor}` }}>
          <div className="globe-mission-copy">
            <div className="globe-mission-eyebrow" style={{ color: accentColor }}>{destinationLabel} deployment window</div>
            <h1 className="globe-mission-title">{missionTitle}</h1>
            <p className="globe-mission-text">{missionText}</p>

            <div className="globe-mission-brief" style={{ borderColor: `${accentColor}2e`, background: `${accentColor}10` }}>
              <div className="globe-mission-brief-label" style={{ color: accentColor }}>Mission Control</div>
              <p>Choose a field kit tuned for this country and launch with a briefing that already speaks its local data language.</p>
            </div>

            {selectedOption && (
              <div className="globe-mission-dossier" style={{ borderColor: `${accentColor}2e` }}>
                <div className="globe-mission-dossier-head">
                  <div className="globe-mission-dossier-icon" style={{ borderColor: `${accentColor}30`, background: `${accentColor}14` }}>{selectedOption.emoji}</div>
                  <div>
                    <div className="globe-mission-mini-label" style={{ color: accentColor }}>Active Dossier</div>
                    <div className="globe-mission-dossier-title">{selectedOption.name}</div>
                  </div>
                </div>
                <div className="globe-mission-dossier-grid">
                  <div>
                    <div className="globe-mission-mini-label">Territory Lock</div>
                    <div className="globe-mission-mini-value">{destinationLabel}</div>
                  </div>
                  <div>
                    <div className="globe-mission-mini-label">Payload</div>
                    <div className="globe-mission-mini-value">{selectedOption.fieldCount === 0 ? 'Blank Canvas' : `${selectedOption.fieldCount} Fields`}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="globe-mission-visual">
            <div className="globe-mission-orbit-aura" style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }} />
            <div className="globe-mission-orbit-shell" style={{ borderColor: `${accentColor}45`, boxShadow: `0 0 40px ${glowColor}` }}>
              <div className="globe-mission-orbit-core" style={{ background: `radial-gradient(circle at 35% 35%, ${accentColor}60 0%, rgba(5,14,26,0.96) 72%)` }} />
              <div className="globe-mission-ring globe-mission-ring-1" style={{ borderColor: `${accentColor}38` }} />
              <div className="globe-mission-ring globe-mission-ring-2" style={{ borderColor: `${accentColor}20` }} />
              <div className="globe-mission-grid globe-mission-grid-h" style={{ background: `linear-gradient(180deg, transparent, ${accentColor}22, transparent)` }} />
              <div className="globe-mission-grid globe-mission-grid-v" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}22, transparent)` }} />
              {[
                { left: '24%', top: '30%' },
                { left: '63%', top: '25%' },
                { left: '43%', top: '64%' },
                { left: '73%', top: '58%' },
              ].map((pin, index) => (
                <div key={index} className="globe-mission-pin" style={{ left: pin.left, top: pin.top, background: accentColor, boxShadow: `0 0 14px ${glowColor}` }} />
              ))}
            </div>
            <div className="globe-mission-visual-caption">
              <div className="globe-mission-mini-label">Orbiting Entry Path</div>
              <div className="globe-mission-mini-value">{destinationLabel}</div>
            </div>
          </div>
        </section>

        <section className="globe-mission-rail">
          <div className="globe-mission-rail-head">
            <div>
              <div className="globe-mission-mini-label" style={{ color: accentColor }}>Mission Reel</div>
              <div className="globe-mission-rail-title">Choose your orbital starting point.</div>
            </div>
            <div className="globe-mission-rail-count">{options.length} routes</div>
          </div>

          <div className="globe-mission-card-grid">
            {options.map((option, index) => {
              const selected = option.id === selectedId;
              return (
                <button
                  key={option.id}
                  type="button"
                  className="globe-mission-card"
                  onClick={() => setSelectedId(option.id)}
                  style={{
                    borderColor: selected ? accentColor : 'rgba(255,255,255,0.1)',
                    background: selected
                      ? `linear-gradient(160deg, ${accentColor}20, rgba(7, 12, 24, 0.94) 45%, rgba(4, 7, 16, 0.98) 100%)`
                      : 'linear-gradient(180deg, rgba(12,16,28,0.9), rgba(5,8,18,0.96))',
                    boxShadow: selected ? `0 18px 44px ${glowColor}` : 'none',
                  }}
                >
                  <div className="globe-mission-card-index" style={{ color: selected ? accentColor : 'rgba(255,255,255,0.3)' }}>{String(index + 1).padStart(2, '0')}</div>
                  <div className="globe-mission-card-accent" style={{ background: `linear-gradient(180deg, ${accentColor}, transparent)` }} />
                  <div className="globe-mission-card-top">
                    <div className="globe-mission-card-emoji">{option.emoji}</div>
                    <div className="globe-mission-card-status" style={{ color: accentColor }}>{selected ? 'locked' : 'available'}</div>
                  </div>
                  <div className="globe-mission-card-name">{option.name}</div>
                  <p className="globe-mission-card-description">{option.description}</p>
                  <div className="globe-mission-card-footer">
                    <div className="globe-mission-card-meta">
                      <span style={{ color: accentColor }}>{option.fieldCount === 0 ? 'Blank canvas' : `${option.fieldCount} seeded fields`}</span>
                      <span>{selected ? 'ready' : 'preview'}</span>
                    </div>
                    <div className="globe-mission-card-bar">
                      <div className="globe-mission-card-bar-fill" style={{ width: `${intensityWidth(option.fieldCount)}%`, background: `linear-gradient(90deg, ${accentColor}, rgba(255,255,255,0.95))`, boxShadow: `0 0 16px ${glowColor}` }} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {selectedOption && (
        <div className="globe-mission-dock" style={{ borderColor: `${accentColor}38`, boxShadow: `0 22px 60px rgba(0,0,0,0.44), 0 0 28px ${glowColor}` }}>
          <div className="globe-mission-dock-icon" style={{ borderColor: `${accentColor}30`, background: `${accentColor}16` }}>{selectedOption.emoji}</div>
          <div className="globe-mission-dock-copy">
            <div className="globe-mission-mini-label" style={{ color: accentColor }}>Mission Ready</div>
            <div className="globe-mission-dock-title">{selectedOption.name}</div>
            <div className="globe-mission-dock-text">{selectedOption.fieldCount === 0 ? 'Blank starting point with cinematic framing.' : `${selectedOption.fieldCount} prebuilt fields ready to load.`} {selectedOption.suggestedTitle}</div>
          </div>
          <button
            type="button"
            className="globe-mission-launch"
            style={{ background: `linear-gradient(135deg, ${accentColor}, rgba(255,255,255,0.96))` }}
            onClick={() => onSelect(selectedOption.buildFields(), selectedOption.suggestedTitle, selectedOption.id)}
          >
            Launch Mission →
          </button>
        </div>
      )}

      <style>{`
        .globe-mission-root { position: fixed; inset: 0; overflow-y: auto; color: #fff; }
        .globe-mission-overlay { position: absolute; inset: 0; pointer-events: none; }
        .globe-mission-ambient { position: absolute; opacity: 0.08; pointer-events: none; animation: globeMissionFloat 5.8s ease-in-out infinite alternate; }
        .globe-mission-header { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 20px; background: linear-gradient(180deg, rgba(3,7,14,0.9), rgba(3,7,14,0.45) 68%, transparent); backdrop-filter: blur(12px); }
        .globe-mission-back, .globe-mission-launch { border: none; cursor: pointer; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; }
        .globe-mission-back { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); border-radius: 999px; color: #fff; padding: 10px 18px; font-size: 12px; }
        .globe-mission-breadcrumb { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; color: rgba(255,255,255,0.52); font-size: 12px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; }
        .globe-mission-pill { display: inline-flex; align-items: center; padding: 8px 14px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.12); }
        .globe-mission-shell { position: relative; z-index: 1; width: min(1240px, calc(100% - 32px)); margin: 0 auto; padding: 10px 0 180px; }
        .globe-mission-stage { display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr); gap: 24px; padding: 28px; border: 1px solid rgba(255,255,255,0.08); border-radius: 32px; background: linear-gradient(145deg, rgba(8,12,24,0.92), rgba(3,8,18,0.98)); backdrop-filter: blur(18px); overflow: hidden; }
        .globe-mission-eyebrow, .globe-mission-mini-label, .globe-mission-card-status, .globe-mission-card-meta { font-size: 11px; font-weight: 900; letter-spacing: 0.16em; text-transform: uppercase; }
        .globe-mission-title { margin: 0; font-size: clamp(38px, 5vw, 66px); line-height: 0.94; font-weight: 950; max-width: 9ch; }
        .globe-mission-text { margin: 18px 0 0; max-width: 60ch; font-size: 17px; line-height: 1.76; color: rgba(255,255,255,0.76); }
        .globe-mission-brief, .globe-mission-dossier { margin-top: 22px; border: 1px solid rgba(255,255,255,0.08); border-radius: 22px; padding: 18px 20px; }
        .globe-mission-brief p { margin: 10px 0 0; font-size: 14px; line-height: 1.75; color: rgba(255,255,255,0.68); }
        .globe-mission-dossier-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .globe-mission-dossier-icon, .globe-mission-dock-icon { width: 56px; height: 56px; border-radius: 18px; border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; font-size: 26px; }
        .globe-mission-dossier-title, .globe-mission-dock-title { font-size: 23px; font-weight: 900; line-height: 1.08; }
        .globe-mission-dossier-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
        .globe-mission-mini-value { margin-top: 6px; font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.82); }
        .globe-mission-visual { position: relative; min-height: 420px; border-radius: 28px; border: 1px solid rgba(255,255,255,0.06); background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .globe-mission-orbit-aura { position: absolute; inset: 18%; filter: blur(10px); opacity: 0.9; }
        .globe-mission-orbit-shell { position: relative; width: min(320px, 72%); aspect-ratio: 1; border-radius: 50%; border: 1px solid rgba(255,255,255,0.08); animation: globeMissionSpin 18s linear infinite; }
        .globe-mission-orbit-core { position: absolute; inset: 18%; border-radius: 50%; box-shadow: inset 0 0 26px rgba(255,255,255,0.08); }
        .globe-mission-ring { position: absolute; border-radius: 50%; border: 1px dashed rgba(255,255,255,0.08); }
        .globe-mission-ring-1 { inset: 8%; }
        .globe-mission-ring-2 { inset: 28%; animation: globeMissionPulse 4s ease-in-out infinite; }
        .globe-mission-grid { position: absolute; opacity: 0.55; }
        .globe-mission-grid-h { left: 14%; right: 14%; top: 50%; height: 1px; }
        .globe-mission-grid-v { top: 14%; bottom: 14%; left: 50%; width: 1px; }
        .globe-mission-pin { position: absolute; width: 10px; height: 10px; border-radius: 50%; transform: translate(-50%, -50%); }
        .globe-mission-visual-caption { position: absolute; left: 22px; right: 22px; bottom: 18px; border-radius: 18px; padding: 14px 16px; background: rgba(2,6,12,0.72); border: 1px solid rgba(255,255,255,0.08); }
        .globe-mission-rail { margin-top: 22px; padding: 22px; border-radius: 28px; background: rgba(4,7,16,0.74); border: 1px solid rgba(255,255,255,0.07); backdrop-filter: blur(14px); }
        .globe-mission-rail-head { display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
        .globe-mission-rail-title { margin-top: 6px; font-size: 24px; font-weight: 900; line-height: 1.12; }
        .globe-mission-rail-count { color: rgba(255,255,255,0.42); font-size: 11px; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; }
        .globe-mission-card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
        .globe-mission-card { position: relative; min-height: 276px; padding: 22px 20px 18px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); color: #fff; text-align: left; cursor: pointer; overflow: hidden; transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
        .globe-mission-card:hover { transform: translateY(-4px); }
        .globe-mission-card-index { position: absolute; top: 16px; right: 16px; font-size: 12px; font-weight: 900; letter-spacing: 0.16em; text-transform: uppercase; }
        .globe-mission-card-accent { position: absolute; left: 0; top: 0; width: 4px; height: 100%; opacity: 0.9; }
        .globe-mission-card-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .globe-mission-card-emoji { font-size: 34px; line-height: 1; }
        .globe-mission-card-name { margin-top: 18px; font-size: 22px; font-weight: 900; line-height: 1.12; max-width: 14ch; }
        .globe-mission-card-description { margin: 12px 0 0; color: rgba(255,255,255,0.66); font-size: 14px; line-height: 1.68; }
        .globe-mission-card-footer { margin-top: 18px; }
        .globe-mission-card-meta { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .globe-mission-card-meta span:last-child { color: rgba(255,255,255,0.42); }
        .globe-mission-card-bar { margin-top: 10px; height: 6px; border-radius: 999px; background: rgba(255,255,255,0.08); overflow: hidden; }
        .globe-mission-card-bar-fill { height: 100%; border-radius: 999px; }
        .globe-mission-dock { position: fixed; left: 18px; right: 18px; bottom: 18px; z-index: 22; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 16px 18px; border-radius: 26px; border: 1px solid rgba(255,255,255,0.08); background: rgba(3,8,18,0.92); backdrop-filter: blur(20px); }
        .globe-mission-dock-copy { flex: 1; min-width: 220px; }
        .globe-mission-dock-text { margin-top: 6px; color: rgba(255,255,255,0.56); font-size: 13px; line-height: 1.6; }
        .globe-mission-launch { min-width: 220px; padding: 16px 24px; border-radius: 999px; color: #06101c; font-size: 13px; }
        @keyframes globeMissionFloat { from { transform: translateY(0px) rotate(0deg); } to { transform: translateY(-14px) rotate(4deg); } }
        @keyframes globeMissionSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes globeMissionPulse { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.05); opacity: 1; } }
        @media (max-width: 980px) { .globe-mission-stage { grid-template-columns: 1fr; } .globe-mission-dossier-grid { grid-template-columns: 1fr; } .globe-mission-visual { min-height: 320px; } }
        @media (max-width: 720px) { .globe-mission-header { align-items: start; flex-direction: column; } .globe-mission-shell { width: min(100%, calc(100% - 20px)); padding-bottom: 210px; } .globe-mission-stage, .globe-mission-rail { padding: 18px; } .globe-mission-rail-head { align-items: start; flex-direction: column; } .globe-mission-dock { left: 10px; right: 10px; bottom: 10px; } .globe-mission-launch { width: 100%; } }
      `}</style>
    </div>
  );
}