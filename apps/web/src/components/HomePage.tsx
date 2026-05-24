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
  onEnablePayments?: (planId: 'adventurer' | 'legend') => void;
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
  bg:          'linear-gradient(145deg, #06070d 0%, #120d18 38%, #24111b 100%)',
  navBg:       'rgba(10,14,21,0.78)',
  navBorder:   'rgba(255,202,110,0.22)',
  navShadow:   '0 20px 48px rgba(0,0,0,0.34)',
  gridLine1:   'rgba(255,202,110,0.06)',
  gridLine2:   'rgba(155,86,103,0.05)',
  vignette:    'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 28%, rgba(4,6,12,0.9) 100%)',
  orb1:        'rgba(112,52,68,0.26)',
  orb2:        'rgba(201,94,120,0.2)',
  orb3:        'rgba(255,202,110,0.16)',
  orb4:        'rgba(111,47,67,0.14)',
  scanLine:    'linear-gradient(90deg, transparent 0%, rgba(255,202,110,0.72) 28%, rgba(214,110,136,0.56) 58%, rgba(111,47,67,0.54) 82%, transparent 100%)',
  navLinkColor:'rgba(223,228,239,0.78)',
  navLinkHoverBg: 'rgba(255,255,255,0.06)',
  navLinkHoverShadow: '0 0 12px rgba(209,176,112,0.24)',
  divider:     'linear-gradient(180deg, rgba(209,176,112,0.42), rgba(126,150,191,0.22))',
  tutorialBg:  'rgba(214,188,134,0.08)',
  tutorialBorder: 'rgba(214,188,134,0.24)',
  tutorialColor: '#ffd995',
  loginBg:     'rgba(198,94,120,0.1)',
  loginBorder: 'rgba(198,94,120,0.28)',
  loginColor:  '#f1ccd7',
  signupBg:    'linear-gradient(135deg, #fff1c4 0%, #ffca6e 28%, #c65e78 60%, #6f2f43 100%)',
  signupShadow:'0 20px 44px rgba(0,0,0,0.34), 0 0 28px rgba(255,202,110,0.2)',
  dot1:        '#ffca6e',
  tagColor:    '#d6def0',
  tagShadow:   '0 0 20px rgba(198,94,120,0.24)',
  ctaBg:       'linear-gradient(135deg, #fff3cf 0%, #ffca6e 24%, #d86e88 56%, #7c3248 100%)',
  ctaShadow:   '0 24px 56px rgba(0,0,0,0.38), 0 0 30px rgba(255,202,110,0.22)',
  scrollColor: '#f0c270',
  sectionLabel:'#ffca6e',
  sectionLabelShadow: '0 0 16px rgba(255,202,110,0.28)',
  h2Gradient:  'linear-gradient(135deg, #fff8ea 0%, #ffca6e 34%, #c65e78 100%)',
  subText:     'rgba(216,223,237,0.68)',
  featCardBg:  'rgba(255,255,255,0.028)',
  featCardBorder: 'rgba(222,228,239,0.08)',
  featDescColor: 'rgba(210,217,232,0.6)',
  expCardBgIdle: (c: string) => `linear-gradient(160deg, ${c}10 0%, rgba(10,13,20,0.9) 64%)`,
  expCardBgHov:  (c: string) => `linear-gradient(160deg, ${c}1d 0%, rgba(14,17,27,0.98) 64%)`,
  expH3:       '#f5f1e8',
  expDesc:     'rgba(221,227,239,0.62)',
  expChipLabel:'rgba(255,255,255,0.22)',
  expChipBg:   'rgba(255,255,255,0.04)',
  expChipBorder:'rgba(255,255,255,0.06)',
  expChipColor:'rgba(255,255,255,0.3)',
  stepCircleBg:'linear-gradient(135deg, rgba(198,94,120,0.24), rgba(255,202,110,0.12))',
  stepCircleBorder: 'rgba(214,110,136,0.5)',
  stepCircleShadow: '0 0 32px rgba(198,94,120,0.28), 0 0 12px rgba(255,202,110,0.16)',
  stepNumBg:   'linear-gradient(135deg, #7c3248, #ffca6e)',
  stepNumBorder: 'rgba(8,0,26,1)',
  stepNumShadow: '0 0 12px rgba(124,50,72,0.56), 0 0 8px rgba(255,202,110,0.4)',
  stepConnector: 'linear-gradient(90deg, transparent, rgba(198,94,120,0.5), rgba(255,202,110,0.45), rgba(111,47,67,0.45), transparent)',
  stepTitle:   '#f6e6eb',
  stepTitleShadow: '0 0 8px rgba(198,94,120,0.22)',
  stepDesc:    'rgba(236,191,205,0.56)',
  statsBg:     'linear-gradient(135deg, rgba(12,16,24,0.88), rgba(22,18,28,0.88))',
  statsBorderT:'rgba(255,202,110,0.24)',
  statsBorderB:'rgba(198,94,120,0.18)',
  statsLabel:  'rgba(214,221,236,0.54)',
  footerBg:    'rgba(8,10,16,0.96)',
  footerBorder:'linear-gradient(90deg, rgba(255,202,110,0.44), rgba(198,94,120,0.32), rgba(111,47,67,0.34))',
  panelBg:     'rgba(13,16,24,0.78)',
  panelBorder: 'rgba(227,231,240,0.12)',
  panelShadow: '0 26px 60px rgba(0,0,0,0.38)',
  panelActiveBg: 'rgba(255,255,255,0.08)',
  panelActiveBorder: 'rgba(255,202,110,0.3)',
  heroPrimaryGradient: 'linear-gradient(140deg, #fffdf6 0%, #ffca6e 40%, #c65e78 100%)',
  heroSecondaryGradient: 'linear-gradient(140deg, #ffe2a0 0%, #d86e88 46%, #7c3248 100%)',
  heroPrimaryShadow: 'drop-shadow(0 0 30px rgba(255,202,110,0.2))',
  heroSecondaryShadow: 'drop-shadow(0 0 26px rgba(198,94,120,0.18))',
  softButtonBg: 'rgba(255,249,238,0.04)',
  softButtonBorder: 'rgba(214,188,134,0.18)',
  softButtonColor: '#ead4a5',
  softButtonShadow: '0 18px 36px rgba(0,0,0,0.22)',
  copyright:   'rgba(205,212,226,0.2)',
};

