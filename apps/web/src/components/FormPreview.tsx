import { useState } from 'react';
import { FormField, WorldTheme, Avatar } from '../types';
import { VALIDATION_PRESETS } from '../themes';
import { ParticleBackground } from './ParticleBackground';

type Props = {
  world: WorldTheme;
  avatar: Avatar;
  fields: FormField[];
  formTitle: string;
  onBack: () => void;
};

function RatingInput({
  max,
  value,
  onChange,
  accentColor,
}: {
  max: number;
  value: number;
  onChange: (v: number) => void;
  accentColor: string;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '26px',
            color:
              star <= (hovered || value) ? accentColor : 'rgba(255,255,255,0.2)',
            transition: 'color 0.15s, transform 0.1s',
            transform: star <= (hovered || value) ? 'scale(1.15)' : 'scale(1)',
            padding: 0,
            filter:
              star <= (hovered || value)
                ? `drop-shadow(0 0 6px ${accentColor})`
                : 'none',
          }}
        >
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

function PreviewField({
  field,
  world,
}: {
  field: FormField;
  world: WorldTheme;
}) {
  const [value, setValue] = useState<string | boolean | number>(
    field.type === 'checkbox' ? false : field.type === 'rating' ? 0 : field.type === 'range' ? field.min : ''
  );
  const [error, setError] = useState('');

  function validate(val: string) {
    if (field.required && !val.trim()) { setError('This field is required'); return; }
    if (field.minLength > 0 && val.length < field.minLength) { setError(`Minimum ${field.minLength} characters required`); return; }
    if (field.maxLength > 0 && val.length > field.maxLength) { setError(`Maximum ${field.maxLength} characters allowed`); return; }
    if (field.validationPreset !== 'none') {
      const preset = VALIDATION_PRESETS.find(p => p.value === field.validationPreset);
      const pattern = field.validationPreset === 'custom' ? field.customPattern : preset?.pattern;
      if (pattern && val && !new RegExp(pattern).test(val)) {
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

  const labelElem = (
    <label
      style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontSize: '13px',
        fontWeight: 700,
        color: world.textColor,
        letterSpacing: '0.06em',
        marginBottom: '6px',
        display: 'block',
      }}
    >
      {field.label}
      {field.required && (
        <span style={{ color: world.accentColor, marginLeft: '4px' }}>*</span>
      )}
    </label>
  );

  function withFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    e.target.style.borderColor = error ? '#ff5555' : world.accentColor;
    e.target.style.boxShadow = error ? '0 0 8px rgba(255,85,85,0.3)' : `0 0 10px ${world.glowColor}44`;
  }
  function withBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    validate(String(e.target.value));
    e.target.style.borderColor = error ? '#ff5555' : `${world.borderColor}66`;
    e.target.style.boxShadow = 'none';
  }

  // Prefix/suffix wrapper for currency/number
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
      input = (
        <textarea
          placeholder={field.placeholder}
          style={{ ...inputBase, height: '90px', resize: 'vertical' }}
          value={value as string}
          onChange={(e) => setValue(e.target.value)}
          onFocus={withFocus as React.FocusEventHandler<HTMLTextAreaElement>}
          onBlur={withBlur as React.FocusEventHandler<HTMLTextAreaElement>}
          minLength={field.minLength || undefined} maxLength={field.maxLength || undefined}
        />
      );
      break;

    case 'checkbox':
      input = (
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
        >
          <button
            onClick={() => setValue(!value)}
            style={{
              width: '22px',
              height: '22px',
              background: value ? world.accentColor : world.inputBg,
              border: `2px solid ${value ? world.accentColor : world.borderColor}`,
              borderRadius: '5px',
              cursor: 'pointer',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              flexShrink: 0,
              boxShadow: value ? `0 0 8px ${world.glowColor}66` : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {value ? '✓' : ''}
          </button>
          <span
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '14px',
              color: world.textColor,
            }}
          >
            {field.placeholder || field.label}
          </span>
        </label>
      );
      break;

    case 'radio':
      input = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {field.options.map((opt) => (
            <label
              key={opt}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
              }}
            >
              <button
                onClick={() => setValue(opt)}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: `2px solid ${value === opt ? world.accentColor : world.borderColor}`,
                  background: world.inputBg,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                  boxShadow: value === opt ? `0 0 8px ${world.glowColor}55` : 'none',
                }}
              >
                {value === opt && (
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: world.accentColor,
                    }}
                  />
                )}
              </button>
              <span
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: '14px',
                  color: value === opt ? world.accentColor : world.textColor,
                  transition: 'color 0.15s ease',
                  fontWeight: value === opt ? 700 : 500,
                }}
              >
                {opt}
              </span>
            </label>
          ))}
        </div>
      );
      break;

    case 'select':
      input = (
        <select
          value={value as string}
          onChange={(e) => setValue(e.target.value)}
          onFocus={withFocus as React.FocusEventHandler<HTMLSelectElement>}
          onBlur={(e) => { e.target.style.borderColor = `${world.borderColor}66`; e.target.style.boxShadow = 'none'; }}
          style={{
            ...inputBase,
            appearance: 'none',
            cursor: 'pointer',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            paddingRight: '36px',
          }}
        >
          <option value="" style={{ background: '#111' }}>
            {field.placeholder || 'Select an option...'}
          </option>
          {field.options.map((opt) => (
            <option key={opt} value={opt} style={{ background: '#111' }}>
              {opt}
            </option>
          ))}
        </select>
      );
      break;

    case 'range':
      input = (
        <div>
          <input
            type="range"
            min={field.min}
            max={field.max}
            value={value as number}
            onChange={(e) => setValue(Number(e.target.value))}
            style={{ width: '100%', accentColor: world.accentColor, cursor: 'pointer' }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '12px',
              color: world.mutedColor,
              marginTop: '4px',
            }}
          >
            <span>{field.min}</span>
            <span style={{ color: world.accentColor, fontWeight: 700 }}>
              {value}
            </span>
            <span>{field.max}</span>
          </div>
        </div>
      );
      break;

    case 'rating':
      input = (
        <RatingInput
          max={field.max}
          value={value as number}
          onChange={(v) => setValue(v)}
          accentColor={world.accentColor}
        />
      );
      break;

    case 'currency':
      input = withAffix(
        <input
          type="number" placeholder={field.placeholder}
          style={{ ...inputBase, borderRadius: field.prefix ? '0 7px 7px 0' : '7px', borderLeft: field.prefix ? 'none' : undefined }}
          value={value as string} onChange={(e) => setValue(e.target.value)}
          onFocus={withFocus as React.FocusEventHandler<HTMLInputElement>}
          onBlur={withBlur as React.FocusEventHandler<HTMLInputElement>}
        />
      );
      break;

    case 'url':
      input = (
        <input
          type="url" placeholder={field.placeholder || 'https://'}
          style={inputBase} value={value as string}
          onChange={(e) => setValue(e.target.value)}
          onFocus={withFocus as React.FocusEventHandler<HTMLInputElement>}
          onBlur={withBlur as React.FocusEventHandler<HTMLInputElement>}
          minLength={field.minLength || undefined} maxLength={field.maxLength || undefined}
        />
      );
      break;

    case 'time':
      input = (
        <input
          type="time"
          style={{ ...inputBase, colorScheme: 'dark' }} value={value as string}
          onChange={(e) => setValue(e.target.value)}
          onFocus={withFocus as React.FocusEventHandler<HTMLInputElement>}
          onBlur={(e) => { e.target.style.borderColor = `${world.borderColor}66`; e.target.style.boxShadow = 'none'; }}
        />
      );
      break;

    case 'file':
      input = (
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: world.inputBg, border: `1px solid ${world.borderColor}66`, borderRadius: '7px', padding: '10px 14px', cursor: 'pointer' }}>
          <span style={{ fontSize: '20px' }}>📎</span>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', color: value ? world.accentColor : world.mutedColor }}>
            {value ? String(value) : 'Choose file...'}
          </span>
          <input type="file" style={{ display: 'none' }} onChange={(e) => setValue(e.target.files?.[0]?.name ?? '')} />
        </label>
      );
      break;

    default:
      input = withAffix(
        <input
          type={field.type}
          placeholder={field.placeholder}
          style={{ ...inputBase, borderRadius: field.prefix ? '0 7px 7px 0' : '7px', borderLeft: field.prefix ? 'none' : undefined }}
          value={value as string}
          onChange={(e) => setValue(e.target.value)}
          minLength={field.minLength || undefined} maxLength={field.maxLength || undefined}
          onFocus={withFocus as React.FocusEventHandler<HTMLInputElement>}
          onBlur={withBlur as React.FocusEventHandler<HTMLInputElement>}
        />
      );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {field.type !== 'checkbox' && labelElem}
      {input}
      {error && <span style={{ fontFamily: "'Exo 2', sans-serif", fontSize: '11px', color: '#ff7777', marginTop: '4px' }}>⚠ {error}</span>}
      {!error && field.helperText && (
        <span
          style={{
            fontFamily: "'Exo 2', sans-serif",
            fontSize: '11px',
            color: world.mutedColor,
            marginTop: '5px',
            fontStyle: 'italic',
          }}
        >
          {field.helperText}
        </span>
      )}
    </div>
  );
}

