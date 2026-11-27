---
title: Egg Payload Holder
number: MA-003
summary: A four egg holder for the Terps Rockets FAR-OUT 2026-27 payload, in two iterations that trade material for mass. Same envelope, 55% less material in the lightweight version.
date: 2026-10-24
status: In progress
context: Terps Rockets
category: Engineering design
disciplines: [Aerospace, Mechanical Design, 3D Printing]
tools: [SolidWorks, FDM 3D printing]
featured: true
cover: ./cover.png
models:
  - { src: /models/egg-holder-light.glb, label: 'Rev A, lightweight', image: ./lightweight.png, note: '38.5 cm³ of material', orbit: 35deg 62deg 100% }
  - { src: /models/egg-holder-full.glb, label: 'Rev B, full', image: ./full.png, note: '85.0 cm³ of material', orbit: 35deg 62deg 100% }
coverAlt: The two egg holder iterations side by side, the lightweight open frame on the left and the full solid wall version on the right
charts:
  - title: Material per iteration
    kind: bar
    x: Iteration
    y: Material volume (cm³)
    note: Same 120.6 × 63.5 × 120.7 mm envelope and the same four egg plate. Swapping the solid wall for two rings and struts cuts material by 55%.
    series:
      - name: Material volume
        points:
          - { x: Rev A lightweight, y: 38.5 }
          - { x: Rev B full, y: 85.0 }
specs:
  - { label: Envelope, value: 120.6 × 63.5 × 120.7 mm (both versions) }
  - { label: Capacity, value: 4 eggs }
revisions:
  - rev: A
    date: 2026-11-24  # PLACEHOLDER: the real date you made this version
    note: Lightweight version. Solid outer wall replaced with two rings joined by vertical struts.
  - rev: B
    date: 2026-11-24  # PLACEHOLDER: the real date you made this version
    note: Full version. Solid wall all the way around, to compare sturdiness.
credit: Terps Rockets, liquids subteam, University of Maryland.
---

## The goal

FAR-OUT 2026-27 awards payload points for eggs that are launched and returned unbroken: **10 points per egg, up to 500 points**.

## Rules the design has to meet

- Independent of any critical part of the rocket's structure
- At least 1 kg
- Rigidly secured
- Hits the ground at **25 ft/s or less**
- No animals
- Eggs are marked by competition staff

## Work so far

Modified the existing egg holder CAD and 3D printed a PLA prototype. Print settings were tuned for strength and fit: **3 perimeters, 20% cubic infill**.

## Two iterations

Both versions hold four eggs in the same plate with four circular cutouts, and both fit the same 120.6 × 63.5 × 120.7 mm envelope. The difference is the outer wall.

![Lightweight version: two rings joined by vertical struts](./lightweight.png)

![Full version: a solid cylindrical wall](./full.png)

| | Lightweight (Rev A) | Full (Rev B) |
|---|---|---|
| Outer wall | Two rings joined by vertical struts | Solid cylinder |
| Material volume | 38.5 cm³ | 85.0 cm³ |
| Mass if printed solid in PLA | 47.8 g | 105.4 g |

Volumes are measured from the STL exports. Solid PLA mass uses a density of 1.24 g/cm³ and is an upper bound, since the parts print with partial infill.

The lightweight version uses **55% less material**. The question the two versions answer: is the extra stiffness of a solid wall worth more than doubling the mass?

Both are rotatable in 3D at the top of this page, and in the CAD library: [lightweight](/cad/egg-holder-light/), [full](/cad/egg-holder-full/).

PLACEHOLDER: Which version you picked and why, once you have print weights or drop test results.

## Design thinking

An egg breaks when force is concentrated on a small area of the shell. That makes this the opposite problem from a gripper's serrated teeth (see the [robotic arm](/work/robotic-arm/)): the holder should spread the load over as much of the shell as possible to keep the pressure low.

PLACEHOLDER: How the prototype holds each egg, what you changed from the original CAD, and test results once you have them.
