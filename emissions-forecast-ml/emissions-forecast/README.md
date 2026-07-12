# EcoSphere — Carbon Emissions Forecasting Model

A beginner-friendly machine learning pipeline that predicts future monthly
carbon emissions per department, so EcoSphere's Environmental dashboard can
show a "predicted next 6 months" line, not just history.

## What's inside

```
data/generate_data.py     creates 3 years of sample monthly emissions
                            (stand-in for a real Carbon Transactions export)
data/emissions_history.csv the generated sample data
train_model.py               the actual training pipeline (read this first)
predict.py                   loads the trained model, forecasts, makes a chart
api.py                       tiny Flask endpoint so a frontend can call the model
model/emissions_forecast_model.pkl   the saved, trained model
outputs/forecast_next_6_months.csv   the forecast as a spreadsheet
outputs/forecast_chart.png            actual vs. forecast, plotted
requirements.txt
```

## Running it yourself

```bash
pip install -r requirements.txt
python3 data/generate_data.py   # only needed once, or skip - csv is already included
python3 train_model.py          # trains and saves the model
python3 predict.py              # forecasts the next 6 months + draws the chart
python3 api.py                  # optional: serves forecasts at /forecast
```

## How this actually works (read `train_model.py` alongside this)

Every ML project follows the same shape:

1. **Data** — `emissions_history.csv` has one row per department per month:
   `month, department, co2e_tonnes`. This is exactly what you'd get by
   summing your `Carbon Transaction` records by month and department.

2. **Features** — a model only understands numbers, so dates get turned into:
   - `time_index`: a simple 0, 1, 2... counter so it can learn a trend
     ("emissions are generally falling over time")
   - `month_sin` / `month_cos`: a mathematical trick for "month of year"
     that correctly tells the model December and January are neighbours
   - one column per department (`dept_Sales`, `dept_Manufacturing`, ...) so
     the model learns each department's own baseline separately

3. **Train / test split** — the model only ever learns from the *older*
   months. The most recent 6 months are held back so we can check its
   guesses against numbers it never saw. This is the single most important
   habit in ML: if you let the model see the answer while training, its
   score will look great and mean nothing.

4. **Model** — two are trained and compared: a simple `LinearRegression`
   (finds one straight trend) and a `RandomForestRegressor` (can learn
   bends and department-specific quirks). Whichever scores lower error on
   the held-out months is kept automatically.

5. **Evaluation** — printed as MAE (average error in tonnes), RMSE (same,
   penalizes big misses more) and MAPE (average error as a %). These are
   the standard numbers to quote when someone asks "how good is the model."

6. **Forecast** — `predict.py` builds the same kind of feature rows for
   months that haven't happened yet, and asks the trained model to fill in
   `co2e_tonnes`. That's the whole trick: forecasting is just "prediction
   where the answer happens to be in the future."

## Swapping in your real data

Replace `data/emissions_history.csv` with a real export shaped exactly the
same way (`month, department, co2e_tonnes` — one row per department per
month). Everything else works unchanged. As a rule of thumb, don't fully
trust the forecast until you have at least 18-24 months of real history;
with only a handful of months the model has too little seasonal pattern to
learn from.

## Next steps as you learn more

- Retrain on a schedule (e.g. monthly, via a cron job) as new data comes in.
- If forecasts need to be more precise, look into time-series-specific
  models: `statsmodels` (Holt-Winters, SARIMA) or Facebook's `Prophet` are
  natural next steps once you're comfortable with this pipeline.
- Add more features if you have them: emission factor changes, headcount,
  production volume — anything that plausibly drives emissions up or down.
- Wrap `api.py` behind your real backend and call it from the Environmental
  module to plot a dashed "Forecast" segment after the actual trend line.