const LIGHT = {
  bg:          'linear-gradient(145deg, #fff8ef 0%, #fff1df 30%, #effaf6 64%, #eef7ff 100%)',
  navBg:       'rgba(255,250,244,0.9)',
  navBorder:   'rgba(233,113,72,0.16)',
  navShadow:   '0 20px 46px rgba(214,121,82,0.12)',
  gridLine1:   'rgba(233,113,72,0.08)',
  gridLine2:   'rgba(45,184,165,0.08)',
  vignette:    'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 34%, rgba(255,209,152,0.14) 100%)',
  orb1:        'rgba(255,145,103,0.22)',
  orb2:        'rgba(255,214,125,0.16)',
  orb3:        'rgba(45,184,165,0.14)',
  orb4:        'rgba(123,194,255,0.1)',
  scanLine:    'linear-gradient(90deg, transparent 0%, rgba(233,113,72,0.34) 24%, rgba(45,184,165,0.26) 56%, rgba(123,194,255,0.2) 82%, transparent 100%)',
  navLinkColor:'rgba(36,24,19,0.86)',
  navLinkHoverBg: 'rgba(233,113,72,0.1)',
  navLinkHoverShadow: '0 0 12px rgba(233,113,72,0.18)',
  divider:     'linear-gradient(180deg, rgba(233,113,72,0.3), rgba(45,184,165,0.18))',
  tutorialBg:  'rgba(45,184,165,0.1)',
  tutorialBorder: 'rgba(45,184,165,0.24)',
  tutorialColor: '#1d7d71',
  loginBg:     'rgba(45,184,165,0.08)',
  loginBorder: 'rgba(45,184,165,0.18)',
  loginColor:  '#1d7d71',
  signupBg:    'linear-gradient(135deg, #2e1c18 0%, #e97148 34%, #ffcb6b 72%, #2db8a5 100%)',
  signupShadow:'0 18px 42px rgba(214,121,82,0.18), 0 0 18px rgba(45,184,165,0.08)',
  dot1:        '#e97148',
  tagColor:    '#3d2a23',
  tagShadow:   '0 0 12px rgba(233,113,72,0.14)',
  ctaBg:       'linear-gradient(135deg, #2e1c18 0%, #e97148 30%, #ffcb6b 62%, #2db8a5 100%)',
  ctaShadow:   '0 24px 48px rgba(214,121,82,0.18)',
  scrollColor: '#cf6842',
  sectionLabel:'#cf6842',
  sectionLabelShadow: '0 0 12px rgba(233,113,72,0.16)',
  h2Gradient:  'linear-gradient(135deg, #2e1c18 0%, #e97148 44%, #2db8a5 100%)',
  subText:     'rgba(92,67,56,0.76)',
  featCardBg:  'rgba(255,255,255,0.7)',
  featCardBorder: 'rgba(233,113,72,0.14)',
  featDescColor: 'rgba(92,67,56,0.7)',
  expCardBgIdle: (c: string) => `linear-gradient(160deg, ${c}14 0%, rgba(255,252,246,0.96) 64%)`,
  expCardBgHov:  (c: string) => `linear-gradient(160deg, ${c}20 0%, rgba(255,249,241,0.99) 64%)`,
  expH3:       '#241813',
  expDesc:     'rgba(92,67,56,0.76)',
  expChipLabel:'rgba(36,24,19,0.58)',
  expChipBg:   'rgba(45,184,165,0.08)',
  expChipBorder:'rgba(233,113,72,0.18)',
  expChipColor:'rgba(61,42,35,0.8)',
  stepCircleBg:'linear-gradient(135deg, rgba(233,113,72,0.24), rgba(45,184,165,0.12))',
  stepCircleBorder: 'rgba(233,113,72,0.52)',
  stepCircleShadow: '0 0 28px rgba(233,113,72,0.18), 0 0 10px rgba(45,184,165,0.1)',
  stepNumBg:   'linear-gradient(135deg, #2e1c18, #e97148)',
  stepNumBorder: 'rgba(255,249,240,1)',
  stepNumShadow: '0 0 12px rgba(233,113,72,0.28), 0 0 6px rgba(255,203,107,0.2)',
  stepConnector: 'linear-gradient(90deg, transparent, rgba(233,113,72,0.34), rgba(45,184,165,0.22), rgba(123,194,255,0.18), transparent)',
  stepTitle:   '#2d1d17',
  stepTitleShadow: '0 1px 0 rgba(255,255,255,0.72)',
  stepDesc:    'rgba(78,58,48,0.74)',
  statsBg:     'linear-gradient(135deg, rgba(255,252,247,0.94), rgba(250,245,235,0.94))',
  statsBorderT:'rgba(233,113,72,0.24)',
  statsBorderB:'rgba(45,184,165,0.14)',
  statsLabel:  'rgba(92,67,56,0.68)',
  footerBg:    'rgba(43,29,19,0.98)',
  footerBorder:'linear-gradient(90deg, rgba(233,113,72,0.28), rgba(45,184,165,0.18), rgba(123,194,255,0.18))',
  panelBg:     'rgba(255,251,247,0.86)',
  panelBorder: 'rgba(233,113,72,0.14)',
  panelShadow: '0 24px 54px rgba(214,121,82,0.14)',
  panelActiveBg: 'rgba(233,113,72,0.06)',
  panelActiveBorder: 'rgba(45,184,165,0.22)',
  heroPrimaryGradient: 'linear-gradient(140deg, #2e1c18 0%, #e97148 42%, #ffcb6b 100%)',
  heroSecondaryGradient: 'linear-gradient(140deg, #ff8f67 0%, #ffd88d 42%, #2db8a5 100%)',
  heroPrimaryShadow: 'drop-shadow(0 6px 16px rgba(214,121,82,0.14))',
  heroSecondaryShadow: 'drop-shadow(0 6px 14px rgba(45,184,165,0.14))',
  softButtonBg: 'rgba(255,255,255,0.84)',
  softButtonBorder: 'rgba(233,113,72,0.16)',
  softButtonColor: '#4c3328',
  softButtonShadow: '0 14px 30px rgba(214,121,82,0.1)',
  copyright:   'rgba(235,220,198,0.58)',
};

const RAINBOW = {
  bg:          'linear-gradient(145deg, #090013 0%, #120d33 34%, #18073b 68%, #031b27 100%)',
  navBg:       'rgba(8,9,22,0.86)',
  navBorder:   'rgba(255,0,168,0.22)',
  navShadow:   '0 20px 48px rgba(0,0,0,0.34)',
  gridLine1:   'rgba(255,0,168,0.06)',
  gridLine2:   'rgba(0,229,255,0.05)',
  vignette:    'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 22%, rgba(4,5,14,0.92) 100%)',
  orb1:        'rgba(255,0,168,0.26)',
  orb2:        'rgba(0,229,255,0.18)',
  orb3:        'rgba(255,230,0,0.14)',
  orb4:        'rgba(139,47,255,0.16)',
  scanLine:    'linear-gradient(90deg, transparent 0%, rgba(255,0,168,0.4) 24%, rgba(0,229,255,0.34) 54%, rgba(255,230,0,0.32) 82%, transparent 100%)',
  navLinkColor:'rgba(244,246,255,0.88)',
  navLinkHoverBg: 'rgba(255,255,255,0.08)',
  navLinkHoverShadow: '0 0 14px rgba(255,0,168,0.22)',
  divider:     'linear-gradient(180deg, rgba(255,0,168,0.34), rgba(0,229,255,0.22))',
  tutorialBg:  'rgba(255,122,0,0.08)',
  tutorialBorder: 'rgba(255,122,0,0.24)',
  tutorialColor: '#ffd08c',
  loginBg:     'rgba(0,229,255,0.08)',
  loginBorder: 'rgba(0,229,255,0.24)',
  loginColor:  '#bff7ff',
  signupBg:    'linear-gradient(135deg, #8b2fff 0%, #ff00a8 26%, #00e5ff 56%, #8dff00 82%, #ffe600 100%)',
  signupShadow:'0 20px 46px rgba(0,0,0,0.38), 0 0 34px rgba(255,0,168,0.18)',
  dot1:        '#ff00a8',
  tagColor:    '#eef2ff',
  tagShadow:   '0 0 14px rgba(255,0,168,0.16)',
  ctaBg:       'linear-gradient(135deg, #8b2fff 0%, #ff00a8 24%, #00e5ff 52%, #8dff00 78%, #ffe600 100%)',
  ctaShadow:   '0 24px 56px rgba(0,0,0,0.4), 0 0 36px rgba(255,0,168,0.18)',
  scrollColor: '#efe7ff',
  sectionLabel:'#f0ccff',
  sectionLabelShadow: '0 0 12px rgba(255,0,168,0.16)',
  h2Gradient:  'linear-gradient(135deg, #ffffff 0%, #ffd6f4 24%, #8eeeff 62%, #ecff8c 100%)',
  subText:     'rgba(224,230,248,0.68)',
  featCardBg:  'rgba(255,255,255,0.03)',
  featCardBorder: 'rgba(232,237,245,0.1)',
  featDescColor: 'rgba(226,232,248,0.68)',
  expCardBgIdle: (c: string) => `linear-gradient(160deg, ${c}18 0%, rgba(9,11,28,0.94) 64%)`,
  expCardBgHov:  (c: string) => `linear-gradient(160deg, ${c}28 0%, rgba(12,14,34,0.99) 64%)`,
  expH3:       '#fff',
  expDesc:     'rgba(224,224,255,0.64)',
  expChipLabel:'rgba(255,255,255,0.34)',
  expChipBg:   'rgba(255,255,255,0.06)',
  expChipBorder:'rgba(255,255,255,0.12)',
  expChipColor:'rgba(255,255,255,0.48)',
  stepCircleBg:'linear-gradient(135deg, rgba(139,47,255,0.24), rgba(0,229,255,0.14))',
  stepCircleBorder: 'rgba(255,230,0,0.46)',
  stepCircleShadow: '0 0 36px rgba(255,0,168,0.24), 0 0 16px rgba(0,229,255,0.2)',
  stepNumBg:   'linear-gradient(135deg, #8b2fff, #ffe600)',
  stepNumBorder: 'rgba(4,0,12,1)',
  stepNumShadow: '0 0 12px rgba(139,47,255,0.4), 0 0 6px rgba(255,230,0,0.28)',
  stepConnector: 'linear-gradient(90deg, transparent, rgba(255,0,168,0.4), rgba(0,229,255,0.36), rgba(255,230,0,0.34), transparent)',
  stepTitle:   '#ffffff',
  stepTitleShadow: '0 0 8px rgba(255,0,168,0.22)',
  stepDesc:    'rgba(214,214,255,0.62)',
  statsBg:     'linear-gradient(135deg, rgba(11,12,28,0.92), rgba(16,10,30,0.92))',
  statsBorderT:'rgba(255,0,168,0.22)',
  statsBorderB:'rgba(0,229,255,0.16)',
  statsLabel:  'rgba(220,226,242,0.5)',
  footerBg:    'rgba(7,8,20,0.97)',
  footerBorder:'linear-gradient(90deg, rgba(255,0,168,0.28), rgba(0,229,255,0.22), rgba(255,230,0,0.2))',
  panelBg:     'rgba(11,13,28,0.82)',
  panelBorder: 'rgba(235,239,247,0.14)',
  panelShadow: '0 26px 60px rgba(0,0,0,0.4)',
  panelActiveBg: 'rgba(255,255,255,0.08)',
  panelActiveBorder: 'rgba(255,0,168,0.28)',
  heroPrimaryGradient: 'linear-gradient(140deg, #ffffff 0%, #ffd6f4 32%, #8eeeff 68%, #ecff8c 100%)',
  heroSecondaryGradient: 'linear-gradient(140deg, #8b2fff 0%, #ff00a8 38%, #ff7a00 72%, #ffe600 100%)',
  heroPrimaryShadow: 'drop-shadow(0 0 22px rgba(255,0,168,0.14))',
  heroSecondaryShadow: 'drop-shadow(0 0 20px rgba(0,229,255,0.14))',
  softButtonBg: 'rgba(255,255,255,0.05)',
  softButtonBorder: 'rgba(255,0,168,0.16)',
  softButtonColor: '#f4eeff',
  softButtonShadow: '0 18px 36px rgba(0,0,0,0.22)',
  copyright:   'rgba(220,226,242,0.24)',
};

