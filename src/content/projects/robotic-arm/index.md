---
title: Desktop Robotic Arm
number: MA-004
summary: A six axis desktop robotic arm modeled in SolidWorks, about 287 mm tall, built from eight parts I modeled one at a time and then assembled.
date: 2026-11-01
status: In progress
context: Personal
category: Engineering Design
disciplines: [Robotics, Mechanical Design, CAD]
tools: [SolidWorks]
skills: [Part modeling, Linear patterns, Mirror features]
featured: true
cover: ./assembly.png
model: /models/robotic-arm-assembly.glb
modelOrbit: 90deg 80deg 105%
modelPoster: ./assembly.png
models:
  - { src: /models/grip.glb, node: grip, role: "One of the gripper's jaws, the part that touches the object.", volume: 2.9 cm³, label: Gripper Jaw, image: ./cover.png, note: 49.0 × 14.0 × 8.5 mm, orbit: 35deg 65deg 100% }
  - { src: /models/gripper-actuator.glb, node: Gripper Actuator, role: "Drives the gripper jaws.", volume: 16.5 cm³, label: Gripper Actuator, image: ./actuator.png, note: 31.0 × 30.9 × 35.0 mm, orbit: 35deg 65deg 115% }
  - { src: /models/wrist-module.glb, node: Wrist Modul, role: "The wrist joint between the arm and the gripper.", volume: 32.5 cm³, label: Wrist Module, image: ./wrist.png, note: 55.0 × 31.0 × 31.0 mm, orbit: 35deg 65deg 100% }
  - { src: /models/rotary-yoke-joint.glb, node: Rotary Yoke Joint, role: "A rotary joint in the arm.", volume: 15.7 cm³, label: Rotary Yoke Joint, image: ./yoke.png, note: 68.0 × 40.0 × 44.0 mm, orbit: 35deg 65deg 105% }
  - { src: /models/shoulder-drive-unit.glb, node: Shoulder Drive Unit, role: "Drives the shoulder joint.", volume: 38.6 cm³, label: Shoulder Drive Unit, image: ./shoulder.png, note: 32.5 × 30.0 × 75.0 mm, orbit: 35deg 65deg 105% }
  - { src: /models/upper-arm-link.glb, node: Upper Arm Link, role: "The structural link of the upper arm.", volume: 82.0 cm³, label: Upper Arm Link, image: ./upper-arm.png, note: 115.0 × 125.0 × 35.0 mm, orbit: 35deg 65deg 105% }
  - { src: /models/lower-arm-link.glb, node: Lower Arm Link, role: "The structural link of the lower arm.", volume: 198.6 cm³, label: Lower Arm Link, image: ./lower-arm.png, note: 157.5 × 142.5 × 70.0 mm, orbit: 35deg 65deg 105% }
  - { src: /models/base.glb, node: Base, role: "Holds the arm upright and carries the first rotating joint.", volume: 190.7 cm³, label: Base, image: ./base.png, note: 140.0 × 41.0 × 140.0 mm, orbit: 35deg 65deg 105% }
coverAlt: The full six axis robotic arm assembly in SolidWorks, side view
overview: A six axis desktop robotic arm, modeled part by part in SolidWorks by following the CADelics tutorial series, then assembled and documented. Eight parts, nine components (the gripper jaw is used twice), about 287 mm tall and about 578 cm³ of material.
learned:
  - "Serrated teeth don't add friction: friction force is F = μN, and contact area isn't in it. They raise pressure, the same force on a smaller area, so the teeth dig in and lock the object in place. Full worked example in the [notebook](/notebook/2026-11-23-teeth-pressure/)."
role: Modeled all eight parts and put them together into the full assembly in SolidWorks, following the CADelics 6 axis robotic arm series.
contributions:
  - Modeled each part on its own, using part modeling, linear patterns and mirror features
  - Assembled the nine components (the gripper jaw is used twice) into an arm about 287 mm tall
  - Measured each part's envelope and material volume from the STL exports
credit: Based on the 6-Axis Robotic Arm Series tutorial by CADelics on YouTube (youtube.com/playlist?list=PLZ_tR6vSrEUxeC8R52mZiqgnymwje6BQU).
revisions:
  - rev: A
    date: 2026-11-01
    note: Gripper Jaw modeled.
  - rev: B
    date: 2026-11-24
    note: Gripper Actuator modeled.
  - rev: C
    date: 2026-11-25
    note: Wrist Module modeled.
  - rev: D
    date: 2026-11-25
    note: Rotary Yoke Joint modeled.
  - rev: E
    date: 2026-11-26
    note: Shoulder Drive Unit modeled.
  - rev: F
    date: 2026-11-27
    note: Upper Arm Link modeled.
  - rev: G
    date: 2026-11-27
    note: Lower Arm Link modeled.
  - rev: H
    date: 2026-11-27
    note: Base modeled. All eight parts complete.
  - rev: I
    date: 2026-11-27
    note: Full assembly, nine components.
