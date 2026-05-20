import { useState, useCallback } from 'react';
import { FormField, FieldType, WorldTheme, Avatar, ValidationPreset, FormVersion } from '../types';
import { PALETTE_CATEGORIES, FIELD_TYPES, VALIDATION_PRESETS, COLLECTIONS } from '../themes';
import { ParticleBackground } from './ParticleBackground';
import { VersionPanel } from './VersionPanel';
import { buildShareUrl } from './SharedFormView';

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
    options: type === 'radio' || type === 'select' ? ['Option 1', 'Option 2', 'Option 3'] : [],
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
  const hasOptions = field.type === 'radio' || field.type === 'select';
  const hasMinMax = field.type === 'range' || field.type === 'rating';
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
            <div><EditorLabel world={world}>Options (one per line)</EditorLabel><EditorTextarea world={world} value={field.options.join('\n')} placeholder={'Option 1\nOption 2\nOption 3'} onChange={(v) => onChange({ ...field, options: v.split('\n') })} /></div>
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

function FieldCard({ field, index, total, world, isEditing, onEdit, onDelete, onMoveUp, onMoveDown, onChange }: { field: FormField; index: number; total: number; world: WorldTheme; isEditing: boolean; onEdit: () => void; onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void; onChange: (f: FormField) => void; }) {
  const icon = getFieldIcon(field.type);
  return (
    <div style={{ background: isEditing ? world.cardBg : 'rgba(0,0,0,0.4)', border: `1px solid ${isEditing ? world.borderColor : field.hidden ? 'rgba(255,140,0,0.2)' : 'rgba(255,255,255,0.09)'}`, borderRadius: '10px', overflow: 'hidden', transition: 'all 0.2s ease', boxShadow: isEditing ? `0 0 16px ${world.glowColor}44` : '0 2px 8px rgba(0,0,0,0.3)', opacity: field.hidden ? 0.6 : 1, animation: 'card-enter 0.3s ease-out both' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '10px 12px', cursor: 'pointer' }} onClick={onEdit}>
        <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>{index + 1}</span>
        <span style={{ fontSize: '17px', flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', fontWeight: 700, color: world.textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{field.label || '(unlabeled)'}</span>
            <span style={{ background: field.required ? 'rgba(255,68,68,0.2)' : 'rgba(68,255,136,0.1)', border: `1px solid ${field.required ? 'rgba(255,68,68,0.4)' : 'rgba(68,255,136,0.2)'}`, borderRadius: '3px', color: field.required ? '#ff8888' : '#77ffaa', fontSize: '8px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: '0.1em', padding: '1px 5px', flexShrink: 0 }}>
              {field.required ? 'REQUIRED' : 'OPTIONAL'}
            </span>
            {field.hidden && <span style={{ background: 'rgba(255,140,0,0.15)', border: '1px solid rgba(255,140,0,0.3)', borderRadius: '3px', color: '#ff8c00', fontSize: '8px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: '0.1em', padding: '1px 5px' }}>HIDDEN</span>}
            {field.fieldWidth === 'half' && <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '3px', color: 'rgba(255,255,255,0.35)', fontSize: '8px', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, padding: '1px 5px' }}>½</span>}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '2px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', color: world.mutedColor, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{field.type}</span>
            {field.maxLength > 0 && <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '9px', color: world.mutedColor, opacity: 0.6 }}>max {field.maxLength}</span>}
            {field.minLength > 0 && <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '9px', color: world.mutedColor, opacity: 0.6 }}>min {field.minLength}</span>}
            {field.validationPreset !== 'none' && <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '9px', color: world.accentColor, opacity: 0.7 }}>{VALIDATION_PRESETS.find(p => p.value === field.validationPreset)?.label}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          {[{ fn: onMoveUp, icon: '↑', dis: index === 0 }, { fn: onMoveDown, icon: '↓', dis: index === total - 1 }].map(({ fn, icon, dis }, i) => (
            <button key={i} onClick={fn} disabled={dis} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '5px', color: dis ? 'rgba(255,255,255,0.15)' : world.textColor, cursor: dis ? 'not-allowed' : 'pointer', width: '27px', height: '27px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>{icon}</button>
          ))}
          <button onClick={onEdit} style={{ background: isEditing ? `${world.accentColor}30` : 'rgba(255,255,255,0.06)', border: `1px solid ${isEditing ? world.accentColor + '66' : 'rgba(255,255,255,0.1)'}`, borderRadius: '5px', color: isEditing ? world.accentColor : world.textColor, cursor: 'pointer', width: '27px', height: '27px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✏️</button>
          <button onClick={onDelete} style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', borderRadius: '5px', color: '#ff6b6b', cursor: 'pointer', width: '27px', height: '27px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>🗑️</button>
        </div>
      </div>
      {isEditing && (
        <div style={{ padding: '0 12px 12px', borderTop: `1px solid ${world.borderColor}33` }}>
          <div style={{ paddingTop: '12px' }}><FieldEditorPanel field={field} world={world} onChange={onChange} /></div>
        </div>
      )}
    </div>
  );
}

function PaletteSidebar({ world, purposeId, onAddField, onAddCollection }: { world: WorldTheme; purposeId: string; onAddField: (t: FieldType) => void; onAddCollection: (id: string) => void; }) {
  const [openCats, setOpenCats] = useState<Set<string>>(new Set(['text', 'choice']));
  const [collectionsOpen, setCollectionsOpen] = useState(true);

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
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = world.cardBg; el.style.borderColor = world.borderColor + '55'; el.style.boxShadow = `0 0 8px ${world.glowColor}22`; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'rgba(255,255,255,0.04)'; el.style.borderColor = 'rgba(255,255,255,0.08)'; el.style.boxShadow = 'none'; }}>
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
    </div>
  );
}

