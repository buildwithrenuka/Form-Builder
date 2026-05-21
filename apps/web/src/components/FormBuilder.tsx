import { useState, useCallback, useRef } from 'react';
import { trpc } from '../trpc';
import { TemplatePickerModal } from './TemplatePickerModal';
import { ALL_TEMPLATES, type FormTemplate } from '../formTemplates';
import { FormField, FieldType, WorldTheme, Avatar, ValidationPreset, FormVersion } from '../types';
import { PALETTE_CATEGORIES, FIELD_TYPES, VALIDATION_PRESETS, COLLECTIONS } from '../themes';
import { ParticleBackground } from './ParticleBackground';
import { VersionPanel } from './VersionPanel';
import { copyText } from '../utils/clipboard';

type Props = {
  world: WorldTheme;
  avatar: Avatar;
  fields: FormField[];
  formTitle: string;
  versions: FormVersion[];
  purposeId: string;
  onFieldsChange: (fields: FormField[]) => void;
  onTitleChange: (title: string) => void;
  onVersionsChange: (versions: FormVersion[]) => void;
  onRestore: (v: FormVersion) => void;
  onPreview: () => void;
  onBack: () => void;
  onLogout: () => void;
};

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

function defaultField(type: FieldType): FormField {
  const label = FIELD_TYPES.find((f) => f.type === type)?.label ?? type;
  return {
    id: makeId(),
    type,
    label: type === 'section' ? 'New Section' : label,
    placeholder: ['textarea'].includes(type) ? 'Enter your message...' : `Enter ${label.toLowerCase()}...`,
    required: false,
    options: type === 'radio' || type === 'select' || type === 'checkbox' ? ['Option 1', 'Option 2', 'Option 3'] : [],
    min: type === 'range' ? 0 : type === 'rating' ? 1 : 0,
    max: type === 'range' ? 100 : type === 'rating' ? 5 : 100,
    helperText: '',
    minLength: 0,
    maxLength: 0,
    validationPreset: 'none',
    customPattern: '',
    errorMessage: '',
    fieldWidth: 'full',
    hidden: false,
    prefix: type === 'currency' ? '₹' : '',
    suffix: '',
    sectionColor: '#ffd700',
    sectionDescription: '',
  };
}

function getFieldIcon(type: FieldType) {
  return FIELD_TYPES.find((f) => f.type === type)?.icon ?? '📝';
}