---

## Objective

Learn SolidWorks part modeling and assemblies by building a complete six axis desktop arm, one part at a time. The goal is a full assembly that could be 3D printed and motorized later.

## Starting point

I followed the CADelics 6 axis robotic arm series for the geometry of all eight parts. The modeling is the tutorial's design. My work was building it, assembling it, and documenting it, which meant measuring every part, explaining why features like the captive nut and serrated teeth exist, and building the interactive 3D page.

## Assembly

The base holds the arm and the lower arm link turns on top of it, then the upper arm link pivots at the elbow, and the wrist and gripper sit at the end. If I built it again, I would cut material out of the lower arm link. At 198.6 cm³ it is about a third of the whole arm.

## Parts

All eight parts, in the order they were modeled. Together they use about 578 cm³ of material. Sizes and material volumes are measured from the STL exports. Pick any of them in the 3D assembly above to inspect it or view it on its own.

| # | Part | Envelope (mm) | Material | Status |
|---|---|---|---|---|
| 1 | Gripper Jaw | 49.0 × 14.0 × 8.5 | 2.9 cm³ | Modeled |
| 2 | Gripper Actuator | 31.0 × 30.9 × 35.0 | 16.5 cm³ | Modeled |
| 3 | Wrist Module | 55.0 × 31.0 × 31.0 | 32.5 cm³ | Modeled |
| 4 | Rotary Yoke Joint | 68.0 × 40.0 × 44.0 | 15.7 cm³ | Modeled |
| 5 | Shoulder Drive Unit | 32.5 × 30.0 × 75.0 | 38.6 cm³ | Modeled |
| 6 | Upper Arm Link | 115.0 × 125.0 × 35.0 | 82.0 cm³ | Modeled |
| 7 | Lower Arm Link | 157.5 × 142.5 × 70.0 | 198.6 cm³ | Modeled |
| 8 | Base | 140.0 × 41.0 × 140.0 | 190.7 cm³ | Modeled |

### 1. Gripper Jaw

**Role.** One of the gripper's jaws, the part that touches the object.

**How it works.** The body is one extrusion with shaping cuts mirrored for symmetry, a pivot hole at the base, and two linear patterns: the slots and the teeth.

- **Hex pocket.** A hex nut sits inside and can't rotate, so the bolt can be tightened from the other side with one tool. This is called a captive nut.
- **Three slots.** They cut material and weight, which also means a shorter print and less filament.
- **Serrated teeth.** They put the same grip force onto a much smaller area, so the pressure goes up and the teeth dig in slightly. That locks the object in place instead of relying only on friction, which (F = μN) doesn't depend on contact area.

### 2. Gripper Actuator

**Role.** Drives the gripper jaws.

**How it works.** It holds both jaws at their pivot holes and rotates the gripper into the best position to pick things up.

### 3. Wrist Module

**Role.** The wrist joint between the arm and the gripper.

**How it works.** It connects the gripper actuator to the rest of the arm and tilts the gripper up and down through more than 180 degrees.

### 4. Rotary Yoke Joint

**Role.** A rotary joint in the arm.

**How it works.** A U shaped yoke that holds the wrist between its two arms, so the wrist can pivot on a pin through both sides.

### 5. Shoulder Drive Unit

**Role.** Drives the shoulder joint.

**How it works.** It connects the upper arm link to the rotary yoke joint.

### 6. Upper Arm Link

**Role.** The structural link of the upper arm.

**How it works.** It runs from the elbow to the shoulder drive unit. The scalloped edges cut weight while the thick side walls keep it stiff when it bends.

### 7. Lower Arm Link

**Role.** The structural link of the lower arm.

**How it works.** It sits on the base turret at the bottom and carries the elbow bolt circle at the top. It is the biggest part, at 198.6 cm³, because it carries the weight of everything above it.

### 8. Base

**Role.** Holds the arm upright and carries the first rotating joint.

**How it works.** Four feet spread the load so the arm doesn't tip. The lower arm link's ring sits on top and turns around the center pin.

## Next

- [x] All eight parts modeled
- [x] Full assembly
- [ ] Motion study