export function FormBuilder({
  world, avatar, fields, formTitle, versions, purposeId,
  onFieldsChange, onTitleChange, onVersionsChange, onRestore, onPreview, onBack, onLogout,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showVersions, setShowVersions] = useState(false);
  const [shareMsg, setShareMsg] = useState('');
  const [importMsg, setImportMsg] = useState('');

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

  const fieldCount = fields.filter(f => f.type !== 'section').length;
  const reqCount = fields.filter(f => f.type !== 'section' && f.required).length;
  const secCount = fields.filter(f => f.type === 'section').length;

  function copyShareLink() {
    const url = buildShareUrl({ formTitle, fields, worldId: world.id, avatarId: avatar.id });
    navigator.clipboard.writeText(url).then(() => {
      setShareMsg('Link copied!');
      setTimeout(() => setShareMsg(''), 2500);
    });
  }

  /** Download the current form as a .trform.json file */
  function exportTemplate() {
    const payload = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      formTitle,
      worldId: world.id,
      avatarId: avatar.id,
      purposeId,
      fields,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'temple_form'}.trform.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Open a file picker and import a .trform.json template */
  function importTemplate() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.trform.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          if (!Array.isArray(parsed.fields)) throw new Error('Invalid template');
          // Re-assign fresh IDs so no collisions
          const imported: FormField[] = parsed.fields.map((f: FormField) => ({ ...f, id: makeId() }));
          onFieldsChange(imported);
          if (parsed.formTitle) onTitleChange(parsed.formTitle);
          setImportMsg(`Imported: ${parsed.formTitle || file.name}`);
          setTimeout(() => setImportMsg(''), 3500);
        } catch {
          setImportMsg('⚠ Invalid file format');
          setTimeout(() => setImportMsg(''), 3000);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: world.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ParticleBackground particles={world.particles} count={14} />

      {/* Version panel overlay */}
      {showVersions && (
        <VersionPanel
          versions={versions}
          world={world}
          currentTitle={formTitle}
          currentFields={fields}
          worldId={world.id}
          avatarId={avatar.id}
          onSave={onVersionsChange}
          onRestore={onRestore}
          onClose={() => setShowVersions(false)}
        />
      )}

      <div style={{ position: 'relative', zIndex: 10, background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${world.borderColor}33`, padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '9px', flexShrink: 0 }}>
        <button onClick={onBack} className="tr-btn" style={{ background: 'rgba(255,255,255,0.07)', color: world.mutedColor, fontSize: '11px', padding: '7px 12px', border: `1px solid ${world.borderColor}33`, letterSpacing: '0.08em', flexShrink: 0 }}>← BACK</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${avatar.color}33`, borderRadius: '14px', padding: '3px 9px 3px 5px', flexShrink: 0 }}>
          <span style={{ fontSize: '16px' }}>{avatar.emoji}</span>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', color: avatar.color, fontWeight: 600 }}>{avatar.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: world.cardBg, border: `1px solid ${world.borderColor}44`, borderRadius: '13px', padding: '3px 9px 3px 5px', flexShrink: 0 }}>
          <span style={{ fontSize: '14px' }}>{world.emoji}</span>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', color: world.accentColor, fontWeight: 600 }}>{world.name}</span>
        </div>
        <input value={formTitle} onChange={(e) => onTitleChange(e.target.value)} placeholder="Form title..." style={{ flex: 1, background: world.inputBg, border: `1px solid ${world.borderColor}44`, borderRadius: '7px', color: world.textColor, fontFamily: "'Cinzel Decorative', serif", fontSize: '13px', fontWeight: 700, padding: '7px 12px', outline: 'none', letterSpacing: '0.04em' }} />
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          {[{ v: fieldCount, l: 'Fields', c: world.accentColor }, { v: reqCount, l: 'Required', c: '#ff8888' }, { v: secCount, l: 'Sections', c: '#ffd700' }].map(({ v, l, c }) => (
            <div key={l} style={{ background: world.cardBg, border: `1px solid ${world.borderColor}44`, borderRadius: '7px', padding: '4px 9px', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '13px', fontWeight: 700, color: c }}>{v}</div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '8px', color: world.mutedColor, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{l}</div>
            </div>
          ))}
        </div>
        {/* Export template */}
        <button onClick={exportTemplate} disabled={fieldCount === 0} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '7px', color: fieldCount > 0 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)', fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', padding: '7px 12px', cursor: fieldCount > 0 ? 'pointer' : 'not-allowed', transition: 'all 0.2s', flexShrink: 0 }}
          title="Download form as .trform.json">
          📥 EXPORT
        </button>
        {/* Import template */}
        <button onClick={importTemplate} style={{ background: `${importMsg.startsWith('⚠') ? 'rgba(255,100,50,0.1)' : importMsg ? `${world.accentColor}10` : 'rgba(255,255,255,0.07)'}`, border: `1px solid ${importMsg.startsWith('⚠') ? '#ff6633' : importMsg ? world.accentColor + '55' : 'rgba(255,255,255,0.12)'}`, borderRadius: '7px', color: importMsg.startsWith('⚠') ? '#ff9977' : importMsg ? world.accentColor : 'rgba(255,255,255,0.55)', fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', padding: '7px 12px', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
          title="Import form from .trform.json">
          {importMsg ? (importMsg.startsWith('⚠') ? importMsg : `✓ ${importMsg.length > 18 ? importMsg.slice(0, 18) + '…' : importMsg}`) : '📤 IMPORT'}
        </button>
        {/* Share button */}
        <button onClick={copyShareLink} disabled={fieldCount === 0} style={{ background: fieldCount > 0 ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)', border: `1px solid ${shareMsg ? world.accentColor + '66' : 'rgba(255,255,255,0.12)'}`, borderRadius: '7px', color: shareMsg ? world.accentColor : (fieldCount > 0 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)'), fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', padding: '7px 12px', cursor: fieldCount > 0 ? 'pointer' : 'not-allowed', transition: 'all 0.2s', flexShrink: 0 }}>
          {shareMsg ? '✓ ' + shareMsg : '🔗 SHARE'}
        </button>
        {/* Version history */}
        <button onClick={() => setShowVersions(v => !v)} style={{ position: 'relative', background: showVersions ? `${world.accentColor}18` : 'rgba(255,255,255,0.07)', border: `1px solid ${showVersions ? world.accentColor + '55' : 'rgba(255,255,255,0.12)'}`, borderRadius: '7px', color: showVersions ? world.accentColor : 'rgba(255,255,255,0.55)', fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', padding: '7px 12px', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}>
          🕐 VERSIONS
          {versions.length > 0 && <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: world.accentColor, color: '#000', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 900, fontFamily: "'Rajdhani', sans-serif" }}>{versions.length}</span>}
        </button>
        <button onClick={onPreview} disabled={fieldCount === 0} className="tr-btn" style={{ background: fieldCount > 0 ? world.buttonGradient : 'rgba(255,255,255,0.05)', color: fieldCount > 0 ? world.buttonText : 'rgba(255,255,255,0.2)', fontSize: '12px', padding: '9px 16px', border: 'none', letterSpacing: '0.1em', cursor: fieldCount > 0 ? 'pointer' : 'not-allowed', boxShadow: fieldCount > 0 ? `0 0 14px ${world.glowColor}44` : 'none', flexShrink: 0 }}>👁 PREVIEW</button>
        <button onClick={onLogout} title="Logout" style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,80,80,0.25)', borderRadius: '7px', color: 'rgba(255,120,120,0.7)', fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', padding: '7px 11px', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,60,60,0.18)'; (e.currentTarget as HTMLButtonElement).style.color = '#ff8888'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,60,60,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,120,120,0.7)'; }}>
          🚪 LOGOUT
        </button>
      </div>

      <div style={{ position: 'relative', zIndex: 5, flex: 1, display: 'flex', overflow: 'hidden' }}>
        <PaletteSidebar world={world} purposeId={purposeId} onAddField={addField} onAddCollection={addCollection} />
        <div className="tr-scroll" style={{ flex: 1, padding: '14px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
          {fields.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', opacity: 0.55 }}>
              <span style={{ fontSize: '54px', animation: 'float 3.5s ease-in-out infinite' }}>{world.emoji}</span>
              <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '16px', color: world.accentColor, textAlign: 'center' }}>Your Canvas Awaits</div>
              <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', color: world.mutedColor, textAlign: 'center', maxWidth: '300px', letterSpacing: '0.04em', lineHeight: 1.5 }}>
                Add individual fields from the left palette, or drop in a ready-made collection from the Collections section below the fields.
              </p>
            </div>
          ) : (
            <>
              {fields.map((field, i) =>
                field.type === 'section'
                  ? <SectionCard key={field.id} field={field} index={i} total={fields.length} world={world} isEditing={editingId === field.id} onEdit={() => setEditingId(editingId === field.id ? null : field.id)} onDelete={() => deleteField(field.id)} onMoveUp={() => moveField(i, 'up')} onMoveDown={() => moveField(i, 'down')} onChange={updateField} />
                  : <FieldCard key={field.id} field={field} index={i} total={fields.length} world={world} isEditing={editingId === field.id} onEdit={() => setEditingId(editingId === field.id ? null : field.id)} onDelete={() => deleteField(field.id)} onMoveUp={() => moveField(i, 'up')} onMoveDown={() => moveField(i, 'down')} onChange={updateField} />
              )}
              <div style={{ textAlign: 'center', padding: '16px', fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', color: world.mutedColor, letterSpacing: '0.1em', opacity: 0.45 }}>← Add more from the palette</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
