"""
predict.py -- ESG Risk Prediction

Predicts risk level for a department and generates a plain-English
"reason" (e.g. "High Carbon, Low CSR, Compliance Issue") by comparing
the input values against simple thresholds -- the kind of explanation
managers actually want, rather than raw feature-importance numbers.
"""
import os
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "risk_rf_model.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "label_encoder.pkl")
DEPT_ENCODER_PATH = os.path.join(BASE_DIR, "dept_encoder.pkl")

_model = _label_encoder = _dept_encoder = None


def _load():
    global _model, _label_encoder, _dept_encoder
    if _model is None:
        _model = joblib.load(MODEL_PATH)
        _label_encoder = joblib.load(ENCODER_PATH)
        _dept_encoder = joblib.load(DEPT_ENCODER_PATH)
    return _model, _label_encoder, _dept_encoder


def _build_reasons(carbon, csr, compliance, audits, training, participation):
    reasons = []
    if carbon >= 60:
        reasons.append("High Carbon")
    if csr <= 40:
        reasons.append("Low CSR")
    if compliance <= 50:
        reasons.append("Compliance Issue")
    if audits <= 50:
        reasons.append("Insufficient Audits")
    if training <= 40:
        reasons.append("Low Training")
    if participation <= 40:
        reasons.append("Low Employee Participation")
    return reasons or ["All metrics within acceptable range"]


def predict_risk(department, carbon, csr_activities, compliance, audits,
                  training, employee_participation):
    model, label_encoder, dept_encoder = _load()

    # Handle unseen department names gracefully
    if department in dept_encoder.classes_:
        dept_enc = dept_encoder.transform([department])[0]
    else:
        dept_enc = 0  # fallback bucket

    row = pd.DataFrame([{
        "department_enc": dept_enc,
        "carbon": carbon,
        "csr_activities": csr_activities,
        "compliance": compliance,
        "audits": audits,
        "training": training,
        "employee_participation": employee_participation,
    }])

    pred_idx = model.predict(row)[0]
    risk_level = label_encoder.inverse_transform([pred_idx])[0]
    probabilities = dict(zip(label_encoder.classes_, model.predict_proba(row)[0].round(3)))

    reasons = _build_reasons(carbon, csr_activities, compliance, audits,
                              training, employee_participation)

    return {
        "department": department,
        "risk_level": risk_level,
        "probabilities": probabilities,
        "reasons": reasons,
    }


if __name__ == "__main__":
    result = predict_risk(
        department="IT",
        carbon=78,
        csr_activities=30,
        compliance=45,
        audits=55,
        training=60,
        employee_participation=50,
    )
    print(result)
