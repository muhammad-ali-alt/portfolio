// ─────────────────────────────────────────────────────────────
// STUDIO
// One settings object (`s`). Every control reads and writes a path in
// it ("type.display", "colors.primary"...). After each change:
//   persist()  saves to this browser (the site's boot script reads it)
//   preview()  pushes the computed theme into the live preview iframe
// Undo keeps snapshots of `s`. Everything is checked by sanitize().
// ─────────────────────────────────────────────────────────────
import publishedRaw from '../data/site-theme.json';
import { DEFAULTS, FONTS, RANGES, sanitize, clone, getPath, setPath, type Settings, type Palette, type FontId } from '../theme/schema';
import { computeTheme, gradientCss, contrast, ensureContrast, onColor } from '../theme/compute';
import { THEMES, TYPE_PRESETS, MOTION_PRESETS, DENSITY, CORNERS, GRADIENT_PRESETS, PALETTES, SWATCHES, applyThemePreset } from '../theme/presets';

const KEY = 'aw.theme.v1', SAVED = 'aw.themes.saved', RECENT = 'aw.colors.recent';
const store = {
  get<T = any>(k: string): T | null { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } },
  set(k: string, v: unknown) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
  del(k: string) { try { localStorage.removeItem(k); } catch { /* storage blocked */ } },
};

const published = sanitize(publishedRaw);
let s: Settings = sanitize(store.get<{ settings: unknown }>(KEY)?.settings, published);
const undoStack: string[] = [], redoStack: string[] = [];
let editNight = false;
let previewMode: 'device' | 'day' | 'night' = 'device';
let activeColor: keyof Palette = 'primary';
let dragging = false;

const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<T>(sel)!;
const panel = $('#st-panel'), cats = $('#st-cats'), iframe = $<HTMLIFrameElement>('#st-iframe'), frameBox = $('#st-frame');
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

// ── DOM builder ──────────────────────────────────────────────
type Kids = (Node | string | null | undefined | false)[];
function h<K extends keyof HTMLElementTagNameMap>(tag: K, props: Record<string, any> = {}, ...kids: Kids): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k in e && k !== 'list') (e as any)[k] = v;
    else e.setAttribute(k, String(v));
  }
  for (const c of kids) if (c != null && c !== false) e.append(c);
  return e;
}

// ── state, history, saving ───────────────────────────────────
function record() {
  undoStack.push(JSON.stringify(s));
  if (undoStack.length > 80) undoStack.shift();
  redoStack.length = 0;
  syncHistoryButtons();
}
function syncHistoryButtons() {
  $<HTMLButtonElement>('#st-undo').disabled = !undoStack.length;
  $<HTMLButtonElement>('#st-redo').disabled = !redoStack.length;
}
function undo() {
  if (!undoStack.length) return;
  redoStack.push(JSON.stringify(s));
  s = JSON.parse(undoStack.pop()!);
  syncHistoryButtons(); commit(true); toast('Undone');
}
function redo() {
  if (!redoStack.length) return;
  undoStack.push(JSON.stringify(s));
  s = JSON.parse(redoStack.pop()!);
  syncHistoryButtons(); commit(true); toast('Redone');
}

let saveTimer = 0;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    const status = $('#st-status');
    if (same(s, published)) {
      store.del(KEY);
      status.textContent = 'Matches the published design';
    } else {
      const ok = store.set(KEY, { settings: s, ...computeTheme(s), savedAt: Date.now() });
      status.textContent = ok ? 'Saved in this browser' : 'Could not save: browser storage is blocked';
    }
  }, 120);
}
function previewTheme() {
  const forced = previewMode === 'day' ? { ...s, scheme: 'light' as const } : previewMode === 'night' ? { ...s, scheme: 'dark' as const } : s;
  return computeTheme(forced);
}
function preview() {
  try { (iframe.contentWindow as any)?.__awApply?.(previewTheme()); } catch { /* preview not ready */ }
}
/** Call after every change. `rerender` rebuilds the panel (for presets, resets, undo). */
function commit(rerender = false) {
  persist();
  preview();
  if (rerender) render(); else markMods();
}

// ── reusable controls ────────────────────────────────────────
const isMod = (path: string) => !same(getPath(s, path), getPath(published, path));
function resetPath(path: string) {
  record();
  setPath(s, path, clone(getPath(published, path)));
  commit(true);
}
function markMods() {
  panel.querySelectorAll<HTMLElement>('[data-path]').forEach((el) => el.classList.toggle('is-mod', isMod(el.dataset.path!)));
  cats.querySelectorAll<HTMLElement>('[data-cat]').forEach((b) => {
    const mod = CATS.find((c) => c.id === b.dataset.cat)!.paths.some(isMod);
    b.querySelector('.mod')?.toggleAttribute('hidden', !mod);
  });
}
const help = (text?: string) => (text ? h('span', { class: 'st-help', title: text, 'aria-label': text, role: 'img' }, '?') : null);
const resetBtn = (path: string) => h('button', { type: 'button', class: 'st-reset', title: 'Reset to the published value', 'aria-label': 'Reset this setting', onclick: () => resetPath(path) }, '↺');

function field(label: string, path: string, control: Node, opts: { help?: string; val?: HTMLElement } = {}) {
  return h('div', { class: 'st-field', 'data-path': path },
    h('div', { class: 'st-field-head' }, label, help(opts.help), opts.val ?? null, resetBtn(path)),
    control,
  );
}