function EditorInput({ value, onChange, placeholder, world, type = 'text', maxLength }: { value: string | number; onChange: (v: string) => void; placeholder?: string; world: WorldTheme; type?: string; maxLength?: number; }) {
  return (
    <input type={type} value={value} placeholder={placeholder} maxLength={maxLength} onChange={(e) => onChange(e.target.value)}
      style={{ width: '100%', background: world.inputBg, border: `1px solid ${world.borderColor}55`, borderRadius: '6px', color: world.textColor, fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', padding: '8px 10px', outline: 'none', fontWeight: 500 }}
    />
  );
}

function EditorTextarea({ value, onChange, placeholder, world, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; world: WorldTheme; rows?: number; }) {
  return (
    <textarea value={value} placeholder={placeholder} rows={rows} onChange={(e) => onChange(e.target.value)}
      style={{ width: '100%', background: world.inputBg, border: `1px solid ${world.borderColor}55`, borderRadius: '6px', color: world.textColor, fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', padding: '8px 10px', outline: 'none', fontWeight: 500, resize: 'vertical' }}
    />
  );
}

function EditorLabel({ children, world }: { children: React.ReactNode; world: WorldTheme }) {
  return (
    <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', fontWeight: 700, color: world.mutedColor, letterSpacing: '0.14em', textTransform: 'uppercase' as const, display: 'block', marginBottom: '5px' }}>
      {children}
    </span>
  );
}

function OptionsEditor({ options, world, onChange }: { options: string[]; world: WorldTheme; onChange: (opts: string[]) => void }) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function updateOption(idx: number, val: string) {
    const next = [...options];
    next[idx] = val;
    onChange(next);
  }

  function removeOption(idx: number) {
    const next = options.filter((_, i) => i !== idx);
    onChange(next.length ? next : ['Option 1']);
    setEditingIdx(null);
  }

  function addOption() {
    const next = [...options, `Option ${options.length + 1}`];
    onChange(next);
    setEditingIdx(next.length - 1);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleKeyDown(e: React.KeyboardEvent, idx: number) {
    if (e.key === 'Enter') { e.preventDefault(); addOption(); }
    if (e.key === 'Escape') setEditingIdx(null);
    if (e.key === 'Backspace' && options[idx] === '' && options.length > 1) {
      e.preventDefault(); removeOption(idx);
      setEditingIdx(Math.max(0, idx - 1));
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {options.map((opt, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${world.borderColor}55`, flexShrink: 0 }} />
            {editingIdx === idx ? (
              <input
                ref={inputRef}
                autoFocus
                value={opt}
                onChange={e => updateOption(idx, e.target.value)}
                onBlur={() => { if (!opt.trim()) updateOption(idx, `Option ${idx + 1}`); setEditingIdx(null); }}
                onKeyDown={e => handleKeyDown(e, idx)}
                style={{ flex: 1, background: `${world.accentColor}10`, border: `1px solid ${world.accentColor}55`,
                  borderRadius: 6, color: world.textColor, fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 13, padding: '5px 8px', outline: 'none' }}
              />
            ) : (
              <div
                onClick={() => setEditingIdx(idx)}
                style={{ flex: 1, padding: '5px 8px', borderRadius: 6, cursor: 'text',
                  border: '1px solid transparent', color: world.textColor,
                  fontFamily: "'Rajdhani', sans-serif", fontSize: 13,
                  borderBottom: `1px dashed ${world.borderColor}44`,
                  transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = `${world.accentColor}44`)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = `${world.borderColor}44`)}>
                {opt || <span style={{ opacity: 0.35 }}>Option {idx + 1}</span>}
              </div>
            )}
            {options.length > 1 && (
              <button onClick={() => removeOption(idx)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)',
                  cursor: 'pointer', fontSize: 16, padding: '0 2px', lineHeight: 1, flexShrink: 0,
                  transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}>
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <button onClick={addOption}
        style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, background: 'none',
          border: 'none', color: world.accentColor, fontFamily: "'Rajdhani', sans-serif",
          fontSize: 12, fontWeight: 700, padding: '4px 0', cursor: 'pointer', opacity: 0.7,
          transition: 'opacity 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}>
        + Add option
      </button>
    </div>
  );
}

type EditorTab = 'basic' | 'rules' | 'display';

function SectionEditor({ field, world, onChange }: { field: FormField; world: WorldTheme; onChange: (f: FormField) => void }) {
  const COLORS = ['#ffd700', '#00e5ff', '#ff8c00', '#ff4757', '#00b894', '#a29bfe', '#74b9ff', '#fd79a8'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
      <div><EditorLabel world={world}>Section Title</EditorLabel><EditorInput world={world} value={field.label} onChange={(v) => onChange({ ...field, label: v })} /></div>
      <div><EditorLabel world={world}>Description</EditorLabel><EditorInput world={world} value={field.sectionDescription} placeholder="Brief description..." onChange={(v) => onChange({ ...field, sectionDescription: v })} /></div>
      <div>
        <EditorLabel world={world}>Accent Colour</EditorLabel>
        <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginTop: '3px' }}>
          {COLORS.map((c) => (
            <button key={c} onClick={() => onChange({ ...field, sectionColor: c })} style={{ width: '26px', height: '26px', borderRadius: '50%', background: c, border: `3px solid ${field.sectionColor === c ? '#fff' : 'transparent'}`, cursor: 'pointer', boxShadow: field.sectionColor === c ? `0 0 10px ${c}` : 'none', transition: 'all 0.15s', flexShrink: 0 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FieldEditorPanel({ field, world, onChange }: { field: FormField; world: WorldTheme; onChange: (f: FormField) => void }) {
  const [tab, setTab] = useState<EditorTab>('basic');
  if (field.type === 'section') return <SectionEditor field={field} world={world} onChange={onChange} />;

  const isText = ['text', 'textarea', 'email', 'password', 'url', 'phone'].includes(field.type);
  const hasOptions = field.type === 'radio' || field.type === 'select' || field.type === 'checkbox';
  const hasMinMax = field.type === 'range' || field.type === 'rating' || field.type === 'number';
  const tabs = [{ id: 'basic' as EditorTab, icon: '📝', label: 'Basic' }, { id: 'rules' as EditorTab, icon: '🛡', label: 'Rules' }, { id: 'display' as EditorTab, icon: '🎨', label: 'Display' }];

  return (
    <div>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, background: tab === t.id ? `${world.accentColor}20` : 'rgba(255,255,255,0.04)', border: `1px solid ${tab === t.id ? world.accentColor + '66' : 'rgba(255,255,255,0.1)'}`, borderRadius: '6px', color: tab === t.id ? world.accentColor : 'rgba(255,255,255,0.4)', fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', padding: '6px 4px', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.15s' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'basic' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
          <div><EditorLabel world={world}>Field Label</EditorLabel><EditorInput world={world} value={field.label} onChange={(v) => onChange({ ...field, label: v })} /></div>
          {!['checkbox', 'radio', 'select', 'rating', 'file'].includes(field.type) && (
            <div><EditorLabel world={world}>Placeholder</EditorLabel><EditorInput world={world} value={field.placeholder} onChange={(v) => onChange({ ...field, placeholder: v })} /></div>
          )}
          {(field.type === 'currency' || field.type === 'number') && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}><EditorLabel world={world}>Prefix</EditorLabel><EditorInput world={world} value={field.prefix} maxLength={6} onChange={(v) => onChange({ ...field, prefix: v })} placeholder={field.type === 'currency' ? '₹ / $ / €' : '#'} /></div>
              <div style={{ flex: 1 }}><EditorLabel world={world}>Suffix</EditorLabel><EditorInput world={world} value={field.suffix} maxLength={8} onChange={(v) => onChange({ ...field, suffix: v })} placeholder="e.g. /yr" /></div>
            </div>
          )}
          <div><EditorLabel world={world}>Helper Text</EditorLabel><EditorInput world={world} value={field.helperText} placeholder="Tip shown below field..." onChange={(v) => onChange({ ...field, helperText: v })} /></div>
          {hasOptions && (
            <div><EditorLabel world={world}>Options</EditorLabel><OptionsEditor world={world} options={field.options.length ? field.options : ['Option 1', 'Option 2', 'Option 3']} onChange={(opts) => onChange({ ...field, options: opts })} /></div>
          )}
          {hasMinMax && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}><EditorLabel world={world}>Min</EditorLabel><EditorInput world={world} value={field.min} type="number" onChange={(v) => onChange({ ...field, min: Number(v) })} /></div>
              <div style={{ flex: 1 }}><EditorLabel world={world}>Max</EditorLabel><EditorInput world={world} value={field.max} type="number" onChange={(v) => onChange({ ...field, max: Number(v) })} /></div>
            </div>
          )}
        </div>
      )}

      {tab === 'rules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <EditorLabel world={world}>Field Requirement</EditorLabel>
            <div style={{ display: 'flex', gap: '8px' }}>
              {([true, false] as const).map((isReq) => (
                <button key={String(isReq)} onClick={() => onChange({ ...field, required: isReq })}
                  style={{ flex: 1, background: field.required === isReq ? (isReq ? 'rgba(255,68,68,0.2)' : 'rgba(68,255,136,0.15)') : 'rgba(0,0,0,0.25)', border: `2px solid ${field.required === isReq ? (isReq ? '#ff5555' : '#44ff88') : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', color: field.required === isReq ? (isReq ? '#ff8888' : '#77ffaa') : 'rgba(255,255,255,0.25)', fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', padding: '10px 6px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: '20px', marginBottom: '3px' }}>{isReq ? '🔴' : '🟢'}</div>
                  {isReq ? 'MANDATORY' : 'OPTIONAL'}
                </button>
              ))}
            </div>
          </div>

          {isText && (
            <div>
              <EditorLabel world={world}>Character Length Limits</EditorLabel>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '4px' }}>MIN (0 = none)</span>
                  <EditorInput world={world} value={field.minLength} type="number" onChange={(v) => onChange({ ...field, minLength: Math.max(0, Number(v)) })} />
                </div>
                <div style={{ color: 'rgba(255,255,255,0.2)', paddingBottom: '9px' }}>→</div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '4px' }}>MAX (0 = none)</span>
                  <EditorInput world={world} value={field.maxLength} type="number" onChange={(v) => onChange({ ...field, maxLength: Math.max(0, Number(v)) })} />
                </div>
              </div>
              {(field.minLength > 0 || field.maxLength > 0) && (
                <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: '11px', color: world.accentColor, marginTop: '4px', opacity: 0.7 }}>
                  {field.minLength > 0 && field.maxLength > 0 ? `${field.minLength}–${field.maxLength} chars` : field.minLength > 0 ? `Min ${field.minLength} chars` : `Max ${field.maxLength} chars`}
                </div>
              )}
            </div>
          )}

          {(isText || field.type === 'number' || field.type === 'phone') && (
            <div>
              <EditorLabel world={world}>Validation Rule</EditorLabel>
              <select value={field.validationPreset} onChange={(e) => onChange({ ...field, validationPreset: e.target.value as ValidationPreset, customPattern: '' })}
                style={{ width: '100%', background: world.inputBg, border: `1px solid ${world.borderColor}55`, borderRadius: '6px', color: world.textColor, fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', padding: '8px 10px', outline: 'none', cursor: 'pointer' }}>
                {VALIDATION_PRESETS.map((p) => (
                  <option key={p.value} value={p.value} style={{ background: '#111' }}>{p.label} — {p.hint}</option>
                ))}
              </select>
              {field.validationPreset === 'custom' && (
                <div style={{ marginTop: '7px' }}><EditorLabel world={world}>Custom Regex Pattern</EditorLabel><EditorInput world={world} value={field.customPattern} placeholder="^[A-Z]{5}[0-9]{4}[A-Z]$" onChange={(v) => onChange({ ...field, customPattern: v })} /></div>
              )}
              {field.validationPreset !== 'none' && field.validationPreset !== 'custom' && (
                <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: '10px', color: world.mutedColor, marginTop: '4px', opacity: 0.65 }}>
                  Pattern: <code style={{ color: world.accentColor }}>{VALIDATION_PRESETS.find(p => p.value === field.validationPreset)?.pattern}</code>
                </div>
              )}
            </div>
          )}

          <div><EditorLabel world={world}>Custom Error Message</EditorLabel><EditorInput world={world} value={field.errorMessage} placeholder="e.g. Please enter a valid PAN number" onChange={(v) => onChange({ ...field, errorMessage: v })} /></div>
        </div>
      )}

      {tab === 'display' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <EditorLabel world={world}>Field Width</EditorLabel>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['full', 'half'] as const).map((w) => (
                <button key={w} onClick={() => onChange({ ...field, fieldWidth: w })}
                  style={{ flex: 1, background: field.fieldWidth === w ? `${world.accentColor}20` : 'rgba(0,0,0,0.25)', border: `2px solid ${field.fieldWidth === w ? world.accentColor + '77' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', color: field.fieldWidth === w ? world.accentColor : 'rgba(255,255,255,0.3)', fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', fontWeight: 700, padding: '10px 6px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: '20px', marginBottom: '3px' }}>{w === 'full' ? '▬' : '▪'}</div>
                  {w === 'full' ? 'Full Width' : 'Half Width'}
                  <div style={{ fontSize: '10px', opacity: 0.45, marginTop: '2px' }}>{w === 'full' ? '100%' : '50%'}</div>
                </button>
              ))}
            </div>
            {field.fieldWidth === 'half' && (
              <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: '10px', color: world.mutedColor, marginTop: '5px', opacity: 0.65 }}>💡 Consecutive half-width fields share a row in preview</div>
            )}
          </div>

          <div>
            <EditorLabel world={world}>Visibility</EditorLabel>
            <div style={{ display: 'flex', gap: '8px' }}>
              {([false, true] as const).map((hide) => (
                <button key={String(hide)} onClick={() => onChange({ ...field, hidden: hide })}
                  style={{ flex: 1, background: field.hidden === hide ? (hide ? 'rgba(255,140,0,0.18)' : `${world.accentColor}14`) : 'rgba(0,0,0,0.25)', border: `2px solid ${field.hidden === hide ? (hide ? '#ff8c00' : world.accentColor) : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', color: field.hidden === hide ? (hide ? '#ff8c00' : world.accentColor) : 'rgba(255,255,255,0.28)', fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', fontWeight: 700, padding: '10px 6px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: '20px', marginBottom: '3px' }}>{hide ? '🙈' : '👁'}</div>
                  {hide ? 'Hidden' : 'Visible'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionCard({ field, index, total, world, isEditing, onEdit, onDelete, onMoveUp, onMoveDown, onChange }: { field: FormField; index: number; total: number; world: WorldTheme; isEditing: boolean; onEdit: () => void; onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void; onChange: (f: FormField) => void; }) {
  return (
    <div style={{ borderRadius: '10px', overflow: 'hidden', border: `1px solid ${field.sectionColor}44`, boxShadow: isEditing ? `0 0 16px ${field.sectionColor}33` : '0 2px 8px rgba(0,0,0,0.3)', animation: 'card-enter 0.3s ease-out both' }}>
      <div style={{ background: `linear-gradient(90deg, ${field.sectionColor}20, ${field.sectionColor}08)`, borderBottom: isEditing ? `1px solid ${field.sectionColor}33` : 'none', padding: '10px 13px', display: 'flex', alignItems: 'center', gap: '9px', cursor: 'pointer' }} onClick={onEdit}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: field.sectionColor, flexShrink: 0, boxShadow: `0 0 8px ${field.sectionColor}` }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '12px', fontWeight: 700, color: field.sectionColor }}>{field.label || 'Untitled Section'}</div>
          {field.sectionDescription && <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', color: 'rgba(255,255,255,0.38)', marginTop: '2px' }}>{field.sectionDescription}</div>}
        </div>
        <div style={{ display: 'flex', gap: '5px' }} onClick={(e) => e.stopPropagation()}>
          {[{ fn: onMoveUp, icon: '↑', dis: index === 0 }, { fn: onMoveDown, icon: '↓', dis: index === total - 1 }].map(({ fn, icon, dis }, i) => (
            <button key={i} onClick={fn} disabled={dis} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: dis ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.45)', cursor: dis ? 'not-allowed' : 'pointer', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>{icon}</button>
          ))}
          <button onClick={onEdit} style={{ background: isEditing ? `${field.sectionColor}22` : 'rgba(255,255,255,0.06)', border: `1px solid ${isEditing ? field.sectionColor + '55' : 'rgba(255,255,255,0.1)'}`, borderRadius: '4px', color: isEditing ? field.sectionColor : 'rgba(255,255,255,0.45)', cursor: 'pointer', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✏️</button>
          <button onClick={onDelete} style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', borderRadius: '4px', color: '#ff6b6b', cursor: 'pointer', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>🗑️</button>
        </div>
      </div>
      {isEditing && <div style={{ padding: '12px 13px 13px', background: 'rgba(0,0,0,0.4)' }}><SectionEditor field={field} world={world} onChange={onChange} /></div>}
    </div>
  );
}

// ─── WYSIWYG Field Preview ────────────────────────────────────────────────────
function FieldPreview({ field, world }: { field: FormField; world: WorldTheme }) {
  const inp: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    border: `1.5px solid ${world.borderColor}44`, borderRadius: 8,
    color: `${world.textColor}66`, fontFamily: "'Rajdhani', sans-serif",
    fontSize: 14, padding: '10px 14px', outline: 'none',
    boxSizing: 'border-box' as const, letterSpacing: '0.02em',
  };
  switch (field.type) {
    case 'textarea':
      return <textarea rows={3} placeholder={field.placeholder || 'Your answer'} readOnly style={{ ...inp, resize: 'none', lineHeight: 1.6, display: 'block' }} />;
    case 'select':
      return (
        <div style={{ ...inp, display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' as const }}>
          <span style={{ opacity: 0.5 }}>{field.placeholder || (field.options[0] || 'Select an option')}</span>
          <span style={{ opacity: 0.4, fontSize: 10 }}>▼</span>
        </div>
      );
    case 'radio':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(field.options.length ? field.options : ['Option 1', 'Option 2', 'Option 3']).slice(0, 4).map((o, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${i === 0 ? world.accentColor : world.borderColor + '55'}`, background: i === 0 ? `${world.accentColor}18` : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {i === 0 && <div style={{ width: 8, height: 8, borderRadius: '50%', background: world.accentColor }} />}
              </div>
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, color: i === 0 ? world.textColor : `${world.textColor}77` }}>{o}</span>
            </div>
          ))}
          {field.options.length > 4 && <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, color: world.mutedColor, paddingLeft: 32 }}>+{field.options.length - 4} more</span>}
        </div>
      );
    case 'checkbox':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(field.options?.length ? field.options : [field.label || 'Check this box']).slice(0, 3).map((o, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${i === 0 ? world.accentColor : world.borderColor + '55'}`, background: i === 0 ? `${world.accentColor}18` : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {i === 0 && <span style={{ color: world.accentColor, fontSize: 13, lineHeight: 1, fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, color: i === 0 ? world.textColor : `${world.textColor}77` }}>{o}</span>
            </div>
          ))}
        </div>
      );
    case 'rating': {
      const max = field.max || 5;
      return (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {Array.from({ length: max }, (_, i) => (
            <span key={i} style={{ fontSize: 28, color: i < Math.ceil(max / 2) ? world.accentColor : `${world.borderColor}55`, lineHeight: 1, filter: i < Math.ceil(max / 2) ? `drop-shadow(0 0 5px ${world.accentColor}66)` : 'none' }}>★</span>
          ))}
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, color: world.mutedColor, marginLeft: 6 }}>1 – {max}</span>
        </div>
      );
    }
    case 'range': {
      const min = field.min ?? 0; const max = field.max ?? 100; const mid = (min + max) / 2;
      const pct = max > min ? ((mid - min) / (max - min)) * 100 : 50;
      return (
        <div>
          <div style={{ position: 'relative', height: 24, display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: `${world.borderColor}33`, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, width: `${pct}%`, top: 0, height: '100%', background: `linear-gradient(90deg, ${world.accentColor}, ${world.glowColor || world.accentColor})`, borderRadius: 2 }} />
              <div style={{ position: 'absolute', top: '50%', left: `${pct}%`, transform: 'translate(-50%, -50%)', width: 16, height: 16, borderRadius: '50%', background: world.accentColor, boxShadow: `0 0 8px ${world.accentColor}88` }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Rajdhani', sans-serif", fontSize: 11, color: world.mutedColor }}>
            <span>{min}</span><span style={{ color: world.accentColor, fontWeight: 700 }}>{mid}</span><span>{max}</span>
          </div>
        </div>
      );
    }
    case 'date':
      return (
        <div style={{ ...inp, display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' as const }}>
          <span style={{ opacity: 0.4, letterSpacing: '0.08em' }}>DD / MM / YYYY</span>
          <span style={{ opacity: 0.4, fontSize: 16 }}>📅</span>
        </div>
      );
    case 'file':
      return (
        <div style={{ border: `2px dashed ${world.borderColor}44`, borderRadius: 10, padding: '22px 20px', textAlign: 'center', background: `${world.accentColor}05` }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>📎</div>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 13, color: `${world.textColor}55` }}>Click to upload or drag & drop</div>
        </div>
      );
    case 'number':
    case 'currency':
      return (
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: `1.5px solid ${world.borderColor}44`, borderRadius: 8, overflow: 'hidden' }}>
          {field.prefix && <span style={{ padding: '10px 14px', background: `${world.accentColor}12`, borderRight: `1px solid ${world.borderColor}33`, color: world.accentColor, fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{field.prefix}</span>}
          <span style={{ flex: 1, padding: '10px 14px', fontFamily: "'Rajdhani', sans-serif", fontSize: 14, color: `${world.textColor}44` }}>{field.placeholder || '0.00'}</span>
          {field.suffix && <span style={{ padding: '10px 14px', background: `${world.accentColor}12`, borderLeft: `1px solid ${world.borderColor}33`, color: `${world.accentColor}88`, fontFamily: "'Rajdhani', sans-serif", fontSize: 13, flexShrink: 0 }}>{field.suffix}</span>}
        </div>
      );
    case 'section': return null;
    default:
      return (
        <div style={{ position: 'relative' }}>
          <input type={field.type === 'password' ? 'password' : field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'} placeholder={field.placeholder || 'Your answer'} readOnly
            style={{ ...inp, display: 'block', paddingLeft: field.prefix ? '54px' : '14px', paddingRight: field.suffix ? '54px' : '14px' }} />
          {field.prefix && <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, padding: '0 14px', display: 'flex', alignItems: 'center', background: `${world.accentColor}12`, borderRight: `1px solid ${world.borderColor}33`, color: world.accentColor, fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}>{field.prefix}</span>}
          {field.suffix && <span style={{ position: 'absolute', right: 0, top: 0, bottom: 0, padding: '0 14px', display: 'flex', alignItems: 'center', background: `${world.accentColor}12`, borderLeft: `1px solid ${world.borderColor}33`, color: `${world.accentColor}88`, fontFamily: "'Rajdhani', sans-serif", fontSize: 13, borderTopRightRadius: 8, borderBottomRightRadius: 8 }}>{field.suffix}</span>}
        </div>
      );
  }
}

// ─── WYSIWYG Field Card ───────────────────────────────────────────────────────
function FieldCard({ field, index, total, world, isEditing, onEdit, onDelete, onMoveUp, onMoveDown, onChange, onDuplicate, onInsertBelow }: { field: FormField; index: number; total: number; world: WorldTheme; isEditing: boolean; onEdit: () => void; onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void; onChange: (f: FormField) => void; onDuplicate: () => void; onInsertBelow: (type: FieldType) => void; }) {
  const [hov, setHov] = useState(false);
  const icon = getFieldIcon(field.type);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: isEditing ? world.cardBg : 'rgba(255,255,255,0.03)', border: `1.5px solid ${isEditing ? world.accentColor + '66' : hov ? world.borderColor + '55' : 'rgba(255,255,255,0.08)'}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.18s, box-shadow 0.18s, transform 0.18s', boxShadow: isEditing ? `0 0 28px ${world.glowColor}33, 0 4px 24px rgba(0,0,0,0.4)` : hov ? '0 4px 20px rgba(0,0,0,0.35)' : '0 2px 8px rgba(0,0,0,0.2)', opacity: field.hidden ? 0.65 : 1, animation: 'card-enter 0.28s ease-out both', transform: hov && !isEditing ? 'translateY(-2px)' : 'none' }}>
      {/* Accent stripe when active */}
      {isEditing && <div style={{ height: 3, background: `linear-gradient(90deg, ${world.accentColor}, ${world.glowColor || world.accentColor}55)` }} />}
      <div style={{ padding: '18px 20px 16px' }}>
        {/* Header: drag handle + icon + label + badges + hover actions */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14, cursor: 'pointer' }} onClick={onEdit}>
          {/* drag gripper — always reserve space, visible on hover */}
          <div
            title="Drag to reorder"
            onClick={e => e.stopPropagation()}
            style={{ fontSize: 16, color: 'rgba(255,255,255,0.22)', cursor: 'grab', userSelect: 'none', flexShrink: 0, paddingTop: 2, letterSpacing: '-0.08em', opacity: hov ? 0.8 : 0.18, transition: 'opacity 0.18s' }}>
            ⠿
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{icon}</span>
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: field.label ? world.textColor : `${world.textColor}44`, letterSpacing: '0.02em', wordBreak: 'break-word' as const }}>
                {field.label || 'Untitled field'}
              </span>
              {field.required && <span style={{ color: '#f87171', fontSize: 18, lineHeight: 1, flexShrink: 0 }}>*</span>}
            </div>
            {field.helperText && <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 12, color: world.mutedColor, marginTop: 4, marginLeft: 26, lineHeight: 1.4 }}>{field.helperText}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            {field.hidden && <span style={{ fontSize: 9, background: 'rgba(255,140,0,0.12)', border: '1px solid rgba(255,140,0,0.25)', borderRadius: 4, color: '#fb923c', padding: '2px 6px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: '0.1em' }}>HIDDEN</span>}
            {field.fieldWidth === 'half' && <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, color: 'rgba(255,255,255,0.3)', padding: '2px 6px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>½</span>}
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 9, color: world.mutedColor, background: `${world.accentColor}0c`, border: `1px solid ${world.borderColor}22`, borderRadius: 4, padding: '2px 7px', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>{field.type}</span>
            {/* Actions — fade in on hover/active */}
            <div style={{ display: 'flex', gap: 3, opacity: hov || isEditing ? 1 : 0, transition: 'opacity 0.16s', pointerEvents: (hov || isEditing) ? 'auto' : 'none' }} onClick={e => e.stopPropagation()}>
              <button onClick={onMoveUp} disabled={index === 0} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: index === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.5)', cursor: index === 0 ? 'not-allowed' : 'pointer', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>↑</button>
              <button onClick={onMoveDown} disabled={index === total - 1} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: index === total - 1 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.5)', cursor: index === total - 1 ? 'not-allowed' : 'pointer', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>↓</button>
              <button onClick={onDuplicate} title="Duplicate" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>⧉</button>
              <button onClick={onDelete} style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', borderRadius: 6, color: '#f87171', cursor: 'pointer', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>×</button>
            </div>
          </div>
        </div>
        {/* WYSIWYG preview */}
        <div style={{ pointerEvents: 'none' }}>
          <FieldPreview field={field} world={world} />
        </div>
      </div>
      {/* Expanded editor */}
      {isEditing && (
        <div style={{ borderTop: `1px solid ${world.borderColor}28`, padding: '16px 20px 20px' }}>
          <FieldEditorPanel field={field} world={world} onChange={onChange} />
          {/* Google Forms-style bottom bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 18, paddingTop: 14, borderTop: `1px solid ${world.borderColor}18` }}>
            <button onClick={() => onInsertBelow(field.type)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none',
                color: world.accentColor, fontFamily: "'Rajdhani', sans-serif", fontSize: 12, fontWeight: 700,
                cursor: 'pointer', opacity: 0.65, padding: 0, transition: 'opacity 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.65')}>
              + Add question below
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 13, color: world.mutedColor, letterSpacing: '0.08em' }}>Required</span>
              <div onClick={() => onChange({ ...field, required: !field.required })} style={{ width: 46, height: 26, borderRadius: 13, background: field.required ? world.accentColor : 'rgba(255,255,255,0.1)', border: `2px solid ${field.required ? world.accentColor : 'rgba(255,255,255,0.15)'}`, cursor: 'pointer', position: 'relative', transition: 'all 0.22s', flexShrink: 0, boxShadow: field.required ? `0 0 12px ${world.accentColor}55` : 'none' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: field.required ? 22 : 2, transition: 'left 0.22s', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaletteSidebar({ world, purposeId, onAddField, onAddCollection }: { world: WorldTheme; purposeId: string; onAddField: (t: FieldType) => void; onAddCollection: (id: string) => void; }) {
  const [openCats, setOpenCats] = useState<Set<string>>(new Set(['text', 'choice']));
  const [collectionsOpen, setCollectionsOpen] = useState(true);
  const [hoverPreview, setHoverPreview] = useState<{ type: FieldType; y: number } | null>(null);

  const toggleCat = (id: string) => setOpenCats(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // Filter collections by purpose; if no purposes defined on collection = universal
  const visibleCollections = COLLECTIONS.filter(col => {
    if (!col.purposes || col.purposes.length === 0) return true;
    return col.purposes.includes(purposeId) || purposeId === '' || purposeId === 'scratch';
  });

  const catBtn = (open: boolean): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: '7px', width: '100%', background: open ? `${world.accentColor}10` : 'rgba(255,255,255,0.03)', border: `1px solid ${open ? world.borderColor + '44' : 'rgba(255,255,255,0.07)'}`, borderRadius: '6px', color: open ? world.accentColor : 'rgba(255,255,255,0.4)', fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '6px 8px', cursor: 'pointer', transition: 'all 0.15s', marginBottom: '3px' });
  const fieldBtn: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '7px', width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: world.textColor, fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', fontWeight: 600, padding: '7px 8px', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' };

  return (
    <div className="tr-scroll" style={{ width: '190px', flexShrink: 0, background: 'rgba(0,0,0,0.55)', borderRight: `1px solid ${world.borderColor}22`, padding: '12px 9px' }}>
      {PALETTE_CATEGORIES.map((cat) => (
        <div key={cat.id} style={{ marginBottom: '3px' }}>
          <button style={catBtn(openCats.has(cat.id))} onClick={() => toggleCat(cat.id)}>
            <span style={{ fontSize: '14px' }}>{cat.icon}</span>
            <span style={{ flex: 1 }}>{cat.label}</span>
            <span style={{ fontSize: '9px', opacity: 0.5 }}>{openCats.has(cat.id) ? '▲' : '▼'}</span>
          </button>
          {openCats.has(cat.id) && (
            <div style={{ paddingLeft: '6px', paddingBottom: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {cat.fields.map((f) => (
                <button key={f.type} style={fieldBtn} onClick={() => onAddField(f.type)}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = world.cardBg; el.style.borderColor = world.borderColor + '55'; el.style.boxShadow = `0 0 8px ${world.glowColor}22`;
                    setHoverPreview({ type: f.type, y: e.currentTarget.getBoundingClientRect().top });
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = 'rgba(255,255,255,0.04)'; el.style.borderColor = 'rgba(255,255,255,0.08)'; el.style.boxShadow = 'none';
                    setHoverPreview(null);
                  }}>
                  <span style={{ fontSize: '15px' }}>{f.icon}</span>
                  <span>{f.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      <div style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${world.borderColor}44, transparent)`, margin: '8px 0' }} />

      <button style={catBtn(collectionsOpen)} onClick={() => setCollectionsOpen(o => !o)}>
        <span style={{ fontSize: '14px' }}>📦</span>
        <span style={{ flex: 1 }}>Collections</span>
        <span style={{ fontSize: '9px', opacity: 0.5 }}>{visibleCollections.length} · {collectionsOpen ? '▲' : '▼'}</span>
      </button>

      {collectionsOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', paddingLeft: '2px' }}>
          {visibleCollections.map((col) => (
            <button key={col.id} onClick={() => onAddCollection(col.id)}
              style={{ background: `${col.accentColor}0d`, border: `1px solid ${col.accentColor}30`, borderRadius: '8px', color: col.accentColor, padding: '9px 10px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', width: '100%' }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = `${col.accentColor}22`; el.style.borderColor = `${col.accentColor}66`; el.style.boxShadow = `0 0 10px ${col.accentColor}33`; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = `${col.accentColor}0d`; el.style.borderColor = `${col.accentColor}30`; el.style.boxShadow = 'none'; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                <span style={{ fontSize: '16px' }}>{col.icon}</span>
                <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', fontWeight: 700 }}>{col.label}</span>
              </div>
              <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: '10px', color: `${col.accentColor}88`, lineHeight: 1.3 }}>{col.description}</div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '9px', color: `${col.accentColor}55`, marginTop: '4px', letterSpacing: '0.1em' }}>+ {col.fields.length} fields</div>
            </button>
          ))}
          {visibleCollections.length === 0 && (
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '10px 0', letterSpacing: '0.1em' }}>
              No collections for this mission type
            </div>
          )}
        </div>
      )}

      {/* Hover field-type preview tooltip */}
      {hoverPreview && (
        <div style={{
          position: 'fixed',
          left: 200,
          top: Math.max(8, Math.min(hoverPreview.y - 10, (typeof window !== 'undefined' ? window.innerHeight : 600) - 220)),
          zIndex: 300,
          background: world.cardBg,
          border: `1.5px solid ${world.accentColor}55`,
          borderRadius: 12,
          padding: '14px 16px',
          width: 220,
          boxShadow: `0 12px 40px rgba(0,0,0,0.6), 0 0 24px ${world.accentColor}18`,
          pointerEvents: 'none',
        }}>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, fontWeight: 700, color: world.accentColor, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{FIELD_TYPES.find(f => f.type === hoverPreview.type)?.icon}</span>
            <span>{FIELD_TYPES.find(f => f.type === hoverPreview.type)?.label}</span>
          </div>
          <div style={{ pointerEvents: 'none' }}>
            <FieldPreview field={defaultField(hoverPreview.type)} world={world} />
          </div>
        </div>
      )}
    </div>
  );
}

