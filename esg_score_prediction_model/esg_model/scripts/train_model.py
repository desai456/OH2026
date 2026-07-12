"""
train_model.py
---------------
Trains a Random Forest Regressor to predict NEXT MONTH's ESG score
from the same six inputs your project already uses to calculate the
CURRENT ESG score:

    Carbon, CSR Activities, Training, Compliance, Audits,
    Employee Participation

This mirrors the structure of a typical carbon-emission prediction
model (load data -> split features/target -> train/test split ->
train RandomForestRegressor -> evaluate -> save model with joblib),
just applied to ESG scores instead of emissions.

Usage:
    python train_model.py

Requires:
    data/esg_history.csv  (run generate_dataset.py first if you don't
    have real historical data yet)

Output:
    model/esg_rf_model.pkl   -> trained model
    model/feature_columns.json -> exact column order the model expects
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "esg_history.csv")
MODEL_DIR = os.path.join(BASE_DIR, "model")
MODEL_PATH = os.path.join(MODEL_DIR, "esg_rf_model.pkl")
FEATURES_PATH = os.path.join(MODEL_DIR, "feature_columns.json")

FEATURE_COLUMNS = [
    "carbon",
    "csr_activities",
    "training",
    "compliance",
    "audits",
    "employee_participation",
]
TARGET_COLUMN = "next_month_esg_score"


def load_data():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(
            f"Could not find {DATA_PATH}.\n"
            "Run 'python generate_dataset.py' first, or replace this file "
            "with an export of your real historical ESG data using the "
            "same column names."
        )
    df = pd.read_csv(DATA_PATH)
    missing = [c for c in FEATURE_COLUMNS + [TARGET_COLUMN] if c not in df.columns]
    if missing:
        raise ValueError(f"Dataset is missing required columns: {missing}")
    return df


def train():
    df = load_data()

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Small grid search to pick reasonable hyperparameters.
    # Feel free to trim this down if training needs to be fast.
    param_grid = {
        "n_estimators": [100, 200],
        "max_depth": [None, 8, 12],
        "min_samples_leaf": [1, 2, 4],
    }

    base_model = RandomForestRegressor(random_state=42)

    grid_search = GridSearchCV(
        estimator=base_model,
        param_grid=param_grid,
        cv=5,
        scoring="neg_mean_absolute_error",
        n_jobs=-1,
    )
    grid_search.fit(X_train, y_train)

    model = grid_search.best_estimator_
    print("Best parameters:", grid_search.best_params_)

    # Evaluate
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    print("\nModel Evaluation on Test Set")
    print(f"  MAE  : {mae:.3f}")
    print(f"  RMSE : {rmse:.3f}")
    print(f"  R^2  : {r2:.3f}")

    # Feature importance (useful to show in your project report/demo)
    importances = pd.Series(model.feature_importances_, index=FEATURE_COLUMNS)
    importances = importances.sort_values(ascending=False)
    print("\nFeature Importances:")
    print(importances.to_string())

    # Save model + feature order
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    with open(FEATURES_PATH, "w") as f:
        json.dump(FEATURE_COLUMNS, f, indent=2)

    print(f"\nSaved trained model -> {MODEL_PATH}")
    print(f"Saved feature column order -> {FEATURES_PATH}")


if __name__ == "__main__":
    train()