function slider(path: string, label: string, o: { unit?: string; fmt?: (v: number) => string; help?: string; onSet?: () => void; disabled?: boolean } = {}) {
  const [min, max, step] = RANGES[path];
  const fmt = o.fmt ?? ((v: number) => `${+v.toFixed(3)}${o.unit ?? ''}`);
  const val = h('span', { class: 'val' }, fmt(getPath(s, path)));
  const input = h('input', { type: 'range', min, max, step, value: getPath(s, path), disabled: o.disabled, 'aria-label': label });
  input.addEventListener('input', () => {
    if (!dragging) { record(); dragging = true; }
    setPath(s, path, parseFloat(input.value));
    o.onSet?.();
    val.textContent = fmt(parseFloat(input.value));
    commit();
  });
  input.addEventListener('change', () => { dragging = false; });
  return field(label, path, input, { help: o.help, val });
}

function seg(path: string, label: string, options: [string, string][], o: { help?: string; onSet?: (v: string) => void; current?: string } = {}) {
  const cur = o.current ?? getPath(s, path);
  const group = h('div', { class: 'st-seg', role: 'group', 'aria-label': label },
    ...options.map(([v, text]) => h('button', {
      type: 'button', 'aria-pressed': String(cur === v),
      onclick: () => { record(); setPath(s, path, v); o.onSet?.(v); commit(true); },
    }, text)),
  );
  return field(label, path, group, { help: o.help });
}

function toggle(path: string, label: string, o: { help?: string } = {}) {
  const input = h('input', { type: 'checkbox', checked: !!getPath(s, path) });
  input.addEventListener('change', () => { record(); setPath(s, path, input.checked); commit(true); });
  return h('label', { class: 'st-switch', 'data-path': path }, input, h('span', { class: 'track', 'aria-hidden': 'true' }), label, help(o.help), resetBtn(path));
}

function fontPicker(path: string, label: string, allowed: string[], o: { help?: string } = {}) {
  const cur = getPath(s, path) as FontId;
  const sample = h('div', { class: 'st-font-sample', style: { fontFamily: FONTS[cur].stack } }, 'Gearbox 0123 Aa');
  const sel = h('select', { 'aria-label': label },
    ...allowed.map((id) => h('option', { value: id, selected: id === cur }, `${FONTS[id as FontId].label} (${FONTS[id as FontId].kind})`)),
  );
  sel.addEventListener('change', () => { record(); setPath(s, path, sel.value); commit(true); });
  return field(label, path, h('div', {}, sel, sample), { help: o.help });
}

function section(title: string, kids: Kids, o: { open?: boolean; collapsible?: boolean } = {}) {
  if (o.collapsible === false) return h('div', { class: 'st-sec' }, h('div', { class: 'st-sec-title' }, title), ...kids);
  return h('details', { class: 'st-sec', open: o.open ?? true }, h('summary', {}, title), ...kids);
}

// ── categories ───────────────────────────────────────────────
type Cat = { id: string; label: string; intro: string; paths: string[]; render: () => Kids };
const pal = (): Palette => (editNight ? s.darkColors : s.colors);
const palKey = () => (editNight ? 'darkColors' : 'colors');

function themeThumb(t: Settings) {
  const c = t.colors, r = `${Math.min(t.layout.radius, 20)}px`;
  return h('div', { class: 'st-thumb', style: { background: c.bg, color: c.text } },
    h('span', { class: 't-name', style: { fontFamily: FONTS[t.type.display].stack, fontWeight: String(t.type.displayWeight), fontStretch: `${t.type.displayWidth}%` } }, 'Ali.'),
    h('span', { class: 't-lines' },
      h('i', { style: { background: c.text, width: '62%' } }),
      h('i', { style: { background: c.text2, width: '44%' } }),
    ),
    h('span', { class: 't-acc', style: { background: c.primary, borderRadius: t.layout.radius >= 28 ? '50%' : r } }),
    h('span', { class: 't-plate', style: { background: c.surface, border: `1px solid ${c.border}`, borderRadius: r } }),
  );
}

