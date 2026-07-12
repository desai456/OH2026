"""
predict.py -- Employee Segmentation

Assigns a new/existing employee to an engagement segment
(Group A: Highly Active / Group B: Moderately Active / Group C: Inactive).
"""
import os
import json
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "kmeans_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")
LABELS_PATH = os.path.join(BASE_DIR, "cluster_labels.json")

_model = _scaler = _labels = None


def _load():
    global _model, _scaler, _labels
    if _model is None:
        _model = joblib.load(MODEL_PATH)
        _scaler = joblib.load(SCALER_PATH)
        with open(LABELS_PATH) as f:
            _labels = {int(k): v for k, v in json.load(f).items()}
    return _model, _scaler, _labels


def segment_employee(csr_activities_joined, challenges_completed,
                      attendance_pct, badges_earned):
    model, scaler, labels = _load()

    row = pd.DataFrame([{
        "csr_activities_joined": csr_activities_joined,
        "challenges_completed": challenges_completed,
        "attendance_pct": attendance_pct,
        "badges_earned": badges_earned,
    }])

    row_scaled = scaler.transform(row)
    cluster_id = int(model.predict(row_scaled)[0])

    return {
        "segment": labels[cluster_id],
        "cluster_id": cluster_id,
    }


if __name__ == "__main__":
    result = segment_employee(
        csr_activities_joined=12,
        challenges_completed=6,
        attendance_pct=90,
        badges_earned=9,
    )
    print(result)
