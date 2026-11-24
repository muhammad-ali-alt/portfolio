// ─────────────────────────────────────────────────────────────
// PRESETS
// Themes set everything at once. The smaller presets (type, motion,
// density, gradient, palette) change only their own category.
// ─────────────────────────────────────────────────────────────
import { DEFAULTS, clone, type Palette, type Settings } from './schema';

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

// ── typography ───────────────────────────────────────────────
export const TYPE_PRESETS: Record<string, { label: string; note: string; type: Partial<Settings['type']> }> = {
  editorial: {
    label: 'Editorial Drafting', note: 'Wide grotesk headings, serif reading text. The original.',
    type: { display: 'archivo', heading: 'archivo', body: 'sourceSerif', ui: 'jetbrainsMono', displayWeight: 750, headingWeight: 650, bodyWeight: 400, headingTracking: -0.02, displayWidth: 118, lineHeight: 1.55, headingScale: 1 },
  },
  technical: {
    label: 'Modern Technical', note: 'Geometric headings, neutral sans body.',
    type: { display: 'spaceGrotesk', heading: 'spaceGrotesk', body: 'inter', ui: 'jetbrainsMono', displayWeight: 700, headingWeight: 600, bodyWeight: 400, headingTracking: -0.025, displayWidth: 100, lineHeight: 1.6, headingScale: 0.95 },
  },
  minimal: {
    label: 'Minimal', note: 'One family, quiet hierarchy.',
    type: { display: 'inter', heading: 'inter', body: 'inter', ui: 'plexMono', displayWeight: 620, headingWeight: 600, bodyWeight: 400, headingTracking: -0.025, displayWidth: 100, lineHeight: 1.6, headingScale: 0.88 },
  },
  industrial: {
    label: 'Bold Industrial', note: 'Extended heavy headings, plain technical body.',
    type: { display: 'archivo', heading: 'archivo', body: 'plexSans', ui: 'plexMono', displayWeight: 860, headingWeight: 740, bodyWeight: 400, headingTracking: -0.03, displayWidth: 125, lineHeight: 1.55, headingScale: 1.08 },
  },
  balanced: {
    label: 'Balanced', note: 'Friendly sans headings, warm serif body.',
    type: { display: 'manrope', heading: 'manrope', body: 'newsreader', ui: 'plexMono', displayWeight: 760, headingWeight: 680, bodyWeight: 400, headingTracking: -0.03, displayWidth: 100, lineHeight: 1.6, headingScale: 0.95 },
  },
  precision: {
    label: 'Precision', note: 'IBM Plex throughout, like a datasheet.',
    type: { display: 'plexSans', heading: 'plexSans', body: 'plexSans', ui: 'plexMono', displayWeight: 640, headingWeight: 580, bodyWeight: 400, headingTracking: -0.02, displayWidth: 100, lineHeight: 1.6, headingScale: 0.95 },
  },
};

// ── motion ───────────────────────────────────────────────────
export const MOTION_PRESETS: Record<string, { label: string; note: string; motion: Partial<Settings['motion']> }> = {
  original: { label: 'Original', note: 'Hover feedback and a page fade. Nothing on scroll.', motion: clone(DEFAULTS.motion) },
  static: { label: 'Static', note: 'No motion beyond color changes.', motion: { enabled: true, style: 'none', scrollReveal: false, hover: 'none', pageTransition: 'none', parallax: 0 } },
  subtle: { label: 'Subtle', note: 'Short fades as sections appear.', motion: { enabled: true, style: 'fade', direction: 'up', distance: 8, duration: 450, easing: 'standard', stagger: 40, scrollReveal: true, hover: 'subtle', pageTransition: 'fade', parallax: 0 } },
  smooth: { label: 'Smooth', note: 'Sections rise into place, gentle parallax on the cover.', motion: { enabled: true, style: 'combo', direction: 'up', distance: 18, duration: 650, easing: 'smooth', stagger: 70, scrollReveal: true, hover: 'subtle', pageTransition: 'fade', parallax: 0.15 } },
  dynamic: { label: 'Dynamic', note: 'Larger movement, livelier hovers, sliding page changes.', motion: { enabled: true, style: 'combo', direction: 'up', distance: 36, duration: 800, easing: 'smooth', stagger: 90, scrollReveal: true, hover: 'lively', pageTransition: 'slide', parallax: 0.35 } },
};

// ── density ──────────────────────────────────────────────────
export const DENSITY: Record<'compact' | 'balanced' | 'spacious', Partial<Settings['layout']>> = {
  compact: { maxWidth: 1280, gutter: 24, sectionGap: 90, elementGap: 28, navGap: 14 },
  balanced: { maxWidth: 1440, gutter: 40, sectionGap: 140, elementGap: 48, navGap: 22 },
  spacious: { maxWidth: 1560, gutter: 64, sectionGap: 190, elementGap: 64, navGap: 30 },
};
export const CORNERS = { sharp: 0, slight: 4, rounded: 12, pill: 28 } as const;

