// sitemap.xml: every public page, so search engines find project and CAD pages.
import type { APIRoute } from 'astro';
import { getProjects, getCad, getNotebook } from '../lib/content';

export const GET: APIRoute = async ({ site }) => {
  const pages = ['/', '/work/', '/cad/', '/notebook/', '/toolbox/', '/about/',
    ...(await getProjects()).map((p) => `/work/${p.id}/`),
    ...(await getCad()).map((c) => `/cad/${c.id}/`),
    ...(await getNotebook()).map((n) => `/notebook/${n.id}/`)];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `  <url><loc>${new URL(p, site)}</loc></url>`).join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
