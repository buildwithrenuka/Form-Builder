import { useEffect, useMemo, useState } from 'react';
import type { FormField, WorldTheme, Avatar } from '../types';
import { ParticleBackground } from './ParticleBackground';
import { ControlledFormField, StructureFieldBanner } from './FormFieldRenderer';
import { countInteractiveFields, getFormPages } from '../utils/formFlow';

type Props = {
  world: WorldTheme;
  avatar: Avatar;
  fields: FormField[];
  formTitle: string;
  onBack: () => void;
};

function renderPageRows(pageFields: FormField[], world: WorldTheme, values: Record<string, unknown>, onChange: (fieldId: string, value: unknown) => void) {
  const rows: React.ReactNode[] = [];
  let index = 0;

  while (index < pageFields.length) {
    const field = pageFields[index];
    if (field.type === 'section') {
      rows.push(<StructureFieldBanner key={field.id} field={field} />);
      index += 1;
      continue;
    }

    const nextField = pageFields[index + 1];
    if (field.fieldWidth === 'half' && nextField && nextField.fieldWidth === 'half' && nextField.type !== 'section') {
      rows.push(
        <div key={`${field.id}-${nextField.id}`} style={{ display: 'flex', gap: '14px' }}>
          <div style={{ flex: 1 }}>
            <ControlledFormField field={field} world={world} value={values[field.id]} onChange={(value) => onChange(field.id, value)} />
          </div>
          <div style={{ flex: 1 }}>
            <ControlledFormField field={nextField} world={world} value={values[nextField.id]} onChange={(value) => onChange(nextField.id, value)} />
          </div>
        </div>,
      );
      index += 2;
      continue;
    }

    rows.push(
      <ControlledFormField
        key={field.id}
        field={field}
        world={world}
        value={values[field.id]}
        onChange={(value) => onChange(field.id, value)}
      />,
    );
    index += 1;
  }

  return rows;
}

