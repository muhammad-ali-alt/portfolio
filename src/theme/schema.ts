// ─────────────────────────────────────────────────────────────
// THEME SCHEMA
// Every customizable setting, its allowed values, and the original
// design ("Drafting Paper") as the default. `sanitize()` is the
// gatekeeper: anything saved, imported or published passes through
// it, so a broken or hand edited file can never break the site.
// ─────────────────────────────────────────────────────────────

export type Palette = {
  bg: string; // main background
  bg2: string; // secondary background: hover rows, code, callouts
  surface: string; // image plates, 3D viewer, cards
  text: string; // main text
  text2: string; // secondary text
  border: string; // hairlines
  primary: string; // interactive accent: links, active nav, buttons, focus, dimension lines
  secondary: string; // data marks: complete status, revision track, experiment markers
  tertiary: string; // quiet marks: idea and learned markers, sample tags
  accent: string; // emphasis inside text: italic words, drop cap, closing line
  highlight: string; // selection, construction grid, row hover tint
};
export const COLOR_KEYS = ['bg', 'bg2', 'surface', 'text', 'text2', 'border', 'primary', 'secondary', 'tertiary', 'accent', 'highlight'] as const;

export const FONTS = {
  archivo: { label: 'Archivo', stack: "'Archivo Variable', 'Archivo', system-ui, sans-serif", kind: 'sans', width: true },
  inter: { label: 'Inter', stack: "'Inter Variable', system-ui, sans-serif", kind: 'sans' },
  manrope: { label: 'Manrope', stack: "'Manrope Variable', system-ui, sans-serif", kind: 'sans' },
  spaceGrotesk: { label: 'Space Grotesk', stack: "'Space Grotesk Variable', system-ui, sans-serif", kind: 'sans' },
  plexSans: { label: 'IBM Plex Sans', stack: "'IBM Plex Sans Variable', system-ui, sans-serif", kind: 'sans' },
  sora: { label: 'Sora', stack: "'Sora Variable', system-ui, sans-serif", kind: 'sans' },
  sourceSerif: { label: 'Source Serif', stack: "'Source Serif 4 Variable', Georgia, serif", kind: 'serif' },
  newsreader: { label: 'Newsreader', stack: "'Newsreader Variable', Georgia, serif", kind: 'serif' },
  fraunces: { label: 'Fraunces', stack: "'Fraunces Variable', Georgia, serif", kind: 'serif' },
  jetbrainsMono: { label: 'JetBrains Mono', stack: "'JetBrains Mono Variable', ui-monospace, monospace", kind: 'mono' },
  plexMono: { label: 'IBM Plex Mono', stack: "'IBM Plex Mono', ui-monospace, monospace", kind: 'mono' },
} as const;
export type FontId = keyof typeof FONTS;

export const OPTIONS = {
  scheme: ['auto', 'light', 'dark'],
  density: ['compact', 'balanced', 'spacious', 'custom'],
  shadow: ['none', 'subtle', 'medium', 'dramatic'],
  bgStyle: ['solid', 'gradient', 'grid', 'blueprint', 'texture', 'atmosphere'],
  gradType: ['linear', 'radial', 'conic'],
  motionStyle: ['none', 'fade', 'slide', 'scale', 'reveal', 'combo'],
  direction: ['up', 'down', 'left', 'right'],
  easing: ['standard', 'smooth', 'snappy', 'linear'],
  hover: ['none', 'subtle', 'lively'],
  pageTransition: ['none', 'fade', 'slide'],
  environment: ['neutral', 'legacy'],
  material: ['original', 'clay', 'satin', 'metal'],
  backdrop: ['grid', 'plain', 'dark', 'transparent'],
  details: ['full', 'reduced', 'off'],
} as const;

export type Settings = {
  version: 1;
  preset: string; // which theme preset this started from
  scheme: (typeof OPTIONS.scheme)[number];
  colors: Palette; // used in light mode (or always, if scheme is light/dark)
  darkColors: Palette; // used when scheme is auto and the device is in dark mode
  type: {
    display: FontId; heading: FontId; body: FontId; ui: FontId;
    baseScale: number; headingScale: number;
    displayWeight: number; headingWeight: number; bodyWeight: number;
    lineHeight: number; headingTracking: number; displayWidth: number; measure: number;
  };
  layout: {
    density: (typeof OPTIONS.density)[number];
    maxWidth: number; gutter: number; sectionGap: number; elementGap: number; navGap: number;
    radius: number; border: number; shadow: (typeof OPTIONS.shadow)[number];
    details: (typeof OPTIONS.details)[number];
  };
  background: { style: (typeof OPTIONS.bgStyle)[number]; gridSize: number; gridOpacity: number; textureOpacity: number };
  gradient: {
    type: (typeof OPTIONS.gradType)[number]; angle: number;
    stops: { color: string; pos: number }[]; intensity: number;
    targets: { page: boolean; hero: boolean; cards: boolean; accents: boolean; buttons: boolean };
  };
  motion: {
    enabled: boolean; style: (typeof OPTIONS.motionStyle)[number]; direction: (typeof OPTIONS.direction)[number];
    distance: number; duration: number; easing: (typeof OPTIONS.easing)[number]; stagger: number;
    scrollReveal: boolean; hover: (typeof OPTIONS.hover)[number]; pageTransition: (typeof OPTIONS.pageTransition)[number];
    parallax: number; smoothScroll: boolean;
  };
  three: {
    autoRotate: boolean; rotateSpeed: number; exposure: number; shadow: number; shadowSoftness: number;
    environment: (typeof OPTIONS.environment)[number]; material: (typeof OPTIONS.material)[number];
    zoom: number; sensitivity: number; backdrop: (typeof OPTIONS.backdrop)[number];
  };
};

