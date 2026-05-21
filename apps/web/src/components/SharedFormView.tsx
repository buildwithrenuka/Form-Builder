import { useState, useEffect } from 'react';
import { FormField, WorldTheme, Avatar } from '../types';
import { WORLDS, AVATARS, VALIDATION_PRESETS } from '../themes';
import { COUNTRIES, type Country } from '../globeData';
import { LIBRARY_WORLDS, type LibraryWorld } from '../libraryData';
import { ParticleBackground } from './ParticleBackground';
import { trpc } from '../trpc';
import { copyText } from '../utils/clipboard';

type SharedPayload = {
  formTitle: string;
  fields: FormField[];
  worldId: string;
  avatarId: string;
};

function countryToSharedWorld(country: Country): WorldTheme {
  return {
    id: country.id,
    name: country.name,
    emoji: country.emoji,
    description: country.lore,
    tagline: country.tagline,
    primaryColor: country.color,
    secondaryColor: country.accentColor,
    accentColor: country.accentColor,
    textColor: '#f0f0f0',
    mutedColor: `${country.color}aa`,
    bg: country.bgGradient,
    cardBg: 'rgba(0,0,0,0.88)',
    borderColor: country.color,
    buttonGradient: `linear-gradient(135deg, ${country.color}, ${country.accentColor})`,
    buttonText: '#fff',
    inputBg: 'rgba(255,255,255,0.06)',
    particles: [],
    glowColor: country.glowColor,
  };
}

function libraryToSharedWorld(world: LibraryWorld): WorldTheme {
  return {
    id: world.id,
    name: world.name,
    emoji: world.emoji,
    description: world.lore,
    tagline: world.tagline,
    primaryColor: world.color,
    secondaryColor: world.accentColor,
    accentColor: world.accentColor,
    textColor: '#f0f0f0',
    mutedColor: `${world.color}aa`,
    bg: world.bgGradient,
    cardBg: 'rgba(0,0,0,0.88)',
    borderColor: world.color,
    buttonGradient: `linear-gradient(135deg, ${world.color}, ${world.accentColor})`,
    buttonText: '#fff',
    inputBg: 'rgba(255,255,255,0.06)',
    particles: world.particles,
    glowColor: world.glowColor,
  };
}

function normalizeWorldId(worldId: string): string {
  return worldId.replace(/^globe_/, '').replace(/^library_/, '');
}

function resolveSharedWorld(worldId: string): WorldTheme {
  const normalizedWorldId = normalizeWorldId(worldId);
  const templeWorld = WORLDS.find((world) => world.id === normalizedWorldId);
  if (templeWorld) return templeWorld;

  const country = COUNTRIES.find((item) => item.id === normalizedWorldId);
  if (country) return countryToSharedWorld(country);

  const libraryWorld = LIBRARY_WORLDS.find((item) => item.id === normalizedWorldId);
  if (libraryWorld) return libraryToSharedWorld(libraryWorld);

  return WORLDS[0];
}

function resolveSharedAvatar(avatarId: string): Avatar | null {
  if (!avatarId) return null;
  return AVATARS.find((avatar) => avatar.id === avatarId) ?? null;
}

// Encode form to a shareable URL hash
export function encodeSharePayload(payload: SharedPayload): string {
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  } catch {
    return '';
  }
}

// Decode from URL hash
export function decodeSharePayload(encoded: string): SharedPayload | null {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
  } catch {
    return null;
  }
}

// Generate full share URL
export function buildShareUrl(payload: SharedPayload): string {
  const encoded = encodeSharePayload(payload);
  const url = new URL(window.location.href.split('?')[0]);
  url.searchParams.set('share', encoded);
  return url.toString();
}

