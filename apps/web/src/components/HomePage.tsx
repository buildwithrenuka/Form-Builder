import { useState, useEffect, useRef } from 'react';
import { FormVerseLogo } from './Logo';
import { TUTORIAL_PANELS } from './TutorialScreen';
import { PricingSection } from './PricingSection';
import { PremiumIcon } from './PremiumIcon';
import { trpc } from '../trpc';
import { COUNTRIES } from '../globeData';
import { LIBRARY_WORLDS } from '../libraryData';
import { AVATARS, WORLDS } from '../themes';

export type HomeTheme = 'dark' | 'light' | 'rainbow' | 'firecracker' | 'jugnu';

const HOME_GALLERY_PREVIEW_LIMIT = 6;

type Props = {
  onEnter: () => void;
  onLogin?: () => void;
  onRegister?: () => void;
  onTutorial: () => void;
  onApiDocs?: () => void;
  onPricing?: () => void;
  onExplore?: () => void;
  onViewForm?: (slug: string) => void;
  onDashboard?: () => void;
  onAdmin?: () => void;
  playerName?: string;
  theme: HomeTheme;
  onThemeChange: (theme: HomeTheme) => void;
};

const TEMPLE_WORLD_IDS = new Set(WORLDS.map((world) => world.id));
const GLOBE_COUNTRY_MAP = new Map(COUNTRIES.map((country) => [country.id, country]));
const LIBRARY_WORLD_MAP = new Map(LIBRARY_WORLDS.map((world) => [world.id, world]));

function getPublicFormMeta(worldTheme?: string | null) {
  if (!worldTheme) {
    return { color: '#a78bfa', emoji: '📋', label: 'General Form' };
  }

  if (TEMPLE_WORLD_IDS.has(worldTheme)) {
    const world = WORLDS.find((entry) => entry.id === worldTheme);
    return {
      color: world?.accentColor ?? '#f97316',
      emoji: world?.emoji ?? '🏛️',
      label: world?.name ?? 'Realm Runner',
    };
  }

  const country = GLOBE_COUNTRY_MAP.get(worldTheme);
  if (country) {
    return {
      color: country.accentColor,
      emoji: country.emoji,
      label: `Globe · ${country.name}`,
    };
  }

  const libraryWorld = LIBRARY_WORLD_MAP.get(worldTheme as (typeof LIBRARY_WORLDS)[number]['id']);
  if (libraryWorld) {
    return {
      color: libraryWorld.accentColor,
      emoji: libraryWorld.emoji,
      label: `Library · ${libraryWorld.name}`,
    };
  }

  if (worldTheme === 'temple-run') return { color: '#f97316', emoji: '🏛️', label: 'Realm Runner' };
  if (worldTheme === 'globe') return { color: '#c9a84c', emoji: '✈️', label: 'Globe Explorer' };
  if (worldTheme === 'library') return { color: '#a855f7', emoji: '📚', label: 'The Library' };

  return { color: '#a78bfa', emoji: '📋', label: worldTheme };
}

const DARK = {
  bg:          'linear-gradient(160deg, #000508 0%, #000d12 45%, #020010 100%)',
  navBg:       'rgba(0,8,16,0.92)',
  navBorder:   'rgba(0,210,255,0.3)',
  navShadow:   '0 2px 40px rgba(0,200,255,0.12)',
  gridLine1:   'rgba(0,245,255,0.05)',
  gridLine2:   'rgba(0,245,255,0.04)',
  vignette:    'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(0,3,10,0.85) 100%)',
  orb1:        'rgba(0,200,255,0.32)',
  orb2:        'rgba(255,80,0,0.26)',
  orb3:        'rgba(0,255,160,0.18)',
  orb4:        'rgba(255,220,0,0.14)',
  scanLine:    'linear-gradient(90deg, transparent 0%, rgba(0,245,255,0.9) 25%, rgba(255,80,0,0.8) 55%, rgba(0,255,160,0.8) 80%, transparent 100%)',
  navLinkColor:'rgba(160,220,255,0.8)',
  navLinkHoverBg: 'rgba(0,180,255,0.14)',
  navLinkHoverShadow: '0 0 12px rgba(0,200,255,0.7)',
  divider:     'linear-gradient(180deg, rgba(0,200,255,0.5), rgba(255,80,0,0.35))',
  tutorialBg:  'rgba(0,180,255,0.08)',
  tutorialBorder: 'rgba(0,220,255,0.45)',
  tutorialColor: '#00e5ff',
  loginBg:     'rgba(0,245,255,0.08)',
  loginBorder: 'rgba(0,245,255,0.45)',
  loginColor:  '#00f5ff',
  signupBg:    'linear-gradient(135deg, #6d00cc, #8b2fff, #00bcd4)',
  signupShadow:'0 0 24px rgba(139,47,255,0.65), 0 0 8px rgba(0,245,255,0.3)',
  dot1:        '#00f5ff',
  tagColor:    '#7fdfff',
  tagShadow:   '0 0 20px rgba(0,220,255,0.4)',
  ctaBg:       'linear-gradient(135deg, #6d00cc, #8b2fff 30%, #ff00aa 58%, #ffe600 80%, #ff6a00 100%)',
  ctaShadow:   '0 0 50px rgba(139,47,255,0.7), 0 0 20px rgba(255,0,170,0.4), 0 0 30px rgba(255,220,0,0.35), 0 8px 32px rgba(0,0,0,0.5)',
  scrollColor: '#c084fc',
  sectionLabel:'#00f5ff',
  sectionLabelShadow: '0 0 14px #00f5ff',
  h2Gradient:  'linear-gradient(135deg, #fff 0%, #c084fc 50%, #00f5ff 100%)',
  subText:     'rgba(180,240,255,0.55)',
  featCardBg:  'rgba(255,255,255,0.025)',
  featCardBorder: 'rgba(255,255,255,0.07)',
  featDescColor: 'rgba(160,220,255,0.45)',
  expCardBgIdle: (c: string) => `linear-gradient(160deg, ${c}0e 0%, rgba(6,0,20,0.85) 60%)`,
  expCardBgHov:  (c: string) => `linear-gradient(160deg, ${c}24 0%, rgba(10,4,30,0.98) 60%)`,
  expH3:       '#fff',
  expDesc:     'rgba(200,240,255,0.5)',
  expChipLabel:'rgba(255,255,255,0.22)',
  expChipBg:   'rgba(255,255,255,0.04)',
  expChipBorder:'rgba(255,255,255,0.06)',
  expChipColor:'rgba(255,255,255,0.3)',
  stepCircleBg:'linear-gradient(135deg, rgba(139,47,255,0.22), rgba(0,245,255,0.12))',
  stepCircleBorder: 'rgba(0,220,255,0.5)',
  stepCircleShadow: '0 0 32px rgba(0,180,255,0.3), 0 0 12px rgba(255,80,0,0.15)',
  stepNumBg:   'linear-gradient(135deg, #8b2fff, #ffe600)',
  stepNumBorder: 'rgba(8,0,26,1)',
  stepNumShadow: '0 0 12px rgba(139,47,255,0.7), 0 0 8px rgba(255,220,0,0.5)',
  stepConnector: 'linear-gradient(90deg, transparent, rgba(0,180,255,0.5), rgba(255,80,0,0.45), rgba(0,255,160,0.45), transparent)',
  stepTitle:   '#e0f7ff',
  stepTitleShadow: '0 0 8px rgba(0,220,255,0.25)',
  stepDesc:    'rgba(160,220,255,0.5)',
  statsBg:     'linear-gradient(135deg, rgba(0,15,30,0.85), rgba(10,0,25,0.85))',
  statsBorderT:'rgba(0,200,255,0.25)',
  statsBorderB:'rgba(255,80,0,0.2)',
  statsLabel:  'rgba(180,240,255,0.45)',
  footerBg:    'rgba(0,5,14,0.97)',
  footerBorder:'linear-gradient(90deg, rgba(0,200,255,0.5), rgba(255,80,0,0.4), rgba(255,220,0,0.45), rgba(0,255,160,0.35))',
  copyright:   'rgba(160,220,255,0.18)',
};

const LIGHT = {
  bg:          'linear-gradient(160deg, #fff9c4 0%, #fffde7 45%, #fff8e1 100%)',
  navBg:       'rgba(12,6,0,0.96)',
  navBorder:   'rgba(255,180,0,0.55)',
  navShadow:   '0 2px 40px rgba(200,100,0,0.35)',
  gridLine1:   'rgba(180,120,0,0.1)',
  gridLine2:   'rgba(255,140,0,0.07)',
  vignette:    'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(255,220,80,0.25) 100%)',
  orb1:        'rgba(255,200,0,0.55)',
  orb2:        'rgba(255,60,0,0.4)',
  orb3:        'rgba(255,0,120,0.3)',
  orb4:        'rgba(160,0,255,0.22)',
  scanLine:    'linear-gradient(90deg, transparent 0%, rgba(255,200,0,0.7) 25%, rgba(255,60,0,0.55) 55%, rgba(200,0,255,0.45) 80%, transparent 100%)',
  navLinkColor:'rgba(255,220,100,0.85)',
  navLinkHoverBg: 'rgba(255,180,0,0.18)',
  navLinkHoverShadow: '0 0 10px rgba(255,180,0,0.6)',
  divider:     'linear-gradient(180deg, rgba(255,180,0,0.6), rgba(255,60,0,0.45))',
  tutorialBg:  'rgba(255,160,0,0.1)',
  tutorialBorder: 'rgba(255,160,0,0.55)',
  tutorialColor: '#ff9900',
  loginBg:     'rgba(255,140,0,0.1)',
  loginBorder: 'rgba(255,160,0,0.55)',
  loginColor:  '#ff9900',
  signupBg:    'linear-gradient(135deg, #cc4400, #ff6600, #ffcc00)',
  signupShadow:'0 0 24px rgba(255,100,0,0.55), 0 0 10px rgba(255,200,0,0.35)',
  dot1:        '#ff8800',
  tagColor:    '#111111',
  tagShadow:   '0 0 12px rgba(255,140,0,0.3)',
  ctaBg:       'linear-gradient(135deg, #cc4400, #ff6600 30%, #cc0080 58%, #ffe600 80%, #ff4400 100%)',
  ctaShadow:   '0 0 40px rgba(200,60,0,0.6), 0 0 18px rgba(255,180,0,0.4), 0 8px 28px rgba(0,0,0,0.25)',
  scrollColor: '#111111',
  sectionLabel:'#111111',
  sectionLabelShadow: '0 0 10px rgba(255,140,0,0.45)',
  h2Gradient:  'linear-gradient(135deg, #111111 0%, #2a2a2a 28%, #cc3300 62%, #ffb300 100%)',
  subText:     'rgba(17,17,17,0.72)',
  featCardBg:  'rgba(255,150,0,0.06)',
  featCardBorder: 'rgba(255,140,0,0.18)',
  featDescColor: 'rgba(17,17,17,0.68)',
  expCardBgIdle: (c: string) => `linear-gradient(160deg, ${c}18 0%, rgba(255,252,220,0.94) 60%)`,
  expCardBgHov:  (c: string) => `linear-gradient(160deg, ${c}30 0%, rgba(255,250,210,0.98) 60%)`,
  expH3:       '#111111',
  expDesc:     'rgba(17,17,17,0.72)',
  expChipLabel:'rgba(17,17,17,0.58)',
  expChipBg:   'rgba(255,140,0,0.08)',
  expChipBorder:'rgba(255,140,0,0.22)',
  expChipColor:'rgba(17,17,17,0.72)',
  stepCircleBg:'linear-gradient(135deg, rgba(255,160,0,0.22), rgba(255,0,120,0.1))',
  stepCircleBorder: 'rgba(255,160,0,0.65)',
  stepCircleShadow: '0 0 28px rgba(255,140,0,0.35), 0 0 10px rgba(255,60,0,0.2)',
  stepNumBg:   'linear-gradient(135deg, #cc4400, #ffcc00)',
  stepNumBorder: 'rgba(255,252,220,1)',
  stepNumShadow: '0 0 12px rgba(200,60,0,0.6), 0 0 6px rgba(255,200,0,0.5)',
  stepConnector: 'linear-gradient(90deg, transparent, rgba(255,160,0,0.5), rgba(255,60,0,0.45), rgba(200,0,255,0.35), transparent)',
  stepTitle:   '#111111',
  stepTitleShadow: 'none',
  stepDesc:    'rgba(17,17,17,0.68)',
  statsBg:     'linear-gradient(135deg, rgba(255,240,180,0.85), rgba(255,220,120,0.75))',
  statsBorderT:'rgba(255,180,0,0.4)',
  statsBorderB:'rgba(255,80,0,0.3)',
  statsLabel:  'rgba(17,17,17,0.62)',
  footerBg:    'rgba(12,6,0,0.97)',
  footerBorder:'linear-gradient(90deg, rgba(255,180,0,0.7), rgba(255,60,0,0.55), rgba(200,0,255,0.4), rgba(255,200,0,0.5))',
  copyright:   'rgba(17,17,17,0.42)',
};

