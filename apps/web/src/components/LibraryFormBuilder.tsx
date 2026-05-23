import { useState, useRef, useEffect, useCallback } from 'react';
import { trpc } from '../trpc';
import { TemplatePickerModal } from './TemplatePickerModal';
import { ALL_TEMPLATES, type FormTemplate } from '../formTemplates';
import type { LibraryWorld, LibraryPresetGroup } from '../libraryData';
import { LIBRARY_PRESETS } from '../libraryData';
import type { FormField, FieldType, FormVersion, ValidationPreset, WorldTheme } from '../types';
import { PALETTE_CATEGORIES, VALIDATION_PRESETS, COLLECTIONS, FIELD_TYPES } from '../themes';
import { ParticleBackground } from './ParticleBackground';
import { PremiumIcon } from './PremiumIcon';
import { VersionPanel } from './VersionPanel';
import { copyText } from '../utils/clipboard';

type Props = {
  world: LibraryWorld;
  onBack: () => void;
  onLogout: () => void;
  onPreview: (fields: FormField[], title: string) => void;
  initialFields?: FormField[];
  initialTitle?: string;
};

// ── LibraryWorld → WorldTheme adapter ─────────────────────────────────────
function libraryToWorld(w: LibraryWorld): WorldTheme {
  return {
    id: w.id,
    name: w.name,
    emoji: w.emoji,
    description: w.lore,
    tagline: w.tagline,
    primaryColor: w.color,
    secondaryColor: w.accentColor,
    accentColor: w.accentColor,
    textColor: '#f0f0f0',
    mutedColor: `${w.color}aa`,
    bg: w.bgGradient,
    cardBg: 'rgba(0,0,0,0.88)',
    borderColor: w.color,
    buttonGradient: `linear-gradient(135deg, ${w.color}, ${w.accentColor})`,
    buttonText: '#fff',
    inputBg: 'rgba(255,255,255,0.06)',
    particles: w.particles,
    glowColor: w.glowColor,
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────
function makeId() { return Math.random().toString(36).slice(2, 9); }

function emptyField(type: FieldType, world: LibraryWorld): FormField {
  const def = FIELD_TYPES.find(f => f.type === type);
  return {
    id: makeId(),
    type,
    label: type === 'page_break' ? 'New Page' : def?.label ?? type,
    placeholder: `Enter ${(def?.label ?? type).toLowerCase()}...`,
    required: false,
    options: ['radio', 'select', 'checkbox', 'multi_select'].includes(type) ? ['Option 1', 'Option 2', 'Option 3'] : [],
    min: type === 'rating' ? 1 : 0,
    max: type === 'rating' ? 5 : 100,
    helperText: '',
    minLength: 0,
    maxLength: 0,
    validationPreset: 'none',
    customPattern: '',
    errorMessage: '',
    fieldWidth: 'full',
    hidden: false,
    conditionalParentId: '',
    conditionalOperator: 'equals',
    conditionalValue: '',
    prefix: '',
    suffix: '',
    sectionColor: world.color,
    sectionDescription: '',
  };
}

export function buildLibraryPresetFields(world: LibraryWorld, groupFields: LibraryPresetGroup['fields']): FormField[] {
  return groupFields.map((presetField) => ({
    ...emptyField(presetField.type as FieldType, world),
    ...presetField,
    id: makeId(),
  })) as FormField[];
}

function getFieldIcon(type: FieldType) {
  return FIELD_TYPES.find(f => f.type === type)?.icon ?? '📝';
}

// ── Shared editor helpers ──────────────────────────────────────────────────
function EditorInput({ value, onChange, placeholder, wt, type = 'text', maxLength }: {
  value: string | number; onChange: (v: string) => void; placeholder?: string;
  wt: WorldTheme; type?: string; maxLength?: number;
}) {
  return (
    <input type={type} value={value} placeholder={placeholder} maxLength={maxLength}
      onChange={e => onChange(e.target.value)}
      style={{ width: '100%', background: wt.inputBg, border: `1px solid ${wt.borderColor}55`,
        borderRadius: 6, color: wt.textColor, fontFamily: 'system-ui, sans-serif',
        fontSize: 13, padding: '8px 10px', outline: 'none', fontWeight: 500, boxSizing: 'border-box' }} />
  );
}

function EditorTextarea({ value, onChange, placeholder, wt, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; wt: WorldTheme; rows?: number;
}) {
  return (
    <textarea value={value} placeholder={placeholder} rows={rows} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', background: wt.inputBg, border: `1px solid ${wt.borderColor}55`,
        borderRadius: 6, color: wt.textColor, fontFamily: 'system-ui, sans-serif',
        fontSize: 13, padding: '8px 10px', outline: 'none', fontWeight: 500, resize: 'vertical',
        boxSizing: 'border-box' }} />
  );
}

function EditorLabel({ children, wt }: { children: React.ReactNode; wt: WorldTheme }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: `${wt.accentColor}bb`,
      letterSpacing: '0.12em', textTransform: 'uppercase' as const, display: 'block', marginBottom: 5 }}>
      {children}
    </span>
  );
}