// Numeric limits: [min, max, step]. Used by sanitize() and by the Studio sliders.
export const RANGES: Record<string, [number, number, number]> = {
  'type.baseScale': [0.85, 1.2, 0.01],
  'type.headingScale': [0.7, 1.3, 0.01],
  'type.displayWeight': [400, 900, 10],
  'type.headingWeight': [400, 800, 10],
  'type.bodyWeight': [300, 600, 10],
  'type.lineHeight': [1.3, 1.9, 0.01],
  'type.headingTracking': [-0.06, 0.04, 0.005],
  'type.displayWidth': [75, 125, 1],
  'type.measure': [50, 84, 1],
  'layout.maxWidth': [1040, 1680, 10],
  'layout.gutter': [12, 72, 1],
  'layout.sectionGap': [40, 200, 2],
  'layout.elementGap': [12, 72, 1],
  'layout.navGap': [8, 44, 1],
  'layout.radius': [0, 28, 1],
  'layout.border': [0.5, 3, 0.25],
  'background.gridSize': [12, 96, 2],
  'background.gridOpacity': [0, 1, 0.01],
  'background.textureOpacity': [0, 1, 0.01],
  'gradient.angle': [0, 360, 1],
  'gradient.intensity': [0, 100, 1],
  'motion.distance': [0, 80, 1],
  'motion.duration': [100, 1400, 10],
  'motion.stagger': [0, 200, 5],
  'motion.parallax': [0, 1, 0.01],
  'three.rotateSpeed': [5, 90, 1],
  'three.exposure': [0.2, 1.6, 0.01],
  'three.shadow': [0, 2, 0.05],
  'three.shadowSoftness': [0, 1, 0.05],
  'three.zoom': [50, 150, 1],
  'three.sensitivity': [0.3, 2, 0.05],
};

// The original Ali Works design. "Restore original" always returns here.
export const DEFAULTS: Settings = {
  version: 1,
  preset: 'drafting',
  scheme: 'auto',
  colors: {
    bg: '#efece5', bg2: '#e6e2d9', surface: '#e6e2d9', text: '#17171a', text2: '#5f5e5a', border: '#c9c4b9',
    primary: '#ff4f00', secondary: '#17171a', tertiary: '#5f5e5a', accent: '#c23a00', highlight: '#ff4f00',
  },
  darkColors: {
    bg: '#151514', bg2: '#1e1e1c', surface: '#1e1e1c', text: '#ebe8e1', text2: '#a09d95', border: '#393835',
    primary: '#ff4f00', secondary: '#ebe8e1', tertiary: '#a09d95', accent: '#ff7a3d', highlight: '#ff4f00',
  },
  type: {
    display: 'archivo', heading: 'archivo', body: 'sourceSerif', ui: 'jetbrainsMono',
    baseScale: 1, headingScale: 1, displayWeight: 750, headingWeight: 650, bodyWeight: 400,
    lineHeight: 1.55, headingTracking: -0.02, displayWidth: 118, measure: 68,
  },
  layout: {
    density: 'balanced', maxWidth: 1440, gutter: 40, sectionGap: 140, elementGap: 48, navGap: 22,
    radius: 0, border: 1, shadow: 'none', details: 'full',
  },
  background: { style: 'solid', gridSize: 40, gridOpacity: 0.35, textureOpacity: 0.3 },
  gradient: {
    type: 'linear', angle: 160,
    stops: [{ color: '#ff4f00', pos: 0 }, { color: '#efece5', pos: 100 }],
    intensity: 10,
    targets: { page: false, hero: false, cards: false, accents: false, buttons: false },
  },
  motion: {
    enabled: true, style: 'none', direction: 'up', distance: 16, duration: 500, easing: 'smooth', stagger: 60,
    scrollReveal: false, hover: 'subtle', pageTransition: 'fade', parallax: 0, smoothScroll: true,
  },
  three: {
    autoRotate: false, rotateSpeed: 20, exposure: 0.55, shadow: 1, shadowSoftness: 0.8,
    environment: 'neutral', material: 'original', zoom: 100, sensitivity: 1, backdrop: 'grid',
  },
};