const RAINBOW = {
  bg:          'linear-gradient(160deg, #05000f 0%, #000a05 45%, #0a0005 100%)',
  navBg:       'rgba(4,0,12,0.94)',
  navBorder:   'rgba(255,0,180,0.55)',
  navShadow:   '0 2px 40px rgba(180,0,255,0.28)',
  gridLine1:   'rgba(255,0,200,0.07)',
  gridLine2:   'rgba(0,255,200,0.05)',
  vignette:    'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 20%, rgba(0,0,8,0.75) 100%)',
  orb1:        'rgba(255,0,100,0.55)',
  orb2:        'rgba(0,220,255,0.45)',
  orb3:        'rgba(0,255,80,0.38)',
  orb4:        'rgba(255,180,0,0.38)',
  scanLine:    'linear-gradient(90deg, transparent 0%, rgba(255,0,80,0.9) 15%, rgba(255,140,0,0.85) 30%, rgba(255,240,0,0.85) 45%, rgba(0,240,0,0.85) 60%, rgba(0,80,255,0.85) 77%, rgba(180,0,255,0.85) 90%, transparent 100%)',
  navLinkColor:'rgba(255,255,255,0.88)',
  navLinkHoverBg: 'rgba(255,0,200,0.18)',
  navLinkHoverShadow: '0 0 14px rgba(255,0,200,0.75)',
  divider:     'linear-gradient(180deg, rgba(255,0,180,0.65), rgba(0,200,255,0.5))',
  tutorialBg:  'rgba(255,100,0,0.1)',
  tutorialBorder: 'rgba(255,140,0,0.6)',
  tutorialColor: '#ffaa00',
  loginBg:     'rgba(0,180,255,0.1)',
  loginBorder: 'rgba(0,200,255,0.55)',
  loginColor:  '#00ccff',
  signupBg:    'linear-gradient(135deg, #ff0080, #ff6600, #ffcc00, #00cc44, #0066ff, #8800ff)',
  signupShadow:'0 0 30px rgba(255,0,128,0.65), 0 0 14px rgba(0,200,255,0.45)',
  dot1:        '#ff0088',
  tagColor:    '#ffffff',
  tagShadow:   '0 0 20px rgba(255,80,255,0.65)',
  ctaBg:       'linear-gradient(135deg, #ff0080, #ff5500 18%, #ffcc00 36%, #00cc44 54%, #0066ff 72%, #8800ff 90%)',
  ctaShadow:   '0 0 55px rgba(255,0,128,0.65), 0 0 25px rgba(0,200,255,0.45), 0 8px 32px rgba(0,0,0,0.55)',
  scrollColor: '#ff80ff',
  sectionLabel:'#ff80ff',
  sectionLabelShadow: '0 0 14px rgba(255,80,255,0.7)',
  h2Gradient:  'linear-gradient(135deg, #ff0080 0%, #ff8800 20%, #ffee00 40%, #00ee44 60%, #0088ff 80%, #aa00ff 100%)',
  subText:     'rgba(255,255,255,0.58)',
  featCardBg:  'rgba(255,255,255,0.03)',
  featCardBorder: 'rgba(255,255,255,0.09)',
  featDescColor: 'rgba(210,210,255,0.5)',
  expCardBgIdle: (c: string) => `linear-gradient(160deg, ${c}18 0%, rgba(5,0,14,0.88) 60%)`,
  expCardBgHov:  (c: string) => `linear-gradient(160deg, ${c}32 0%, rgba(8,0,20,0.98) 60%)`,
  expH3:       '#fff',
  expDesc:     'rgba(210,210,255,0.55)',
  expChipLabel:'rgba(255,255,255,0.28)',
  expChipBg:   'rgba(255,255,255,0.05)',
  expChipBorder:'rgba(255,255,255,0.1)',
  expChipColor:'rgba(255,255,255,0.38)',
  stepCircleBg:'linear-gradient(135deg, rgba(255,0,128,0.22), rgba(0,200,255,0.14))',
  stepCircleBorder: 'rgba(255,200,0,0.65)',
  stepCircleShadow: '0 0 36px rgba(255,80,0,0.4), 0 0 14px rgba(0,200,255,0.28)',
  stepNumBg:   'linear-gradient(135deg, #ff0080, #ffee00)',
  stepNumBorder: 'rgba(4,0,12,1)',
  stepNumShadow: '0 0 14px rgba(255,0,128,0.8), 0 0 8px rgba(255,200,0,0.55)',
  stepConnector: 'linear-gradient(90deg, transparent, rgba(255,0,100,0.6), rgba(255,140,0,0.55), rgba(0,230,0,0.5), rgba(0,80,255,0.5), rgba(180,0,255,0.5), transparent)',
  stepTitle:   '#ffffff',
  stepTitleShadow: '0 0 10px rgba(255,80,255,0.4)',
  stepDesc:    'rgba(200,200,255,0.55)',
  statsBg:     'linear-gradient(135deg, rgba(15,0,30,0.9), rgba(0,15,30,0.9))',
  statsBorderT:'rgba(255,0,128,0.35)',
  statsBorderB:'rgba(0,200,255,0.3)',
  statsLabel:  'rgba(200,200,255,0.5)',
  footerBg:    'rgba(4,0,12,0.98)',
  footerBorder:'linear-gradient(90deg, rgba(255,0,80,0.7), rgba(255,140,0,0.6), rgba(0,220,0,0.55), rgba(0,80,255,0.55), rgba(200,0,255,0.65))',
  copyright:   'rgba(200,200,255,0.2)',
};

