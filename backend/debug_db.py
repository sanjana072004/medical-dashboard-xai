import traceback
from app.db.base import Base
from app.db.session import engine
from app.models.sql_models import User, Patient, Prediction, Report, DiseaseModel, ActivityLog

try:
    Base.metadata.create_all(bind=engine)
    print('create_all ok')
except Exception:
    traceback.print_exc()
