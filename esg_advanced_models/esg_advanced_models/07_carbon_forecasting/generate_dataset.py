"""
generate_dataset.py -- Carbon Forecasting
Generates a synthetic monthly carbon-emission time series (tons/month)
with a mild upward trend + seasonality + noise, the kind of pattern
Prophet is built to model.
"""
import numpy as np
import pandas as pd
import os

RANDOM_SEED = 42
N_MONTHS = 36  # 3 years of monthly history
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "carbon_timeseries.csv")


def generate():
    rng = np.random.default_rng(RANDOM_SEED)
    dates = pd.date_range(end=pd.Timestamp.today().replace(day=1), periods=N_MONTHS, freq="MS")

    trend = np.linspace(15, 26, N_MONTHS)                        # gradual increase
    seasonality = 2.5 * np.sin(2 * np.pi * np.arange(N_MONTHS) / 12)  # yearly cycle
    noise = rng.normal(0, 1.0, N_MONTHS)

    emissions = np.clip(trend + seasonality + noise, 0, None)

    df = pd.DataFrame({"ds": dates, "y": np.round(emissions, 2)})
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"Generated {len(df)} monthly records -> {OUTPUT_PATH}")
    return df


if __name__ == "__main__":
    generate()
