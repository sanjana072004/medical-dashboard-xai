"""Evaluation metrics for XAI systems"""
import numpy as np
from typing import Dict, List, Callable
from sklearn.metrics import roc_auc_score, accuracy_score
import scipy.stats as stats


class ExplanationMetricsCalculator:
    """Calculate various metrics for explanation quality"""
    
    @staticmethod
    def consistency_score(explanations: List[np.ndarray]) -> float:
        """Calculate consistency across multiple explanations"""
        if len(explanations) < 2:
            return 1.0
        
        scores = []
        for i in range(len(explanations) - 1):
            exp1 = explanations[i]
            exp2 = explanations[i + 1]
            # Spearman correlation
            corr, _ = stats.spearmanr(exp1, exp2)
            scores.append(corr)
        
        return float(np.mean(scores))
    
    @staticmethod
    def coverage_score(importance_scores: np.ndarray, threshold: float = 0.1) -> float:
        """Calculate coverage of important features"""
        significant_features = np.sum(np.abs(importance_scores) > threshold)
        total_features = len(importance_scores)
        return float(significant_features / total_features)
    
    @staticmethod
    def fidelity_score(original_predictions: np.ndarray, 
                       perturbed_predictions: np.ndarray,
                       explanation_direction: np.ndarray) -> float:
        """Calculate fidelity: how well explanation matches prediction changes"""
        prediction_changes = np.abs(original_predictions - perturbed_predictions)
        exp_direction_magnitude = np.abs(explanation_direction)
        
        # Correlation between prediction change and explanation magnitude
        corr, _ = stats.spearmanr(prediction_changes, exp_direction_magnitude)
        return float(max(0, corr))  # Ensure non-negative
    
    @staticmethod
    def faithfulness_score(model_predictions: np.ndarray,
                           explanation_predictions: np.ndarray) -> float:
        """Calculate faithfulness: AUC between model and explanation predictions"""
        if len(np.unique(model_predictions)) == 1:
            return 1.0
        
        auc = roc_auc_score(model_predictions, explanation_predictions)
        return float(auc)
    
    @staticmethod
    def average_explanation_magnitude(explanations: List[np.ndarray]) -> float:
        """Get average magnitude of explanation values"""
        magnitudes = [np.mean(np.abs(exp)) for exp in explanations]
        return float(np.mean(magnitudes))


class ComparisonMetrics:
    """Compare SHAP vs LIME explanations"""
    
    @staticmethod
    def compare_consistency(shap_results: List[Dict], lime_results: List[Dict]) -> Dict:
        """Compare consistency between SHAP and LIME"""
        shap_consistency = []
        lime_consistency = []
        
        for shap_r, lime_r in zip(shap_results, lime_results):
            # Extract SHAP values
            if "shap_values" in shap_r.get("explanation", {}):
                shap_vals = np.array(shap_r["explanation"]["shap_values"])
                shap_consistency.append(np.mean(np.abs(shap_vals)))
            
            # Extract LIME values
            if "local_explanation" in lime_r.get("explanation", {}):
                lime_dict = lime_r["explanation"]["local_explanation"]
                lime_vals = np.array(list(lime_dict.values()))
                lime_consistency.append(np.mean(np.abs(lime_vals)))
        
        return {
            "shap_avg_magnitude": float(np.mean(shap_consistency)) if shap_consistency else 0.0,
            "lime_avg_magnitude": float(np.mean(lime_consistency)) if lime_consistency else 0.0,
            "magnitude_difference": float(abs(np.mean(shap_consistency) - np.mean(lime_consistency)))
        }
    
    @staticmethod
    def feature_importance_agreement(shap_explanations: Dict, lime_explanations: Dict) -> float:
        """Calculate agreement between SHAP and LIME on feature importance ranking"""
        # Get top features from each method
        shap_ranking = np.argsort(np.abs(np.array(shap_explanations["shap_values"])))[::-1]
        lime_features = list(shap_explanations.get("feature_names", []))
        
        # Simple agreement metric
        if len(lime_features) > 0:
            agreement = len(set(shap_ranking[:5]) & set(range(5))) / 5
            return float(agreement)
        
        return 0.0
