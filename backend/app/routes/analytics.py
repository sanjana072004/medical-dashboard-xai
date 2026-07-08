import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from ..core.deps import get_current_active_user, get_db
from ..models.sql_models import Prediction, Patient
from ..models.sql_models import User as UserModel

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get('/summary')
async def analytics_summary(current_user: UserModel = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Get analytics summary for the current user"""
    try:
        # Total predictions
        total = db.query(func.count(Prediction.id)).filter(Prediction.user_id == current_user.id).scalar() or 0

        # Disease distribution
        dist_q = db.query(Prediction.model_type, func.count(Prediction.id)).filter(Prediction.user_id == current_user.id).group_by(Prediction.model_type).all()
        distribution = {m: c for m, c in dist_q}

        # Monthly trends (last 12 months)
        now = datetime.utcnow()
        start = now - timedelta(days=365)
        trends_q = db.query(func.strftime('%Y-%m', Prediction.created_at).label('month'), func.count(Prediction.id)).filter(Prediction.user_id == current_user.id, Prediction.created_at >= start).group_by('month').order_by('month').all()
        monthly_trends = [{'month': m, 'count': c} for m, c in trends_q]

        # High-risk patients (top 10)
        high_q = db.query(Patient.id, Patient.first_name, Patient.last_name, func.count(Prediction.id).label('count')).join(Prediction, Prediction.patient_id == Patient.id).filter(Prediction.user_id == current_user.id, Prediction.risk_level == 'high').group_by(Patient.id).order_by(func.count(Prediction.id).desc()).limit(10).all()
        high_risk_patients = [{'patient_id': pid, 'first_name': fn, 'last_name': ln, 'count': ct} for pid, fn, ln, ct in high_q]

        # Prediction statistics
        avg_probability = float(db.query(func.avg(Prediction.probability)).filter(Prediction.user_id == current_user.id).scalar() or 0.0)
        positives = db.query(Prediction).filter(Prediction.user_id == current_user.id, Prediction.prediction == 1).count()

        logger.info(f"Analytics summary generated for user {current_user.id}")
        return {
            'total_predictions': int(total),
            'disease_distribution': distribution,
            'monthly_trends': monthly_trends,
            'high_risk_patients': high_risk_patients,
            'prediction_stats': {
                'average_probability': avg_probability,
                'positive_count': positives,
            }
        }
    except Exception as e:
        logger.error(f"Failed to generate analytics summary: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate analytics summary")
