"""Chronic Kidney Disease risk prediction model"""
import numpy as np
from sklearn.preprocessing import StandardScaler
import xgboost as xgb
from .base_model import BaseModel
from typing import Dict
import os
import joblib


class CKDModel(BaseModel):
    """XGBoost model for chronic kidney disease prediction"""
    
    FEATURE_NAMES = [
        "age", "bp", "sg", "al", "su", "rbc", "pc", "pcc",
        "ba", "bgr", "bu", "cr", "na", "k", "hemo", "pcv",
        "wc", "rc", "htn", "dm", "cad", "appet", "pe", "ane"
    ]
    
    MODEL_PATH = "models/ckd_model.pkl"
    SCALER_PATH = "models/ckd_scaler.pkl"
    
    def __init__(self):
        super().__init__("ckd_xgboost", "ckd")
        self.feature_names = self.FEATURE_NAMES
        self.scaler = StandardScaler()
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize or load XGBoost model"""
        if os.path.exists(self.MODEL_PATH):
            # Load trained model
            self.model = joblib.load(self.MODEL_PATH)
            if os.path.exists(self.SCALER_PATH):
                self.scaler = joblib.load(self.SCALER_PATH)
        else:
            # Create empty model
            self.model = xgb.XGBClassifier(
                n_estimators=100,
                max_depth=5,
                learning_rate=0.1,
                random_state=42,
                use_label_encoder=False,
                eval_metric='logloss'
            )
    
    def save_model(self):
        """Save trained model to disk"""
        os.makedirs("models", exist_ok=True)
        joblib.dump(self.model, self.MODEL_PATH)
        joblib.dump(self.scaler, self.SCALER_PATH)
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predict class labels"""
        if self.model is None:
            return np.zeros(len(X))
        return self.model.predict(X)
    
    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Get prediction probabilities"""
        if self.model is None:
            return np.zeros((len(X), 2))
        return self.model.predict_proba(X)
    
    def get_feature_importance(self) -> Dict[str, float]:
        """Get feature importance scores"""
        if self.model is None:
            return {name: 0.0 for name in self.feature_names}
        importances = self.model.feature_importances_
        return {name: float(imp) for name, imp in zip(self.feature_names, importances)}
