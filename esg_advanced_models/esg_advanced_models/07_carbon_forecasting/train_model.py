"""
train_model.py -- Carbon Forecasting (Facebook Prophet)

Prophet expects a dataframe with columns 'ds' (date) and 'y' (value) --
here, monthly carbon emissions in tons. Trains on your historical
series and saves the fitted model so predict.py can forecast future
months on demand.

Note: Prophet requires the 'prophet' package (pip install prophet).
It pulls in some C++ build tooling (cmdstan) the first time it runs,
so the very first training run may take a minute or two.
"""
import os
import json
import pandas as pd
from prophet import Prophet
from prophet.serialize import model_to_json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "carbon_timeseries.csv")
MODEL_PATH = os.path.join(BASE_DIR, "carbon_forecast_model.json")


def train():
    df = pd.read_csv(DATA_PATH, parse_dates=["ds"])

    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=False,
        daily_seasonality=False,
        changepoint_prior_scale=0.1,  # allows moderate trend flexibility
    )
    model.fit(df)

    with open(MODEL_PATH, "w") as f:
        f.write(model_to_json(model))

    print(f"Trained Prophet model on {len(df)} months of data.")
    print(f"Saved model -> {MODEL_PATH}")


if __name__ == "__main__":
    train()
