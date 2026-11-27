---
title: What serrated teeth actually do
date: 2026-11-23
type: Learning
project: robotic-arm
summary: Teeth do not add friction. They raise pressure.
---

I assumed the serrated teeth on the gripper jaw add friction. Not quite. Friction force is

**F = μN**

and contact area is not in that equation. What the teeth change is **pressure**, the same force on a smaller area:

| | Flat face | 10 teeth | 20 teeth |
|---|---|---|---|
| Grip force | 10 N | 10 N | 20 N |
| Contact area | 160 mm² | 40 mm² | 80 mm² |
| Pressure, F / A | 0.0625 N/mm² | 0.25 N/mm² | 0.25 N/mm² |

(Example dimensions, not measured from the part.)

Higher pressure lets the teeth dig in slightly, which locks the object in place. Fewer teeth bite harder, but each tooth carries more load and can mark the object or break.
