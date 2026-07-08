"""Train ML models with sample data"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from app.models.model_factory import ModelFactory

def train_cardiovascular_model():
    """Train cardiovascular disease model"""
    print("Loading cardiovascular data...")
    df = pd.read_csv("data/cardiovascular/cardiovascular_data.csv")
    
    X = df.drop('target', axis=1).values
    y = df['target'].values
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"Training cardiovascular model with {len(X_train)} samples...")
    model = ModelFactory.create_model("cardiovascular")
    model.model.fit(X_train, y_train)
    
    # Evaluate
    train_score = model.model.score(X_train, y_train)
    test_score = model.model.score(X_test, y_test)
    
    print(f"Cardiovascular Model - Train: {train_score:.3f}, Test: {test_score:.3f}")
    return model

def train_ckd_model():
    """Train chronic kidney disease model"""
    print("\nLoading CKD data...")
    df = pd.read_csv("data/ckd/ckd_data.csv")
    
    X = df.drop('target', axis=1).values
    y = df['target'].values
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"Training CKD model with {len(X_train)} samples...")
    model = ModelFactory.create_model("ckd")
    model.model.fit(X_train, y_train)
    
    # Evaluate
    train_score = model.model.score(X_train, y_train)
    test_score = model.model.score(X_test, y_test)
    
    print(f"CKD Model - Train: {train_score:.3f}, Test: {test_score:.3f}")
    return model

if __name__ == "__main__":
    cardio_model = train_cardiovascular_model()
    cardio_model.save_model()
    print("✅ Cardiovascular model saved!")
    
    ckd_model = train_ckd_model()
    ckd_model.save_model()
    print("✅ CKD model saved!")
    
    print("\n✅ All models trained and saved successfully!")