function RatingInput({ max, value, onChange, accentColor }: { max: number; value: number; onChange: (v: number) => void; accentColor: string }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {Array.from({ length: max }, (_, i) => i + 1).map(star => (
        <button key={star} onClick={() => onChange(star)} onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '26px', color: star <= (hovered || value) ? accentColor : 'rgba(255,255,255,0.2)', transition: 'color 0.15s, transform 0.1s', transform: star <= (hovered || value) ? 'scale(1.15)' : 'scale(1)', padding: 0, filter: star <= (hovered || value) ? `drop-shadow(0 0 6px ${accentColor})` : 'none' }}>
          ★
        </button>
      ))}
    </div>
  );
}

function SectionDivider({ field }: { field: FormField }) {
  return (
    <div style={{ margin: '10px 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: field.sectionColor, flexShrink: 0, boxShadow: `0 0 8px ${field.sectionColor}` }} />
      <div>
        <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '13px', fontWeight: 700, color: field.sectionColor }}>{field.label}</div>
        {field.sectionDescription && <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>{field.sectionDescription}</div>}
      </div>
      <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${field.sectionColor}55, transparent)` }} />
    </div>
  );
}

function ShareField({ field, world }: { field: FormField; world: WorldTheme }) {
  const [value, setValue] = useState<string | boolean | number>(
    field.type === 'checkbox' ? false : field.type === 'rating' ? 0 : field.type === 'range' ? field.min : ''
  );
  const [error, setError] = useState('');

  function validate(val: string) {
    if (field.required && !val.trim()) { setError('This field is required'); return; }
    if (field.minLength > 0 && val.length < field.minLength) { setError(`Min ${field.minLength} chars`); return; }
    if (field.maxLength > 0 && val.length > field.maxLength) { setError(`Max ${field.maxLength} chars`); return; }
    if (field.validationPreset !== 'none') {
      const preset = VALIDATION_PRESETS.find(p => p.value === field.validationPreset);
      const pattern = field.validationPreset === 'custom' ? field.customPattern : preset?.pattern;
      if (pattern && String(val) && !new RegExp(pattern).test(String(val))) {
        setError(field.errorMessage || preset?.hint || 'Invalid format'); return;
      }
    }
    setError('');
  }

  const inputBase: React.CSSProperties = {
    width: '100%', background: world.inputBg,
    border: `1px solid ${error ? '#ff5555' : world.borderColor + '66'}`,
    borderRadius: '7px', color: world.textColor,
    fontFamily: "'Rajdhani', sans-serif", fontSize: '14px', fontWeight: 500,
    padding: '10px 14px', outline: 'none', transition: 'border-color 0.15s',
  };

  const label = (
    <label style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', fontWeight: 700, color: world.textColor, letterSpacing: '0.06em', marginBottom: '6px', display: 'block' }}>
      {field.label}{field.required && <span style={{ color: world.accentColor, marginLeft: '4px' }}>*</span>}
    </label>
  );

  function withAffix(inp: React.ReactNode) {
    if (!field.prefix && !field.suffix) return inp;
    return (
      <div style={{ display: 'flex' }}>
        {field.prefix && <span style={{ background: `${world.borderColor}22`, border: `1px solid ${world.borderColor}55`, borderRight: 'none', borderRadius: '7px 0 0 7px', padding: '10px', fontFamily: "'Rajdhani', sans-serif", fontSize: '14px', fontWeight: 700, color: world.accentColor, flexShrink: 0 }}>{field.prefix}</span>}
        <div style={{ flex: 1 }}>{inp}</div>
        {field.suffix && <span style={{ background: `${world.borderColor}22`, border: `1px solid ${world.borderColor}55`, borderLeft: 'none', borderRadius: '0 7px 7px 0', padding: '10px', fontFamily: "'Rajdhani', sans-serif", fontSize: '14px', fontWeight: 700, color: world.mutedColor, flexShrink: 0 }}>{field.suffix}</span>}
      </div>
    );
  }

  let input: React.ReactNode;

  switch (field.type) {
    case 'textarea':
      input = <textarea placeholder={field.placeholder} value={value as string} rows={4} onChange={e => setValue(e.target.value)} onBlur={e => validate(e.target.value)} style={{ ...inputBase, height: '90px', resize: 'vertical' }} minLength={field.minLength || undefined} maxLength={field.maxLength || undefined} />;
      break;
    case 'checkbox':
      input = (
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <button onClick={() => setValue(!value)} style={{ width: '22px', height: '22px', background: value ? world.accentColor : world.inputBg, border: `2px solid ${value ? world.accentColor : world.borderColor}`, borderRadius: '5px', cursor: 'pointer', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0, boxShadow: value ? `0 0 8px ${world.glowColor}66` : 'none', transition: 'all 0.15s' }}>{value ? '✓' : ''}</button>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '14px', color: world.textColor }}>{field.placeholder || field.label}</span>
        </label>
      );
      break;
    case 'radio':
      input = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {field.options.map(opt => (
            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <button onClick={() => setValue(opt)} style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${value === opt ? world.accentColor : world.borderColor}`, background: world.inputBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s', boxShadow: value === opt ? `0 0 8px ${world.glowColor}55` : 'none' }}>
                {value === opt && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: world.accentColor }} />}
              </button>
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '14px', color: value === opt ? world.accentColor : world.textColor, fontWeight: value === opt ? 700 : 500, transition: 'color 0.15s' }}>{opt}</span>
            </label>
          ))}
        </div>
      );
      break;
    case 'select':
      input = (
        <select value={value as string} onChange={e => setValue(e.target.value)} style={{ ...inputBase, appearance: 'none', cursor: 'pointer', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '36px' }}>
          <option value="" style={{ background: '#111' }}>{field.placeholder || 'Select...'}</option>
          {field.options.map(opt => <option key={opt} value={opt} style={{ background: '#111' }}>{opt}</option>)}
        </select>
      );
      break;
    case 'range':
      input = (
        <div>
          <input type="range" min={field.min} max={field.max} value={value as number} onChange={e => setValue(Number(e.target.value))} style={{ width: '100%', accentColor: world.accentColor, cursor: 'pointer' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', color: world.mutedColor, marginTop: '4px' }}>
            <span>{field.min}</span><span style={{ color: world.accentColor, fontWeight: 700 }}>{value}</span><span>{field.max}</span>
          </div>
        </div>
      );
      break;
    case 'rating':
      input = <RatingInput max={field.max} value={value as number} onChange={v => setValue(v)} accentColor={world.accentColor} />;
      break;
    case 'file':
      input = (
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: world.inputBg, border: `1px solid ${world.borderColor}66`, borderRadius: '7px', padding: '10px 14px', cursor: 'pointer' }}>
          <span style={{ fontSize: '20px' }}>📎</span>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', color: value ? world.accentColor : world.mutedColor }}>{value ? String(value) : 'Choose file...'}</span>
          <input type="file" style={{ display: 'none' }} onChange={e => setValue(e.target.files?.[0]?.name ?? '')} />
        </label>
      );
      break;
    case 'currency':
      input = withAffix(<input type="number" placeholder={field.placeholder} value={value as string} onChange={e => setValue(e.target.value)} onBlur={e => validate(e.target.value)} style={{ ...inputBase, borderRadius: field.prefix ? '0 7px 7px 0' : '7px', borderLeft: field.prefix ? 'none' : undefined }} />);
      break;
    default:
      input = withAffix(<input type={field.type} placeholder={field.placeholder} value={value as string} onChange={e => setValue(e.target.value)} onBlur={e => validate(e.target.value)} style={{ ...inputBase, borderRadius: field.prefix ? '0 7px 7px 0' : '7px', borderLeft: field.prefix ? 'none' : undefined }} minLength={field.minLength || undefined} maxLength={field.maxLength || undefined} />);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {field.type !== 'checkbox' && label}
      {input}
      {error && <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: '11px', color: '#ff7777', marginTop: '4px' }}>⚠ {error}</span>}
      {!error && field.helperText && <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: '11px', color: world.mutedColor, marginTop: '5px', fontStyle: 'italic' }}>{field.helperText}</span>}
    </div>
  );
}

