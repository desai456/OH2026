"""
predict.py
============
Loads the trained model and forecasts the next N months per department.
This is the piece your backend would call to feed a "Predicted" line into
the Environmental > Emissions Trend chart in EcoSphere.

Run it with:  python3 predict.py
"""

import numpy as np
import pandas as pd
import joblib
import matplotlib.pyplot as plt

MONTHS_TO_FORECAST = 6

bundle = joblib.load("model/emissions_forecast_model.pkl")
model = bundle["model"]
feature_columns = bundle["feature_columns"]
departments = bundle["departments"]

history = pd.read_csv("data/emissions_history.csv", parse_dates=["month"])
last_time_index = ((history["month"].dt.year - history["month"].dt.year.min()) * 12 + history["month"].dt.month).max()
last_month = history["month"].max()

future_months = pd.date_range(last_month + pd.offsets.MonthBegin(1), periods=MONTHS_TO_FORECAST, freq="MS")

rows = []
for dept in departments:
    for i, m in enumerate(future_months, start=1):
        rows.append({"month": m, "department": dept, "time_index": last_time_index + i})

future_df = pd.DataFrame(rows)
future_df["month_sin"] = np.sin(2 * np.pi * future_df["month"].dt.month / 12)
future_df["month_cos"] = np.cos(2 * np.pi * future_df["month"].dt.month / 12)
dept_dummies = pd.get_dummies(future_df["department"], prefix="dept")

X_future = pd.concat([future_df[["time_index", "month_sin", "month_cos"]], dept_dummies], axis=1)
X_future = X_future.reindex(columns=feature_columns, fill_value=0)  # match training column order exactly

future_df["predicted_co2e_tonnes"] = model.predict(X_future).round(2)
future_df[["month", "department", "predicted_co2e_tonnes"]].to_csv("outputs/forecast_next_6_months.csv", index=False)
print(future_df[["month", "department", "predicted_co2e_tonnes"]])


hist_total = history.groupby("month")["co2e_tonnes"].sum().reset_index()
fcst_total = future_df.groupby("month")["predicted_co2e_tonnes"].sum().reset_index()

plt.figure(figsize=(9, 4.5))
plt.plot(hist_total["month"], hist_total["co2e_tonnes"], label="Actual", color="#2F6B4F", linewidth=2)
plt.plot(fcst_total["month"], fcst_total["predicted_co2e_tonnes"], label="Forecast", color="#B8752E", linewidth=2, linestyle="--", marker="o")
plt.axvline(last_month, color="#999999", linestyle=":", linewidth=1)
plt.title("Company-wide monthly emissions: actual vs forecast")
plt.ylabel("t CO\u2082e")
plt.legend()
plt.tight_layout()
plt.savefig("outputs/forecast_chart.png", dpi=150)
print("\nSaved outputs/forecast_next_6_months.csv and outputs/forecast_chart.png")
