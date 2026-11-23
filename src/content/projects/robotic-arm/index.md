---
title: Desktop Robotic Arm
number: MA-001
summary: A six axis desktop robotic arm modeled in SolidWorks, built up part by part. The gripper jaw is done, the rest of the arm is next.
date: 2026-11-01  # PLACEHOLDER: the real date you started
status: In progress
context: Personal
disciplines: [Robotics, Mechanical Design, CAD]
tools: [SolidWorks]
skills: [Part modeling, Linear patterns, Mirror features]
featured: true
cover: ./grip-iso.png
coverAlt: Gripper jaw in SolidWorks, isometric view, showing the pivot hole, hex nut pocket, three slots and serrated tip
credit: Based on the 6-Axis Robotic Arm Series tutorial by CADelics on YouTube (youtube.com/playlist?list=PLZ_tR6vSrEUxeC8R52mZiqgnymwje6BQU).
revisions:
  - rev: A
    date: 2026-11-01   # PLACEHOLDER date
    note: Gripper jaw modeled.
---

## Objective

PLACEHOLDER: One or two sentences. What should the arm do when it is finished? How many joints, what reach, what should it pick up?

## Starting point

PLACEHOLDER: I am building this by following a tutorial series, then changing it. Write down here which parts follow the tutorial and which parts are your own decisions. Recruiters respect an honest "I learned this from X, then I changed Y because Z" much more than a copied model with no explanation.

## Gripper jaw

The first finished part is one jaw of the gripper. Its features, in the order they were built:

| Feature | What it is |
|---|---|
| Boss-Extrude1, Fillet1 | Main curved body of the jaw, with rounded edges |
| Cut-Extrude1, Mirror1 | Shaping cuts, mirrored so both sides match |
| Cut-Extrude2 | Pivot hole at the base |
| Cut-Extrude4, LPattern3 | Three slots across the middle, made once and patterned |
| Cut-Extrude5, LPattern4 | Serrated teeth on the gripping face, made once and patterned |
| Hex pocket | Six sided pocket on the top face |

PLACEHOLDER: Explain in your own words what the hex pocket, the slots and the serrated teeth are for. One sentence each.

## Next

- [ ] Base and turntable
- [ ] Shoulder and elbow joints
- [ ] Wrist
- [ ] Full assembly and motion study