const CATS: Cat[] = [
  {
    id: 'themes', label: 'Themes and Presets', paths: ['preset', 'scheme', 'colors', 'darkColors', 'type', 'layout', 'background', 'gradient', 'motion', 'three'],
    intro: 'A theme sets colors, fonts, corners, shadows, background and motion together. Pick one, then fine tune anything in the other tabs.',
    render: () => {
      const saved = store.get<{ name: string; settings: Settings }[]>(SAVED) ?? [];
      const nameIn = h('input', { type: 'text', placeholder: 'Name this theme', maxLength: 40, 'aria-label': 'Theme name' });
      return [
        section('Themes', [
          h('div', { class: 'st-cards' },
            ...Object.entries(THEMES).map(([id, t]) => {
              const preset = applyThemePreset(id);
              const active = s.preset === id;
              const custom = active && !same({ ...s, preset: id }, preset);
              return h('button', {
                type: 'button', class: 'st-card', 'aria-pressed': String(active),
                onclick: () => { record(); s = applyThemePreset(id); commit(true); toast(`${t.label} applied`); },
              },
                themeThumb(preset),
                h('span', { class: 'st-card-body' },
                  active ? h('span', { class: 'st-card-tag' }, custom ? 'Active, customized' : 'Active') : null,
                  h('strong', {}, t.label), h('span', {}, t.note)),
              );
            }),
          ),
        ]),
        section('Color mode', [
          seg('scheme', 'Which palette visitors see', [['auto', 'Follow device'], ['light', 'Always day'], ['dark', 'Always night']],
            { help: 'Every theme has a day and a night palette. Follow device switches with the visitor\'s light or dark setting.' }),
        ]),
        section('Your saved themes', [
          h('p', { class: 'st-note' }, 'Save the current design to come back to it later. Saved in this browser.'),
          h('div', { class: 'st-row', style: { margin: '10px 0' } }, nameIn,
            h('button', {
              type: 'button', class: 'st-btn', onclick: () => {
                const name = nameIn.value.trim() || `Custom ${saved.length + 1}`;
                store.set(SAVED, [...saved.filter((x) => x.name !== name), { name, settings: s }]);
                toast(`Saved "${name}"`); render();
              },
            }, 'Save current')),
          saved.length
            ? h('div', { class: 'st-saved' }, ...saved.map((x) => h('div', { class: 'st-saved-row' },
              h('span', {}, x.name),
              h('button', { type: 'button', class: 'st-btn st-btn-sm', onclick: () => { record(); s = sanitize(x.settings); commit(true); toast(`Applied "${x.name}"`); } }, 'Apply'),
              h('button', { type: 'button', class: 'st-btn st-btn-sm st-btn-danger', onclick: () => { store.set(SAVED, saved.filter((y) => y !== x)); render(); } }, 'Delete'),
            )))
            : h('p', { class: 'st-note' }, 'No saved themes yet.'),
        ]),
      ];
    },
  },
  {
    id: 'colors', label: 'Colors', paths: ['colors', 'darkColors'],
    intro: 'Each color has one job across the whole site. Text colors are checked for contrast and darkened or lightened automatically if they would be hard to read.',
    render: () => {
      const ROLES: [keyof Palette, string, string][] = [
        ['primary', 'Primary', 'Links, active nav, buttons, focus, dimension lines, in progress dots'],
        ['secondary', 'Secondary', 'Complete status, revision track, experiment markers, blueprint grid'],
        ['tertiary', 'Tertiary', 'Idea and note markers, quiet outlines'],
        ['accent', 'Accent', 'Emphasis inside text: italic words, drop cap, the period after your name'],
        ['highlight', 'Highlight', 'Text selection, construction grid, row hover tint'],
        ['bg', 'Main background', 'Page background'],
        ['bg2', 'Secondary background', 'Hover rows, code blocks, callouts'],
        ['surface', 'Surface', 'Image plates, 3D viewer, profile card'],
        ['border', 'Border', 'All hairlines and dividers'],
        ['text', 'Main text', 'Body copy and headings'],
        ['text2', 'Secondary text', 'Labels, captions, metadata'],
      ];
      const recent = store.get<string[]>(RECENT) ?? [];
      const setColor = (key: keyof Palette, hex: string, rememberIt = true) => {
        record();
        setPath(s, `${palKey()}.${key}`, hex.toLowerCase());
        if (rememberIt) store.set(RECENT, [hex, ...recent.filter((c) => c !== hex)].slice(0, 10));
        commit(true);
      };
      const row = ([key, name, role]: (typeof ROLES)[number]) => {
        const path = `${palKey()}.${key}`;
        const val = pal()[key];
        const picker = h('input', { type: 'color', value: val, 'aria-label': `${name} color` });
        const hex = h('input', { type: 'text', class: 'hex', value: val, maxLength: 7, 'aria-label': `${name} hex value`, spellcheck: false });
        picker.addEventListener('input', () => {
          if (!dragging) { record(); dragging = true; }
          setPath(s, path, picker.value); hex.value = picker.value; commit();
        });
        picker.addEventListener('change', () => { dragging = false; store.set(RECENT, [picker.value, ...recent.filter((c) => c !== picker.value)].slice(0, 10)); render(); });
        hex.addEventListener('change', () => {
          const v = hex.value.trim().replace(/^([0-9a-f]{6})$/i, '#$1');
          if (/^#[0-9a-f]{6}$/i.test(v)) setColor(key, v);
          else { hex.value = pal()[key]; toast('Use a 6 digit hex color like #ff4f00'); }
        });
        return h('div', {
          class: 'st-color', 'data-path': path, style: activeColor === key ? { background: '#ebe8e1', paddingInline: '6px' } : {},
          onclick: (e: Event) => { if ((e.target as HTMLElement).tagName !== 'INPUT' && activeColor !== key) { activeColor = key; render(); } },
        },
          picker, h('span', { class: 'name' }, name), h('span', { class: 'right' }, hex, resetBtn(path)), h('span', { class: 'role' }, role));
      };
      const c = pal();
      const ratioRow = (label: string, fg: string, bg: string, adjusted?: string) => {
        const r = contrast(adjusted ?? fg, bg);
        return h('div', { class: 'st-cr' },
          h('span', { class: 'chip', style: { background: bg, color: adjusted ?? fg } }, 'Aa'), label,
          adjusted && adjusted !== fg ? h('span', { class: 'st-note', style: { margin: 0 } }, '(auto adjusted)') : null,
          h('span', { class: `ratio ${r >= 4.5 ? 'ok' : 'bad'}` }, `${r.toFixed(1)} : 1 ${r >= 4.5 ? 'Pass' : 'Low'}`));
      };
      return [
        section('Palette presets', [
          h('p', { class: 'st-note', style: { marginBottom: '10px' } }, 'Swaps colors only. Fonts and everything else stay.'),
          h('div', { class: 'st-chips' }, ...Object.entries(PALETTES).map(([id, p]) => h('button', {
            type: 'button', class: 'st-btn st-btn-sm', title: p.label,
            onclick: () => { record(); s.colors = clone(p.colors); s.darkColors = clone(p.darkColors); commit(true); toast(`${p.label} colors applied`); },
          }, h('span', { style: { display: 'inline-block', width: '10px', height: '10px', background: p.colors.primary, marginRight: '6px', verticalAlign: '-1px' } }), p.label))),
        ]),
        section('Editing', [
          s.scheme === 'auto'
            ? h('div', { class: 'st-field' }, h('div', { class: 'st-field-head' }, 'Palette', help('Night is used when a visitor\'s device is in dark mode. The preview switches to match what you are editing.')), h('div', { class: 'st-seg', role: 'group' },
              h('button', { type: 'button', 'aria-pressed': String(!editNight), onclick: () => { editNight = false; previewMode = 'day'; syncDayNight(); render(); preview(); } }, 'Day palette'),
              h('button', { type: 'button', 'aria-pressed': String(editNight), onclick: () => { editNight = true; previewMode = 'night'; syncDayNight(); render(); preview(); } }, 'Night palette')))
            : h('p', { class: 'st-note' }, `Color mode is "${s.scheme === 'light' ? 'Always day' : 'Always night'}", so only the ${s.scheme === 'light' ? 'day' : 'night'} palette is used.`),
          h('div', {},
            h('div', { class: 'st-field-head' }, 'Quick colors', help('Click a color row below to select it, then click a swatch to apply.')),
            h('div', { class: 'st-swrow', 'aria-label': 'Preset swatches' }, ...SWATCHES.map((hex) => h('button', { type: 'button', class: 'st-sw', title: hex, style: { background: hex }, onclick: () => setColor(activeColor, hex) }))),
            recent.length ? h('div', { class: 'st-swrow', 'aria-label': 'Recently used' }, h('span', { class: 'st-note', style: { margin: '0 6px 0 0' } }, 'Recent'),
              ...recent.map((hex) => h('button', { type: 'button', class: 'st-sw', title: hex, style: { background: hex }, onclick: () => setColor(activeColor, hex, false) }))) : null,
          ),
        ]),
        section('Brand colors', ROLES.slice(0, 5).map(row)),
        section('Surfaces', ROLES.slice(5, 9).map(row)),
        section('Text', ROLES.slice(9).map(row)),
        section('Readability check', [
          h('div', { class: 'st-contrast' },
            ratioRow('Main text on background', c.text, c.bg),
            ratioRow('Secondary text', c.text2, c.bg, ensureContrast(c.text2, c.bg)),
            ratioRow('Primary used as text', c.primary, c.bg, ensureContrast(c.primary, c.bg)),
            ratioRow('Accent used as text', c.accent, c.bg, ensureContrast(c.accent, c.bg)),
            ratioRow('Text on primary buttons', onColor(c.primary), c.primary),
          ),
          h('p', { class: 'st-note' }, '4.5 : 1 is the accessibility standard for body text. Auto adjusted means the site uses a slightly darker or lighter version for text only; buttons keep your exact color.'),
        ], { open: false }),
        h('div', { class: 'st-row', style: { marginTop: '12px' } },
          h('button', { type: 'button', class: 'st-btn', onclick: () => { record(); s.colors = clone(published.colors); s.darkColors = clone(published.darkColors); commit(true); } }, 'Reset whole palette')),
      ];
    },
  },
  {
    id: 'type', label: 'Typography', paths: ['type'],
    intro: 'Choose fonts for each role and tune size, weight and spacing. Sizes scale with the screen, so phones stay readable.',
    render: () => {
      const t = s.type;
      const all = Object.keys(FONTS);
      const typeMatch = (p: Partial<Settings['type']>) => Object.entries(p).every(([k, v]) => (t as any)[k] === v);
      const width = FONTS[t.display] as { width?: boolean };
      return [
        section('Typography presets', [
          h('div', { class: 'st-cards' }, ...Object.entries(TYPE_PRESETS).map(([id, p]) => h('button', {
            type: 'button', class: 'st-card', 'aria-pressed': String(typeMatch(p.type)),
            onclick: () => { record(); Object.assign(s.type, p.type); commit(true); },
          },
            h('span', { class: 'st-card-body' },
              h('span', { style: { fontFamily: FONTS[p.type.display!].stack, fontWeight: String(p.type.displayWeight), fontSize: '24px', lineHeight: '1', fontStretch: `${p.type.displayWidth}%` } }, 'Aa'),
              h('span', { style: { fontFamily: FONTS[p.type.body!].stack, fontSize: '12px', color: '#66655f' } }, 'Body text sample'),
              h('strong', {}, p.label), h('span', {}, p.note)),
          ))),
        ]),
        section('Fonts', [
          fontPicker('type.display', 'Display', all, { help: 'Your name on the cover, page titles, big statements.' }),
          fontPicker('type.heading', 'Headings', all, { help: 'Section titles, card titles, navigation.' }),
          fontPicker('type.body', 'Body', all, { help: 'Paragraphs and write ups.' }),
          fontPicker('type.ui', 'Labels and data', all, { help: 'Small uppercase labels, numbers, dates, code. Monospace fonts suit this best.' }),
        ]),
        section('Size', [
          slider('type.baseScale', 'Base text size', { fmt: (v) => `${Math.round(v * 100)}%`, help: 'Scales all body text, labels and spacing measured in text units.' }),
          slider('type.headingScale', 'Heading scale', { fmt: (v) => `${Math.round(v * 100)}%`, help: 'Scales headings and display type only. Capped so the cover name never overflows on phones.' }),
        ]),
        section('Weight', [
          slider('type.displayWeight', 'Display weight', { unit: '' }),
          slider('type.headingWeight', 'Heading weight', { unit: '' }),
          slider('type.bodyWeight', 'Body weight', { unit: '' }),
        ]),
        section('Spacing and width', [
          slider('type.lineHeight', 'Line height', { unit: '' }),
          slider('type.headingTracking', 'Heading letter spacing', { fmt: (v) => `${v.toFixed(3)} em` }),
          slider('type.displayWidth', 'Display width', { unit: '%', help: 'Stretches or condenses display type. Only Archivo supports this; other fonts ignore it.' }),
          !width.width ? h('p', { class: 'st-warn' }, `${FONTS[t.display].label} has no width axis, so Display width has no effect with it.`) : null,
          slider('type.measure', 'Reading width', { unit: ' characters', help: 'Maximum line length in project write ups. About 60 to 75 reads best.' }),
        ], { open: false }),
        section('Preview', [
          h('div', { class: 'st-type-preview', style: { background: s.colors.bg, color: s.colors.text } },
            h('span', { class: 'tp-label', style: { fontFamily: FONTS[t.ui].stack, color: s.colors.text2 } }, 'MA-001 · Complete'),
            h('span', { class: 'tp-h1', style: { fontFamily: FONTS[t.display].stack, fontWeight: String(t.displayWeight), letterSpacing: `${t.headingTracking - 0.035}em`, fontStretch: `${t.displayWidth}%` } }, 'Muhammad Ali.'),
            h('span', { class: 'tp-h2', style: { fontFamily: FONTS[t.heading].stack, fontWeight: String(t.headingWeight), letterSpacing: `${t.headingTracking}em` } }, 'Autonomous Over Terrain Vehicle'),
            h('p', { class: 'tp-p', style: { fontFamily: FONTS[t.body].stack, fontWeight: String(t.bodyWeight), lineHeight: String(t.lineHeight) } },
              'The vehicle drifted. First cause was a blocked drive motor dragging one wheel; fixing it made the second cause, unequal motor speeds, visible.'),
            h('span', { class: 'tp-btn', style: { fontFamily: FONTS[t.heading].stack, background: s.colors.primary, color: onColor(s.colors.primary), borderRadius: s.layout.radius >= 28 ? '999px' : `${s.layout.radius}px` } }, 'Email me'),
          ),
          h('p', { class: 'st-note' }, 'Sample only. The live preview on the right shows the real pages.'),
        ]),
      ];
    },
  },
  {
    id: 'layout', label: 'Layout and Spacing', paths: ['layout'],
    intro: 'Width, spacing, corners, borders and shadows. Every value stays fluid, so small screens tighten up automatically.',
    render: () => {
      const custom = () => { s.layout.density = 'custom'; };
      const cornerNow = (Object.entries(CORNERS).find(([, v]) => v === s.layout.radius)?.[0]) ?? 'custom';
      return [
        section('Density', [
          seg('layout.density', 'UI density', [['compact', 'Compact'], ['balanced', 'Balanced'], ['spacious', 'Spacious'], ...(s.layout.density === 'custom' ? [['custom', 'Custom'] as [string, string]] : [])],
            { help: 'Sets content width and all spacing together. Adjust any slider below to go custom.', onSet: (v) => { if (v !== 'custom') Object.assign(s.layout, DENSITY[v as keyof typeof DENSITY]); } }),
          slider('layout.maxWidth', 'Content width', { unit: 'px', onSet: custom }),
          slider('layout.gutter', 'Page padding', { unit: 'px', onSet: custom, help: 'Space between content and the screen edge. Smaller on phones automatically.' }),
          slider('layout.sectionGap', 'Section spacing', { unit: 'px', onSet: custom }),
          slider('layout.elementGap', 'Element spacing', { unit: 'px', onSet: custom, help: 'Gaps between cards, columns and grid items.' }),
          slider('layout.navGap', 'Navigation spacing', { unit: 'px', onSet: custom }),
        ]),
        section('Shape', [
          seg('layout.radius', 'Corner style', [['sharp', 'Sharp'], ['slight', 'Slight'], ['rounded', 'Rounded'], ['pill', 'Pill']],
            { current: cornerNow, onSet: (v) => { s.layout.radius = CORNERS[v as keyof typeof CORNERS]; }, help: 'Pill rounds buttons fully; large panels cap at a softer radius so they never look like capsules.' }),
          slider('layout.radius', 'Corner radius', { unit: 'px' }),
          slider('layout.border', 'Border thickness', { unit: 'px' }),
          seg('layout.shadow', 'Shadow', [['none', 'None'], ['subtle', 'Subtle'], ['medium', 'Medium'], ['dramatic', 'Dramatic']], { help: 'Applies to image plates, the 3D viewer, cards and panels.' }),
        ]),
        section('Drafting details', [
          seg('layout.details', 'Technical drawing details', [['full', 'Full'], ['reduced', 'Reduced'], ['off', 'Off']],
            { help: 'Full shows zone markers, the cursor zone readout, coordinates and the live dimension line on the cover. Reduced keeps coordinates and the dimension. Off hides all of them.' }),
        ]),
      ];
    },
  },
  {
    id: 'bg', label: 'Backgrounds and Gradients', paths: ['background', 'gradient'],
    intro: 'The page atmosphere and where gradients are used. Keep these restrained: they should support the work, not compete with it.',
    render: () => {
      const c = s.colors, g = s.gradient;
      const STYLES: [Settings['background']['style'], string, string, Record<string, string>][] = [
        ['solid', 'Solid', 'Clean, one color', { background: c.bg }],
        ['gradient', 'Gradient', 'Uses the gradient below', { background: `${gradientCss({ ...g, intensity: Math.max(g.intensity, 25) })}, ${c.bg}` }],
        ['grid', 'Grid', 'Square engineering grid', { background: `linear-gradient(${c.border} 1px, transparent 1px) 0 0/12px 12px, linear-gradient(90deg, ${c.border} 1px, transparent 1px) 0 0/12px 12px, ${c.bg}` }],
        ['blueprint', 'Blueprint', 'Major and minor grid lines', { background: `linear-gradient(${c.secondary}66 1px, transparent 1px) 0 0/30px 30px, linear-gradient(90deg, ${c.secondary}66 1px, transparent 1px) 0 0/30px 30px, linear-gradient(${c.secondary}26 1px, transparent 1px) 0 0/6px 6px, linear-gradient(90deg, ${c.secondary}26 1px, transparent 1px) 0 0/6px 6px, ${c.bg}` }],
        ['texture', 'Texture', 'Fine paper grain', { background: `repeating-radial-gradient(circle at 30% 30%, ${c.border}55 0 1px, transparent 1px 3px), ${c.bg}` }],
        ['atmosphere', 'Atmosphere', 'Soft light from the top', { background: `radial-gradient(ellipse at 50% -20%, ${c.primary}33, transparent 70%), ${c.bg}` }],
      ];
      const stops = g.stops.map((st, i) => {
        const col = h('input', { type: 'color', value: st.color, 'aria-label': `Stop ${i + 1} color` });
        col.addEventListener('input', () => { if (!dragging) { record(); dragging = true; } st.color = col.value; prev.style.background = `${gradientCss(s.gradient)}, ${c.bg}`; commit(); });
        col.addEventListener('change', () => { dragging = false; });
        const pos = h('input', { type: 'range', min: 0, max: 100, step: 1, value: st.pos, 'aria-label': `Stop ${i + 1} position` });
        pos.addEventListener('input', () => { if (!dragging) { record(); dragging = true; } st.pos = +pos.value; prev.style.background = `${gradientCss(s.gradient)}, ${c.bg}`; commit(); });
        pos.addEventListener('change', () => { dragging = false; });
        return h('div', { class: 'st-stop' }, col, pos,
          g.stops.length > 2 ? h('button', { type: 'button', class: 'st-btn st-btn-sm', 'aria-label': `Remove stop ${i + 1}`, onclick: () => { record(); g.stops.splice(i, 1); commit(true); } }, '✕') : h('span'));
      });
      const prev = h('div', { class: 'st-grad-preview', style: { background: `${gradientCss(g)}, ${c.bg}` }, 'aria-label': 'Gradient preview', role: 'img' });
      return [
        section('Background style', [
          h('div', { class: 'st-cards' }, ...STYLES.map(([id, label, note, bg]) => h('button', {
            type: 'button', class: 'st-card', 'aria-pressed': String(s.background.style === id),
            onclick: () => { record(); s.background.style = id; commit(true); },
          }, h('span', { class: 'st-thumb', style: { ...bg, height: '56px' } }), h('span', { class: 'st-card-body' }, h('strong', {}, label), h('span', {}, note))))),
          h('div', { style: { marginTop: '14px' } },
            slider('background.gridSize', 'Grid size', { unit: 'px', help: 'Applies to Grid and Blueprint.' }),
            slider('background.gridOpacity', 'Grid intensity', { fmt: (v) => `${Math.round(v * 100)}%`, help: 'Applies to Grid and Blueprint.' }),
            slider('background.textureOpacity', 'Texture intensity', { fmt: (v) => `${Math.round(v * 100)}%`, help: 'Applies to Texture.' }),
          ),
        ]),
        section('Gradient', [
          prev,
          h('div', { class: 'st-chips', style: { marginBottom: '14px' } }, ...Object.entries(GRADIENT_PRESETS).map(([id, p]) => h('button', {
            type: 'button', class: 'st-btn st-btn-sm', onclick: () => { record(); Object.assign(s.gradient, p.make(s.colors)); commit(true); },
          }, p.label))),
          seg('gradient.type', 'Type', [['linear', 'Linear'], ['radial', 'Radial'], ['conic', 'Conic']]),
          slider('gradient.angle', 'Angle', { unit: '°', disabled: g.type === 'radial', help: 'Direction for linear, start angle for conic. Radial ignores it.' }),
          h('div', { class: 'st-field', 'data-path': 'gradient.stops' },
            h('div', { class: 'st-field-head' }, 'Color stops', help('Color and position of each stop, 2 to 4.'), resetBtn('gradient.stops')),
            ...stops,
            g.stops.length < 4 ? h('button', { type: 'button', class: 'st-btn st-btn-sm', style: { justifySelf: 'start' }, onclick: () => { record(); g.stops.push({ color: s.colors.accent, pos: 50 }); commit(true); } }, '+ Add stop') : null),
          slider('gradient.intensity', 'Intensity', { unit: '%', help: 'How strongly the gradient colors show. Low values read as a tint.' }),
        ]),
        section('Use the gradient on', [
          toggle('gradient.targets.page', 'Page background', { help: 'Also on automatically when Background style is Gradient.' }),
          toggle('gradient.targets.hero', 'Cover section', { help: 'The framed cover on the home page.' }),
          toggle('gradient.targets.cards', 'Image plates and 3D viewer'),
          toggle('gradient.targets.accents', 'Accent blocks', { help: '"On the bench now", "Part of" project links.' }),
          toggle('gradient.targets.buttons', 'Selected buttons and the Email button'),
        ]),
      ];
    },
  },
  {
    id: 'motion', label: 'Animations and Motion', paths: ['motion'],
    intro: 'How sections enter, how things respond to hover, and how pages change. Visitors who turn on reduced motion on their device always get a still site.',
    render: () => {
      const m = s.motion;
      const match = (p: Partial<Settings['motion']>) => Object.entries(p).every(([k, v]) => (m as any)[k] === v);
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      return [
        toggle('motion.enabled', 'Animations on', { help: 'Master switch. Off removes every transition and animation on the site.' }),
        reduced ? h('p', { class: 'st-warn' }, 'Your device has reduced motion turned on, so the preview stays still no matter what you pick here.') : null,
        section('Motion presets', [
          h('div', { class: 'st-cards' }, ...Object.entries(MOTION_PRESETS).map(([id, p]) => h('button', {
            type: 'button', class: 'st-card', 'aria-pressed': String(match(p.motion)),
            onclick: () => { record(); Object.assign(s.motion, p.motion); commit(true); reloadPreview(); },
          }, h('span', { class: 'st-card-body' }, h('strong', {}, p.label), h('span', {}, p.note))))),
        ]),
        section('Section entrances', [
          toggle('motion.scrollReveal', 'Animate sections as they scroll into view'),
          seg('motion.style', 'Style', [['none', 'None'], ['fade', 'Fade'], ['slide', 'Slide'], ['scale', 'Scale'], ['reveal', 'Reveal'], ['combo', 'Combination']],
            { help: 'Reveal wipes content in like a curtain. Combination fades and slides together.' }),
          seg('motion.direction', 'Direction', [['up', 'Up'], ['down', 'Down'], ['left', 'Left'], ['right', 'Right']], { help: 'For Slide, Reveal and Combination.' }),
          slider('motion.distance', 'Intensity', { unit: 'px', help: 'How far things travel as they enter.' }),
          slider('motion.duration', 'Duration', { unit: 'ms', help: 'Also scales hover and page change speed.' }),
          seg('motion.easing', 'Smoothness', [['standard', 'Standard'], ['smooth', 'Smooth'], ['snappy', 'Snappy'], ['linear', 'Linear']]),
          slider('motion.stagger', 'Stagger', { unit: 'ms', help: 'Delay between items that enter together, like a list.' }),
          h('button', { type: 'button', class: 'st-btn st-btn-sm', onclick: reloadPreview }, 'Replay in preview'),
        ]),
        section('Interaction', [
          seg('motion.hover', 'Hover effects', [['none', 'None'], ['subtle', 'Subtle'], ['lively', 'Lively']], { help: 'How far cards, rows and titles shift or zoom when hovered.' }),
          seg('motion.pageTransition', 'Page transitions', [['none', 'None'], ['fade', 'Fade'], ['slide', 'Slide']], { help: 'Between pages, in browsers that support view transitions (Chrome, Edge, Safari 18).' }),
          slider('motion.parallax', 'Cover parallax', { fmt: (v) => (v ? `${Math.round(v * 100)}%` : 'Off'), help: 'Your name on the home cover drifts slower than the page while scrolling.' }),
          toggle('motion.smoothScroll', 'Smooth scrolling for in page links'),
        ]),
      ];
    },
  },
  {
    id: 'three', label: '3D Visuals', paths: ['three'],
    intro: 'Applies to every 3D viewer on the site: the OTV assembly and the gripper jaw. Open a 3D page in the preview to see changes.',
    render: () => [
      h('div', { class: 'st-row', style: { marginBottom: '14px' } },
        h('button', { type: 'button', class: 'st-btn st-btn-sm', onclick: () => goPreview('/work/enes100-otv/') }, 'Preview the OTV'),
        h('button', { type: 'button', class: 'st-btn st-btn-sm', onclick: () => goPreview('/cad/gripper/') }, 'Preview the gripper')),
      section('Lighting and shadow', [
        slider('three.exposure', 'Lighting intensity', { unit: '' }),
        seg('three.environment', 'Environment light', [['neutral', 'Studio'], ['legacy', 'Warm room']], { help: 'The light reflected onto the model.' }),
        slider('three.shadow', 'Shadow intensity', { unit: '' }),
        slider('three.shadowSoftness', 'Shadow softness', { unit: '' }),
      ]),
      section('Material', [
        seg('three.material', 'Material appearance', [['original', 'As exported'], ['clay', 'Clay'], ['satin', 'Satin'], ['metal', 'Metallic']],
          { help: 'As exported keeps the CAD colors. Clay makes every part one matte grey, useful for judging form. Satin and Metallic change surface finish but keep colors.' }),
        h('p', { class: 'st-note' }, 'Exploded views and per part highlighting need named parts and assembly data that the current exports do not include, so they are not offered.'),
      ]),
      section('Camera and motion', [
        toggle('three.autoRotate', 'Rotate automatically', { help: 'Visitors can still stop it with the Spin button.' }),
        slider('three.rotateSpeed', 'Rotation speed', { unit: '° per second' }),
        slider('three.zoom', 'Camera zoom', { unit: '%', help: 'Above 100% starts closer. Visitors can still zoom freely.' }),
        slider('three.sensitivity', 'Drag sensitivity', { fmt: (v) => `${v.toFixed(2)}×`, help: 'How fast the model turns when dragged.' }),
      ]),
      section('Backdrop', [
        seg('three.backdrop', 'Viewer background', [['grid', 'Grid'], ['plain', 'Plain'], ['dark', 'Dark'], ['transparent', 'Transparent']]),
      ]),
    ],
  },
  {
    id: 'advanced', label: 'Save, Export, Reset', paths: [],
    intro: 'Back up your design, move it to another browser, or go back to where you started.',
    render: () => [
      section('Publish', [
        h('p', { class: 'st-note', style: { marginBottom: '10px' } }, 'Make the current design what every visitor sees.'),
        h('button', { type: 'button', class: 'st-btn st-btn-primary', onclick: openPublish }, 'Publish for everyone'),
      ], { collapsible: false }),
      section('Export and import', [
        h('div', { class: 'st-row' },
          h('button', { type: 'button', class: 'st-btn', onclick: exportTheme }, 'Export theme file'),
          h('button', { type: 'button', class: 'st-btn', onclick: () => $<HTMLInputElement>('#st-import-file').click() }, 'Import theme file')),
        h('p', { class: 'st-note' }, 'Imported files are checked setting by setting. Anything invalid falls back to a safe value, so a bad file cannot break the site.'),
      ], { collapsible: false }),
      section('Reset', [
        h('div', { class: 'st-row' },
          h('button', { type: 'button', class: 'st-btn', onclick: () => { record(); s = clone(published); commit(true); toast('Back to the published design'); } }, 'Restore published design'),
          h('button', { type: 'button', class: 'st-btn st-btn-danger', onclick: () => { record(); s = clone(DEFAULTS); commit(true); toast('Original Ali Works design restored'); } }, 'Restore original design')),
        h('p', { class: 'st-note' }, 'Published is what visitors see now. Original is the design the site launched with (Drafting Paper). Both can be undone.'),
      ], { collapsible: false }),
    ],
  },
];

// ── render ───────────────────────────────────────────────────
let currentCat = CATS.some((c) => c.id === location.hash.slice(1)) ? location.hash.slice(1) : 'themes';
function renderCats() {
  cats.replaceChildren(...CATS.map((c, i) => h('button', {
    type: 'button', class: 'st-cat', 'data-cat': c.id, 'aria-current': String(c.id === currentCat),
    onclick: () => { currentCat = c.id; history.replaceState(null, '', `#${c.id}`); renderCats(); render(true); },
  }, h('span', { class: 'n' }, String(i + 1).padStart(2, '0')), c.label, h('span', { class: 'mod', hidden: true, title: 'Changed from the published design' }))));
}
function render(top = false) {
  const cat = CATS.find((c) => c.id === currentCat)!;
  const scroll = top ? 0 : panel.scrollTop;
  panel.replaceChildren(
    h('div', { class: 'st-panel-head' },
      h('h2', {}, cat.label),
      cat.paths.length ? h('button', {
        type: 'button', class: 'st-btn st-btn-sm', title: 'Reset this category to the published design',
        onclick: () => { record(); for (const p of cat.paths) setPath(s, p, clone(getPath(published, p))); commit(true); toast(`${cat.label} reset`); },
      }, 'Reset category') : null),
    h('p', { class: 'st-panel-intro' }, cat.intro),
    ...cat.render(),
  );
  panel.scrollTop = scroll;
  markMods();
}

// ── preview frame ────────────────────────────────────────────
let deviceW = 1280;
function fit() {
  const box = frameBox.getBoundingClientRect();
  const scale = Math.min(1, (box.width - 24) / deviceW);
  iframe.style.width = `${deviceW}px`;
  iframe.style.height = `${(box.height - 12) / scale}px`;
  iframe.style.top = '12px';
  iframe.style.transform = `translateX(-50%) scale(${scale})`;
}
new ResizeObserver(fit).observe(frameBox);
iframe.addEventListener('load', preview);
function reloadPreview() { try { iframe.contentWindow?.location.reload(); } catch { iframe.src = iframe.src; } }
function goPreview(path: string) { $<HTMLSelectElement>('#st-page').value = path; iframe.src = path; }
$<HTMLSelectElement>('#st-page').addEventListener('change', (e) => { iframe.src = (e.target as HTMLSelectElement).value; });
$('#st-replay').addEventListener('click', reloadPreview);
document.querySelectorAll<HTMLButtonElement>('#st-device button').forEach((b) => b.addEventListener('click', () => {
  deviceW = +b.dataset.w!;
  document.querySelectorAll('#st-device button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  fit();
}));
function syncDayNight() {
  document.querySelectorAll<HTMLButtonElement>('#st-daynight button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.m === previewMode)));
}
document.querySelectorAll<HTMLButtonElement>('#st-daynight button').forEach((b) => b.addEventListener('click', () => {
  previewMode = b.dataset.m as typeof previewMode;
  if (previewMode !== 'device') editNight = previewMode === 'night';
  syncDayNight(); preview(); if (currentCat === 'colors') render();
}));

// ── files ────────────────────────────────────────────────────
function download(name: string, data: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const a = h('a', { href: url, download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function exportTheme() {
  download(`ali-works-theme-${new Date().toISOString().slice(0, 10)}.json`, { app: 'ali-works-studio', version: 1, settings: s });
  toast('Theme file downloaded');
}
$<HTMLInputElement>('#st-import-file').addEventListener('change', async (e) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  try {
    if (file.size > 200_000) throw new Error('too big');
    const data = JSON.parse(await file.text());
    record();
    s = sanitize(data && typeof data === 'object' && 'settings' in data ? data.settings : data, DEFAULTS);
    commit(true);
    toast(`Imported ${file.name}`);
  } catch {
    toast('That file is not a valid theme file');
  }
});
const publishDialog = $<HTMLDialogElement>('#st-publish-dialog');
function openPublish() { publishDialog.showModal(); }
$('#st-publish').addEventListener('click', openPublish);
$('#pub-download').addEventListener('click', () => { download('site-theme.json', s); toast('site-theme.json downloaded'); });

// ── misc ─────────────────────────────────────────────────────
let toastTimer = 0;
function toast(msg: string) {
  const t = $('#st-toast');
  t.textContent = msg; t.classList.add('on');
  clearTimeout(toastTimer); toastTimer = window.setTimeout(() => t.classList.remove('on'), 1800);
}
$('#st-undo').addEventListener('click', undo);
$('#st-redo').addEventListener('click', redo);
addEventListener('keydown', (e) => {
  if (!(e.ctrlKey || e.metaKey) || (e.target as HTMLElement).matches('input[type="text"]')) return;
  const k = e.key.toLowerCase();
  if (k === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
  else if ((k === 'z' && e.shiftKey) || k === 'y') { e.preventDefault(); redo(); }
});

renderCats();
render(true);
persist();
fit();
