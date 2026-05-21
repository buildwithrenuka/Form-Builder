import { useState, useEffect } from 'react';
import { TEMPLATE_CATEGORIES, ALL_TEMPLATES, type FormTemplate } from '../formTemplates';
import type { WorldTheme } from '../types';

type Props = {
  world: WorldTheme;
  onApply: (template: FormTemplate) => void;
  onClose: () => void;
};

export function TemplatePickerModal({ world, onApply, onClose }: Props) {
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [hovered, setHovered] = useState<string | null>(null);
  const [preview, setPreview] = useState<FormTemplate | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 30); }, []);

  function close() {
    setVisible(false);
    setTimeout(onClose, 220);
  }

  const filtered = ALL_TEMPLATES.filter(t => {
    const matchCat = activeCat === 'all' || t.category === activeCat;
    const q = search.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  function handleApply(t: FormTemplate) {
    setVisible(false);
    setTimeout(() => onApply(t), 180);
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.22s',
      }}>
      <div style={{
        width: '100%', maxWidth: 980,
        height: '82vh', maxHeight: 740,
        background: 'linear-gradient(160deg, #0e0e18 0%, #070710 100%)',
        border: `1px solid ${world.accentColor}30`,
        borderRadius: 20,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: `0 32px 80px rgba(0,0,0,0.8), 0 0 60px ${world.accentColor}12`,
        transform: visible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(16px)',
        transition: 'transform 0.22s, opacity 0.22s',
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: '18px 24px',
          borderBottom: `1px solid rgba(255,255,255,0.07)`,
          display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
          background: 'rgba(0,0,0,0.3)',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
              📋 Form Templates
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
              Pick a template to instantly scaffold your form — you can customise every field after
            </div>
          </div>
          {/* Search */}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates…"
            style={{
              width: 220, background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${search ? world.accentColor + '66' : 'rgba(255,255,255,0.12)'}`,
              borderRadius: 10, color: '#fff', fontSize: 13, padding: '8px 14px', outline: 'none',
              transition: 'border-color 0.15s',
            }}
          />
          <button onClick={close} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, color: 'rgba(255,255,255,0.55)', cursor: 'pointer',
            width: 34, height: 34, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* ── Category sidebar ── */}
          <div style={{
            width: 180, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)',
            padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 3,
            background: 'rgba(0,0,0,0.2)', overflowY: 'auto',
          }}>
            <button
              onClick={() => setActiveCat('all')}
              style={catBtnStyle(activeCat === 'all', world)}>
              <span style={{ fontSize: 15 }}>✨</span> All Templates
              <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.5 }}>{ALL_TEMPLATES.length}</span>
            </button>
            {TEMPLATE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                style={catBtnStyle(activeCat === cat.id, world)}>
                <span style={{ fontSize: 15 }}>{cat.icon}</span> {cat.label}
                <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.5 }}>{cat.templates.length}</span>
              </button>
            ))}
          </div>

          {/* ── Template grid ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.25)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 14 }}>No templates match "{search}"</div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 14,
              }}>
                {filtered.map(t => {
                  const isHov = hovered === t.id;
                  const isPrev = preview?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onMouseEnter={() => setHovered(t.id)}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        background: isPrev
                          ? `linear-gradient(135deg, ${t.accentColor}22, rgba(0,0,0,0.6))`
                          : isHov ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${isPrev ? t.accentColor + '77' : isHov ? t.accentColor + '44' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: 14,
                        padding: '16px 16px 14px',
                        cursor: 'pointer',
                        transition: 'all 0.18s',
                        transform: isHov ? 'translateY(-2px)' : 'none',
                        boxShadow: isHov ? `0 8px 24px rgba(0,0,0,0.4), 0 0 20px ${t.accentColor}18` : '0 2px 8px rgba(0,0,0,0.3)',
                        display: 'flex', flexDirection: 'column', gap: 8,
                        position: 'relative',
                      }}
                      onClick={() => setPreview(prev => prev?.id === t.id ? null : t)}
                    >
                      {/* Icon + name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                          background: `${t.accentColor}18`,
                          border: `1px solid ${t.accentColor}44`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 20,
                        }}>{t.icon}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{t.name}</div>
                      </div>
                      {/* Description */}
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                        {t.description}
                      </div>
                      {/* Field count pill */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                        <span style={{
                          fontSize: 10, color: t.accentColor,
                          background: `${t.accentColor}14`,
                          border: `1px solid ${t.accentColor}30`,
                          borderRadius: 20, padding: '2px 8px', fontWeight: 700,
                        }}>
                          {t.fields.filter(f => f.type !== 'section').length} fields
                        </span>
                        {isPrev && (
                          <span style={{ fontSize: 10, color: t.accentColor, opacity: 0.7 }}>▲ preview</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Preview panel ── */}
          {preview && (
            <div style={{
              width: 260, flexShrink: 0,
              borderLeft: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', flexDirection: 'column',
              background: 'rgba(0,0,0,0.25)',
              overflow: 'hidden',
            }}>
              {/* Preview header */}
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: `linear-gradient(135deg, ${preview.accentColor}18, rgba(0,0,0,0.4))`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 24 }}>{preview.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{preview.name}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{preview.description}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ fontSize: 10, background: `${preview.accentColor}20`, border: `1px solid ${preview.accentColor}40`, color: preview.accentColor, borderRadius: 20, padding: '2px 8px', fontWeight: 700 }}>
                    {preview.fields.filter(f => f.type !== 'section').length} fields
                  </span>
                  <span style={{ fontSize: 10, background: 'rgba(255,68,68,0.12)', border: '1px solid rgba(255,68,68,0.25)', color: '#f87171', borderRadius: 20, padding: '2px 8px', fontWeight: 700 }}>
                    {preview.fields.filter(f => f.required).length} required
                  </span>
                </div>
              </div>

              {/* Field list */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
                {preview.fields.map((f, i) => (
                  f.type === 'section' ? (
                    <div key={i} style={{
                      fontSize: 10, fontWeight: 700, color: (f as any).sectionColor || preview.accentColor,
                      letterSpacing: '0.12em', textTransform: 'uppercase',
                      padding: '10px 0 4px',
                      borderBottom: `1px solid ${(f as any).sectionColor || preview.accentColor}33`,
                      marginBottom: 4,
                    }}>
                      {f.label}
                    </div>
                  ) : (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '5px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>{FIELD_ICON[f.type] ?? '📝'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.label}</div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{f.type}</div>
                      </div>
                      {f.required && <span style={{ fontSize: 12, color: '#f87171', flexShrink: 0 }}>*</span>}
                    </div>
                  )
                ))}
              </div>

              {/* Apply button */}
              <div style={{ padding: '14px 12px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                <button
                  onClick={() => handleApply(preview)}
                  style={{
                    width: '100%',
                    background: `linear-gradient(135deg, ${preview.accentColor}, ${preview.accentColor}bb)`,
                    border: 'none', borderRadius: 10,
                    color: '#000', fontWeight: 800, fontSize: 13,
                    padding: '11px 0', cursor: 'pointer',
                    boxShadow: `0 0 20px ${preview.accentColor}44`,
                    transition: 'filter 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.12)')}
                  onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}>
                  Use This Template →
                </button>
                <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 8 }}>
                  Replaces current fields
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helper ──────────────────────────────────────────────────────────────────
function catBtnStyle(active: boolean, world: WorldTheme): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: 7, width: '100%', textAlign: 'left',
    background: active ? `${world.accentColor}18` : 'transparent',
    border: `1px solid ${active ? world.accentColor + '44' : 'transparent'}`,
    borderRadius: 8, color: active ? world.accentColor : 'rgba(255,255,255,0.45)',
    fontSize: 12, fontWeight: active ? 700 : 500, padding: '7px 9px',
    cursor: 'pointer', transition: 'all 0.15s',
  };
}

const FIELD_ICON: Record<string, string> = {
  text: '📝', email: '📧', phone: '📱', number: '🔢', date: '📅',
  time: '🕐', url: '🔗', currency: '💰', textarea: '📄', checkbox: '☑️',
  radio: '🔘', select: '📋', range: '↔️', rating: '⭐', file: '📎',
  password: '🔒', section: '📌',
};
