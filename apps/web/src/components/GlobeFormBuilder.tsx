import { useState, useCallback } from 'react';
import type { Country } from '../globeData';
import type { FormField, FieldType } from '../types';

type Props = {
  country: Country;
  playerName: string;
  onBack: () => void;
  onLogout: () => void;
  onPreview: (fields: FormField[], title: string) => void;
};

// ── Locale-specific field presets ─────────────────────────────────────────
const LOCALE_PRESETS: Record<string, { group: string; fields: Partial<FormField & { label: string; type: FieldType }>[] }[]> = {
  india: [
    { group: '🇮🇳 India KYC', fields: [
      { type: 'text',  label: 'Full Name (as per Aadhaar)', required: true },
      { type: 'text',  label: 'PAN Number', validationPreset: 'pan', required: true },
      { type: 'text',  label: 'GST Number', validationPreset: 'gst' },
      { type: 'text',  label: 'IFSC Code', validationPreset: 'ifsc' },
      { type: 'text',  label: 'Pincode', validationPreset: 'pincode', required: true },
      { type: 'phone', label: 'Mobile Number (+91)', required: true },
    ]},
    { group: '🏦 Bank Details', fields: [
      { type: 'text',  label: 'Account Number', required: true },
      { type: 'text',  label: 'IFSC Code', validationPreset: 'ifsc', required: true },
      { type: 'text',  label: 'Bank Name' },
      { type: 'text',  label: 'Branch Name' },
    ]},
  ],
  usa: [
    { group: '🇺🇸 US Personal', fields: [
      { type: 'text',  label: 'Full Legal Name', required: true },
      { type: 'text',  label: 'SSN (XXX-XX-XXXX)', required: true },
      { type: 'text',  label: 'ZIP Code', required: true },
      { type: 'phone', label: 'Phone Number', required: true },
      { type: 'email', label: 'Email Address', required: true },
    ]},
    { group: '📋 Employment', fields: [
      { type: 'text',   label: 'Employer Name' },
      { type: 'text',   label: 'Job Title' },
      { type: 'number', label: 'Annual Salary (USD)' },
      { type: 'select', label: 'Employment Type', options: ['Full-time', 'Part-time', 'Contract', 'Self-employed'] },
    ]},
  ],
  uk: [
    { group: '🇬🇧 UK Personal', fields: [
      { type: 'text',  label: 'Full Name', required: true },
      { type: 'text',  label: 'National Insurance Number', required: true },
      { type: 'text',  label: 'Postcode', required: true },
      { type: 'phone', label: 'Phone Number', required: true },
      { type: 'email', label: 'Email Address', required: true },
    ]},
    { group: '🏦 UK Banking', fields: [
      { type: 'text',  label: 'Sort Code (XX-XX-XX)', required: true },
      { type: 'text',  label: 'Account Number', required: true },
      { type: 'text',  label: 'IBAN', },
    ]},
  ],
  japan: [
    { group: '🇯🇵 Japan Personal', fields: [
      { type: 'text',  label: '氏名 (Full Name)', required: true },
      { type: 'text',  label: 'マイナンバー (My Number)', required: true },
      { type: 'text',  label: '郵便番号 (Postal Code)', required: true },
      { type: 'phone', label: '電話番号 (Phone)', required: true },
    ]},
  ],
  germany: [
    { group: '🇩🇪 Germany Personal', fields: [
      { type: 'text',  label: 'Vollständiger Name', required: true },
      { type: 'text',  label: 'Steueridentifikationsnummer', required: true },
      { type: 'text',  label: 'PLZ (Postleitzahl)', required: true },
      { type: 'text',  label: 'IBAN', required: true },
      { type: 'phone', label: 'Telefonnummer', required: true },
    ]},
  ],
  brazil: [
    { group: '🇧🇷 Brasil Pessoal', fields: [
      { type: 'text',  label: 'Nome Completo', required: true },
      { type: 'text',  label: 'CPF (000.000.000-00)', required: true },
      { type: 'text',  label: 'CEP', required: true },
      { type: 'phone', label: 'Telefone', required: true },
      { type: 'email', label: 'E-mail', required: true },
    ]},
  ],
  uae: [
    { group: '🇦🇪 UAE Personal', fields: [
      { type: 'text',  label: 'Full Name', required: true },
      { type: 'text',  label: 'Emirates ID Number', required: true },
      { type: 'text',  label: 'Visa Number' },
      { type: 'text',  label: 'Trade Licence Number' },
      { type: 'phone', label: 'Mobile (+971)', required: true },
    ]},
  ],
  australia: [
    { group: '🇦🇺 Australia Personal', fields: [
      { type: 'text',  label: 'Full Name', required: true },
      { type: 'text',  label: 'Tax File Number (TFN)', required: true },
      { type: 'text',  label: 'Medicare Number' },
      { type: 'text',  label: 'Postcode', required: true },
      { type: 'phone', label: 'Phone (+61)', required: true },
    ]},
  ],
  china: [
    { group: '🇨🇳 中国个人信息', fields: [
      { type: 'text',  label: '姓名 (Full Name)', required: true },
      { type: 'text',  label: '身份证号 (ID Number)', required: true },
      { type: 'text',  label: '邮政编码 (Postal Code)', required: true },
      { type: 'phone', label: '手机号 (Mobile)', required: true },
    ]},
  ],
  france: [
    { group: '🇫🇷 France Personnel', fields: [
      { type: 'text',  label: 'Nom complet', required: true },
      { type: 'text',  label: 'Numéro INSEE', required: true },
      { type: 'text',  label: 'Code postal', required: true },
      { type: 'text',  label: 'SIRET' },
      { type: 'phone', label: 'Téléphone', required: true },
    ]},
  ],
  canada: [
    { group: '🇨🇦 Canada / Canada', fields: [
      { type: 'text',  label: 'Full Name / Nom complet', required: true },
      { type: 'text',  label: 'SIN / NAS', required: true },
      { type: 'text',  label: 'Postal Code / Code postal', required: true },
      { type: 'phone', label: 'Phone / Téléphone', required: true },
      { type: 'email', label: 'Email / Courriel', required: true },
    ]},
  ],
  'south-africa': [
    { group: '🇿🇦 South Africa', fields: [
      { type: 'text',  label: 'Full Name', required: true },
      { type: 'text',  label: 'SA ID Number (13-digit)', required: true },
      { type: 'text',  label: 'VAT Registration Number' },
      { type: 'text',  label: 'Postal Code', required: true },
      { type: 'phone', label: 'Mobile (+27)', required: true },
    ]},
  ],
};