// ── validation ────────────────────────────────────────────────
const HEX = /^#[0-9a-f]{6}$/i;
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
export const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

function cleanPalette(input: unknown, fallback: Palette): Palette {
  const out = { ...fallback };
  if (!isObj(input)) return out;
  for (const k of COLOR_KEYS) {
    const v = input[k];
    if (typeof v === 'string') {
      const hex = v.length === 4 && /^#[0-9a-f]{3}$/i.test(v) ? '#' + [...v.slice(1)].map((c) => c + c).join('') : v;
      if (HEX.test(hex)) out[k] = hex.toLowerCase();
    }
  }
  return out;
}

function cleanSection<T extends Record<string, any>>(input: unknown, fallback: T, path: string): T {
  const out = { ...fallback };
  if (!isObj(input)) return out;
  for (const key of Object.keys(fallback) as (keyof T & string)[]) {
    const v = input[key];
    const def = fallback[key];
    const range = RANGES[`${path}.${key}`];
    if (typeof def === 'number' && typeof v === 'number' && Number.isFinite(v)) {
      (out as any)[key] = range ? Math.min(range[1], Math.max(range[0], v)) : v;
    } else if (typeof def === 'boolean' && typeof v === 'boolean') {
      (out as any)[key] = v;
    } else if (typeof def === 'string' && typeof v === 'string') {
      const allowed = allowedFor(`${path}.${key}`);
      if (!allowed || allowed.includes(v)) (out as any)[key] = v;
    }
  }
  return out;
}

function allowedFor(path: string): readonly string[] | null {
  const map: Record<string, readonly string[]> = {
    'type.display': Object.keys(FONTS), 'type.heading': Object.keys(FONTS), 'type.body': Object.keys(FONTS), 'type.ui': Object.keys(FONTS),
    'layout.density': OPTIONS.density, 'layout.shadow': OPTIONS.shadow, 'layout.details': OPTIONS.details,
    'background.style': OPTIONS.bgStyle, 'gradient.type': OPTIONS.gradType,
    'motion.style': OPTIONS.motionStyle, 'motion.direction': OPTIONS.direction, 'motion.easing': OPTIONS.easing,
    'motion.hover': OPTIONS.hover, 'motion.pageTransition': OPTIONS.pageTransition,
    'three.environment': OPTIONS.environment, 'three.material': OPTIONS.material, 'three.backdrop': OPTIONS.backdrop,
  };
  return map[path] ?? null;
}

/** Turn anything (saved, imported, published) into valid settings. Unknown or bad values fall back to defaults. */
export function sanitize(input: unknown, base: Settings = DEFAULTS): Settings {
  const s = clone(base);
  if (!isObj(input)) return s;
  if (typeof input.preset === 'string' && input.preset.length < 40) s.preset = input.preset;
  if (typeof input.scheme === 'string' && (OPTIONS.scheme as readonly string[]).includes(input.scheme)) s.scheme = input.scheme as Settings['scheme'];
  s.colors = cleanPalette(input.colors, base.colors);
  s.darkColors = cleanPalette(input.darkColors, base.darkColors);
  s.type = cleanSection(input.type, base.type, 'type');
  s.layout = cleanSection(input.layout, base.layout, 'layout');
  s.background = cleanSection(input.background, base.background, 'background');
  s.motion = cleanSection(input.motion, base.motion, 'motion');
  s.three = cleanSection(input.three, base.three, 'three');
  // gradient has a nested list
  const g = isObj(input.gradient) ? input.gradient : {};
  const gs = cleanSection(g, { type: base.gradient.type, angle: base.gradient.angle, intensity: base.gradient.intensity }, 'gradient');
  s.gradient.type = gs.type; s.gradient.angle = gs.angle; s.gradient.intensity = gs.intensity;
  if (Array.isArray(g.stops)) {
    const stops = g.stops
      .filter((st: unknown) => isObj(st) && typeof st.color === 'string' && HEX.test(st.color) && typeof st.pos === 'number')
      .slice(0, 4)
      .map((st: any) => ({ color: st.color.toLowerCase(), pos: Math.min(100, Math.max(0, Math.round(st.pos))) }));
    if (stops.length >= 2) s.gradient.stops = stops;
  }
  s.gradient.targets = cleanSection(g.targets, base.gradient.targets, 'gradient.targets');
  return s;
}

/** Read a value by dotted path, e.g. get(s, 'type.display'). */
export function getPath(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}
/** Write a value by dotted path. Mutates and returns obj. */
export function setPath<T>(obj: T, path: string, value: unknown): T {
  const keys = path.split('.');
  let o: any = obj;
  for (const k of keys.slice(0, -1)) o = o[k];
  o[keys.at(-1)!] = value;
  return obj;
}