const FIRECRACKER = {
  bg:          'linear-gradient(160deg, #0a0200 0%, #060100 45%, #050000 100%)',
  navBg:       'rgba(5,1,0,0.96)',
  navBorder:   'rgba(255,100,0,0.65)',
  navShadow:   '0 2px 40px rgba(255,60,0,0.35)',
  gridLine1:   'rgba(255,80,0,0.07)',
  gridLine2:   'rgba(255,160,0,0.05)',
  vignette:    'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 20%, rgba(5,0,0,0.82) 100%)',
  orb1:        'rgba(255,50,0,0.6)',
  orb2:        'rgba(255,180,0,0.5)',
  orb3:        'rgba(255,255,80,0.3)',
  orb4:        'rgba(200,0,255,0.22)',
  scanLine:    'linear-gradient(90deg, transparent 0%, rgba(255,50,0,1) 20%, rgba(255,160,0,0.9) 40%, rgba(255,255,80,0.9) 60%, rgba(255,80,0,0.9) 80%, transparent 100%)',
  navLinkColor:'rgba(255,180,100,0.9)',
  navLinkHoverBg: 'rgba(255,80,0,0.2)',
  navLinkHoverShadow: '0 0 14px rgba(255,100,0,0.8)',
  divider:     'linear-gradient(180deg, rgba(255,80,0,0.7), rgba(255,200,0,0.5))',
  tutorialBg:  'rgba(255,80,0,0.1)',
  tutorialBorder: 'rgba(255,120,0,0.65)',
  tutorialColor: '#ff6600',
  loginBg:     'rgba(255,60,0,0.1)',
  loginBorder: 'rgba(255,100,0,0.6)',
  loginColor:  '#ff6600',
  signupBg:    'linear-gradient(135deg, #cc0000, #ff4400, #ff9900, #ffee00)',
  signupShadow:'0 0 30px rgba(255,60,0,0.7), 0 0 14px rgba(255,180,0,0.45)',
  dot1:        '#ff4400',
  tagColor:    '#ffcc88',
  tagShadow:   '0 0 20px rgba(255,120,0,0.65)',
  ctaBg:       'linear-gradient(135deg, #cc0000, #ff4400 22%, #ff9900 48%, #ffee00 75%, #ff6600 100%)',
  ctaShadow:   '0 0 55px rgba(255,50,0,0.7), 0 0 25px rgba(255,160,0,0.5), 0 8px 32px rgba(0,0,0,0.6)',
  scrollColor: '#ff8844',
  sectionLabel:'#ff6600',
  sectionLabelShadow: '0 0 14px rgba(255,100,0,0.7)',
  h2Gradient:  'linear-gradient(135deg, #fff 0%, #ff6600 30%, #ffcc00 65%, #ff3300 100%)',
  subText:     'rgba(255,200,150,0.55)',
  featCardBg:  'rgba(255,80,0,0.04)',
  featCardBorder: 'rgba(255,80,0,0.1)',
  featDescColor: 'rgba(255,180,120,0.5)',
  expCardBgIdle: (c: string) => `linear-gradient(160deg, ${c}14 0%, rgba(8,1,0,0.88) 60%)`,
  expCardBgHov:  (c: string) => `linear-gradient(160deg, ${c}28 0%, rgba(12,2,0,0.98) 60%)`,
  expH3:       '#fff',
  expDesc:     'rgba(255,200,160,0.55)',
  expChipLabel:'rgba(255,180,100,0.3)',
  expChipBg:   'rgba(255,80,0,0.06)',
  expChipBorder:'rgba(255,80,0,0.12)',
  expChipColor:'rgba(255,180,120,0.45)',
  stepCircleBg:'linear-gradient(135deg, rgba(255,60,0,0.25), rgba(255,180,0,0.15))',
  stepCircleBorder: 'rgba(255,140,0,0.7)',
  stepCircleShadow: '0 0 36px rgba(255,80,0,0.45), 0 0 14px rgba(255,200,0,0.3)',
  stepNumBg:   'linear-gradient(135deg, #cc0000, #ffcc00)',
  stepNumBorder: 'rgba(5,1,0,1)',
  stepNumShadow: '0 0 14px rgba(255,50,0,0.85), 0 0 8px rgba(255,180,0,0.6)',
  stepConnector: 'linear-gradient(90deg, transparent, rgba(255,50,0,0.65), rgba(255,140,0,0.6), rgba(255,240,0,0.55), rgba(255,80,0,0.6), transparent)',
  stepTitle:   '#fff5e0',
  stepTitleShadow: '0 0 10px rgba(255,100,0,0.4)',
  stepDesc:    'rgba(255,190,130,0.55)',
  statsBg:     'linear-gradient(135deg, rgba(12,2,0,0.9), rgba(8,1,0,0.9))',
  statsBorderT:'rgba(255,80,0,0.35)',
  statsBorderB:'rgba(255,180,0,0.3)',
  statsLabel:  'rgba(255,180,100,0.5)',
  footerBg:    'rgba(5,1,0,0.98)',
  footerBorder:'linear-gradient(90deg, rgba(255,30,0,0.75), rgba(255,120,0,0.65), rgba(255,220,0,0.6), rgba(255,80,0,0.65))',
  copyright:   'rgba(255,160,80,0.22)',
};

const JUGNU = {
  bg:          'linear-gradient(160deg, #000801 0%, #000502 45%, #010400 100%)',
  navBg:       'rgba(0,5,1,0.96)',
  navBorder:   'rgba(255,210,90,0.34)',
  navShadow:   '0 2px 40px rgba(255,190,60,0.14)',
  gridLine1:   'rgba(255,210,90,0.035)',
  gridLine2:   'rgba(180,120,30,0.03)',
  vignette:    'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 25%, rgba(0,4,0,0.82) 100%)',
  orb1:        'rgba(255,226,120,0.32)',
  orb2:        'rgba(255,184,56,0.22)',
  orb3:        'rgba(255,244,148,0.2)',
  orb4:        'rgba(188,255,110,0.12)',
  scanLine:    'linear-gradient(90deg, transparent 0%, rgba(255,214,92,0.65) 25%, rgba(255,240,150,0.58) 55%, rgba(180,255,120,0.42) 80%, transparent 100%)',
  navLinkColor:'rgba(255,232,170,0.82)',
  navLinkHoverBg: 'rgba(255,214,92,0.12)',
  navLinkHoverShadow: '0 0 12px rgba(255,214,92,0.55)',
  divider:     'linear-gradient(180deg, rgba(255,214,92,0.5), rgba(184,255,120,0.26))',
  tutorialBg:  'rgba(255,214,92,0.07)',
  tutorialBorder: 'rgba(255,214,92,0.36)',
  tutorialColor: '#ffd65c',
  loginBg:     'rgba(255,214,92,0.08)',
  loginBorder: 'rgba(255,214,92,0.36)',
  loginColor:  '#ffd65c',
  signupBg:    'linear-gradient(135deg, #5b4300, #b07a00, #ffd65c, #fff0a6)',
  signupShadow:'0 0 28px rgba(255,214,92,0.42), 0 0 12px rgba(255,240,150,0.26)',
  dot1:        '#ffd65c',
  tagColor:    '#ffefb4',
  tagShadow:   '0 0 20px rgba(255,214,92,0.36)',
  ctaBg:       'linear-gradient(135deg, #5b4300, #b07a00 28%, #ffd65c 58%, #fff0a6 82%, #c9ff84 100%)',
  ctaShadow:   '0 0 50px rgba(255,214,92,0.38), 0 0 22px rgba(255,240,150,0.26), 0 8px 32px rgba(0,0,0,0.55)',
  scrollColor: '#ffd65c',
  sectionLabel:'#ffd65c',
  sectionLabelShadow: '0 0 14px rgba(255,214,92,0.52)',
  h2Gradient:  'linear-gradient(135deg, #fff3bf 0%, #ffd65c 38%, #ffe98e 68%, #cfff8c 100%)',
  subText:     'rgba(255,235,178,0.5)',
  featCardBg:  'rgba(255,214,92,0.03)',
  featCardBorder: 'rgba(255,214,92,0.08)',
  featDescColor: 'rgba(238,220,156,0.48)',
  expCardBgIdle: (c: string) => `linear-gradient(160deg, ${c}12 0%, rgba(0,5,1,0.88) 60%)`,
  expCardBgHov:  (c: string) => `linear-gradient(160deg, ${c}25 0%, rgba(0,8,2,0.98) 60%)`,
  expH3:       '#fff5cf',
  expDesc:     'rgba(255,235,178,0.5)',
  expChipLabel:'rgba(255,214,92,0.3)',
  expChipBg:   'rgba(255,214,92,0.05)',
  expChipBorder:'rgba(255,214,92,0.1)',
  expChipColor:'rgba(255,232,170,0.38)',
  stepCircleBg:'linear-gradient(135deg, rgba(255,214,92,0.18), rgba(184,255,120,0.08))',
  stepCircleBorder: 'rgba(255,214,92,0.5)',
  stepCircleShadow: '0 0 32px rgba(255,214,92,0.24), 0 0 12px rgba(255,240,150,0.16)',
  stepNumBg:   'linear-gradient(135deg, #7a5a00, #ffd65c)',
  stepNumBorder: 'rgba(0,5,1,1)',
  stepNumShadow: '0 0 12px rgba(255,214,92,0.52), 0 0 6px rgba(255,240,150,0.26)',
  stepConnector: 'linear-gradient(90deg, transparent, rgba(255,214,92,0.42), rgba(255,240,150,0.38), rgba(184,255,120,0.28), transparent)',
  stepTitle:   '#fff0c9',
  stepTitleShadow: '0 0 8px rgba(255,214,92,0.18)',
  stepDesc:    'rgba(238,220,156,0.48)',
  statsBg:     'linear-gradient(135deg, rgba(0,8,1,0.88), rgba(0,5,0,0.88))',
  statsBorderT:'rgba(255,214,92,0.2)',
  statsBorderB:'rgba(184,255,120,0.14)',
  statsLabel:  'rgba(240,226,166,0.42)',
  footerBg:    'rgba(0,4,0,0.98)',
  footerBorder:'linear-gradient(90deg, rgba(255,214,92,0.55), rgba(255,240,150,0.42), rgba(184,255,120,0.35), rgba(255,214,92,0.48))',
  copyright:   'rgba(255,230,160,0.2)',
};

const THEMES = { dark: DARK, light: LIGHT, rainbow: RAINBOW, firecracker: FIRECRACKER, jugnu: JUGNU } as const;

const HOME_THEME_OPTIONS = [
  { id: 'dark', icon: '🌙', title: 'Dark', glow: 'rgba(100,80,255,0.55)' },
  { id: 'light', icon: '☀️', title: 'Light', glow: 'rgba(255,200,0,0.55)' },
  { id: 'rainbow', icon: '🌈', title: 'Rainbow', glow: 'rgba(255,0,200,0.55)' },
  { id: 'firecracker', icon: '🎆', title: 'Firecracker', glow: 'rgba(255,80,0,0.65)' },
  { id: 'jugnu', icon: '✨', title: 'Jugnu', glow: 'rgba(160,255,0,0.55)' },
] as const satisfies ReadonlyArray<{ id: HomeTheme; icon: string; title: string; glow: string }>;

const EXPERIENCES = [
  {
    id: 'temple', num: '01', emoji: '🏛️',
    title: 'Realm Runner', subtitle: 'Cinematic Adventure',
    desc: `Build forms inside ${WORLDS.length} legendary worlds with ${AVATARS.length} playable runners. Pick your mission on an interactive map — fields scaffold automatically for your chosen purpose.`,
    color: '#ff6a00', glow: 'rgba(255,106,0,0.35)', border: 'rgba(255,106,0,0.6)',
    bg: 'radial-gradient(ellipse 120% 80% at 50% 0%, rgba(180,55,0,0.55) 0%, rgba(8,0,26,0.0) 70%)',
    previewVideo: '/experience-previews/realm-runner.webm',
    formTypes: ['📋 Quest Registration','👤 Character Sheet','🎯 Mission Brief','🏆 Score Tracker','📝 Event Signup','🔐 Access Form','🗒️ Field Report','⚔️ Challenge Entry'],
    chipsLabel: 'Form Templates',
  },
  {
    id: 'globe', num: '02', emoji: '✈️',
    title: 'Globe Explorer', subtitle: 'Travel & Exploration',
    desc: 'Pre-built travel form templates for 12 countries — with locale-aware fields, currency symbols, and destination-specific presets.',
    color: '#ffe600', glow: 'rgba(255,230,0,0.32)', border: 'rgba(255,230,0,0.6)',
    bg: 'radial-gradient(ellipse 120% 80% at 50% 0%, rgba(120,90,0,0.55) 0%, rgba(8,0,26,0.0) 70%)',
    previewVideo: '/experience-previews/globe-explorer.webm',
    formTypes: ['🗂️ Visa Application','🏨 Hotel Registration','📦 Customs Declaration','✈️ Travel Itinerary','👥 Group Travel Form','🚌 Transport Booking','💱 Currency-aware Fields','📍 Address Autocomplete'],
    chipsLabel: 'Form Templates',
  },
  {
    id: 'library', num: '03', emoji: '📚',
    title: 'The Library', subtitle: 'Lore & World-Building',
    desc: 'Hand-crafted field presets for mythology, history, sci-fi and fiction — build character sheets, lore entries, mission logs and records.',
    color: '#dd44ff', glow: 'rgba(221,68,255,0.35)', border: 'rgba(221,68,255,0.6)',
    bg: 'radial-gradient(ellipse 120% 80% at 50% 0%, rgba(100,0,160,0.55) 0%, rgba(8,0,26,0.0) 70%)',
    previewVideo: '/experience-previews/the-library.webm',
    formTypes: ['⚡ Hero Registration','📜 Historical Record','🚀 Crew Mission Log','🧙 Character Sheet','🌍 World-Building Entry','🔮 Deity Profile','👾 Alien Species Form','📖 Lore Archive'],
    chipsLabel: 'Form Templates',
  },
];

