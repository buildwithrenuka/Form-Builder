import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { FormVerseLogo } from './Logo';
import { trpc } from '../trpc';
import type { HomeTheme } from './HomePage';

type Props = {
  onBack: () => void;
  onLogout: () => void;
  theme: HomeTheme;
};

type AdminPalette = {
  bg: string;
  gridLine1: string;
  gridLine2: string;
  gridSize: string;
  navBg: string;
  navBorder: string;
  navDivider: string;
  panel: string;
  panelAlt: string;
  panelBorder: string;
  text: string;
  muted: string;
  faint: string;
  accentPrimary: string;
  accentSecondary: string;
  accentTertiary: string;
  accentQuaternary: string;
  accentPositive: string;
  accentDanger: string;
  auraA: string;
  auraB: string;
  auraC: string;
  chipBg: string;
  chipBorder: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
};

const ADMIN_THEMES: Record<HomeTheme, AdminPalette> = {
  dark: {
    bg: '#060014',
    gridLine1: 'rgba(124,58,237,0.03)',
    gridLine2: 'rgba(124,58,237,0.03)',
    gridSize: '72px 72px',
    navBg: 'rgba(6,0,20,0.9)',
    navBorder: 'rgba(124,58,237,0.12)',
    navDivider: 'rgba(124,58,237,0.2)',
    panel: 'rgba(255,255,255,0.025)',
    panelAlt: 'rgba(255,255,255,0.02)',
    panelBorder: 'rgba(255,255,255,0.07)',
    text: '#ffffff',
    muted: 'rgba(167,139,250,0.55)',
    faint: 'rgba(167,139,250,0.38)',
    accentPrimary: '#7c3aed',
    accentSecondary: '#a78bfa',
    accentTertiary: '#00e5ff',
    accentQuaternary: '#ffd700',
    accentPositive: '#22c55e',
    accentDanger: '#ff8f8f',
    auraA: 'radial-gradient(circle at 12% 18%, rgba(124,58,237,0.18), transparent 35%)',
    auraB: 'radial-gradient(circle at 82% 16%, rgba(0,229,255,0.12), transparent 30%)',
    auraC: 'radial-gradient(circle at 58% 78%, rgba(255,215,0,0.1), transparent 28%)',
    chipBg: 'rgba(255,255,255,0.04)',
    chipBorder: 'rgba(255,255,255,0.08)',
    inputBg: 'rgba(255,255,255,0.05)',
    inputBorder: 'rgba(255,255,255,0.12)',
    inputText: '#ffffff',
  },
  light: {
    bg: '#fff6e8',
    gridLine1: 'rgba(17,17,17,0.03)',
    gridLine2: 'rgba(204,68,0,0.03)',
    gridSize: '72px 72px',
    navBg: 'rgba(255,248,235,0.92)',
    navBorder: 'rgba(17,17,17,0.08)',
    navDivider: 'rgba(17,17,17,0.12)',
    panel: 'rgba(255,255,255,0.72)',
    panelAlt: 'rgba(255,255,255,0.64)',
    panelBorder: 'rgba(17,17,17,0.09)',
    text: '#111111',
    muted: 'rgba(17,17,17,0.58)',
    faint: 'rgba(17,17,17,0.4)',
    accentPrimary: '#111111',
    accentSecondary: '#cc4400',
    accentTertiary: '#0088cc',
    accentQuaternary: '#c58b00',
    accentPositive: '#1f8f4a',
    accentDanger: '#d15252',
    auraA: 'radial-gradient(circle at 12% 18%, rgba(255,170,80,0.16), transparent 34%)',
    auraB: 'radial-gradient(circle at 82% 16%, rgba(255,214,92,0.12), transparent 28%)',
    auraC: 'radial-gradient(circle at 58% 78%, rgba(255,140,0,0.1), transparent 26%)',
    chipBg: 'rgba(17,17,17,0.04)',
    chipBorder: 'rgba(17,17,17,0.1)',
    inputBg: 'rgba(255,255,255,0.88)',
    inputBorder: 'rgba(17,17,17,0.12)',
    inputText: '#111111',
  },
  rainbow: {
    bg: 'linear-gradient(160deg, #120020 0%, #07143d 34%, #1c0838 62%, #150010 100%)',
    gridLine1: 'rgba(255,0,200,0.05)',
    gridLine2: 'rgba(0,255,200,0.04)',
    gridSize: '72px 72px',
    navBg: 'rgba(12,0,30,0.9)',
    navBorder: 'rgba(255,255,255,0.14)',
    navDivider: 'rgba(255,255,255,0.18)',
    panel: 'linear-gradient(160deg, rgba(255,79,216,0.08), rgba(124,58,237,0.08), rgba(0,229,255,0.07))',
    panelAlt: 'rgba(255,255,255,0.03)',
    panelBorder: 'rgba(255,255,255,0.12)',
    text: '#fff8ff',
    muted: 'rgba(231,220,255,0.68)',
    faint: 'rgba(231,220,255,0.44)',
    accentPrimary: '#ff4fd8',
    accentSecondary: '#8f5bff',
    accentTertiary: '#00e5ff',
    accentQuaternary: '#ffee55',
    accentPositive: '#9cff66',
    accentDanger: '#ff9bc7',
    auraA: 'radial-gradient(circle at 14% 18%, rgba(255,79,216,0.2), transparent 34%)',
    auraB: 'radial-gradient(circle at 82% 16%, rgba(0,229,255,0.16), transparent 30%)',
    auraC: 'radial-gradient(circle at 56% 80%, rgba(156,255,102,0.12), transparent 28%)',
    chipBg: 'rgba(255,255,255,0.05)',
    chipBorder: 'rgba(255,255,255,0.12)',
    inputBg: 'rgba(255,255,255,0.06)',
    inputBorder: 'rgba(255,255,255,0.16)',
    inputText: '#fff8ff',
  },
  firecracker: {
    bg: 'linear-gradient(160deg, #170300 0%, #090100 46%, #040000 100%)',
    gridLine1: 'rgba(255,90,0,0.05)',
    gridLine2: 'rgba(255,180,0,0.04)',
    gridSize: '72px 72px',
    navBg: 'rgba(12,2,0,0.92)',
    navBorder: 'rgba(255,140,0,0.14)',
    navDivider: 'rgba(255,180,0,0.18)',
    panel: 'linear-gradient(160deg, rgba(255,90,0,0.08), rgba(255,160,0,0.06))',
    panelAlt: 'rgba(255,255,255,0.025)',
    panelBorder: 'rgba(255,180,0,0.1)',
    text: '#fff6ea',
    muted: 'rgba(255,210,170,0.62)',
    faint: 'rgba(255,210,170,0.42)',
    accentPrimary: '#ff5a00',
    accentSecondary: '#ff9d00',
    accentTertiary: '#ffd000',
    accentQuaternary: '#ffbf6b',
    accentPositive: '#ffd95e',
    accentDanger: '#ffb39d',
    auraA: 'radial-gradient(circle at 14% 18%, rgba(255,90,0,0.18), transparent 34%)',
    auraB: 'radial-gradient(circle at 82% 16%, rgba(255,184,0,0.14), transparent 30%)',
    auraC: 'radial-gradient(circle at 56% 80%, rgba(255,120,0,0.12), transparent 28%)',
    chipBg: 'rgba(255,255,255,0.04)',
    chipBorder: 'rgba(255,180,0,0.12)',
    inputBg: 'rgba(255,255,255,0.05)',
    inputBorder: 'rgba(255,180,0,0.14)',
    inputText: '#fff6ea',
  },
  jugnu: {
    bg: 'linear-gradient(160deg, #081000 0%, #050900 46%, #020400 100%)',
    gridLine1: 'rgba(255,214,92,0.035)',
    gridLine2: 'rgba(184,255,120,0.03)',
    gridSize: '72px 72px',
    navBg: 'rgba(4,8,0,0.92)',
    navBorder: 'rgba(255,214,92,0.12)',
    navDivider: 'rgba(255,214,92,0.16)',
    panel: 'linear-gradient(160deg, rgba(255,214,92,0.06), rgba(184,255,120,0.04))',
    panelAlt: 'rgba(255,255,255,0.02)',
    panelBorder: 'rgba(255,214,92,0.08)',
    text: '#fff7d6',
    muted: 'rgba(255,235,178,0.58)',
    faint: 'rgba(255,235,178,0.38)',
    accentPrimary: '#ffd65c',
    accentSecondary: '#fff0a6',
    accentTertiary: '#cfff8c',
    accentQuaternary: '#c58b00',
    accentPositive: '#b5ff78',
    accentDanger: '#ffe6a6',
    auraA: 'radial-gradient(circle at 14% 18%, rgba(255,214,92,0.14), transparent 34%)',
    auraB: 'radial-gradient(circle at 82% 16%, rgba(255,240,150,0.12), transparent 30%)',
    auraC: 'radial-gradient(circle at 56% 80%, rgba(184,255,120,0.1), transparent 28%)',
    chipBg: 'rgba(255,214,92,0.05)',
    chipBorder: 'rgba(255,214,92,0.1)',
    inputBg: 'rgba(255,255,255,0.04)',
    inputBorder: 'rgba(255,214,92,0.12)',
    inputText: '#fff7d6',
  },
};

