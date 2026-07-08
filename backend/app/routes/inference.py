"""Inference endpoints"""
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel as PydanticBaseModel
from typing import List, Dict, Any
import numpy as np
from ..models.model_factory import ModelFactory
from ..utils.data_preprocessing import DataPreprocessor

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/inference", tags=["inference"])


class PredictionRequest(PydanticBaseModel):
    """Request model for predictions"""
    model_type: str  # "cardiovascular" or "ckd"
    features: List[float]


class PredictionResponse(PydanticBaseModel):
    """Response model for predictions"""
    model_type: str
    prediction: int
    probability_negative: float
    probability_positive: float
    risk_level: str


def get_risk_level(probability: float) -> str:
    """Determine risk level based on probability"""
    if probability < 0.3:
        return "low"
    elif probability < 0.7:
        return "moderate"
    else:
        return "high"


@router.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest) -> Dict[str, Any]:
    """Make a prediction using the specified model"""
    try:
        logger.debug(f"Prediction request: model={request.model_type}, features_count={len(request.features)}")
        model = ModelFactory.create_model(request.model_type)
        
        # Prepare input
        X = np.array(request.features).reshape(1, -1)
        
        # Make prediction
        prediction = model.predict(X)[0]
        probabilities = model.predict_proba(X)[0]
        
        risk_level = get_risk_level(probabilities[1])
        logger.info(f"Prediction completed: model={request.model_type}, risk={risk_level}")
        
        return {
            "model_type": request.model_type,
            "prediction": int(prediction),
            "probability_negative": float(probabilities[0]),
            "probability_positive": float(probabilities[1]),
            "risk_level": risk_level
        }
    except ValueError as e:
        logger.warning(f"Validation error in prediction: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.get("/models")
async def get_available_models() -> Dict[str, List[str]]:
    """Get list of available models"""
    return {"models": ModelFactory.get_available_models()}
