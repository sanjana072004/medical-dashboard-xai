import io
import logging
import numpy as np
from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from pydantic import BaseModel
from typing import Optional

from ..core.deps import get_current_active_user, get_db
from ..models.sql_models import Prediction, Patient, Report
from ..models.sql_models import User as UserModel
from ..utils.shap_explainer import SHAPExplainer
from ..utils.lime_explainer import LIMEExplainer
from ..models.model_factory import ModelFactory

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/reports", tags=["reports"])


class DoctorNotesRequest(BaseModel):
    notes: Optional[str] = None


@router.post("/{prediction_id}/generate")
async def generate_report(
    prediction_id: int,
    doctor_notes: Optional[DoctorNotesRequest] = Body(None),
    current_user: UserModel = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        pred = db.query(Prediction).filter(Prediction.id == prediction_id, Prediction.user_id == current_user.id).first()
        if not pred:
            raise HTTPException(status_code=404, detail="Prediction not found")

        patient = None
        if pred.patient_id:
            patient = db.query(Patient).filter(Patient.id == pred.patient_id, Patient.owner_id == current_user.id).first()

        # Generate SHAP and LIME explanations
        model = ModelFactory.create_model(pred.model_type)
        features = list(pred.features.values()) if isinstance(pred.features, dict) else pred.features
        features_array = np.array(features)
        
        shap_engine = SHAPExplainer(model)
        shap_exp = shap_engine.explain_instance(features_array)
        lime_engine = LIMEExplainer(model)
        lime_exp = lime_engine.explain_instance(features_array)
    except Exception as e:
        logger.error(f"Failed to generate explanations for prediction {prediction_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate explanations")

    # Create PDF in-memory
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y = height - 50
    p.setFont('Helvetica-Bold', 16)
    p.drawString(50, y, 'Clinical AI — Prediction Report')
    y -= 30

    p.setFont('Helvetica', 11)
    p.drawString(50, y, f'Model: {pred.model_type}')
    y -= 18
    p.drawString(50, y, f'Prediction: {pred.prediction} (confidence: {(pred.probability*100):.1f}%)')
    y -= 18

    if patient:
        p.drawString(50, y, f'Patient: {patient.first_name} {patient.last_name} (ID: {patient.id})')
        y -= 18

    p.drawString(50, y, '--- SHAP Summary ---')
    y -= 16
    shap_text = str(shap_exp.get('shap_values', shap_exp))[:1000]
    for line in shap_text.split('\n'):
        p.drawString(60, y, line)
        y -= 12
        if y < 80:
            p.showPage(); y = height - 50

    p.drawString(50, y, '--- LIME Explanation ---')
    y -= 16
    lime_text = str(lime_exp.get('local_explanation', lime_exp))[:1000]
    for line in lime_text.split('\n'):
        p.drawString(60, y, line)
        y -= 12
        if y < 80:
            p.showPage(); y = height - 50

    if doctor_notes:
        p.drawString(50, y, '--- Doctor Notes ---')
        y -= 16
        notes = doctor_notes.get('notes', '')
        for line in notes.split('\n'):
            p.drawString(60, y, line)
            y -= 12
            if y < 80:
                p.showPage(); y = height - 50

    p.showPage()
    p.save()
    buffer.seek(0)

    # Save report record
    try:
        report = Report(
            prediction_id=pred.id,
            pdf_path=None,
            doctor_notes=doctor_notes.notes if doctor_notes else None
        )
        db.add(report)
        db.commit()
        logger.info(f"Generated report for prediction {pred.id}")
    except Exception as e:
        logger.error(f"Failed to save report record: {str(e)}")
        db.rollback()

    return StreamingResponse(
        buffer,
        media_type='application/pdf',
        headers={"Content-Disposition": f"attachment; filename=report_{pred.id}.pdf"}
    )
