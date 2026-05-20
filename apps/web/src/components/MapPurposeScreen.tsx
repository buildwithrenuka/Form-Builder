import { useState } from 'react';
import { WorldTheme, Avatar, FormField, FieldType, ValidationPreset, FieldWidth } from '../types';
import { ParticleBackground } from './ParticleBackground';
import { playClick, playSuccess, playWhoosh, playCoin, playHover } from '../soundEngine';

// ── Field factory ─────────────────────────────────────────────────────────

let _id = 0;
function uid(): string {
  return `mp_${Date.now()}_${++_id}`;
}

function field(
  type: FieldType,
  label: string,
  placeholder = '',
  required = false,
  extra: Partial<FormField> = {},
): FormField {
  return {
    id: uid(),
    type,
    label,
    placeholder,
    required,
    options: [],
    min: 0,
    max: 100,
    helperText: '',
    minLength: 0,
    maxLength: 0,
    validationPreset: 'none' as ValidationPreset,
    customPattern: '',
    errorMessage: '',
    fieldWidth: 'full' as FieldWidth,
    hidden: false,
    prefix: '',
    suffix: '',
    sectionColor: '',
    sectionDescription: '',
    ...extra,
  };
}

function section(label: string, color = '#ffd700', desc = ''): FormField {
  return field('section', label, '', false, { sectionColor: color, sectionDescription: desc });
}

function halfField(
  type: FieldType,
  label: string,
  placeholder = '',
  required = false,
  extra: Partial<FormField> = {},
): FormField {
  return field(type, label, placeholder, required, { fieldWidth: 'half', ...extra });
}

// ── Purpose definitions ───────────────────────────────────────────────────

export type Purpose = {
  id: string;
  emoji: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
  fieldCount: number;
  suggestedTitle: string;
  buildFields: () => FormField[];
};

