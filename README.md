# Ali Works

Personal engineering logbook of Muhammad Ali, mechanical engineering, University of Maryland.
Built with [Astro](https://astro.build). Content is plain Markdown files; no database, no CMS.

## Run it on your computer

1. Install [Node.js](https://nodejs.org) (the LTS version).
2. In a terminal, inside this folder:

```bash
npm install
```

```bash
npm run dev
```

3. Open http://localhost:4321. The page reloads every time you save a file.

## Where things live

```
src/
  content/
    projects/<name>/index.md   ← one folder per project (+ its images)
    cad/<name>.md              ← one file per CAD library entry
    notebook/<date-name>.md    ← one file per notebook entry
  data/
    site.ts                    ← your name, email, links, resume
    about.ts                   ← About page text and callouts
    toolbox.ts                 ← tools and skills list
  assets/portrait.jpg          ← your photo (About page)
public/
  models/                      ← .glb files for the 3D viewer
  files/                       ← downloads (STEP, PDF drawings)
```

Pages in `src/pages/` read those folders automatically. **You should almost never need to edit a page to add content.**

## Add a project (about 10 minutes)

1. Copy an existing folder in `src/content/projects/`, rename it, e.g. `suspension-upright`.
2. Edit the block at the top of `index.md` (the "front matter"):

```yaml
---
title: Suspension Upright
number: MA-004            # next number in order
summary: One or two sentences.
date: 2027-01-20
status: In progress       # Idea, Planned, In progress, Complete, Paused
context: Terps Racing     # Personal, Academic, Terps Racing, Terps Rockets, Research, Internship
disciplines: [Mechanical Design, Simulation]
tools: [SolidWorks, SolidWorks Simulation]
featured: true            # show on the home page
cover: ./cover.jpg        # image in the same folder
coverAlt: Upright, isometric render
model: /models/upright.glb   # optional 3D viewer
revisions:
  - rev: A
    date: 2027-01-20
    note: First design.
---
```

3. Write the write up below the second `---` using `## Headings`. Every `##` heading shows up in the page's Sections list.
4. Images: put them in the folder and write `![What it shows](./image.png)`. Clicking an image enlarges it.

If you mistype a field (say `status: Done`), the build stops and tells you which file and which field.

Allowed disciplines and contexts are listed in `src/content.config.ts`. Add a new one there and it appears in the filters.

## Getting CAD out of SolidWorks

| Purpose | Format | How |
|---|---|---|
| Renders and screenshots | PNG or JPG, about 2000 px wide | PhotoView 360 or Visualize render, or a clean screenshot on a white background |
| Interactive 3D on the site | **GLB** | See below |
| Downloadable CAD | **STEP** (.step) | File, Save As, STEP AP214 |
| Drawings | **PDF** | From the drawing file: File, Save As, PDF |
| 3D printing download | STL | File, Save As, STL |

**GLB export.** Save As STL from SolidWorks, then run the converter in this repo:

```bash
python tools/stl2glb.py "C:/path/to/part.STL" public/models/part.glb
```

It converts millimetres to metres, smooths curved surfaces, keeps sharp edges sharp, and prints the part's size so you can sanity check it. Needs numpy (`pip install numpy`). The gripper jaw came out at 69 KB. Keep any model under about 10 MB.

Put the file in `public/models/` and point the project's `model:` field at `/models/your-file.glb`.

Not every project needs 3D. Use the viewer for things people want to turn around (mechanisms, assemblies). Use renders for everything else.

## Hidden things

- Press **G** on any page to show the construction grid.
- Hover the home page cover to read the drawing zone under your cursor.
- The line under your name on the home page is a live dimension of the heading, in millimetres.

## Placeholders

Anything marked `PLACEHOLDER` is waiting for your real text. Entries with `sample: true` (the SX numbers) are fictional demos. Delete them once you have real work in those categories.
