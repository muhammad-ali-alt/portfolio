// ─────────────────────────────────────────────────────────────
// CONTENT RULES
// This file defines what fields every project, CAD entry and
// notebook entry is allowed to have. If you put a typo in a
// project's front matter, the build tells you exactly which file
// and which field is wrong.
// ─────────────────────────────────────────────────────────────
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// The disciplines are the "what kind of engineering" tags.
// Add a new one here and it shows up in every filter automatically.
export const DISCIPLINES = [
  'Mechanical Design',
  'CAD',
  'Robotics',
  'Aerospace',
  'Space',
  'Autonomy',
  'Electronics',
  'Simulation',
  'Manufacturing',
  '3D Printing',
  'Software',
  'Data Analytics',
  'Research',
  'Product Development',
] as const;

// Where the work came from.
export const CONTEXTS = ['Personal', 'Academic', 'Terps Racing', 'Terps Rockets', 'Research', 'Internship', 'Club', 'Competition', 'Other'] as const;

// Notebook categories. The first nine are offered for new entries; the rest keep older entries valid.
export const NOTE_TYPES = ['Design Log', 'Experiment', 'Research', 'Problem Solving', 'Idea', 'Learning', 'Project Update', 'Technical Notes', 'General', 'Note', 'Failure', 'Calculation', 'Learned'] as const;

// Project write up sections (CMS: Projects, Sections). Each one is optional and reorderable.
export const SECTION_KINDS = ['Overview', 'Problem Statement', 'Objectives', 'Design Requirements', 'Research', 'Concept Development', 'Design Process', 'CAD Development', 'Engineering Analysis', 'Calculations', 'Materials and Manufacturing', 'Testing', 'Results', 'Challenges', 'Lessons Learned', 'Future Improvements', 'Custom'] as const;

// What kind of project it is. Shown on the index and used to pick a default viewer.
export const CATEGORIES = ['Engineering design', 'Physical build', 'Software', 'Research', 'Data analysis', 'Other'] as const;

// How the top of a project page presents the work. "auto" picks from what the project has:
// clickable 3D assembly > single 3D model > side by side models > annotated image >
// build stages > software screens > charts > cover image. Anything not picked as the
// main view still appears lower on the page in its own explorer.
export const VIEWERS = ['auto', 'assembly', 'model', 'compare', 'annotated', 'stages', 'software', 'data', 'image'] as const;

export const STATUSES = ['Idea', 'Planned', 'In progress', 'Complete', 'Paused'] as const;

// An image is either a file next to the entry (optimized by Astro) or an
// upload from the CMS media library, stored as a path like /uploads/photo.jpg.
const img = (image: () => any) => z.union([image(), z.string().regex(/^(\/|https?:\/\/)/, 'Use an uploaded image')]);
const fileList = z.array(z.object({ label: z.string(), file: z.string() })).default([]);
// A link to a project, stored as its folder name. The CMS writes "<folder>/index", so that
// suffix is removed. Kept as a plain string on purpose: deleting or hiding a project must
// never break the build, so pages look the project up and skip the link if it is gone.
const projectRef = () => z.string().transform((v) => v.replace(/\/index$/, '')).optional();

