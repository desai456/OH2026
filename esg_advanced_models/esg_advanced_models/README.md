# ESG Advanced ML Models

Model training code for six ESG features, plus a bonus chatbot scaffold.
Each folder is self-contained: generate data -> train -> predict.

```
esg_advanced_models/
├── requirements.txt
├── 03_risk_prediction/          Random Forest Classifier -> Low/Medium/High Risk + reasons
├── 04_anomaly_detection/        Isolation Forest -> flags abnormal carbon/fuel/electricity usage
├── 05_participation_prediction/ Logistic Regression -> probability an employee joins CSR activities
├── 06_recommendation_system/    Rule-based recommender -> actionable sustainability suggestions
├── 07_carbon_forecasting/       Facebook Prophet -> forecasts emissions for future months
├── 08_employee_segmentation/    K-Means -> groups employees into engagement segments
└── 09_chatbot_bonus/            Scaffold for an LLM-powered ESG Q&A chatbot (needs your own API key)
```

## Setup

```bash
pip install -r requirements.txt
```

## Running each model

Every numbered folder (03-08) follows the same 3-step pattern:

```bash
cd 03_risk_prediction
python generate_dataset.py   # creates synthetic training data
python train_model.py        # trains and saves the model
python predict.py            # runs an example prediction
```

`06_recommendation_system` has no training step — it's rule-based, so
just run `python recommend.py` or import `get_recommendations()` directly.

`09_chatbot_bonus` needs an OpenAI API key (`export OPENAI_API_KEY=...`)
and a `get_context_data()` function wired to your real database — see
comments in `chatbot.py`.

## Important: synthetic data

Every dataset here is **synthetically generated** because I don't have
access to your project's real historical department/employee/usage
data. Each `generate_dataset.py` documents the exact column names and
value ranges expected, so you can:

1. Use the synthetic version to test the pipeline end-to-end right away, or
2. Export your real historical data into the same CSV format and swap
   it in before training — this is what you'll want for production use,
   since the accuracy numbers printed during training are only meaningful
   once the model is learning from your actual data.

## Model-by-model summary

| Folder | Model | Predicts |
|---|---|---|
| 03_risk_prediction | RandomForestClassifier | Low / Medium / High ESG risk + reasons (High Carbon, Low CSR, Compliance Issue, etc.) |
| 04_anomaly_detection | IsolationForest | Whether a department's resource usage is abnormal, with a confidence % |
| 05_participation_prediction | LogisticRegression | Probability (%) an employee joins the next CSR activity/challenge |
| 06_recommendation_system | Rule-based | Actionable sustainability recommendations ranked by priority |
| 07_carbon_forecasting | Facebook Prophet | Forecasted carbon emissions (tons) for the next N months |
| 08_employee_segmentation | KMeans | Employee engagement segment: Highly Active / Moderately Active / Inactive |
| 09_chatbot_bonus | LLM wrapper (OpenAI) | Natural-language answers to questions about your ESG data |

## Integrating into your project

Each `predict.py` exposes a plain Python function (e.g.
`predict_risk(...)`, `detect_anomaly(...)`, `forecast_carbon(...)`) that
you can import directly if your app runs Python, or wrap in a small
Flask endpoint (same pattern as `app_api.py` from the ESG score
prediction model) if your main app is in PHP/JS and needs to call it
over HTTP.
