// ─────────────────────────────────────────────────────────────
// THEME ENGINE
// computeTheme(settings) turns settings into:
//   css   → CSS custom properties (the design tokens every page uses)
//   attrs → data attributes on <html> that switch styles on and off
// The same function runs at build time (published theme) and in the
// browser (Studio), so what you preview is exactly what ships.
// ─────────────────────────────────────────────────────────────
import { FONTS, type Palette, type Settings } from './schema';

// ── color math ────────────────────────────────────────────────
type RGB = [number, number, number];
export const hexToRgb = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
export const rgbToHex = (c: RGB) => '#' + c.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');
const lin = (v: number) => {
  v /= 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
export const luminance = (h: string) => {
  const [r, g, b] = hexToRgb(h);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
export const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
export const mix = (a: string, b: string, t: number) => {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex([0, 1, 2].map((i) => A[i] + (B[i] - A[i]) * t) as RGB);
};
/** Nudge `fg` toward black or white until it reads on `bg` at the given ratio. */
export function ensureContrast(fg: string, bg: string, ratio = 4.5): string {
  if (contrast(fg, bg) >= ratio) return fg;
  const target = luminance(bg) > 0.4 ? '#000000' : '#ffffff';
  for (let t = 0.05; t <= 1; t += 0.05) {
    const c = mix(fg, target, t);
    if (contrast(c, bg) >= ratio) return c;
  }
  return target;
}
/** Black or white, whichever reads better on `bg`. */
export const onColor = (bg: string) => (contrast('#ffffff', bg) >= contrast('#111111', bg) ? '#ffffff' : '#111111');

// ── pieces ───────────────────────────────────────────────────
function paletteVars(p: Palette): Record<string, string> {
  return {
    '--paper': p.bg,
    '--paper-2': p.bg2,
    '--surface': p.surface,
    '--ink': p.text,
    '--graphite': ensureContrast(p.text2, p.bg, 4.5),
    '--rule': p.border,
    '--accent': p.primary,
    '--accent-ink': ensureContrast(p.primary, p.bg, 4.5),
    '--on-accent': onColor(p.primary),
    // Dark (or inverted) sections such as the closing back cover use the secondary color.
    '--on-secondary': contrast(p.bg, p.secondary) >= 4.5 ? p.bg : onColor(p.secondary),
    '--accent-inv': ensureContrast(p.primary, p.secondary, 4.5), // primary on secondary colored sections
    '--secondary': p.secondary,
    '--tertiary': p.tertiary,
    '--emph': ensureContrast(p.accent, p.bg, 4.5),
    '--highlight': p.highlight,
    '--on-highlight': onColor(p.highlight),
  };
}

const EASINGS = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  smooth: 'cubic-bezier(0.2, 0.7, 0.1, 1)',
  snappy: 'cubic-bezier(0.5, 0, 0, 1.15)',
  linear: 'linear',
} as const;

const SHADOWS = {
  none: 'none',
  subtle: '0 1px 2px rgb(0 0 0 / 0.05), 0 2px 10px rgb(0 0 0 / 0.05)',
  medium: '0 2px 4px rgb(0 0 0 / 0.06), 0 10px 28px rgb(0 0 0 / 0.10)',
  dramatic: '0 4px 8px rgb(0 0 0 / 0.08), 0 24px 60px rgb(0 0 0 / 0.20)',
} as const;

export function gradientCss(g: Settings['gradient'], strength = g.intensity): string {
  const stops = [...g.stops]
    .sort((a, b) => a.pos - b.pos)
    .map((s) => `color-mix(in srgb, ${s.color} ${strength}%, transparent) ${s.pos}%`)
    .join(', ');
  if (g.type === 'radial') return `radial-gradient(ellipse 120% 90% at 50% 0%, ${stops})`;
  if (g.type === 'conic') return `conic-gradient(from ${g.angle}deg at 50% 40%, ${stops})`;
  return `linear-gradient(${g.angle}deg, ${stops})`;
}

function revealFrom(m: Settings['motion']) {
  const d = m.distance;
  const move = { up: `0, ${d}px`, down: `0, ${-d}px`, left: `${d}px, 0`, right: `${-d}px, 0` }[m.direction];
  const clip = { up: 'inset(100% 0 0 0)', down: 'inset(0 0 100% 0)', left: 'inset(0 0 0 100%)', right: 'inset(0 100% 0 0)' }[m.direction];
  switch (m.style) {
    case 'fade': return { o: '0', t: 'none', c: 'inset(0 0 0 0)' };
    case 'slide': return { o: '1', t: `translate(${move})`, c: 'inset(0 0 0 0)' };
    case 'scale': return { o: '0', t: `scale(${1 - d / 400})`, c: 'inset(0 0 0 0)' };
    case 'reveal': return { o: '1', t: 'none', c: clip };
    case 'combo': return { o: '0', t: `translate(${move}) scale(0.985)`, c: 'inset(0 0 0 0)' };
    default: return { o: '1', t: 'none', c: 'inset(0 0 0 0)' };
  }
}

const block = (sel: string, vars: Record<string, string>) =>
  `${sel}{${Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(';')}}`;

// ── main ─────────────────────────────────────────────────────
export function computeTheme(s: Settings): { css: string; attrs: Record<string, string> } {
  const t = s.type, l = s.layout, m = s.motion, b = s.background, g = s.gradient;
  const grad = gradientCss(g);
  const pageGrad = g.targets.page || b.style === 'gradient' ? grad : 'none';
  const rv = revealFrom(m);

  const shared: Record<string, string> = {
    // typography
    '--f-display': FONTS[t.display].stack,
    '--f-heading': FONTS[t.heading].stack,
    '--f-text': FONTS[t.body].stack,
    '--f-mono': FONTS[t.ui].stack,
    '--t-scale': String(t.baseScale),
    '--h-scale': String(t.headingScale),
    '--w-display': String(t.displayWeight),
    '--w-heading': String(t.headingWeight),
    '--w-body': String(t.bodyWeight),
    '--lh': String(t.lineHeight),
    '--track': `${t.headingTracking}em`,
    '--stretch': `${t.displayWidth}%`,
    '--measure': `${t.measure}ch`,
    // layout
    '--max': `${l.maxWidth}px`,
    '--gutter': `clamp(${Math.min(16, l.gutter)}px, 3vw, ${l.gutter}px)`,
    '--section-gap': `clamp(${Math.round(l.sectionGap * 0.5)}px, 10vw, ${l.sectionGap}px)`,
    '--gap': `clamp(${Math.round(l.elementGap * 0.5)}px, 3vw, ${l.elementGap}px)`,
    '--nav-gap': `${l.navGap}px`,
    '--radius': `${Math.min(l.radius, 20)}px`,
    '--radius-btn': l.radius >= 28 ? '999px' : `${l.radius}px`,
    '--bw': `${l.border}px`,
    '--shadow': SHADOWS[l.shadow],
    // background
    '--bg-grid': `${b.gridSize}px`,
    '--bg-grid-op': String(b.gridOpacity),
    '--bg-tex-op': String(b.textureOpacity),
    // gradients, per target
    '--grad': grad,
    '--g-page': pageGrad,
    '--g-hero': g.targets.hero ? grad : 'none',
    '--g-card': g.targets.cards ? gradientCss(g, Math.min(100, g.intensity * 1.5)) : 'none',
    '--g-accent': g.targets.accents ? gradientCss(g, Math.min(100, g.intensity * 2)) : 'none',
    '--g-button': g.targets.buttons ? gradientCss(g, 100) : 'none',
    // motion
    '--dur': `${m.duration}ms`,
    '--speed': String(m.duration / 500),
    '--ease': EASINGS[m.easing],
    '--stagger': `${m.stagger}ms`,
    '--rv-o': rv.o,
    '--rv-t': rv.t,
    '--rv-c': rv.c,
    '--hover-k': String({ none: 0, subtle: 1, lively: 2 }[m.hover]),
    '--parallax': String(m.parallax),
  };

  // ':root:root' outranks the plain ':root' fallbacks in global.css, whatever order the stylesheets load in.
  let css = block(':root:root', { ...shared, ...paletteVars(s.scheme === 'dark' ? s.darkColors : s.colors), 'color-scheme': luminance((s.scheme === 'dark' ? s.darkColors : s.colors).bg) > 0.4 ? 'light' : 'dark' });
  if (s.scheme === 'auto') {
    css += `@media (prefers-color-scheme: dark){${block(':root:root', { ...paletteVars(s.darkColors), 'color-scheme': luminance(s.darkColors.bg) > 0.4 ? 'light' : 'dark' })}}`;
  }

  const motionOn = m.enabled;
  const attrs: Record<string, string> = {
    'data-motion': motionOn ? 'on' : 'off',
    'data-reveal': motionOn && m.scrollReveal && m.style !== 'none' ? 'on' : 'off',
    'data-hover': motionOn ? m.hover : 'none',
    'data-pt': motionOn ? m.pageTransition : 'none',
    'data-smooth': m.smoothScroll ? 'on' : 'off',
    'data-parallax': motionOn && m.parallax > 0 ? 'on' : 'off',
    'data-textrise': motionOn && m.textRise ? 'on' : 'off',
    'data-stack': l.stackCards ? 'on' : 'off',
    'data-case': t.displayCase,
    'data-bg': b.style,
    'data-details': l.details,
    'data-mv-bg': s.three.backdrop,
    'data-v3d': JSON.stringify(s.three),
  };
  return { css, attrs };
}
