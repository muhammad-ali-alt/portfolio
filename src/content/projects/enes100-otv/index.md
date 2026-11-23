---
title: Autonomous Over Terrain Vehicle
number: MA-001
summary: An eight person ENES100 team built an autonomous vehicle that crosses an obstacle course, reads a signal, detects a magnetic puck and lifts it with a crane. I did all of the 3D printing, cut and drilled the chassis, and worked on propulsion.
date: 2025-09-01  # approximate: Fall 2025 semester
status: Complete
context: Academic
disciplines: [Robotics, Autonomy, Mechanical Design, 3D Printing, Manufacturing]
tools: [FDM 3D printing, Laser cutting]
skills: [Design for 3D printing, Fabrication, Mechanical troubleshooting, Teamwork]
featured: true
cover: ./cover.png
coverAlt: The Over Terrain Vehicle assembly, with mecanum wheels, electronics deck, crane mast and arms
model: /models/otv.glb
modelOrientation: 0deg -90deg 0deg
modelOrbit: 135deg 68deg 95%
credit: ENES100 Introduction to Engineering Design, University of Maryland, Fall 2025. Team Builders, eight members. The CAD models were made by a teammate.
---

## Mission

The Over Terrain Vehicle had to drive itself through an obstacle course, read a duty cycle signal, detect whether a puck was magnetic, and lift the puck with a crane.

## My role

- Printed every 3D printed part on the vehicle
- Laser cut and drilled the chassis
- Worked on the propulsion system

The CAD models were made by a teammate. My work was turning those models into parts that actually fit and worked.

## Problem 1: the rear wheel mounts didn't fit

The first rear wheel mount print did not fit. Sanding it down did not fix it, so I adjusted the design and printed it again. It took **five prints** to get a mount that fit properly.

## Problem 2: the vehicle drifted

During testing the vehicle would not drive straight. I worked through it one cause at a time:

1. **Found a blocked drive motor.** It was dragging one wheel and pulling the vehicle into right angle turns.
2. **Redesigned the motor mount and the wheel to shaft connection** so the motor turned freely.
3. **Traced the remaining drift to unequal motor speeds.** With the mechanical problem gone, the leftover drift came from the two motors not spinning at the same speed.

## What I took from it

PLACEHOLDER: One or two sentences in your own words. What would you do differently on the next team build?

<!-- Photos: add any pictures of the vehicle, the chassis or the printed mounts to this folder,
then reference them like this:  ![Rear wheel mount, print 5](./mount.jpg)
and set `cover: ./your-photo.jpg` at the top. -->
