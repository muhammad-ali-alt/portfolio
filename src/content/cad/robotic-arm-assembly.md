---
title: Desktop Robotic Arm Assembly
number: C-012
kind: Assembly
series: Desktop Robotic Arm
summary: The full six axis desktop robotic arm, all eight parts assembled, about 287 mm tall.
date: 2026-11-27
software: SolidWorks
purpose: Final assembly of MA-004.
model: /models/robotic-arm-assembly.glb
modelOrbit: 90deg 80deg 105%
modelPoster: ../../assets/cad/arm-assembly.png
images:
  - src: ../../assets/cad/arm-assembly.png
    alt: The full robotic arm assembly, side view
    label: Assembly
formats: [SLDASM, GLB]
project: robotic-arm
stats:
  parts: 9
  envelope: 140 × 287 × 192 mm
---

Nine components: the base, shoulder drive unit, lower and upper arm links, rotary yoke joint, wrist module, gripper actuator, and two gripper jaws. Modeled following the CADelics 6-Axis Robotic Arm Series tutorial.

The base holds the arm and the lower arm link turns on top of it, then the upper arm link pivots at the elbow, and the wrist and gripper sit at the end. If I built it again, I would cut material out of the lower arm link. At 198.6 cm³ it is about a third of the whole arm.