export function FormBuilder({
  world, avatar, fields, formTitle, versions, purposeId,
  onFieldsChange, onTitleChange, onVersionsChange, onRestore, onPreview, onBack, onLogout,
}: Props) {
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [showVersions, setShowVersions] = useState(false);
  const [shareMsg, setShareMsg]     = useState('');
  const [importMsg, setImportMsg]   = useState('');
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [savedFormId, setSavedFormId] = useState<string | null>(null);
  const [savedFormSlug, setSavedFormSlug] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [publishMsg, setPublishMsg]   = useState('');

  const createMut  = trpc.forms.create.useMutation();
  const updateMut  = trpc.forms.update.useMutation();
  const publishMut = trpc.forms.setPublished.useMutation();

  async function handlePublish() {
    if (fieldCount === 0) return;
    try {
      let fid = savedFormId;
      if (!fid) {
        const created = await createMut.mutateAsync({
          title: formTitle || 'Untitled Form',
          worldTheme: world.id,
        });
        fid = created.id;
        setSavedFormId(fid);
        setSavedFormSlug(created.slug);
      }
      await updateMut.mutateAsync({
        id: fid,
        title: formTitle || 'Untitled Form',
        worldTheme: world.id,
        schema: fields,
      });
      const next = !isPublished;
      await publishMut.mutateAsync({ id: fid, published: next });
      setIsPublished(next);
      setPublishMsg(next ? '✓ Published!' : '✓ Unpublished');
      setTimeout(() => setPublishMsg(''), 3000);
    } catch {
      setPublishMsg('⚠ Error');
      setTimeout(() => setPublishMsg(''), 3000);
    }
  }

  const addField = useCallback((type: FieldType) => {
    const f = defaultField(type);
    onFieldsChange([...fields, f]);
    setEditingId(f.id);
  }, [fields, onFieldsChange]);

  const addCollection = useCallback((collectionId: string) => {
    const col = COLLECTIONS.find((c) => c.id === collectionId);
    if (!col) return;
    const newFields = col.fields.map((partial) => ({ ...defaultField(partial.type), ...partial, id: makeId() }));
    onFieldsChange([...fields, ...newFields]);
  }, [fields, onFieldsChange]);

  const updateField = useCallback((updated: FormField) => onFieldsChange(fields.map((f) => (f.id === updated.id ? updated : f))), [fields, onFieldsChange]);

  const deleteField = useCallback((id: string) => {
    onFieldsChange(fields.filter((f) => f.id !== id));
    if (editingId === id) setEditingId(null);
  }, [fields, onFieldsChange, editingId]);

  const moveField = useCallback((index: number, direction: 'up' | 'down') => {
    const arr = [...fields];
    const swap = direction === 'up' ? index - 1 : index + 1;
    if (swap < 0 || swap >= arr.length) return;
    [arr[index], arr[swap]] = [arr[swap], arr[index]];
    onFieldsChange(arr);
  }, [fields, onFieldsChange]);

  const duplicateField = useCallback((index: number) => {
    const dupe = { ...fields[index], id: makeId() };
    const arr = [...fields];
    arr.splice(index + 1, 0, dupe);
    onFieldsChange(arr);
    setEditingId(dupe.id);
  }, [fields, onFieldsChange]);

  const insertFieldBelow = useCallback((index: number, type: FieldType) => {
    const f = defaultField(type);
    const arr = [...fields];
    arr.splice(index + 1, 0, f);
    onFieldsChange(arr);
    setEditingId(f.id);
  }, [fields, onFieldsChange]);

  const fieldCount = fields.filter(f => f.type !== 'section').length;
  const reqCount   = fields.filter(f => f.type !== 'section' && f.required).length;
  const secCount   = fields.filter(f => f.type === 'section').length;
  const visibleCollections = COLLECTIONS.filter(col =>
    !col.purposes?.length || col.purposes.includes(purposeId) || !purposeId || purposeId === 'scratch'
  );

  async function copyShareLink() {
    if (fieldCount === 0) return;
    try {
      let fid = savedFormId;
      let slug = savedFormSlug;

      if (!fid) {
        const created = await createMut.mutateAsync({
          title: formTitle || 'Untitled Form',
          worldTheme: world.id,
        });
        fid = created.id;
        slug = created.slug;
        setSavedFormId(fid);
        setSavedFormSlug(slug);
      }

      await updateMut.mutateAsync({
        id: fid,
        title: formTitle || 'Untitled Form',
        worldTheme: world.id,
        schema: fields,
      });

      if (!isPublished) {
        await publishMut.mutateAsync({ id: fid, published: true });
        setIsPublished(true);
      }

      const url = `${window.location.origin}?slug=${slug}`;
      const copied = await copyText(url);
      setShareMsg(copied ? 'Live link copied!' : 'Copy failed');
    } catch {
      setShareMsg('Share failed');
    }
    setTimeout(() => setShareMsg(''), 2500);
  }

  function exportTemplate() {
    const payload = { schemaVersion: 1, exportedAt: new Date().toISOString(), formTitle, worldId: world.id, avatarId: avatar.id, purposeId, fields };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${formTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'temple_form'}.trform.json`; a.click();
    URL.revokeObjectURL(url);
  }

  function importTemplate() {
    const input  = document.createElement('input');
    input.type   = 'file';
    input.accept = '.json,.trform.json';
    input.onchange = () => {
      const file = input.files?.[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          if (!Array.isArray(parsed.fields)) throw new Error();
          const imported: FormField[] = parsed.fields.map((f: FormField) => ({ ...f, id: makeId() }));
          onFieldsChange(imported);
          if (parsed.formTitle) onTitleChange(parsed.formTitle);
          setImportMsg(`✓ ${parsed.formTitle || file.name}`);
          setTimeout(() => setImportMsg(''), 3500);
        } catch {
          setImportMsg('⚠ Invalid file');
          setTimeout(() => setImportMsg(''), 3000);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  // ── Button style helpers ──────────────────────────────────────────────────
  const toolBtn = (active = false, danger = false): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 5,
    background: danger ? 'rgba(255,60,60,0.07)' : active ? `${world.accentColor}18` : 'rgba(255,255,255,0.05)',
    border: `1px solid ${danger ? 'rgba(255,80,80,0.22)' : active ? world.accentColor + '44' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 8,
    color: danger ? 'rgba(255,120,120,0.75)' : active ? world.accentColor : 'rgba(255,255,255,0.5)',
    fontFamily: "'Rajdhani', sans-serif", fontSize: 11, fontWeight: 700,
    letterSpacing: '0.08em', padding: '7px 13px', cursor: 'pointer',
    transition: 'all 0.18s', flexShrink: 0, whiteSpace: 'nowrap' as const,
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: world.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ParticleBackground particles={world.particles} count={12} />

      {showTemplates && (
        <TemplatePickerModal
          world={world}
          onClose={() => setShowTemplates(false)}
          onApply={(t: FormTemplate) => {
            onFieldsChange(t.fields.map(f => ({ ...defaultField(f.type), ...f, id: makeId() })));
            if (t.name) onTitleChange(t.name);
            setEditingId(null);
            setShowTemplates(false);
          }}
        />
      )}

      {showVersions && (
        <VersionPanel versions={versions} world={world} currentTitle={formTitle} currentFields={fields}
          worldId={world.id} avatarId={avatar.id} onSave={onVersionsChange} onRestore={onRestore} onClose={() => setShowVersions(false)} />
      )}

      {/* ══ TOP NAV BAR ══ */}
      <div style={{ position: 'relative', zIndex: 10, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${world.borderColor}28`, padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>

        {/* Left — back + identity */}
        <button onClick={onBack} style={toolBtn()}>← Back</button>

        <div style={{ width: 1, height: 24, background: `${world.borderColor}30`, flexShrink: 0 }} />

        {/* World + avatar badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${world.accentColor}10`, border: `1px solid ${world.accentColor}28`, borderRadius: 20, padding: '4px 12px 4px 8px', flexShrink: 0 }}>
          <span style={{ fontSize: 18 }}>{world.emoji}</span>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 12, color: world.accentColor, fontWeight: 700, letterSpacing: '0.05em' }}>{world.name}</span>
          <span style={{ width: 1, height: 14, background: `${world.accentColor}30` }} />
          <span style={{ fontSize: 16 }}>{avatar.emoji}</span>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, color: `${world.accentColor}99`, fontWeight: 600 }}>{avatar.name}</span>
        </div>

        {/* Form title — centre */}
        <input
          value={formTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled Form..."
          style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid ${world.borderColor}33`, borderRadius: 8, color: world.textColor, fontFamily: "'Cinzel Decorative', serif", fontSize: 13, fontWeight: 700, padding: '7px 14px', outline: 'none', letterSpacing: '0.04em', minWidth: 0, transition: 'border-color 0.18s' }}
          onFocus={e => { e.currentTarget.style.borderColor = `${world.accentColor}55`; e.currentTarget.style.background = `${world.accentColor}08`; }}
          onBlur={e  => { e.currentTarget.style.borderColor = `${world.borderColor}33`; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
        />

        {/* Stats pills */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {[
            { n: fieldCount, l: 'fields',   c: fieldCount > 0 ? world.accentColor : 'rgba(255,255,255,0.22)' },
            { n: reqCount,   l: 'required', c: reqCount   > 0 ? '#f87171'         : 'rgba(255,255,255,0.22)' },
            { n: secCount,   l: 'sections', c: secCount   > 0 ? '#fbbf24'         : 'rgba(255,255,255,0.22)' },
          ].map(({ n, l, c }) => (
            <div key={l} style={{ background: `${c}10`, border: `1px solid ${c}25`, borderRadius: 8, padding: '4px 10px', textAlign: 'center', minWidth: 44 }}>
              <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 14, fontWeight: 900, color: c, lineHeight: 1 }}>{n}</div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 8, color: `${c}77`, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: `${world.borderColor}30`, flexShrink: 0 }} />

        {/* Action buttons */}
        <button onClick={() => setShowTemplates(true)} style={{ ...toolBtn(showTemplates), background: showTemplates ? `${world.accentColor}22` : `${world.accentColor}10`, border: `1px solid ${world.accentColor}44`, color: world.accentColor, fontWeight: 700 }}>
          📋 Templates
        </button>
        <button onClick={importTemplate} style={toolBtn(!!importMsg, false)} title="Import .trform.json">
          📤 {importMsg || 'Import'}
        </button>
        <button onClick={exportTemplate} disabled={fieldCount === 0} style={{ ...toolBtn(), opacity: fieldCount === 0 ? 0.35 : 1, cursor: fieldCount === 0 ? 'not-allowed' : 'pointer' }} title="Export .trform.json">
          📥 Export
        </button>
        <button onClick={copyShareLink} disabled={fieldCount === 0} style={{ ...toolBtn(!!shareMsg), opacity: fieldCount === 0 ? 0.35 : 1, cursor: fieldCount === 0 ? 'not-allowed' : 'pointer' }}>
          🔗 {shareMsg || 'Share'}
        </button>
        <button onClick={() => setShowVersions(v => !v)} style={{ ...toolBtn(showVersions), position: 'relative' }}>
          🕐 Versions
          {versions.length > 0 && (
            <span style={{ position: 'absolute', top: -6, right: -6, background: world.accentColor, color: '#000', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 900, fontFamily: "'Rajdhani', sans-serif" }}>{versions.length}</span>
          )}
        </button>

        <div style={{ width: 1, height: 24, background: `${world.borderColor}30`, flexShrink: 0 }} />

        <button onClick={handlePublish} disabled={fieldCount === 0 || createMut.isPending || publishMut.isPending}
          style={{ ...toolBtn(isPublished), opacity: fieldCount === 0 ? 0.35 : 1, cursor: fieldCount === 0 ? 'not-allowed' : 'pointer',
            background: isPublished ? 'rgba(249,115,22,0.12)' : 'rgba(34,197,94,0.12)',
            border: `1px solid ${isPublished ? 'rgba(249,115,22,0.4)' : 'rgba(34,197,94,0.4)'}`,
            color: publishMsg.startsWith('⚠') ? '#f87171' : isPublished ? '#f97316' : '#4ade80',
            fontWeight: 700, flexShrink: 0 }}>
          {createMut.isPending || publishMut.isPending ? '⏳' : isPublished ? '🔒 Unpublish' : '🌐 Publish'}
          {publishMsg && <span style={{ marginLeft: 4, fontSize: 10 }}>{publishMsg}</span>}
        </button>

        <button onClick={onPreview} disabled={fieldCount === 0} style={{ display: 'flex', alignItems: 'center', gap: 6, background: fieldCount > 0 ? world.buttonGradient : 'rgba(255,255,255,0.04)', border: 'none', borderRadius: 8, color: fieldCount > 0 ? world.buttonText : 'rgba(255,255,255,0.2)', fontFamily: "'Rajdhani', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', padding: '9px 18px', cursor: fieldCount > 0 ? 'pointer' : 'not-allowed', boxShadow: fieldCount > 0 ? `0 0 18px ${world.glowColor}55` : 'none', transition: 'all 0.18s', flexShrink: 0 }}
          onMouseEnter={e => { if (fieldCount > 0) e.currentTarget.style.filter = 'brightness(1.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}>
          👁 Preview
        </button>

        <button onClick={onLogout} style={toolBtn(false, true)}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,60,60,0.18)'; (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,60,60,0.07)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,120,120,0.75)'; }}>
          🚪 Logout
        </button>
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div style={{ position: 'relative', zIndex: 5, flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left palette sidebar */}
        <PaletteSidebar world={world} purposeId={purposeId} onAddField={addField} onAddCollection={addCollection} />

        {/* ── Canvas ── */}
        <div className="tr-scroll" style={{ flex: 1, overflowY: 'auto', background: 'rgba(255,255,255,0.018)', boxShadow: 'inset 1px 0 0 rgba(255,255,255,0.05)' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 24px 80px' }}>

            {/* ── Collections Quick-Add Strip (always visible) ── */}
          {visibleCollections.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: world.accentColor }}>⚡ Quick Add</span>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${world.accentColor}33, transparent)` }} />
              </div>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {visibleCollections.map(col => (
                  <button key={col.id} onClick={() => addCollection(col.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: `${col.accentColor}0e`, border: `1px solid ${col.accentColor}35`, borderRadius: 10, color: col.accentColor, fontFamily: "'Rajdhani', sans-serif", fontSize: 12, fontWeight: 700, padding: '6px 13px', cursor: 'pointer', whiteSpace: 'nowrap' as const, flexShrink: 0, transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${col.accentColor}22`; e.currentTarget.style.borderColor = `${col.accentColor}66`; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 4px 14px ${col.accentColor}28`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${col.accentColor}0e`; e.currentTarget.style.borderColor = `${col.accentColor}35`; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <span style={{ fontSize: 15 }}>{col.icon}</span>
                    {col.label}
                    <span style={{ opacity: 0.5, fontSize: 10 }}>+{col.fields.length}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {fields.length === 0 ? (
            /* ── Empty state — actionable ── */
            <div>
              {/* Quick-start template cards */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${world.borderColor}33)` }} />
                  <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, color: world.mutedColor, letterSpacing: '0.18em', textTransform: 'uppercase' as const }}>Start from a template</span>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${world.borderColor}33, transparent)` }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  {['contact-us', 'job-application', 'customer-feedback', 'event-registration'].map(tid => {
                    const t = ALL_TEMPLATES.find(x => x.id === tid);
                    if (!t) return null;
                    return (
                      <button key={tid}
                        onClick={() => { onFieldsChange(t.fields.map(f => ({ ...defaultField(f.type), ...f, id: makeId() }))); onTitleChange(t.name); }}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: `${t.accentColor}0c`, border: `1.5px solid ${t.accentColor}30`, borderRadius: 14, padding: '14px 16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', width: '100%' }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${t.accentColor}1c`; e.currentTarget.style.borderColor = `${t.accentColor}66`; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 28px rgba(0,0,0,0.4), 0 0 22px ${t.accentColor}18`; }}
                        onMouseLeave={e => { e.currentTarget.style.background = `${t.accentColor}0c`; e.currentTarget.style.borderColor = `${t.accentColor}30`; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                        <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{t.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{t.name}</div>
                          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.38)', lineHeight: 1.4, marginBottom: 8 }}>{t.description}</div>
                          <span style={{ fontSize: 10, color: t.accentColor, background: `${t.accentColor}14`, border: `1px solid ${t.accentColor}30`, borderRadius: 20, padding: '2px 8px', fontWeight: 700 }}>{t.fields.filter(f => f.type !== 'section').length} fields</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 10, textAlign: 'center' }}>
                  <button onClick={() => setShowTemplates(true)} style={{ background: 'none', border: 'none', color: world.accentColor, fontFamily: "'Rajdhani', sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: 0.7, letterSpacing: '0.08em' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}>
                    Browse all {ALL_TEMPLATES.length} templates →
                  </button>
                </div>
              </div>

              {/* Scratch / drag-drop zone */}
              <div style={{ border: `1.5px dashed ${world.borderColor}30`, borderRadius: 14, padding: '22px 24px', background: `${world.accentColor}03`, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.4 }}>⠿</div>
                <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.28)', marginBottom: 14, letterSpacing: '0.05em' }}>
                  Drag fields from the left panel — or click a type to add instantly:
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {(['text','email','phone','number','select','textarea','radio','rating'] as FieldType[]).map(t => {
                    const ft = FIELD_TYPES.find(f => f.type === t);
                    return (
                      <button key={t} onClick={() => addField(t)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${world.accentColor}10`, border: `1px solid ${world.accentColor}28`, borderRadius: 20, color: world.accentColor, fontFamily: "'Rajdhani', sans-serif", fontSize: 12, fontWeight: 700, padding: '7px 16px', cursor: 'pointer', transition: 'all 0.18s', letterSpacing: '0.05em' }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${world.accentColor}22`; e.currentTarget.style.boxShadow = `0 0 14px ${world.accentColor}33`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = `${world.accentColor}10`; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                        <span>{ft?.icon}</span> {ft?.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottom: `1px solid ${world.borderColor}20` }}>
                  <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 11, color: world.accentColor, letterSpacing: '0.12em' }}>{fieldCount} FIELD{fieldCount !== 1 ? 'S' : ''}</span>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${world.borderColor}33, transparent)` }} />
                  <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, color: world.mutedColor, opacity: 0.5, letterSpacing: '0.12em' }}>Click a field to edit</span>
                </div>
                {fields.map((field, i) =>
                  field.type === 'section'
                    ? <SectionCard key={field.id} field={field} index={i} total={fields.length} world={world}
                        isEditing={editingId === field.id}
                        onEdit={() => setEditingId(editingId === field.id ? null : field.id)}
                        onDelete={() => deleteField(field.id)}
                        onMoveUp={() => moveField(i, 'up')} onMoveDown={() => moveField(i, 'down')}
                        onChange={updateField} />
                    : <FieldCard key={field.id} field={field} index={i} total={fields.length} world={world}
                        isEditing={editingId === field.id}
                        onEdit={() => setEditingId(editingId === field.id ? null : field.id)}
                        onDelete={() => deleteField(field.id)}
                        onMoveUp={() => moveField(i, 'up')} onMoveDown={() => moveField(i, 'down')}
                        onChange={updateField}
                        onDuplicate={() => duplicateField(i)}
                        onInsertBelow={(type) => insertFieldBelow(i, type)} />
                )}
              </div>
            )}

            {/* ── Add a field button — always visible ── */}
            <div style={{ marginTop: fields.length === 0 ? 28 : 20, position: 'relative' }}>
              <button
                onClick={() => setShowAddPicker(p => !p)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', background: showAddPicker ? `${world.accentColor}14` : 'rgba(255,255,255,0.03)', border: `1.5px dashed ${showAddPicker ? world.accentColor + '55' : world.borderColor + '33'}`, borderRadius: 12, color: showAddPicker ? world.accentColor : `${world.textColor}44`, fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', padding: '15px', cursor: 'pointer', transition: 'all 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.background = `${world.accentColor}10`; e.currentTarget.style.borderColor = `${world.accentColor}44`; e.currentTarget.style.color = world.accentColor; }}
                onMouseLeave={e => { if (!showAddPicker) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = `${world.borderColor}33`; e.currentTarget.style.color = `${world.textColor}44`; } }}>
                <span style={{ fontSize: 20, lineHeight: 1 }}>＋</span>
                Add a field
                <span style={{ fontSize: 11, opacity: 0.45, fontWeight: 400 }}>{showAddPicker ? '▲' : '▼'}</span>
              </button>
              {showAddPicker && (
                <div style={{ marginTop: 8, background: world.cardBg, border: `1px solid ${world.borderColor}44`, borderRadius: 14, padding: '20px', boxShadow: `0 8px 40px rgba(0,0,0,0.55), 0 0 30px ${world.glowColor}18` }}>
                  {PALETTE_CATEGORIES.map(cat => (
                    <div key={cat.id} style={{ marginBottom: 16 }}>
                      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 10, color: world.mutedColor, letterSpacing: '0.18em', textTransform: 'uppercase' as const, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{cat.icon}</span>{cat.label}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {cat.fields.map(f => (
                          <button key={f.type} onClick={() => { addField(f.type); setShowAddPicker(false); }}
                            style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.05)', border: `1px solid ${world.borderColor}33`, borderRadius: 8, color: world.textColor, fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 600, padding: '7px 14px', cursor: 'pointer', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = `${world.accentColor}15`; e.currentTarget.style.borderColor = `${world.accentColor}44`; e.currentTarget.style.color = world.accentColor; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = `${world.borderColor}33`; e.currentTarget.style.color = world.textColor; e.currentTarget.style.transform = 'none'; }}>
                            <span style={{ fontSize: 16 }}>{f.icon}</span>{f.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