const FIRECRACKER = {
  bg:          'linear-gradient(145deg, #140100 0%, #290500 30%, #481000 62%, #240207 100%)',
  navBg:       'rgba(20,10,9,0.8)',
  navBorder:   'rgba(255,120,0,0.22)',
  navShadow:   '0 20px 48px rgba(0,0,0,0.34)',
  gridLine1:   'rgba(255,86,34,0.07)',
  gridLine2:   'rgba(255,196,0,0.05)',
  vignette:    'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 24%, rgba(11,5,5,0.9) 100%)',
  orb1:        'rgba(255,72,0,0.28)',
  orb2:        'rgba(255,176,0,0.18)',
  orb3:        'rgba(255,238,120,0.14)',
  orb4:        'rgba(255,86,34,0.12)',
  scanLine:    'linear-gradient(90deg, transparent 0%, rgba(255,72,0,0.42) 22%, rgba(255,176,0,0.34) 54%, rgba(255,238,120,0.26) 82%, transparent 100%)',
  navLinkColor:'rgba(247,228,205,0.84)',
  navLinkHoverBg: 'rgba(255,255,255,0.06)',
  navLinkHoverShadow: '0 0 14px rgba(215,159,110,0.2)',
  divider:     'linear-gradient(180deg, rgba(197,88,58,0.36), rgba(215,159,110,0.18))',
  tutorialBg:  'rgba(215,159,110,0.08)',
  tutorialBorder: 'rgba(215,159,110,0.24)',
  tutorialColor: '#ffcc8a',
  loginBg:     'rgba(255,106,0,0.1)',
  loginBorder: 'rgba(255,120,0,0.28)',
  loginColor:  '#ffc08a',
  signupBg:    'linear-gradient(135deg, #ffb974 0%, #ff7a00 30%, #ff4d00 62%, #ffd84d 100%)',
  signupShadow:'0 22px 48px rgba(0,0,0,0.36), 0 0 28px rgba(255,136,0,0.16)',
  dot1:        '#ff7a00',
  tagColor:    '#e9d4bc',
  tagShadow:   '0 0 14px rgba(192,144,111,0.14)',
  ctaBg:       'linear-gradient(135deg, #ffcc7a 0%, #ff7a00 28%, #ff4d00 58%, #ffe34d 100%)',
  ctaShadow:   '0 24px 54px rgba(0,0,0,0.4), 0 0 30px rgba(255,122,0,0.16)',
  scrollColor: '#ffb15a',
  sectionLabel:'#ff9b3d',
  sectionLabelShadow: '0 0 14px rgba(255,122,0,0.2)',
  h2Gradient:  'linear-gradient(135deg, #fff5dc 0%, #ffb15a 36%, #ff6a00 72%, #ffe34d 100%)',
  subText:     'rgba(255,219,189,0.64)',
  featCardBg:  'rgba(255,255,255,0.028)',
  featCardBorder: 'rgba(237,219,203,0.08)',
  featDescColor: 'rgba(245,220,191,0.6)',
  expCardBgIdle: (c: string) => `linear-gradient(160deg, ${c}12 0%, rgba(22,10,10,0.9) 64%)`,
  expCardBgHov:  (c: string) => `linear-gradient(160deg, ${c}20 0%, rgba(28,12,12,0.98) 64%)`,
  expH3:       '#fff',
  expDesc:     'rgba(255,200,160,0.55)',
  expChipLabel:'rgba(255,180,100,0.3)',
  expChipBg:   'rgba(255,106,0,0.08)',
  expChipBorder:'rgba(255,136,0,0.16)',
  expChipColor:'rgba(255,208,164,0.56)',
  stepCircleBg:'linear-gradient(135deg, rgba(255,72,0,0.28), rgba(255,196,0,0.14))',
  stepCircleBorder: 'rgba(255,176,0,0.5)',
  stepCircleShadow: '0 0 36px rgba(255,72,0,0.26), 0 0 14px rgba(255,196,0,0.18)',
  stepNumBg:   'linear-gradient(135deg, #ff4d00, #ffd84d)',
  stepNumBorder: 'rgba(5,1,0,1)',
  stepNumShadow: '0 0 14px rgba(255,72,0,0.38), 0 0 8px rgba(255,216,77,0.24)',
  stepConnector: 'linear-gradient(90deg, transparent, rgba(255,72,0,0.46), rgba(255,176,0,0.38), rgba(255,238,120,0.3), transparent)',
  stepTitle:   '#fff5e0',
  stepTitleShadow: '0 0 10px rgba(255,106,0,0.26)',
  stepDesc:    'rgba(255,202,143,0.62)',
  statsBg:     'linear-gradient(135deg, rgba(25,11,10,0.9), rgba(35,14,14,0.9))',
  statsBorderT:'rgba(255,176,0,0.24)',
  statsBorderB:'rgba(255,86,34,0.18)',
  statsLabel:  'rgba(244,219,191,0.54)',
  footerBg:    'rgba(14,7,7,0.96)',
  footerBorder:'linear-gradient(90deg, rgba(255,136,0,0.3), rgba(255,72,0,0.24), rgba(255,216,77,0.22))',
  panelBg:     'rgba(22,10,10,0.8)',
  panelBorder: 'rgba(239,225,210,0.12)',
  panelShadow: '0 26px 60px rgba(0,0,0,0.4)',
  panelActiveBg: 'rgba(255,255,255,0.08)',
  panelActiveBorder: 'rgba(255,136,0,0.26)',
  heroPrimaryGradient: 'linear-gradient(140deg, #fff9e8 0%, #ffb15a 40%, #ff6a00 100%)',
  heroSecondaryGradient: 'linear-gradient(140deg, #ff7a00 0%, #ffd37a 46%, #ffe34d 100%)',
  heroPrimaryShadow: 'drop-shadow(0 0 24px rgba(255,136,0,0.16))',
  heroSecondaryShadow: 'drop-shadow(0 0 22px rgba(255,72,0,0.14))',
  softButtonBg: 'rgba(255,255,255,0.04)',
  softButtonBorder: 'rgba(215,159,110,0.16)',
  softButtonColor: '#f3dec2',
  softButtonShadow: '0 18px 36px rgba(0,0,0,0.22)',
  copyright:   'rgba(232,212,190,0.22)',
};