export function FormPreview({ world, avatar, fields, formTitle, onBack }: Props) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: world.bg,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <ParticleBackground particles={world.particles} count={18} />

      {/* Header */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${world.borderColor}44`,
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          className="tr-btn"
          style={{
            background: 'rgba(255,255,255,0.07)',
            color: world.mutedColor,
            fontSize: '12px',
            padding: '8px 14px',
            border: `1px solid ${world.borderColor}44`,
            letterSpacing: '0.08em',
          }}
        >
          ← BUILDER
        </button>

        <span style={{ fontSize: '22px' }}>{world.emoji}</span>

        <div
          style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: '15px',
            fontWeight: 700,
            color: world.accentColor,
            letterSpacing: '0.06em',
            filter: `drop-shadow(0 0 6px ${world.glowColor})`,
          }}
        >
          PREVIEW MODE
        </div>

        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${avatar.color}44`,
            borderRadius: '14px',
            padding: '4px 10px 4px 6px',
          }}
        >
          <span style={{ fontSize: '18px' }}>{avatar.emoji}</span>
          <span
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '11px',
              color: avatar.color,
              fontWeight: 600,
            }}
          >
            {avatar.name}
          </span>
        </div>
      </div>

      {/* Form card */}
      <div
        className="tr-scroll"
        style={{ position: 'relative', zIndex: 5, flex: 1, padding: '32px 20px' }}
      >
        <div
          style={{
            maxWidth: '620px',
            margin: '0 auto',
            background: world.cardBg,
            border: `1px solid ${world.borderColor}55`,
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: `0 8px 48px rgba(0,0,0,0.6), 0 0 40px ${world.glowColor}22`,
            animation: 'card-enter 0.4s ease-out both',
          }}
        >
          {/* Form header */}
          <div
            style={{
              background: `linear-gradient(135deg, ${world.cardBg}, rgba(0,0,0,0.6))`,
              borderBottom: `1px solid ${world.borderColor}44`,
              padding: '28px 28px 20px',
            }}
          >
            <div
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: 'clamp(16px, 2.5vw, 24px)',
                fontWeight: 900,
                color: world.accentColor,
                letterSpacing: '0.04em',
                filter: `drop-shadow(0 0 10px ${world.glowColor})`,
                animation: 'text-glow 3s ease-in-out infinite',
              }}
            >
              {formTitle || 'Untitled Form'}
            </div>
            <div
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '12px',
                color: world.mutedColor,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginTop: '6px',
              }}
            >
              {world.emoji} {world.name} · {fields.filter(f => !f.hidden && f.type !== 'section').length} field{fields.filter(f => !f.hidden && f.type !== 'section').length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Fields */}
          {!submitted ? (
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {(() => {
                const visibleFields = fields.filter(f => !f.hidden);
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
                        <div style={{ flex: 1 }}><PreviewField field={f} world={world} /></div>
                        <div style={{ flex: 1 }}><PreviewField field={f2} world={world} /></div>
                      </div>
                    );
                    i += 2;
                  } else {
                    rows.push(<PreviewField key={f.id} field={f} world={world} />);
                    i++;
                  }
                }
                return rows;
              })()}

              {/* Divider */}
              <div
                style={{
                  height: '1px',
                  background: `linear-gradient(90deg, transparent, ${world.borderColor}66, transparent)`,
                  marginTop: '8px',
                }}
              />

              {/* Submit */}
              <button
                onClick={() => setSubmitted(true)}
                className="tr-btn"
                style={{
                  background: world.buttonGradient,
                  color: world.buttonText,
                  fontSize: '15px',
                  padding: '14px 32px',
                  letterSpacing: '0.15em',
                  borderRadius: '8px',
                  alignSelf: 'flex-start',
                  boxShadow: `0 0 20px ${world.glowColor}66`,
                }}
              >
                🏃 SUBMIT FORM
              </button>
            </div>
          ) : (
            /* Success screen */
            <div
              style={{
                padding: '48px 28px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                textAlign: 'center',
                animation: 'fade-in 0.5s ease-out',
              }}
            >
              <span
                style={{
                  fontSize: '64px',
                  animation: 'bounce 1s ease-in-out infinite',
                  filter: `drop-shadow(0 0 16px ${world.glowColor})`,
                }}
              >
                🏆
              </span>
              <div
                style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  fontSize: '22px',
                  fontWeight: 900,
                  color: world.accentColor,
                  filter: `drop-shadow(0 0 10px ${world.glowColor})`,
                }}
              >
                Form Submitted!
              </div>
              <p
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: '15px',
                  color: world.mutedColor,
                  letterSpacing: '0.08em',
                  maxWidth: '280px',
                }}
              >
                {avatar.name} has completed the mission in {world.name}!
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                {['🪙', '🪙', '🪙', '⭐', '⭐'].map((e, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '24px',
                      animation: `bounce 1s ease-in-out ${i * 0.1}s infinite`,
                    }}
                  >
                    {e}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="tr-btn"
                style={{
                  background: world.buttonGradient,
                  color: world.buttonText,
                  fontSize: '13px',
                  padding: '10px 24px',
                  letterSpacing: '0.1em',
                  marginTop: '8px',
                  boxShadow: `0 0 14px ${world.glowColor}55`,
                }}
              >
                ↩ TRY AGAIN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
