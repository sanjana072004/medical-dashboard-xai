"""Explanation endpoints"""
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel as PydanticBaseModel
from typing import List, Dict, Any
import numpy as np
from ..models.model_factory import ModelFactory
from ..utils.shap_explainer import SHAPExplainer
from ..utils.lime_explainer import LIMEExplainer

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/explanation", tags=["explanation"])


class ExplanationRequest(PydanticBaseModel):
    """Request model for explanations"""
    model_type: str  # "cardiovascular" or "ckd"
    features: List[float]
    method: str = "shap"  # "shap" or "lime"


@router.post("/explain")
async def explain_prediction(request: ExplanationRequest) -> Dict[str, Any]:
    """Generate explanation for a prediction"""
    try:
        # Validate method
        if request.method not in ["shap", "lime"]:
            raise ValueError("Method must be 'shap' or 'lime'")
        
        logger.debug(f"Explanation request: model={request.model_type}, method={request.method}, features_count={len(request.features)}")
        model = ModelFactory.create_model(request.model_type)
        X = np.array(request.features).reshape(1, -1)
        
        if request.method == "shap":
            explainer = SHAPExplainer(model, background_data=None)
            explanation = explainer.explain_instance(X[0])
        else:  # lime
            explainer = LIMEExplainer(model, training_data=None, feature_names=model.feature_names)
            explanation = explainer.explain_instance(X[0])
        
        logger.info(f"Explanation generated: model={request.model_type}, method={request.method}")
        return {
            "model_type": request.model_type,
            "method": request.method,
            "explanation": explanation,
            "features": dict(zip(model.feature_names, request.features))
        }
    except ValueError as e:
        logger.warning(f"Validation error in explanation: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Explanation error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Explanation error: {str(e)}")


@router.get("/methods")
async def get_available_methods() -> Dict[str, List[str]]:
    """Get list of available explanation methods"""
    return {"methods": ["shap", "lime"]}