const JUGNU = {
  bg:          'linear-gradient(145deg, #07110c 0%, #0b1713 44%, #101a12 100%)',
  navBg:       'rgba(9,16,13,0.8)',
  navBorder:   'rgba(201,181,122,0.18)',
  navShadow:   '0 20px 48px rgba(0,0,0,0.34)',
  gridLine1:   'rgba(224,194,125,0.04)',
  gridLine2:   'rgba(164,190,119,0.035)',
  vignette:    'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 25%, rgba(5,10,8,0.9) 100%)',
  orb1:        'rgba(201,181,122,0.16)',
  orb2:        'rgba(145,167,110,0.11)',
  orb3:        'rgba(225,214,171,0.08)',
  orb4:        'rgba(93,121,82,0.08)',
  scanLine:    'linear-gradient(90deg, transparent 0%, rgba(201,181,122,0.28) 24%, rgba(225,214,171,0.22) 54%, rgba(145,167,110,0.18) 82%, transparent 100%)',
  navLinkColor:'rgba(240,230,195,0.8)',
  navLinkHoverBg: 'rgba(255,255,255,0.05)',
  navLinkHoverShadow: '0 0 12px rgba(224,194,125,0.2)',
  divider:     'linear-gradient(180deg, rgba(224,194,125,0.3), rgba(168,191,119,0.16))',
  tutorialBg:  'rgba(224,194,125,0.08)',
  tutorialBorder: 'rgba(224,194,125,0.22)',
  tutorialColor: '#e8cd90',
  loginBg:     'rgba(168,191,119,0.08)',
  loginBorder: 'rgba(168,191,119,0.2)',
  loginColor:  '#dce6b4',
  signupBg:    'linear-gradient(135deg, #efe6ce 0%, #d2bb7e 36%, #8fa375 74%, #5c6f57 100%)',
  signupShadow:'0 22px 48px rgba(0,0,0,0.34), 0 0 22px rgba(201,181,122,0.1)',
  dot1:        '#dcc589',
  tagColor:    '#ede4bf',
  tagShadow:   '0 0 14px rgba(201,181,122,0.12)',
  ctaBg:       'linear-gradient(135deg, #f3ecd9 0%, #d8c084 38%, #9cac7c 72%, #66795e 100%)',
  ctaShadow:   '0 24px 54px rgba(0,0,0,0.38), 0 0 24px rgba(201,181,122,0.1)',
  scrollColor: '#dcc48a',
  sectionLabel:'#e0c27c',
  sectionLabelShadow: '0 0 12px rgba(201,181,122,0.12)',
  h2Gradient:  'linear-gradient(135deg, #fff8e5 0%, #d6c083 40%, #b2c08f 100%)',
  subText:     'rgba(232,225,190,0.54)',
  featCardBg:  'rgba(255,255,255,0.026)',
  featCardBorder: 'rgba(238,233,211,0.08)',
  featDescColor: 'rgba(232,225,190,0.48)',
  expCardBgIdle: (c: string) => `linear-gradient(160deg, ${c}10 0%, rgba(10,18,14,0.9) 64%)`,
  expCardBgHov:  (c: string) => `linear-gradient(160deg, ${c}18 0%, rgba(13,21,16,0.98) 64%)`,
  expH3:       '#fff5cf',
  expDesc:     'rgba(255,235,178,0.5)',
  expChipLabel:'rgba(255,214,92,0.3)',
  expChipBg:   'rgba(201,181,122,0.05)',
  expChipBorder:'rgba(201,181,122,0.1)',
  expChipColor:'rgba(244,231,188,0.38)',
  stepCircleBg:'linear-gradient(135deg, rgba(201,181,122,0.18), rgba(156,182,114,0.08))',
  stepCircleBorder: 'rgba(201,181,122,0.38)',
  stepCircleShadow: '0 0 24px rgba(201,181,122,0.16), 0 0 10px rgba(156,182,114,0.12)',
  stepNumBg:   'linear-gradient(135deg, #88724f, #d6c081)',
  stepNumBorder: 'rgba(0,5,1,1)',
  stepNumShadow: '0 0 10px rgba(201,181,122,0.26), 0 0 6px rgba(156,182,114,0.16)',
  stepConnector: 'linear-gradient(90deg, transparent, rgba(201,181,122,0.32), rgba(225,214,171,0.26), rgba(156,182,114,0.22), transparent)',
  stepTitle:   '#fff0c9',
  stepTitleShadow: '0 0 8px rgba(201,181,122,0.12)',
  stepDesc:    'rgba(238,220,156,0.48)',
  statsBg:     'linear-gradient(135deg, rgba(10,18,14,0.9), rgba(12,16,12,0.9))',
  statsBorderT:'rgba(224,194,125,0.2)',
  statsBorderB:'rgba(168,191,119,0.14)',
  statsLabel:  'rgba(232,225,190,0.42)',
  footerBg:    'rgba(7,12,10,0.96)',
  footerBorder:'linear-gradient(90deg, rgba(201,181,122,0.24), rgba(145,167,110,0.18), rgba(92,114,86,0.14))',
  panelBg:     'rgba(10,18,14,0.8)',
  panelBorder: 'rgba(239,233,211,0.12)',
  panelShadow: '0 26px 60px rgba(0,0,0,0.38)',
  panelActiveBg: 'rgba(255,255,255,0.08)',
  panelActiveBorder: 'rgba(201,181,122,0.2)',
  heroPrimaryGradient: 'linear-gradient(140deg, #fff9e9 0%, #dcc688 46%, #b3c094 100%)',
  heroSecondaryGradient: 'linear-gradient(140deg, #dbc58a 0%, #efe3bf 48%, #92a877 100%)',
  heroPrimaryShadow: 'drop-shadow(0 0 20px rgba(201,181,122,0.1))',
  heroSecondaryShadow: 'drop-shadow(0 0 18px rgba(145,167,110,0.1))',
  softButtonBg: 'rgba(255,255,255,0.04)',
  softButtonBorder: 'rgba(224,194,125,0.16)',
  softButtonColor: '#f2e7c2',
  softButtonShadow: '0 18px 36px rgba(0,0,0,0.22)',
  copyright:   'rgba(232,225,190,0.22)',
};

const THEMES = { dark: DARK, light: LIGHT, rainbow: RAINBOW, firecracker: FIRECRACKER, jugnu: JUGNU } as const;

const HOME_THEME_OPTIONS = [
  { id: 'dark', icon: '🌙', title: 'Dark', glow: 'rgba(100,80,255,0.55)' },
  { id: 'light', icon: '☀️', title: 'Light', glow: 'rgba(255,168,59,0.68)' },
  { id: 'rainbow', icon: '🌈', title: 'Rainbow', glow: 'rgba(168,153,214,0.42)' },
  { id: 'firecracker', icon: '🎆', title: 'Firecracker', glow: 'rgba(192,144,111,0.42)' },
  { id: 'jugnu', icon: '✨', title: 'Jugnu', glow: 'rgba(201,181,122,0.38)' },
] as const satisfies ReadonlyArray<{ id: HomeTheme; icon: string; title: string; glow: string }>;

function enhanceHomeThemeContrast<TTheme extends Record<string, unknown>>(theme: TTheme, isLight: boolean) {
  return {
    ...theme,
    tagColor: isLight ? 'rgba(61,42,35,0.84)' : 'rgba(238,241,247,0.84)',
    subText: isLight ? 'rgba(92,67,56,0.8)' : 'rgba(229,233,241,0.8)',
    featDescColor: isLight ? 'rgba(92,67,56,0.74)' : 'rgba(221,227,238,0.76)',
    expDesc: isLight ? 'rgba(92,67,56,0.76)' : 'rgba(229,234,243,0.78)',
    expChipLabel: isLight ? 'rgba(17,17,17,0.62)' : 'rgba(255,255,255,0.5)',
    expChipColor: isLight ? 'rgba(61,42,35,0.78)' : 'rgba(243,246,250,0.74)',
    stepDesc: isLight ? 'rgba(78,58,48,0.76)' : 'rgba(229,234,242,0.76)',
    statsLabel: isLight ? 'rgba(92,67,56,0.76)' : 'rgba(226,231,240,0.74)',
    copyright: isLight ? 'rgba(92,67,56,0.54)' : 'rgba(226,231,240,0.44)',
  };
}

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

