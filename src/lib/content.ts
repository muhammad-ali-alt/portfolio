// Helpers that read the content folders and sort them.
import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

const statusOrder = { 'In progress': 0, Planned: 1, Idea: 2, Paused: 3, Complete: 4 } as const;

/** All projects: real ones first, newest first. */
export async function getProjects() {
  const all = await getCollection('projects');
  return all.sort(
    (a, b) => Number(a.data.sample) - Number(b.data.sample) || b.data.date.valueOf() - a.data.date.valueOf(),
  );
}

/** Projects shown on the home page: finished work with an image leads, then work in progress. */
const featuredOrder = { Complete: 0, 'In progress': 1, Planned: 2, Idea: 3, Paused: 4 } as const;
export async function getFeatured() {
  const all = await getProjects();
  return all
    .filter((p) => p.data.featured)
    .sort(
      (a, b) =>
        Number(!b.data.cover) - Number(!a.data.cover) === 0
          ? featuredOrder[a.data.status] - featuredOrder[b.data.status]
          : Number(!a.data.cover) - Number(!b.data.cover),
    );
}

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
export const fmtDay = (d: Date) => d.toISOString().slice(0, 10);
export const latestRev = (p: Project) => p.data.revisions.at(-1)?.rev ?? '—';
