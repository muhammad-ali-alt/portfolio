// Previews inside the CMS editor. They use the site's published colors
// and spacing (/admin/preview.css). For the exact page, use "View Preview"
// on a draft: Netlify builds a full preview of the site with your change.
/* global CMS, h, createClass */
CMS.registerPreviewStyle('/admin/preview.css');

const list = (v) => (v && v.toJS ? v.toJS() : v) || [];

const ProjectPreview = createClass({
  render() {
    const e = this.props.entry;
    const get = (k) => e.getIn(['data', k]);
    const cover = get('cover') ? this.props.getAsset(get('cover')) : null;
    // Read sections as plain data: safe when a project has none.
    const sections = list(get('sections')).filter(Boolean);
    return h('article', { className: 'pv' },
      h('p', { className: 'pv-num' }, get('number') || 'MA-000', get('draft') ? '  ·  HIDDEN DRAFT' : ''),
      h('h1', {}, get('title') || 'Untitled project'),
      h('p', { className: 'pv-sum' }, get('summary') || ''),
      h('dl', { className: 'pv-tb' },
        h('div', {}, h('dt', {}, 'Status'), h('dd', {}, get('status') || '')),
        h('div', {}, h('dt', {}, 'Context'), h('dd', {}, get('context') || '')),
        h('div', {}, h('dt', {}, 'Tools'), h('dd', {}, list(get('tools')).join(', '))),
        h('div', {}, h('dt', {}, 'Disciplines'), h('dd', {}, list(get('disciplines')).join(', '))),
      ),
      cover ? h('img', { className: 'pv-cover', src: cover.toString() }) : null,
      h('div', { className: 'prose' },
        sections.map((s, i) => h('section', { key: i },
          h('h2', {}, s.title || 'Untitled section'),
          s.body ? h('div', { className: 'pv-md' }, s.body) : null,
          s.image ? h('img', { src: this.props.getAsset(s.image).toString() }) : null,
          s.caption ? h('p', { className: 'pv-cap' }, s.caption) : null,
        )),
        this.props.widgetFor('body'),
      ),
    );
  },
});

const NotePreview = createClass({
  render() {
    const e = this.props.entry;
    const get = (k) => e.getIn(['data', k]);
    const d = get('date');
    return h('article', { className: 'pv' },
      h('p', { className: 'pv-num' }, (d ? String(d).slice(0, 10) : ''), '  ·  ', get('type') || ''),
      h('h1', {}, get('title') || 'Untitled entry'),
      get('summary') ? h('p', { className: 'pv-sum' }, get('summary')) : null,
      h('div', { className: 'prose' }, this.props.widgetFor('body')),
    );
  },
});

CMS.registerPreviewTemplate('projects', ProjectPreview);
CMS.registerPreviewTemplate('notebook', NotePreview);

// ── Editor blocks: Table and Equation ───────────────────────
// Added to the "+" menu of every rich text editor. They write plain
// markdown, so the site renders them like hand written tables and math.
const cell = (s) => String(s || '').replace(/\|/g, '\\|').trim();
CMS.registerEditorComponent({
  id: 'table',
  label: 'Table',
  fields: [
    { name: 'header', label: 'Column headings (separate with commas)', widget: 'string' },
    { name: 'rows', label: 'Rows (one per line, cells separated with commas)', widget: 'text' },
  ],
  pattern: /^\|(.+)\|\n\|(?:\s*:?-+:?\s*\|)+\n((?:\|.*\|\n?)*)/m,
  fromBlock: (m) => ({
    header: m[1].split('|').map((c) => c.trim()).join(', '),
    rows: m[2].trim().split('\n').map((r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim()).join(', ')).join('\n'),
  }),
  toBlock: (d) => {
    const head = String(d.header || '').split(',').map(cell);
    const rows = String(d.rows || '').split('\n').filter((r) => r.trim()).map((r) => r.split(',').map(cell));
    const line = (cells) => `| ${cells.join(' | ')} |`;
    return [line(head), line(head.map(() => '---')), ...rows.map(line)].join('\n');
  },
  toPreview: (d) => `<pre>${String(d.header || '')}\n${String(d.rows || '')}</pre>`,
});
CMS.registerEditorComponent({
  id: 'equation',
  label: 'Equation',
  fields: [{ name: 'tex', label: 'Equation (LaTeX), e.g. \\sigma = \\frac{M}{S}', widget: 'string' }],
  pattern: /^\$\$\n?([\s\S]+?)\n?\$\$$/m,
  fromBlock: (m) => ({ tex: m[1].trim() }),
  toBlock: (d) => `$$\n${d.tex || ''}\n$$`,
  toPreview: (d) => `<pre>$$ ${d.tex || ''} $$</pre>`,
});