const SYSTEM_PILLARS = [
  {
    eyebrow: '01 Create the surface',
    title: 'Pick the mood before you enter the builder.',
    desc: 'The first decision is visual direction. Dark, Light, Rainbow, Firecracker, and Jugnu change the product atmosphere before the form even starts taking shape.',
    points: ['Five home-page modes', 'Three distinct builder worlds', 'Editorial, cinematic UI instead of plain SaaS chrome'],
  },
  {
    eyebrow: '02 Control the release',
    title: 'Publishing is treated like launch control.',
    desc: 'Custom slugs, passwords, expiry windows, response limits, and version history are built into the flow so shared forms still feel managed, not careless.',
    points: ['Protected access when needed', 'Response caps and expiry windows', 'Restoreable snapshots and imports'],
  },
  {
    eyebrow: '03 Walk the respondent path',
    title: 'Preview the experience exactly as users will see it.',
    desc: 'Public form previews, guided walkthroughs, and live submission flows turn the landing page into product proof instead of a list of claims.',
    points: ['Tutorial preview with motion', 'Public gallery with real forms', 'Respondent journey visible before signup'],
  },
];

const OPERATOR_NOTES = [
  { label: 'Entry', value: 'Theme -> Experience -> Builder' },
  { label: 'Control', value: 'Share links stay governed' },
  { label: 'Proof', value: 'Users can test live forms instantly' },
];

const DISPLAY_FONT = "'Cormorant Garamond', serif";
const UI_FONT = "'Manrope', 'Exo 2', sans-serif";

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

