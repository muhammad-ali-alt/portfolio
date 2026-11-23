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
export const CONTEXTS = ['Personal', 'Academic', 'Terps Racing', 'Terps Rockets', 'Research', 'Internship'] as const;

export const STATUSES = ['Idea', 'Planned', 'In progress', 'Complete', 'Paused'] as const;

const projects = defineCollection({
  loader: glob({ pattern: '**/index.md', base: './src/content/projects', generateId: ({ entry }) => entry.split('/')[0] }),
  schema: ({ image }) =>
    z.object({
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
      cover: image().optional(),
      coverAlt: z.string().optional(),
      model: z.string().optional(), // path to a .glb in /public/models
      modelOrientation: z.string().optional(), // e.g. "-90deg 0deg 0deg" if it exported on its side
      modelOrbit: z.string().optional(), // starting camera, e.g. "35deg 65deg 100%"
      modelPoster: image().optional(),
      credit: z.string().optional(), // tutorials, teammates, sources
      revisions: z
        .array(z.object({ rev: z.string(), date: z.coerce.date(), note: z.string() }))
        .default([]),
      downloads: z.array(z.object({ label: z.string(), file: z.string() })).default([]),
    }),
});

const cad = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/cad' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      number: z.string(),
      kind: z.enum(['Part', 'Assembly', 'Mechanism', 'Concept', 'Surface model', 'Printable part', 'Reverse engineering', 'Experiment']),
      summary: z.string(),
      date: z.coerce.date(),
      software: z.string().default('SolidWorks'),
      purpose: z.string().optional(),
      sample: z.boolean().default(false),
      model: z.string().optional(),
      modelOrientation: z.string().optional(),
      modelOrbit: z.string().optional(),
      images: z.array(z.object({ src: image(), alt: z.string(), label: z.string().optional() })).default([]),
      formats: z.array(z.string()).default([]),
      downloads: z.array(z.object({ label: z.string(), file: z.string() })).default([]),
      project: reference('projects').optional(),
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
    type: z.enum(['Note', 'Experiment', 'Failure', 'Calculation', 'Idea', 'Learned']),
    project: reference('projects').optional(),
    sample: z.boolean().default(false),
    summary: z.string().optional(),
  }),
});

export const collections = { projects, cad, notebook };
