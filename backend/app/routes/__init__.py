"""API Routes for Medical Dashboard"""

from .auth import router as auth_router
from .explanation import router as explanation_router
from .inference import router as inference_router
from .patients import router as patient_router
from .predictions import router as prediction_router
from .analytics import router as analytics_router
from .reports import router as reports_router