type Props = { encoded?: string; slug?: string; onBack: () => void };

// ── Slug-based live form fetcher + submitter ──────────────────────────────
function ApiFormView({ slug, onBack }: { slug: string; onBack: () => void }) {
  const { data, isLoading, error } = trpc.forms.getBySlug.useQuery({ slug });
  const submit = trpc.responses.submit.useMutation();
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const world = resolveSharedWorld(data?.worldTheme ?? '');

  async function handleSubmit() {
    if (!data) return;
    setSubmitError('');
    try {
      await submit.mutateAsync({ formId: data.id, data: formValues as Record<string, unknown> });
      setSubmitted(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Submission failed. Please try again.';
      setSubmitError(msg);
    }
  }

  if (isLoading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#03001c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(124,58,237,0.2)', borderTop: '3px solid #7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontFamily: "'Rajdhani', sans-serif", color: 'rgba(167,139,250,0.5)', fontSize: 13 }}>Loading form...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <span style={{ fontSize: 48 }}>💀</span>
        <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 18, color: '#ff4444' }}>Form Not Found</p>
        <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>This form may have been unpublished or deleted.</p>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", fontSize: 12 }}>← Go Back</button>
      </div>
    );
  }

  const visibleFields = (data.schema as unknown as FormField[]).filter(f => !f.hidden);
  type ApiField = (typeof visibleFields)[number] & { type: string };

  return (
    <div style={{ position: 'fixed', inset: 0, background: world.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ParticleBackground particles={world.particles} count={18} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${world.borderColor}33`, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${world.borderColor}33`, color: world.mutedColor, borderRadius: 7, padding: '7px 12px', cursor: 'pointer', fontSize: 11, fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.08em' }}>← HOME</button>
        <span style={{ fontSize: 16 }}>{world.emoji}</span>
        <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 12, fontWeight: 700, color: world.accentColor, letterSpacing: '0.06em' }}>PUBLIC FORM</div>
      </div>

      <div className="tr-scroll" style={{ position: 'relative', zIndex: 5, flex: 1, padding: '28px 20px 40px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', background: world.cardBg, border: `1px solid ${world.borderColor}55`, borderRadius: 16, overflow: 'hidden', boxShadow: `0 8px 48px rgba(0,0,0,0.6), 0 0 40px ${world.glowColor}22` }}>
          {/* Form header */}
          <div style={{ background: `linear-gradient(135deg, ${world.cardBg}, rgba(0,0,0,0.6))`, borderBottom: `1px solid ${world.borderColor}44`, padding: '24px 26px 18px' }}>
            <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(15px, 3vw, 22px)', fontWeight: 900, color: world.accentColor, letterSpacing: '0.04em', marginBottom: 6 }}>{data.title}</div>
            {data.description && <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 12, color: world.mutedColor, marginBottom: 6 }}>{data.description}</div>}
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, color: world.mutedColor, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {world.emoji} {world.name} · {visibleFields.filter(f => !['section', 'section_divider'].includes((f as ApiField).type)).length} fields
            </div>
          </div>

          {!submitted ? (
            <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {visibleFields.map(field => {
                if (['section', 'section_divider'].includes((field as ApiField).type)) {
                  return (
                    <div key={field.id} style={{ margin: '4px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: world.accentColor, flexShrink: 0, boxShadow: `0 0 8px ${world.glowColor}` }} />
                      <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 12, fontWeight: 700, color: world.accentColor }}>{field.label}</span>
                      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${world.accentColor}44, transparent)` }} />
                    </div>
                  );
                }
                return (
                  <div key={field.id}>
                    <label style={{ display: 'block', fontFamily: "'Rajdhani', sans-serif", color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600, marginBottom: 6, letterSpacing: '0.04em' }}>
                      {field.label}
                      {field.required && <span style={{ color: world.accentColor, marginLeft: 4 }}>*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea value={(formValues[field.id] as string) ?? ''} onChange={e => setFormValues(p => ({ ...p, [field.id]: e.target.value }))} placeholder={field.placeholder} rows={3}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${world.borderColor}66`, borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'system-ui' }} />
                    ) : field.type === 'select' ? (
                      <select value={(formValues[field.id] as string) ?? ''} onChange={e => setFormValues(p => ({ ...p, [field.id]: e.target.value }))}
                        style={{ width: '100%', background: '#1a0a2e', border: `1px solid ${world.borderColor}66`, borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none' }}>
                        <option value="">Select...</option>
                        {(field.options ?? []).map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : field.type === 'radio' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {(field.options ?? []).map(o => (
                          <label key={o} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer' }}>
                            <input type="radio" name={field.id} value={o} checked={formValues[field.id] === o} onChange={() => setFormValues(p => ({ ...p, [field.id]: o }))} />
                            {o}
                          </label>
                        ))}
                      </div>
                    ) : field.type === 'checkbox' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {(field.options ?? []).map(o => {
                          const selected = Array.isArray(formValues[field.id]) ? formValues[field.id] as string[] : [];
                          const checked = selected.includes(o);
                          return (
                            <label key={o} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                value={o}
                                checked={checked}
                                onChange={() => setFormValues((prev) => {
                                  const current = Array.isArray(prev[field.id]) ? prev[field.id] as string[] : [];
                                  return {
                                    ...prev,
                                    [field.id]: checked ? current.filter((item) => item !== o) : [...current, o],
                                  };
                                })}
                              />
                              {o}
                            </label>
                          );
                        })}
                      </div>
                    ) : field.type === 'rating' ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        {Array.from({ length: field.max ?? 5 }, (_, index) => {
                          const star = index + 1;
                          const active = Number(formValues[field.id] ?? 0) >= star;
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFormValues((prev) => ({ ...prev, [field.id]: star }))}
                              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 24, color: active ? world.accentColor : 'rgba(255,255,255,0.25)' }}
                            >
                              ★
                            </button>
                          );
                        })}
                      </div>
                    ) : field.type === 'range' ? (
                      <div>
                        <input
                          type="range"
                          min={field.min ?? 0}
                          max={field.max ?? 100}
                          value={Number(formValues[field.id] ?? field.min ?? 0)}
                          onChange={e => setFormValues(p => ({ ...p, [field.id]: Number(e.target.value) }))}
                          style={{ width: '100%', accentColor: world.accentColor, cursor: 'pointer' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: world.mutedColor, marginTop: 4 }}>
                          <span>{field.min ?? 0}</span>
                          <span style={{ color: world.accentColor, fontWeight: 700 }}>{Number(formValues[field.id] ?? field.min ?? 0)}</span>
                          <span>{field.max ?? 100}</span>
                        </div>
                      </div>
                    ) : (
                      <input
                        type={['number', 'currency', 'scale'].includes(field.type) ? 'number' : field.type === 'email' ? 'email' : field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : field.type === 'url' ? 'url' : field.type === 'password' ? 'password' : field.type === 'file' ? 'file' : 'text'}
                        value={(formValues[field.id] as string) ?? ''}
                        onChange={e => setFormValues(p => ({ ...p, [field.id]: field.type === 'file' ? e.target.files?.[0]?.name ?? '' : e.target.value }))}
                        placeholder={field.placeholder}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${world.borderColor}66`, borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'system-ui' }}
                      />
                    )}
                    {field.helperText && <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, color: world.mutedColor, marginTop: 4 }}>{field.helperText}</div>}
                  </div>
                );
              })}

              {submitError && <div style={{ background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.3)', borderRadius: 8, padding: '10px 14px', color: '#ff8888', fontSize: 13, fontFamily: "'Rajdhani', sans-serif" }}>⚠ {submitError}</div>}

              <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${world.borderColor}66, transparent)`, marginTop: 8 }} />

              <button onClick={handleSubmit} disabled={submit.isPending}
                style={{ background: world.buttonGradient, color: world.buttonText, fontSize: 14, padding: '14px 32px', letterSpacing: '0.15em', borderRadius: 8, alignSelf: 'flex-start', boxShadow: `0 0 20px ${world.glowColor}66`, border: 'none', cursor: submit.isPending ? 'not-allowed' : 'pointer', opacity: submit.isPending ? 0.7 : 1, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>
                {submit.isPending ? '⏳ Submitting...' : '🏃 SUBMIT FORM'}
              </button>
            </div>
          ) : (
            <div style={{ padding: '48px 26px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
              <span style={{ fontSize: 64, filter: `drop-shadow(0 0 16px ${world.glowColor})` }}>🏆</span>
              <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 20, fontWeight: 900, color: world.accentColor, filter: `drop-shadow(0 0 10px ${world.glowColor})` }}>Submitted!</div>
              <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, color: world.mutedColor, letterSpacing: '0.08em', maxWidth: 260 }}>Mission complete in {world.name}!</p>
              <button onClick={() => { setSubmitted(false); setFormValues({}); }} style={{ background: world.buttonGradient, color: world.buttonText, fontSize: 12, padding: '10px 22px', letterSpacing: '0.1em', marginTop: 8, boxShadow: `0 0 14px ${world.glowColor}55`, border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>↩ Submit Again</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SharedFormView({ encoded, slug, onBack }: Props) {
  if (slug) return <ApiFormView slug={slug} onBack={onBack} />;

  return <EncodedFormView encoded={encoded ?? ''} onBack={onBack} />;
}

function EncodedFormView({ encoded, onBack }: { encoded: string; onBack: () => void }) {
  const [payload, setPayload] = useState<SharedPayload | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPayload(decodeSharePayload(encoded));
  }, [encoded]);

  if (!payload) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <span style={{ fontSize: '48px' }}>💀</span>
        <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '18px', color: '#ff4444' }}>Invalid Share Link</p>
        <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>This link may be corrupted or expired.</p>
        <button onClick={onBack} className="tr-btn" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: '12px', padding: '10px 20px', border: '1px solid rgba(255,255,255,0.15)' }}>← Go Back</button>
      </div>
    );
  }

  const world = resolveSharedWorld(payload.worldId);
  const avatar = resolveSharedAvatar(payload.avatarId);
  const visibleFields = payload.fields.filter(f => !f.hidden);

  async function copyLink() {
    const copiedOk = await copyText(window.location.href);
    if (!copiedOk) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: world.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ParticleBackground particles={world.particles} count={18} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${world.borderColor}33`, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <button onClick={onBack} className="tr-btn" style={{ background: 'rgba(255,255,255,0.07)', color: world.mutedColor, fontSize: '11px', padding: '7px 12px', border: `1px solid ${world.borderColor}33`, letterSpacing: '0.08em', flexShrink: 0 }}>← HOME</button>
        <span style={{ fontSize: '16px' }}>{world.emoji}</span>
        <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '12px', fontWeight: 700, color: world.accentColor, letterSpacing: '0.06em' }}>SHARED FORM</div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button onClick={copyLink} style={{ background: copied ? `${world.accentColor}22` : 'rgba(255,255,255,0.06)', border: `1px solid ${copied ? world.accentColor + '55' : 'rgba(255,255,255,0.12)'}`, borderRadius: '7px', color: copied ? world.accentColor : 'rgba(255,255,255,0.5)', fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', fontWeight: 700, padding: '7px 13px', cursor: 'pointer', letterSpacing: '0.08em', transition: 'all 0.2s' }}>
            {copied ? '✓ COPIED!' : '🔗 COPY LINK'}
          </button>
          {avatar && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: `${avatar.color}15`, border: `1px solid ${avatar.color}33`, borderRadius: '12px', padding: '3px 9px 3px 5px' }}>
              <span style={{ fontSize: '16px' }}>{avatar.emoji}</span>
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', color: avatar.color, fontWeight: 600 }}>{avatar.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="tr-scroll" style={{ position: 'relative', zIndex: 5, flex: 1, padding: '28px 20px 40px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', background: world.cardBg, border: `1px solid ${world.borderColor}55`, borderRadius: '16px', overflow: 'hidden', boxShadow: `0 8px 48px rgba(0,0,0,0.6), 0 0 40px ${world.glowColor}22`, animation: 'card-enter 0.4s ease-out both' }}>
          {/* Form header */}
          <div style={{ background: `linear-gradient(135deg, ${world.cardBg}, rgba(0,0,0,0.6))`, borderBottom: `1px solid ${world.borderColor}44`, padding: '24px 26px 18px' }}>
            <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(15px, 3vw, 24px)', fontWeight: 900, color: world.accentColor, letterSpacing: '0.04em', filter: `drop-shadow(0 0 10px ${world.glowColor})`, animation: 'text-glow 3s ease-in-out infinite', marginBottom: '6px' }}>
              {payload.formTitle || 'Shared Form'}
            </div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', color: world.mutedColor, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {world.emoji} {world.name} · {visibleFields.filter(f => f.type !== 'section').length} field{visibleFields.filter(f => f.type !== 'section').length !== 1 ? 's' : ''}
            </div>
          </div>

          {!submitted ? (
            <div style={{ padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {(() => {
                const rows: React.ReactNode[] = [];
                let i = 0;
                while (i < visibleFields.length) {
                  const f = visibleFields[i];
                  if (f.type === 'section') {
                    rows.push(<SectionDivider key={f.id} field={f} />);
                    i++;
                  } else if (f.fieldWidth === 'half' && i + 1 < visibleFields.length && visibleFields[i + 1].fieldWidth === 'half' && visibleFields[i + 1].type !== 'section') {
                    const f2 = visibleFields[i + 1];
                    rows.push(
                      <div key={`${f.id}-${f2.id}`} style={{ display: 'flex', gap: '14px' }}>
                        <div style={{ flex: 1 }}><ShareField field={f} world={world} /></div>
                        <div style={{ flex: 1 }}><ShareField field={f2} world={world} /></div>
                      </div>
                    );
                    i += 2;
                  } else {
                    rows.push(<ShareField key={f.id} field={f} world={world} />);
                    i++;
                  }
                }
                return rows;
              })()}

              <div style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${world.borderColor}66, transparent)`, marginTop: '8px' }} />

              <button onClick={() => setSubmitted(true)} className="tr-btn" style={{ background: world.buttonGradient, color: world.buttonText, fontSize: '14px', padding: '14px 32px', letterSpacing: '0.15em', borderRadius: '8px', alignSelf: 'flex-start', boxShadow: `0 0 20px ${world.glowColor}66` }}>
                🏃 SUBMIT FORM
              </button>
            </div>
          ) : (
            <div style={{ padding: '48px 26px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center', animation: 'fade-in 0.5s ease-out' }}>
              <span style={{ fontSize: '64px', animation: 'bounce 1s ease-in-out infinite', filter: `drop-shadow(0 0 16px ${world.glowColor})` }}>🏆</span>
              <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '20px', fontWeight: 900, color: world.accentColor, filter: `drop-shadow(0 0 10px ${world.glowColor})` }}>Submitted!</div>
              <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '14px', color: world.mutedColor, letterSpacing: '0.08em', maxWidth: '260px' }}>Mission complete in {world.name}!</p>
              <button onClick={() => setSubmitted(false)} className="tr-btn" style={{ background: world.buttonGradient, color: world.buttonText, fontSize: '12px', padding: '10px 22px', letterSpacing: '0.1em', marginTop: '8px', boxShadow: `0 0 14px ${world.glowColor}55` }}>↩ Submit Again</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