const PURPOSES: Purpose[] = [
  {
    id: 'onboarding',
    emoji: '🚀',
    name: 'User Onboarding',
    tagline: 'Welcome new users',
    description: 'Collect essential info when someone first joins your product, team, or community.',
    color: '#00e676',
    fieldCount: 6,
    suggestedTitle: 'Welcome Aboard! 🚀',
    buildFields: () => [
      section('Getting Started', '#00c853', 'Tell us a little about yourself'),
      halfField('text', 'First Name', 'Your first name', true),
      halfField('text', 'Last Name', 'Your last name', true),
      field('email', 'Email Address', 'your@email.com', true, { validationPreset: 'none' }),
      halfField('text', 'Company / Organisation', 'Where do you work?'),
      halfField('text', 'Job Title / Role', 'Your current role'),
      field('phone', 'Phone Number', '+91 00000 00000'),
      section('Almost Done', '#00b894', 'One last thing before you begin'),
      field('select', 'How did you hear about us?', '', false, {
        options: ['Google Search', 'Social Media', 'Friend / Colleague', 'Advertisement', 'Other'],
      }),
      field('textarea', 'Anything else you\'d like us to know?', 'Optional notes...', false),
    ],
  },
  {
    id: 'survey',
    emoji: '📊',
    name: 'Feedback Survey',
    tagline: 'Capture honest opinions',
    description: 'Gather structured feedback, ratings, and open-ended responses from your audience.',
    color: '#40c4ff',
    fieldCount: 7,
    suggestedTitle: 'Share Your Thoughts 📊',
    buildFields: () => [
      section('Survey', '#0288d1', 'Your feedback matters to us'),
      halfField('text', 'Your Name', 'Optional — leave blank to stay anonymous'),
      halfField('email', 'Email Address', 'Optional — for follow-up'),
      field('rating', 'Overall Satisfaction', '', true, { min: 1, max: 5 }),
      field('textarea', 'What went well?', 'Tell us what you loved...', true),
      field('textarea', 'What could be improved?', 'Honest feedback helps us grow...', false),
      field('radio', 'Would you recommend us?', '', true, {
        options: ['Definitely Yes', 'Probably Yes', 'Not Sure', 'Probably Not', 'Definitely Not'],
      }),
      field('range', 'Likelihood to return (1–10)', '', false, { min: 1, max: 10 }),
    ],
  },
  {
    id: 'fun',
    emoji: '🎉',
    name: 'Fun Activity / Quiz',
    tagline: 'Engage & entertain',
    description: 'Interactive forms for games, quizzes, icebreakers, or community challenges.',
    color: '#ff6d00',
    fieldCount: 6,
    suggestedTitle: 'Join the Adventure! 🎉',
    buildFields: () => [
      section('Player Profile', '#e65100', 'Create your adventurer identity'),
      halfField('text', 'Your Adventure Name', 'e.g. Shadow Runner, Gold Seeker', true),
      halfField('select', 'Skill Level', '', true, {
        options: ['Rookie Explorer', 'Seasoned Runner', 'Temple Legend', 'Demon Slayer'],
      }),
      field('radio', 'Favourite Form Quest World', '', true, {
        options: ['🌴 Jungle World', '❄️ Snow World', '🏜️ Desert World', '🚀 Space World', '🌊 Underwater World', '🌋 Volcano World', '☁️ Heaven World', '😈 Hell World'],
      }),
      section('The Challenge', '#bf360c', 'Now prove your worth'),
      field('textarea', 'Describe your greatest adventure in 3 sentences', 'Once upon a curse...', true),
      field('rating', 'How legendary are you? (1 = mortal, 5 = god)', '', true, { min: 1, max: 5 }),
      field('checkbox', 'I accept the Demon Pact (terms & conditions)', '', true),
    ],
  },
  {
    id: 'registration',
    emoji: '📋',
    name: 'Event Registration',
    tagline: 'Collect attendee details',
    description: 'Sign up participants for workshops, conferences, webinars, or any event.',
    color: '#ffd740',
    fieldCount: 8,
    suggestedTitle: 'Event Registration 📋',
    buildFields: () => [
      section('Personal Information', '#f57f17'),
      halfField('text', 'Full Name', 'As on ID', true),
      halfField('email', 'Email Address', 'Confirmation will be sent here', true),
      halfField('phone', 'Phone Number', '+91 00000 00000', true),
      halfField('date', 'Date of Birth', '', false),
      section('Event Details', '#e65100'),
      field('select', 'Which session are you attending?', '', true, {
        options: ['Morning Session (9AM–1PM)', 'Afternoon Session (2PM–6PM)', 'Full Day', 'Online / Virtual'],
      }),
      field('radio', 'Dietary Requirements', '', false, {
        options: ['No Restriction', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Other'],
      }),
      field('textarea', 'Any special requirements or accessibility needs?', 'Let us know...', false),
      field('checkbox', 'I agree to the event terms and photography policy', '', true),
    ],
  },
  {
    id: 'job',
    emoji: '💼',
    name: 'Job Application',
    tagline: 'Professional career form',
    description: 'Collect resumes, experience details, and cover letters from job applicants.',
    color: '#b39ddb',
    fieldCount: 9,
    suggestedTitle: 'Career Application 💼',
    buildFields: () => [
      section('Personal Details', '#4527a0'),
      halfField('text', 'Full Name', 'Your legal name', true),
      halfField('email', 'Email Address', 'Professional email preferred', true),
      halfField('phone', 'Phone Number', '+91 00000 00000', true),
      halfField('url', 'LinkedIn / Portfolio URL', 'https://...', false),
      section('Professional Details', '#311b92'),
      field('text', 'Position Applied For', 'Job title you are applying to', true),
      halfField('select', 'Years of Experience', '', true, {
        options: ['Fresher (0–1 year)', '1–3 years', '3–5 years', '5–10 years', '10+ years'],
      }),
      halfField('text', 'Current Company / College', 'Where are you now?', false),
      halfField('currency', 'Current CTC (if applicable)', '₹ per annum', false, { prefix: '₹' }),
      halfField('currency', 'Expected CTC', '₹ per annum', true, { prefix: '₹' }),
      section('Documents', '#1a237e'),
      field('textarea', 'Cover Letter', 'Why are you the perfect fit for this role?', true, { minLength: 100 }),
      field('file', 'Resume / CV', '', true),
    ],
  },
  {
    id: 'contact',
    emoji: '📞',
    name: 'Contact Form',
    tagline: 'Simple reach-out form',
    description: 'The classic — let visitors send you a message with just the essentials.',
    color: '#80cbc4',
    fieldCount: 4,
    suggestedTitle: 'Get In Touch 📞',
    buildFields: () => [
      halfField('text', 'Your Name', 'How should we address you?', true),
      halfField('email', 'Email Address', 'We\'ll reply here', true),
      field('text', 'Subject', 'What is this about?', true),
      field('textarea', 'Your Message', 'Write your message here...', true, { minLength: 20 }),
      field('checkbox', 'I consent to being contacted about my enquiry', '', true),
    ],
  },
  {
    id: 'order',
    emoji: '🛒',
    name: 'Order Form',
    tagline: 'Take product orders',
    description: 'Accept orders for products, services, or custom work from clients.',
    color: '#ff8f00',
    fieldCount: 8,
    suggestedTitle: 'Place Your Order 🛒',
    buildFields: () => [
      section('Your Details', '#e65100'),
      halfField('text', 'Full Name', 'Name for billing/shipping', true),
      halfField('email', 'Email', 'Order confirmation here', true),
      field('phone', 'Phone Number', 'For delivery updates', true),
      section('Order Details', '#bf360c'),
      field('select', 'Product / Service', '', true, {
        options: ['Product A', 'Product B', 'Product C', 'Custom Order'],
      }),
      halfField('number', 'Quantity', '1', true, { min: 1, max: 999 }),
      halfField('currency', 'Budget (if custom)', '₹', false, { prefix: '₹' }),
      field('textarea', 'Special Instructions / Notes', 'Any customisations, preferences, or details...', false),
      section('Delivery', '#a93226'),
      field('textarea', 'Delivery Address', 'Full address including PIN code', true),
      field('select', 'Preferred Delivery Time', '', false, {
        options: ['Morning (9AM–12PM)', 'Afternoon (12PM–4PM)', 'Evening (4PM–8PM)', 'Any Time'],
      }),
    ],
  },
  {
    id: 'health',
    emoji: '🏥',
    name: 'Health Intake',
    tagline: 'Medical & wellness info',
    description: 'Collect patient or client health information for clinics, gyms, or wellness programs.',
    color: '#ef9a9a',
    fieldCount: 9,
    suggestedTitle: 'Health Information Form 🏥',
    buildFields: () => [
      section('Personal Information', '#c62828'),
      halfField('text', 'Full Name', 'As on ID / Aadhaar', true),
      halfField('date', 'Date of Birth', '', true),
      halfField('radio', 'Gender', '', true, { options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'] }),
      halfField('select', 'Blood Type', '', false, {
        options: ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−', 'Unknown'],
      }),
      section('Medical History', '#b71c1c'),
      field('textarea', 'Known Allergies', 'Food, medication, environmental — list all', false),
      field('textarea', 'Current Medications', 'Include dosage if known', false),
      field('textarea', 'Pre-existing Conditions', 'Diabetes, hypertension, asthma, etc.', false),
      section('Emergency Contact', '#7f0000'),
      halfField('text', 'Emergency Contact Name', 'Full name', true),
      halfField('phone', 'Emergency Contact Phone', '+91 00000 00000', true),
      field('text', 'Relationship', 'e.g. Spouse, Parent, Sibling', true),
    ],
  },
  {
    id: 'feedback',
    emoji: '⭐',
    name: 'Product Review',
    tagline: 'Gather star ratings',
    description: 'Let customers rate and review your product, course, app, or service.',
    color: '#ffd740',
    fieldCount: 6,
    suggestedTitle: 'Leave a Review ⭐',
    buildFields: () => [
      halfField('text', 'Your Name', 'Optional for anonymous reviews'),
      halfField('email', 'Email', 'Optional — for follow-up'),
      field('text', 'Product / Service Name', 'What are you reviewing?', true),
      field('rating', 'Overall Rating', '', true, { min: 1, max: 5 }),
      field('textarea', 'What did you love?', 'Highlight the best parts...', true),
      field('textarea', 'What could be better?', 'Constructive criticism welcome...', false),
      field('radio', 'Would you recommend this?', '', true, {
        options: ['Absolutely — 10/10', 'Yes, with minor reservations', 'Maybe', 'Not really', 'No'],
      }),
    ],
  },
  {
    id: 'scratch',
    emoji: '✨',
    name: 'Start from Scratch',
    tagline: 'Blank canvas — you decide',
    description: 'No pre-built fields. You\'re the architect. Every field is yours to place.',
    color: 'rgba(255,255,255,0.4)',
    fieldCount: 0,
    suggestedTitle: 'My Adventure Form',
    buildFields: () => [],
  },
];

// ── World-specific flavor prompts ────────────────────────────────────────

const WORLD_PROMPTS: Record<string, string> = {
  jungle: 'The ancient ruins have stood for centuries. What secrets do you need to uncover from those who pass through?',
  snow: 'The frozen tundra demands purpose. In this endless blizzard, what information must you gather before the cold takes hold?',
  desert: 'The Pharaoh\'s sands shift constantly. Declare your mission before the cursed winds erase all trace of your presence.',
  space: 'In the void between stars, intention is everything. What intelligence must you extract from this expedition?',
  underwater: 'The deep sea holds infinite data in its silence. What knowledge do you seek from the abyss?',
  volcano: 'The magma does not wait for uncertainty. State your purpose — the mountain respects only the decisive.',
  heaven: 'The celestial archives demand clarity. What divine record must you collect before the gates close?',
  hell: 'The dark lords require tribute. State your purpose or become part of the infernal bureaucracy forever.',
};

// ── Map marker positions (% of container) for the top map strip ──────────
const MAP_NODES: { id: string; emoji: string; x: number; y: number }[] = [
  { id: 'onboarding',   emoji: '🚀', x: 6,  y: 55 },
  { id: 'survey',       emoji: '📊', x: 16, y: 28 },
  { id: 'quiz',         emoji: '🎯', x: 27, y: 60 },
  { id: 'registration', emoji: '📋', x: 37, y: 35 },
  { id: 'job',          emoji: '💼', x: 48, y: 65 },
  { id: 'contact',      emoji: '📬', x: 57, y: 25 },
  { id: 'order',        emoji: '🛒', x: 66, y: 55 },
  { id: 'health',       emoji: '🏥', x: 75, y: 30 },
  { id: 'feedback',     emoji: '⭐', x: 85, y: 60 },
  { id: 'scratch',      emoji: '✨', x: 93, y: 35 },
];

// ── Component ─────────────────────────────────────────────────────────────

type Props = {
  world: WorldTheme;
  avatar: Avatar;
  onSelect: (fields: FormField[], title: string, purposeId: string) => void;
  onBack: () => void;
};

export function MapPurposeScreen({ world, avatar, onSelect, onBack }: Props) {
  const [selected, setSelected] = useState<Purpose | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [launching, setLaunching] = useState(false);

  const worldPrompt = WORLD_PROMPTS[world.id] ?? WORLD_PROMPTS.jungle;

  function handleAccept() {
    if (!selected || launching) return;
    setLaunching(true);
    playSuccess();
    setTimeout(() => {
      const fields = selected.buildFields();
      onSelect(fields, selected.suggestedTitle, selected.id);
    }, 900);
  }

  // Derive a path string connecting all map nodes as an SVG polyline
  const pathPoints = MAP_NODES.map(n => `${n.x},${n.y}`).join(' ');

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: world.bg,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      opacity: launching ? 0 : 1,
      transition: launching ? 'opacity 0.9s ease' : 'none',
    }}>
      <ParticleBackground particles={world.particles} count={14} />

      {/* ── Map parchment texture overlay ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        backgroundImage: `
          linear-gradient(${world.borderColor}18 1px, transparent 1px),
          linear-gradient(90deg, ${world.borderColor}18 1px, transparent 1px),
          radial-gradient(circle at 20% 80%, ${world.glowColor}08 0%, transparent 45%),
          radial-gradient(circle at 80% 20%, ${world.glowColor}06 0%, transparent 45%)
        `,
        backgroundSize: '48px 48px, 48px 48px, 100% 100%, 100% 100%',
      }} />

      {/* Corner vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, transparent 25%, rgba(0,0,0,0.75) 100%)', pointerEvents: 'none', zIndex: 1 }} />

      {/* ── Top letterbox ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '58px', background: 'rgba(0,0,0,0.96)', zIndex: 20 }} />

      {/* ── Top bar ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '58px', zIndex: 25, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px' }}>
        <button
          onClick={() => { playClick(); onBack(); }}
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.13)', borderRadius: '6px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', fontWeight: 700, padding: '5px 14px', cursor: 'pointer', letterSpacing: '0.14em', transition: 'all 0.18s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)'; }}
        >← BACK</button>

        {/* Breadcrumb trail */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.13em' }}>
          <span style={{ fontSize: '15px' }}>{avatar.emoji}</span>
          <span>{avatar.name.toUpperCase()}</span>
          <span style={{ color: 'rgba(255,255,255,0.14)', fontSize: '10px' }}>──▶</span>
          <span style={{ fontSize: '15px' }}>{world.emoji}</span>
          <span style={{ color: world.accentColor, fontWeight: 700 }}>{world.name.toUpperCase()}</span>
          <span style={{ color: 'rgba(255,255,255,0.14)', fontSize: '10px' }}>──▶</span>
          <span style={{ color: 'rgba(255,255,255,0.55)' }}>MISSION SELECT</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Cinzel Decorative', serif", fontSize: '9px', color: `${world.accentColor}55`, letterSpacing: '0.12em' }}>
          <span style={{ fontSize: '18px' }}>🧭</span>
          <span>MISSION MAP</span>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="tr-scroll" style={{ position: 'relative', zIndex: 10, flex: 1, overflowY: 'auto', paddingTop: '58px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '24px 20px 130px' }}>

          {/* ══════════ INTERACTIVE MAP STRIP ══════════ */}
          <div style={{
            position: 'relative',
            background: `linear-gradient(135deg, ${world.cardBg}, rgba(0,0,0,0.7))`,
            border: `1px solid ${world.borderColor}55`,
            borderRadius: '16px',
            marginBottom: '28px',
            overflow: 'hidden',
            boxShadow: `0 4px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)`,
          }}>
            {/* Map header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 0', zIndex: 2, position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '22px', filter: `drop-shadow(0 0 8px ${world.glowColor})` }}>{world.emoji}</span>
                <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '11px', fontWeight: 900, color: world.accentColor, letterSpacing: '0.18em' }}>
                  {world.name.toUpperCase()} · MISSION MAP
                </span>
              </div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.18em' }}>
                SELECT A MISSION MARKER
              </div>
            </div>

            {/* SVG Map */}
            <div style={{ position: 'relative', width: '100%', height: '110px' }}>
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              >
                {/* Dotted trail path */}
                <polyline
                  points={pathPoints}
                  fill="none"
                  stroke={`${world.accentColor}33`}
                  strokeWidth="0.5"
                  strokeDasharray="1.5 1.5"
                />
                {/* Glow trail */}
                <polyline
                  points={pathPoints}
                  fill="none"
                  stroke={`${world.accentColor}18`}
                  strokeWidth="1.5"
                />
              </svg>

              {/* Map nodes */}
              {MAP_NODES.map((node) => {
                const purpose = PURPOSES.find(p => p.id === node.id);
                if (!purpose) return null;
                const isSelected = selected?.id === node.id;
                const isHovered = hoveredNode === node.id;
                const active = isSelected || isHovered;
                return (
                  <button
                    key={node.id}
                    onClick={() => { playCoin(); setSelected(purpose); }}
                    onMouseEnter={() => { playHover(); setHoveredNode(node.id); }}
                    onMouseLeave={() => setHoveredNode(null)}
                    title={purpose.name}
                    style={{
                      position: 'absolute',
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: active ? '44px' : '36px',
                      height: active ? '44px' : '36px',
                      borderRadius: '50%',
                      background: isSelected
                        ? world.accentColor
                        : `${world.cardBg}`,
                      border: `2px solid ${isSelected ? world.accentColor : active ? `${world.accentColor}88` : `${world.borderColor}66`}`,
                      boxShadow: isSelected
                        ? `0 0 0 4px ${world.accentColor}33, 0 0 20px ${world.glowColor}88`
                        : active
                        ? `0 0 14px ${world.glowColor}66`
                        : `0 2px 8px rgba(0,0,0,0.6)`,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: active ? '20px' : '16px',
                      transition: 'all 0.2s ease',
                      zIndex: isSelected ? 5 : active ? 4 : 2,
                      outline: 'none',
                      filter: isSelected ? `drop-shadow(0 0 6px ${world.glowColor})` : 'none',
                    }}
                  >
                    {node.emoji}
                    {/* Tooltip */}
                    {active && (
                      <div style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginBottom: '6px',
                        background: 'rgba(0,0,0,0.92)',
                        border: `1px solid ${world.accentColor}55`,
                        borderRadius: '6px',
                        padding: '5px 10px',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        zIndex: 10,
                      }}>
                        <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '9px', color: world.accentColor, letterSpacing: '0.08em', marginBottom: '1px' }}>{purpose.name}</div>
                        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>{purpose.fieldCount > 0 ? `${purpose.fieldCount}+ fields` : 'blank canvas'}</div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Map legend */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', padding: '10px 20px 14px', borderTop: `1px solid ${world.borderColor}22` }}>
              {PURPOSES.map(p => (
                <div
                  key={p.id}
                  onClick={() => { playCoin(); setSelected(p); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', opacity: selected?.id === p.id ? 1 : 0.5, transition: 'opacity 0.18s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = selected?.id === p.id ? '1' : '0.5')}
                >
                  <span style={{ fontSize: '13px' }}>{p.emoji}</span>
                  <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', fontWeight: 700, color: selected?.id === p.id ? world.accentColor : 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', transition: 'color 0.18s' }}>{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ══════════ HEADER / AVATAR PROMPT ══════════ */}
          <div style={{ textAlign: 'center', marginBottom: '26px' }}>
            <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(16px, 3vw, 26px)', fontWeight: 900, color: '#fff', marginBottom: '14px', textShadow: `0 0 24px ${world.glowColor}55` }}>
              What is your mission, {avatar.name.split(' ')[0]}?
            </h2>
            <div style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '12px', maxWidth: '620px', background: `${avatar.color}0e`, border: `1px solid ${avatar.color}33`, borderRadius: '12px', padding: '13px 18px', textAlign: 'left' }}>
              <span style={{ fontSize: '26px', flexShrink: 0, filter: `drop-shadow(0 0 8px ${avatar.color})` }}>{avatar.emoji}</span>
              <p style={{ fontFamily: "'Exo 2', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, margin: 0 }}>{worldPrompt}</p>
            </div>
          </div>

          {/* ══════════ PURPOSE CARDS GRID ══════════ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '10px' }}>
            {PURPOSES.map((purpose, i) => {
              const isSelected = selected?.id === purpose.id;
              const isScratch = purpose.id === 'scratch';
              return (
                <button
                  key={purpose.id}
                  onClick={() => { playCoin(); setSelected(purpose); }}
                  style={{
                    background: isSelected
                      ? `${world.accentColor}16`
                      : isScratch
                      ? 'rgba(255,255,255,0.025)'
                      : world.cardBg,
                    border: `2px solid ${isSelected ? world.accentColor : isScratch ? 'rgba(255,255,255,0.1)' : `${world.borderColor}44`}`,
                    borderRadius: '13px',
                    padding: '18px 14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: '#fff',
                    outline: 'none',
                    position: 'relative',
                    overflow: 'hidden',
                    animation: `card-enter 0.3s ease-out ${i * 0.035}s both`,
                    boxShadow: isSelected ? `0 0 0 2px ${world.accentColor}44, 0 0 20px ${world.accentColor}28` : 'none',
                    transition: 'all 0.18s ease',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  }}
                  onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.border = `2px solid ${world.accentColor}55`; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.4), 0 0 14px ${world.glowColor}28`; } }}
                  onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.border = isScratch ? '2px solid rgba(255,255,255,0.1)' : `2px solid ${world.borderColor}44`; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; } }}
                >
                  {isSelected && <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 25% 25%, ${world.accentColor}12 0%, transparent 65%)`, pointerEvents: 'none' }} />}
                  {isSelected && <div style={{ position: 'absolute', top: '9px', right: '9px', width: '18px', height: '18px', borderRadius: '50%', background: world.accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 900, color: '#000' }}>✓</div>}

                  {/* Colour accent bar */}
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: isSelected ? world.accentColor : purpose.color, borderRadius: '13px 0 0 13px', opacity: isSelected ? 1 : 0.6 }} />

                  <div style={{ paddingLeft: '8px' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px', filter: isSelected ? `drop-shadow(0 0 10px ${world.glowColor})` : 'none', transition: 'filter 0.2s' }}>{purpose.emoji}</div>
                    <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '10px', fontWeight: 700, color: isSelected ? world.accentColor : '#fff', marginBottom: '3px', lineHeight: 1.3, transition: 'color 0.18s' }}>{purpose.name}</div>
                    <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '9px', fontWeight: 700, color: purpose.color, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '7px' }}>{purpose.tagline}</div>
                    <p style={{ fontFamily: "'Exo 2', sans-serif", fontSize: '9px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginBottom: '9px' }}>{purpose.description}</p>
                    {purpose.fieldCount > 0
                      ? <div style={{ display: 'inline-flex', alignItems: 'center', background: `${purpose.color}18`, border: `1px solid ${purpose.color}30`, borderRadius: '4px', padding: '2px 8px' }}>
                          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '9px', fontWeight: 700, color: purpose.color, letterSpacing: '0.1em' }}>{purpose.fieldCount}+ FIELDS</span>
                        </div>
                      : <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '4px', padding: '2px 8px' }}>
                          <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em' }}>BLANK CANVAS</span>
                        </div>
                    }
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════ STICKY BOTTOM BAR ══════════ */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${selected ? world.accentColor + '44' : 'rgba(255,255,255,0.07)'}`,
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', gap: '18px',
        zIndex: 30,
        transition: 'border-color 0.3s',
      }}>
        {selected ? (
          <>
            <span style={{ fontSize: '28px', filter: `drop-shadow(0 0 10px ${world.glowColor})` }}>{selected.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: '12px', fontWeight: 700, color: world.accentColor, marginBottom: '2px' }}>{selected.name}</div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.1em' }}>
                {selected.fieldCount > 0 ? `${selected.fieldCount}+ pre-built fields · "${selected.suggestedTitle}"` : 'Blank canvas — every field is yours to place'}
              </div>
            </div>
            {selected.fieldCount > 0 && (
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', maxWidth: '260px' }}>
                {selected.buildFields().slice(0, 5).map((f, i) => (
                  <span key={i} style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '8px', fontWeight: 700, color: `${world.accentColor}99`, background: `${world.accentColor}0e`, border: `1px solid ${world.accentColor}22`, borderRadius: '3px', padding: '2px 6px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {f.type === 'section' ? `✦ ${f.label}` : f.label || f.type}
                  </span>
                ))}
                {selected.fieldCount > 5 && <span style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '8px', color: 'rgba(255,255,255,0.25)', padding: '2px 3px' }}>+more</span>}
              </div>
            )}
            <button
              onClick={handleAccept}
              disabled={launching}
              className="tr-btn"
              style={{
                background: world.buttonGradient, color: world.buttonText,
                border: 'none', borderRadius: '8px',
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: '12px', fontWeight: 700,
                padding: '13px 28px',
                cursor: launching ? 'not-allowed' : 'pointer',
                letterSpacing: '0.12em',
                boxShadow: `0 0 22px ${world.glowColor}77, 0 4px 18px rgba(0,0,0,0.4)`,
                animation: 'pulse-glow 2s ease-in-out infinite',
                flexShrink: 0,
                opacity: launching ? 0.6 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {launching ? '⚡ PREPARING...' : '⚡ ACCEPT MISSION'}
            </button>
          </>
        ) : (
          <div style={{ flex: 1, textAlign: 'center', fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.14em' }}>
            🗺️ CLICK A MARKER ON THE MAP OR SELECT A MISSION CARD ABOVE
          </div>
        )}
      </div>
    </div>
  );
}
