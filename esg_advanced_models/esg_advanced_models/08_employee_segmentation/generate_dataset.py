"""
generate_dataset.py -- Employee Segmentation
Generates synthetic employee engagement records for clustering.
"""
import numpy as np
import pandas as pd
import os

RANDOM_SEED = 42
N_EMPLOYEES = 600
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "segmentation_data.csv")


def generate():
    rng = np.random.default_rng(RANDOM_SEED)
    rows = []

    # Simulate three loose engagement archetypes so clustering has real structure
    archetypes = [
        {"csr": (10, 15), "challenges": (7, 3), "attendance": (85, 10)},  # highly active
        {"csr": (5, 8), "challenges": (3, 2), "attendance": (65, 10)},    # moderately active
        {"csr": (0, 3), "challenges": (0, 1), "attendance": (40, 15)},    # inactive
    ]

    for _ in range(N_EMPLOYEES):
        archetype = archetypes[rng.integers(0, 3)]
        csr = max(0, rng.normal(*archetype["csr"]))
        challenges = max(0, rng.normal(*archetype["challenges"]))
        attendance = np.clip(rng.normal(*archetype["attendance"]), 0, 100)
        badges_earned = max(0, rng.normal(csr * 0.8, 1))

        rows.append({
            "employee_id": f"EMP{len(rows)+1:04d}",
            "csr_activities_joined": round(csr, 1),
            "challenges_completed": round(challenges, 1),
            "attendance_pct": round(attendance, 2),
            "badges_earned": round(badges_earned, 1),
        })

    df = pd.DataFrame(rows)
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"Generated {len(df)} rows -> {OUTPUT_PATH}")
    return df


if __name__ == "__main__":
    generate()
