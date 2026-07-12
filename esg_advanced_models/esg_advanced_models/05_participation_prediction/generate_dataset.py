"""
generate_dataset.py -- Employee Participation Prediction
Generates synthetic employee-level records predicting whether an
employee is likely to join the next CSR activity / sustainability
challenge.
"""
import numpy as np
import pandas as pd
import os

RANDOM_SEED = 42
DEPARTMENTS = ["IT", "Manufacturing", "HR", "Finance", "Operations", "Sales", "R&D"]
N_EMPLOYEES = 1200
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "participation_data.csv")


def generate():
    rng = np.random.default_rng(RANDOM_SEED)
    rows = []

    for _ in range(N_EMPLOYEES):
        dept = rng.choice(DEPARTMENTS)
        previous_csr = rng.integers(0, 15)          # # of past CSR activities joined
        attendance_pct = rng.uniform(40, 100)         # overall attendance %
        experience_years = rng.uniform(0, 20)
        previous_challenges = rng.integers(0, 10)     # sustainability challenges joined

        # Underlying probability of joining next activity
        logit = (
            0.25 * previous_csr
            + 0.03 * attendance_pct
            + 0.05 * experience_years
            + 0.35 * previous_challenges
            - 6.0
        )
        prob = 1 / (1 + np.exp(-logit))
        will_join = int(rng.random() < prob)

        rows.append({
            "department": dept,
            "previous_csr": previous_csr,
            "attendance_pct": round(attendance_pct, 2),
            "experience_years": round(experience_years, 2),
            "previous_challenges": previous_challenges,
            "will_join_next_activity": will_join,
        })

    df = pd.DataFrame(rows)
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"Generated {len(df)} rows -> {OUTPUT_PATH}")
    print(df["will_join_next_activity"].value_counts())
    return df


if __name__ == "__main__":
    generate()
