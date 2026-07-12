

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib

# ---------------------------------------------------------------------------
# 1. LOAD DATA
# ---------------------------------------------------------------------------
df = pd.read_csv("data/emissions_history.csv", parse_dates=["month"])
df = df.sort_values(["department", "month"]).reset_index(drop=True)

# ---------------------------------------------------------------------------
# 2. FEATURE ENGINEERING
# ---------------------------------------------------------------------------
# A model can't understand a date directly. We turn it into numbers that
# describe "when" in ways a model can use:
#   - time_index: 0, 1, 2, ... so the model can learn an overall trend
#   - month_sin / month_cos: encode "month of year" as a repeating wave, so
#     December and January are recognised as neighbours (a plain 1-12 number
#     would wrongly tell the model they're far apart)
#   - department: one-hot encoded, so the model can learn each department's
#     own baseline and pattern separately
df["time_index"] = (df["month"].dt.year - df["month"].dt.year.min()) * 12 + df["month"].dt.month
df["month_sin"] = np.sin(2 * np.pi * df["month"].dt.month / 12)
df["month_cos"] = np.cos(2 * np.pi * df["month"].dt.month / 12)

dept_dummies = pd.get_dummies(df["department"], prefix="dept")
features = pd.concat([df[["time_index", "month_sin", "month_cos"]], dept_dummies], axis=1)
target = df["co2e_tonnes"]

# ---------------------------------------------------------------------------
# 3. TRAIN / TEST SPLIT
# ---------------------------------------------------------------------------
# IMPORTANT: for time series, never shuffle randomly. We hold out the most
# recent 6 months per department as the "test" set: data the model never
# sees during training, so we can honestly check how good its guesses are.
cutoff = df["time_index"].max() - 6
train_mask = df["time_index"] <= cutoff
test_mask = ~train_mask

X_train, y_train = features[train_mask], target[train_mask]
X_test, y_test = features[test_mask], target[test_mask]

print(f"Training on {len(X_train)} rows, testing on {len(X_test)} rows\n")

# ---------------------------------------------------------------------------
# 4. TRAIN
# ---------------------------------------------------------------------------
# We train two models and compare them - this is normal practice: you rarely
# know in advance which model will do best, so you try a simple one and a
# more flexible one, then keep whichever tests better.

linear_model = LinearRegression()
linear_model.fit(X_train, y_train)

forest_model = RandomForestRegressor(n_estimators=300, max_depth=6, random_state=42)
forest_model.fit(X_train, y_train)

# ---------------------------------------------------------------------------
# 5. EVALUATE
# ---------------------------------------------------------------------------
def evaluate(name, model):
    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    rmse = mean_squared_error(y_test, preds) ** 0.5
    mape = (np.abs((y_test - preds) / y_test)).mean() * 100
    print(f"{name:>16}:  MAE={mae:6.2f} t   RMSE={rmse:6.2f} t   MAPE={mape:5.1f}%")
    return mae

mae_linear = evaluate("Linear Regression", linear_model)
mae_forest = evaluate("Random Forest", forest_model)

best_model = forest_model if mae_forest < mae_linear else linear_model
best_name = "random_forest" if best_model is forest_model else "linear_regression"
print(f"\nBest model: {best_name}")

# ---------------------------------------------------------------------------
# 6. SAVE
# ---------------------------------------------------------------------------
joblib.dump(
    {"model": best_model, "feature_columns": list(features.columns), "departments": sorted(df["department"].unique())},
    "model/emissions_forecast_model.pkl",
)
print("Saved trained model to model/emissions_forecast_model.pkl")
