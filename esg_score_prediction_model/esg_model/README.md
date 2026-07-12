# ESG Score Prediction Model

Predicts **next month's ESG score** using a `RandomForestRegressor`, based on
the same six inputs your project already uses to calculate the current score:

- Carbon
- CSR Activities
- Training
- Compliance
- Audits
- Employee Participation

This mirrors the structure of a typical carbon-emission prediction model
(load data → train/test split → train RandomForestRegressor → evaluate →
save with `joblib`), applied here to ESG scores.

## Folder structure

```
esg_model/
├── data/
│   └── esg_history.csv        (generated — historical training data)
├── model/
│   ├── esg_rf_model.pkl        (generated — trained model)
│   └── feature_columns.json    (generated — expected input order)
├── scripts/
│   ├── generate_dataset.py     Creates synthetic training data
│   ├── train_model.py          Trains and saves the model
│   ├── predict.py              Loads the model, makes predictions
│   └── app_api.py              Optional Flask endpoint wrapper
├── requirements.txt
└── README.md
```

## Setup

```bash
cd esg_model
pip install -r requirements.txt
```

## Step 1 — Get training data

You need **historical monthly records**: each month's inputs paired with
what the ESG score actually turned out to be the *following* month.

**If you don't have real history yet**, generate a synthetic dataset to get
the pipeline working end-to-end:

```bash
cd scripts
python generate_dataset.py
```

This creates `data/esg_history.csv`.

**When you have real data**, export it from your database (MySQL, etc.)
into a CSV with these exact column names and replace `data/esg_history.csv`:

| carbon | csr_activities | training | compliance | audits | employee_participation | next_month_esg_score |
|--------|-----------------|----------|------------|--------|--------------------------|------------------------|

## Step 2 — Train the model

```bash
python train_model.py
```

This will:
1. Split data into train/test sets
2. Run a small grid search over Random Forest hyperparameters
3. Print MAE, RMSE, and R² on the test set
4. Print feature importances (useful for your project report/demo)
5. Save the trained model to `model/esg_rf_model.pkl`

## Step 3 — Predict

**Directly in Python:**

```python
from predict import predict_esg_score

score = predict_esg_score(
    carbon=45,
    csr_activities=70,
    training=65,
    compliance=80,
    audits=75,
    employee_participation=60,
)
print(score)  # e.g. 85.32
```

**Or via a small HTTP API** (useful if your main project isn't Python):

```bash
python app_api.py
```

Then call it with:

```bash
curl -X POST http://localhost:5001/predict-esg \
  -H "Content-Type: application/json" \
  -d '{"carbon":45,"csr_activities":70,"training":65,"compliance":80,"audits":75,"employee_participation":60}'
```

## Integrating into your existing project

Wherever your app currently calculates and displays the *current* ESG
score, add a call to `predict_esg_score(...)` (or hit the `/predict-esg`
endpoint) with that same month's input values, and display the result as
a "Predicted Next Month's ESG Score" card next to the current one.

## Notes

- The synthetic dataset generator uses a placeholder ESG scoring formula
  (`compute_esg_score` inside `generate_dataset.py`). Swap it for your
  project's actual formula so the synthetic training data reflects
  reality more closely — or better yet, replace the synthetic data with
  real historical records as soon as you have enough of them (aim for
  at least a few dozen historical records to get a stable model).
- Retrain periodically (e.g. monthly) as more real data comes in — the
  model will get more accurate as your history grows.
