// ─────────────────────────────────────────────────────────────
// MOTION: scroll reveals and cover parallax.
// Both read the settings the theme engine puts on <html>
// (data-reveal, data-parallax, --stagger, --parallax), so the
// Studio can switch them on and off live.
// ─────────────────────────────────────────────────────────────
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

// Elements that enter as a group. Listed here so no page markup
// has to change when motion settings change.
const TARGETS = [
  '.page-head > *', '.p-head > *', '.head > *',
  '.section-head', '.toc-list > li', '.card', '.fields-grid > *', '.about-grid > *',
  '.filters', '.index > .row:not(.head)', '.drawer > li', '.log > li',
  '.tblock', '.hero', '.revs', '.prose > *', '.side-inner > *', '.related li', '.next',
  '.spread > *', '.story > *', '.jobs > li', '.inv > li', '.notes',
  '.group li', '.layout > *', '.closing', '.tb',
].join(',');

let observer: IntersectionObserver | null = null;

function setupReveal() {
  observer?.disconnect();
  observer = null;
  const els = [...document.querySelectorAll<HTMLElement>(TARGETS)];
  const on = root.dataset.reveal === 'on' && !reduced.matches;
  if (!on) {
    els.forEach((el) => el.classList.remove('rv', 'rv-in'));
    return;
  }
  const stagger = parseFloat(getComputedStyle(root).getPropertyValue('--stagger')) || 0;
  // Elements that enter in the same frame get staggered delays.
  observer = new IntersectionObserver(
    (entries) => {
      let i = 0;
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        el.style.setProperty('--rv-delay', `${Math.min(i++, 8) * stagger}ms`);
        el.classList.add('rv-in');
        observer?.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  for (const el of els) {
    if (el.classList.contains('rv-in')) continue;
    el.classList.add('rv');
    observer.observe(el);
  }
}

// Parallax: the cover name drifts slower than the page.
let ticking = false;
const name = document.querySelector<HTMLElement>('.name');
function parallax() {
  ticking = false;
  if (!name) return;
  const k = root.dataset.parallax === 'on' && !reduced.matches
    ? parseFloat(getComputedStyle(root).getPropertyValue('--parallax')) || 0
    : 0;
  name.style.transform = k ? `translateY(${Math.min(scrollY, 900) * k * 0.4}px)` : '';
}
addEventListener('scroll', () => {
  if (!ticking) { ticking = true; requestAnimationFrame(parallax); }
}, { passive: true });

// ── Word rise ────────────────────────────────────────────────
// Wrap each word of big headings in two spans so the inner one can
// slide up from behind the outer one's mask. Only text nodes are
// touched, so links and accent spans inside headings keep working.
const RISE = 'h1, .display, .section-head h2, .big-statement, .closing, .next-title';
function wrapWords(el: HTMLElement) {
  if (el.dataset.words) return;
  el.dataset.words = '1';
  let i = 0;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    const parts = node.textContent!.split(/(\s+)/);
    const frag = document.createDocumentFragment();
    for (const part of parts) {
      if (!part) continue;
      if (/^\s+$/.test(part)) { frag.append(part); continue; }
      const outer = document.createElement('span'); outer.className = 'w';
      const inner = document.createElement('span'); inner.className = 'wi';
      inner.style.setProperty('--wi', String(Math.min(i++, 10))); // cap so long lines finish quickly
      inner.textContent = part;
      outer.append(inner); frag.append(outer);
    }
    node.replaceWith(frag);
  }
}
let riseObserver: IntersectionObserver | null = null;
function setupRise() {
  riseObserver?.disconnect();
  const els = [...document.querySelectorAll<HTMLElement>(RISE)];
  if (root.dataset.textrise !== 'on' || reduced.matches) { els.forEach((el) => el.classList.remove('tr')); return; }
  riseObserver = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('tr-in'); riseObserver?.unobserve(e.target); }
  }, { rootMargin: '0px 0px -6% 0px' });
  for (const el of els) {
    wrapWords(el);
    if (el.classList.contains('tr-in')) continue;
    el.classList.add('tr');
    riseObserver.observe(el);
  }
}

// ── Sweep page transition ────────────────────────────────────
// On a same site link click, a band of the primary color sweeps in,
// the next page loads underneath, then the band sweeps away.
const sweep = document.querySelector<HTMLElement>('.pt-sweep');
const SWEEP_KEY = 'aw-sweep';
const sweepOn = () => root.dataset.pt === 'sweep' && !reduced.matches;
const sweepMs = () => 520 * (parseFloat(getComputedStyle(root).getPropertyValue('--speed')) || 1);
if (sweep) {
  let arrived = false;
  try { arrived = sessionStorage.getItem(SWEEP_KEY) === '1'; sessionStorage.removeItem(SWEEP_KEY); } catch { /* storage blocked */ }
  if (arrived && sweepOn()) {
    sweep.classList.add('is-covered');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      sweep.classList.remove('is-covered'); sweep.classList.add('is-out');
      setTimeout(() => sweep.classList.remove('is-out'), sweepMs() + 50);
    }));
  }
  document.addEventListener('click', (e) => {
    if (!sweepOn() || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement).closest('a');
    if (!a || a.target || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash) || url.pathname.startsWith('/studio')) return;
    e.preventDefault();
    try { sessionStorage.setItem(SWEEP_KEY, '1'); } catch { /* storage blocked */ }
    sweep.classList.add('is-in');
    setTimeout(() => { location.href = url.href; }, sweepMs());
  });
  // Coming back with the browser's back button can restore a covered page from cache.
  addEventListener('pageshow', (e) => { if (e.persisted) sweep.classList.remove('is-in', 'is-covered'); });
}

function refresh() {
  setupReveal();
  setupRise();
  parallax();
}
refresh();
addEventListener('aw-theme', refresh); // Studio changed a setting
reduced.addEventListener('change', refresh);