export function FormPreview({ world, avatar, fields, formTitle, onBack }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

  const pages = useMemo(() => getFormPages(fields, formValues), [fields, formValues]);
  const currentPage = pages[Math.min(currentPageIndex, Math.max(pages.length - 1, 0))];

  useEffect(() => {
    if (currentPageIndex > pages.length - 1) {
      setCurrentPageIndex(Math.max(pages.length - 1, 0));
    }
  }, [currentPageIndex, pages.length]);

  function updateValue(fieldId: string, value: unknown) {
    setFormValues((previous) => ({ ...previous, [fieldId]: value }));
  }

  const interactiveFieldCount = countInteractiveFields(fields, formValues);
  const isLastPage = currentPageIndex === pages.length - 1;

  return (
    <div style={{ position: 'fixed', inset: 0, background: world.bg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ParticleBackground particles={world.particles} count={18} />

      <div style={{ position: 'relative', zIndex: 10, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${world.borderColor}44`, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <button onClick={onBack} className="tr-btn" style={{ background: 'rgba(255,255,255,0.07)', color: world.mutedColor, fontSize: '12px', padding: '8px 14px', border: `1px solid ${world.borderColor}44`, letterSpacing: '0.08em' }}>
          ← BUILDER
        </button>
        <span style={{ fontSize: '22px' }}>{world.emoji}</span>
        <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '15px', fontWeight: 700, color: world.accentColor, letterSpacing: '0.06em', filter: `drop-shadow(0 0 6px ${world.glowColor})` }}>PREVIEW MODE</div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${avatar.color}44`, borderRadius: '14px', padding: '4px 10px 4px 6px' }}>
          <span style={{ fontSize: '18px' }}>{avatar.emoji}</span>
          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', color: avatar.color, fontWeight: 600 }}>{avatar.name}</span>
        </div>
      </div>

      <div className="tr-scroll" style={{ position: 'relative', zIndex: 5, flex: 1, padding: '32px 20px' }}>
        <div style={{ maxWidth: '620px', margin: '0 auto', background: world.cardBg, border: `1px solid ${world.borderColor}55`, borderRadius: '16px', overflow: 'hidden', boxShadow: `0 8px 48px rgba(0,0,0,0.6), 0 0 40px ${world.glowColor}22`, animation: 'card-enter 0.4s ease-out both' }}>
          <div style={{ background: `linear-gradient(135deg, ${world.cardBg}, rgba(0,0,0,0.6))`, borderBottom: `1px solid ${world.borderColor}44`, padding: '28px 28px 20px' }}>
            <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(16px, 2.5vw, 24px)', fontWeight: 900, color: world.accentColor, letterSpacing: '0.04em', filter: `drop-shadow(0 0 10px ${world.glowColor})`, animation: 'text-glow 3s ease-in-out infinite' }}>{formTitle || 'Untitled Form'}</div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', color: world.mutedColor, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '6px' }}>
              {world.emoji} {world.name} · {interactiveFieldCount} field{interactiveFieldCount !== 1 ? 's' : ''}
            </div>
            {pages.length > 1 && currentPage && (
              <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', color: world.accentColor, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Page {currentPageIndex + 1} of {pages.length}</div>
                  <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '14px', color: '#fff', marginTop: '4px' }}>{currentPage.title}</div>
                  {currentPage.description && <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', color: world.mutedColor, marginTop: '4px' }}>{currentPage.description}</div>}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {pages.map((page, pageIndex) => (
                    <button key={page.id} type="button" onClick={() => setCurrentPageIndex(pageIndex)} style={{ width: '10px', height: '10px', borderRadius: '999px', border: 'none', cursor: 'pointer', background: pageIndex === currentPageIndex ? world.accentColor : 'rgba(255,255,255,0.18)', boxShadow: pageIndex === currentPageIndex ? `0 0 10px ${world.glowColor}` : 'none' }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {!submitted ? (
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {currentPage ? renderPageRows(currentPage.fields, world, formValues, updateValue) : null}

              <div style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${world.borderColor}66, transparent)`, marginTop: '8px' }} />

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {currentPageIndex > 0 && (
                  <button onClick={() => setCurrentPageIndex((page) => Math.max(page - 1, 0))} className="tr-btn" style={{ background: 'rgba(255,255,255,0.06)', color: world.textColor, fontSize: '14px', padding: '14px 22px', letterSpacing: '0.1em', borderRadius: '8px', border: `1px solid ${world.borderColor}44` }}>
                    ← PREVIOUS
                  </button>
                )}
                {!isLastPage && (
                  <button onClick={() => setCurrentPageIndex((page) => Math.min(page + 1, pages.length - 1))} className="tr-btn" style={{ background: world.buttonGradient, color: world.buttonText, fontSize: '15px', padding: '14px 32px', letterSpacing: '0.15em', borderRadius: '8px', boxShadow: `0 0 20px ${world.glowColor}66` }}>
                    NEXT PAGE →
                  </button>
                )}
                {isLastPage && (
                  <button onClick={() => setSubmitted(true)} className="tr-btn" style={{ background: world.buttonGradient, color: world.buttonText, fontSize: '15px', padding: '14px 32px', letterSpacing: '0.15em', borderRadius: '8px', boxShadow: `0 0 20px ${world.glowColor}66` }}>
                    🏃 SUBMIT FORM
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: '48px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center', animation: 'fade-in 0.5s ease-out' }}>
              <span style={{ fontSize: '64px', animation: 'bounce 1s ease-in-out infinite', filter: `drop-shadow(0 0 16px ${world.glowColor})` }}>🏆</span>
              <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '22px', fontWeight: 900, color: world.accentColor, filter: `drop-shadow(0 0 10px ${world.glowColor})` }}>Form Submitted!</div>
              <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '15px', color: world.mutedColor, letterSpacing: '0.08em', maxWidth: '280px' }}>{avatar.name} has completed the mission in {world.name}!</p>
              <button onClick={() => { setSubmitted(false); setCurrentPageIndex(0); setFormValues({}); }} className="tr-btn" style={{ background: world.buttonGradient, color: world.buttonText, fontSize: '13px', padding: '10px 24px', letterSpacing: '0.1em', marginTop: '8px', boxShadow: `0 0 14px ${world.glowColor}55` }}>
                ↩ TRY AGAIN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
