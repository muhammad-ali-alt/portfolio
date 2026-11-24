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

function refresh() {
  setupReveal();
  parallax();
}
refresh();
addEventListener('aw-theme', refresh); // Studio changed a setting
reduced.addEventListener('change', refresh);
