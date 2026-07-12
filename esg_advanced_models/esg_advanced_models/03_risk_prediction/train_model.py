"""
train_model.py -- ESG Risk Prediction (Random Forest Classifier)

Predicts risk_level (Low / Medium / High) for a department from its
carbon, CSR, compliance, audits, training, and participation scores.
Also surfaces which factors drove the prediction (feature importance),
so the app can show "Reason: High Carbon, Low CSR, Compliance Issue"
style explanations.
"""
import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "risk_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "risk_rf_model.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "label_encoder.pkl")
DEPT_ENCODER_PATH = os.path.join(BASE_DIR, "dept_encoder.pkl")

FEATURE_COLUMNS = ["department_enc", "carbon", "csr_activities",
                    "compliance", "audits", "training", "employee_participation"]


def train():
    df = pd.read_csv(DATA_PATH)

    dept_encoder = LabelEncoder()
    df["department_enc"] = dept_encoder.fit_transform(df["department"])

    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(df["risk_level"])
    X = df[FEATURE_COLUMNS]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=200, max_depth=10, random_state=42, class_weight="balanced"
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print("Classification Report:\n")
    print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    importances = pd.Series(model.feature_importances_, index=FEATURE_COLUMNS)
    print("\nFeature Importances:")
    print(importances.sort_values(ascending=False).to_string())

    joblib.dump(model, MODEL_PATH)
    joblib.dump(label_encoder, ENCODER_PATH)
    joblib.dump(dept_encoder, DEPT_ENCODER_PATH)
    print(f"\nSaved model -> {MODEL_PATH}")


if __name__ == "__main__":
    train()
