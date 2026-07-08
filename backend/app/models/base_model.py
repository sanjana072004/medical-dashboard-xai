"""Base model class for all ML models"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List
import numpy as np


class BaseModel(ABC):
    """Abstract base class for diagnostic models"""
    
    def __init__(self, model_name: str, dataset_type: str):
        self.model_name = model_name
        self.dataset_type = dataset_type
        self.feature_names: List[str] = []
        self.model = None
        
    @abstractmethod
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make predictions"""
        pass
    
    @abstractmethod
    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """Get prediction probabilities"""
        pass
    
    @abstractmethod
    def get_feature_importance(self) -> Dict[str, float]:
        """Get feature importance scores"""
        pass
