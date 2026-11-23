// ─────────────────────────────────────────────────────────────
// ABOUT PAGE CONTENT
// Everything marked PLACEHOLDER is waiting for your real words.
// Add or delete items in any list and the page adjusts itself.
// ─────────────────────────────────────────────────────────────
export const about = {
  // Your portrait goes in src/assets/portrait.jpg (see about.astro).
  intro:
    'I study mechanical engineering at the University of Maryland, and I am working on a minor in business analytics. I like taking an idea from a sketch to a CAD model to something I can hold.',
  // Callouts point at your portrait, like balloons on a drawing.
  // x and y are percentages across and down the photo: where the
  // numbered balloon sits. Move them once your real photo is in.
  callouts: [
    { label: 'Program', value: 'B.S. Mechanical Engineering, UMD', x: 30, y: 22 },
    { label: 'Minor', value: 'Business Analytics (planned)', x: 72, y: 38 },
    { label: 'Main tool', value: 'SolidWorks', x: 24, y: 64 },
    { label: 'Teams', value: 'Terps Racing, Terps Rockets', x: 68, y: 80 },
  ],
  story: [
    'PLACEHOLDER: How you got into engineering. One short paragraph. A specific moment works better than a general statement.',
    'PLACEHOLDER: Why you like designing and building things. What part of the process do you enjoy most?',
  ],
  approach:
    'PLACEHOLDER: How you solve problems. Example shape: "I start by ... then I ... When something fails, I ..."',
  learning: ['SolidWorks assemblies', 'Python and MATLAB (ENME 202)', 'Business statistics', 'Multivariable calculus'],
  interests: ['Motorsport and F1 data', 'Aerospace and space hardware', 'Autonomous vehicles', 'PLACEHOLDER: something outside engineering'],
  goals: [
    'Summer 2027 mechanical engineering internship, ideally in motorsport',
    'Contribute real parts to Terps Racing',
    'PLACEHOLDER: a longer term goal',
  ],
  facts: ['PLACEHOLDER: a small fact about you', 'PLACEHOLDER: another one'],
};
