"""
train_model.py -- Carbon Anomaly Detection (Isolation Forest)

Isolation Forest is unsupervised: it doesn't need the is_anomaly labels
to train (that column is only used here afterward, to evaluate how well
the unsupervised model lines up with known anomalies). In production,
you generally won't have labels at all -- that's the point of anomaly
detection.
"""
import os
import joblib
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "usage_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "anomaly_model.pkl")
DEPT_ENCODER_PATH = os.path.join(BASE_DIR, "dept_encoder.pkl")

FEATURE_COLUMNS = ["department_enc", "fuel_usage", "electricity_usage",
                    "water_usage", "carbon_emission"]

# Expected fraction of anomalies in real usage data -- tune this to match
# how rare anomalies actually are for your organization.
CONTAMINATION = 0.05


def train():
    df = pd.read_csv(DATA_PATH)

    dept_encoder = LabelEncoder()
    df["department_enc"] = dept_encoder.fit_transform(df["department"])

    X = df[FEATURE_COLUMNS]

    model = IsolationForest(
        n_estimators=200,
        contamination=CONTAMINATION,
        random_state=42,
    )
    model.fit(X)

    # -1 = anomaly, 1 = normal (IsolationForest convention) -> convert to 0/1
    raw_pred = model.predict(X)
    df["predicted_anomaly"] = (raw_pred == -1).astype(int)

    if "is_anomaly" in df.columns:
        print("Evaluation against known synthetic labels:\n")
        print(classification_report(df["is_anomaly"], df["predicted_anomaly"],
                                     target_names=["Normal", "Anomaly"]))

    joblib.dump(model, MODEL_PATH)
    joblib.dump(dept_encoder, DEPT_ENCODER_PATH)
    print(f"Saved model -> {MODEL_PATH}")


if __name__ == "__main__":
    train()
