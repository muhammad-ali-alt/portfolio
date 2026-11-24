// Stylesheet for the previews inside the CMS editor, built from the
// published theme so previews use the site's real colors and spacing.
import publishedTheme from '../../data/site-theme.json';
import { sanitize } from '../../theme/schema';
import { computeTheme } from '../../theme/compute';

export function GET() {
  const theme = computeTheme(sanitize(publishedTheme));
  const css = `${theme.css}
body { margin: 0; background: var(--paper); color: var(--ink); font: 17px/1.6 Georgia, serif; }
.pv { padding: 28px 32px 60px; max-width: 760px; }
.pv h1, .pv h2 { font-family: system-ui, sans-serif; letter-spacing: -0.02em; line-height: 1.05; margin: 0; }
.pv h1 { font-size: 40px; margin: 6px 0 10px; }
.pv-num { font: 12px/1 ui-monospace, monospace; color: var(--accent-ink); margin: 0; letter-spacing: 0.04em; }
.pv-sum { color: var(--graphite); font-size: 19px; margin: 0 0 20px; }
.pv-tb { display: grid; grid-template-columns: 1fr 1fr; border-top: 2px solid var(--ink); margin: 0 0 24px; }
.pv-tb div { padding: 8px 0; border-bottom: 1px solid var(--rule); }
.pv-tb dt { font: 11px/1 ui-monospace, monospace; text-transform: uppercase; color: var(--graphite); margin-bottom: 4px; }
.pv-tb dd { margin: 0; font-family: system-ui, sans-serif; font-size: 14px; }
.pv-cover, .prose img { max-width: 100%; border-radius: var(--radius); background: var(--surface); margin: 12px 0; }
.pv-md { white-space: pre-wrap; }
.pv-cap { font: 12px/1.4 ui-monospace, monospace; color: var(--graphite); }
.prose h2 { font-size: 22px; margin: 2em 0 0.6em; padding-top: 0.6em; border-top: 1px solid var(--rule); }
.prose table { border-collapse: collapse; font: 13px ui-monospace, monospace; }
.prose th, .prose td { border-bottom: 1px solid var(--rule); padding: 6px 14px 6px 0; text-align: left; }
.prose pre { background: var(--paper-2); padding: 12px; border-left: 3px solid var(--accent); overflow-x: auto; }
.prose a { color: var(--accent-ink); }
`;
  return new Response(css, { headers: { 'Content-Type': 'text/css' } });
}
