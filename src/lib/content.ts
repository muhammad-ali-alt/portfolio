// Helpers that read the content folders, filter out drafts, and sort.
// Every public page goes through these, so a draft never reaches the site.
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

const statusOrder = { 'In progress': 0, Planned: 1, Idea: 2, Paused: 3, Complete: 4 } as const;

/** Every published project, including archived ones (their pages still exist). Newest first. */
export async function getAllProjects() {
  const all = await getCollection('projects', (p) => !p.data.draft);
  return all.sort(
    (a, b) => Number(a.data.sample) - Number(b.data.sample) || b.data.date.valueOf() - a.data.date.valueOf(),
  );
}

/** Projects shown in listings: published and not archived. */
export async function getProjects() {
  return (await getAllProjects()).filter((p) => !p.data.archived);
}

/** Projects shown on the home page. A manual `order` wins; otherwise finished work with an image leads. */
const featuredOrder = { Complete: 0, 'In progress': 1, Planned: 2, Idea: 3, Paused: 4 } as const;
export async function getFeatured() {
  const all = await getProjects();
  return all
    .filter((p) => p.data.featured)
    .sort((a, b) => {
      const ao = a.data.order ?? Infinity, bo = b.data.order ?? Infinity;
      if (ao !== bo) return ao - bo;
      const img = Number(!a.data.cover) - Number(!b.data.cover);
      return img || featuredOrder[a.data.status] - featuredOrder[b.data.status];
    });
}

/** Resolve a project link from a notebook or CAD entry. Missing or hidden projects return undefined. */
export async function linkedProject(id: string | undefined) {
  if (!id) return undefined;
  const p = await getEntry('projects', id);
  return p && !p.data.draft ? p : undefined;
}

export const getCad = async () =>
  (await getCollection('cad', (c) => !c.data.draft)).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

/** Published notebook entries: pinned first, then newest first. */
export const getNotebook = async () =>
  (await getCollection('notebook', (n) => !n.data.draft)).sort(
    (a, b) => Number(b.data.pinned) - Number(a.data.pinned) || b.data.date.valueOf() - a.data.date.valueOf(),
  );

/** Map of tool name (lowercase) -> projects that used it. */
export async function getToolUsage() {
  const map = new Map<string, Project[]>();
  for (const p of await getProjects()) {
    for (const t of p.data.tools) {
      const k = t.toLowerCase();
      map.set(k, [...(map.get(k) ?? []), p]);
    }
  }
  return map;
}

export const fmtMonth = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
// One date style across the site: "Nov 2026" for months, "Nov 23, 2026" for days.
export const fmtDay = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
export const latestRev = (p: Project) => p.data.revisions.at(-1)?.rev ?? '—';
/** Images can be an optimized asset or an uploaded path. */
export const isUpload = (src: unknown): src is string => typeof src === 'string';
