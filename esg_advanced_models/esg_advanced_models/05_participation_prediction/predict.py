"""
predict.py -- Employee Participation Prediction

Returns the probability (0-100%) that an employee will join the next
CSR activity / sustainability challenge.
"""
import os
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "participation_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")
DEPT_ENCODER_PATH = os.path.join(BASE_DIR, "dept_encoder.pkl")

_model = _scaler = _dept_encoder = None


def _load():
    global _model, _scaler, _dept_encoder
    if _model is None:
        _model = joblib.load(MODEL_PATH)
        _scaler = joblib.load(SCALER_PATH)
        _dept_encoder = joblib.load(DEPT_ENCODER_PATH)
    return _model, _scaler, _dept_encoder


def predict_participation(department, previous_csr, attendance_pct,
                           experience_years, previous_challenges):
    model, scaler, dept_encoder = _load()

    dept_enc = (dept_encoder.transform([department])[0]
                if department in dept_encoder.classes_ else 0)

    row = pd.DataFrame([{
        "department_enc": dept_enc,
        "previous_csr": previous_csr,
        "attendance_pct": attendance_pct,
        "experience_years": experience_years,
        "previous_challenges": previous_challenges,
    }])

    row_scaled = scaler.transform(row)
    probability = model.predict_proba(row_scaled)[0][1]

    return {
        "department": department,
        "probability_percent": round(probability * 100, 2),
        "predicted_to_join": bool(probability >= 0.5),
    }


if __name__ == "__main__":
    result = predict_participation(
        department="R&D",
        previous_csr=9,
        attendance_pct=88,
        experience_years=4,
        previous_challenges=6,
    )
    print(result)
