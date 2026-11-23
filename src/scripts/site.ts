// Small site wide behaviors. Each one is independent.

// 1. Press G to toggle the construction grid (the easter egg).
document.addEventListener('keydown', (e) => {
  const t = e.target as HTMLElement;
  if (t.closest('input, textarea, select, [contenteditable], model-viewer')) return;
  if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
    document.documentElement.classList.toggle('show-grid');
  }
});

// 2. Click any image in a write up (or anything with data-zoom) to enlarge it.
const dialog = document.querySelector<HTMLDialogElement>('dialog.lightbox');
document.addEventListener('click', (e) => {
  const img = (e.target as HTMLElement).closest<HTMLImageElement>('.prose img, img[data-zoom]');
  if (!img || !dialog) return;
  const big = dialog.querySelector('img')!;
  big.src = img.currentSrc || img.src;
  big.alt = img.alt;
  dialog.querySelector('.lb-cap')!.textContent = img.alt;
  dialog.showModal();
});
dialog?.addEventListener('click', (e) => {
  if (e.target === dialog || (e.target as HTMLElement).tagName === 'IMG') dialog.close();
});

// 3. A note for anyone who opens the developer console.
console.log('%cAli Works', 'font: 700 16px sans-serif; color: #ff4f00', '\nBuilt with Astro. Source: https://github.com/muhammad-ali-alt/portfolio');