export function HomePage({ onEnter, onEnablePayments, onLogin, onRegister, onTutorial, onApiDocs, onPricing, onExplore, onViewForm, onDashboard, onAdmin, playerName, theme, onThemeChange }: Props) {
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
  const T = enhanceHomeThemeContrast(THEMES[theme], theme === 'light');
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
  const readableHeading = isDark ? '#f4f1fb' : '#2f1d12';
  const readableBody = isDark ? 'rgba(238,242,248,0.86)' : 'rgba(55,38,27,0.8)';
  const readableSubtle = isDark ? 'rgba(224,230,239,0.78)' : 'rgba(74,52,37,0.72)';
  const readableLabel = isDark ? 'rgba(244,246,250,0.62)' : 'rgba(52,36,24,0.6)';
  const heroFormGradient = theme === 'light'
    ? 'linear-gradient(140deg, #261813 0%, #5a3526 42%, #d86d49 100%)'
    : T.heroPrimaryGradient;
  const heroVerseGradient = theme === 'light'
    ? 'linear-gradient(140deg, #dc6d49 0%, #f2b85f 40%, #1ea89d 100%)'
    : T.heroSecondaryGradient;
  const heroFormShadow = theme === 'light'
    ? 'drop-shadow(0 6px 16px rgba(216,109,73,0.14))'
    : T.heroPrimaryShadow;
  const heroVerseShadow = theme === 'light'
    ? 'drop-shadow(0 6px 16px rgba(30,168,157,0.14))'
    : T.heroSecondaryShadow;
  const landingSignals = [
    { value: String(EXPERIENCES.length), label: 'Experience worlds', detail: 'Realm Runner, Globe Explorer, The Library' },
    { value: String(HOME_THEME_OPTIONS.length), label: 'Visual modes', detail: 'Switch the landing atmosphere before entry' },
    { value: publicFormsLoading ? '...' : String(publicGalleryTotal), label: 'Public forms live', detail: 'Open and test the respondent flow now' },
    { value: String(FEATURES.length), label: 'Builder systems', detail: 'Validation, layout, access, history, import/export' },
  ];

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
    <div style={{ position: 'fixed', inset: 0, background: T.bg, overflowY: 'auto', overflowX: 'hidden', fontFamily: UI_FONT, transition: 'background 0.4s' }}>

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
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 44% 28% at 50% 36%, rgba(255,255,255,0.09), rgba(255,255,255,0.03) 28%, transparent 70%)', mixBlendMode: 'screen', opacity: isDark ? 0.5 : 0.28 }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.06, backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 0.55px, transparent 0.55px)', backgroundSize: '6px 6px' }} />
        <div style={{ position: 'absolute', top: '-18%', left: '-10%', width: '60vw', height: '60vw', background: `radial-gradient(circle, ${T.orb1} 0%, transparent 65%)`, filter: 'blur(90px)', animation: 'orb-drift 14s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '20%', right: '-12%', width: '48vw', height: '48vw', background: `radial-gradient(circle, ${T.orb2} 0%, transparent 65%)`, filter: 'blur(80px)', animation: 'orb-drift 18s ease-in-out infinite 4s' }} />
        <div style={{ position: 'absolute', bottom: '-8%', left: '20%', width: '55vw', height: '32vw', background: `radial-gradient(ellipse, ${T.orb3} 0%, transparent 65%)`, filter: 'blur(90px)', animation: 'orb-drift 22s ease-in-out infinite 9s' }} />
        <div style={{ position: 'absolute', top: '50%', left: '35%', width: '30vw', height: '30vw', background: `radial-gradient(circle, ${T.orb4} 0%, transparent 65%)`, filter: 'blur(90px)', animation: 'orb-drift 26s ease-in-out infinite 6s' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, height: '1px', background: T.scanLine, animation: 'scan-h 14s linear infinite', opacity: 0.22, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 'clamp(26px, 4vw, 42px)', background: 'linear-gradient(180deg, rgba(2,4,8,0.96), rgba(2,4,8,0.72) 55%, transparent)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 'clamp(26px, 4vw, 42px)', background: 'linear-gradient(0deg, rgba(2,4,8,0.96), rgba(2,4,8,0.72) 55%, transparent)' }} />
      </div>

      {/* ── Nav ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: T.navBg, backdropFilter: 'blur(32px)', borderBottom: `1px solid ${T.navBorder}`, padding: '0 36px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: T.navShadow, transition: 'background 0.3s, border-color 0.3s' }}>
        <FormVerseLogo key={`nav-logo-${theme}`} size={34} textSize={14} variant={theme} />
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {([['#experiences','Experiences'],['#gallery','Gallery'],['#features','Features'],['#how','How it works']] as [string,string][]).map(([href, label]) => (
            <a key={href} href={href} style={{ fontSize: 12, color: T.navLinkColor, textDecoration: 'none', letterSpacing: '0.03em', padding: '8px 14px', borderRadius: 999, transition: 'all 0.18s', fontWeight: 600, fontFamily: UI_FONT }}
              onMouseEnter={e => { e.currentTarget.style.color = isDark ? '#fff' : '#000'; e.currentTarget.style.background = T.navLinkHoverBg; e.currentTarget.style.textShadow = T.navLinkHoverShadow; }}
              onMouseLeave={e => { e.currentTarget.style.color = T.navLinkColor; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.textShadow = 'none'; }}>
              {label}
            </a>
          ))}
          {onApiDocs && (
            <button onClick={onApiDocs} style={{ background: 'transparent', border: 'none', fontSize: 12, color: T.navLinkColor, letterSpacing: '0.03em', padding: '8px 14px', borderRadius: 999, transition: 'all 0.18s', fontWeight: 600, cursor: 'pointer', fontFamily: UI_FONT }}
              onMouseEnter={e => { e.currentTarget.style.color = isDark ? '#fff' : '#000'; e.currentTarget.style.background = T.navLinkHoverBg; e.currentTarget.style.textShadow = T.navLinkHoverShadow; }}
              onMouseLeave={e => { e.currentTarget.style.color = T.navLinkColor; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.textShadow = 'none'; }}>
              API Docs
            </button>
          )}
          {playerName && onDashboard && (
            <button onClick={onDashboard} style={{ background: T.loginBg, border: `1px solid ${T.loginBorder}`, fontSize: 12, color: T.loginColor, letterSpacing: '0.03em', padding: '8px 15px', borderRadius: 999, transition: 'all 0.18s', fontWeight: 600, cursor: 'pointer', fontFamily: UI_FONT }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.05)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              Dashboard
            </button>
          )}
          {playerName && onAdmin && (
            <button onClick={onAdmin} style={{ background: T.tutorialBg, border: `1px solid ${T.tutorialBorder}`, fontSize: 12, color: T.tutorialColor, letterSpacing: '0.03em', padding: '8px 15px', borderRadius: 999, transition: 'all 0.18s', fontWeight: 600, cursor: 'pointer', fontFamily: UI_FONT }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.05)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              Admin
            </button>
          )}
          {!playerName && onLogin && (
            <button onClick={onLogin} style={{ background: T.loginBg, border: `1px solid ${T.loginBorder}`, fontSize: 12, color: T.loginColor, letterSpacing: '0.03em', padding: '8px 15px', borderRadius: 999, transition: 'all 0.18s', fontWeight: 600, cursor: 'pointer', fontFamily: UI_FONT }}
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
                background: T.panelBg,
                border: `1px solid ${T.panelBorder}`,
                borderRadius: 8,
                color: T.expH3,
                fontSize: 12,
                fontWeight: 800,
                padding: '7px 12px',
                letterSpacing: '0.03em',
                fontFamily: UI_FONT,
                cursor: 'pointer',
                boxShadow: T.panelShadow,
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
                  background: T.panelBg,
                  border: `1px solid ${T.panelBorder}`,
                  borderRadius: 18,
                  padding: 10,
                  display: 'grid',
                  gap: 8,
                  boxShadow: T.panelShadow,
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
                      background: theme === option.id ? T.panelActiveBg : 'transparent',
                      border: `1px solid ${theme === option.id ? T.panelActiveBorder : T.panelBorder}`,
                      borderRadius: 14,
                      padding: '10px 12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: theme === option.id ? `0 12px 24px ${option.glow}22` : 'none',
                      color: T.expH3,
                      fontFamily: UI_FONT,
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                    }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <PremiumIcon token={option.icon} size={16} />
                      <span style={{ fontSize: 12 }}>{option.title}</span>
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
      <section style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '92px 24px 72px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ ...fade('0s'), width: 'min(1080px, 100%)', position: 'relative', padding: 'clamp(28px, 4vw, 40px)', borderRadius: 28, border: `1px solid ${T.panelBorder}`, background: `linear-gradient(180deg, ${T.panelBg}, rgba(8,10,18,0.42))`, boxShadow: `0 28px 70px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.05)`, overflow: 'hidden', backdropFilter: 'blur(22px)' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(255,255,255,0.06), transparent 28%, transparent 72%, rgba(255,255,255,0.03))' }} />
          <div style={{ position: 'absolute', inset: 16, borderRadius: 22, border: `1px solid ${T.panelActiveBorder}`, opacity: 0.65, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 18, left: 20, display: 'flex', alignItems: 'center', gap: 10, color: T.sectionLabel, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.sectionLabel, boxShadow: `0 0 14px ${T.sectionLabel}` }} />
            opening sequence
          </div>
          <div style={{ position: 'absolute', top: 18, right: 20, color: T.subText, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>FormVerse Studio Reel</div>

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ ...fade('0s'), marginBottom: 18, fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.sectionLabel, fontWeight: 700 }}>
              cinematic form infrastructure
            </div>

            {/* Main title */}
            <div key={`hero-wordmark-${theme}`} style={{ ...fade('0.1s'), marginBottom: 18 }}>
              <h1 style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(62px, 11vw, 126px)', fontWeight: 700, lineHeight: 0.9, margin: 0, letterSpacing: '-0.035em', position: 'relative', display: 'inline-block' }}>
                <span style={{ display: 'block', color: isDark ? '#ffffff' : '#111111', background: heroFormGradient, backgroundSize: '180% 180%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'word-shimmer 14s ease-in-out infinite', filter: heroFormShadow, textShadow: isDark ? '0 1px 0 rgba(255,255,255,0.04), 0 0 10px rgba(8, 9, 15, 0.14)' : '0 1px 0 rgba(255,255,255,0.72), 0 3px 8px rgba(0, 0, 0, 0.06)' }}>
                  Form
                </span>
                <span style={{ display: 'block', color: isDark ? T.dot1 : '#111111', background: heroVerseGradient, backgroundSize: '180% 180%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'word-shimmer 14s ease-in-out infinite 1.2s', filter: heroVerseShadow, textShadow: isDark ? '0 0 10px rgba(8, 9, 15, 0.14)' : '0 3px 8px rgba(0, 0, 0, 0.06)' }}>
                  Verse
                </span>
              </h1>
            </div>

            {/* Animated tagline */}
            <div style={{ ...fade('0.25s'), height: 32, marginBottom: 32, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: 'clamp(17px, 2.1vw, 22px)', color: T.tagColor, letterSpacing: '0.015em', margin: 0, fontWeight: 500, opacity: tagVisible ? 1 : 0, transform: tagVisible ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 0.35s ease, transform 0.35s ease', textShadow: T.tagShadow }}>
                {TAGLINES[tagIdx]}
              </p>
            </div>

            {/* CTA buttons */}
            <div style={{ ...fade('0.5s'), display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
          <button onClick={handlePrimaryStart}
            style={{ background: T.ctaBg, border: `1px solid ${T.panelActiveBorder}`, borderRadius: 999, color: '#fff', fontSize: 15, fontWeight: 700, padding: '17px 34px', cursor: 'pointer', letterSpacing: '0.02em', fontFamily: UI_FONT, boxShadow: T.ctaShadow, transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.06)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}>
            {playerName ? 'Choose Your Experience' : 'Create Free Account'}
          </button>
          {onApiDocs && (
            <button onClick={onApiDocs}
              style={{ background: T.softButtonBg, border: `1px solid ${T.softButtonBorder}`, borderRadius: 999, color: T.softButtonColor, fontSize: 15, fontWeight: 700, padding: '17px 26px', cursor: 'pointer', letterSpacing: '0.02em', fontFamily: UI_FONT, transition: 'all 0.2s', boxShadow: T.softButtonShadow, backdropFilter: 'blur(18px)' }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              Browse API Docs
            </button>
          )}
          <button onClick={() => document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ background: T.tutorialBg, border: `1px solid ${T.tutorialBorder}`, borderRadius: 999, color: T.tutorialColor, fontSize: 15, fontWeight: 700, padding: '17px 28px', cursor: 'pointer', letterSpacing: '0.02em', fontFamily: UI_FONT, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            See Experiences First
          </button>
            </div>

            <div style={{ ...fade('0.58s'), display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 34, maxWidth: 860 }}>
          {[
            '3 distinct builder experiences',
            '5 visual modes: Dark, Light, Rainbow, Firecracker, Jugnu',
            'Account setup in one screen',
            'Custom slugs, passwords, expiry, and response caps',
          ].map((item) => (
            <div key={item} style={{ background: T.expChipBg, border: `1px solid ${T.expChipBorder}`, borderRadius: 999, padding: '10px 15px', fontSize: 12, color: T.expChipColor, letterSpacing: '0.015em', fontWeight: 600 }}>
              {item}
            </div>
          ))}
            </div>

            <div style={{ ...fade('0.64s'), width: 'min(760px, 100%)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 18 }}>
              {[
                ['Act I', 'Choose the mood'],
                ['Act II', 'Build the form'],
                ['Act III', 'Publish the link'],
              ].map(([label, copy]) => (
                <div key={label} style={{ padding: '14px 16px', borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.panelBorder}`, textAlign: 'left', backdropFilter: 'blur(16px)' }}>
                  <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.sectionLabel, fontWeight: 700, marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 14, color: T.expH3, fontWeight: 600 }}>{copy}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ ...fade('0.7s'), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.4, cursor: 'pointer' }} onClick={() => document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' })}>
          <span style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.scrollColor, fontFamily: UI_FONT }}>Explore Worlds</span>
          <div style={{ width: 1, height: 36, background: `linear-gradient(180deg, ${T.scrollColor}, transparent)`, animation: 'float-slow 2s ease-in-out infinite' }} />
        </div>
      </section>

      <section id="signal-rail" style={{ padding: '0 24px 92px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(320px, 0.95fr)', gap: 20, alignItems: 'stretch' }}>
          <div style={{ background: T.panelBg, border: `1px solid ${T.panelBorder}`, borderRadius: 28, padding: '28px clamp(22px, 3vw, 34px)', boxShadow: T.panelShadow, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: isDark ? 'linear-gradient(140deg, rgba(255,255,255,0.05), transparent 42%, rgba(255,255,255,0.02))' : 'linear-gradient(140deg, rgba(255,255,255,0.42), transparent 42%, rgba(255,255,255,0.18))', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: T.sectionLabel, letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 12, textShadow: T.sectionLabelShadow }}>✦ Live Product Signal</div>
              <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 700, color: readableHeading, margin: '0 0 14px', lineHeight: 1.02, letterSpacing: '-0.025em' }}>See the builder before you commit to it.</h2>
              <p style={{ fontSize: 14.5, lineHeight: 1.8, color: readableBody, maxWidth: 660, margin: '0 0 24px' }}>Explore the visual modes, preview real form experiences, and understand how publishing works before you create an account. The page should help you feel the product, not decode it.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
                {landingSignals.map((signal) => (
                  <div key={signal.label} style={{ borderRadius: 20, padding: '16px 16px 15px', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.62)', border: `1px solid ${T.featCardBorder}`, backdropFilter: 'blur(14px)' }}>
                    <div style={{ fontFamily: DISPLAY_FONT, fontSize: 28, fontWeight: 700, color: readableHeading, lineHeight: 1, marginBottom: 8, letterSpacing: '-0.03em' }}>{signal.value}</div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: T.sectionLabel, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6 }}>{signal.label}</div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.6, color: readableSubtle }}>{signal.detail}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <button onClick={() => document.getElementById('tutorial-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} style={{ background: T.ctaBg, border: `1px solid ${T.panelActiveBorder}`, borderRadius: 999, color: '#fff', fontSize: 13, fontWeight: 700, padding: '14px 18px', cursor: 'pointer', letterSpacing: '0.02em', fontFamily: UI_FONT, boxShadow: T.ctaShadow }}>
                  See the guided walkthrough
                </button>
                <button onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} style={{ background: T.softButtonBg, border: `1px solid ${T.softButtonBorder}`, borderRadius: 999, color: T.softButtonColor, fontSize: 13, fontWeight: 700, padding: '14px 18px', cursor: 'pointer', letterSpacing: '0.02em', fontFamily: UI_FONT, boxShadow: T.softButtonShadow }}>
                  Jump to live forms
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ background: isDark ? 'linear-gradient(160deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))' : 'linear-gradient(160deg, rgba(255,255,255,0.74), rgba(255,247,236,0.78))', border: `1px solid ${T.featCardBorder}`, borderRadius: 24, padding: '22px 22px 20px', boxShadow: T.panelShadow }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: T.sectionLabel, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 6 }}>Current mode</div>
                  <div style={{ fontFamily: DISPLAY_FONT, fontSize: 28, fontWeight: 700, color: readableHeading, letterSpacing: '-0.02em' }}>{activeThemeOption.title}</div>
                </div>
                <div style={{ width: 52, height: 52, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.expChipBg, border: `1px solid ${T.expChipBorder}` }}>
                  <PremiumIcon token={activeThemeOption.icon} size={26} />
                </div>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: readableBody, margin: '0 0 14px' }}>The landing page now behaves more like an app shell: a chosen mood, a guided story, visible live examples, and a controlled route into the builder.</p>
              <div style={{ display: 'grid', gap: 10 }}>
                {OPERATOR_NOTES.map((note) => (
                  <div key={note.label} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 14, paddingTop: 10, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(70,40,18,0.08)'}` }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: readableLabel, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{note.label}</div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.5, color: readableBody, textAlign: 'right' }}>{note.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: T.featCardBg, border: `1px solid ${T.featCardBorder}`, borderRadius: 24, padding: '20px 22px' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: T.sectionLabel, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 10 }}>Why this structure works</div>
              <div style={{ display: 'grid', gap: 10 }}>
                {[
                  'The hero sells the mood.',
                  'The signal rail proves depth quickly.',
                  'The next sections explain how the system actually behaves.'
                ].map((line) => (
                  <div key={line} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.sectionLabel, boxShadow: `0 0 10px ${T.sectionLabel}`, marginTop: 6, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, lineHeight: 1.65, color: readableSubtle }}>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="tutorial-preview" style={{ padding: '24px 24px 100px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.sectionLabel, letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 10, textShadow: T.sectionLabelShadow }}>✦ Tutorial Preview</div>
            <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: isDark ? '#f4f1fb' : '#2f1d12', textShadow: isDark ? '0 0 14px rgba(8, 4, 26, 0.18)' : '0 1px 0 rgba(255,255,255,0.6), 0 5px 12px rgba(171, 81, 0, 0.08)', margin: '0 0 12px', letterSpacing: '-0.02em' }}>See How FormVerse Works</h2>
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
                <h3 style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1.02, fontWeight: 700, color: '#fff8ef', margin: '0 0 12px', textShadow: '0 0 14px rgba(0,0,0,0.18)', letterSpacing: '-0.02em' }}>{tutorialPanel.title}</h3>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.88)', maxWidth: 620, margin: '0 0 10px' }}>{tutorialPanel.text}</p>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: readableSubtle, maxWidth: 640, margin: 0 }}>{tutorialPanel.subtext}</p>
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
                        <div style={{ fontSize: 12, fontWeight: 700, color: readableHeading, marginBottom: 3 }}>{panel.title.replace('STEP ', '').replace(/\d+: /, '')}</div>
                        <div style={{ fontSize: 11.5, lineHeight: 1.55, color: T.featDescColor }}>{panel.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: isDark ? 'linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))' : 'linear-gradient(160deg, rgba(255,255,255,0.72), rgba(255,247,232,0.72))', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(88,36,0,0.1)'}`, borderRadius: 22, padding: '22px 20px' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: readableHeading, marginBottom: 8 }}>Want the full walkthrough?</div>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: T.subText, margin: '0 0 18px' }}>Open the cinematic tutorial to see all steps with motion, hints, and the complete first-run story.</p>
                <button onClick={onTutorial}
                  style={{ width: '100%', background: T.ctaBg, border: `1px solid ${T.panelActiveBorder}`, borderRadius: 999, color: '#fff', fontSize: 14, fontWeight: 700, padding: '15px 18px', cursor: 'pointer', letterSpacing: '0.02em', fontFamily: UI_FONT, boxShadow: T.ctaShadow }}>
                  Watch Full Tutorial
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="product-architecture" style={{ padding: '0 24px 100px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(280px, 0.82fr) minmax(0, 1.18fr)', gap: 22, alignItems: 'start' }}>
          <div style={{ background: T.panelBg, border: `1px solid ${T.panelBorder}`, borderRadius: 28, padding: '28px 24px', boxShadow: T.panelShadow }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.sectionLabel, letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 12, textShadow: T.sectionLabelShadow }}>✦ Product Story</div>
            <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(28px, 3.8vw, 42px)', fontWeight: 700, color: readableHeading, lineHeight: 1.04, margin: '0 0 14px', letterSpacing: '-0.025em' }}>From first impression to final link, every step feels deliberate.</h2>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: readableBody, margin: '0 0 20px' }}>Choose a visual world, shape the form with control, and publish with the guardrails already built in. FormVerse is made to feel expressive on the surface and reliable underneath.</p>
            <div style={{ display: 'grid', gap: 10 }}>
              {STEPS.slice(0, 3).map((step) => (
                <div key={step.n} style={{ display: 'grid', gridTemplateColumns: '34px minmax(0, 1fr)', gap: 12, alignItems: 'start', padding: '12px 0', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(70,40,18,0.08)'}` }}>
                  <div style={{ width: 34, height: 34, borderRadius: 12, background: T.expChipBg, border: `1px solid ${T.expChipBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{step.icon}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: readableHeading, marginBottom: 3 }}>{step.title}</div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.6, color: readableSubtle }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            {SYSTEM_PILLARS.map((pillar, index) => (
              <div key={pillar.eyebrow} style={{ background: index === 1 ? T.panelBg : T.featCardBg, border: `1px solid ${index === 1 ? T.panelBorder : T.featCardBorder}`, borderRadius: 24, padding: '22px 22px 20px', boxShadow: index === 1 ? T.panelShadow : 'none' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: T.sectionLabel, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 10 }}>{pillar.eyebrow}</div>
                <div style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(24px, 3vw, 30px)', fontWeight: 700, color: readableHeading, lineHeight: 1.08, letterSpacing: '-0.02em', marginBottom: 10 }}>{pillar.title}</div>
                <p style={{ fontSize: 13.5, lineHeight: 1.75, color: readableBody, margin: '0 0 14px' }}>{pillar.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {pillar.points.map((point) => (
                    <span key={point} style={{ fontSize: 11, fontWeight: 700, color: T.expChipColor, background: T.expChipBg, border: `1px solid ${T.expChipBorder}`, borderRadius: 999, padding: '7px 11px', letterSpacing: '0.02em' }}>{point}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '100px 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.sectionLabel, letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: 10, textShadow: T.sectionLabelShadow }}>✦ The Toolkit</div>
            <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(26px, 3.6vw, 38px)', fontWeight: 700, color: isDark ? '#f4f1fb' : '#2f1d12', textShadow: isDark ? '0 0 14px rgba(8, 4, 26, 0.18)' : '0 1px 0 rgba(255,255,255,0.6), 0 5px 12px rgba(171, 81, 0, 0.08)', margin: '0 0 12px', letterSpacing: '-0.02em' }}>Everything You Need</h2>
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
            <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: isDark ? '#f4f1fb' : '#2f1d12', textShadow: isDark ? '0 0 14px rgba(8, 4, 26, 0.18)' : '0 1px 0 rgba(255,255,255,0.6), 0 5px 12px rgba(171, 81, 0, 0.08)', margin: '0 0 12px', letterSpacing: '-0.02em' }}>Three Ways to Build Forms</h2>
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
                        <div style={{ fontFamily: UI_FONT, fontSize: 10, fontWeight: 700, color: isH ? exp.color : readableLabel, letterSpacing: '0.16em', transition: 'color 0.3s', textTransform: 'uppercase' }}>EXP {exp.num}</div>
                        <div style={{ width: 32, height: 2, background: isH ? `linear-gradient(90deg, transparent, ${exp.color})` : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'), borderRadius: 2, marginTop: 4, marginLeft: 'auto', transition: 'all 0.3s' }} />
                      </div>
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: isH ? exp.color : readableLabel, letterSpacing: '0.24em', textTransform: 'uppercase', marginBottom: 7, transition: 'color 0.3s' }}>{exp.subtitle}</div>
                    <h3 style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(24px, 2.7vw, 30px)', fontWeight: 700, color: T.expH3, margin: '0 0 10px', lineHeight: 1.02, letterSpacing: '-0.02em' }}>{exp.title}</h3>
                    <p style={{ fontSize: 13, color: T.expDesc, lineHeight: 1.7, margin: 0 }}>{exp.desc}</p>
                  </div>
                  <div style={{ padding: '22px 30px', flex: 1 }}>
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ fontSize: 10, color: isH ? exp.color : T.expChipLabel, letterSpacing: '0.22em', textTransform: 'uppercase', transition: 'color 0.3s' }}>Preview footage</div>
                        <div style={{ fontSize: 10, color: readableLabel, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{canHover ? 'Hover to play' : 'Tap to expand'}</div>
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
            <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: isDark ? '#f4f1fb' : '#2f1d12', textShadow: isDark ? '0 0 14px rgba(8, 4, 26, 0.18)' : '0 1px 0 rgba(255,255,255,0.6), 0 5px 12px rgba(171, 81, 0, 0.08)', margin: '0 0 12px', letterSpacing: '-0.02em' }}>Try Real Public Forms</h2>
            <p style={{ fontSize: 14, color: T.subText, maxWidth: 720, margin: '0 auto', lineHeight: 1.7 }}>Browse public forms created for Realm Runner, Globe Explorer, and The Library. Open any card, submit it, and experience the respondent flow exactly as your users will.</p>
            {!publicFormsLoading && publicGalleryTotal > 0 && (
              <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: T.expChipColor, background: T.expChipBg, border: `1px solid ${T.expChipBorder}`, borderRadius: 999, padding: '6px 12px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Showing {Math.min(publicGalleryPreview.length, HOME_GALLERY_PREVIEW_LIMIT)} of {publicGalleryTotal}
                </span>
                {onExplore && publicGalleryTotal > HOME_GALLERY_PREVIEW_LIMIT && (
                  <button
                    onClick={onExplore}
                    style={{ background: 'transparent', border: `1px solid ${T.tutorialBorder}`, borderRadius: 999, color: T.tutorialColor, fontSize: 11, fontWeight: 700, padding: '8px 14px', cursor: 'pointer', fontFamily: UI_FONT, letterSpacing: '0.04em' }}>
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
                        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 22, fontWeight: 700, color: T.expH3, lineHeight: 1.15, letterSpacing: '-0.02em' }}>{form.title}</div>
                      </div>
                      <div style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${meta.color}18`, border: `1px solid ${meta.color}33`, color: meta.color }}><PremiumIcon token={meta.emoji} size={20} /></div>
                    </div>

                    <p style={{ fontSize: 12.5, lineHeight: 1.65, color: readableBody, margin: 0 }}>{form.description || 'Open this public form and test the live submission experience.'}</p>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: T.expChipColor, background: T.expChipBg, border: `1px solid ${T.expChipBorder}`, borderRadius: 999, padding: '5px 10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Public</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: T.expChipColor, background: T.expChipBg, border: `1px solid ${T.expChipBorder}`, borderRadius: 999, padding: '5px 10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Live Submission</span>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}` }}>
                      <span style={{ fontSize: 11, color: readableSubtle }}>No login required</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: meta.color, letterSpacing: '0.08em' }}>Try Form →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', borderRadius: 22, background: T.featCardBg, border: `1px solid ${T.featCardBorder}`, padding: '38px 24px' }}>
              <div style={{ fontSize: 42, marginBottom: 12 }}>🪄</div>
              <div style={{ fontFamily: DISPLAY_FONT, fontSize: 22, fontWeight: 700, color: readableHeading, marginBottom: 8, letterSpacing: '-0.02em' }}>Gallery Seeds Loading Soon</div>
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
            <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(26px, 3.6vw, 38px)', fontWeight: 700, color: isDark ? '#f4f1fb' : '#2f1d12', textShadow: isDark ? '0 0 14px rgba(8, 4, 26, 0.18)' : '0 1px 0 rgba(255,255,255,0.6), 0 5px 12px rgba(171, 81, 0, 0.08)', margin: 0, letterSpacing: '-0.02em' }}>How It Works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 40, left: '6%', right: '6%', height: 2, background: T.stepConnector, pointerEvents: 'none', borderRadius: 2, animation: 'line-grow 1.5s ease-out 0.3s both', transformOrigin: 'left' }} />
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 16px', position: 'relative', animation: `card-enter 0.55s ease-out ${i * 0.12}s both` }}>
                <div style={{ width: 82, height: 82, borderRadius: '50%', background: T.stepCircleBg, border: `2px solid ${T.stepCircleBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 22, position: 'relative', zIndex: 1, backdropFilter: 'blur(4px)', boxShadow: T.stepCircleShadow }}>
                  {s.icon}
                  <span style={{ position: 'absolute', top: -9, right: -9, width: 26, height: 26, borderRadius: '50%', background: T.stepNumBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', fontFamily: UI_FONT, border: `2px solid ${T.stepNumBorder}`, boxShadow: T.stepNumShadow }}>{s.n}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.stepTitle, marginBottom: 6, letterSpacing: '0.04em', textShadow: T.stepTitleShadow }}>{s.title}</div>
                <div style={{ fontSize: 12, color: T.stepDesc, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PricingSection sectionId="pricing" onEnter={handlePrimaryStart} onEnablePayments={onEnablePayments} embedded surface={theme === 'light' ? 'light' : 'dark'} />

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
                  <div style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(26px, 3vw, 34px)', fontWeight: 700, color: readableHeading, lineHeight: 1.05, letterSpacing: '-0.02em' }}>{previewModalExperience.title}</div>
                </div>
              </div>
              <button
                onClick={closePreviewModal}
                style={{ background: isDark ? 'rgba(0,0,0,0.36)' : 'rgba(255,255,255,0.55)', border: `1px solid ${previewModalExperience.border}`, color: isDark ? '#fff' : '#1f0b00', borderRadius: 999, padding: '10px 14px', fontSize: 12, fontWeight: 700, letterSpacing: '0.03em', cursor: 'pointer', fontFamily: UI_FONT }}
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
                <p style={{ margin: 0, maxWidth: 760, fontSize: 13.5, lineHeight: 1.7, color: readableBody }}>{previewModalExperience.desc}</p>
                <button
                  onClick={() => {
                    closePreviewModal();
                    handleExperienceStart();
                  }}
                  style={{ background: `linear-gradient(135deg, ${previewModalExperience.color}, rgba(255,255,255,0.92))`, border: `1px solid ${previewModalExperience.border}`, borderRadius: 999, color: '#120014', fontSize: 12, fontWeight: 700, padding: '13px 18px', cursor: 'pointer', fontFamily: UI_FONT, letterSpacing: '0.03em', boxShadow: `0 10px 24px ${previewModalExperience.glow}33` }}
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
                    <div style={{ fontFamily: DISPLAY_FONT, fontSize: 'clamp(28px, 3.6vw, 44px)', fontWeight: 700, color: statColor, lineHeight: 1, filter: valueGlow, letterSpacing: '-0.03em' }}>{s.v}</div>
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
