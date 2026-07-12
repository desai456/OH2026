"""
predict.py -- Carbon Forecasting

Loads the trained Prophet model and forecasts carbon emissions (tons)
for the next N months -- exactly what feeds a "Jan: 20T -> Feb: 23T ->
Mar: 26T" style dashboard.

Usage:
    from predict import forecast_carbon
    forecast_carbon(months_ahead=3)
"""
import os
import pandas as pd
from prophet.serialize import model_from_json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "carbon_forecast_model.json")

_model = None


def _load():
    global _model
    if _model is None:
        with open(MODEL_PATH) as f:
            _model = model_from_json(f.read())
    return _model


def forecast_carbon(months_ahead=3):
    model = _load()

    future = model.make_future_dataframe(periods=months_ahead, freq="MS")
    forecast = model.predict(future)

    result = forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail(months_ahead)
    result = result.rename(columns={
        "ds": "month",
        "yhat": "predicted_tons",
        "yhat_lower": "lower_bound_tons",
        "yhat_upper": "upper_bound_tons",
    })
    result["month"] = result["month"].dt.strftime("%B %Y")
    for col in ["predicted_tons", "lower_bound_tons", "upper_bound_tons"]:
        result[col] = result[col].round(2)

    return result.to_dict(orient="records")


if __name__ == "__main__":
    forecast = forecast_carbon(months_ahead=3)
    for row in forecast:
        print(f"{row['month']}: {row['predicted_tons']} tons "
              f"(range {row['lower_bound_tons']}-{row['upper_bound_tons']})")
