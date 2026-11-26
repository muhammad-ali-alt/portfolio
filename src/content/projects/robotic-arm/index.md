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

## Parts

Every finished part so far, in the order it was modeled. Sizes and material volumes are measured from the STL exports. Rotate any of them in 3D in the carousel above.

| # | Part | Envelope (mm) | Material | Status |
|---|---|---|---|---|
| 1 | Gripper jaw | 49.0 × 14.0 × 8.5 | 2.9 cm³ | Modeled |
| 2 | Gripper actuator | 31.0 × 30.9 × 35.0 | 16.5 cm³ | Modeled |
| 3 | Wrist module | 55.0 × 31.0 × 31.0 | 32.5 cm³ | Modeled |
| 4 | Rotary yoke joint | 68.0 × 40.0 × 44.0 | 15.7 cm³ | Modeled |

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

## Next

- [x] Gripper jaw
- [x] Gripper actuator
- [x] Wrist module
- [x] Rotary yoke joint
- [ ] Shoulder and elbow joints
- [ ] Base and turntable
- [ ] Full assembly and motion study
