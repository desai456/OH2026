import subprocess
import os

def train_all():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    folders = [
        "03_risk_prediction",
        "04_anomaly_detection",
        "05_participation_prediction",
        "07_carbon_forecasting",
        "08_employee_segmentation"
    ]
    results = {}
    for f in folders:
        path = os.path.join(base_dir, f)
        print(f"Training model in {f}...")
        try:
            res = subprocess.run(
                ["python", "train_model.py"],
                cwd=path,
                capture_output=True,
                text=True,
                check=True
            )
            results[f] = "success"
        except Exception as e:
            results[f] = f"error: {str(e)}"
            
    # Also train the ESG score prediction model
    esg_score_path = os.path.join(
        os.path.dirname(os.path.dirname(base_dir)),
        "esg_score_prediction_model",
        "esg_model",
        "scripts"
    )
    print("Training ESG Score Prediction model...")
    try:
        res = subprocess.run(
            ["python", "train_model.py"],
            cwd=esg_score_path,
            capture_output=True,
            text=True,
            check=True
        )
        results["esg_score_prediction"] = "success"
    except Exception as e:
        results["esg_score_prediction"] = f"error: {str(e)}"
        
    return results

if __name__ == "__main__":
    r = train_all()
    print("All training completed:", r)
