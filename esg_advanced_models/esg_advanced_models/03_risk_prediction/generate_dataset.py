"""
generate_dataset.py -- ESG Risk Prediction
Generates synthetic department-level records labeled Low/Medium/High risk,
based on carbon, CSR, compliance, audits, training, participation.
"""
import numpy as np
import pandas as pd
import os

RANDOM_SEED = 42
DEPARTMENTS = ["IT", "Manufacturing", "HR", "Finance", "Operations", "Sales", "R&D"]
N_RECORDS = 1500
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "risk_data.csv")


def compute_risk_score(carbon, csr, compliance, audits, training, participation):
    # Higher carbon = worse. Higher csr/compliance/audits/training/participation = better.
    return (
        carbon * 0.35
        - csr * 0.20
        - compliance * 0.20
        - audits * 0.10
        - training * 0.075
        - participation * 0.075
    )


def generate():
    rng = np.random.default_rng(RANDOM_SEED)
    rows = []
    for _ in range(N_RECORDS):
        dept = rng.choice(DEPARTMENTS)
        carbon = rng.uniform(10, 100)
        csr = rng.uniform(0, 100)
        compliance = rng.uniform(0, 100)
        audits = rng.uniform(0, 100)
        training = rng.uniform(0, 100)
        participation = rng.uniform(0, 100)

        risk_score = compute_risk_score(carbon, csr, compliance, audits, training, participation)

        rows.append({
            "department": dept,
            "carbon": round(carbon, 2),
            "csr_activities": round(csr, 2),
            "compliance": round(compliance, 2),
            "audits": round(audits, 2),
            "training": round(training, 2),
            "employee_participation": round(participation, 2),
            "risk_score": round(risk_score, 2),
        })

    df = pd.DataFrame(rows)

    # Convert to balanced Low/Medium/High buckets via tertile thresholds
    # so the demo classifier has meaningful classes to learn from.
    low_cut, high_cut = df["risk_score"].quantile([0.33, 0.66])

    def bucket(score):
        if score <= low_cut:
            return "Low Risk"
        elif score <= high_cut:
            return "Medium Risk"
        else:
            return "High Risk"

    df["risk_level"] = df["risk_score"].apply(bucket)
    df = df.drop(columns=["risk_score"])
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"Generated {len(df)} rows -> {OUTPUT_PATH}")
    print(df["risk_level"].value_counts())
    return df


if __name__ == "__main__":
    generate()
