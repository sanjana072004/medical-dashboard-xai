"""SHAP explainer for model predictions"""
import numpy as np
import shap
from typing import Dict, List, Any
from ..models.base_model import BaseModel


class SHAPExplainer:
    """SHAP explanation engine"""
    
    def __init__(self, model: BaseModel, background_data: np.ndarray = None):
        self.model = model
        self.background_data = background_data
        self.explainer = None
        
    def explain_instance(self, instance: np.ndarray) -> Dict[str, Any]:
        """Generate SHAP explanation for a single instance"""
        if self.explainer is None:
            # Create TreeExplainer for model (works for tree-based models)
            try:
                self.explainer = shap.TreeExplainer(self.model.model)
            except Exception:
                # Fallback to KernelExplainer if TreeExplainer fails
                try:
                    self.explainer = shap.KernelExplainer(self.model.predict_proba, self.background_data if self.background_data is not None else np.zeros((1, len(instance))))
                except Exception:
                    return {"error": "Explainer initialization failed"}

        # Get SHAP values
        shap_values = self.explainer.shap_values(instance.reshape(1, -1))
        
        # Handle multi-class output
        if isinstance(shap_values, list):
            shap_values = shap_values[1]  # Get values for positive class
        
        # Get base value
        base_value = self.explainer.expected_value
        if isinstance(base_value, (list, np.ndarray)):
            base_value = base_value[1]  # Get base value for positive class
        
        return {
            "method": "SHAP",
            "shap_values": shap_values[0].tolist(),
            "base_value": float(base_value),
            "feature_names": self.model.feature_names,
            "model_output": float(self.model.predict_proba(instance.reshape(1, -1))[0][1])
        }
    
    def explain_batch(self, instances: np.ndarray, sample_size: int = 100) -> List[Dict[str, Any]]:
        """Generate SHAP explanations for multiple instances"""
        explanations = []
        for instance in instances[:sample_size]:
            explanations.append(self.explain_instance(instance))
        return explanations
