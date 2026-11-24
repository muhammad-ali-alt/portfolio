// ─────────────────────────────────────────────────────────────
// SITE DATA (edited in the CMS at /admin/ under "Site and About")
// Every JSON file in src/data is validated here at build time.
// If an edit breaks the rules, the build stops with a clear error
// and Netlify keeps the last good version of the site online.
// ─────────────────────────────────────────────────────────────
import { z } from 'astro/zod';
import siteJson from '../data/site.json';
import aboutJson from '../data/about.json';
import skillsJson from '../data/skills.json';
import experienceJson from '../data/experience.json';
import educationJson from '../data/education.json';
import achievementsJson from '../data/achievements.json';
import homeJson from '../data/home.json';

const str = z.string().default('');
const list = z.array(z.string()).default([]);
function load<T extends z.ZodTypeAny>(name: string, schema: T, data: unknown): z.infer<T> {
  const r = schema.safeParse(data);
  if (!r.success) throw new Error(`src/data/${name} is invalid:\n${r.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n')}`);
  return r.data;
}

export const site = load('site.json', z.object({
  name: z.string().min(1), initials: str, wordmark: str, role: str, school: str, year: str, description: str,
  email: z.string().email(),
  links: z.array(z.object({ label: z.string(), href: z.string().url().or(z.literal('')) })).default([]),
  resume: str, closing: str, cta: str,
}), siteJson);

export const about = load('about.json', z.object({
  portrait: str, // e.g. /uploads/portrait.jpg, uploaded in the CMS
  intro: str,
  callouts: z.array(z.object({ label: z.string(), value: z.string(), x: z.number().min(0).max(100).default(50), y: z.number().min(0).max(100).default(50) })).default([]),
  story: str, // markdown
  approach: str,
  learning: list, interests: list, goals: list, facts: list,
}), aboutJson);

export const skills = load('skills.json', z.object({
  groups: z.array(z.object({ group: z.string(), items: z.array(z.object({ name: z.string(), since: str, note: str })).default([]) })),
}), skillsJson).groups;

export const EXPERIENCE_TYPES = ['Job', 'Internship', 'Research', 'Team', 'Club', 'Leadership', 'Volunteer'] as const;
export const experience = load('experience.json', z.object({
  items: z.array(z.object({
    type: z.enum(EXPERIENCE_TYPES), role: z.string(), org: z.string(), dates: str, summary: str, highlights: list, link: str,
  })),
}), experienceJson).items;

export const education = load('education.json', z.object({
  items: z.array(z.object({ institution: z.string(), program: str, field: str, dates: str, description: str, coursework: list, achievements: list })),
}), educationJson).items;

export const ACHIEVEMENT_TYPES = ['Award', 'Competition', 'Certificate', 'Recognition', 'Publication', 'Other'] as const;
export const achievements = load('achievements.json', z.object({
  items: z.array(z.object({ title: z.string(), type: z.enum(ACHIEVEMENT_TYPES), issuer: str, date: str, description: str, link: str })),
}), achievementsJson).items;

// Home page sections: titles, visibility and order. Unknown ids are ignored and
// missing ones are added back, so the CMS can never break the home page layout.
const HOME_IDS = ['contents', 'featured', 'fields', 'about'] as const;
const homeRaw = load('home.json', z.object({
  lede: str, statement: str,
  sections: z.array(z.object({ id: z.string(), title: z.string(), label: str, visible: z.boolean().default(true) })).default([]),
}), homeJson);
const known = homeRaw.sections.filter((s) => (HOME_IDS as readonly string[]).includes(s.id));
const missing = HOME_IDS.filter((id) => !known.some((s) => s.id === id)).map((id) => ({ id, title: id, label: '', visible: true }));
export const home = { ...homeRaw, sections: [...known, ...missing] };
export const homeSection = (id: (typeof HOME_IDS)[number]) => home.sections.find((s) => s.id === id)!;
