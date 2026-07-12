"""
Generates a synthetic history of monthly carbon emissions per department.

WHY THIS FILE EXISTS
---------------------
A real ML model needs real history to learn from. EcoSphere's dashboard mock
only has 12 months of numbers, which isn't enough to train or test a model
properly. This script fakes 3 years of monthly emissions per department so
you have something realistic to practice on today.

WHEN YOU HAVE REAL DATA
-------------------------
Once EcoSphere has been logging Carbon Transactions for a while, replace this
script's output with a real export: group your Carbon Transaction records by
month + department and sum the CO2e column. Same shape of file, real numbers.
"""

import numpy as np
import pandas as pd

np.random.seed(42)

departments = ["Manufacturing", "Sales", "Logistics", "Corporate", "R&D"]
base_level = {"Manufacturing": 220, "Sales": 60, "Logistics": 140, "Corporate": 45, "R&D": 80}

start = pd.Period("2023-08", freq="M")
months = pd.period_range(start=start, periods=36, freq="M")

rows = []
for dept in departments:
    base = base_level[dept]
    for i, m in enumerate(months):
        # gentle downward trend = sustainability initiatives slowly working
        trend = -0.35 * i
        # yearly seasonality: emissions a bit higher in winter months (heating, logistics)
        seasonal = 12 * np.sin((m.month / 12) * 2 * np.pi + 1)
        noise = np.random.normal(0, 6)
        value = max(5, base + trend + seasonal + noise)
        rows.append({"month": m.to_timestamp(), "department": dept, "co2e_tonnes": round(value, 2)})

df = pd.DataFrame(rows)
df.to_csv("/home/claude/emissions-forecast/data/emissions_history.csv", index=False)
print(df.head(10))
print(f"\nSaved {len(df)} rows to data/emissions_history.csv")