const FEATURES = [
  { icon: '⚡', label: '17 Field Types',    desc: 'Text, number, email, phone, date, file upload, dropdown, multi-select, checkbox, radio, rating, slider, textarea, password, URL, colour, signature.' },
  { icon: '🔒', label: 'Smart Validation',  desc: 'Required fields, min/max length, regex patterns, custom error messages — all configured visually without code.' },
  { icon: '📐', label: 'Flexible Layout',   desc: 'Half-width fields, section dividers, field groups — arrange your form exactly as you need it.' },
  { icon: '🎨', label: 'Per-field Styling', desc: 'Choose a colour palette per field. Validation badges, helper text, and placeholder text all customisable.' },
  { icon: '📋', label: 'Preset Templates',  desc: 'Jump-start with ready-made field groups for registrations, surveys, applications, and more.' },
  { icon: '🔗', label: 'Controlled Sharing', desc: 'Publish with custom slugs, password gates, expiry windows, and response caps. Share publicly without losing control.' },
  { icon: '🛡️', label: 'Protected Access',  desc: 'Lock sensitive forms behind an access password and keep public viewers informed when a form is limited or no longer accepting responses.' },
  { icon: '🕐', label: 'Version History',   desc: 'Name and save snapshots at any point. Browse the full timeline and restore any previous version in one click.' },
  { icon: '📦', label: 'Import & Export',   desc: 'Save your form as a .trform.json file or import any template. Take your work anywhere.' },
];

const STEPS = [
  { n: '1', icon: '🎮', title: 'Pick an Experience', desc: 'Realm Runner, Globe Explorer or The Library.' },
  { n: '2', icon: '🌍', title: 'Choose Your World',  desc: 'A world, country, or lore theme sets the scene.' },
  { n: '3', icon: '🔑', title: 'Sign In',            desc: 'Quick login — forms save to your account.' },
  { n: '4', icon: '🔨', title: 'Build & Share',      desc: 'Drag fields, set rules, copy the link.' },
];

const STATS = [
  { v: '3',     l: 'Experiences', icon: '🎭', c: '#c084fc' },
  { v: '17',    l: 'Field Types', icon: '⚡', c: '#00f5ff' },
  { v: '9',     l: 'Worlds',      icon: '🌴', c: '#ffe600' },
  { v: '12',    l: 'Countries',   icon: '✈️', c: '#ff6a00' },
];

const TAGLINES = [
  'Build cinematic forms.',
  'Three worlds. One builder.',
  'No code. Pure magic.',
  'Share in one click.',
  'Forms, reimagined.',
];

// ── Waterfall Canvas ──────────────────────────────────────────
function WaterfallCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    type Stream = { x: number; y: number; speed: number; hue: number; width: number; length: number; alpha: number; };
    const COLS = Math.floor(window.innerWidth / 18);
    const streams: Stream[] = Array.from({ length: COLS }, (_, i) => ({
      x: (i / COLS) * window.innerWidth + Math.random() * 14,
      y: Math.random() * -600,
      speed: 1.8 + Math.random() * 3.5,
      hue: (i / COLS) * 360,
      width: 1.5 + Math.random() * 3.5,
      length: 90 + Math.random() * 160,
      alpha: 0.35 + Math.random() * 0.45,
    }));

    let raf: number;
    let frame = 0;

    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      streams.forEach(s => {
        s.y += s.speed;
        if (s.y > canvas.height + s.length + 20) {
          s.y = -s.length - Math.random() * 300;
          s.speed = 1.8 + Math.random() * 3.5;
          s.hue = Math.random() * 360;
          s.alpha = 0.35 + Math.random() * 0.45;
        }

        // Wavering wobble
        const wobble = Math.sin(frame * 0.018 + s.x * 0.008) * 5;

        // Trail gradient
        const grad = ctx.createLinearGradient(s.x, s.y - s.length, s.x, s.y);
        grad.addColorStop(0,   `hsla(${s.hue}, 100%, 65%, 0)`);
        grad.addColorStop(0.3, `hsla(${(s.hue + 40) % 360}, 100%, 68%, ${s.alpha * 0.4})`);
        grad.addColorStop(0.7, `hsla(${(s.hue + 80) % 360}, 100%, 72%, ${s.alpha * 0.85})`);
        grad.addColorStop(1,   `hsla(${(s.hue + 120) % 360}, 100%, 80%, ${s.alpha})`);

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.width;
        ctx.lineCap = 'round';
        ctx.moveTo(s.x + wobble * 0.5, s.y - s.length);
        ctx.bezierCurveTo(
          s.x + wobble, s.y - s.length * 0.66,
          s.x - wobble, s.y - s.length * 0.33,
          s.x, s.y
        );
        ctx.stroke();

        // Glowing drop at head
        const dropHue = (s.hue + 120) % 360;
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.width * 2.5);
        grd.addColorStop(0, `hsla(${dropHue}, 100%, 90%, ${s.alpha})`);
        grd.addColorStop(1, `hsla(${dropHue}, 100%, 60%, 0)`);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.width * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Tiny splash ripple near bottom for streams that just reset
        if (s.y > canvas.height - 60 && s.y < canvas.height - 10) {
          ctx.beginPath();
          ctx.ellipse(s.x, canvas.height - 4, (canvas.height - s.y) * 1.5 + 4, 3, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${dropHue}, 100%, 75%, ${(1 - (canvas.height - s.y) / 60) * 0.6})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        s.hue = (s.hue + 0.25) % 360;
      });

      frame++;
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [active]);

  if (!active) return null;
  return (
    <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.72 }} />
  );
}

// ── Firecracker Canvas ────────────────────────────────────────
function FirecrackerCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    type Spark = { x: number; y: number; vx: number; vy: number; life: number; decay: number; hue: number; size: number; };
    const sparks: Spark[] = [];
    const HUES = [0, 18, 40, 55, 190, 280];
    const burst = (bx: number, by: number) => {
      const n = 22 + Math.floor(Math.random() * 16);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const sp = 2.5 + Math.random() * 5.5;
        sparks.push({ x: bx, y: by, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1, life: 1, decay: 0.011 + Math.random() * 0.016, hue: HUES[Math.floor(Math.random() * HUES.length)] + Math.random() * 28, size: 1.8 + Math.random() * 2.8 });
      }
    };
    const rockets = Array.from({ length: 7 }, (_, i) => ({ x: (i / 7) * window.innerWidth * 0.8 + window.innerWidth * 0.1, timer: Math.random() * 120 }));
    let raf: number;
    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = 'rgba(6,1,0,0.18)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      rockets.forEach(r => {
        r.timer--;
        if (r.timer <= 0) {
          const bx = r.x + (Math.random() - 0.5) * 140;
          const by = canvas.height * (0.1 + Math.random() * 0.65);
          burst(bx, by);
          setTimeout(() => burst(bx + (Math.random() - 0.5) * 55, by + (Math.random() - 0.5) * 55), 110 + Math.random() * 100);
          r.timer = 85 + Math.random() * 150;
          r.x = window.innerWidth * (0.06 + Math.random() * 0.88);
        }
      });
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx; s.y += s.vy; s.vy += 0.07; s.vx *= 0.985; s.life -= s.decay;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * s.life * 4);
        g.addColorStop(0, `hsla(${s.hue}, 100%, 90%, ${s.life})`);
        g.addColorStop(0.5, `hsla(${s.hue}, 100%, 65%, ${s.life * 0.55})`);
        g.addColorStop(1, `hsla(${s.hue}, 100%, 50%, 0)`);
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size * s.life * 4, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.9 }} />;
}

