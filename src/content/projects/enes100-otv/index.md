---
title: Autonomous Over Terrain Vehicle
number: MA-001
summary: An eight person ENES100 team built an autonomous vehicle that crosses an obstacle course, reads a signal, detects a magnetic puck and lifts it with a crane. I did all of the 3D printing, cut and drilled the chassis, and worked on propulsion.
date: 2025-09-01  # approximate: Fall 2025 semester
status: Complete
context: Academic
category: Physical Build
disciplines: [Robotics, Autonomy, Mechanical Design, 3D Printing, Manufacturing]
tools: [FDM 3D printing, Laser cutting]
skills: [Design for 3D printing, Fabrication, Mechanical troubleshooting, Teamwork]
featured: true
cover: ./cover.png
coverAlt: The Over Terrain Vehicle assembly, with mecanum wheels, electronics deck, crane mast and arms
model: /models/otv.glb
modelPoster: ./cover.png
modelOrientation: 0deg -90deg 0deg
modelOrbit: 135deg 68deg 95%
credit: ENES100 Introduction to Engineering Design, University of Maryland, Fall 2025. Team Builders, eight members. The CAD models were made by teammate Sierra Stamper.
overview: The Over Terrain Vehicle had to drive itself through an obstacle course, read a duty cycle signal, detect whether a puck was magnetic, and lift the puck with a crane. The CAD came from teammate Sierra Stamper, and my job was turning those models into parts that actually fit and worked.
role: Fabrication and propulsion on an eight person team.
contributions:
  - Printed every 3D printed part on the vehicle
  - Laser cut and drilled the chassis
  - Worked on the propulsion system
challenges:
  - challenge: The rear wheel mounts didn't fit.
    solution: Sanding the first print did not fix it, so I adjusted the design and printed it again. It took **five prints** to get a mount that fit properly.
  - challenge: The vehicle would not drive straight.
    solution: I worked through it one cause at a time. A blocked drive motor was dragging one wheel, so I redesigned the motor mount and the wheel to shaft connection. The drift that was left came from the two motors running at different speeds.
learned:
  - Fixing the obvious problem first made the smaller one visible.

---

## Debugging the drift, step by step

1. **Found a blocked drive motor.** It was dragging one wheel and pulling the vehicle into right angle turns.
2. **Redesigned the motor mount and the wheel to shaft connection** so the motor turned freely.
3. **Traced the remaining drift to unequal motor speeds.** With the mechanical problem gone, the leftover drift came from the two motors not spinning at the same speed.

The full notes are in the notebook: [five prints for one wheel mount](/notebook/2025-10-15-wheel-mount-five-prints/) and [tracing why the vehicle drifted](/notebook/2025-11-10-tracing-vehicle-drift/).

## What I took from it

Check fit in CAD against the real parts before printing, and debug one cause at a time. The drift only made sense once the blocked motor was fixed.
