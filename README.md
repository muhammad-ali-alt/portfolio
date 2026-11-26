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

## Edit content (the CMS)

Open **/admin/** on the site and sign in with GitHub. From there you can add and edit projects, notebook entries, CAD entries, your About page, education, experience, skills, achievements, home page sections, and site settings, and upload images, PDFs and CAD files to a shared media library.

- **Dashboard:** /admin/dashboard/ shows counts, drafts waiting to publish, content that needs attention, recent edits, and backup links.
- **Edit Mode:** once signed in, a small "Edit mode" control appears in the corner of the site. Turn it on and every editable area gets an edit button.
- **Drafts:** saving puts a change in Drafts. Move it to Ready and click Publish. Nothing reaches the site before that. Cloudflare rebuilds in about a minute.
- **Hide or archive:** "Hide from the site" removes an item completely; "Archived" keeps its page but removes it from listings.
- **History:** every save is a commit. Restore an old version from the repository's history on GitHub.
- **Tables and equations:** use the Table and Equation blocks in the editor's "+" menu, or switch the editor to Markdown.

### One time setup (needs your accounts)

The site is hosted on **Cloudflare Pages** (free, 500 builds a month) at `https://aliworks-umd.pages.dev`. The CMS login runs on the site itself (`functions/api/auth.js` and `callback.js`), so it needs no other service.

1. **Create a GitHub OAuth app:** github.com/settings/developers, OAuth Apps, New OAuth App.
   - Homepage URL: `https://aliworks-umd.pages.dev`
   - Authorization callback URL: `https://aliworks-umd.pages.dev/api/callback`
   - Register, copy the Client ID, then Generate a new client secret and copy it.
2. **Add them to Cloudflare:** your Pages project, Settings, Variables and Secrets. Add `GITHUB_CLIENT_ID` (as text) and `GITHUB_CLIENT_SECRET` (as a **secret**), for Production. Then redeploy once.
3. Open `/admin/`, click **Login with GitHub**, and approve.

If the site address ever changes, update `site` in `astro.config.mjs`, `base_url`, `site_url` and `display_url` in `public/admin/config.yml`, and the URLs in the GitHub OAuth app.

Security: only GitHub accounts with write access to the repository can save anything. GitHub checks this on its servers; nothing in the site's code grants access.

### Files

| Path | Holds |
|---|---|
| `public/admin/config.yml` | Every editor field. Add a field here and to `src/content.config.ts`. |
| `public/admin/vendor/` | Decap CMS 3.17.3 (MIT license), self hosted. |
| `src/data/*.json` | About, education, experience, skills, achievements, home page, site settings. Validated in `src/lib/data.ts`. |
| `public/uploads/` | Media uploaded in the CMS. |

## Customize the look (the Studio)

Open **/studio/** on the site (the "Customize" link in the navigation).

- Pick a **theme** (Drafting Paper is the original), then fine tune colors, fonts, spacing, backgrounds, gradients, motion and 3D settings.
- Changes apply instantly and **save in that browser only**. Undo, redo, per setting reset, category reset, saved themes, and export or import of theme files are all built in.
- To make a design what **every visitor** sees: click **Publish for everyone**, download `site-theme.json`, and upload it to `src/data/` on GitHub (the dialog links to the upload page). Cloudflare rebuilds in about a minute.

How it works, if you want to change it in code:

| File | What it does |
|---|---|
| `src/theme/schema.ts` | Every setting, its limits, and the original defaults. `sanitize()` checks anything saved or imported. |
| `src/theme/presets.ts` | Themes, plus typography, motion, density and gradient presets. Add a theme here and it appears in the Studio. |
| `src/theme/compute.ts` | Turns settings into CSS variables. Same code at build time and in the Studio. |
| `src/data/site-theme.json` | The published design. |
| `src/styles/global.css` | The design tokens every page uses. |

## Hidden things

- Press **G** on any page to show the construction grid.
- Hover the home page cover to read the drawing zone under your cursor.
- The line under your name on the home page is a live dimension of the heading, in millimetres.

## Placeholders

Anything marked `PLACEHOLDER` is waiting for your real text. Entries with `sample: true` (the SX numbers) are fictional demos. Delete them once you have real work in those categories.
