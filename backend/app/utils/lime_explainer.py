"""LIME explainer for model predictions"""
import numpy as np
import lime.lime_tabular
from typing import Dict, List, Any
from ..models.base_model import BaseModel


class LIMEExplainer:
    """LIME explanation engine"""
    
    def __init__(self, model: BaseModel, training_data: np.ndarray = None, feature_names: List[str] = None):
        self.model = model
        self.training_data = training_data if training_data is not None else np.random.randn(1000, len(model.feature_names))
        self.feature_names = feature_names or model.feature_names
        self.explainer = lime.lime_tabular.LimeTabularExplainer(
            self.training_data,
            feature_names=self.feature_names,
            mode='classification',
            random_state=42
        )
    
    def explain_instance(self, instance: np.ndarray, num_features: int = 10) -> Dict[str, Any]:
        """Generate LIME explanation for a single instance"""
        exp = self.explainer.explain_instance(
            instance,
            self.model.predict_proba,
            num_features=num_features,
            top_labels=1
        )

        # Use the label LIME actually generated an explanation for.
        # Hard-coding label=1 can fail when the top predicted label is 0.
        selected_label = 1
        if hasattr(exp, "available_labels"):
            available_labels = exp.available_labels()
            if available_labels:
                selected_label = 1 if 1 in available_labels else available_labels[0]

        # Extract explanation as dictionary
        lime_dict = dict(exp.as_list(label=selected_label))

        intercept = 0.0
        if hasattr(exp, "intercept"):
            try:
                intercept = float(exp.intercept[selected_label])
            except Exception:
                intercept = 0.0
        
        return {
            "method": "LIME",
            "label": int(selected_label),
            "local_explanation": lime_dict,
            "feature_names": self.feature_names,
            "model_output": float(self.model.predict_proba(instance.reshape(1, -1))[0][1]),
            "intercept": intercept
        }
    
    def explain_batch(self, instances: np.ndarray, num_features: int = 10, sample_size: int = 100) -> List[Dict[str, Any]]:
        """Generate LIME explanations for multiple instances"""
        explanations = []
        for instance in instances[:sample_size]:
            explanations.append(self.explain_instance(instance, num_features=num_features))
        return explanations