function OptionsEditor({ options, wt, onChange }: { options: string[]; wt: WorldTheme; onChange: (opts: string[]) => void }) {
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
            <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${wt.borderColor}55`, flexShrink: 0 }} />
            {editingIdx === idx ? (
              <input
                ref={inputRef}
                autoFocus
                value={opt}
                onChange={e => updateOption(idx, e.target.value)}
                onBlur={() => { if (!opt.trim()) updateOption(idx, `Option ${idx + 1}`); setEditingIdx(null); }}
                onKeyDown={e => handleKeyDown(e, idx)}
                style={{ flex: 1, background: `${wt.accentColor}10`, border: `1px solid ${wt.accentColor}55`,
                  borderRadius: 6, color: wt.textColor, fontFamily: 'system-ui, sans-serif',
                  fontSize: 13, padding: '5px 8px', outline: 'none' }}
              />
            ) : (
              <div
                onClick={() => setEditingIdx(idx)}
                style={{ flex: 1, padding: '5px 8px', borderRadius: 6, cursor: 'text',
                  color: wt.textColor, fontFamily: 'system-ui, sans-serif', fontSize: 13,
                  borderBottom: `1px dashed ${wt.borderColor}44`, transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderBottomColor = `${wt.accentColor}66`)}
                onMouseLeave={e => (e.currentTarget.style.borderBottomColor = `${wt.borderColor}44`)}>
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
          border: 'none', color: wt.accentColor, fontFamily: 'system-ui, sans-serif',
          fontSize: 12, fontWeight: 700, padding: '4px 0', cursor: 'pointer', opacity: 0.7,
          transition: 'opacity 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}>
        + Add option
      </button>
    </div>
  );
}

// ── Section editor ─────────────────────────────────────────────────────────
function SectionEditor({ field, wt, onChange }: { field: FormField; wt: WorldTheme; onChange: (f: FormField) => void }) {
  const COLORS = ['#ffd700', '#00e5ff', '#ff8c00', '#ff4757', '#00b894', '#a29bfe', '#74b9ff', '#fd79a8'];
  const titleLabel = field.type === 'page_break' ? 'Page Title' : 'Section Title';
  const descriptionLabel = field.type === 'page_break' ? 'Page Description' : 'Description';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      <div><EditorLabel wt={wt}>{titleLabel}</EditorLabel>
        <EditorInput wt={wt} value={field.label} onChange={v => onChange({ ...field, label: v })} /></div>
      <div><EditorLabel wt={wt}>{descriptionLabel}</EditorLabel>
        <EditorInput wt={wt} value={field.sectionDescription} placeholder="Brief description..."
          onChange={v => onChange({ ...field, sectionDescription: v })} /></div>
      <div><EditorLabel wt={wt}>Accent Colour</EditorLabel>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 3 }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => onChange({ ...field, sectionColor: c })}
              style={{ width: 26, height: 26, borderRadius: '50%', background: c,
                border: `3px solid ${field.sectionColor === c ? '#fff' : 'transparent'}`,
                cursor: 'pointer', boxShadow: field.sectionColor === c ? `0 0 10px ${c}` : 'none',
                transition: 'all 0.15s', flexShrink: 0 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Field editor panel (3-tab) ─────────────────────────────────────────────
type EditorTab = 'basic' | 'rules' | 'display';

function FieldEditorPanel({ field, wt, allFields, onChange }: {
  field: FormField; wt: WorldTheme; allFields: FormField[]; onChange: (f: FormField) => void;
}) {
  const [tab, setTab] = useState<EditorTab>('basic');
  const [optionsRaw, setOptionsRaw] = useState(field.options.join('\n'));

  if (field.type === 'section' || field.type === 'page_break') return <SectionEditor field={field} wt={wt} onChange={onChange} />;

  const isText   = ['text', 'textarea', 'email', 'password', 'url', 'phone'].includes(field.type);
  const hasOptions = ['radio', 'select', 'checkbox', 'multi_select'].includes(field.type);
  const hasMinMax  = ['range', 'rating', 'number'].includes(field.type);
  const eligibleConditionFields = allFields.filter(candidate => candidate.id !== field.id && candidate.type !== 'section' && candidate.type !== 'page_break');
  const TABS = [
    { id: 'basic' as EditorTab, icon: '📝', label: 'Basic' },
    { id: 'rules' as EditorTab, icon: '🛡', label: 'Rules' },
    { id: 'display' as EditorTab, icon: '🎨', label: 'Display' },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, background: tab === t.id ? `${wt.accentColor}20` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${tab === t.id ? wt.accentColor + '66' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 6, color: tab === t.id ? wt.accentColor : 'rgba(255,255,255,0.4)',
              fontFamily: 'system-ui, sans-serif', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.08em', padding: '6px 4px', cursor: 'pointer',
              textTransform: 'uppercase', transition: 'all 0.15s' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Basic tab */}
      {tab === 'basic' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <div><EditorLabel wt={wt}>Field Label</EditorLabel>
            <EditorInput wt={wt} value={field.label} onChange={v => onChange({ ...field, label: v })} /></div>
          {!['checkbox', 'radio', 'select', 'multi_select', 'rating', 'file'].includes(field.type) && (
            <div><EditorLabel wt={wt}>Placeholder</EditorLabel>
              <EditorInput wt={wt} value={field.placeholder} onChange={v => onChange({ ...field, placeholder: v })} /></div>
          )}
          {['currency', 'number'].includes(field.type) && (
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}><EditorLabel wt={wt}>Prefix</EditorLabel>
                <EditorInput wt={wt} value={field.prefix} maxLength={6}
                  onChange={v => onChange({ ...field, prefix: v })} placeholder="#" /></div>
              <div style={{ flex: 1 }}><EditorLabel wt={wt}>Suffix</EditorLabel>
                <EditorInput wt={wt} value={field.suffix} maxLength={8}
                  onChange={v => onChange({ ...field, suffix: v })} placeholder="e.g. /yr" /></div>
            </div>
          )}
          <div><EditorLabel wt={wt}>Helper Text</EditorLabel>
            <EditorInput wt={wt} value={field.helperText} placeholder="Tip shown below field..."
              onChange={v => onChange({ ...field, helperText: v })} /></div>
          {hasOptions && (
            <div><EditorLabel wt={wt}>Options</EditorLabel>
              <OptionsEditor wt={wt} options={field.options.length ? field.options : ['Option 1', 'Option 2', 'Option 3']}
                onChange={opts => { setOptionsRaw(opts.join('\n')); onChange({ ...field, options: opts }); }} /></div>
          )}
          {hasMinMax && (
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}><EditorLabel wt={wt}>Min</EditorLabel>
                <EditorInput wt={wt} value={field.min} type="number"
                  onChange={v => onChange({ ...field, min: Math.min(Number(v), field.max - 1) })} /></div>
              <div style={{ flex: 1 }}><EditorLabel wt={wt}>Max</EditorLabel>
                <EditorInput wt={wt} value={field.max} type="number"
                  onChange={v => onChange({ ...field, max: Math.max(Number(v), field.min + 1) })} /></div>
            </div>
          )}
        </div>
      )}

      {/* Rules tab */}
      {tab === 'rules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><EditorLabel wt={wt}>Field Requirement</EditorLabel>
            <div style={{ display: 'flex', gap: 8 }}>
              {([true, false] as const).map(isReq => (
                <button key={String(isReq)} onClick={() => onChange({ ...field, required: isReq })}
                  style={{ flex: 1,
                    background: field.required === isReq ? (isReq ? 'rgba(255,68,68,0.2)' : 'rgba(68,255,136,0.15)') : 'rgba(0,0,0,0.25)',
                    border: `2px solid ${field.required === isReq ? (isReq ? '#ff5555' : '#44ff88') : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 8,
                    color: field.required === isReq ? (isReq ? '#ff8888' : '#77ffaa') : 'rgba(255,255,255,0.25)',
                    fontFamily: 'system-ui, sans-serif', fontSize: 11, fontWeight: 700,
                    letterSpacing: '0.08em', padding: '10px 6px', cursor: 'pointer',
                    textAlign: 'center', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 20, marginBottom: 3 }}>{isReq ? '🔴' : '🟢'}</div>
                  {isReq ? 'MANDATORY' : 'OPTIONAL'}
                </button>
              ))}
            </div>
          </div>
          {isText && (
            <div><EditorLabel wt={wt}>Character Length Limits</EditorLabel>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 4 }}>MIN (0 = none)</span>
                  <EditorInput wt={wt} value={field.minLength} type="number"
                    onChange={v => {
                      const val = Math.max(0, Number(v));
                      onChange({ ...field, minLength: field.maxLength > 0 && val > field.maxLength ? field.maxLength : val });
                    }} />
                </div>
                <div style={{ color: 'rgba(255,255,255,0.2)', paddingBottom: 9 }}>→</div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 4 }}>MAX (0 = none)</span>
                  <EditorInput wt={wt} value={field.maxLength} type="number"
                    onChange={v => {
                      const val = Math.max(0, Number(v));
                      onChange({ ...field, maxLength: field.minLength > 0 && val > 0 && val < field.minLength ? field.minLength : val });
                    }} />
                </div>
              </div>
              {(field.minLength > 0 || field.maxLength > 0) && (
                <div style={{ fontSize: 11, color: wt.accentColor, marginTop: 4, opacity: 0.7 }}>
                  {field.minLength > 0 && field.maxLength > 0 ? `${field.minLength}–${field.maxLength} chars`
                    : field.minLength > 0 ? `Min ${field.minLength} chars` : `Max ${field.maxLength} chars`}
                </div>
              )}
            </div>
          )}

          <div>
            <EditorLabel wt={wt}>Conditional Visibility</EditorLabel>
            <select value={field.conditionalParentId} onChange={(e) => onChange({ ...field, conditionalParentId: e.target.value, conditionalValue: e.target.value ? field.conditionalValue : '' })}
              style={{ width: '100%', background: wt.inputBg, border: `1px solid ${wt.borderColor}55`, borderRadius: 6, color: wt.textColor, fontFamily: 'system-ui, sans-serif', fontSize: 12, padding: '8px 10px', outline: 'none', cursor: 'pointer' }}>
              <option value="" style={{ background: '#111' }}>Always show this field</option>
              {eligibleConditionFields.map(candidate => <option key={candidate.id} value={candidate.id} style={{ background: '#111' }}>{candidate.label || candidate.type}</option>)}
            </select>
            {field.conditionalParentId && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <EditorLabel wt={wt}>Rule</EditorLabel>
                  <select value={field.conditionalOperator} onChange={(e) => onChange({ ...field, conditionalOperator: e.target.value as FormField['conditionalOperator'] })}
                    style={{ width: '100%', background: wt.inputBg, border: `1px solid ${wt.borderColor}55`, borderRadius: 6, color: wt.textColor, fontFamily: 'system-ui, sans-serif', fontSize: 12, padding: '8px 10px', outline: 'none', cursor: 'pointer' }}>
                    <option value="equals" style={{ background: '#111' }}>Equals</option>
                    <option value="not_equals" style={{ background: '#111' }}>Does not equal</option>
                    <option value="contains" style={{ background: '#111' }}>Contains</option>
                    <option value="greater_than" style={{ background: '#111' }}>Greater than</option>
                    <option value="less_than" style={{ background: '#111' }}>Less than</option>
                    <option value="is_empty" style={{ background: '#111' }}>Is empty</option>
                    <option value="is_not_empty" style={{ background: '#111' }}>Is not empty</option>
                  </select>
                </div>
                {!['is_empty', 'is_not_empty'].includes(field.conditionalOperator) && (
                  <div style={{ flex: 1 }}><EditorLabel wt={wt}>Expected Value</EditorLabel><EditorInput wt={wt} value={field.conditionalValue} placeholder="Value that reveals this field" onChange={v => onChange({ ...field, conditionalValue: v })} /></div>
                )}
              </div>
            )}
          </div>
          {(isText || field.type === 'number' || field.type === 'phone') && (
            <div><EditorLabel wt={wt}>Validation Rule</EditorLabel>
              <select value={field.validationPreset}
                onChange={e => onChange({ ...field, validationPreset: e.target.value as ValidationPreset, customPattern: '' })}
                style={{ width: '100%', background: wt.inputBg, border: `1px solid ${wt.borderColor}55`,
                  borderRadius: 6, color: wt.textColor, fontFamily: 'system-ui, sans-serif',
                  fontSize: 12, padding: '8px 10px', outline: 'none', cursor: 'pointer' }}>
                {VALIDATION_PRESETS.map(p => (
                  <option key={p.value} value={p.value} style={{ background: '#111' }}>
                    {p.label} — {p.hint}
                  </option>
                ))}
              </select>
              {field.validationPreset === 'custom' && (
                <div style={{ marginTop: 7 }}>
                  <EditorLabel wt={wt}>Custom Regex Pattern</EditorLabel>
                  <EditorInput wt={wt} value={field.customPattern}
                    placeholder="^[A-Z]{5}[0-9]{4}[A-Z]$"
                    onChange={v => onChange({ ...field, customPattern: v })} />
                </div>
              )}
              {field.validationPreset !== 'none' && field.validationPreset !== 'custom' && (
                <div style={{ fontSize: 10, color: `${wt.accentColor}99`, marginTop: 4 }}>
                  Pattern: <code style={{ color: wt.accentColor }}>{VALIDATION_PRESETS.find(p => p.value === field.validationPreset)?.pattern}</code>
                </div>
              )}
            </div>
          )}
          <div><EditorLabel wt={wt}>Custom Error Message</EditorLabel>
            <EditorInput wt={wt} value={field.errorMessage}
              placeholder="e.g. Please enter a valid value"
              onChange={v => onChange({ ...field, errorMessage: v })} /></div>
        </div>
      )}

      {/* Display tab */}
      {tab === 'display' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><EditorLabel wt={wt}>Field Width</EditorLabel>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['full', 'half'] as const).map(w => (
                <button key={w} onClick={() => onChange({ ...field, fieldWidth: w })}
                  style={{ flex: 1,
                    background: field.fieldWidth === w ? `${wt.accentColor}20` : 'rgba(0,0,0,0.25)',
                    border: `2px solid ${field.fieldWidth === w ? wt.accentColor + '77' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 8,
                    color: field.fieldWidth === w ? wt.accentColor : 'rgba(255,255,255,0.3)',
                    fontFamily: 'system-ui, sans-serif', fontSize: 11, fontWeight: 700,
                    padding: '10px 6px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 20, marginBottom: 3 }}>{w === 'full' ? '▬' : '▪'}</div>
                  {w === 'full' ? 'Full Width' : 'Half Width'}
                  <div style={{ fontSize: 10, opacity: 0.45, marginTop: 2 }}>{w === 'full' ? '100%' : '50%'}</div>
                </button>
              ))}
            </div>
          </div>
          <div><EditorLabel wt={wt}>Visibility</EditorLabel>
            <div style={{ display: 'flex', gap: 8 }}>
              {([false, true] as const).map(hide => (
                <button key={String(hide)} onClick={() => onChange({ ...field, hidden: hide })}
                  style={{ flex: 1,
                    background: field.hidden === hide ? (hide ? 'rgba(255,140,0,0.18)' : `${wt.accentColor}14`) : 'rgba(0,0,0,0.25)',
                    border: `2px solid ${field.hidden === hide ? (hide ? '#ff8c00' : wt.accentColor) : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 8,
                    color: field.hidden === hide ? (hide ? '#ff8c00' : wt.accentColor) : 'rgba(255,255,255,0.28)',
                    fontFamily: 'system-ui, sans-serif', fontSize: 11, fontWeight: 700,
                    padding: '10px 6px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 20, marginBottom: 3 }}>{hide ? '🙈' : '👁'}</div>
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

// ── Section card ───────────────────────────────────────────────────────────
function SectionCard({ field, index, total, wt, isEditing, onEdit, onDelete, onMoveUp, onMoveDown, onChange }: {
  field: FormField; index: number; total: number; wt: WorldTheme;
  isEditing: boolean; onEdit: () => void; onDelete: () => void;
  onMoveUp: () => void; onMoveDown: () => void; onChange: (f: FormField) => void;
}) {
  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${field.sectionColor}44`,
      boxShadow: isEditing ? `0 0 16px ${field.sectionColor}33` : '0 2px 8px rgba(0,0,0,0.3)' }}>
      <div style={{ background: `linear-gradient(90deg, ${field.sectionColor}20, ${field.sectionColor}08)`,
        borderBottom: isEditing ? `1px solid ${field.sectionColor}33` : 'none',
        padding: '10px 13px', display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}
        onClick={onEdit}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: field.sectionColor,
          flexShrink: 0, boxShadow: `0 0 8px ${field.sectionColor}` }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: field.sectionColor }}>{field.label || 'Untitled Section'}</div>
          {field.sectionDescription && (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>{field.sectionDescription}</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 5 }} onClick={e => e.stopPropagation()}>
          {[{ fn: onMoveUp, icon: '↑', dis: index === 0 }, { fn: onMoveDown, icon: '↓', dis: index === total - 1 }].map(({ fn, icon, dis }, i) => (
            <button key={i} onClick={fn} disabled={dis}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
                color: dis ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.45)',
                cursor: dis ? 'not-allowed' : 'pointer', width: 26, height: 26,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{icon}</button>
          ))}
          <button onClick={onEdit}
            style={{ background: isEditing ? `${field.sectionColor}22` : 'rgba(255,255,255,0.06)',
              border: `1px solid ${isEditing ? field.sectionColor + '55' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 4, color: isEditing ? field.sectionColor : 'rgba(255,255,255,0.45)',
              cursor: 'pointer', width: 26, height: 26,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✏️</button>
          <button onClick={onDelete}
            style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)',
              borderRadius: 4, color: '#ff6b6b', cursor: 'pointer', width: 26, height: 26,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🗑️</button>
        </div>
      </div>
      {isEditing && (
        <div style={{ padding: '12px 13px 13px', background: 'rgba(0,0,0,0.4)' }}>
          <SectionEditor field={field} wt={wt} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

// ── Field card ─────────────────────────────────────────────────────────────
// ── WYSIWYG field preview (mirrors FormBuilder) ────────────────────────────
function FieldPreview({ field, wt }: { field: FormField; wt: WorldTheme }) {
  const inp: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.05)',
    border: `1.5px solid ${wt.borderColor}44`, borderRadius: 8,
    color: `${wt.textColor}66`, fontFamily: 'system-ui, sans-serif',
    fontSize: 14, padding: '10px 14px', outline: 'none',
    boxSizing: 'border-box' as const,
  };
  switch (field.type) {
    case 'textarea':
      return <textarea rows={3} placeholder={field.placeholder || 'Your answer'} readOnly style={{ ...inp, resize: 'none', display: 'block' }} />;
    case 'select':
      return (
        <div style={{ ...inp, display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' }}>
          <span style={{ opacity: 0.5 }}>{field.options[0] || 'Select an option'}</span>
          <span style={{ opacity: 0.4, fontSize: 10 }}>▼</span>
        </div>
      );
    case 'radio':
    case 'checkbox':
    case 'multi_select':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(field.options.length ? field.options : ['Option 1', 'Option 2']).slice(0, 3).map((o, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 18, height: 18, borderRadius: field.type === 'radio' ? '50%' : 4,
                border: `2px solid ${i === 0 ? wt.accentColor : wt.borderColor + '55'}`,
                background: i === 0 ? `${wt.accentColor}18` : 'transparent', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: i === 0 ? wt.textColor : `${wt.textColor}77` }}>{o}</span>
            </div>
          ))}
        </div>
      );
    case 'rating': {
      const max = field.max || 5;
      return (
        <div style={{ display: 'flex', gap: 5 }}>
          {Array.from({ length: max }, (_, i) => (
            <span key={i} style={{ fontSize: 24, color: i < Math.ceil(max / 2) ? wt.accentColor : `${wt.borderColor}55` }}>★</span>
          ))}
        </div>
      );
    }
    case 'range': {
      const min = field.min ?? 0; const max = field.max ?? 100; const mid = (min + max) / 2;
      const pct = max > min ? ((mid - min) / (max - min)) * 100 : 50;
      return (
        <div>
          <div style={{ height: 4, background: `${wt.borderColor}33`, borderRadius: 2, position: 'relative', margin: '10px 0 4px' }}>
            <div style={{ position: 'absolute', left: 0, width: `${pct}%`, height: '100%', background: wt.accentColor, borderRadius: 2 }} />
            <div style={{ position: 'absolute', top: '50%', left: `${pct}%`, transform: 'translate(-50%, -50%)', width: 14, height: 14, borderRadius: '50%', background: wt.accentColor }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: wt.mutedColor }}>
            <span>{min}</span><span>{max}</span>
          </div>
        </div>
      );
    }
    case 'file':
      return (
        <div style={{ border: `2px dashed ${wt.borderColor}44`, borderRadius: 8, padding: '18px', textAlign: 'center', background: `${wt.accentColor}05` }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>📎</div>
          <div style={{ fontSize: 12, color: `${wt.textColor}55` }}>Click to upload or drag & drop</div>
        </div>
      );
    case 'date':
      return <div style={{ ...inp, display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' }}><span style={{ opacity: 0.4 }}>DD / MM / YYYY</span><span style={{ opacity: 0.4 }}>📅</span></div>;
    default:
      return <input type="text" placeholder={field.placeholder || 'Your answer'} readOnly style={{ ...inp, display: 'block' }} />;
  }
}

function FieldCard({ field, index, total, wt, allFields, isEditing, onEdit, onDelete, onMoveUp, onMoveDown, onChange, onDuplicate, onInsertBelow }: {
  field: FormField; index: number; total: number; wt: WorldTheme;
  allFields: FormField[];
  isEditing: boolean; onEdit: () => void; onDelete: () => void;
  onMoveUp: () => void; onMoveDown: () => void; onChange: (f: FormField) => void;
  onDuplicate: () => void; onInsertBelow: (type: FieldType) => void;
}) {
  const [hov, setHov] = useState(false);
  const icon = getFieldIcon(field.type);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ background: isEditing ? wt.cardBg : 'rgba(255,255,255,0.03)',
        border: `1.5px solid ${isEditing ? wt.accentColor + '66' : hov ? wt.borderColor + '55' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.18s, box-shadow 0.18s, transform 0.18s',
        boxShadow: isEditing ? `0 0 28px ${wt.glowColor}33, 0 4px 24px rgba(0,0,0,0.4)` : hov ? '0 4px 20px rgba(0,0,0,0.35)' : '0 2px 8px rgba(0,0,0,0.2)',
        opacity: field.hidden ? 0.65 : 1,
        transform: hov && !isEditing ? 'translateY(-2px)' : 'none' }}>
      {isEditing && <div style={{ height: 3, background: `linear-gradient(90deg, ${wt.accentColor}, ${wt.glowColor || wt.accentColor}55)` }} />}
      <div style={{ padding: '16px 18px 14px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, cursor: 'pointer' }} onClick={onEdit}>
          <div title="Drag to reorder" onClick={e => e.stopPropagation()} style={{ fontSize: 16, color: 'rgba(255,255,255,0.22)', cursor: 'grab', userSelect: 'none', flexShrink: 0, paddingTop: 2, letterSpacing: '-0.08em', opacity: hov ? 0.8 : 0.18, transition: 'opacity 0.18s' }}>⠿</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, flexWrap: 'wrap' }}>
              <PremiumIcon token={icon} size={17} />
              <span style={{ fontSize: 15, fontWeight: 700, color: field.label ? wt.textColor : `${wt.textColor}44`, wordBreak: 'break-word' as const }}>
                {field.label || 'Untitled field'}
              </span>
              {field.required && <span style={{ color: '#f87171', fontSize: 16, lineHeight: 1, flexShrink: 0 }}>*</span>}
            </div>
            {field.helperText && <div style={{ fontSize: 11, color: wt.mutedColor, marginTop: 3, marginLeft: 24 }}>{field.helperText}</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            {field.hidden && <span style={{ fontSize: 8, background: 'rgba(255,140,0,0.12)', border: '1px solid rgba(255,140,0,0.25)', borderRadius: 4, color: '#fb923c', padding: '2px 5px', fontWeight: 700, letterSpacing: '0.1em' }}>HIDDEN</span>}
            <span style={{ fontSize: 8, color: wt.mutedColor, background: `${wt.accentColor}0c`, border: `1px solid ${wt.borderColor}22`, borderRadius: 4, padding: '2px 6px', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>{field.type}</span>
            <div style={{ display: 'flex', gap: 3, opacity: hov || isEditing ? 1 : 0, transition: 'opacity 0.16s', pointerEvents: (hov || isEditing) ? 'auto' : 'none' }} onClick={e => e.stopPropagation()}>
              <button onClick={onMoveUp} disabled={index === 0} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, color: index === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.5)', cursor: index === 0 ? 'not-allowed' : 'pointer', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>↑</button>
              <button onClick={onMoveDown} disabled={index === total - 1} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, color: index === total - 1 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.5)', cursor: index === total - 1 ? 'not-allowed' : 'pointer', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>↓</button>
              <button onClick={onDuplicate} title="Duplicate" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>⧉</button>
              <button onClick={onDelete} style={{ background: 'rgba(255,60,60,0.08)', border: '1px solid rgba(255,60,60,0.2)', borderRadius: 5, color: '#f87171', cursor: 'pointer', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>×</button>
            </div>
          </div>
        </div>
        {/* WYSIWYG preview */}
        <div style={{ pointerEvents: 'none' }}>
          <FieldPreview field={field} wt={wt} />
        </div>
      </div>
      {isEditing && (
        <div style={{ borderTop: `1px solid ${wt.borderColor}28`, padding: '14px 18px 18px' }}>
          <FieldEditorPanel field={field} wt={wt} allFields={allFields} onChange={onChange} />
          {/* Bottom bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 16, paddingTop: 12, borderTop: `1px solid ${wt.borderColor}18` }}>
            <button onClick={() => onInsertBelow(field.type)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none',
                color: wt.accentColor, fontFamily: 'system-ui, sans-serif', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', opacity: 0.65, padding: 0, transition: 'opacity 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.65')}>
              + Add question below
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: wt.mutedColor }}>Required</span>
              <div onClick={() => onChange({ ...field, required: !field.required })}
                style={{ width: 44, height: 24, borderRadius: 12,
                  background: field.required ? wt.accentColor : 'rgba(255,255,255,0.1)',
                  border: `2px solid ${field.required ? wt.accentColor : 'rgba(255,255,255,0.15)'}`,
                  cursor: 'pointer', position: 'relative', transition: 'all 0.22s', flexShrink: 0,
                  boxShadow: field.required ? `0 0 10px ${wt.accentColor}55` : 'none' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 2, left: field.required ? 22 : 2,
                  transition: 'left 0.22s', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Palette sidebar ────────────────────────────────────────────────────────
function PaletteSidebar({ wt, world, presets, onAddField, onAddCollection, onAddPresetGroup, settingsPanel, settingsActive, onToggleSettings, filePanel, historyPanel, reviewPanel, onActiveTabChange }: {
  wt: WorldTheme; world: LibraryWorld;
  presets: LibraryPresetGroup[];
  onAddField: (t: FieldType) => void;
  onAddCollection: (id: string) => void;
  onAddPresetGroup: (fields: LibraryPresetGroup['fields']) => void;
  settingsPanel: React.ReactNode;
  settingsActive: boolean;
  onToggleSettings: () => void;
  filePanel?: React.ReactNode;
  historyPanel?: React.ReactNode;
  reviewPanel?: React.ReactNode;
  onActiveTabChange?: (tab: 'file' | 'history' | 'review' | 'design' | null) => void;
}) {
  const [activeTab, setActiveTab] = useState<'file' | 'history' | 'review' | 'design' | null>(null);
  const [activeFieldCategory, setActiveFieldCategory] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'design' && !activeFieldCategory) {
      setActiveFieldCategory(PALETTE_CATEGORIES[0]?.id ?? null);
    }

    if (activeTab !== 'design' && activeFieldCategory) {
      setActiveFieldCategory(null);
    }
  }, [activeTab, activeFieldCategory]);

  useEffect(() => {
    onActiveTabChange?.(activeTab);
  }, [activeTab, onActiveTabChange]);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 8, background: active ? `${wt.accentColor}14` : 'rgba(255,255,255,0.03)', border: `1px solid ${active ? wt.accentColor + '26' : 'rgba(255,255,255,0.05)'}`,
    color: active ? '#f5f7fb' : 'rgba(255,255,255,0.68)', borderRadius: '999px', padding: '9px 14px', cursor: 'pointer', fontFamily: 'system-ui, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', transition: 'all 0.16s', boxShadow: active ? `0 4px 12px ${wt.glowColor}12` : 'none',
  });
  const categoryTabStyle = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 9, minWidth: '142px', justifyContent: 'space-between', background: active ? `${wt.accentColor}12` : 'rgba(255,255,255,0.025)', border: `1px solid ${active ? wt.accentColor + '24' : 'rgba(255,255,255,0.05)'}`,
    color: active ? '#f5f7fb' : 'rgba(255,255,255,0.72)', borderRadius: '16px', padding: '12px 14px', cursor: 'pointer', fontFamily: 'system-ui, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', transition: 'all 0.16s',
  });
  const dropdownPanelStyle: React.CSSProperties = { position: 'relative', marginTop: '8px', width: '100%', background: 'rgba(255,255,255,0.02)', border: `1px solid ${wt.borderColor}16`, borderRadius: '16px', padding: '10px', boxShadow: 'none', backdropFilter: 'blur(12px)' };
  const sectionTitleStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: wt.accentColor, fontFamily: 'system-ui, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' };
  const tileGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 8 };
  const fieldBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 10, minHeight: '46px', background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, color: '#f5f7fb', fontFamily: 'system-ui, sans-serif', fontSize: 10, fontWeight: 700, padding: '10px 12px', cursor: 'pointer', transition: 'all 0.16s', textAlign: 'left', letterSpacing: '0.02em' };
  const utilityBtn: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: '11px 12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.16s', width: '100%' };

  return (
    <div className="tr-scroll" style={{ position: 'relative', width: '100%', flexShrink: 0, background: 'rgba(20,24,36,0.92)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${wt.borderColor}16`, padding: '12px 16px 16px 16px', overflow: 'visible', boxShadow: '0 8px 20px rgba(0,0,0,0.14)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="tr-scroll" style={{ overflowX: 'auto', overflowY: 'hidden' }}>
          <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 8, minWidth: 'max-content', width: '100%', alignItems: 'center' }}>
            <button style={tabStyle(activeTab === 'file')} onClick={() => setActiveTab((current) => current === 'file' ? null : 'file')}>
              <PremiumIcon token="📁" size={15} />
              <span>File</span>
            </button>
            <button style={tabStyle(activeTab === 'history')} onClick={() => setActiveTab((current) => current === 'history' ? null : 'history')}>
              <PremiumIcon token="🕘" size={15} />
              <span>Share & History</span>
            </button>
            <button style={tabStyle(activeTab === 'review')} onClick={() => setActiveTab((current) => current === 'review' ? null : 'review')}>
              <PremiumIcon token="✅" size={15} />
              <span>Review & Publish</span>
            </button>
            <div style={{ flex: 1, minWidth: 24 }} />
            <button style={tabStyle(settingsActive)} onClick={onToggleSettings}>
              <PremiumIcon token="⚙" size={15} />
              <span>Settings</span>
            </button>
            <button style={tabStyle(activeTab === 'design')} onClick={() => setActiveTab((current) => current === 'design' ? null : 'design')}>
              <PremiumIcon token="✦" size={15} />
              <span>Design</span>
            </button>
          </div>
        </div>

        {activeTab === 'file' ? filePanel : activeTab === 'history' ? historyPanel : activeTab === 'review' ? reviewPanel : settingsActive ? (
          <div style={{ position: 'absolute', top: 'calc(100% + 14px)', right: '16px', width: '304px', maxHeight: 'calc(100vh - 210px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', padding: '14px', background: 'rgba(18,22,34,0.9)', border: `1px solid ${wt.borderColor}14`, borderRadius: '24px', boxShadow: '0 14px 30px rgba(0,0,0,0.18)', zIndex: 30 }}>
            {settingsPanel}
          </div>
        ) : activeTab === 'design' ? (
          <div style={{ position: 'absolute', top: 'calc(100% + 14px)', right: '16px', width: '212px', maxHeight: 'calc(100vh - 210px)', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '12px', padding: '14px', background: 'rgba(18,22,34,0.9)', border: `1px solid ${wt.borderColor}14`, borderRadius: '24px', boxShadow: '0 14px 30px rgba(0,0,0,0.18)', zIndex: 30 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: wt.accentColor, letterSpacing: '0.10em' }}>Design</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.4 }}>Browse fields, presets, and collections.</span>
            </div>
            <div className="tr-scroll" style={{ position: 'relative', zIndex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'stretch', width: '100%', paddingRight: '2px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'stretch', width: '100%' }}>
              <div style={sectionTitleStyle}>
                <PremiumIcon token="🧩" size={14} />
                <span>Fields</span>
              </div>
              {PALETTE_CATEGORIES.map((cat) => (
                <div key={cat.id} style={{ position: 'relative' }}>
                  <button style={{ ...categoryTabStyle(activeFieldCategory === cat.id), width: '100%', minWidth: '100%', minHeight: '56px' }} onClick={() => setActiveFieldCategory((current) => current === cat.id ? null : cat.id)}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <PremiumIcon token={cat.icon} size={16} />
                      <span>{cat.label}</span>
                    </span>
                    <span style={{ fontSize: 10, opacity: 0.72 }}>{activeFieldCategory === cat.id ? '▴' : '▾'}</span>
                  </button>
                  {activeFieldCategory === cat.id && (
                    <div style={dropdownPanelStyle}>
                      <div style={sectionTitleStyle}>
                        <PremiumIcon token={cat.icon} size={14} />
                        <span>{cat.label}</span>
                      </div>
                      <div style={tileGridStyle}>
                        {cat.fields.map(f => (
                          <button key={f.type} style={fieldBtnStyle} onClick={() => { onAddField(f.type); setActiveFieldCategory(null); }}
                            onMouseEnter={e => {
                              const el = e.currentTarget as HTMLButtonElement;
                              el.style.background = wt.cardBg; el.style.borderColor = wt.borderColor + '40'; el.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={e => {
                              const el = e.currentTarget as HTMLButtonElement;
                              el.style.background = 'rgba(255,255,255,0.03)'; el.style.borderColor = 'rgba(255,255,255,0.06)'; el.style.transform = 'translateY(0)';
                            }}>
                            <PremiumIcon token={f.icon} size={16} />
                            <span>{f.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          <div style={{ width: '100%' }}>
            <div style={sectionTitleStyle}>
              <span>{world.emoji}</span>
              <span>Presets</span>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {presets.map((preset, i) => (
                <button key={i} onClick={() => onAddPresetGroup(preset.fields)}
                  style={{ ...utilityBtn, color: wt.accentColor, borderColor: `${wt.accentColor}22` }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = `${wt.accentColor}14`; el.style.borderColor = `${wt.accentColor}40`; el.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'rgba(255,255,255,0.025)'; el.style.borderColor = `${wt.accentColor}22`; el.style.transform = 'translateY(0)'; }}>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{preset.group}</div>
                  <div style={{ fontSize: 10, color: `${wt.accentColor}88`, marginTop: 2 }}>+{preset.fields.length} fields</div>
                </button>
              ))}
            </div>
          </div>
          <div style={{ width: '100%' }}>
            <div style={sectionTitleStyle}>
              <PremiumIcon token="📦" size={14} />
              <span>Collections</span>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {COLLECTIONS.map(col => (
                <button key={col.id} onClick={() => onAddCollection(col.id)}
                  style={{ ...utilityBtn, color: col.accentColor, borderColor: `${col.accentColor}22` }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = `${col.accentColor}14`; el.style.borderColor = `${col.accentColor}40`; el.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'rgba(255,255,255,0.025)'; el.style.borderColor = `${col.accentColor}22`; el.style.transform = 'translateY(0)'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                    <span style={{ fontSize: 14 }}>{col.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{col.label}</span>
                  </div>
                  <div style={{ fontSize: 10, color: `${col.accentColor}88`, lineHeight: 1.35 }}>{col.description}</div>
                </button>
              ))}
            </div>
          </div>
          </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export function LibraryFormBuilder({ world, onBack, onLogout, onPreview, initialFields, initialTitle }: Props) {
  const wt = libraryToWorld(world);
  const presets = LIBRARY_PRESETS[world.id];

  const [fields, setFields]     = useState<FormField[]>(() => initialFields ?? []);
  const [title, setTitle]       = useState(() => initialTitle ?? `${world.name} Form`);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [versions, setVersions] = useState<FormVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [shareMsg, setShareMsg] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const [savedFormId, setSavedFormId] = useState<string | null>(null);
  const [savedFormSlug, setSavedFormSlug] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [publishMsg, setPublishMsg]   = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [formDescription, setFormDescription] = useState('');
  const [formVisibility, setFormVisibility] = useState<'public' | 'unlisted'>('unlisted');
  const [customSlug, setCustomSlug] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [responseLimit, setResponseLimit] = useState('');
  const [accessPassword, setAccessPassword] = useState('');
  const [allowResponseEdits, setAllowResponseEdits] = useState(false);
  const [activeRibbonTab, setActiveRibbonTab] = useState<'file' | 'history' | 'review' | 'design' | null>(null);

  const handleToggleSettings = useCallback(() => {
    const next = !showSettings;
    setShowSettings(next);
    if (next) {
      setActiveRibbonTab(null);
    }
  }, [showSettings]);

  const handleActiveRibbonTabChange = useCallback((tab: 'file' | 'history' | 'review' | 'design' | null) => {
    setActiveRibbonTab(tab);
    if (tab) {
      setShowSettings(false);
    }
  }, []);

  const trpcUtils = trpc.useUtils();
  const createMut  = trpc.forms.create.useMutation();
  const updateMut  = trpc.forms.update.useMutation();
  const publishMut = trpc.forms.setPublished.useMutation();

  async function handlePublish() {
    if (fieldCount === 0) return;
    try {
      let fid = savedFormId;
      if (!fid) {
        const created = await createMut.mutateAsync({
          title: title || `${world.name} Form`,
          worldTheme: world.id,
        });
        fid = created.id;
        setSavedFormId(fid);
        setSavedFormSlug(created.slug);
      }
      await updateMut.mutateAsync({
        id: fid,
        title: title || `${world.name} Form`,
        description: formDescription || undefined,
        visibility: formVisibility,
        slug: customSlug.trim() || undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        responseLimit: responseLimit ? Number(responseLimit) : null,
        accessPassword: accessPassword.trim() || null,
        allowResponseEdits,
        worldTheme: world.id,
        schema: fields,
      });
      const next = !isPublished;
      await publishMut.mutateAsync({ id: fid, published: next });
      await trpcUtils.forms.listPublic.invalidate();
      setIsPublished(next);
      setPublishMsg(next ? '✓ Published!' : '✓ Unpublished');
      setTimeout(() => setPublishMsg(''), 3000);
    } catch {
      setPublishMsg('⚠ Error');
      setTimeout(() => setPublishMsg(''), 3000);
    }
  }

  const fieldCount = fields.filter(f => f.type !== 'section').length;
  const reqCount   = fields.filter(f => f.type !== 'section' && f.required).length;
  const secCount   = fields.filter(f => f.type === 'section').length;

  function addField(type: FieldType) {
    const f = emptyField(type, world);
    setFields(prev => [...prev, f]);
    setEditingId(f.id);
  }

  function addCollection(collectionId: string) {
    const col = COLLECTIONS.find(c => c.id === collectionId);
    if (!col) return;
    const newFields = col.fields.map(partial => ({
      ...emptyField(partial.type, world),
      ...partial,
      id: makeId(),
    })) as FormField[];
    setFields(prev => [...prev, ...newFields]);
  }

  function addPresetGroup(groupFields: LibraryPresetGroup['fields']) {
    const newFields = buildLibraryPresetFields(world, groupFields);
    setFields(prev => [...prev, ...newFields]);
  }

  function updateField(updated: FormField) {
    setFields(fs => fs.map(f => f.id === updated.id ? updated : f));
  }

  function removeField(id: string) {
    setFields(fs => fs.filter(f => f.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function moveField(index: number, direction: 'up' | 'down') {
    setFields(fs => {
      const arr = [...fs];
      const swap = direction === 'up' ? index - 1 : index + 1;
      if (swap < 0 || swap >= arr.length) return arr;
      [arr[index], arr[swap]] = [arr[swap], arr[index]];
      return arr;
    });
  }

  function duplicateField(index: number) {
    setFields(fs => {
      const dupe = { ...fs[index], id: makeId() };
      const arr = [...fs];
      arr.splice(index + 1, 0, dupe);
      setEditingId(dupe.id);
      return arr;
    });
  }

  function insertFieldBelow(index: number, type: FieldType) {
    const f = emptyField(type, world);
    setFields(fs => {
      const arr = [...fs];
      arr.splice(index + 1, 0, f);
      return arr;
    });
    setEditingId(f.id);
  }

  async function copyShareLink() {
    if (fieldCount === 0) return;
    try {
      let fid = savedFormId;
      let slug = savedFormSlug;

      if (!fid) {
        const created = await createMut.mutateAsync({
          title: title || `${world.name} Form`,
          worldTheme: world.id,
        });
        fid = created.id;
        slug = created.slug;
        setSavedFormId(fid);
        setSavedFormSlug(slug);
      }

      await updateMut.mutateAsync({
        id: fid,
        title: title || `${world.name} Form`,
        description: formDescription || undefined,
        visibility: formVisibility,
        slug: customSlug.trim() || undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        responseLimit: responseLimit ? Number(responseLimit) : null,
        accessPassword: accessPassword.trim() || null,
        allowResponseEdits,
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
    const payload = { schemaVersion: 1, exportedAt: new Date().toISOString(), formTitle: title, worldId: world.id, fields };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'library_form'}.trform.json`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  function importTemplate() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.trform.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          if (!Array.isArray(parsed.fields)) throw new Error('Invalid template');
          const imported: FormField[] = parsed.fields.map((f: Partial<FormField>) => ({
            ...emptyField((f.type ?? 'text') as FieldType, world),
            ...f,
            id: makeId(),
          }));
          setFields(imported);
          if (parsed.formTitle) setTitle(parsed.formTitle);
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

  const toolBtn = (active = false, danger = false): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 6,
    background: danger ? 'rgba(255,91,91,0.10)' : active ? `${world.accentColor}16` : 'rgba(255,255,255,0.05)',
    border: `1px solid ${danger ? 'rgba(255,91,91,0.22)' : active ? world.accentColor + '32' : 'rgba(255,255,255,0.06)'}`,
    borderRadius: 999, padding: '8px 14px',
    color: danger ? 'rgba(255,166,166,0.9)' : active ? '#f5f7fb' : 'rgba(255,255,255,0.74)',
    fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' as const,
  });
  const ribbonGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8, padding: '12px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${world.color}12`, borderRadius: 18, minHeight: 90, justifyContent: 'space-between' };
  const ribbonLabel: React.CSSProperties = { fontFamily: 'system-ui, sans-serif', fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)', textAlign: 'left' };
  const ribbonRow: React.CSSProperties = { display: 'flex', alignItems: 'stretch', gap: 8, flexWrap: 'wrap' };
  const ribbonBtn = (active = false, tone: 'default' | 'accent' | 'success' = 'default'): React.CSSProperties => ({
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, minWidth: 74, minHeight: 50, padding: '9px 10px', borderRadius: 16,
    background: tone === 'success' ? 'rgba(34,197,94,0.12)' : tone === 'accent' ? `${world.color}14` : active ? `${world.accentColor}12` : 'rgba(255,255,255,0.045)',
    border: `1px solid ${tone === 'success' ? 'rgba(34,197,94,0.22)' : tone === 'accent' ? world.color + '28' : active ? world.accentColor + '28' : 'rgba(255,255,255,0.05)'}`,
    color: tone === 'success' ? '#86efac' : tone === 'accent' ? '#f5f7fb' : active ? '#f5f7fb' : 'rgba(255,255,255,0.76)', fontSize: 10, fontWeight: 700, cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap' as const,
  });
  const primaryRibbonBtn: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, minWidth: 88, minHeight: 50, padding: '9px 12px', borderRadius: 16, background: `linear-gradient(135deg, ${world.color}, ${world.accentColor})`, border: 'none', color: '#000', fontSize: 10, fontWeight: 800, cursor: 'pointer', boxShadow: `0 10px 22px ${world.glowColor}22`, whiteSpace: 'nowrap' as const };

  return (
    <div style={{ position: 'fixed', inset: 0,
      background: world.bgGradient,
      display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      <ParticleBackground particles={world.particles} count={8} />

      {showTemplates && (
        <TemplatePickerModal
          world={wt}
          onClose={() => setShowTemplates(false)}
          onApply={(t: FormTemplate) => {
            setFields(t.fields.map(f => ({ ...defaultField(f.type), ...f, id: makeId() })));
            if (t.name) setTitle(t.name);
            setEditingId(null);
            setShowTemplates(false);
          }}
        />
      )}

      {/* Version panel */}
      {showVersions && (
        <VersionPanel
          versions={versions}
          world={wt}
          currentTitle={title}
          currentFields={fields}
          worldId={`library_${world.id}`}
          avatarId=""
          onSave={setVersions}
          onRestore={v => { setFields(v.fields); setTitle(v.formTitle); setShowVersions(false); }}
          onClose={() => setShowVersions(false)}
        />
      )}

      {/* ── Row 1: Primary toolbar ── */}
      <div style={{ position: 'relative', zIndex: 10, flexShrink: 0,
        background: 'rgba(20,24,36,0.94)', backdropFilter: 'blur(18px)',
        borderBottom: `1px solid ${world.color}16`,
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}>

        <button onClick={onBack} style={{ ...toolBtn(), padding: '6px 12px', flexShrink: 0 }}>
          ← Library
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.05)', border: `1px solid ${world.color}14`, borderRadius: 999, padding: '6px 11px 6px 8px', flexShrink: 0 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>{world.emoji}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: `${world.accentColor}dd` }}>{world.name}</span>
        </div>

        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Untitled form…"
          style={{ flex: 1, minWidth: 0, background: 'rgba(255,255,255,0.05)', border: `1px solid ${world.color}16`,
            borderRadius: 16, color: '#fff', fontSize: 14, fontWeight: 700, padding: '10px 14px', outline: 'none' }} />

        {/* Stats pills */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {[{ v: fieldCount, l: 'fields', c: fieldCount > 0 ? world.accentColor : 'rgba(255,255,255,0.22)' }, { v: reqCount, l: 'required', c: reqCount > 0 ? '#ff8888' : 'rgba(255,255,255,0.22)' }].map(({ v, l, c }) => (
            <div key={l} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${c}18`,
              borderRadius: 999, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 12, color: c }}>{v}</span>
              <span style={{ fontSize: 9, color: `${c}99` }}>{l}</span>
            </div>
          ))}
        </div>

        <button onClick={onLogout} style={{ ...toolBtn(false, true), flexShrink: 0, padding: '6px 10px' }}
          title="Sign Out"><PremiumIcon token="🚪" size={15} /></button>
      </div>

      <PaletteSidebar wt={wt} world={world} presets={presets}
        onAddField={addField} onAddCollection={addCollection} onAddPresetGroup={addPresetGroup}
        settingsActive={showSettings}
        onToggleSettings={handleToggleSettings}
        onActiveTabChange={handleActiveRibbonTabChange}
        filePanel={(
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 8, flexWrap: 'wrap' }}>

        <div style={ribbonGroup}>
          <div style={ribbonRow}>
            <button onClick={importTemplate} title="Import .trform.json"
              style={{ ...ribbonBtn(!!importMsg && !importMsg.startsWith('⚠'), 'default'),
                color: importMsg.startsWith('⚠') ? '#ffb4a0' : importMsg ? world.accentColor : 'rgba(255,255,255,0.72)',
                border: `1px solid ${importMsg.startsWith('⚠') ? '#ff663355' : importMsg ? world.accentColor + '44' : 'rgba(255,255,255,0.07)'}` }}>
              <PremiumIcon token={importMsg.startsWith('⚠') ? '⚠' : '📤'} size={16} />
              <span>{importMsg ? (importMsg.startsWith('⚠') ? 'Bad File' : 'Imported') : 'Import'}</span>
            </button>
            <button onClick={exportTemplate} disabled={fieldCount === 0} title="Download .trform.json"
              style={{ ...ribbonBtn(false, 'default'), opacity: fieldCount > 0 ? 1 : 0.35, cursor: fieldCount > 0 ? 'pointer' : 'not-allowed' }}>
              <PremiumIcon token="📥" size={16} />
              <span>Export</span>
            </button>
          </div>
          <div style={ribbonLabel}>File</div>
        </div>
          </div>
        )}
        historyPanel={(
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 8, flexWrap: 'wrap' }}>

        <div style={ribbonGroup}>
          <div style={ribbonRow}>
            <button data-testid="builder-share-button" onClick={copyShareLink} disabled={fieldCount === 0} title="Copy share link"
              style={{ ...ribbonBtn(!!shareMsg, 'default'), opacity: fieldCount > 0 ? 1 : 0.35, cursor: fieldCount > 0 ? 'pointer' : 'not-allowed' }}>
              <PremiumIcon token={shareMsg ? '✓' : '🔗'} size={16} />
              <span>{shareMsg ? 'Copied' : 'Share'}</span>
            </button>
            <button onClick={() => setShowVersions(v => !v)} style={{ ...ribbonBtn(showVersions, 'default'), position: 'relative' }}>
              <PremiumIcon token="🕐" size={16} />
              <span>Versions</span>
              {versions.length > 0 && (
                <span style={{ position: 'absolute', top: 6, right: 6, background: world.accentColor, color: '#000', borderRadius: '999px', minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, padding: '0 5px' }}>{versions.length}</span>
              )}
            </button>
          </div>
          <div style={ribbonLabel}>Share & History</div>
        </div>
          </div>
        )}
        reviewPanel={(
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 8, flexWrap: 'wrap' }}>
        <div style={ribbonGroup}>
          <div style={ribbonRow}>
            <button data-testid="builder-publish-button" onClick={handlePublish} disabled={fieldCount === 0 || createMut.isPending || publishMut.isPending}
              style={{ ...ribbonBtn(isPublished, 'success'), opacity: fieldCount === 0 ? 0.35 : 1, cursor: fieldCount === 0 ? 'not-allowed' : 'pointer', color: publishMsg.startsWith('⚠') ? '#fca5a5' : isPublished ? '#fb923c' : '#86efac', border: `1px solid ${isPublished ? 'rgba(249,115,22,0.35)' : 'rgba(34,197,94,0.28)'}`, background: isPublished ? 'rgba(249,115,22,0.12)' : 'rgba(34,197,94,0.12)' }}>
              <PremiumIcon token={createMut.isPending || publishMut.isPending ? '⏳' : isPublished ? '🔒' : '🌐'} size={16} />
              <span>{createMut.isPending || publishMut.isPending ? 'Working' : isPublished ? 'Unpublish' : 'Publish'}</span>
            </button>
            <button data-testid="builder-preview-button" onClick={() => onPreview(fields, title)} disabled={fieldCount === 0}
              style={{ ...primaryRibbonBtn, opacity: fieldCount === 0 ? 0.35 : 1, cursor: fieldCount === 0 ? 'not-allowed' : 'pointer' }}>
              <PremiumIcon token="👁" size={16} />
              <span>Preview</span>
            </button>
          </div>
          <div style={ribbonLabel}>Review & Publish</div>
        </div>

        {fields.length > 0 && (
          <div style={ribbonGroup}>
            <div style={ribbonRow}>
              <button onClick={() => { setFields([]); setEditingId(null); }}
                style={{ ...ribbonBtn(false, 'default'), minWidth: 92, color: 'rgba(255,160,160,0.82)', border: '1px solid rgba(255,120,120,0.18)', background: 'rgba(255,80,80,0.06)' }}
                title="Clear all fields">
                <PremiumIcon token="🧹" size={16} />
                <span>Clear All</span>
              </button>
            </div>
            <div style={ribbonLabel}>{secCount} Section{secCount !== 1 ? 's' : ''}</div>
          </div>
        )}
          </div>
        )} settingsPanel={(
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: wt.accentColor, letterSpacing: '0.10em' }}>Settings</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.4 }}>Manage sharing, access, and response rules.</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${wt.borderColor}24`, borderRadius: 16, padding: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: wt.accentColor, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Sharing</div>
              <div style={{ display: 'grid', gap: 10 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(255,255,255,0.02)', border: `1px solid ${world.color}1d`, borderRadius: 12, padding: 12 }}>
                  <span style={{ display: 'grid', gap: 3 }}>
                    <span style={{ fontSize: 11, color: wt.mutedColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Description</span>
                    <span style={{ fontSize: 12, color: `${wt.mutedColor}cc` }}>Shown on the public form header.</span>
                  </span>
                  <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Short summary for public viewers" rows={3}
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${world.color}33`, borderRadius: 10, color: '#fff', fontSize: 13, padding: '10px 12px', resize: 'vertical' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(255,255,255,0.02)', border: `1px solid ${world.color}1d`, borderRadius: 12, padding: 12 }}>
                  <span style={{ display: 'grid', gap: 3 }}>
                    <span style={{ fontSize: 11, color: wt.mutedColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Visibility</span>
                    <span style={{ fontSize: 12, color: `${wt.mutedColor}cc` }}>Choose whether anyone can discover it.</span>
                  </span>
                  <select value={formVisibility} onChange={(e) => setFormVisibility(e.target.value as 'public' | 'unlisted')}
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${world.color}33`, borderRadius: 10, color: '#fff', fontSize: 13, padding: '10px 12px' }}>
                    <option value="unlisted">Unlisted</option>
                    <option value="public">Public</option>
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(255,255,255,0.02)', border: `1px solid ${world.color}1d`, borderRadius: 12, padding: 12 }}>
                  <span style={{ display: 'grid', gap: 3 }}>
                    <span style={{ fontSize: 11, color: wt.mutedColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Custom Slug</span>
                    <span style={{ fontSize: 12, color: `${wt.mutedColor}cc` }}>Optional short URL for sharing.</span>
                  </span>
                  <input value={customSlug} onChange={(e) => setCustomSlug(e.target.value)} placeholder="optional-custom-slug"
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${world.color}33`, borderRadius: 10, color: '#fff', fontSize: 13, padding: '10px 12px' }} />
                </label>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${wt.borderColor}24`, borderRadius: 16, padding: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: wt.accentColor, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Access Control</div>
              <div style={{ display: 'grid', gap: 10 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(255,255,255,0.02)', border: `1px solid ${world.color}1d`, borderRadius: 12, padding: 12 }}>
                  <span style={{ display: 'grid', gap: 3 }}>
                    <span style={{ fontSize: 11, color: wt.mutedColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Expiry</span>
                    <span style={{ fontSize: 12, color: `${wt.mutedColor}cc` }}>Disable submissions after a date.</span>
                  </span>
                  <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${world.color}33`, borderRadius: 10, color: '#fff', fontSize: 13, padding: '10px 12px' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(255,255,255,0.02)', border: `1px solid ${world.color}1d`, borderRadius: 12, padding: 12 }}>
                  <span style={{ display: 'grid', gap: 3 }}>
                    <span style={{ fontSize: 11, color: wt.mutedColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Response Limit</span>
                    <span style={{ fontSize: 12, color: `${wt.mutedColor}cc` }}>Stop after a fixed number of responses.</span>
                  </span>
                  <input type="number" min="1" value={responseLimit} onChange={(e) => setResponseLimit(e.target.value)} placeholder="Unlimited"
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${world.color}33`, borderRadius: 10, color: '#fff', fontSize: 13, padding: '10px 12px' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(255,255,255,0.02)', border: `1px solid ${world.color}1d`, borderRadius: 12, padding: 12 }}>
                  <span style={{ display: 'grid', gap: 3 }}>
                    <span style={{ fontSize: 11, color: wt.mutedColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Form Password</span>
                    <span style={{ fontSize: 12, color: `${wt.mutedColor}cc` }}>Require a password before opening the form.</span>
                  </span>
                  <input type="password" value={accessPassword} onChange={(e) => setAccessPassword(e.target.value)} placeholder="Optional access password"
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${world.color}33`, borderRadius: 10, color: '#fff', fontSize: 13, padding: '10px 12px' }} />
                </label>
                <label data-testid="builder-allow-response-edits" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', border: `1px solid ${world.color}1d`, borderRadius: 12, padding: 12 }}>
                  <input type="checkbox" checked={allowResponseEdits} onChange={(e) => setAllowResponseEdits(e.target.checked)} style={{ marginTop: 2 }} />
                  <span style={{ display: 'grid', gap: 3 }}>
                    <span style={{ fontSize: 11, color: wt.mutedColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Allow Response Edits</span>
                    <span style={{ fontSize: 12, color: `${wt.mutedColor}cc` }}>Let the same browser reopen the link and update its earlier response instead of being blocked.</span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        )} />

      {/* ── Body ── */}
      <div style={{ position: 'relative', zIndex: 5, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <div className="tr-scroll" style={{ flex: 1, overflowY: 'auto', background: 'rgba(255,255,255,0.018)', padding: '20px 24px', paddingRight: showSettings ? '336px' : activeRibbonTab === 'design' ? '272px' : '24px' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* ── Collections Quick-Add Strip ── */}
            {COLLECTIONS.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: world.accentColor, display: 'inline-flex', alignItems: 'center', gap: 6 }}><PremiumIcon token="✦" size={12} />Quick Add</span>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${world.accentColor}33, transparent)` }} />
                </div>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {COLLECTIONS.map(col => (
                    <button key={col.id} onClick={() => addCollection(col.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: `${col.accentColor}0e`, border: `1px solid ${col.accentColor}35`, borderRadius: 10, color: col.accentColor, fontSize: 12, fontWeight: 700, padding: '6px 13px', cursor: 'pointer', whiteSpace: 'nowrap' as const, flexShrink: 0, transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${col.accentColor}22`; e.currentTarget.style.borderColor = `${col.accentColor}66`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = `${col.accentColor}0e`; e.currentTarget.style.borderColor = `${col.accentColor}35`; e.currentTarget.style.transform = 'none'; }}>
                      <span style={{ fontSize: 15 }}>{col.icon}</span>
                      {col.label}
                      <span style={{ opacity: 0.5, fontSize: 10 }}>+{col.fields.length}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {fields.length === 0 ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${world.accentColor}33)` }} />
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.18em', textTransform: 'uppercase' as const }}>Start from a template</span>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${world.accentColor}33, transparent)` }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 12 }}>
                  {['contact-us', 'job-application', 'customer-feedback', 'event-registration'].map(tid => {
                    const t = ALL_TEMPLATES.find(x => x.id === tid);
                    if (!t) return null;
                    return (
                      <button key={tid}
                        onClick={() => { setFields(t.fields.map(f => ({ ...emptyField(f.type, world), ...f, id: makeId() })) as FormField[]); setTitle(t.name); }}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: `${t.accentColor}0c`, border: `1.5px solid ${t.accentColor}30`, borderRadius: 14, padding: '14px 16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', width: '100%' }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${t.accentColor}1c`; e.currentTarget.style.borderColor = `${t.accentColor}66`; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 28px rgba(0,0,0,0.4), 0 0 22px ${t.accentColor}18`; }}
                        onMouseLeave={e => { e.currentTarget.style.background = `${t.accentColor}0c`; e.currentTarget.style.borderColor = `${t.accentColor}30`; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                        <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{t.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{t.name}</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', lineHeight: 1.4, marginBottom: 8 }}>{t.description}</div>
                          <span style={{ fontSize: 10, color: t.accentColor, background: `${t.accentColor}14`, border: `1px solid ${t.accentColor}30`, borderRadius: 20, padding: '2px 8px', fontWeight: 700 }}>{t.fields.filter(f => f.type !== 'section').length} fields</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <button onClick={() => setShowTemplates(true)} style={{ background: 'none', border: 'none', color: world.accentColor, fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: 0.7, letterSpacing: '0.08em' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}>
                    Browse all {ALL_TEMPLATES.length} templates →
                  </button>
                </div>
                <div style={{ border: `1.5px dashed ${world.accentColor}30`, borderRadius: 14, padding: '22px 24px', background: `${world.accentColor}03`, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.4 }}>⠿</div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', marginBottom: 14, letterSpacing: '0.05em' }}>
                    Drag fields from the left panel — or click a type:
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {(['text','email','phone','number','select','textarea','radio','rating'] as FieldType[]).map(t => {
                      const ft = FIELD_TYPES.find(f => f.type === t);
                      return (
                        <button key={t} onClick={() => addField(t)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${world.accentColor}10`, border: `1px solid ${world.accentColor}28`, borderRadius: 20, color: world.accentColor, fontSize: 12, fontWeight: 700, padding: '7px 16px', cursor: 'pointer', transition: 'all 0.18s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = `${world.accentColor}22`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = `${world.accentColor}10`; e.currentTarget.style.transform = 'none'; }}>
                          <span>{ft?.icon}</span> {ft?.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {fields.map((field, i) =>
                  field.type === 'section'
                    ? <SectionCard key={field.id} field={field} index={i} total={fields.length} wt={wt}
                        isEditing={editingId === field.id}
                        onEdit={() => setEditingId(id => id === field.id ? null : field.id)}
                        onDelete={() => removeField(field.id)}
                        onMoveUp={() => moveField(i, 'up')}
                        onMoveDown={() => moveField(i, 'down')}
                        onChange={updateField} />
                    : <FieldCard key={field.id} field={field} index={i} total={fields.length} wt={wt}
                      allFields={fields}
                        isEditing={editingId === field.id}
                        onEdit={() => setEditingId(id => id === field.id ? null : field.id)}
                        onDelete={() => removeField(field.id)}
                        onMoveUp={() => moveField(i, 'up')}
                        onMoveDown={() => moveField(i, 'down')}
                        onChange={updateField}
                        onDuplicate={() => duplicateField(i)}
                        onInsertBelow={(type) => insertFieldBelow(i, type)} />
                )}
                <div style={{ padding: '24px 0 8px', textAlign: 'center',
                  fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>
                  {fieldCount} field{fieldCount !== 1 ? 's' : ''} · click any card to edit
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
