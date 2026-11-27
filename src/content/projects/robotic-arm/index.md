---
title: Desktop Robotic Arm
number: MA-004
summary: A six axis desktop robotic arm modeled in SolidWorks, about 287 mm tall, built from eight parts I modeled one at a time and then assembled.
date: 2026-11-01  # PLACEHOLDER: the real date you started
status: In progress
context: Personal
category: Engineering design
disciplines: [Robotics, Mechanical Design, CAD]
tools: [SolidWorks]
skills: [Part modeling, Linear patterns, Mirror features]
featured: true
cover: ./assembly.png
model: /models/robotic-arm-assembly.glb
modelOrbit: 90deg 80deg 105%
modelPoster: ./assembly.png
models:
  - { src: /models/grip.glb, node: grip, role: "One of the gripper's jaws, the part that touches the object.", volume: 2.9 cm³, label: Gripper jaw, image: ./cover.png, note: 49.0 × 14.0 × 8.5 mm, orbit: 35deg 65deg 100% }
  - { src: /models/gripper-actuator.glb, node: Gripper Actuator, role: "Drives the gripper jaws.", volume: 16.5 cm³, label: Gripper actuator, image: ./actuator.png, note: 31.0 × 30.9 × 35.0 mm, orbit: 35deg 65deg 115% }
  - { src: /models/wrist-module.glb, node: Wrist Modul, role: "The wrist joint between the arm and the gripper.", volume: 32.5 cm³, label: Wrist module, image: ./wrist.png, note: 55.0 × 31.0 × 31.0 mm, orbit: 35deg 65deg 100% }
  - { src: /models/rotary-yoke-joint.glb, node: Rotary Yoke Joint, role: "A rotary joint in the arm.", volume: 15.7 cm³, label: Rotary yoke joint, image: ./yoke.png, note: 68.0 × 40.0 × 44.0 mm, orbit: 35deg 65deg 105% }
  - { src: /models/shoulder-drive-unit.glb, node: Shoulder Drive Unit, role: "Drives the shoulder joint.", volume: 38.6 cm³, label: Shoulder drive unit, image: ./shoulder.png, note: 32.5 × 30.0 × 75.0 mm, orbit: 35deg 65deg 105% }
  - { src: /models/upper-arm-link.glb, node: Upper Arm Link, role: "The structural link of the upper arm.", volume: 82.0 cm³, label: Upper arm link, image: ./upper-arm.png, note: 115.0 × 125.0 × 35.0 mm, orbit: 35deg 65deg 105% }
  - { src: /models/lower-arm-link.glb, node: Lower Arm Link, role: "The structural link of the lower arm.", volume: 198.6 cm³, label: Lower arm link, image: ./lower-arm.png, note: 157.5 × 142.5 × 70.0 mm, orbit: 35deg 65deg 105% }
  - { src: /models/base.glb, node: Base, role: "Holds the arm upright and carries the first rotating joint.", volume: 190.7 cm³, label: Base, image: ./base.png, note: 140.0 × 41.0 × 140.0 mm, orbit: 35deg 65deg 105% }
coverAlt: The full six axis robotic arm assembly in SolidWorks, side view
role: Modeled all eight parts and put them together into the full assembly in SolidWorks, following the CADelics 6 axis robotic arm series.
contributions:
  - Modeled each part on its own, using part modeling, linear patterns and mirror features
  - Assembled the nine components (the gripper jaw is used twice) into an arm about 287 mm tall
  - Measured each part's envelope and material volume from the STL exports
credit: Based on the 6-Axis Robotic Arm Series tutorial by CADelics on YouTube (youtube.com/playlist?list=PLZ_tR6vSrEUxeC8R52mZiqgnymwje6BQU).
revisions:
  - rev: A
    date: 2026-11-01   # PLACEHOLDER date
    note: Gripper jaw modeled.
  - rev: B
    date: 2026-11-24   # PLACEHOLDER date
    note: Gripper actuator modeled.
  - rev: C
    date: 2026-11-25   # PLACEHOLDER date
    note: Wrist module modeled.
  - rev: D
    date: 2026-11-25   # PLACEHOLDER date
    note: Rotary yoke joint modeled.
  - rev: E
    date: 2026-11-26   # PLACEHOLDER date
    note: Shoulder drive unit modeled.
  - rev: F
    date: 2026-11-27   # PLACEHOLDER date
    note: Upper arm link modeled.
  - rev: G
    date: 2026-11-27   # PLACEHOLDER date
    note: Lower arm link modeled.
  - rev: H
    date: 2026-11-27   # PLACEHOLDER date
    note: Base modeled. All eight parts complete.
  - rev: I
    date: 2026-11-27   # PLACEHOLDER date
    note: Full assembly, nine components.
