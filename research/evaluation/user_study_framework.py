"""User study evaluation framework for comparing SHAP vs LIME"""
import numpy as np
import pandas as pd
from typing import List, Dict, Tuple
from dataclasses import dataclass
import json
from datetime import datetime


@dataclass
class ExplanationMetrics:
    """Metrics for evaluating explanation quality"""
    consistency_score: float  # 0-1: How stable are explanations under perturbation?
    fidelity_score: float     # 0-1: How accurately does explanation match model behavior?
    coverage_score: float     # 0-1: How many important features are explained?
    faithfulness_score: float # 0-1: Correlation between explanation and model prediction change
    

class ExplanationStabilityEvaluator:
    """Evaluate explanation stability under noisy inputs"""
    
    def __init__(self, model, explainer, noise_levels: List[float] = None):
        self.model = model
        self.explainer = explainer
        self.noise_levels = noise_levels or [0.01, 0.05, 0.1, 0.2]
        self.results = []
    
    def perturb_instance(self, instance: np.ndarray, noise_level: float) -> np.ndarray:
        """Add Gaussian noise to instance"""
        noise = np.random.normal(0, noise_level, instance.shape)
        return instance + noise
    
    def evaluate_stability(self, instance: np.ndarray, num_perturbations: int = 10) -> Dict:
        """Evaluate explanation stability under perturbations"""
        base_explanation = self.explainer.explain_instance(instance)
        
        stability_results = {
            "base_explanation": base_explanation,
            "perturbations": []
        }
        
        for noise_level in self.noise_levels:
            perturbation_results = []
            for _ in range(num_perturbations):
                perturbed = self.perturb_instance(instance, noise_level)
                perturbed_exp = self.explainer.explain_instance(perturbed)
                perturbation_results.append(perturbed_exp)
            
            # Calculate consistency
            consistency = self._calculate_consistency(base_explanation, perturbation_results)
            stability_results["perturbations"].append({
                "noise_level": noise_level,
                "consistency": consistency
            })
        
        return stability_results
    
    def _calculate_consistency(self, base_exp: Dict, perturbations: List[Dict]) -> float:
        """Calculate consistency score between explanations"""
        if "shap_values" in base_exp:
            base_vals = np.array(base_exp["shap_values"])
            similarities = []
            for pert in perturbations:
                pert_vals = np.array(pert["shap_values"])
                # Cosine similarity
                sim = np.dot(base_vals, pert_vals) / (np.linalg.norm(base_vals) * np.linalg.norm(pert_vals) + 1e-8)
                similarities.append(sim)
            return float(np.mean(similarities))
        return 0.0
    
    def evaluate_batch(self, instances: np.ndarray) -> List[Dict]:
        """Evaluate stability for multiple instances"""
        results = []
        for instance in instances:
            results.append(self.evaluate_stability(instance))
        return results


class UserStudyFramework:
    """Framework for conducting user study metrics"""
    
    def __init__(self, study_id: str):
        self.study_id = study_id
        self.participants = []
        self.results = []
        self.created_at = datetime.now().isoformat()
    
    def add_participant(self, participant_id: str, role: str):
        """Add participant to study"""
        self.participants.append({
            "id": participant_id,
            "role": role,
            "evaluations": []
        })
    
    def record_evaluation(self, participant_id: str, prediction: Dict, 
                         shap_explanation: Dict, lime_explanation: Dict,
                         rating: int, confidence: int, notes: str = ""):
        """Record participant evaluation of explanations"""
        evaluation = {
            "prediction": prediction,
            "shap_explanation": shap_explanation,
            "lime_explanation": lime_explanation,
            "rating": rating,  # 1-5 scale
            "confidence": confidence,  # 1-5 scale
            "notes": notes,
            "timestamp": datetime.now().isoformat()
        }
        
        # Find participant and add evaluation
        for p in self.participants:
            if p["id"] == participant_id:
                p["evaluations"].append(evaluation)
                break
    
    def export_results(self, filepath: str):
        """Export study results to JSON"""
        output = {
            "study_id": self.study_id,
            "created_at": self.created_at,
            "participants": self.participants,
            "summary": self.get_summary()
        }
        with open(filepath, 'w') as f:
            json.dump(output, f, indent=2)
    
    def get_summary(self) -> Dict:
        """Get summary statistics"""
        total_evaluations = sum(len(p["evaluations"]) for p in self.participants)
        
        # Average ratings by method
        shap_ratings = []
        lime_ratings = []
        
        for p in self.participants:
            for eval in p["evaluations"]:
                shap_ratings.append(eval["rating"])  # Could differentiate by method
                lime_ratings.append(eval["rating"])
        
        return {
            "total_participants": len(self.participants),
            "total_evaluations": total_evaluations,
            "average_rating": float(np.mean(shap_ratings + lime_ratings)) if shap_ratings else 0.0
        }