function formatDelta(current: number, previous: number): string {
  const delta = current - previous;
  if (delta === 0) return '0';
  return `${delta > 0 ? '+' : ''}${delta}`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatCompact(value: number): string {
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

function buildLine(points: number[], width: number, height: number, maxValue: number): string {
  if (points.length === 0) return '';
  const safeMax = Math.max(maxValue, 1);

  return points.map((point, index) => {
    const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
    const y = height - ((point / safeMax) * height);
    return `${x},${y}`;
  }).join(' ');
}

function withAlpha(hex: string, alphaHex: string): string {
  return hex.startsWith('#') ? `${hex}${alphaHex}` : hex;
}

function chartColors(palette: AdminPalette): [string, string, string, string, string] {
  return [palette.accentPrimary, palette.accentSecondary, palette.accentTertiary, palette.accentQuaternary, palette.accentPositive];
}

function StatCard({ icon, label, value, hint, color, palette }: { icon: string; label: string; value: number | string; hint?: string; color: string; palette: AdminPalette }) {
  return (
    <section style={{ background: palette.panel, border: `1px solid ${palette.panelBorder}`, borderRadius: 18, padding: '18px 18px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: palette.faint, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
          <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 24, color, marginBottom: 6 }}>{value}</div>
          {hint ? <div style={{ fontSize: 12, color: palette.muted }}>{hint}</div> : null}
        </div>
        <div style={{ minWidth: 46, height: 46, borderRadius: 14, display: 'grid', placeItems: 'center', background: `linear-gradient(135deg, ${withAlpha(color, '24')}, ${withAlpha(color, '10')})`, border: `1px solid ${withAlpha(color, '36')}`, boxShadow: `inset 0 1px 0 ${withAlpha('#ffffff', '18')}` }}>
          <div style={{ fontSize: 19, fontWeight: 800, color }}>{icon}</div>
        </div>
      </div>
    </section>
  );
}

function TrendCard({ title, value, delta, accent, palette }: { title: string; value: number | string; delta: string; accent: string; palette: AdminPalette }) {
  return (
    <section style={{ background: palette.panel, border: `1px solid ${palette.panelBorder}`, borderRadius: 18, padding: '18px' }}>
      <div style={{ fontSize: 11, color: palette.faint, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>{title}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 12 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: accent }}>{value}</div>
        <div style={{ fontSize: 12, color: accent, fontWeight: 700 }}>{delta}</div>
      </div>
    </section>
  );
}

function GaugeCard({ title, value, accent, palette }: { title: string; value: number; accent: string; palette: AdminPalette }) {
  const colors = chartColors(palette);
  const ring = `conic-gradient(${colors[0]} 0deg, ${colors[1]} 72deg, ${colors[2]} 144deg, ${colors[3]} 216deg, ${colors[4]} ${value * 3.6}deg, rgba(255,255,255,0.08) 0deg)`;

  return (
    <section style={{ background: palette.panel, border: `1px solid ${palette.panelBorder}`, borderRadius: 18, padding: '18px' }}>
      <div style={{ fontSize: 11, color: palette.faint, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 78, height: 78, borderRadius: '50%', background: ring, display: 'grid', placeItems: 'center', boxShadow: `0 0 20px ${withAlpha(accent, '22')}` }}>
          <div style={{ width: 54, height: 54, borderRadius: '50%', background: palette.bg, display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 800, color: accent }}>
            {formatPercent(value)}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineChart({ timeline, palette }: { timeline: Array<{ date: string; users: number; forms: number; responses: number }>; palette: AdminPalette }) {
  const colors = chartColors(palette);
  const metrics = [
    { key: 'users', label: 'Users', color: colors[2], values: timeline.map((entry) => entry.users) },
    { key: 'forms', label: 'Forms', color: colors[1], values: timeline.map((entry) => entry.forms) },
    { key: 'responses', label: 'Responses', color: colors[4], values: timeline.map((entry) => entry.responses) },
  ] as const;

  const peaks = {
    users: Math.max(...timeline.map((entry) => entry.users), 0),
    forms: Math.max(...timeline.map((entry) => entry.forms), 0),
    responses: Math.max(...timeline.map((entry) => entry.responses), 0),
  };

  const totals = {
    users: timeline.reduce((sum, entry) => sum + entry.users, 0),
    forms: timeline.reduce((sum, entry) => sum + entry.forms, 0),
    responses: timeline.reduce((sum, entry) => sum + entry.responses, 0),
  };

  function intensityColor(base: string, value: number, max: number): string {
    if (value <= 0 || max <= 0) return withAlpha(base, '10');
    const ratio = value / max;
    if (ratio < 0.2) return withAlpha(base, '24');
    if (ratio < 0.4) return withAlpha(base, '38');
    if (ratio < 0.6) return withAlpha(base, '52');
    if (ratio < 0.8) return withAlpha(base, '72');
    return withAlpha(base, '99');
  }

  return (
    <section style={{ background: palette.panel, border: `1px solid ${palette.panelBorder}`, borderRadius: 20, padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(circle at top left, ${withAlpha(colors[2], '20')}, transparent 34%), radial-gradient(circle at 82% 18%, ${withAlpha(colors[1], '18')}, transparent 28%), radial-gradient(circle at 52% 100%, ${withAlpha(colors[4], '16')}, transparent 34%)` }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 16, color: palette.text }}>Activity</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'Users', value: peaks.users, color: colors[2] },
            { label: 'Forms', value: peaks.forms, color: colors[1] },
            { label: 'Responses', value: peaks.responses, color: colors[4] },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 999, border: `1px solid ${palette.chipBorder}`, background: palette.chipBg }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, boxShadow: `0 0 10px ${withAlpha(item.color, '66')}` }} />
              <span style={{ fontSize: 11, color: palette.faint, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{item.label}</span>
              <span style={{ fontSize: 12, color: palette.text, fontWeight: 800 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ border: `1px solid ${palette.panelBorder}`, borderRadius: 18, overflow: 'hidden', background: `linear-gradient(180deg, ${withAlpha(colors[0], '10')} 0%, ${withAlpha(colors[4], '08')} 100%)`, boxShadow: `inset 0 1px 0 ${withAlpha('#ffffff', '12')}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: `120px repeat(${timeline.length}, minmax(0, 1fr)) 88px`, gap: 8, padding: '12px 14px', background: `linear-gradient(90deg, ${withAlpha(colors[0], '16')}, ${withAlpha(colors[4], '10')})`, fontSize: 11, color: palette.faint, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          <div>Signal</div>
          {timeline.map((entry) => (
            <div key={`${entry.date}-head`} style={{ textAlign: 'center' }}>
              {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
          ))}
          <div style={{ textAlign: 'right' }}>Total</div>
        </div>
        <div style={{ display: 'grid', gap: 0 }}>
          {metrics.map((metric, rowIndex) => {
            const max = Math.max(...metric.values, 0);
            const total = totals[metric.key];
            return (
              <div key={metric.key} style={{ display: 'grid', gridTemplateColumns: `120px repeat(${timeline.length}, minmax(0, 1fr)) 88px`, gap: 8, padding: '14px', borderTop: rowIndex === 0 ? 'none' : `1px solid ${palette.panelBorder}`, alignItems: 'center', background: rowIndex % 2 === 0 ? `linear-gradient(90deg, ${withAlpha(metric.color, '12')}, ${withAlpha(metric.color, '06')})` : `linear-gradient(90deg, ${withAlpha(metric.color, '0d')}, transparent)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: metric.color, boxShadow: `0 0 10px ${withAlpha(metric.color, '66')}` }} />
                  <div>
                    <div style={{ fontSize: 13, color: palette.text, fontWeight: 700 }}>{metric.label}</div>
                    <div style={{ fontSize: 11, color: palette.faint }}>Peak {max}</div>
                  </div>
                </div>
                {metric.values.map((value, index) => (
                  <div key={`${metric.key}-${timeline[index]?.date ?? index}`} style={{ display: 'grid', placeItems: 'center' }}>
                    <div style={{ width: '100%', aspectRatio: '1 / 1', minHeight: 24, borderRadius: 10, background: value > 0 ? `linear-gradient(180deg, ${withAlpha('#ffffff', '12')}, transparent), ${intensityColor(metric.color, value, max)}` : `linear-gradient(180deg, ${withAlpha(metric.color, '12')}, ${withAlpha(metric.color, '08')})`, border: `1px solid ${withAlpha(metric.color, value > 0 ? '44' : '12')}`, boxShadow: value > 0 ? `inset 0 1px 0 ${withAlpha('#ffffff', '24')}, 0 8px 16px ${withAlpha(metric.color, '16')}` : 'none', display: 'grid', placeItems: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: value > 0 ? palette.text : palette.faint }}>{value || ''}</span>
                    </div>
                  </div>
                ))}
                <div style={{ textAlign: 'right', fontSize: 13, color: metric.color, fontWeight: 800 }}>{total}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 12, fontSize: 11, color: palette.faint }}>
        <div>14-day activity matrix</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Low</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[0.18, 0.34, 0.56, 0.8].map((opacity) => (
              <span key={opacity} style={{ width: 18, height: 10, borderRadius: 999, background: `rgba(255,255,255,${opacity})`, border: `1px solid ${palette.panelBorder}` }} />
            ))}
          </div>
          <span>High</span>
        </div>
      </div>
      </div>
    </section>
  );
}

function TopFormsChart({ forms, palette }: { forms: Array<{ id: string; title: string; slug: string; visibility: string; published: boolean; creatorName: string; creatorEmail: string; responseCount: number }>; palette: AdminPalette }) {
  const maxResponses = Math.max(...forms.map((form) => form.responseCount), 1);
  const colors = chartColors(palette);

  return (
    <section style={{ background: palette.panel, border: `1px solid ${palette.panelBorder}`, borderRadius: 20, padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(circle at top right, ${withAlpha(colors[0], '20')}, transparent 34%), radial-gradient(circle at 10% 80%, ${withAlpha(colors[3], '18')}, transparent 32%)` }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 16, color: palette.text, marginBottom: 14 }}>Top Forms</div>
      <div style={{ display: 'grid', gap: 10 }}>
        {forms.map((form, index) => {
          const start = colors[index % colors.length];
          const end = colors[(index + 2) % colors.length];
          return (
            <div key={form.id} style={{ border: `1px solid ${palette.panelBorder}`, borderRadius: 14, padding: '14px', background: `linear-gradient(135deg, ${withAlpha(start, '12')}, ${withAlpha(end, '0c')})`, boxShadow: `inset 0 1px 0 ${withAlpha('#ffffff', '12')}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 13, color: palette.text, fontWeight: 700 }}>{form.title}</div>
                <div style={{ fontSize: 12, color: start, fontWeight: 800 }}>{form.responseCount}</div>
              </div>
              <div style={{ height: 10, background: `linear-gradient(90deg, ${withAlpha(start, '18')}, ${withAlpha(end, '10')})`, borderRadius: 999, overflow: 'hidden', marginBottom: 6, border: `1px solid ${withAlpha(start, '18')}` }}>
                <div style={{ width: `${(form.responseCount / maxResponses) * 100}%`, minWidth: form.responseCount > 0 ? 10 : 0, height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${start}, ${end})`, boxShadow: `0 0 14px ${withAlpha(start, '36')}` }} />
              </div>
              <div style={{ fontSize: 11, color: palette.faint }}>{form.slug}</div>
            </div>
          );
        })}
      </div>
      </div>
    </section>
  );
}

function FeedCard({ palette, title, items }: { palette: AdminPalette; title: string; items: Array<{ id: string; headline: string; subline: string; meta: string; tags?: Array<{ label: string; color: string; border: string }> }> }) {
  return (
    <section style={{ background: palette.panel, border: `1px solid ${palette.panelBorder}`, borderRadius: 20, padding: '20px' }}>
      <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 16, color: palette.text, marginBottom: 14 }}>{title}</div>
      <div style={{ display: 'grid', gap: 10 }}>
        {items.map((item) => (
          <div key={item.id} style={{ border: `1px solid ${palette.panelBorder}`, borderRadius: 14, padding: '13px 14px', background: palette.panelAlt }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 13, color: palette.text, fontWeight: 700 }}>{item.headline}</div>
              {item.tags && item.tags.length > 0 ? (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {item.tags.map((tag) => (
                    <span key={tag.label} style={{ fontSize: 10, color: tag.color, border: `1px solid ${tag.border}`, borderRadius: 999, padding: '2px 8px' }}>{tag.label}</span>
                  ))}
                </div>
              ) : null}
            </div>
            <div style={{ fontSize: 12, color: palette.muted }}>{item.subline}</div>
            <div style={{ fontSize: 11, color: palette.faint, marginTop: 4 }}>{item.meta}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ManagementStat({ palette, label, value, accent }: { palette: AdminPalette; label: string; value: string | number; accent: string }) {
  return (
    <div style={{ border: `1px solid ${palette.panelBorder}`, borderRadius: 16, padding: '14px 16px', background: palette.panelAlt }}>
      <div style={{ fontSize: 10, color: palette.faint, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: accent }}>{value}</div>
    </div>
  );
}

function SectionShell({ palette, title, children }: { palette: AdminPalette; title: string; children: JSX.Element | JSX.Element[] }) {
  return (
    <section style={{ background: palette.panel, border: `1px solid ${palette.panelBorder}`, borderRadius: 20, padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 16, color: palette.text }}>{title}</div>
      </div>
      {children}
    </section>
  );
}

function SectionTabButton({ palette, label, active, accent, onClick }: { palette: AdminPalette; label: string; active: boolean; accent: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: `1px solid ${active ? `${accent}66` : palette.panelBorder}`,
        borderRadius: 18,
        padding: '16px',
        background: active ? `${accent}16` : palette.panelAlt,
        color: active ? accent : palette.text,
        fontSize: 16,
        fontWeight: 800,
        cursor: 'pointer',
        fontFamily: "'Rajdhani', sans-serif",
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        boxShadow: active ? `0 0 18px ${withAlpha(accent, '22')}` : 'none',
      }}
    >
      {label}
    </button>
  );
}

export function AdminDashboardPage({ onBack, onLogout, theme }: Props) {
  const C = ADMIN_THEMES[theme];
  const [activeSection, setActiveSection] = useState<'platform' | 'growth' | 'activity' | 'users'>('platform');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState<12 | 24 | 48>(12);
  const deferredUserSearch = useDeferredValue(userSearch);
  const { data, isLoading, error, refetch } = trpc.admin.overview.useQuery();
  const { data: currentUser } = trpc.auth.me.useQuery();
  const userQueryInput = useMemo(() => ({
    query: deferredUserSearch.trim() || undefined,
    role: userRoleFilter,
    page: userPage,
    pageSize: userPageSize,
  }), [deferredUserSearch, userPage, userPageSize, userRoleFilter]);
  const { data: managedUsers, isLoading: usersLoading, refetch: refetchUsers } = trpc.admin.users.useQuery(userQueryInput);
  const setUserRole = trpc.admin.setUserRole.useMutation({
    onSuccess: async () => {
      await Promise.all([refetch(), refetchUsers()]);
    },
  });

  useEffect(() => {
    setUserPage(1);
  }, [deferredUserSearch, userPageSize, userRoleFilter]);

  async function handleRoleChange(userId: string, role: 'user' | 'admin') {
    await setUserRole.mutateAsync({ userId, role });
  }

  const recentUserFeed = data?.recentUsers.map((user) => ({
    id: user.id,
    headline: user.name,
    subline: user.email,
    meta: new Date(user.createdAt).toLocaleString(),
  })) ?? [];

  const recentFormFeed = data?.recentForms.map((form) => ({
    id: form.id,
    headline: form.title,
    subline: `${form.creatorName} · ${form.creatorEmail}`,
    meta: `${form.slug} · ${new Date(form.createdAt).toLocaleString()}`,
    tags: [
      ...(form.archived ? [{ label: 'ARCHIVED', color: C.accentPrimary, border: `${C.accentPrimary}4d` }] : []),
      ...(form.published ? [{ label: 'PUBLISHED', color: C.accentPositive, border: `${C.accentPositive}4d` }] : []),
      { label: form.visibility.toUpperCase(), color: C.accentTertiary, border: `${C.accentTertiary}40` },
    ],
  })) ?? [];

  return (
    <div style={{ position: 'fixed', inset: 0, background: C.bg, overflowY: 'auto', fontFamily: "'Rajdhani', sans-serif" }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: `${C.auraA}, ${C.auraB}, ${C.auraC}` }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: `linear-gradient(${C.gridLine1} 1px, transparent 1px), linear-gradient(90deg, ${C.gridLine2} 1px, transparent 1px)`, backgroundSize: C.gridSize }} />

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: C.navBg, backdropFilter: 'blur(24px)', borderBottom: `1px solid ${C.navBorder}`, padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <FormVerseLogo size={28} textSize={11} variant={theme} />
          <div style={{ width: 1, height: 20, background: C.navDivider }} />
          <div style={{ fontSize: 12, fontWeight: 700, color: C.accentQuaternary, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Admin Dashboard</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={onBack} style={{ background: 'transparent', border: `1px solid ${C.chipBorder}`, borderRadius: 8, color: C.accentSecondary, fontSize: 12, fontWeight: 600, padding: '7px 14px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif" }}>← Back</button>
          <button onClick={onLogout} style={{ background: 'transparent', border: `1px solid ${C.accentDanger}4d`, borderRadius: 8, color: C.accentDanger, fontSize: 12, fontWeight: 600, padding: '7px 14px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif" }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto', padding: '24px 24px 80px' }}>
        {isLoading ? <div style={{ color: C.muted, fontSize: 14 }}>Loading...</div> : null}

        {!isLoading && error ? (
          <div style={{ padding: '22px 24px', background: `${C.accentDanger}12`, border: `1px solid ${C.accentDanger}38`, borderRadius: 14 }}>
            <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 16, color: C.text, marginBottom: 8 }}>Admin access failed</div>
            <div style={{ fontSize: 13, color: C.accentDanger, marginBottom: 14 }}>{error.message || 'You do not have access to admin data.'}</div>
            <button onClick={() => void refetch()} style={{ background: C.chipBg, border: `1px solid ${C.chipBorder}`, borderRadius: 8, color: C.text, fontSize: 12, fontWeight: 700, padding: '9px 14px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif" }}>Retry</button>
          </div>
        ) : null}

        {!isLoading && !error && data ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 18 }}>
              <SectionTabButton palette={C} label="Platform" active={activeSection === 'platform'} accent={C.accentTertiary} onClick={() => setActiveSection('platform')} />
              <SectionTabButton palette={C} label="Growth" active={activeSection === 'growth'} accent={C.accentSecondary} onClick={() => setActiveSection('growth')} />
              <SectionTabButton palette={C} label="Activity" active={activeSection === 'activity'} accent={C.accentPositive} onClick={() => setActiveSection('activity')} />
              <SectionTabButton palette={C} label="Users" active={activeSection === 'users'} accent={C.accentQuaternary} onClick={() => setActiveSection('users')} />
            </div>

            <div style={{ display: 'grid', gap: 18 }}>
              {activeSection === 'platform' ? (
              <SectionShell palette={C} title="Platform Snapshot">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                  <StatCard icon="◈" label="Users" value={formatCompact(data.totals.users)} hint={`${data.analytics.last7Days.users} new`} color={C.accentTertiary} palette={C} />
                  <StatCard icon="✦" label="Forms" value={formatCompact(data.totals.forms)} hint={`${data.analytics.last7Days.forms} new`} color={C.accentSecondary} palette={C} />
                  <StatCard icon="⬢" label="Responses" value={formatCompact(data.totals.responses)} hint={`${data.analytics.last7Days.responses} new`} color={C.accentPositive} palette={C} />
                  <StatCard icon="◎" label="Public" value={data.totals.publicForms} hint={formatPercent(data.analytics.rates.publicRate)} color={C.accentQuaternary} palette={C} />
                  <StatCard icon="✳" label="Published" value={data.totals.publishedForms} hint={formatPercent(data.analytics.rates.publishRate)} color={C.accentPrimary} palette={C} />
                </div>
              </SectionShell>
              ) : null}

              {activeSection === 'growth' ? (
              <SectionShell palette={C} title="Growth and Efficiency">
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(260px, 0.9fr)', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                    <TrendCard title="Users" value={data.analytics.last7Days.users} delta={formatDelta(data.analytics.last7Days.users, data.analytics.previous7Days.users)} accent={C.accentTertiary} palette={C} />
                    <TrendCard title="Forms" value={data.analytics.last7Days.forms} delta={formatDelta(data.analytics.last7Days.forms, data.analytics.previous7Days.forms)} accent={C.accentSecondary} palette={C} />
                    <TrendCard title="Responses" value={data.analytics.last7Days.responses} delta={formatDelta(data.analytics.last7Days.responses, data.analytics.previous7Days.responses)} accent={C.accentPositive} palette={C} />
                    <StatCard icon="◍" label="Responses / Form" value={data.analytics.averages.responsesPerForm} color={C.accentPositive} palette={C} />
                    <StatCard icon="⬡" label="Responses / Published" value={data.analytics.averages.responsesPerPublishedForm} color={C.accentQuaternary} palette={C} />
                    <StatCard icon="◒" label="Forms / User" value={data.analytics.averages.formsPerUser} color={C.accentTertiary} palette={C} />
                  </div>
                  <div style={{ display: 'grid', gap: 14 }}>
                    <GaugeCard title="Publish Rate" value={data.analytics.rates.publishRate} accent={C.accentQuaternary} palette={C} />
                    <GaugeCard title="Public Rate" value={data.analytics.rates.publicRate} accent={C.accentTertiary} palette={C} />
                  </div>
                </div>
              </SectionShell>
              ) : null}

              {activeSection === 'activity' ? (
              <SectionShell palette={C} title="Activity and Content">
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(320px, 1fr)', gap: 18, marginBottom: 18 }}>
                    <TimelineChart timeline={data.analytics.timeline} palette={C} />
                    <TopFormsChart forms={data.analytics.topForms} palette={C} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
                    <FeedCard palette={C} title="Recent Users" items={recentUserFeed} />
                    <FeedCard palette={C} title="Recent Forms" items={recentFormFeed} />
                  </div>
                </>
              </SectionShell>
              ) : null}

              {activeSection === 'users' ? (
              <SectionShell palette={C} title="User Management">
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginBottom: 16 }}>
                    <ManagementStat palette={C} label="All Users" value={managedUsers?.overallTotal ?? '...'} accent={C.accentTertiary} />
                    <ManagementStat palette={C} label="Admins" value={managedUsers?.adminTotal ?? '...'} accent={C.accentQuaternary} />
                    <ManagementStat palette={C} label="Members" value={managedUsers?.memberTotal ?? '...'} accent={C.accentPositive} />
                  </div>

                  <div style={{ border: `1px solid ${C.panelBorder}`, borderRadius: 16, background: C.panelAlt, padding: '14px 16px', marginBottom: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1.4fr) minmax(140px, 0.7fr) minmax(140px, 0.7fr)', gap: 10 }}>
                      <input
                        value={userSearch}
                        onChange={(event) => setUserSearch(event.target.value)}
                        placeholder="Search by name or email"
                        style={{ minWidth: 0, background: C.inputBg, border: `1px solid ${C.inputBorder}`, borderRadius: 10, color: C.inputText, padding: '10px 12px', fontSize: 13, outline: 'none', fontFamily: "'Rajdhani', sans-serif" }}
                      />
                      <select
                        value={userRoleFilter}
                        onChange={(event) => setUserRoleFilter(event.target.value as 'all' | 'user' | 'admin')}
                        style={{ minWidth: 0, background: C.inputBg, border: `1px solid ${C.inputBorder}`, borderRadius: 10, color: C.inputText, padding: '10px 12px', fontSize: 13, outline: 'none', fontFamily: "'Rajdhani', sans-serif" }}
                      >
                        <option value="all">All roles</option>
                        <option value="admin">Admins</option>
                        <option value="user">Users</option>
                      </select>
                      <select
                        value={String(userPageSize)}
                        onChange={(event) => setUserPageSize(Number(event.target.value) as 12 | 24 | 48)}
                        style={{ minWidth: 0, background: C.inputBg, border: `1px solid ${C.inputBorder}`, borderRadius: 10, color: C.inputText, padding: '10px 12px', fontSize: 13, outline: 'none', fontFamily: "'Rajdhani', sans-serif" }}
                      >
                        <option value="12">12 / page</option>
                        <option value="24">24 / page</option>
                        <option value="48">48 / page</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14, fontSize: 12, color: C.muted }}>
                    <div>{managedUsers ? `${managedUsers.total} matching${managedUsers.total !== 1 ? ' users' : ' user'}` : 'Users'}</div>
                    <div>{managedUsers ? `Page ${managedUsers.page} / ${managedUsers.totalPages}` : null}</div>
                  </div>

                  {usersLoading ? <div style={{ color: C.muted, fontSize: 13 }}>Loading...</div> : null}

                  {!usersLoading ? (
                    <div style={{ border: `1px solid ${C.panelBorder}`, borderRadius: 16, overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1.5fr) minmax(120px, 0.7fr) minmax(170px, 0.9fr) minmax(140px, 0.7fr)', gap: 12, padding: '12px 16px', background: C.chipBg, fontSize: 11, color: C.faint, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        <div>User</div>
                        <div>Role</div>
                        <div>Joined</div>
                        <div style={{ textAlign: 'right' }}>Action</div>
                      </div>
                      <div style={{ display: 'grid', gap: 0 }}>
                        {managedUsers?.items.map((user) => {
                          const isCurrentUser = currentUser?.id === user.id;
                          const isBusy = setUserRole.isPending && setUserRole.variables?.userId === user.id;
                          const nextRole = user.role === 'admin' ? 'user' : 'admin';

                          return (
                            <div key={user.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 1.5fr) minmax(120px, 0.7fr) minmax(170px, 0.9fr) minmax(140px, 0.7fr)', gap: 12, alignItems: 'center', padding: '14px 16px', background: C.panelAlt, borderTop: `1px solid ${C.panelBorder}` }}>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                                  <div style={{ fontSize: 14, color: C.text, fontWeight: 700 }}>{user.name}</div>
                                  {isCurrentUser ? <span style={{ fontSize: 10, color: C.accentSecondary, border: `1px solid ${C.accentSecondary}4d`, borderRadius: 999, padding: '2px 8px', letterSpacing: '0.08em' }}>YOU</span> : null}
                                </div>
                                <div style={{ fontSize: 12, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                              </div>
                              <div>
                                <span style={{ fontSize: 10, color: user.role === 'admin' ? C.accentQuaternary : C.accentTertiary, border: `1px solid ${user.role === 'admin' ? `${C.accentQuaternary}4d` : `${C.accentTertiary}40`}`, borderRadius: 999, padding: '4px 8px', letterSpacing: '0.08em' }}>{user.role.toUpperCase()}</span>
                              </div>
                              <div style={{ fontSize: 12, color: C.muted }}>{new Date(user.createdAt).toLocaleDateString()}</div>
                              <button
                                onClick={() => void handleRoleChange(user.id, nextRole)}
                                disabled={isBusy}
                                style={{ justifySelf: 'end', background: user.role === 'admin' ? `${C.accentDanger}14` : `${C.accentQuaternary}14`, border: `1px solid ${user.role === 'admin' ? `${C.accentDanger}47` : `${C.accentQuaternary}47`}`, borderRadius: 10, color: user.role === 'admin' ? C.accentDanger : C.accentQuaternary, padding: '10px 14px', fontSize: 12, fontWeight: 700, cursor: isBusy ? 'not-allowed' : 'pointer', opacity: isBusy ? 0.7 : 1, fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.08em' }}
                              >
                                {isBusy ? 'Updating...' : user.role === 'admin' ? 'Demote' : 'Promote'}
                              </button>
                            </div>
                          );
                        })}
                        {!managedUsers?.items.length ? <div style={{ color: C.muted, fontSize: 13, padding: '16px' }}>No users found.</div> : null}
                      </div>
                    </div>
                  ) : null}

                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 14 }}>
                    <button
                      onClick={() => setUserPage((page) => Math.max(1, page - 1))}
                      disabled={!managedUsers?.hasPreviousPage || usersLoading}
                      style={{ background: 'transparent', border: `1px solid ${C.chipBorder}`, borderRadius: 10, color: !managedUsers?.hasPreviousPage || usersLoading ? C.faint : C.text, padding: '9px 14px', fontSize: 12, fontWeight: 700, cursor: !managedUsers?.hasPreviousPage || usersLoading ? 'not-allowed' : 'pointer', fontFamily: "'Rajdhani', sans-serif" }}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setUserPage((page) => page + 1)}
                      disabled={!managedUsers?.hasNextPage || usersLoading}
                      style={{ background: 'transparent', border: `1px solid ${C.chipBorder}`, borderRadius: 10, color: !managedUsers?.hasNextPage || usersLoading ? C.faint : C.text, padding: '9px 14px', fontSize: 12, fontWeight: 700, cursor: !managedUsers?.hasNextPage || usersLoading ? 'not-allowed' : 'pointer', fontFamily: "'Rajdhani', sans-serif" }}
                    >
                      Next
                    </button>
                  </div>

                  {setUserRole.error ? (
                    <div style={{ marginTop: 14, background: `${C.accentDanger}12`, border: `1px solid ${C.accentDanger}38`, borderRadius: 12, padding: '12px 14px', color: C.accentDanger, fontSize: 12 }}>
                      {setUserRole.error.message}
                    </div>
                  ) : null}
                </>
              </SectionShell>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}