---
title: Desktop Robotic Arm
number: MA-004
summary: A six axis desktop robotic arm modeled in SolidWorks, built up part by part. The gripper jaw, gripper actuator, wrist module and rotary yoke joint are done; the rest of the arm is next.
date: 2026-11-01  # PLACEHOLDER: the real date you started
status: In progress
context: Personal
disciplines: [Robotics, Mechanical Design, CAD]
tools: [SolidWorks]
skills: [Part modeling, Linear patterns, Mirror features]
featured: true
cover: ./cover.png
models:
  - { src: /models/grip.glb, label: Gripper jaw, image: ./cover.png, note: 49.0 × 14.0 × 8.5 mm, orbit: 35deg 65deg 100% }
  - { src: /models/gripper-actuator.glb, label: Gripper actuator, image: ./actuator.png, note: 31.0 × 30.9 × 35.0 mm, orbit: 35deg 65deg 115% }
  - { src: /models/wrist-module.glb, label: Wrist module, image: ./wrist.png, note: 55.0 × 31.0 × 31.0 mm, orbit: 35deg 65deg 100% }
  - { src: /models/rotary-yoke-joint.glb, label: Rotary yoke joint, image: ./yoke.png, note: 68.0 × 40.0 × 44.0 mm, orbit: 35deg 65deg 105% }
coverAlt: Gripper jaw, isometric render, showing the pivot hole, hex nut pocket, three slots and serrated tip
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
---

## Objective

PLACEHOLDER: One or two sentences. What should the arm do when it is finished? How many joints, what reach, what should it pick up?

## Starting point

PLACEHOLDER: I am building this by following a tutorial series, then changing it. Write down here which parts follow the tutorial and which parts are your own decisions. Recruiters respect an honest "I learned this from X, then I changed Y because Z" much more than a copied model with no explanation.

## Gripper jaw

The first finished part is one jaw of the gripper.

![The gripper jaw in SolidWorks, isometric view](./grip-iso.png)

Its features, in the order they were built:

| Feature | What it is |
|---|---|
| Boss-Extrude1, Fillet1 | Main curved body of the jaw, with rounded edges |
| Cut-Extrude1, Mirror1 | Shaping cuts, mirrored so both sides match |
| Cut-Extrude2 | Pivot hole at the base |
| Cut-Extrude4, LPattern3 | Three slots across the middle, made once and patterned |
| Cut-Extrude5, LPattern4 | Serrated teeth on the gripping face, made once and patterned |
| Hex pocket | Six sided pocket on the top face |

### Why the features are there

**Hex pocket.** A hex nut sits inside the pocket and can't rotate, so the bolt can be tightened or loosened from the other side with one tool. This is called a captive nut.

**Three slots.** They cut material and weight, which also means a shorter print and less filament. PLACEHOLDER: confirm against the tutorial whether they have another purpose.

**Serrated teeth.** The teeth put the same grip force onto a much smaller area, so the pressure on the object goes up and the teeth dig in slightly. That locks the object in place instead of relying only on friction, which (F = μN) doesn't depend on contact area.

## Gripper actuator

The second finished part drives the gripper. It fits in a 31.0 × 30.9 × 35.0 mm envelope and uses 16.5 cm³ of material, measured from the STL export.

![The gripper actuator, isometric render](./actuator.png)

PLACEHOLDER: How the actuator moves the jaws, and how it connects to the jaw's pivot hole.

## Wrist module

The third part is the wrist. It fits in a 55.0 × 31.0 × 31.0 mm envelope and uses 32.5 cm³ of material, measured from the STL export.

![The wrist module, isometric render](./wrist.png)

PLACEHOLDER: What motion the wrist gives the arm, and how it connects to the gripper actuator.

## Rotary yoke joint

The fourth part is a rotary yoke joint. It fits in a 68.0 × 40.0 × 44.0 mm envelope and uses 15.7 cm³ of material, measured from the STL export.

![The rotary yoke joint, isometric render](./yoke.png)

PLACEHOLDER: Which axis this joint rotates about, and which parts it connects.

## Next

- [x] Gripper jaw
- [x] Gripper actuator
- [ ] Base and turntable
- [ ] Shoulder and elbow joints
- [x] Wrist
- [x] Rotary yoke joint
- [ ] Full assembly and motion study
