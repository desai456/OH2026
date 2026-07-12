"""
predict.py
----------
Loads the trained ESG Random Forest model and predicts NEXT MONTH's
ESG score from a single set of current-month inputs.

This is the piece you'd wire into your project's backend: call
predict_esg_score(...) wherever you currently display the current
ESG score, and show the result as "Predicted Next Month's ESG Score".

Usage (standalone test):
    python predict.py

Usage (import into your app):
    from predict import predict_esg_score

    predicted_score = predict_esg_score(
        carbon=45,
        csr_activities=70,
        training=65,
        compliance=80,
        audits=75,
        employee_participation=60,
    )
"""

import os
import json
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "model", "esg_rf_model.pkl")
FEATURES_PATH = os.path.join(BASE_DIR, "model", "feature_columns.json")

_model = None
_feature_columns = None


def _load_model():
    global _model, _feature_columns
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"No trained model found at {MODEL_PATH}. "
                "Run train_model.py first."
            )
        _model = joblib.load(MODEL_PATH)
        with open(FEATURES_PATH) as f:
            _feature_columns = json.load(f)
    return _model, _feature_columns


def predict_esg_score(carbon, csr_activities, training, compliance,
                       audits, employee_participation):
    """
    Predicts next month's ESG score (0-100) given this month's inputs.
    All arguments are expected to be numeric scores on a 0-100 scale,
    matching whatever scale your project already uses to calculate the
    current ESG score.
    """
    model, feature_columns = _load_model()

    input_row = {
        "carbon": carbon,
        "csr_activities": csr_activities,
        "training": training,
        "compliance": compliance,
        "audits": audits,
        "employee_participation": employee_participation,
    }

    # Ensure correct column order (DataFrame keeps feature names, avoiding
    # the sklearn "X does not have valid feature names" warning)
    import pandas as pd
    ordered_df = pd.DataFrame([[input_row[col] for col in feature_columns]],
                               columns=feature_columns)

    prediction = model.predict(ordered_df)[0]
    prediction = max(0, min(100, prediction))  # clamp to valid 0-100 range

    return round(float(prediction), 2)


if __name__ == "__main__":
    # Example / manual test
    example_input = dict(
        carbon=45,
        csr_activities=70,
        training=65,
        compliance=80,
        audits=75,
        employee_participation=60,
    )
    score = predict_esg_score(**example_input)
    print("Input:", example_input)
    print("Predicted next month's ESG score:", score)