// ── gradients (built from the current palette) ───────────────
export const GRADIENT_PRESETS: Record<string, { label: string; make: (p: Palette) => Partial<Settings['gradient']> }> = {
  subtle: { label: 'Subtle', make: (p) => ({ type: 'linear', angle: 160, intensity: 10, stops: [{ color: p.primary, pos: 0 }, { color: p.bg, pos: 100 }] }) },
  dramatic: { label: 'Dramatic', make: (p) => ({ type: 'linear', angle: 135, intensity: 45, stops: [{ color: p.primary, pos: 0 }, { color: p.secondary, pos: 100 }] }) },
  glow: { label: 'Radial Glow', make: (p) => ({ type: 'radial', angle: 0, intensity: 22, stops: [{ color: p.primary, pos: 0 }, { color: p.bg, pos: 70 }] }) },
  fade: { label: 'Linear Fade', make: (p) => ({ type: 'linear', angle: 180, intensity: 100, stops: [{ color: p.bg2, pos: 0 }, { color: p.bg, pos: 100 }] }) },
  multi: { label: 'Multi Color', make: (p) => ({ type: 'linear', angle: 120, intensity: 25, stops: [{ color: p.primary, pos: 0 }, { color: p.accent, pos: 50 }, { color: p.secondary, pos: 100 }] }) },
  wash: { label: 'Blueprint Wash', make: (p) => ({ type: 'radial', angle: 0, intensity: 18, stops: [{ color: p.secondary, pos: 0 }, { color: p.bg, pos: 80 }] }) },
};

// ── themes ───────────────────────────────────────────────────
const same = (p: Palette) => ({ colors: p, darkColors: clone(p) });

