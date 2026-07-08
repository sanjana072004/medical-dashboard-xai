"""Data preprocessing utilities"""
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from typing import Tuple, Optional


class DataPreprocessor:
    """Utility class for data preprocessing"""
    
    def __init__(self, feature_names: list):
        self.feature_names = feature_names
        self.scaler = StandardScaler()
        self.is_fitted = False
    
    def fit(self, X: np.ndarray) -> 'DataPreprocessor':
        """Fit the preprocessor on training data"""
        self.scaler.fit(X)
        self.is_fitted = True
        return self
    
    def transform(self, X: np.ndarray) -> np.ndarray:
        """Transform data"""
        if not self.is_fitted:
            self.fit(X)
        return self.scaler.transform(X)
    
    def fit_transform(self, X: np.ndarray) -> np.ndarray:
        """Fit and transform"""
        self.scaler.fit(X)
        self.is_fitted = True
        return self.scaler.transform(X)
    
    def inverse_transform(self, X: np.ndarray) -> np.ndarray:
        """Inverse transform"""
        if not self.is_fitted:
            raise ValueError("Preprocessor not fitted yet")
        return self.scaler.inverse_transform(X)
    
    def validate_input(self, X: np.ndarray) -> Tuple[bool, Optional[str]]:
        """Validate input data"""
        if len(X.shape) != 2:
            return False, "Input must be 2D array"
        if X.shape[1] != len(self.feature_names):
            return False, f"Expected {len(self.feature_names)} features, got {X.shape[1]}"
        if np.isnan(X).any():
            return False, "Input contains NaN values"
        return True, None
