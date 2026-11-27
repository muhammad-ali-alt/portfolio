// ─────────────────────────────────────────────────────────────
// PROJECT VIEWERS
// Decides how each project is presented and prepares the data its
// viewers need. Content lives in the project's front matter; the
// viewer components in src/components/viewers only draw it.
//
//   assembly   clickable 3D assembly (model + parts with `node` + a parts file)
//   model      one 3D model
//   compare    several 3D models in a carousel (iterations, variants, parts)
//   annotated  the cover image with callout markers (`hotspots`)
//   stages     a process stepped through in order (`stages`)
//   software   screens, code snippets and a demo link
//   data       charts (`charts`)
//   image      the cover image
//
// `viewer: auto` picks the first one the project can fill, in that order.
// Whatever is not the main view is still shown lower on the page.
// ─────────────────────────────────────────────────────────────
import { getImage } from 'astro:assets';
import type { CollectionEntry } from 'astro:content';
import { md } from './markdown';

type Project = CollectionEntry<'projects'>;
type Data = Project['data'];
export type ViewerKind = 'assembly' | 'model' | 'compare' | 'annotated' | 'stages' | 'software' | 'data' | 'image';
const ORDER: ViewerKind[] = ['assembly', 'model', 'compare', 'annotated', 'stages', 'software', 'data', 'image'];
// these can also appear lower on the page when they are not the main view
const EXTRAS: ViewerKind[] = ['annotated', 'stages', 'software', 'data'];

export const VIEWER_LABEL: Record<ViewerKind, string> = {
  assembly: 'Interactive 3D', model: '3D model', compare: '3D comparison', annotated: 'Annotated',
  stages: 'Walkthrough', software: 'Software', data: 'Data', image: 'Image',
};

// Part positions for clickable assemblies: src/data/model-parts/<assembly file name>.json
type Layout = { bounds: { min: number[]; max: number[] }; parts: Record<string, { node: string; center: [number, number, number] }[]> };
const layouts = import.meta.glob<Layout>('../data/model-parts/*.json', { eager: true, import: 'default' });
const layoutFor = (model?: string) => model ? layouts[`../data/model-parts/${model.split('/').pop()!.replace(/\.(glb|gltf)$/i, '')}.json`] : undefined;

function available(d: Data): Record<ViewerKind, boolean> {
  const layout = layoutFor(d.model);
  return {
    assembly: !!layout && d.models.some((m) => m.node && layout.parts[m.node]),
    model: !!d.model,
    compare: d.models.length > 0,
    annotated: d.hotspots.length > 0 && !!d.cover,
    stages: d.stages.length > 0,
    software: d.screens.length + d.snippets.length > 0,
    data: d.charts.length > 0,
    image: !!d.cover,
  };
}

/** The main view and the extra explorers, without loading anything (cheap, for lists). */
export function plan(d: Data) {
  const has = available(d);
  const hero = d.viewer !== 'auto' && has[d.viewer] ? d.viewer : ORDER.find((k) => has[k]) ?? null;
  const extras = EXTRAS.filter((k) => has[k] && k !== hero);
  // the parts carousel stays under a single 3D model; a clickable assembly already
  // shows every part (list, panel, isolated 3D view), so it gets no carousel
  const carousel = has.compare && hero !== 'compare' && hero !== 'assembly';
  return { hero, extras, carousel, has };
}

const src = async (x: unknown, width = 1400) =>
  !x ? undefined : typeof x === 'string' ? x : (await getImage({ src: x as any, width, format: 'webp' })).src;

/** Everything the viewers need, with images resolved and markdown rendered. */
export async function prepare(project: Project) {
  const d = project.data;
  const p = plan(d);
  const layout = layoutFor(d.model);
  const assembly = p.has.assembly && layout ? {
    center: layout.bounds.min.map((v, k) => (v + layout.bounds.max[k]) / 2) as [number, number, number],
    parts: await Promise.all(d.models.filter((m) => m.node && layout.parts[m.node]).map(async (m) => ({
      key: m.node!, label: m.label, src: m.src, position: layout.parts[m.node!][0].center, nodes: layout.parts[m.node!],
      role: m.role, design: m.design, note: m.note, volume: m.volume, material: m.material, orbit: m.orbit, orientation: m.orientation,
      image: await src(m.image, 480),
    }))),
  } : null;
  return {
    ...p,
    assembly,
    cover: await src(d.cover),
    hotspots: await Promise.all(d.hotspots.map(async (h) => ({ x: h.x, y: h.y, label: h.label, html: md(h.body), image: await src(h.image, 600) }))),
    stages: await Promise.all(d.stages.map(async (s) => ({ title: s.title, caption: s.caption, html: md(s.body), image: await src(s.image) }))),
    screens: await Promise.all(d.screens.map(async (s) => ({ title: s.title, html: md(s.body), image: await src(s.image) }))),
    snippets: d.snippets,
    charts: d.charts,
  };
}

export const EXPLORE_TITLES = { annotated: 'Callouts', stages: 'Walkthrough', software: 'Software', data: 'Data' } as const;

/** Headings the case study and explorers add to the page's Sections list. */
export function pageHeadings(d: Data) {
  const p = plan(d);
  return [
    d.overview && { slug: 'c-overview', text: 'Overview' },
    (d.role || d.contributions.length) && { slug: 'c-role', text: 'My role' },
    d.challenges.length && { slug: 'c-challenges', text: 'Challenges' },
    d.learned.length && { slug: 'c-learned', text: 'What I learned' },
    ...p.extras.map((k) => ({ slug: `x-${k}`, text: EXPLORE_TITLES[k as keyof typeof EXPLORE_TITLES] })),
  ].filter(Boolean) as { slug: string; text: string }[];
}
