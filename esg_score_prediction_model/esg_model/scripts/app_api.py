"""
app_api.py
----------
OPTIONAL: A minimal Flask API that exposes the trained ESG model as an
HTTP endpoint, so your existing project (PHP, JS frontend, etc.) can
call it over HTTP instead of needing Python running inline.

Usage:
    python app_api.py
    # Server starts on http://localhost:5001

Example request:
    POST http://localhost:5001/predict-esg
    Content-Type: application/json

    {
        "carbon": 45,
        "csr_activities": 70,
        "training": 65,
        "compliance": 80,
        "audits": 75,
        "employee_participation": 60
    }

Example response:
    {
        "predicted_next_month_esg_score": 85.32
    }

If you don't need a separate service (e.g. your project already runs
Python/Flask/Django), just import predict_esg_score() from predict.py
directly instead of running this file.
"""

from flask import Flask, request, jsonify
from predict import predict_esg_score

app = Flask(__name__)

REQUIRED_FIELDS = [
    "carbon",
    "csr_activities",
    "training",
    "compliance",
    "audits",
    "employee_participation",
]


@app.route("/predict-esg", methods=["POST"])
def predict_esg():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    missing = [f for f in REQUIRED_FIELDS if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    try:
        values = {f: float(data[f]) for f in REQUIRED_FIELDS}
    except (TypeError, ValueError):
        return jsonify({"error": "All fields must be numeric"}), 400

    try:
        predicted_score = predict_esg_score(**values)
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"predicted_next_month_esg_score": predicted_score})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