const projects = defineCollection({
  loader: glob({ pattern: '**/index.md', base: './src/content/projects', generateId: ({ entry }) => entry.split('/')[0] }),
  schema: ({ image }) =>
    z.object({
      draft: z.boolean().default(false), // true = hidden from the public site entirely
      archived: z.boolean().default(false), // true = page stays, removed from listings
      order: z.number().optional(), // manual position on the home page (lower first)
      endDate: z.coerce.date().optional(),
      materials: z.array(z.string()).default([]),
      collaborators: z.array(z.string()).default([]),
      specs: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
      sections: z
        .array(z.object({ kind: z.enum(SECTION_KINDS).default('Custom'), title: z.string(), body: z.string().default(''), image: z.string().optional(), caption: z.string().optional() }))
        .default([]),
      gallery: z.array(z.object({ src: z.string(), caption: z.string().default(''), kind: z.enum(['Image', 'Render', 'Photo', 'Diagram', 'Video']).default('Image') })).default([]),
      title: z.string(),
      number: z.string(), // drawing number, e.g. "MA-001"
      summary: z.string(), // one or two sentences for cards and lists
      date: z.coerce.date(), // when the project started
      updated: z.coerce.date().optional(),
      status: z.enum(STATUSES),
      context: z.enum(CONTEXTS),
      disciplines: z.array(z.enum(DISCIPLINES)).min(1),
      tools: z.array(z.string()).default([]),
      skills: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
      sample: z.boolean().default(false), // true = fictional demo content, delete later
      cover: img(image).optional(),
      coverAlt: z.string().optional(),
      model: z.string().optional(), // path to a .glb in /public/models
      // Several models shown side by side, each in its own viewer (e.g. design iterations).
      models: z
        .array(z.object({ src: z.string(), label: z.string(), note: z.string().optional(), orbit: z.string().optional(), orientation: z.string().optional(), image: img(image).optional(),
          // for the assembly explorer: the part's node name in the assembly file (without the -1 suffix), what it does, how much material
          node: z.string().optional(), role: z.string().optional(), design: z.string().optional(), volume: z.string().optional(), material: z.string().optional() }))
        .default([]),
      modelOrientation: z.string().optional(), // e.g. "-90deg 0deg 0deg" if it exported on its side
      modelOrbit: z.string().optional(), // starting camera, e.g. "35deg 65deg 100%"
      modelPoster: img(image).optional(),
      credit: z.string().optional(), // tutorials, teammates, sources
      revisions: z
        .array(z.object({ rev: z.string(), date: z.coerce.date(), note: z.string() }))
        .default([]),
      downloads: fileList,

      // ── case study (all optional; each block only shows when filled) ──
      category: z.enum(CATEGORIES).optional(),
      viewer: z.enum(VIEWERS).default('auto'),
      overview: z.string().optional(), // a short paragraph: what it is and why it exists
      role: z.string().optional(), // one sentence: your part in it
      contributions: z.array(z.string()).default([]),
      challenges: z.array(z.object({ challenge: z.string(), solution: z.string().default('') })).default([]),
      learned: z.array(z.string()).default([]),
      links: z.array(z.object({ label: z.string(), url: z.string(), kind: z.enum(['GitHub', 'Docs', 'Demo', 'Video', 'Paper', 'Other']).default('Other') })).default([]),

      // ── explorers for non 3D work ──
      // annotated image: markers on the cover (x, y from 0 to 1) that open a panel
      hotspots: z.array(z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1), label: z.string(), body: z.string().default(''), image: img(image).optional() })).default([]),
      // build stages or a walkthrough, stepped through in order
      stages: z.array(z.object({ title: z.string(), body: z.string().default(''), image: img(image).optional(), caption: z.string().optional() })).default([]),
      // software: screens (tabs) and code snippets
      screens: z.array(z.object({ title: z.string(), image: img(image).optional(), body: z.string().default('') })).default([]),
      snippets: z.array(z.object({ title: z.string(), lang: z.string().default(''), code: z.string() })).default([]),
      demo: z.string().optional(), // a live demo URL
      // data: simple line or bar charts
      charts: z.array(z.object({
        title: z.string(), kind: z.enum(['bar', 'line']).default('bar'), x: z.string().default(''), y: z.string().default(''), note: z.string().optional(),
        series: z.array(z.object({ name: z.string(), points: z.array(z.object({ x: z.union([z.number(), z.string()]).transform((v) => (typeof v === 'string' && v.trim() !== '' && !isNaN(+v) ? +v : v)), y: z.number() })) })).min(1),
      })).default([]),
      // exploded view of a clickable assembly: how far parts travel (0 turns it off)
      explode: z.number().min(0).max(3).default(1),
    }),
});

const cad = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/cad' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      number: z.string(),
      series: z.string().optional(), // groups related parts in the CAD library, e.g. "Desktop Robotic Arm"
      kind: z.enum(['Part', 'Assembly', 'Mechanism', 'Concept', 'Surface model', 'Printable part', 'Reverse engineering', 'Experiment']),
      summary: z.string(),
      date: z.coerce.date(),
      software: z.string().default('SolidWorks'),
      purpose: z.string().optional(),
      sample: z.boolean().default(false),
      draft: z.boolean().default(false),
      model: z.string().optional(),
      modelOrientation: z.string().optional(),
      modelOrbit: z.string().optional(),
      modelPoster: img(image).optional(),
      images: z.array(z.object({ src: img(image), alt: z.string(), label: z.string().optional() })).default([]),
      formats: z.array(z.string()).default([]),
      downloads: z.array(z.object({ label: z.string(), file: z.string() })).default([]),
      project: projectRef(),
      stats: z
        .object({ parts: z.number().optional(), mass: z.string().optional(), envelope: z.string().optional() })
        .optional(),
    }),
});

const notebook = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/notebook' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    type: z.enum(NOTE_TYPES),
    project: projectRef(),
    tags: z.array(z.string()).default([]),
    pinned: z.boolean().default(false),
    draft: z.boolean().default(false),
    sample: z.boolean().default(false),
    summary: z.string().optional(),
    attachments: fileList,
  }),
});

export const collections = { projects, cad, notebook };
