"""Model factory for creating and managing diagnostic models"""
from typing import Optional
from .cardiovascular_model import CardiovascularModel
from .ckd_model import CKDModel
from .base_model import BaseModel


class ModelFactory:
    """Factory for creating diagnostic models"""
    
    _models = {
        "cardiovascular": CardiovascularModel,
        "ckd": CKDModel
    }
    
    @classmethod
    def create_model(cls, model_type: str) -> Optional[BaseModel]:
        """Create a model instance by type"""
        if model_type not in cls._models:
            raise ValueError(f"Unknown model type: {model_type}")
        return cls._models[model_type]()
    
    @classmethod
    def get_available_models(cls) -> list:
        """Get list of available model types"""
        return list(cls._models.keys())
