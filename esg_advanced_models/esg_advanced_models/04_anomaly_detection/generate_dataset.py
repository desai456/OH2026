"""
generate_dataset.py -- Carbon Anomaly Detection
Generates synthetic monthly department resource-usage records, with a
small fraction being deliberate anomalies (e.g. a department suddenly
using 10x fuel, 5x electricity).
"""
import numpy as np
import pandas as pd
import os

RANDOM_SEED = 42
DEPARTMENTS = ["IT", "Manufacturing", "HR", "Finance", "Operations", "Sales", "R&D"]
N_NORMAL = 950
N_ANOMALIES = 50
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "usage_data.csv")


def generate():
    rng = np.random.default_rng(RANDOM_SEED)
    rows = []

    # Normal usage patterns
    for _ in range(N_NORMAL):
        dept = rng.choice(DEPARTMENTS)
        fuel = rng.normal(100, 15)
        electricity = rng.normal(500, 60)
        water = rng.normal(200, 25)
        carbon_emission = rng.normal(20, 3)  # tons

        rows.append({
            "department": dept,
            "fuel_usage": round(max(fuel, 0), 2),
            "electricity_usage": round(max(electricity, 0), 2),
            "water_usage": round(max(water, 0), 2),
            "carbon_emission": round(max(carbon_emission, 0), 2),
            "is_anomaly": 0,
        })

    
    for _ in range(N_ANOMALIES):
        dept = rng.choice(DEPARTMENTS)
        fuel = rng.normal(100, 15) * rng.uniform(6, 10)
        electricity = rng.normal(500, 60) * rng.uniform(3, 5)
        water = rng.normal(200, 25) * rng.uniform(1, 2)
        carbon_emission = rng.normal(20, 3) * rng.uniform(4, 8)

        rows.append({
            "department": dept,
            "fuel_usage": round(max(fuel, 0), 2),
            "electricity_usage": round(max(electricity, 0), 2),
            "water_usage": round(max(water, 0), 2),
            "carbon_emission": round(max(carbon_emission, 0), 2),
            "is_anomaly": 1,
        })

    df = pd.DataFrame(rows).sample(frac=1, random_state=RANDOM_SEED).reset_index(drop=True)
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"Generated {len(df)} rows -> {OUTPUT_PATH}")
    print(df["is_anomaly"].value_counts())
    return df


if __name__ == "__main__":
    generate()
