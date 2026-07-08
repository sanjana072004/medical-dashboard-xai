from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..core.deps import get_current_active_user, get_db
from ..models.sql_models import Patient, User
from ..schemas import PatientCreate, PatientRead, PatientUpdate, PaginatedPatients

router = APIRouter(prefix="/api/patients", tags=["patients"])


@router.post("/", response_model=PatientRead)
async def create_patient(
    patient_in: PatientCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    patient = Patient(
        owner_id=current_user.id,
        first_name=patient_in.first_name,
        last_name=patient_in.last_name,
        date_of_birth=patient_in.date_of_birth,
        gender=patient_in.gender,
        clinical_data=patient_in.clinical_data,
        notes=patient_in.notes,
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@router.get("/", response_model=PaginatedPatients)
async def list_patients(
    q: Optional[str] = Query(None, title="Search patients by name"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    query = db.query(Patient).filter(Patient.owner_id == current_user.id)
    if q:
        query = query.filter(
            (Patient.first_name.ilike(f"%{q}%")) | (Patient.last_name.ilike(f"%{q}%"))
        )
    total = query.count()
    items = query.order_by(Patient.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedPatients(items=items, total=total, page=page, page_size=page_size)


@router.get("/{patient_id}", response_model=PatientRead)
async def get_patient(
    patient_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    patient = db.query(Patient).filter(Patient.id == patient_id, Patient.owner_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return patient


@router.patch("/{patient_id}", response_model=PatientRead)
async def update_patient(
    patient_id: int,
    patient_in: PatientUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    patient = db.query(Patient).filter(Patient.id == patient_id, Patient.owner_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    for field, value in patient_in.model_dump(exclude_unset=True).items():
        setattr(patient, field, value)

    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@router.delete("/{patient_id}")
async def delete_patient(
    patient_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    patient = db.query(Patient).filter(Patient.id == patient_id, Patient.owner_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    db.delete(patient)
    db.commit()
    return {"detail": "Patient deleted"}
