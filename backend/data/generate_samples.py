"""Generate sample datasets for model training and testing"""
import numpy as np
import pandas as pd
from sklearn.datasets import make_classification
from pathlib import Path


def generate_cardiovascular_data(n_samples: int = 500) -> pd.DataFrame:
    """Generate synthetic cardiovascular disease dataset"""
    X, y = make_classification(
        n_samples=n_samples,
        n_features=13,
        n_informative=8,
        n_redundant=3,
        n_clusters_per_class=2,
        random_state=42
    )
    
    feature_names = [
        "age", "sex", "cp", "trestbps", "chol", "fbs", "restecg",
        "thalach", "exang", "oldpeak", "slope", "ca", "thal"
    ]
    
    # Scale features to realistic ranges
    X[:, 0] = np.clip(X[:, 0] * 15 + 50, 29, 77)  # age: 29-77
    X[:, 1] = np.round(np.clip(X[:, 1], 0, 1))     # sex: 0-1
    X[:, 2] = np.round(np.clip(X[:, 2] * 4 + 0.5, 0, 4))  # cp: 0-4
    X[:, 3] = np.clip(X[:, 3] * 30 + 100, 90, 200) # trestbps
    X[:, 4] = np.clip(X[:, 4] * 100 + 200, 126, 564) # chol
    X[:, 5] = np.round(np.clip(X[:, 5], 0, 1))     # fbs
    X[:, 6] = np.round(np.clip(X[:, 6] * 2, 0, 2)) # restecg
    X[:, 7] = np.clip(X[:, 7] * 50 + 100, 60, 202) # thalach
    X[:, 8] = np.round(np.clip(X[:, 8], 0, 1))     # exang
    X[:, 9] = np.clip(np.abs(X[:, 9]) * 2, 0, 6.2) # oldpeak
    X[:, 10] = np.round(np.clip(X[:, 10] * 2, 1, 3)) # slope
    X[:, 11] = np.round(np.clip(X[:, 11] * 4, 0, 4)) # ca
    X[:, 12] = np.round(np.clip(X[:, 12] * 3, 3, 7)) # thal
    
    df = pd.DataFrame(X, columns=feature_names)
    df['target'] = y
    
    return df


def generate_ckd_data(n_samples: int = 500) -> pd.DataFrame:
    """Generate synthetic chronic kidney disease dataset"""
    X, y = make_classification(
        n_samples=n_samples,
        n_features=24,
        n_informative=15,
        n_redundant=6,
        n_clusters_per_class=2,
        random_state=42
    )
    
    feature_names = [
        "age", "bp", "sg", "al", "su", "rbc", "pc", "pcc",
        "ba", "bgr", "bu", "cr", "na", "k", "hemo", "pcv",
        "wc", "rc", "htn", "dm", "cad", "appet", "pe", "ane"
    ]
    
    # Scale to realistic clinical ranges
    X[:, 0] = np.clip(X[:, 0] * 20 + 40, 2, 90)     # age
    X[:, 1] = np.clip(X[:, 1] * 30 + 80, 50, 180)   # blood pressure
    X[:, 2] = np.clip(X[:, 2] * 0.005 + 1.015, 1.005, 1.03) # specific gravity
    X[:, 3] = np.clip(X[:, 3] * 5, 0, 5)            # albumin
    X[:, 4] = np.clip(X[:, 4] * 5, 0, 5)            # sugar
    X[:, 5] = np.round(np.clip(X[:, 5], 0, 1))      # red blood cells
    X[:, 6] = np.round(np.clip(X[:, 6], 0, 1))      # pus cells
    X[:, 7] = np.round(np.clip(X[:, 7], 0, 1))      # pus cell clumps
    X[:, 8] = np.round(np.clip(X[:, 8], 0, 1))      # bacteria
    X[:, 9] = np.clip(X[:, 9] * 100 + 100, 22, 490) # blood glucose random
    X[:, 10] = np.clip(X[:, 10] * 50 + 40, 1.5, 391) # blood urea
    X[:, 11] = np.clip(X[:, 11] * 5 + 1, 0.4, 76)   # creatinine
    X[:, 12] = np.clip(X[:, 12] * 10 + 130, 4.5, 163) # sodium
    X[:, 13] = np.clip(X[:, 13] * 2 + 3, 2.5, 9.8)   # potassium
    X[:, 14] = np.clip(X[:, 14] * 5 + 12, 4.5, 17.5) # hemoglobin
    X[:, 15] = np.clip(X[:, 15] * 20 + 40, 12, 58)   # packed cell volume
    X[:, 16] = np.clip(X[:, 16] * 3000 + 5000, 2400, 11000) # white blood cells
    X[:, 17] = np.clip(X[:, 17] * 2 + 3, 3.5, 8.5)   # red blood cells count
    X[:, 18:] = np.round(np.clip(X[:, 18:], 0, 1))  # binary features
    
    df = pd.DataFrame(X, columns=feature_names)
    df['target'] = y
    
    return df


def save_datasets():
    """Generate and save datasets"""
    cardio_path = Path("data/cardiovascular")
    ckd_path = Path("data/ckd")
    
    cardio_path.mkdir(parents=True, exist_ok=True)
    ckd_path.mkdir(parents=True, exist_ok=True)
    
    # Generate and save
    print("Generating cardiovascular dataset...")
    cardio_df = generate_cardiovascular_data(n_samples=500)
    cardio_df.to_csv(cardio_path / "cardiovascular_data.csv", index=False)
    print(f"Saved: {cardio_path / 'cardiovascular_data.csv'}")
    
    print("Generating CKD dataset...")
    ckd_df = generate_ckd_data(n_samples=500)
    ckd_df.to_csv(ckd_path / "ckd_data.csv", index=False)
    print(f"Saved: {ckd_path / 'ckd_data.csv'}")
    
    print("Datasets generated successfully!")


if __name__ == "__main__":
    save_datasets()