const FIELD_TYPES: { type: FieldType; label: string; icon: string }[] = [
  { type: 'text',     label: 'Text',       icon: '📝' },
  { type: 'email',    label: 'Email',      icon: '📧' },
  { type: 'phone',    label: 'Phone',      icon: '📱' },
  { type: 'number',   label: 'Number',     icon: '🔢' },
  { type: 'textarea', label: 'Long Text',  icon: '📄' },
  { type: 'select',   label: 'Dropdown',   icon: '▾' },
  { type: 'radio',    label: 'Radio',      icon: '◉' },
  { type: 'checkbox', label: 'Checkbox',   icon: '☑️' },
  { type: 'date',     label: 'Date',       icon: '📅' },
  { type: 'rating',   label: 'Rating',     icon: '⭐' },
  { type: 'currency', label: 'Currency',   icon: '💰' },
  { type: 'section',  label: 'Divider',    icon: '─' },
];

function makeId() { return Math.random().toString(36).slice(2, 9); }

function emptyField(type: FieldType, country: Country): FormField {
  const def = FIELD_TYPES.find(f => f.type === type)!;
  return {
    id: makeId(),
    type,
    label: def.label,
    placeholder: `Enter ${def.label.toLowerCase()}...`,
    required: false,
    options: type === 'radio' || type === 'select' || type === 'checkbox'
      ? ['Option 1', 'Option 2', 'Option 3'] : [],
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
    prefix: type === 'currency' ? country.currencySymbol : '',
    suffix: '',
    sectionColor: country.color,
    sectionDescription: '',
  };
}