// ── Jugnu (Firefly) Canvas ────────────────────────────────────
function JugnuCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    type Fly = { x: number; y: number; vx: number; vy: number; phase: number; ps: number; size: number; hue: number; };
    const flies: Fly[] = Array.from({ length: 85 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.65,
      vy: (Math.random() - 0.5) * 0.65,
      phase: Math.random() * Math.PI * 2,
      ps: 0.016 + Math.random() * 0.026,
      size: 1.6 + Math.random() * 3,
      hue: 65 + Math.random() * 55,
    }));
    let raf: number;
    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      flies.forEach(f => {
        f.phase += f.ps;
        f.vx += (Math.random() - 0.5) * 0.032; f.vy += (Math.random() - 0.5) * 0.032;
        f.vx *= 0.976; f.vy *= 0.976;
        f.x += f.vx; f.y += f.vy;
        if (f.x < -30) f.x = canvas.width + 30; if (f.x > canvas.width + 30) f.x = -30;
        if (f.y < -30) f.y = canvas.height + 30; if (f.y > canvas.height + 30) f.y = -30;
        const bright = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(f.phase));
        const gr = f.size * (4 + 7 * bright);
        const go = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, gr * 2.8);
        go.addColorStop(0, `hsla(${f.hue}, 100%, 70%, ${bright * 0.25})`);
        go.addColorStop(1, `hsla(${f.hue}, 100%, 55%, 0)`);
        ctx.beginPath(); ctx.arc(f.x, f.y, gr * 2.8, 0, Math.PI * 2); ctx.fillStyle = go; ctx.fill();
        const gi = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, gr);
        gi.addColorStop(0, `hsla(${f.hue + 15}, 100%, 96%, ${bright})`);
        gi.addColorStop(0.45, `hsla(${f.hue}, 100%, 72%, ${bright * 0.6})`);
        gi.addColorStop(1, `hsla(${f.hue}, 100%, 55%, 0)`);
        ctx.beginPath(); ctx.arc(f.x, f.y, gr, 0, Math.PI * 2); ctx.fillStyle = gi; ctx.fill();
        ctx.beginPath(); ctx.arc(f.x, f.y, f.size * 0.42 * bright + 0.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${f.hue + 20}, 100%, 97%, ${bright})`; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.92 }} />;
}

export function HomePage({ onEnter, onLogin, onRegister, onTutorial, onApiDocs, onPricing, onExplore, onViewForm, onDashboard, onAdmin, playerName, theme, onThemeChange }: Props) {
  const [heroIn,    setHeroIn]    = useState(false);
  const [hovExp,    setHovExp]    = useState<number | null>(null);
  const [hovFeat,   setHovFeat]   = useState<number | null>(null);
  const [hovGallery,setHovGallery]= useState<string | null>(null);
  const [statsVis,  setStatsVis]  = useState(false);
  const [tagIdx,    setTagIdx]    = useState(0);
  const [tagVisible,setTagVisible]= useState(true);
  const [tutorialIdx, setTutorialIdx] = useState(0);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [previewModalId, setPreviewModalId] = useState<string | null>(null);
  const [canHover, setCanHover] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const previewVideoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const themeSelectorRef = useRef<HTMLDivElement>(null);
  const T = THEMES[theme];
  const isDark = theme !== 'light';
  const rainbow     = theme === 'rainbow';
  const firecracker = theme === 'firecracker';
  const jugnu       = theme === 'jugnu';
  const { data: publicForms, isLoading: publicFormsLoading } = trpc.forms.listPublic.useQuery({ limit: HOME_GALLERY_PREVIEW_LIMIT }, { staleTime: 60_000 });
  const publicGalleryPreview = publicForms?.items ?? [];
  const publicGalleryTotal = publicForms?.total ?? 0;
  const previewModalExperience = EXPERIENCES.find((exp) => exp.id === previewModalId) ?? null;

  useEffect(() => { setTimeout(() => setHeroIn(true), 60); }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVis(true); }, { threshold: 0.25 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  // Rotating tagline
  useEffect(() => {
    const cycle = setInterval(() => {
      setTagVisible(false);
      setTimeout(() => { setTagIdx(i => (i + 1) % TAGLINES.length); setTagVisible(true); }, 350);
    }, 2800);
    return () => clearInterval(cycle);
  }, []);

  useEffect(() => {
    document.documentElement.style.colorScheme = theme === 'light' ? 'light' : 'dark';
    return () => {
      document.documentElement.style.colorScheme = 'dark';
    };
  }, [theme]);

  useEffect(() => {
    const cycle = setInterval(() => {
      setTutorialIdx((current) => (current + 1) % Math.min(TUTORIAL_PANELS.length, 6));
    }, 3200);
    return () => clearInterval(cycle);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(hover: hover)');
    const update = () => setCanHover(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    if (!previewModalId) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPreviewModalId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [previewModalId]);

  useEffect(() => {
    if (!themeMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!themeSelectorRef.current?.contains(event.target as Node)) {
        setThemeMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [themeMenuOpen]);

  const tutorialPanel = TUTORIAL_PANELS[tutorialIdx];
  const activeThemeOption = HOME_THEME_OPTIONS.find((option) => option.id === theme) ?? HOME_THEME_OPTIONS[0];

  const fade = (delay: string) => ({
    opacity:    heroIn ? 1 : 0,
    transform:  heroIn ? 'translateY(0)' : 'translateY(22px)',
    transition: `opacity 0.75s ease ${delay}, transform 0.75s ease ${delay}`,
  });

  const handlePrimaryStart = () => {
    if (playerName) {
      onEnter();
      return;
    }
    (onRegister ?? onEnter)();
  };

  const handleExperienceStart = () => {
    if (playerName) {
      onEnter();
      return;
    }
    document.getElementById('tutorial-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const playPreviewVideo = (experienceId: string) => {
    const video = previewVideoRefs.current[experienceId];
    if (!video) return;
    video.currentTime = 0;
    void video.play().catch(() => {});
  };

  const pausePreviewVideo = (experienceId: string) => {
    const video = previewVideoRefs.current[experienceId];
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  const openPreviewModal = (experienceId: string) => {
    pausePreviewVideo(experienceId);
    setPreviewModalId(experienceId);
  };

  const closePreviewModal = () => {
    setPreviewModalId(null);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: T.bg, overflowY: 'auto', overflowX: 'hidden', fontFamily: "'Rajdhani', sans-serif", transition: 'background 0.4s' }}>

      {/* ── Waterfall ── */}
      <WaterfallCanvas active={rainbow} />
      {/* ── Firecracker ── */}
      <FirecrackerCanvas active={firecracker} />
      {/* ── Jugnu ── */}
      <JugnuCanvas active={jugnu} />

      {/* ── Background layers ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${T.gridLine1} 1px, transparent 1px), linear-gradient(90deg, ${T.gridLine2} 1px, transparent 1px)`, backgroundSize: '72px 72px' }} />
        <div style={{ position: 'absolute', inset: 0, background: T.vignette }} />
        <div style={{ position: 'absolute', top: '-18%', left: '-10%', width: '60vw', height: '60vw', background: `radial-gradient(circle, ${T.orb1} 0%, transparent 65%)`, filter: 'blur(90px)', animation: 'orb-drift 14s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '20%', right: '-12%', width: '48vw', height: '48vw', background: `radial-gradient(circle, ${T.orb2} 0%, transparent 65%)`, filter: 'blur(80px)', animation: 'orb-drift 18s ease-in-out infinite 4s' }} />
        <div style={{ position: 'absolute', bottom: '-8%', left: '20%', width: '55vw', height: '32vw', background: `radial-gradient(ellipse, ${T.orb3} 0%, transparent 65%)`, filter: 'blur(90px)', animation: 'orb-drift 22s ease-in-out infinite 9s' }} />
        <div style={{ position: 'absolute', top: '50%', left: '35%', width: '30vw', height: '30vw', background: `radial-gradient(circle, ${T.orb4} 0%, transparent 65%)`, filter: 'blur(90px)', animation: 'orb-drift 26s ease-in-out infinite 6s' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: T.scanLine, animation: 'scan-h 8s linear infinite', pointerEvents: 'none' }} />
      </div>

      {/* ── Nav ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: T.navBg, backdropFilter: 'blur(32px)', borderBottom: `1px solid ${T.navBorder}`, padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: T.navShadow, transition: 'background 0.3s, border-color 0.3s' }}>
        <FormVerseLogo key={`nav-logo-${theme}`} size={34} textSize={14} variant={theme} />
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {([['#experiences','Experiences'],['#gallery','Gallery'],['#features','Features'],['#how','How it works']] as [string,string][]).map(([href, label]) => (
            <a key={href} href={href} style={{ fontSize: 12, color: T.navLinkColor, textDecoration: 'none', letterSpacing: '0.1em', padding: '6px 13px', borderRadius: 7, transition: 'all 0.18s', fontWeight: 700, textTransform: 'uppercase' }}
              onMouseEnter={e => { e.currentTarget.style.color = isDark ? '#fff' : '#000'; e.currentTarget.style.background = T.navLinkHoverBg; e.currentTarget.style.textShadow = T.navLinkHoverShadow; }}
              onMouseLeave={e => { e.currentTarget.style.color = T.navLinkColor; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.textShadow = 'none'; }}>
              {label}
            </a>
          ))}
          {onApiDocs && (
            <button onClick={onApiDocs} style={{ background: 'transparent', border: 'none', fontSize: 12, color: T.navLinkColor, letterSpacing: '0.1em', padding: '6px 13px', borderRadius: 7, transition: 'all 0.18s', fontWeight: 700, cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase' }}
              onMouseEnter={e => { e.currentTarget.style.color = isDark ? '#fff' : '#000'; e.currentTarget.style.background = T.navLinkHoverBg; e.currentTarget.style.textShadow = T.navLinkHoverShadow; }}
              onMouseLeave={e => { e.currentTarget.style.color = T.navLinkColor; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.textShadow = 'none'; }}>
              API Docs
            </button>
          )}
          {playerName && onDashboard && (
            <button onClick={onDashboard} style={{ background: T.loginBg, border: `1px solid ${T.loginBorder}`, fontSize: 12, color: T.loginColor, letterSpacing: '0.1em', padding: '7px 14px', borderRadius: 8, transition: 'all 0.18s', fontWeight: 700, cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase' }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.05)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              Dashboard
            </button>
          )}
          {playerName && onAdmin && (
            <button onClick={onAdmin} style={{ background: T.tutorialBg, border: `1px solid ${T.tutorialBorder}`, fontSize: 12, color: T.tutorialColor, letterSpacing: '0.1em', padding: '7px 14px', borderRadius: 8, transition: 'all 0.18s', fontWeight: 700, cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase' }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.05)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              Admin
            </button>
          )}
          {!playerName && onLogin && (
            <button onClick={onLogin} style={{ background: T.loginBg, border: `1px solid ${T.loginBorder}`, fontSize: 12, color: T.loginColor, letterSpacing: '0.1em', padding: '7px 14px', borderRadius: 8, transition: 'all 0.18s', fontWeight: 700, cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase' }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.05)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              Login
            </button>
          )}
          <div ref={themeSelectorRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setThemeMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={themeMenuOpen}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: theme === 'light' ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${theme === 'light' ? 'rgba(90,40,0,0.16)' : 'rgba(255,255,255,0.18)'}`,
                borderRadius: 8,
                color: theme === 'light' ? '#5c2f00' : '#f4f7ff',
                fontSize: 12,
                fontWeight: 800,
                padding: '7px 12px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: "'Rajdhani', sans-serif",
                cursor: 'pointer',
                boxShadow: theme === 'light' ? '0 8px 18px rgba(255,180,0,0.1)' : '0 8px 22px rgba(0,0,0,0.18)',
              }}>
              <PremiumIcon token={activeThemeOption.icon} size={15} />
              <span>{activeThemeOption.title}</span>
              <span style={{ fontSize: 11, transform: themeMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>▾</span>
            </button>

            {themeMenuOpen && (
              <div
                role="menu"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  width: 240,
                  background: theme === 'light' ? 'rgba(255,252,245,0.98)' : 'rgba(10,8,22,0.96)',
                  border: `1px solid ${theme === 'light' ? 'rgba(90,40,0,0.14)' : 'rgba(255,255,255,0.14)'}`,
                  borderRadius: 18,
                  padding: 10,
                  display: 'grid',
                  gap: 8,
                  boxShadow: theme === 'light' ? '0 18px 40px rgba(140,80,0,0.12)' : '0 24px 60px rgba(0,0,0,0.34)',
                }}>
                {HOME_THEME_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    role="menuitemradio"
                    aria-checked={theme === option.id}
                    onClick={() => {
                      onThemeChange(option.id);
                      setThemeMenuOpen(false);
                    }}
                    title={option.title}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      background: theme === option.id
                        ? (theme === 'light' ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.14)')
                        : (theme === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.04)'),
                      border: `1px solid ${theme === option.id
                        ? (theme === 'light' ? 'rgba(90,40,0,0.22)' : 'rgba(255,255,255,0.42)')
                        : (theme === 'light' ? 'rgba(90,40,0,0.1)' : 'rgba(255,255,255,0.12)')}`,
                      borderRadius: 14,
                      padding: '10px 12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: theme === option.id ? `0 0 16px ${option.glow}, 0 0 24px ${option.glow}` : 'none',
                      color: theme === 'light' ? '#2b1700' : '#f8fbff',
                      fontFamily: "'Rajdhani', sans-serif",
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                    }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <PremiumIcon token={option.icon} size={16} />
                      <span style={{ fontSize: 12, textTransform: 'uppercase' }}>{option.title}</span>
                    </span>
                    <span style={{ fontSize: 11, opacity: theme === option.id ? 1 : 0.35 }}>{theme === option.id ? 'Active' : 'Select'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 60px', textAlign: 'center', position: 'relative', zIndex: 1 }}>

        {/* Main title */}
        <div key={`hero-wordmark-${theme}`} style={{ ...fade('0.1s'), marginBottom: 18 }}>
          <h1 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(56px, 12vw, 130px)', fontWeight: 900, lineHeight: 0.95, margin: 0, letterSpacing: '0.02em', position: 'relative', display: 'inline-block' }}>
            <span style={{ display: 'block', color: isDark ? '#ffffff' : '#111111', background: isDark ? `linear-gradient(140deg, #ffffff 0%, ${T.dot1} 25%, #ff4dff 55%, #ffe600 80%, ${T.dot1} 100%)` : 'linear-gradient(140deg, #111111 0%, #2a2a2a 26%, #cc3300 54%, #ff9900 82%, #ffd24a 100%)', backgroundSize: '250% 250%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'word-shimmer 5s ease-in-out infinite', filter: `drop-shadow(0 0 ${isDark ? 54 : 12}px rgba(139,47,255,${isDark ? 0.52 : 0.08}))`, textShadow: isDark ? '0 1px 0 rgba(255,255,255,0.08), 0 0 16px rgba(6, 4, 18, 0.44)' : '0 1px 0 rgba(255,255,255,0.72), 0 4px 10px rgba(0, 0, 0, 0.12)' }}>
              Form
            </span>
            <span style={{ display: 'block', color: isDark ? T.dot1 : '#111111', background: isDark ? `linear-gradient(140deg, ${T.dot1} 0%, #ff00aa 30%, #c084fc 60%, #ffe600 85%, ${T.dot1} 100%)` : 'linear-gradient(140deg, #111111 0%, #444444 26%, #7c3aed 56%, #ffb000 84%, #ff7700 100%)', backgroundSize: '250% 250%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'word-shimmer 5s ease-in-out infinite 0.8s', filter: `drop-shadow(0 0 ${isDark ? 54 : 12}px rgba(0,245,255,${isDark ? 0.42 : 0.06}))`, textShadow: isDark ? '0 0 18px rgba(6, 4, 18, 0.4)' : '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
              Verse
            </span>
          </h1>
        </div>

        {/* Animated tagline */}
        <div style={{ ...fade('0.25s'), height: 32, marginBottom: 32, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: 'clamp(16px, 2.2vw, 22px)', color: T.tagColor, letterSpacing: '0.06em', margin: 0, fontWeight: 600, opacity: tagVisible ? 1 : 0, transform: tagVisible ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 0.35s ease, transform 0.35s ease', textShadow: T.tagShadow }}>
            {TAGLINES[tagIdx]}
          </p>
        </div>

        {/* CTA buttons */}
        <div style={{ ...fade('0.5s'), display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 64 }}>
          <button onClick={handlePrimaryStart}
            style={{ background: T.ctaBg, border: 'none', borderRadius: 14, color: '#fff', fontSize: 16, fontWeight: 800, padding: '18px 48px', cursor: 'pointer', letterSpacing: '0.12em', fontFamily: "'Rajdhani', sans-serif", boxShadow: T.ctaShadow, transition: 'all 0.2s', position: 'relative', overflow: 'hidden', textShadow: '0 0 8px rgba(255,255,255,0.5)' }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.2)'; e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}>
            {playerName ? 'Choose Your Experience' : 'Create Free Account'}
          </button>
          {onApiDocs && (
            <button onClick={onApiDocs}
              style={{ background: isDark ? 'rgba(246, 196, 112, 0.08)' : 'rgba(53, 16, 0, 0.06)', border: `1px solid ${isDark ? 'rgba(246, 196, 112, 0.42)' : 'rgba(53, 16, 0, 0.16)'}`, borderRadius: 14, color: isDark ? '#f6d59b' : '#351000', fontSize: 16, fontWeight: 800, padding: '18px 30px', cursor: 'pointer', letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif", transition: 'all 0.2s', boxShadow: isDark ? '0 18px 40px rgba(0, 0, 0, 0.24)' : '0 16px 34px rgba(171, 81, 0, 0.12)' }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              Browse API Docs
            </button>
          )}
          <button onClick={() => document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ background: T.tutorialBg, border: `1px solid ${T.tutorialBorder}`, borderRadius: 14, color: T.tutorialColor, fontSize: 16, fontWeight: 800, padding: '18px 32px', cursor: 'pointer', letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif", transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            See Experiences First
          </button>
        </div>

        <div style={{ ...fade('0.58s'), display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 54, maxWidth: 860 }}>
          {[
            '3 distinct builder experiences',
            '5 visual modes: Dark, Light, Rainbow, Firecracker, Jugnu',
            'Account setup in one screen',
            'Custom slugs, passwords, expiry, and response caps',
          ].map((item) => (
            <div key={item} style={{ background: T.expChipBg, border: `1px solid ${T.expChipBorder}`, borderRadius: 999, padding: '9px 14px', fontSize: 12, color: T.expChipColor, letterSpacing: '0.06em' }}>
              {item}
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div style={{ ...fade('0.7s'), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.4, cursor: 'pointer' }} onClick={() => document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' })}>
          <span style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: T.scrollColor }}>Explore Worlds</span>
          <div style={{ width: 1, height: 36, background: `linear-gradient(180deg, ${T.scrollColor}, transparent)`, animation: 'float-slow 2s ease-in-out infinite' }} />
        </div>
      </section>

      <section id="tutorial-preview" style={{ padding: '24px 24px 100px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.sectionLabel, letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 10, textShadow: T.sectionLabelShadow }}>✦ Tutorial Preview</div>
            <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 900, color: isDark ? '#f7f4ff' : '#351000', background: T.h2Gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textShadow: isDark ? '0 0 16px rgba(8, 4, 26, 0.24)' : '0 1px 0 rgba(255,255,255,0.6), 0 6px 14px rgba(171, 81, 0, 0.14)', margin: '0 0 12px' }}>See How FormVerse Works</h2>
            <p style={{ fontSize: 14, color: T.subText, maxWidth: 620, margin: '0 auto', lineHeight: 1.7 }}>Themes here mean the visual modes you can switch on the home page: Dark, Light, Rainbow, Firecracker, and Jugnu. Pick the mood you want before entering the builder.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(280px, 0.75fr)', gap: 22, alignItems: 'stretch' }}>
            <button
              onClick={onTutorial}
              style={{ position: 'relative', overflow: 'hidden', minHeight: 420, borderRadius: 26, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(88, 36, 0, 0.12)'}`, background: tutorialPanel.bg, boxShadow: isDark ? '0 26px 80px rgba(0,0,0,0.34)' : '0 24px 60px rgba(171, 81, 0, 0.14)', padding: 0, cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,255,255,0.03), transparent 28%, rgba(0,0,0,0.34) 100%)' }} />
              <div style={{ position: 'absolute', top: 18, left: 18, right: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.34)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999, padding: '7px 12px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5449', boxShadow: '14px 0 0 #ffbd2e, 28px 0 0 #28c840', marginRight: 28 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.84)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Tutorial Preview</span>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.34)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999, padding: '7px 12px', fontSize: 11, fontWeight: 700, color: tutorialPanel.accent, letterSpacing: '0.14em' }}>Step {tutorialPanel.step + 1}</div>
              </div>

              <div style={{ position: 'absolute', top: 74, left: 18, right: 18, display: 'flex', gap: 8, zIndex: 2 }}>
                {TUTORIAL_PANELS.slice(0, 6).map((panel, idx) => (
                  <div key={panel.step} style={{ flex: 1, height: 4, borderRadius: 999, background: idx === tutorialIdx ? tutorialPanel.accent : 'rgba(255,255,255,0.14)', boxShadow: idx === tutorialIdx ? `0 0 14px ${tutorialPanel.glow}` : 'none', transition: 'all 0.25s ease' }} />
                ))}
              </div>

              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: 420, padding: '120px 28px 30px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 76, height: 76, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', boxShadow: `0 0 26px ${tutorialPanel.glow}55`, fontSize: 34, marginBottom: 18 }}>
                  {tutorialPanel.icon}
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: tutorialPanel.accent, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 10 }}>{tutorialPanel.hint || 'Cinematic walkthrough'}</div>
                <h3 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(26px, 4vw, 40px)', lineHeight: 1.05, fontWeight: 900, color: '#fff8ef', margin: '0 0 12px', textShadow: '0 0 20px rgba(0,0,0,0.26)' }}>{tutorialPanel.title}</h3>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.88)', maxWidth: 620, margin: '0 0 10px' }}>{tutorialPanel.text}</p>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.64)', maxWidth: 640, margin: 0 }}>{tutorialPanel.subtext}</p>
              </div>
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: T.featCardBg, border: `1px solid ${T.featCardBorder}`, borderRadius: 22, padding: '22px 20px' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: T.sectionLabel, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 12 }}>What you learn</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {TUTORIAL_PANELS.slice(1, 5).map((panel, idx) => (
                    <div key={panel.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 12px', background: idx === tutorialIdx - 1 ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.42)') : 'transparent', border: `1px solid ${idx === tutorialIdx - 1 ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(88,36,0,0.08)') : 'transparent'}`, borderRadius: 14, transition: 'all 0.22s ease' }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: `${panel.accent}20`, border: `1px solid ${panel.accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{panel.icon}</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#fff2f0' : '#351000', marginBottom: 3 }}>{panel.title.replace('STEP ', '').replace(/\d+: /, '')}</div>
                        <div style={{ fontSize: 11.5, lineHeight: 1.55, color: T.featDescColor }}>{panel.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: isDark ? 'linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))' : 'linear-gradient(160deg, rgba(255,255,255,0.72), rgba(255,247,232,0.72))', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(88,36,0,0.1)'}`, borderRadius: 22, padding: '22px 20px' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: isDark ? '#fff' : '#2c1100', marginBottom: 8 }}>Want the full walkthrough?</div>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: T.subText, margin: '0 0 18px' }}>Open the cinematic tutorial to see all steps with motion, hints, and the complete first-run story.</p>
                <button onClick={onTutorial}
                  style={{ width: '100%', background: T.ctaBg, border: 'none', borderRadius: 14, color: '#fff', fontSize: 14, fontWeight: 800, padding: '15px 18px', cursor: 'pointer', letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif", boxShadow: T.ctaShadow }}>
                  Watch Full Tutorial
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '100px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.sectionLabel, letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 10, textShadow: T.sectionLabelShadow }}>✦ The Toolkit</div>
            <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 900, color: isDark ? '#f7f4ff' : '#351000', background: T.h2Gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textShadow: isDark ? '0 0 16px rgba(8, 4, 26, 0.24)' : '0 1px 0 rgba(255,255,255,0.6), 0 6px 14px rgba(171, 81, 0, 0.14)', margin: '0 0 12px' }}>Everything You Need</h2>
            <p style={{ fontSize: 14, color: T.subText, maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>A complete form builder with controlled publishing built in: design visually, then ship with custom links, password protection, expiry dates, and response limits.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {FEATURES.map((f, i) => {
              const isH = hovFeat === i;
              const accent = ['#00c8ff', '#00e8a0', '#cc30ff', '#ffcc00', '#ff0090', '#ff5500', '#ff30dd', '#00a8cc'][i];
              const wide = i === 0 || i === 4;
              return (
                <div key={i}
                  onMouseEnter={() => setHovFeat(i)}
                  onMouseLeave={() => setHovFeat(null)}
                  style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: isH ? `${accent}${isDark ? '12' : '09'}` : T.featCardBg, border: `1px solid ${isH ? accent + (isDark ? '45' : '30') : T.featCardBorder}`, borderRadius: 16, padding: '22px 20px', transition: 'all 0.22s', animation: `card-enter 0.4s ease-out ${i * 0.05}s both`, transform: isH ? 'translateY(-3px)' : 'none', boxShadow: isH ? `0 10px 28px rgba(0,0,0,${isDark ? 0.35 : 0.12}), 0 0 22px ${accent}22` : 'none', gridColumn: wide ? 'span 2' : 'span 1' }}>
                  <div style={{ width: 50, height: 50, borderRadius: 14, background: `${accent}${isDark ? '20' : '15'}`, border: `1px solid ${accent}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, transition: 'all 0.22s', boxShadow: isH ? `0 0 18px ${accent}45` : 'none' }}>{f.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: accent, marginBottom: 5, letterSpacing: '0.03em' }}>{f.label}</div>
                    <div style={{ fontSize: 11.5, color: T.featDescColor, lineHeight: 1.65 }}>{f.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Experiences ── */}
      <section id="experiences" style={{ padding: '100px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.sectionLabel, letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 10, textShadow: T.sectionLabelShadow }}>✦ The Experiences</div>
            <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 900, color: isDark ? '#f7f4ff' : '#351000', background: T.h2Gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textShadow: isDark ? '0 0 16px rgba(8, 4, 26, 0.24)' : '0 1px 0 rgba(255,255,255,0.6), 0 6px 14px rgba(171, 81, 0, 0.14)', margin: '0 0 12px' }}>Three Ways to Build Forms</h2>
            <p style={{ fontSize: 14, color: T.subText, maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>Same powerful builder, three radically different worlds. Pick the one that fits your vibe.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {EXPERIENCES.map((exp, i) => {
              const isH = hovExp === i;
              const cardBg = isH ? T.expCardBgHov(exp.color) : T.expCardBgIdle(exp.color);
              return (
                <div key={exp.id}
                  onMouseEnter={() => setHovExp(i)}
                  onMouseLeave={() => setHovExp(null)}
                  style={{ background: cardBg, border: `1.5px solid ${isH ? exp.border : exp.color + '30'}`, borderRadius: 22, overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)', transform: isH ? 'translateY(-10px) scale(1.015)' : 'none', boxShadow: isH ? `0 28px 64px rgba(0,0,0,${isDark ? 0.6 : 0.15}), 0 0 56px ${exp.glow}` : `0 4px 20px rgba(0,0,0,${isDark ? 0.3 : 0.08}), inset 0 1px 0 ${exp.color}14`, cursor: 'pointer', display: 'flex', flexDirection: 'column', animation: `card-enter 0.55s ease-out ${i * 0.12}s both` }}>
                  <div style={{ background: exp.bg, padding: '34px 30px 26px', borderBottom: `1px solid ${isH ? exp.border : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)')}`, transition: 'border-color 0.3s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                      <span style={{ fontSize: 46, filter: isH ? `drop-shadow(0 0 20px ${exp.color}bb)` : 'none', transition: 'filter 0.3s', display: 'inline-block', transform: isH ? 'scale(1.1)' : 'scale(1)', transitionProperty: 'filter, transform' }}>{exp.emoji}</span>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 10, fontWeight: 700, color: isH ? exp.color : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)'), letterSpacing: '0.22em', transition: 'color 0.3s' }}>EXP {exp.num}</div>
                        <div style={{ width: 32, height: 2, background: isH ? `linear-gradient(90deg, transparent, ${exp.color})` : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'), borderRadius: 2, marginTop: 4, marginLeft: 'auto', transition: 'all 0.3s' }} />
                      </div>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: isH ? exp.color : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'), letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 7, transition: 'color 0.3s' }}>{exp.subtitle}</div>
                    <h3 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 900, color: T.expH3, margin: '0 0 10px', lineHeight: 1.1 }}>{exp.title}</h3>
                    <p style={{ fontSize: 13, color: T.expDesc, lineHeight: 1.7, margin: 0 }}>{exp.desc}</p>
                  </div>
                  <div style={{ padding: '22px 30px', flex: 1 }}>
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ fontSize: 10, color: isH ? exp.color : T.expChipLabel, letterSpacing: '0.22em', textTransform: 'uppercase', transition: 'color 0.3s' }}>Preview footage</div>
                        <div style={{ fontSize: 10, color: isDark ? 'rgba(255,255,255,0.26)' : 'rgba(0,0,0,0.3)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>{canHover ? 'Hover to play' : 'Tap to expand'}</div>
                      </div>
                      <div
                        onMouseEnter={() => playPreviewVideo(exp.id)}
                        onMouseLeave={() => pausePreviewVideo(exp.id)}
                        onFocus={() => playPreviewVideo(exp.id)}
                        onBlur={() => pausePreviewVideo(exp.id)}
                        onClick={() => openPreviewModal(exp.id)}
                        style={{ position: 'relative', overflow: 'hidden', borderRadius: 18, border: `1px solid ${isH ? exp.border : exp.color + '22'}`, background: isDark ? 'rgba(0,0,0,0.28)' : 'rgba(255,255,255,0.58)', boxShadow: isH ? `0 0 24px ${exp.glow}` : 'inset 0 1px 0 rgba(255,255,255,0.04)', aspectRatio: '16 / 9', cursor: 'pointer' }}
                        role="button"
                        tabIndex={0}
                        aria-label={`Open ${exp.title} preview video`}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            openPreviewModal(exp.id);
                          }
                        }}
                      >
                        <video
                          src={exp.previewVideo}
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          aria-label={`${exp.title} preview video`}
                          ref={(node) => {
                            previewVideoRefs.current[exp.id] = node;
                          }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: isH ? 'scale(1.03)' : 'scale(1)', transition: 'transform 0.45s ease', filter: isDark ? 'saturate(1.02) contrast(1.02)' : 'saturate(1.05) contrast(1.01)' }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${isDark ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'} 0%, transparent 35%, ${isDark ? 'rgba(6,0,18,0.22)' : 'rgba(60,20,0,0.1)'} 100%)`, pointerEvents: 'none' }} />
                        <div style={{ position: 'absolute', top: 12, left: 12, display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(0,0,0,0.45)', border: `1px solid ${exp.color}44`, borderRadius: 999, padding: '6px 10px', color: '#fff8ef', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', backdropFilter: 'blur(12px)', pointerEvents: 'none' }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: exp.color, boxShadow: `0 0 12px ${exp.color}` }} />
                          Experience preview
                        </div>
                        <div style={{ position: 'absolute', right: 12, bottom: 12, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(8,8,14,0.5)', border: `1px solid ${exp.color}44`, borderRadius: 999, padding: '8px 12px', color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', boxShadow: isH ? `0 0 18px ${exp.glow}` : 'none', backdropFilter: 'blur(12px)', pointerEvents: 'none', opacity: isH ? 0.92 : 0.72, transition: 'opacity 0.22s ease, box-shadow 0.22s ease' }}>
                          <span style={{ width: 22, height: 22, borderRadius: '50%', background: `linear-gradient(135deg, ${exp.color}, rgba(255,255,255,0.92))`, color: '#160014', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>▶</span>
                          {canHover ? 'Hover to play' : 'Tap to preview'}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: T.expChipLabel, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 10 }}>{exp.chipsLabel}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {exp.formTypes.map((w, wi) => (
                        <span key={wi} style={{ fontSize: 11, background: isH ? `${exp.color}14` : T.expChipBg, border: `1px solid ${isH ? exp.color + '30' : T.expChipBorder}`, borderRadius: 20, padding: '3px 10px', color: isH ? (isDark ? 'rgba(255,255,255,0.82)' : 'rgba(0,0,0,0.75)') : T.expChipColor, transition: 'all 0.3s', transitionDelay: `${wi * 0.02}s` }}>{w}</span>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="gallery" style={{ padding: '0 24px 100px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.sectionLabel, letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 10, textShadow: T.sectionLabelShadow }}>✦ Public Form Gallery</div>
            <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 900, color: isDark ? '#f7f4ff' : '#351000', background: T.h2Gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textShadow: isDark ? '0 0 16px rgba(8, 4, 26, 0.24)' : '0 1px 0 rgba(255,255,255,0.6), 0 6px 14px rgba(171, 81, 0, 0.14)', margin: '0 0 12px' }}>Try Real Public Forms</h2>
            <p style={{ fontSize: 14, color: T.subText, maxWidth: 720, margin: '0 auto', lineHeight: 1.7 }}>Browse public forms created for Realm Runner, Globe Explorer, and The Library. Open any card, submit it, and experience the respondent flow exactly as your users will.</p>
            {!publicFormsLoading && publicGalleryTotal > 0 && (
              <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: T.expChipColor, background: T.expChipBg, border: `1px solid ${T.expChipBorder}`, borderRadius: 999, padding: '6px 12px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Showing {Math.min(publicGalleryPreview.length, HOME_GALLERY_PREVIEW_LIMIT)} of {publicGalleryTotal}
                </span>
                {onExplore && publicGalleryTotal > HOME_GALLERY_PREVIEW_LIMIT && (
                  <button
                    onClick={onExplore}
                    style={{ background: 'transparent', border: `1px solid ${T.tutorialBorder}`, borderRadius: 999, color: T.tutorialColor, fontSize: 11, fontWeight: 800, padding: '8px 14px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    View All Public Forms
                  </button>
                )}
              </div>
            )}
          </div>

          {publicFormsLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} style={{ minHeight: 210, borderRadius: 20, background: T.featCardBg, border: `1px solid ${T.featCardBorder}`, opacity: 0.7 }} />
              ))}
            </div>
          ) : publicGalleryPreview.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {publicGalleryPreview.map((form) => {
                const meta = getPublicFormMeta(form.worldTheme);
                const isH = hovGallery === form.id;
                return (
                  <button
                    key={form.id}
                    onClick={() => onViewForm?.(form.slug)}
                    onMouseEnter={() => setHovGallery(form.id)}
                    onMouseLeave={() => setHovGallery(null)}
                    style={{
                      textAlign: 'left',
                      minHeight: 210,
                      borderRadius: 20,
                      padding: '22px 22px 20px',
                      border: `1px solid ${isH ? `${meta.color}55` : T.featCardBorder}`,
                      background: isH ? T.expCardBgHov(meta.color) : T.expCardBgIdle(meta.color),
                      boxShadow: isH ? `0 18px 40px rgba(0,0,0,${isDark ? 0.45 : 0.14}), 0 0 20px ${meta.color}22` : 'none',
                      transform: isH ? 'translateY(-4px)' : 'translateY(0)',
                      transition: 'all 0.22s ease',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: meta.color, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6 }}>{meta.label}</div>
                        <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 17, fontWeight: 900, color: T.expH3, lineHeight: 1.35 }}>{form.title}</div>
                      </div>
                      <div style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${meta.color}18`, border: `1px solid ${meta.color}33`, color: meta.color }}><PremiumIcon token={meta.emoji} size={20} /></div>
                    </div>

                    <p style={{ fontSize: 12.5, lineHeight: 1.65, color: T.expDesc, margin: 0 }}>{form.description || 'Open this public form and test the live submission experience.'}</p>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: T.expChipColor, background: T.expChipBg, border: `1px solid ${T.expChipBorder}`, borderRadius: 999, padding: '5px 10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Public</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: T.expChipColor, background: T.expChipBg, border: `1px solid ${T.expChipBorder}`, borderRadius: 999, padding: '5px 10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Live Submission</span>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}` }}>
                      <span style={{ fontSize: 11, color: T.featDescColor }}>No login required</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: meta.color, letterSpacing: '0.08em' }}>Try Form →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', borderRadius: 22, background: T.featCardBg, border: `1px solid ${T.featCardBorder}`, padding: '38px 24px' }}>
              <div style={{ fontSize: 42, marginBottom: 12 }}>🪄</div>
              <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 18, color: isDark ? '#fff' : '#351000', marginBottom: 8 }}>Gallery Seeds Loading Soon</div>
              <p style={{ fontSize: 13, color: T.featDescColor, margin: 0 }}>No public forms are available yet. Seeded showcase forms will appear here once the database migrations are applied.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" style={{ padding: '100px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.sectionLabel, letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 10, textShadow: T.sectionLabelShadow }}>✦ The Flow</div>
            <h2 style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 900, color: isDark ? '#f7f4ff' : '#351000', background: T.h2Gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', textShadow: isDark ? '0 0 16px rgba(8, 4, 26, 0.24)' : '0 1px 0 rgba(255,255,255,0.6), 0 6px 14px rgba(171, 81, 0, 0.14)', margin: 0 }}>How It Works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 40, left: '6%', right: '6%', height: 2, background: T.stepConnector, pointerEvents: 'none', borderRadius: 2, animation: 'line-grow 1.5s ease-out 0.3s both', transformOrigin: 'left' }} />
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 16px', position: 'relative', animation: `card-enter 0.55s ease-out ${i * 0.12}s both` }}>
                <div style={{ width: 82, height: 82, borderRadius: '50%', background: T.stepCircleBg, border: `2px solid ${T.stepCircleBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 22, position: 'relative', zIndex: 1, backdropFilter: 'blur(4px)', boxShadow: T.stepCircleShadow }}>
                  {s.icon}
                  <span style={{ position: 'absolute', top: -9, right: -9, width: 26, height: 26, borderRadius: '50%', background: T.stepNumBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#fff', fontFamily: "'Cinzel Decorative', serif", border: `2px solid ${T.stepNumBorder}`, boxShadow: T.stepNumShadow }}>{s.n}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.stepTitle, marginBottom: 6, letterSpacing: '0.04em', textShadow: T.stepTitleShadow }}>{s.title}</div>
                <div style={{ fontSize: 12, color: T.stepDesc, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PricingSection sectionId="pricing" onEnter={handlePrimaryStart} embedded surface={theme === 'light' ? 'light' : 'dark'} />

      {previewModalExperience && (
        <div
          onClick={closePreviewModal}
          style={{ position: 'fixed', inset: 0, zIndex: 180, background: 'rgba(3,4,10,0.82)', backdropFilter: 'blur(18px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 18px' }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{ width: 'min(1080px, 100%)', maxHeight: '100%', borderRadius: 28, overflow: 'hidden', background: isDark ? 'linear-gradient(180deg, rgba(10,10,18,0.98), rgba(4,4,10,0.98))' : 'linear-gradient(180deg, rgba(255,251,242,0.98), rgba(255,246,232,0.98))', border: `1px solid ${previewModalExperience.border}`, boxShadow: `0 36px 120px rgba(0,0,0,0.55), 0 0 60px ${previewModalExperience.glow}` }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '18px 20px', background: previewModalExperience.bg, borderBottom: `1px solid ${previewModalExperience.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: `${previewModalExperience.color}24`, border: `1px solid ${previewModalExperience.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: `0 0 22px ${previewModalExperience.glow}` }}>{previewModalExperience.emoji}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: previewModalExperience.color, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6 }}>{previewModalExperience.subtitle}</div>
                  <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 900, color: isDark ? '#fff8ef' : '#2c1100', lineHeight: 1.15 }}>{previewModalExperience.title}</div>
                </div>
              </div>
              <button
                onClick={closePreviewModal}
                style={{ background: isDark ? 'rgba(0,0,0,0.36)' : 'rgba(255,255,255,0.55)', border: `1px solid ${previewModalExperience.border}`, color: isDark ? '#fff' : '#1f0b00', borderRadius: 12, padding: '10px 14px', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif" }}
              >
                Close
              </button>
            </div>

            <div style={{ padding: 18 }}>
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 22, border: `1px solid ${previewModalExperience.border}`, background: '#05070d', boxShadow: `0 0 28px ${previewModalExperience.glow}`, aspectRatio: '16 / 9' }}>
                <video
                  key={previewModalExperience.id}
                  src={previewModalExperience.previewVideo}
                  autoPlay
                  muted
                  controls
                  loop
                  playsInline
                  preload="metadata"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', padding: '16px 4px 6px' }}>
                <p style={{ margin: 0, maxWidth: 760, fontSize: 13.5, lineHeight: 1.7, color: isDark ? 'rgba(255,255,255,0.72)' : 'rgba(44,17,0,0.72)' }}>{previewModalExperience.desc}</p>
                <button
                  onClick={() => {
                    closePreviewModal();
                    handleExperienceStart();
                  }}
                  style={{ background: `linear-gradient(135deg, ${previewModalExperience.color}, rgba(255,255,255,0.92))`, border: `1px solid ${previewModalExperience.border}`, borderRadius: 14, color: '#120014', fontSize: 12, fontWeight: 900, padding: '13px 18px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", letterSpacing: '0.12em', textTransform: 'uppercase', boxShadow: `0 0 24px ${previewModalExperience.glow}` }}
                >
                  {playerName ? `Open ${previewModalExperience.title}` : `Enter ${previewModalExperience.title}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats bar ── */}
      <div ref={statsRef} style={{ background: T.statsBg, borderTop: `1px solid ${T.statsBorderT}`, borderBottom: `1px solid ${T.statsBorderB}`, padding: '52px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 32, textAlign: 'center' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ opacity: statsVis ? 1 : 0, transform: statsVis ? 'translateY(0)' : 'translateY(20px)', transition: `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s` }}>
              {(() => {
                const statColor = theme === 'light' && s.l === 'Worlds' ? '#8a5a00' : s.c;
                const statGlow = theme === 'light' && s.l === 'Worlds'
                  ? 'drop-shadow(0 0 10px rgba(255, 179, 0, 0.28))'
                  : `drop-shadow(0 0 10px ${s.c})`;
                const valueGlow = theme === 'light' && s.l === 'Worlds'
                  ? 'drop-shadow(0 0 10px rgba(255, 179, 0, 0.26)) drop-shadow(0 0 20px rgba(255, 179, 0, 0.18))'
                  : `drop-shadow(0 0 18px ${s.c}) drop-shadow(0 0 40px ${s.c}88)`;

                return (
                  <>
                    <div style={{ fontSize: 30, marginBottom: 8, filter: statGlow }}>{s.icon}</div>
                    <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(24px, 3.5vw, 42px)', fontWeight: 900, color: statColor, lineHeight: 1, filter: valueGlow }}>{s.v}</div>
                  </>
                );
              })()}
              <div style={{ fontSize: 10, color: T.statsLabel, letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: 6 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{ padding: '28px 36px', background: T.footerBg, borderTop: '1px solid transparent', borderImage: `${T.footerBorder} 1`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, position: 'relative', zIndex: 1 }}>
        <FormVerseLogo key={`footer-logo-${theme}`} size={28} textSize={12} variant={theme} />
        <span style={{ fontSize: 10, color: T.statsLabel, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Realm Runner · Globe Explorer · The Library</span>
        <span style={{ fontSize: 10, color: T.copyright, letterSpacing: '0.18em', textTransform: 'uppercase' }}>© 2026 FormVerse</span>
      </footer>
    </div>
  );
}
