"""Main FastAPI application for Medical Dashboard XAI"""
import logging
import logging.config
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, inference, explanation, patients, predictions
from .routes import analytics, reports
from .core.config import settings
from .db.base import Base
from .db.session import engine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    description="Explainable AI diagnostics with SHAP and LIME explanations",
    version=settings.API_VERSION,
)

logger.info(f"Starting {settings.API_TITLE} v{settings.API_VERSION}")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin for origin in settings.BACKEND_CORS_ORIGINS],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(inference.router)
app.include_router(explanation.router)
app.include_router(patients.router)
app.include_router(predictions.router)
app.include_router(analytics.router)
app.include_router(reports.router)


@app.on_event("startup")
async def on_startup() -> None:
    """Create database tables at startup."""
    Base.metadata.create_all(bind=engine)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Medical Dashboard XAI API",
        "version": settings.API_VERSION,
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}
