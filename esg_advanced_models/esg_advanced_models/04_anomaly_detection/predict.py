"""
predict.py -- Carbon Anomaly Detection

Flags whether a department's current resource usage is abnormal, with a
confidence percentage derived from the Isolation Forest's anomaly score.
"""
import os
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "anomaly_model.pkl")
DEPT_ENCODER_PATH = os.path.join(BASE_DIR, "dept_encoder.pkl")

_model = _dept_encoder = None


def _load():
    global _model, _dept_encoder
    if _model is None:
        _model = joblib.load(MODEL_PATH)
        _dept_encoder = joblib.load(DEPT_ENCODER_PATH)
    return _model, _dept_encoder


def detect_anomaly(department, fuel_usage, electricity_usage, water_usage, carbon_emission):
    model, dept_encoder = _load()

    dept_enc = (dept_encoder.transform([department])[0]
                if department in dept_encoder.classes_ else 0)

    row = pd.DataFrame([{
        "department_enc": dept_enc,
        "fuel_usage": fuel_usage,
        "electricity_usage": electricity_usage,
        "water_usage": water_usage,
        "carbon_emission": carbon_emission,
    }])

    raw_pred = model.predict(row)[0]          
    is_anomaly = raw_pred == -1

    
    score = model.decision_function(row)[0]
    confidence = max(0, min(100, round((0.5 - score) * 100, 2)))

    return {
        "department": department,
        "abnormal_usage_detected": bool(is_anomaly),
        "confidence_percent": confidence if is_anomaly else round(100 - confidence, 2),
        "raw_input": {
            "fuel_usage": fuel_usage,
            "electricity_usage": electricity_usage,
            "water_usage": water_usage,
            "carbon_emission": carbon_emission,
        },
    }


if __name__ == "__main__":
   
    result = detect_anomaly(
        department="Manufacturing",
        fuel_usage=950,          # ~10x normal
        electricity_usage=2400,  # ~5x normal
        water_usage=210,
        carbon_emission=140,     # unexpected spike
    )
    print(result)
