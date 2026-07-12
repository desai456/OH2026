"""
train_model.py -- Employee Participation Prediction (Logistic Regression)
"""
import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import classification_report, roc_auc_score

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "participation_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "participation_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")
DEPT_ENCODER_PATH = os.path.join(BASE_DIR, "dept_encoder.pkl")

FEATURE_COLUMNS = ["department_enc", "previous_csr", "attendance_pct",
                    "experience_years", "previous_challenges"]


def train():
    df = pd.read_csv(DATA_PATH)

    dept_encoder = LabelEncoder()
    df["department_enc"] = dept_encoder.fit_transform(df["department"])

    X = df[FEATURE_COLUMNS]
    y = df["will_join_next_activity"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    model = LogisticRegression(max_iter=1000, class_weight="balanced")
    model.fit(X_train_scaled, y_train)

    y_pred = model.predict(X_test_scaled)
    y_prob = model.predict_proba(X_test_scaled)[:, 1]

    print("Classification Report:\n")
    print(classification_report(y_test, y_pred, target_names=["Will Not Join", "Will Join"]))
    print(f"ROC AUC: {roc_auc_score(y_test, y_prob):.3f}")

    coefs = pd.Series(model.coef_[0], index=FEATURE_COLUMNS)
    print("\nFeature Coefficients (positive = increases likelihood of joining):")
    print(coefs.sort_values(ascending=False).to_string())

    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    joblib.dump(dept_encoder, DEPT_ENCODER_PATH)
    print(f"\nSaved model -> {MODEL_PATH}")


if __name__ == "__main__":
    train()
