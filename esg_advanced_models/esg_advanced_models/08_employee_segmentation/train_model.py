"""
train_model.py -- Employee Segmentation (K-Means Clustering)

Groups employees into engagement segments (e.g. Highly Active,
Moderately Active, Inactive) based on their CSR/challenge/attendance
history. Cluster labels (0,1,2...) are automatically mapped to
human-readable names based on average engagement level per cluster.
"""
import os
import json
import joblib
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "segmentation_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "kmeans_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")
LABELS_PATH = os.path.join(BASE_DIR, "cluster_labels.json")

FEATURE_COLUMNS = ["csr_activities_joined", "challenges_completed",
                    "attendance_pct", "badges_earned"]
N_CLUSTERS = 3


def train():
    df = pd.read_csv(DATA_PATH)
    X = df[FEATURE_COLUMNS]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = KMeans(n_clusters=N_CLUSTERS, random_state=42, n_init=10)
    cluster_ids = model.fit_predict(X_scaled)
    df["cluster"] = cluster_ids

    # Rank clusters by average engagement (sum of scaled features) so the
    # label names ("Group A: Highly Active" etc.) are consistent regardless
    # of which arbitrary cluster ID KMeans assigns.
    cluster_engagement = (
        df.groupby("cluster")[FEATURE_COLUMNS]
        .mean()
        .sum(axis=1)
        .sort_values(ascending=False)
    )
    ranked_cluster_ids = cluster_engagement.index.tolist()

    label_names = ["Group A: Highly Active", "Group B: Moderately Active", "Group C: Inactive"]
    cluster_to_label = {int(cid): label_names[i] for i, cid in enumerate(ranked_cluster_ids)}

    df["segment"] = df["cluster"].map(cluster_to_label)

    print("Segment sizes:")
    print(df["segment"].value_counts())
    print("\nAverage metrics per segment:")
    print(df.groupby("segment")[FEATURE_COLUMNS].mean().round(2))

    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    with open(LABELS_PATH, "w") as f:
        json.dump(cluster_to_label, f, indent=2)

    print(f"\nSaved model -> {MODEL_PATH}")


if __name__ == "__main__":
    train()