export function GlobeFormBuilder({ country, playerName, onBack, onLogout, onPreview }: Props) {
  const [fields, setFields]     = useState<FormField[]>([]);
  const [title, setTitle]       = useState(`${country.name} Form`);
  const [editingId, setEditingId] = useState<string | null>(null);

  const presets = LOCALE_PRESETS[country.fieldPreset] ?? LOCALE_PRESETS['usa'];

  function addField(type: FieldType) {
    setFields(f => [...f, emptyField(type, country)]);
  }

  function addPresetGroup(groupFields: typeof presets[0]['fields']) {
    const newFields = groupFields.map(pf => ({
      ...emptyField(pf.type as FieldType, country),
      ...pf,
      id: makeId(),
      options: (pf as any).options ?? [],
      min: 0, max: 100,
      helperText: '',
      minLength: 0, maxLength: 0,
      customPattern: '',
      errorMessage: '',
      fieldWidth: 'full' as const,
      hidden: false,
      prefix: pf.type === 'currency' ? country.currencySymbol : '',
      suffix: '',
      sectionColor: country.color,
      sectionDescription: '',
    }));
    setFields(f => [...f, ...newFields]);
  }

  function updateField(id: string, changes: Partial<FormField>) {
    setFields(fs => fs.map(f => f.id === id ? { ...f, ...changes } : f));
  }

  function removeField(id: string) {
    setFields(fs => fs.filter(f => f.id !== id));
  }

  function moveField(id: string, dir: -1 | 1) {
    setFields(fs => {
      const idx = fs.findIndex(f => f.id === id);
      if (idx < 0) return fs;
      const next = idx + dir;
      if (next < 0 || next >= fs.length) return fs;
      const arr = [...fs];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: `radial-gradient(ellipse at 50% 0%, ${country.color}22 0%, #03001c 55%, #000 100%)`,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: `1px solid ${country.color}33`,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', gap: 12,
        backdropFilter: 'blur(8px)',
        flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#fff', borderRadius: 8,
          padding: '6px 14px', cursor: 'pointer', fontSize: 13,
        }}>← Globe</button>

        <span style={{ fontSize: 24 }}>{country.emoji}</span>

        <div style={{ flex: 1 }}>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: 18,
              fontWeight: 800,
              outline: 'none',
              width: '100%',
            }}
          />
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>
            {country.name} · {country.tagline}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {fields.length > 0 && (
            <button
              onClick={() => onPreview(fields, title)}
              style={{
                background: `linear-gradient(135deg, ${country.color}, ${country.accentColor})`,
                border: 'none', color: '#fff',
                borderRadius: 8, padding: '8px 18px',
                cursor: 'pointer', fontSize: 13, fontWeight: 700,
              }}
            >
              Preview →
            </button>
          )}
          <button onClick={onLogout} style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)',
            borderRadius: 8, padding: '6px 12px',
            cursor: 'pointer', fontSize: 12,
          }}>Logout</button>
        </div>
      </div>

      {/* Main layout */}
      <div style={{
        flex: 1, display: 'flex', overflow: 'hidden',
      }}>
        {/* LEFT: Add fields */}
        <div style={{
          width: 240, flexShrink: 0,
          borderRight: `1px solid ${country.color}22`,
          background: 'rgba(0,0,0,0.4)',
          overflowY: 'auto',
          padding: '16px 12px',
        }}>
          {/* Locale presets */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              color: country.accentColor,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              {country.emoji} Locale Presets
            </div>
            {presets.map((preset, i) => (
              <button key={i}
                onClick={() => addPresetGroup(preset.fields)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: `linear-gradient(135deg, ${country.color}22, rgba(0,0,0,0.3))`,
                  border: `1px solid ${country.color}44`,
                  color: '#fff', borderRadius: 8,
                  padding: '8px 10px', cursor: 'pointer',
                  marginBottom: 6, fontSize: 11, fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                {preset.group}
                <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400, marginLeft: 4 }}>
                  +{preset.fields.length} fields
                </span>
              </button>
            ))}
          </div>

          {/* Field types */}
          <div>
            <div style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              Add Field
            </div>
            {FIELD_TYPES.map(ft => (
              <button
                key={ft.type}
                onClick={() => addField(ft.type)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', textAlign: 'left',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: 'rgba(255,255,255,0.8)',
                  borderRadius: 7, padding: '7px 10px',
                  cursor: 'pointer', marginBottom: 4,
                  fontSize: 12,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 14 }}>{ft.icon}</span>
                {ft.label}
              </button>
            ))}
          </div>
        </div>

        {/* CENTER: Form canvas */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '20px 24px',
        }}>
          {fields.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '100%', gap: 16,
              color: 'rgba(255,255,255,0.3)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 64, filter: `drop-shadow(0 0 20px ${country.glowColor})` }}>
                {country.emoji}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
                Start building your {country.name} form
              </div>
              <div style={{ fontSize: 14 }}>
                Add locale presets from the left panel, or add fields one by one
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 640 }}>
              {fields.map((field, idx) => (
                <FieldCard
                  key={field.id}
                  field={field}
                  idx={idx}
                  total={fields.length}
                  isEditing={editingId === field.id}
                  country={country}
                  onEdit={() => setEditingId(id => id === field.id ? null : field.id)}
                  onChange={changes => updateField(field.id, changes)}
                  onDelete={() => removeField(field.id)}
                  onMove={dir => moveField(field.id, dir)}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Stats panel */}
        <div style={{
          width: 200, flexShrink: 0,
          borderLeft: `1px solid ${country.color}22`,
          background: 'rgba(0,0,0,0.3)',
          padding: '16px 14px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <StatBlock country={country} fields={fields} />
        </div>
      </div>
    </div>
  );
}

// ── Field Card ─────────────────────────────────────────────────────────────
function FieldCard({ field, idx, total, isEditing, country, onEdit, onChange, onDelete, onMove }: {
  field: FormField; idx: number; total: number;
  isEditing: boolean; country: Country;
  onEdit: () => void;
  onChange: (c: Partial<FormField>) => void;
  onDelete: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  return (
    <div style={{
      background: isEditing
        ? `linear-gradient(135deg, ${country.color}18, rgba(0,0,0,0.5))`
        : 'rgba(255,255,255,0.04)',
      border: `1px solid ${isEditing ? country.color + '66' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 10,
      overflow: 'hidden',
      transition: 'all 0.2s',
    }}>
      {/* Row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, minWidth: 18 }}>{idx + 1}</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{field.label}</div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
            {field.type}{field.required ? ' · required' : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {idx > 0 && (
            <IconBtn onClick={() => onMove(-1)} title="Move up">▲</IconBtn>
          )}
          {idx < total - 1 && (
            <IconBtn onClick={() => onMove(1)} title="Move down">▼</IconBtn>
          )}
          <IconBtn onClick={onEdit} color={isEditing ? country.accentColor : undefined}>✏️</IconBtn>
          <IconBtn onClick={onDelete} color="#ef4444">✕</IconBtn>
        </div>
      </div>

      {/* Edit panel */}
      {isEditing && (
        <div style={{
          padding: '0 14px 14px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <FieldInput
            label="Label"
            value={field.label}
            onChange={v => onChange({ label: v })}
          />
          {field.type !== 'section' && (
            <FieldInput
              label="Placeholder"
              value={field.placeholder}
              onChange={v => onChange({ placeholder: v })}
            />
          )}
          <label style={{
            display: 'flex', alignItems: 'center', gap: 8,
            color: 'rgba(255,255,255,0.7)', fontSize: 12, cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={field.required}
              onChange={e => onChange({ required: e.target.checked })}
            />
            Required field
          </label>
          {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
            <FieldInput
              label="Options (comma-separated)"
              value={field.options.join(', ')}
              onChange={v => onChange({ options: v.split(',').map(s => s.trim()).filter(Boolean) })}
            />
          )}
          {field.type === 'currency' && (
            <FieldInput
              label="Currency Symbol"
              value={field.prefix}
              onChange={v => onChange({ prefix: v })}
            />
          )}
          <FieldInput
            label="Helper text"
            value={field.helperText}
            onChange={v => onChange({ helperText: v })}
          />
        </div>
      )}
    </div>
  );
}

function IconBtn({ children, onClick, color, title }: {
  children: React.ReactNode; onClick: () => void;
  color?: string; title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: color ?? 'rgba(255,255,255,0.6)',
        borderRadius: 6,
        width: 28, height: 28,
        cursor: 'pointer', fontSize: 11,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {children}
    </button>
  );
}

function FieldInput({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginBottom: 4 }}>{label}</div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 6,
          padding: '6px 10px',
          color: '#fff',
          fontSize: 12,
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

// ── Stats panel ─────────────────────────────────────────────────────────────
function StatBlock({ country, fields }: { country: Country; fields: FormField[] }) {
  const required = fields.filter(f => f.required).length;
  return (
    <>
      <div>
        <div style={{
          color: country.accentColor, fontSize: 10,
          fontWeight: 700, letterSpacing: '0.15em',
          textTransform: 'uppercase', marginBottom: 12,
        }}>
          Form Stats
        </div>
        {[
          { label: 'Total Fields',    value: fields.length },
          { label: 'Required',        value: required },
          { label: 'Optional',        value: fields.length - required },
        ].map(s => (
          <div key={s.label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '7px 0',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{s.label}</span>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{s.value}</span>
          </div>
        ))}
      </div>

      <div>
        <div style={{
          color: 'rgba(255,255,255,0.4)', fontSize: 10,
          fontWeight: 700, letterSpacing: '0.15em',
          textTransform: 'uppercase', marginBottom: 12,
        }}>
          {country.name}
        </div>
        <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 8 }}>{country.emoji}</div>
        <div style={{
          color: 'rgba(255,255,255,0.5)', fontSize: 11,
          textAlign: 'center', lineHeight: 1.5,
        }}>
          {country.tagline}
        </div>
        <div style={{
          marginTop: 12, display: 'flex', justifyContent: 'center',
          gap: 8,
        }}>
          <div style={{
            background: `${country.color}22`,
            border: `1px solid ${country.color}44`,
            borderRadius: 6, padding: '4px 10px',
            color: country.accentColor, fontSize: 11, fontWeight: 700,
          }}>
            {country.currencySymbol} {country.currency}
          </div>
        </div>
      </div>
    </>
  );
}
