"""
generate_dataset.py
--------------------
Generates a synthetic historical dataset for ESG score prediction.

Why this exists:
A Random Forest model needs *historical* monthly records (this month's
inputs -> next month's actual ESG score) to learn from. If your app
doesn't yet have months of real history logged, use this script to
create a realistic synthetic dataset so you can build and test the
pipeline right away. Once your real data accumulates, swap this file
out and point train_model.py at data/esg_history.csv generated from
your actual database instead.

Output: data/esg_history.csv
Columns:
    carbon                  -> Carbon emissions score/index (0-100, lower is better)
    csr_activities          -> CSR activity score (0-100)
    training                -> Employee training score (0-100)
    compliance              -> Compliance score (0-100)
    audits                  -> Audit score (0-100)
    employee_participation  -> Employee participation score (0-100)
    current_esg_score       -> ESG score for the current month (0-100)
    next_month_esg_score    -> ESG score for the following month (0-100) [TARGET]
"""

import numpy as np
import pandas as pd
import os

RANDOM_SEED = 42
N_COMPANIES = 40      # number of simulated companies/records per month
N_MONTHS = 24          # months of history per company
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "esg_history.csv")


def compute_esg_score(carbon, csr, training, compliance, audits, participation):
    """
    Simple weighted formula standing in for however your project already
    calculates the *current* ESG score. Replace this with your actual
    ESG scoring formula/function so the synthetic data reflects reality.
    """
    # Note: lower carbon emissions is better, so it's inverted (100 - carbon)
    score = (
        (100 - carbon) * 0.30 +
        csr * 0.20 +
        training * 0.15 +
        compliance * 0.15 +
        audits * 0.10 +
        participation * 0.10
    )
    return np.clip(score, 0, 100)


def generate_dataset():
    rng = np.random.default_rng(RANDOM_SEED)
    rows = []

    for company_id in range(N_COMPANIES):
        # Each company starts with its own baseline levels
        carbon = rng.uniform(30, 70)
        csr = rng.uniform(40, 80)
        training = rng.uniform(40, 80)
        compliance = rng.uniform(50, 90)
        audits = rng.uniform(50, 90)
        participation = rng.uniform(40, 80)

        monthly_scores = []

        for month in range(N_MONTHS + 1):
            # Small random monthly drift (improvement or decline) in each metric
            carbon = np.clip(carbon + rng.normal(-0.5, 3), 0, 100)
            csr = np.clip(csr + rng.normal(0.3, 3), 0, 100)
            training = np.clip(training + rng.normal(0.3, 3), 0, 100)
            compliance = np.clip(compliance + rng.normal(0.2, 2), 0, 100)
            audits = np.clip(audits + rng.normal(0.2, 2), 0, 100)
            participation = np.clip(participation + rng.normal(0.3, 3), 0, 100)

            esg_score = compute_esg_score(
                carbon, csr, training, compliance, audits, participation
            )

            monthly_scores.append({
                "company_id": company_id,
                "month": month,
                "carbon": round(carbon, 2),
                "csr_activities": round(csr, 2),
                "training": round(training, 2),
                "compliance": round(compliance, 2),
                "audits": round(audits, 2),
                "employee_participation": round(participation, 2),
                "current_esg_score": round(esg_score, 2),
            })

        # Pair each month's inputs with *next* month's actual score (the label)
        for i in range(len(monthly_scores) - 1):
            record = monthly_scores[i].copy()
            record["next_month_esg_score"] = monthly_scores[i + 1]["current_esg_score"]
            rows.append(record)

    df = pd.DataFrame(rows)
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"Generated {len(df)} rows -> {OUTPUT_PATH}")
    return df


if __name__ == "__main__":
    generate_dataset()
