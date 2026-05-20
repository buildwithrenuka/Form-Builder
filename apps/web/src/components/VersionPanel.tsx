import { useState } from 'react';
import { FormVersion, WorldTheme, FormField } from '../types';

type Props = {
  versions: FormVersion[];
  world: WorldTheme;
  currentTitle: string;
  currentFields: FormField[];
  worldId: string;
  avatarId: string;
  onSave: (versions: FormVersion[]) => void;
  onRestore: (v: FormVersion) => void;
  onClose: () => void;
};

const STORAGE_KEY = 'tr_form_versions';

export function loadVersions(formKey: string): FormVersion[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${formKey}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveVersion(formKey: string, version: FormVersion): FormVersion[] {
  const existing = loadVersions(formKey);
  const updated = [version, ...existing].slice(0, 30); // max 30 versions
  localStorage.setItem(`${STORAGE_KEY}_${formKey}`, JSON.stringify(updated));
  return updated;
}

export function deleteVersion(formKey: string, versionId: string): FormVersion[] {
  const existing = loadVersions(formKey);
  const updated = existing.filter(v => v.id !== versionId);
  localStorage.setItem(`${STORAGE_KEY}_${formKey}`, JSON.stringify(updated));
  return updated;
}

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60_000) return 'just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
}

export function VersionPanel({
  versions, world, currentTitle, currentFields, worldId, avatarId,
  onSave, onRestore, onClose,
}: Props) {
  const [versionName, setVersionName] = useState('');
  const [confirming, setConfirming] = useState<string | null>(null);

  function publishVersion() {
    if (currentFields.filter(f => f.type !== 'section').length === 0) return;
    const name = versionName.trim() || `v${versions.length + 1} — ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    const version: FormVersion = {
      id: makeId(),
      versionName: name,
      timestamp: Date.now(),
      formTitle: currentTitle,
      fields: currentFields,
      worldId,
      avatarId,
    };
    const updated = [version, ...versions].slice(0, 30);
    onSave(updated);
    setVersionName('');
  }

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 200,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    pointerEvents: 'none',
  };

  const drawerStyle: React.CSSProperties = {
    width: '360px',
    height: '100%',
    background: 'rgba(5,2,0,0.97)',
    backdropFilter: 'blur(24px)',
    borderLeft: `1px solid ${world.borderColor}44`,
    boxShadow: `-8px 0 48px rgba(0,0,0,0.7), 0 0 0 1px ${world.accentColor}11`,
    display: 'flex',
    flexDirection: 'column',
    pointerEvents: 'all',
    animation: 'slide-in-right 0.28s cubic-bezier(0.2,0,0,1) both',
  };

  const sectionHd: React.CSSProperties = {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.28)',
    marginBottom: '8px',
  };

  const fieldCount = currentFields.filter(f => f.type !== 'section').length;

  return (
    <div style={panelStyle}>
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', cursor: 'pointer' }} onClick={onClose} />

      <div style={drawerStyle}>
        {/* Header */}
        <div style={{ padding: '16px 18px', borderBottom: `1px solid ${world.borderColor}33`, display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <span style={{ fontSize: '22px' }}>🕐</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '13px', fontWeight: 700, color: world.accentColor }}>Version History</div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>{versions.length} snapshot{versions.length !== 1 ? 's' : ''} saved</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>✕</button>
        </div>

        {/* Publish new version */}
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${world.borderColor}22`, flexShrink: 0 }}>
          <p style={sectionHd}>📤 Publish New Snapshot</p>
          <div style={{ display: 'flex', gap: '7px' }}>
            <input
              value={versionName}
              onChange={e => setVersionName(e.target.value)}
              placeholder={`v${versions.length + 1} — auto-named`}
              onKeyDown={e => e.key === 'Enter' && publishVersion()}
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: `1px solid ${world.borderColor}44`, borderRadius: '7px', color: world.textColor, fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', padding: '8px 10px', outline: 'none' }}
            />
            <button
              onClick={publishVersion}
              disabled={fieldCount === 0}
              style={{ background: fieldCount > 0 ? world.buttonGradient : 'rgba(255,255,255,0.05)', color: fieldCount > 0 ? world.buttonText : 'rgba(255,255,255,0.2)', fontFamily: "'Cinzel Decorative', serif", fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', padding: '8px 13px', border: 'none', borderRadius: '7px', cursor: fieldCount > 0 ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap', boxShadow: fieldCount > 0 ? `0 0 12px ${world.glowColor}44` : 'none', transition: 'all 0.15s' }}
            >
              SAVE
            </button>
          </div>
          {fieldCount === 0 && <p style={{ fontFamily: "'Exo 2', sans-serif", fontSize: '10px', color: 'rgba(255,100,100,0.6)', marginTop: '5px' }}>⚠ Add at least one field to publish</p>}
        </div>

        {/* Version list */}
        <div className="tr-scroll" style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {versions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.4 }}>📭</div>
              <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>No versions yet. Publish your first snapshot above.</p>
            </div>
          ) : (
            versions.map((v, i) => (
              <div key={v.id} style={{ background: confirming === v.id ? 'rgba(255,60,60,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${confirming === v.id ? 'rgba(255,60,60,0.3)' : 'rgba(255,255,255,0.09)'}`, borderRadius: '10px', padding: '12px 13px', animation: `card-enter 0.3s ease-out ${i * 0.04}s both`, transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: i === 0 ? `${world.accentColor}22` : 'rgba(255,255,255,0.06)', border: `1px solid ${i === 0 ? world.accentColor + '55' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>
                    {i === 0 ? '⭐' : (versions.length - i)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', fontWeight: 700, color: i === 0 ? world.accentColor : 'rgba(255,255,255,0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>{v.versionName}</span>
                      {i === 0 && <span style={{ background: `${world.accentColor}22`, border: `1px solid ${world.accentColor}44`, borderRadius: '4px', color: world.accentColor, fontSize: '8px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: '0.12em', padding: '1px 6px' }}>LATEST</span>}
                    </div>
                    <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                      {v.formTitle} · {v.fields.filter(f => f.type !== 'section').length} fields
                    </div>
                    <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '9px', color: 'rgba(255,255,255,0.2)', marginTop: '1px', letterSpacing: '0.08em' }}>
                      {formatTime(v.timestamp)}
                    </div>
                  </div>
                </div>

                {confirming === v.id ? (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '6px' }}>
                    <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', color: 'rgba(255,100,100,0.7)', flex: 1, alignSelf: 'center' }}>Delete this snapshot?</span>
                    <button onClick={() => { onSave(versions.filter(x => x.id !== v.id)); setConfirming(null); }} style={{ background: 'rgba(255,60,60,0.2)', border: '1px solid rgba(255,60,60,0.4)', borderRadius: '5px', color: '#ff8888', fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', fontWeight: 700, padding: '5px 10px', cursor: 'pointer', letterSpacing: '0.08em' }}>DELETE</button>
                    <button onClick={() => setConfirming(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '5px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', padding: '5px 10px', cursor: 'pointer' }}>Cancel</button>
                  </div>
                ) : (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button onClick={() => setConfirming(v.id)} style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', borderRadius: '5px', color: '#ff8888', cursor: 'pointer', fontSize: '10px', padding: '5px 9px', fontFamily: "'Rajdhani', sans-serif" }}>🗑 Delete</button>
                    <button onClick={() => { onRestore(v); onClose(); }} style={{ background: i === 0 ? `${world.accentColor}18` : 'rgba(255,255,255,0.06)', border: `1px solid ${i === 0 ? world.accentColor + '44' : 'rgba(255,255,255,0.12)'}`, borderRadius: '5px', color: i === 0 ? world.accentColor : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '10px', padding: '5px 11px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: '0.06em', transition: 'all 0.15s' }}>↩ Restore</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer note */}
        <div style={{ padding: '10px 18px 14px', borderTop: `1px solid ${world.borderColor}22`, flexShrink: 0 }}>
          <p style={{ fontFamily: "'Exo 2', sans-serif", fontSize: '9px', color: 'rgba(255,255,255,0.18)', textAlign: 'center', lineHeight: 1.5, letterSpacing: '0.06em' }}>
            Versions stored in browser localStorage · Max 30 snapshots
          </p>
        </div>
      </div>
    </div>
  );
}
