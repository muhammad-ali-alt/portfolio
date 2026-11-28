// Keeps "PLACEHOLDER: ..." notes out of the public site.
// The notes stay in the files (and on the admin dashboard's to do list); the
// build cuts them, and any heading left with nothing under it, from the page.
//   - text from "PLACEHOLDER" to the end of its paragraph or list item is removed
//   - a paragraph left with only a bold lead in ("How it works.") is removed
//   - a list item or table cell left empty is removed
//   - a heading whose section ends up empty is removed
const MARK = 'PLACEHOLDER';
const text = (n) => (n.type === 'text' ? n.value : (n.children ?? []).map(text).join(''));

// cut a node's children from the first PLACEHOLDER text onwards
function cut(node) {
  if (!node.children) return false;
  for (let i = 0; i < node.children.length; i++) {
    const c = node.children[i];
    if (c.type === 'text' && c.value.includes(MARK)) {
      c.value = c.value.slice(0, c.value.indexOf(MARK)).replace(/\s+$/, '');
      node.children.length = i + 1;
      return true;
    }
    if (cut(c)) { node.children.length = i + 1; return true; }
  }
  return false;
}
const empty = (n) => text(n).trim() === '' && !hasMedia(n);
const hasMedia = (n) => ['img', 'video', 'iframe', 'svg', 'model-viewer'].includes(n.tagName) || (n.children ?? []).some(hasMedia);
// "How it works." on its own: only strong text and whitespace left
const labelOnly = (p) => p.children.every((c) => (c.type === 'text' && !c.value.trim()) || (c.tagName === 'strong'));

function clean(parent) {
  if (!parent.children) return;
  for (const c of parent.children) if (c.type === 'element') {
    if (['p', 'li', 'td', 'th', 'blockquote'].includes(c.tagName) && text(c).includes(MARK)) cut(c);
    clean(c);
  }
  parent.children = parent.children.filter((c) => {
    if (c.type !== 'element') return true;
    if (c.tagName === 'p' && (empty(c) || (text(c).trim() && labelOnly(c) && c.children.some((x) => x.tagName === 'strong') && !hasMedia(c)))) return !(empty(c) || labelOnly(c));
    if (['li', 'ul', 'ol', 'blockquote'].includes(c.tagName) && empty(c)) return false;
    return true;
  });
}

// remove headings with nothing (but whitespace or a smaller heading) under them
function dropEmptyHeadings(root) {
  const kids = root.children, level = (n) => (n.type === 'element' && /^h[1-6]$/.test(n.tagName) ? +n.tagName[1] : 0);
  for (let i = kids.length - 1; i >= 0; i--) {
    const L = level(kids[i]); if (!L) continue;
    let j = i + 1, content = false;
    for (; j < kids.length; j++) { const l = level(kids[j]); if (l && l <= L) break; if (kids[j].type === 'element' && !l) { content = true; break; } if (l > L) { content = true; break; } }
    if (!content) kids.splice(i, 1);
  }
}

export default function rehypeHidePlaceholders() {
  return (tree) => { clean(tree); dropEmptyHeadings(tree); };
}
// for plain strings (CMS fields): null when the string is only a placeholder
export const stripPlaceholder = (s) => {
  if (typeof s !== 'string') return s;
  const i = s.indexOf(MARK);
  return i < 0 ? s : s.slice(0, i).trim() || null;
};