export const THEMES: Record<string, { label: string; note: string; patch: DeepPartial<Settings> & { motionPreset?: string; typePreset?: string } }> = {
  drafting: {
    label: 'Drafting Paper',
    note: 'The original: warm paper, black ink, one international orange. Follows your device into a graphite night mode.',
    patch: { ...clone({ colors: DEFAULTS.colors, darkColors: DEFAULTS.darkColors }), scheme: 'auto', typePreset: 'editorial', motionPreset: 'original', layout: { radius: 0, border: 1, shadow: 'none', details: 'full', ...DENSITY.balanced, density: 'balanced' }, background: { style: 'solid' }, three: { backdrop: 'grid', exposure: 0.55, environment: 'neutral' } },
  },
  industrial: {
    label: 'Industrial Minimal',
    note: 'Cool grey surfaces, heavy black type, a restrained safety orange.',
    patch: {
      colors: { bg: '#f2f2f0', bg2: '#e8e8e5', surface: '#e3e3e0', text: '#111111', text2: '#5a5a58', border: '#cdcdc9', primary: '#f25c05', secondary: '#111111', tertiary: '#8a8a86', accent: '#c2410c', highlight: '#f25c05' },
      darkColors: { bg: '#121212', bg2: '#1a1a1a', surface: '#1f1f1f', text: '#ededed', text2: '#a3a3a3', border: '#323232', primary: '#ff6a1a', secondary: '#ededed', tertiary: '#8a8a8a', accent: '#ff8a4c', highlight: '#ff6a1a' },
      scheme: 'auto', typePreset: 'industrial', motionPreset: 'subtle',
      layout: { radius: 0, border: 1.5, shadow: 'none', details: 'full', ...DENSITY.balanced, density: 'balanced' }, background: { style: 'solid' }, three: { backdrop: 'plain', exposure: 0.6 },
    },
  },
  midnight: {
    label: 'Midnight Engineering',
    note: 'Deep navy and charcoal, cool blue accents, a faint blueprint grid.',
    patch: {
      ...same({ bg: '#0b1220', bg2: '#111a2e', surface: '#14203a', text: '#e6ecf5', text2: '#93a1b8', border: '#24324d', primary: '#4c9fff', secondary: '#9fc3ff', tertiary: '#6b7a93', accent: '#7fb8ff', highlight: '#4c9fff' }),
      scheme: 'auto', typePreset: 'technical', motionPreset: 'smooth',
      layout: { radius: 4, border: 1, shadow: 'medium', details: 'full', ...DENSITY.balanced, density: 'balanced' },
      background: { style: 'blueprint', gridSize: 32, gridOpacity: 0.18 }, three: { backdrop: 'dark', exposure: 0.75 },
    },
  },
  graphite: {
    label: 'Graphite and Lime',
    note: 'Dark graphite surfaces with one carefully used lime accent.',
    patch: {
      ...same({ bg: '#151515', bg2: '#1c1c1c', surface: '#212121', text: '#ececec', text2: '#9a9a9a', border: '#323232', primary: '#b6f23a', secondary: '#ececec', tertiary: '#7a7a7a', accent: '#c8f560', highlight: '#b6f23a' }),
      scheme: 'auto', typePreset: 'balanced', motionPreset: 'smooth',
      layout: { radius: 2, border: 1, shadow: 'none', details: 'full', ...DENSITY.balanced, density: 'balanced' },
      background: { style: 'grid', gridSize: 40, gridOpacity: 0.22 }, three: { backdrop: 'dark', exposure: 0.7 },
    },
  },
  aerospace: {
    label: 'Aerospace',
    note: 'Steel grey and deep navy with aviation orange. Datasheet typography.',
    patch: {
      colors: { bg: '#eef1f4', bg2: '#e2e7ec', surface: '#dde3ea', text: '#0f1c2e', text2: '#4f5d70', border: '#c3ccd6', primary: '#ff5f15', secondary: '#1f3a5f', tertiary: '#7d8a99', accent: '#c94a0c', highlight: '#ff5f15' },
      darkColors: { bg: '#0d1828', bg2: '#13213a', surface: '#172843', text: '#e8edf3', text2: '#9aa7b8', border: '#263a57', primary: '#ff6b21', secondary: '#9fb6d6', tertiary: '#6c7d93', accent: '#ff8a4d', highlight: '#ff6b21' },
      scheme: 'auto', typePreset: 'precision', motionPreset: 'subtle',
      layout: { radius: 2, border: 1, shadow: 'subtle', details: 'full', ...DENSITY.balanced, density: 'balanced' },
      background: { style: 'grid', gridSize: 48, gridOpacity: 0.3 }, three: { backdrop: 'grid', exposure: 0.6 },
    },
  },
  studio: {
    label: 'Clean Studio',
    note: 'Bright white, generous spacing, soft corners and one cobalt accent.',
    patch: {
      colors: { bg: '#ffffff', bg2: '#f6f6f4', surface: '#f2f2ef', text: '#1a1a1a', text2: '#6b6b6b', border: '#e4e4e0', primary: '#2f5bea', secondary: '#1a1a1a', tertiary: '#9a9a9a', accent: '#2f5bea', highlight: '#2f5bea' },
      darkColors: { bg: '#121212', bg2: '#191919', surface: '#1e1e1e', text: '#f0f0f0', text2: '#a0a0a0', border: '#2c2c2c', primary: '#6d8cff', secondary: '#f0f0f0', tertiary: '#7a7a7a', accent: '#8aa3ff', highlight: '#6d8cff' },
      scheme: 'auto', typePreset: 'minimal', motionPreset: 'subtle',
      layout: { radius: 12, border: 1, shadow: 'subtle', details: 'reduced', ...DENSITY.spacious, density: 'spacious' },
      background: { style: 'solid' }, three: { backdrop: 'plain', exposure: 0.65 },
    },
  },
};

function deepMerge(target: any, patch: any) {
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && target[k] && typeof target[k] === 'object') deepMerge(target[k], v);
    else target[k] = clone(v);
  }
  return target;
}

/** Apply a full theme on top of the original defaults (so nothing from the previous theme leaks through). */
export function applyThemePreset(id: string): Settings {
  const theme = THEMES[id];
  const s = clone(DEFAULTS);
  if (!theme) return s;
  const { motionPreset, typePreset, ...patch } = theme.patch;
  deepMerge(s, patch);
  if (typePreset) Object.assign(s.type, TYPE_PRESETS[typePreset].type);
  if (motionPreset) Object.assign(s.motion, MOTION_PRESETS[motionPreset].motion);
  s.gradient = { ...s.gradient, ...GRADIENT_PRESETS.subtle.make(s.colors) } as Settings['gradient'];
  s.preset = id;
  return s;
}

/** Palettes for the Colors panel: every theme's day palette. */
export const PALETTES = Object.fromEntries(
  Object.entries(THEMES).map(([id, t]) => [id, { label: t.label, colors: applyThemePreset(id).colors, darkColors: applyThemePreset(id).darkColors }]),
);

export const SWATCHES = [
  '#ff4f00', '#f25c05', '#c2410c', '#e8b10b', '#b6f23a', '#2f9e44', '#0f766e', '#4c9fff',
  '#2f5bea', '#1f3a5f', '#6d28d9', '#be123c', '#17171a', '#5f5e5a', '#c9c4b9', '#efece5', '#ffffff',
];