---

## Objective

PLACEHOLDER: One or two sentences. What should the arm do when it is finished? How many joints, what reach, what should it pick up?

## Starting point

PLACEHOLDER: I am building this by following a tutorial series, then changing it. Write down here which parts follow the tutorial and which parts are your own decisions. Recruiters respect an honest "I learned this from X, then I changed Y because Z" much more than a copied model with no explanation.

## Assembly

The full arm is about 287 mm tall and made of nine components: the eight parts below, with the gripper jaw used twice. Rotate it at the top of this page.

PLACEHOLDER: How the joints move together, and one thing you would change if you built it again.

## Parts

All eight parts, in the order they were modeled. Together they use about 578 cm³ of material. Sizes and material volumes are measured from the STL exports. Rotate any of them in 3D in the carousel above.

| # | Part | Envelope (mm) | Material | Status |
|---|---|---|---|---|
| 1 | Gripper jaw | 49.0 × 14.0 × 8.5 | 2.9 cm³ | Modeled |
| 2 | Gripper actuator | 31.0 × 30.9 × 35.0 | 16.5 cm³ | Modeled |
| 3 | Wrist module | 55.0 × 31.0 × 31.0 | 32.5 cm³ | Modeled |
| 4 | Rotary yoke joint | 68.0 × 40.0 × 44.0 | 15.7 cm³ | Modeled |
| 5 | Shoulder drive unit | 32.5 × 30.0 × 75.0 | 38.6 cm³ | Modeled |
| 6 | Upper arm link | 115.0 × 125.0 × 35.0 | 82.0 cm³ | Modeled |
| 7 | Lower arm link | 157.5 × 142.5 × 70.0 | 198.6 cm³ | Modeled |
| 8 | Base | 140.0 × 41.0 × 140.0 | 190.7 cm³ | Modeled |

### 1. Gripper jaw

**Role.** One of the gripper's jaws, the part that touches the object.

**How it works.** The body is one extrusion with shaping cuts mirrored for symmetry, a pivot hole at the base, and two linear patterns: the slots and the teeth.

- **Hex pocket.** A hex nut sits inside and can't rotate, so the bolt can be tightened from the other side with one tool. This is called a captive nut.
- **Three slots.** They cut material and weight, which also means a shorter print and less filament. PLACEHOLDER: confirm against the tutorial whether they have another purpose.
- **Serrated teeth.** They put the same grip force onto a much smaller area, so the pressure goes up and the teeth dig in slightly. That locks the object in place instead of relying only on friction, which (F = μN) doesn't depend on contact area.

### 2. Gripper actuator

**Role.** Drives the gripper jaws.

**How it works.** PLACEHOLDER: How the actuator moves the jaws, and how it connects to the jaw's pivot hole.

### 3. Wrist module

**Role.** The wrist joint between the arm and the gripper.

**How it works.** PLACEHOLDER: What motion the wrist gives the arm, and how it connects to the gripper actuator.

### 4. Rotary yoke joint

**Role.** A rotary joint in the arm.

**How it works.** PLACEHOLDER: Which axis this joint rotates about, and which parts it connects.

### 5. Shoulder drive unit

**Role.** Drives the shoulder joint.

**How it works.** PLACEHOLDER: What drives the shoulder, and which parts it connects.

### 6. Upper arm link

**Role.** The structural link of the upper arm.

**How it works.** PLACEHOLDER: Which joints the link connects, and how it carries the load.

### 7. Lower arm link

**Role.** The structural link of the lower arm.

**How it works.** PLACEHOLDER: Which joints the link connects, and how it carries the load.

### 8. Base

**Role.** Holds the arm upright and carries the first rotating joint.

**How it works.** PLACEHOLDER: How the base rotates, and how the lower arm link mounts to it.

## Next

- [x] All eight parts modeled
- [x] Full assembly
- [ ] Motion study
