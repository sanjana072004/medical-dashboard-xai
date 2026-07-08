from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..core.deps import get_current_active_user, get_db
from ..models.sql_models import Patient, Prediction, User
from ..schemas import PredictionCreate, PredictionRead, PaginatedPredictions

router = APIRouter(prefix="/api/predictions", tags=["predictions"])


@router.post("/", response_model=PredictionRead)
async def create_prediction(
    prediction_in: PredictionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    if prediction_in.patient_id:
        patient = db.query(Patient).filter(Patient.id == prediction_in.patient_id, Patient.owner_id == current_user.id).first()
        if not patient:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    prob = prediction_in.probability or prediction_in.probability_positive or 0.0
    prediction = Prediction(
        user_id=current_user.id,
        patient_id=prediction_in.patient_id,
        model_type=prediction_in.model_type,
        features=prediction_in.features,
        prediction=prediction_in.prediction,
        probability=prob,
        risk_level=prediction_in.risk_level,
        model_metadata=prediction_in.metadata,
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    return prediction


@router.get("/", response_model=PaginatedPredictions)
async def list_predictions(
    patient_id: Optional[int] = Query(None),
    model_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    query = db.query(Prediction).filter(Prediction.user_id == current_user.id)
    if patient_id:
        query = query.filter(Prediction.patient_id == patient_id)
    if model_type:
        query = query.filter(Prediction.model_type == model_type)

    total = query.count()
    items = query.order_by(Prediction.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedPredictions(items=items, total=total, page=page, page_size=page_size)


@router.get("/{prediction_id}", response_model=PredictionRead)
async def get_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id, Prediction.user_id == current_user.id).first()
    if not prediction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found")
    return prediction
