---
title: "Sample: Lap Telemetry Comparison"
number: SX-01
summary: SAMPLE ENTRY, not real work. Shows how a data analytics project would look on the site. Delete this folder when you have your own.
date: 2026-10-10
status: Complete
context: Personal
disciplines: [Data Analytics, Software]
tools: [Python]
sample: true
---

## This is a sample

This project is fictional. It exists so you can see how a software and data project looks next to CAD work. Delete the `sample-f1-telemetry` folder when you no longer need it.

## How a calculation looks

Average speed over a lap is distance divided by time:

| Quantity | Value |
|---|---|
| Lap distance | 5.412 km |
| Lap time | 92.4 s |
| Average speed | 5412 m / 92.4 s = 58.6 m/s (210.9 km/h) |

## How code looks

```python
import pandas as pd

laps = pd.read_csv("laps.csv")
laps["avg_speed_kmh"] = laps["distance_m"] / laps["time_s"] * 3.6
print(laps.sort_values("avg_speed_kmh", ascending=False).head())
```
