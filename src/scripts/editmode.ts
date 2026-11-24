// ─────────────────────────────────────────────────────────────
// EDIT MODE (only for you, when signed in to the CMS)
// Shows a small control in the corner. When on, every element with
// data-edit="<editor link>" gets an outline and an edit button that
// opens the right editor. This is a convenience, not the security:
// saving always requires a GitHub account with write access to the
// repository, which GitHub checks on its servers.
// ─────────────────────────────────────────────────────────────
const KEY = 'aw.editmode';
let signedIn = false;
try { signedIn = !!JSON.parse(localStorage.getItem('decap-cms-user') || 'null')?.token; } catch { /* storage blocked */ }

if (signedIn && !location.pathname.startsWith('/admin')) {
  const root = document.documentElement;
  const bar = document.createElement('div');
  bar.className = 'em-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Edit mode');
  bar.innerHTML = `
    <button type="button" class="em-toggle" aria-pressed="false"><span class="em-dot"></span><span class="em-state">Edit mode off</span></button>
    <span class="em-more">
      <a href="/admin/#/collections/projects/new">+ Project</a>
      <a href="/admin/#/collections/notebook/new">+ Entry</a>
      <a href="/admin/dashboard/">Dashboard</a>
    </span>`;
  document.body.append(bar);
  const toggle = bar.querySelector<HTMLButtonElement>('.em-toggle')!;

  const apply = (on: boolean) => {
    root.classList.toggle('edit-mode', on);
    toggle.setAttribute('aria-pressed', String(on));
    bar.querySelector('.em-state')!.textContent = on ? 'Edit mode on' : 'Edit mode off';
    document.querySelectorAll<HTMLElement>('[data-edit]').forEach((el) => {
      let btn = el.querySelector<HTMLAnchorElement>(':scope > .em-btn');
      if (on && !btn) {
        btn = document.createElement('a');
        btn.className = 'em-btn';
        btn.href = el.dataset.edit!;
        btn.textContent = `✎ ${el.dataset.editLabel || 'Edit'}`;
        el.append(btn);
      }
      if (!on) btn?.remove();
    });
    try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* storage blocked */ }
  };
  toggle.addEventListener('click', () => apply(!root.classList.contains('edit-mode')));
  let saved = 'off';
  try { saved = localStorage.getItem(KEY) || 'off'; } catch { /* storage blocked */ }
  apply(saved === 'on');
}
