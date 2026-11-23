---
title: "Sample: Bracket Stress Study"
number: SX-02
summary: SAMPLE ENTRY, not real work. Shows how a simulation project with iterations would look. Delete this folder when you have your own.
date: 2026-09-15
status: Complete
context: Academic
disciplines: [Simulation, Mechanical Design]
tools: [SolidWorks, SolidWorks Simulation]
sample: true
revisions:
  - rev: A
    date: 2026-09-15
    note: First design, solid bracket.
  - rev: B
    date: 2026-09-22
    note: Added a fillet at the corner where stress peaked.
  - rev: C
    date: 2026-09-29
    note: Pocketed the web to cut mass, checked stress again.
---

## This is a sample

Fictional content that shows the revision timeline above and a hand check next to a simulation.

## Hand check

A cantilever bracket, length L = 80 mm, load F = 200 N at the tip, rectangular section b = 10 mm by h = 6 mm.

1. Bending moment at the root: M = F × L = 200 N × 0.080 m = 16 N·m
2. Section modulus: S = b h² / 6 = (0.010 × 0.006²) / 6 = 6.0 × 10⁻⁸ m³
3. Bending stress: σ = M / S = 16 / 6.0 × 10⁻⁸ = 267 MPa

That is high for 6061 aluminum (yield about 276 MPa), so the safety factor is barely above 1. That is why Rev B and Rev C exist.
