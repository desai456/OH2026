"""
api.py
========
A minimal API so a real frontend (like your EcoSphere Environmental module)
can ask this model for a forecast instead of you running predict.py by hand.

Run it with:   python3 api.py
Then visit:    http://localhost:5000/forecast?months=6

This is intentionally the simplest possible version - one file, one route -
so you can see how a trained model gets "wired up" to an app. In a real
deployment you'd add authentication, error handling, and retrain on a
schedule as new Carbon Transactions come in.
"""

import numpy as np
import pandas as pd
import joblib
from flask import Flask, jsonify, request

app = Flask(__name__)

bundle = joblib.load("model/emissions_forecast_model.pkl")
model = bundle["model"]
feature_columns = bundle["feature_columns"]
departments = bundle["departments"]

history = pd.read_csv("data/emissions_history.csv", parse_dates=["month"])
last_time_index = ((history["month"].dt.year - history["month"].dt.year.min()) * 12 + history["month"].dt.month).max()
last_month = history["month"].max()


@app.route("/forecast")
def forecast():
    months_ahead = int(request.args.get("months", 6))
    future_months = pd.date_range(last_month + pd.offsets.MonthBegin(1), periods=months_ahead, freq="MS")

    rows = []
    for dept in departments:
        for i, m in enumerate(future_months, start=1):
            rows.append({"month": m, "department": dept, "time_index": last_time_index + i})
    future_df = pd.DataFrame(rows)
    future_df["month_sin"] = np.sin(2 * np.pi * future_df["month"].dt.month / 12)
    future_df["month_cos"] = np.cos(2 * np.pi * future_df["month"].dt.month / 12)
    dept_dummies = pd.get_dummies(future_df["department"], prefix="dept")

    X = pd.concat([future_df[["time_index", "month_sin", "month_cos"]], dept_dummies], axis=1)
    X = X.reindex(columns=feature_columns, fill_value=0)
    future_df["predicted_co2e_tonnes"] = model.predict(X).round(2)

    result = [
        {
            "month": row["month"].strftime("%Y-%m"),
            "department": row["department"],
            "predicted_co2e_tonnes": row["predicted_co2e_tonnes"],
        }
        for _, row in future_df.iterrows()
    ]
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
