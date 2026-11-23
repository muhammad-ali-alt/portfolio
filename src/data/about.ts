// ─────────────────────────────────────────────────────────────
// ABOUT PAGE CONTENT
// Everything marked PLACEHOLDER is waiting for your real words.
// Add or delete items in any list and the page adjusts itself.
// ─────────────────────────────────────────────────────────────
export const about = {
  // Your portrait goes in src/assets/portrait.jpg (see about.astro).
  intro:
    'I am a second year mechanical engineering track student at the University of Maryland, planning a minor in business analytics. I like taking things apart, figuring out why they work, and building them better.',
  // Callouts point at your portrait, like balloons on a drawing.
  // x and y are percentages across and down the photo: where the
  // numbered balloon sits. Move them once your real photo is in.
  callouts: [
    { label: 'Program', value: 'Mechanical engineering track, UMD, class of 2029', x: 30, y: 22 },
    { label: 'Minor', value: 'Business Analytics (planned)', x: 72, y: 38 },
    { label: 'Teams', value: 'Terps Racing Baja (powertrain), Terps Rockets (liquids)', x: 24, y: 64 },
    { label: 'Shop time', value: 'Four years as an assistant mechanic', x: 68, y: 80 },
  ],
  story: [
    'I got into engineering by taking toys apart and putting them back together to see if they still worked. My dad was a mechanical engineer, and that is one of the reasons I chose it too.',
    'I grew up in Abu Dhabi and Pakistan and moved to the United States in 2018. Before college I spent four years as an assistant mechanic at an auto repair shop, doing oil changes, brake and rotor jobs and tire rotations on about 20 vehicles a week.',
  ],
  approach:
    'When something does not work, I change one thing at a time and test again. On my ENES100 team that meant reprinting a wheel mount five times until it fit, then tracking a drifting vehicle down to a blocked motor and then to uneven motor speeds.',
  learning: ['SolidWorks, part by part', 'MATLAB and Python (ENME202)', 'Electricity and magnetism (PHYS260)', 'Business statistics (BMGT230)'],
  interests: ['Formula 1 and motorsport', 'Photography and photo editing', 'Building and fixing things', 'Video games and anime'],
  goals: [
    'Get into the mechanical engineering major',
    'A summer 2027 mechanical engineering internship',
    'Someday: my own race car and a home workshop',
  ],
  // Jobs and roles, newest first. Shown as a table on the About page.
  experience: [
    { when: 'Jun 2024 to now', org: "Dunkin', Crofton MD", role: 'Shift manager', note: 'Lead a crew of 10 to 11, assign stations and breaks, train new hires.' },
    { when: 'Jun 2022 to Jun 2026', org: 'Sunoco Gas Station and Auto Repair, Gaithersburg MD', role: 'Assistant mechanic and bookkeeper', note: 'Routine maintenance on about 20 vehicles a week; daily sales and fuel reconciliation.' },
    { when: 'Oct 2024 to Jan 2025', org: 'The Reddix Group (remote)', role: 'AI and analytics intern', note: 'Reviewed technical decks and a white paper on the US quantum workforce for the CEO.' },
    { when: 'Aug to Sep 2024', org: 'Keystone Research Solutions (remote)', role: 'Research assistant intern', note: 'Classified 240 data subjects across 5 Zooniverse research projects.' },
  ],
  involvement: [
    'Terps Racing Baja SAE, powertrain subteam (since Oct 2026)',
    'Terps Rockets, liquids subteam and air brakes (since Oct 2026)',
    'UMD University Senate, Academic Procedures and Standards Committee',
    'Pakistani Student Association, historian (photo and video)',
  ],
  facts: [
    'I speak English and Urdu fluently, and Hindi and Punjabi conversationally.',
    'I have lived in three countries.',
    'I made my own Lightroom color preset for my photos.',
  ],
};
