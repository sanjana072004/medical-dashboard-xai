"""
End-to-End Demo: Medical Dashboard XAI
Demonstrates full pipeline: predictions, explanations, and research evaluation
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

import numpy as np
import pandas as pd
from app.models.model_factory import ModelFactory
from app.utils.shap_explainer import SHAPExplainer
from app.utils.lime_explainer import LIMEExplainer

# Import from research module
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'research'))
from evaluation.user_study_framework import ExplanationStabilityEvaluator
from evaluation.metrics import ExplanationMetricsCalculator, ComparisonMetrics


def print_section(title):
    """Print formatted section header"""
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}\n")


def demo_predictions():
    """Demo 1: Make predictions with both models"""
    print_section("DEMO 1: PREDICTIONS")
    
    # Load sample data
    cardio_df = pd.read_csv("data/cardiovascular/cardiovascular_data.csv")
    ckd_df = pd.read_csv("data/ckd/ckd_data.csv")
    
    # Get sample instances
    cardio_sample = cardio_df.drop('target', axis=1).iloc[0].values
    ckd_sample = ckd_df.drop('target', axis=1).iloc[0].values
    
    # Cardiovascular predictions
    print("📋 Cardiovascular Disease Model")
    cardio_model = ModelFactory.create_model("cardiovascular")
    cardio_model.model.fit(
        cardio_df.drop('target', axis=1).values,
        cardio_df['target'].values
    )
    
    pred_cardio = cardio_model.predict(cardio_sample.reshape(1, -1))[0]
    prob_cardio = cardio_model.predict_proba(cardio_sample.reshape(1, -1))[0]
    
    print(f"  ✓ Prediction: {'Positive (Disease)' if pred_cardio else 'Negative (Healthy)'}")
    print(f"  ✓ Risk Score: {prob_cardio[1]*100:.1f}%")
    print(f"  ✓ Confidence: {max(prob_cardio)*100:.1f}%")
    
    # CKD predictions
    print("\n📋 Chronic Kidney Disease Model")
    ckd_model = ModelFactory.create_model("ckd")
    ckd_model.model.fit(
        ckd_df.drop('target', axis=1).values,
        ckd_df['target'].values
    )
    
    pred_ckd = ckd_model.predict(ckd_sample.reshape(1, -1))[0]
    prob_ckd = ckd_model.predict_proba(ckd_sample.reshape(1, -1))[0]
    
    print(f"  ✓ Prediction: {'Positive (Disease)' if pred_ckd else 'Negative (Healthy)'}")
    print(f"  ✓ Risk Score: {prob_ckd[1]*100:.1f}%")
    print(f"  ✓ Confidence: {max(prob_ckd)*100:.1f}%")
    
    return cardio_model, ckd_model, cardio_sample, ckd_sample


def demo_explanations(cardio_model, ckd_model, cardio_sample, ckd_sample):
    """Demo 2: Generate SHAP and LIME explanations"""
    print_section("DEMO 2: EXPLANATIONS")
    
    # Create training data for explainers
    cardio_df = pd.read_csv("data/cardiovascular/cardiovascular_data.csv")
    ckd_df = pd.read_csv("data/ckd/ckd_data.csv")
    
    # SHAP Explanations
    print("🔍 SHAP Explanations (Theoretically Sound)")
    print("\n  Cardiovascular:")
    shap_cardio = SHAPExplainer(cardio_model, 
                               cardio_df.drop('target', axis=1).values[:100])
    exp_shap_cardio = shap_cardio.explain_instance(cardio_sample)
    
    print(f"    ✓ Base Value: {exp_shap_cardio['base_value']*100:.2f}%")
    print(f"    ✓ Model Output: {exp_shap_cardio['model_output']*100:.2f}%")
    print(f"    ✓ Top 3 Contributors:")
    
    shap_values = np.array(exp_shap_cardio['shap_values'])
    top_indices = np.argsort(np.abs(shap_values))[-3:][::-1]
    for idx in top_indices:
        print(f"      - {exp_shap_cardio['feature_names'][idx]}: {shap_values[idx]*100:+.2f}%")
    
    print("\n  Chronic Kidney Disease:")
    shap_ckd = SHAPExplainer(ckd_model, 
                            ckd_df.drop('target', axis=1).values[:100])
    exp_shap_ckd = shap_ckd.explain_instance(ckd_sample)
    
    print(f"    ✓ Base Value: {exp_shap_ckd['base_value']*100:.2f}%")
    print(f"    ✓ Model Output: {exp_shap_ckd['model_output']*100:.2f}%")
    print(f"    ✓ Top 3 Contributors:")
    
    shap_values_ckd = np.array(exp_shap_ckd['shap_values'])
    top_indices_ckd = np.argsort(np.abs(shap_values_ckd))[-3:][::-1]
    for idx in top_indices_ckd:
        print(f"      - {exp_shap_ckd['feature_names'][idx]}: {shap_values_ckd[idx]*100:+.2f}%")
    
    # LIME Explanations
    print("\n🎯 LIME Explanations (Local Approximations)")
    print("\n  Cardiovascular:")
    lime_cardio = LIMEExplainer(cardio_model, 
                               cardio_df.drop('target', axis=1).values,
                               cardio_model.feature_names)
    exp_lime_cardio = lime_cardio.explain_instance(cardio_sample)
    
    print(f"    ✓ Model Output: {exp_lime_cardio['model_output']*100:.2f}%")
    print(f"    ✓ Top Features (by weight):")
    
    sorted_features = sorted(exp_lime_cardio['local_explanation'].items(), 
                            key=lambda x: abs(x[1]), reverse=True)[:3]
    for feat, weight in sorted_features:
        print(f"      - {feat}: {weight:.4f}")
    
    print("\n  Chronic Kidney Disease:")
    lime_ckd = LIMEExplainer(ckd_model, 
                            ckd_df.drop('target', axis=1).values,
                            ckd_model.feature_names)
    exp_lime_ckd = lime_ckd.explain_instance(ckd_sample)
    
    print(f"    ✓ Model Output: {exp_lime_ckd['model_output']*100:.2f}%")
    print(f"    ✓ Top Features (by weight):")
    
    sorted_features_ckd = sorted(exp_lime_ckd['local_explanation'].items(), 
                                key=lambda x: abs(x[1]), reverse=True)[:3]
    for feat, weight in sorted_features_ckd:
        print(f"      - {feat}: {weight:.4f}")
    
    return shap_cardio, lime_cardio, exp_shap_cardio, exp_lime_cardio


def demo_research_evaluation(cardio_model, shap_cardio):
    """Demo 3: Research evaluation - explanation stability"""
    print_section("DEMO 3: RESEARCH EVALUATION - EXPLANATION STABILITY")
    
    # Load sample data
    cardio_df = pd.read_csv("data/cardiovascular/cardiovascular_data.csv")
    
    # Get test instances
    test_data = cardio_df.drop('target', axis=1).values[50:55]
    
    print("📊 Testing Explanation Stability Under Noise")
    print("\nEvaluating how SHAP explanations change with noisy inputs...")
    print("Testing 5 patient samples with different noise levels:\n")
    
    evaluator = ExplanationStabilityEvaluator(cardio_model, shap_cardio)
    
    for i, instance in enumerate(test_data):
        print(f"  Patient {i+1}:")
        stability = evaluator.evaluate_stability(instance, num_perturbations=5)
        
        for perturb in stability['perturbations']:
            noise = perturb['noise_level']
            consistency = perturb['consistency']
            bars = "█" * int(consistency * 20)
            print(f"    ±{noise*100:4.0f}% noise: {bars:20} {consistency:.3f} consistency")


def demo_comparison_metrics(exp_shap_cardio, exp_lime_cardio):
    """Demo 4: Compare SHAP vs LIME"""
    print_section("DEMO 4: COMPARISON - SHAP VS LIME")
    
    print("🔬 Comparing Explanation Methods")
    
    # Simple comparison
    shap_vals = np.array(exp_shap_cardio['shap_values'])
    
    print("\n  Feature Coverage:")
    print(f"    ✓ SHAP explains all 13 features")
    print(f"    ✓ LIME explains select important features")
    
    print("\n  Explanation Magnitude:")
    print(f"    ✓ SHAP avg contribution: {np.mean(np.abs(shap_vals))*100:.4f}%")
    
    print("\n  Computational Properties:")
    print(f"    ✓ SHAP: Theoretically grounded, slightly slower")
    print(f"    ✓ LIME: Model-agnostic, faster local approximation")
    
    print("\n  Use Case Recommendations:")
    print(f"    ✓ SHAP: For detailed, globally-consistent explanations")
    print(f"    ✓ LIME: For quick, local decision boundary insights")


def main():
    """Run complete demo"""
    print("\n")
    print("╔" + "="*68 + "╗")
    print("║" + " "*15 + "MEDICAL DASHBOARD XAI - END-TO-END DEMO" + " "*15 + "║")
    print("║" + " "*10 + "Explainable AI for Clinical Diagnostics" + " "*18 + "║")
    print("╚" + "="*68 + "╝")
    
    try:
        # Run demos
        cardio_model, ckd_model, cardio_sample, ckd_sample = demo_predictions()
        shap_cardio, lime_cardio, exp_shap, exp_lime = demo_explanations(
            cardio_model, ckd_model, cardio_sample, ckd_sample
        )
        demo_research_evaluation(cardio_model, shap_cardio)
        demo_comparison_metrics(exp_shap, exp_lime)
        
        # Summary
        print_section("✅ DEMO COMPLETE")
        print("All components working correctly!")
        print("\n📌 Next Steps:")
        print("  1. Open http://localhost:3000 in your browser")
        print("  2. Navigate to /dashboard for interactive predictions")
        print("  3. Test with sample data for both models")
        print("  4. Compare SHAP and LIME explanations")
        print("  5. Run user study framework for research evaluation\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
