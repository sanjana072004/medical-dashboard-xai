from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class TokenData(BaseModel):
    sub: Optional[str] = None


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: Optional[str] = None
    role: Optional[str] = Field(default="doctor", pattern="^(doctor|admin)$")


class RegisterRequest(UserCreate):
    pass


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime


class PatientBase(BaseModel):
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    clinical_data: Dict[str, Any] = Field(default_factory=dict)
    notes: Optional[str] = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    clinical_data: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class PatientRead(PatientBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    created_at: datetime


class PredictionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    patient_id: Optional[int] = None
    model_type: str
    features: Dict[str, Any]
    prediction: int
    probability: float
    risk_level: str
    model_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime


class PredictionCreate(BaseModel):
    patient_id: Optional[int] = None
    model_type: str
    features: Dict[str, Any]
    prediction: int
    probability: Optional[float] = None
    probability_positive: Optional[float] = None
    probability_negative: Optional[float] = None
    risk_level: str
    model_metadata: Optional[Dict[str, Any]] = None
    
    def __post_init__(self):
        """Ensure at least one probability field is set"""
        if not self.probability and not self.probability_positive:
            raise ValueError('Either probability or probability_positive must be provided')


class PaginatedPatients(BaseModel):
    items: List[PatientRead]
    total: int
    page: int
    page_size: int


class PaginatedPredictions(BaseModel):
    items: List[PredictionRead]
    total: int
    page: int
    page_size: int
