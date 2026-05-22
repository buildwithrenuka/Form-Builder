import { useState } from 'react';
import type { FormField, WorldTheme } from '../types';
import { VALIDATION_PRESETS } from '../themes';

function RatingInput({ max, value, onChange, accentColor }: { max: number; value: number; onChange: (v: number) => void; accentColor: string }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '26px',
            color: star <= (hovered || value) ? accentColor : 'rgba(255,255,255,0.2)',
            transition: 'color 0.15s, transform 0.1s',
            transform: star <= (hovered || value) ? 'scale(1.15)' : 'scale(1)',
            padding: 0,
            filter: star <= (hovered || value) ? `drop-shadow(0 0 6px ${accentColor})` : 'none',
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function StructureFieldBanner({ field }: { field: FormField }) {
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

export function ControlledFormField({ field, world, value, onChange }: { field: FormField; world: WorldTheme; value: unknown; onChange: (value: unknown) => void }) {
  const [error, setError] = useState('');

  function validate(val: unknown) {
    const stringValue = Array.isArray(val) ? val.join(',') : String(val ?? '');
    if (field.required && !stringValue.trim()) {
      setError('This field is required');
      return;
    }
    if (field.minLength > 0 && stringValue.length < field.minLength) {
      setError(`Minimum ${field.minLength} characters required`);
      return;
    }
    if (field.maxLength > 0 && stringValue.length > field.maxLength) {
      setError(`Maximum ${field.maxLength} characters allowed`);
      return;
    }
    if (field.validationPreset !== 'none') {
      const preset = VALIDATION_PRESETS.find((item) => item.value === field.validationPreset);
      const pattern = field.validationPreset === 'custom' ? field.customPattern : preset?.pattern;
      if (pattern && stringValue && !new RegExp(pattern).test(stringValue)) {
        setError(field.errorMessage || preset?.hint || 'Invalid format');
        return;
      }
    }
    setError('');
  }

  const inputBase: React.CSSProperties = {
    width: '100%',
    background: world.inputBg,
    border: `1px solid ${error ? '#ff5555' : world.borderColor + '66'}`,
    borderRadius: '7px',
    color: world.textColor,
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: '14px',
    fontWeight: 500,
    padding: '10px 14px',
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  };

  const label = (
    <label style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', fontWeight: 700, color: world.textColor, letterSpacing: '0.06em', marginBottom: '6px', display: 'block' }}>
      {field.label}
      {field.required && <span style={{ color: world.accentColor, marginLeft: '4px' }}>*</span>}
    </label>
  );

  function withAffix(input: React.ReactNode) {
    if (!field.prefix && !field.suffix) return input;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
        {field.prefix && <span style={{ background: `${world.borderColor}22`, border: `1px solid ${world.borderColor}55`, borderRight: 'none', borderRadius: '7px 0 0 7px', padding: '10px 10px', fontFamily: "'Rajdhani', sans-serif", fontSize: '14px', fontWeight: 700, color: world.accentColor, flexShrink: 0, whiteSpace: 'nowrap' }}>{field.prefix}</span>}
        <div style={{ flex: 1 }}>{input}</div>
        {field.suffix && <span style={{ background: `${world.borderColor}22`, border: `1px solid ${world.borderColor}55`, borderLeft: 'none', borderRadius: '0 7px 7px 0', padding: '10px 10px', fontFamily: "'Rajdhani', sans-serif", fontSize: '14px', fontWeight: 700, color: world.mutedColor, flexShrink: 0, whiteSpace: 'nowrap' }}>{field.suffix}</span>}
      </div>
    );
  }

  let input: React.ReactNode;

  switch (field.type) {
    case 'textarea':
      input = <textarea placeholder={field.placeholder} style={{ ...inputBase, height: '90px', resize: 'vertical' }} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} onBlur={(e) => validate(e.target.value)} minLength={field.minLength || undefined} maxLength={field.maxLength || undefined} />;
      break;
    case 'checkbox':
    case 'multi_select':
      input = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(field.options.length ? field.options : [field.placeholder || field.label]).map((option) => {
            const selected = Array.isArray(value) ? value as string[] : [];
            const checked = selected.includes(option);
            return (
              <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked ? selected.filter((item) => item !== option) : [...selected, option];
                    onChange(next);
                    validate(next);
                  }}
                />
                <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '14px', color: world.textColor }}>{option}</span>
              </label>
            );
          })}
        </div>
      );
      break;
    case 'radio':
      input = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {field.options.map((opt) => (
            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="radio" name={field.id} checked={value === opt} onChange={() => { onChange(opt); validate(opt); }} />
              <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '14px', color: value === opt ? world.accentColor : world.textColor, fontWeight: value === opt ? 700 : 500 }}>{opt}</span>
            </label>
          ))}
        </div>
      );
      break;
    case 'select':
      input = (
        <select value={String(value ?? '')} onChange={(e) => { onChange(e.target.value); validate(e.target.value); }} style={{ ...inputBase, appearance: 'none', cursor: 'pointer', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '36px' }}>
          <option value="" style={{ background: '#111' }}>{field.placeholder || 'Select an option...'}</option>
          {field.options.map((opt) => <option key={opt} value={opt} style={{ background: '#111' }}>{opt}</option>)}
        </select>
      );
      break;
    case 'range':
      input = (
        <div>
          <input type="range" min={field.min} max={field.max} value={Number(value ?? field.min)} onChange={(e) => onChange(Number(e.target.value))} style={{ width: '100%', accentColor: world.accentColor, cursor: 'pointer' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', color: world.mutedColor, marginTop: '4px' }}>
            <span>{field.min}</span>
            <span style={{ color: world.accentColor, fontWeight: 700 }}>{Number(value ?? field.min)}</span>
            <span>{field.max}</span>
          </div>
        </div>
      );
      break;
    case 'rating':
      input = <RatingInput max={field.max} value={Number(value ?? 0)} onChange={onChange as (value: number) => void} accentColor={world.accentColor} />;
      break;
    case 'file':
      input = (
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: world.inputBg, border: `1px solid ${world.borderColor}66`, borderRadius: '7px', padding: '10px 14px', cursor: 'pointer' }}>
          <span style={{ fontSize: '20px' }}>📎</span>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', color: value ? world.accentColor : world.mutedColor }}>{value ? String(value) : 'Choose file...'}</span>
          <input type="file" style={{ display: 'none' }} onChange={(e) => onChange(e.target.files?.[0]?.name ?? '')} />
        </label>
      );
      break;
    case 'currency':
      input = withAffix(<input type="number" placeholder={field.placeholder} style={{ ...inputBase, borderRadius: field.prefix ? '0 7px 7px 0' : '7px', borderLeft: field.prefix ? 'none' : undefined }} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} onBlur={(e) => validate(e.target.value)} />);
      break;
    default:
      input = withAffix(<input type={['number'].includes(field.type) ? 'number' : field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : field.type === 'url' ? 'url' : field.type === 'email' ? 'email' : field.type === 'password' ? 'password' : 'text'} placeholder={field.placeholder} style={{ ...inputBase, borderRadius: field.prefix ? '0 7px 7px 0' : '7px', borderLeft: field.prefix ? 'none' : undefined }} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} onBlur={(e) => validate(e.target.value)} minLength={field.minLength || undefined} maxLength={field.maxLength || undefined} />);
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