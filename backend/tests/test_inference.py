"""Tests for inference endpoints"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
import numpy as np


client = TestClient(app)


@pytest.mark.unit
def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.unit
def test_get_available_models():
    """Test getting available models"""
    response = client.get("/api/inference/models")
    assert response.status_code == 200
    data = response.json()
    assert "models" in data
    assert "cardiovascular" in data["models"]
    assert "ckd" in data["models"]


@pytest.mark.unit
def test_predict_cardiovascular():
    """Test cardiovascular disease prediction"""
    # Create sample features (13 features for cardiovascular model)
    features = [50.0, 1.0, 2.0, 120.0, 200.0, 0.0, 1.0, 150.0, 0.0, 0.5, 1.0, 0.0, 3.0]
    
    response = client.post("/api/inference/predict", json={
        "model_type": "cardiovascular",
        "features": features
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert "probability_positive" in data
    assert "risk_level" in data
    assert data["risk_level"] in ["low", "moderate", "high"]


@pytest.mark.unit
def test_predict_ckd():
    """Test chronic kidney disease prediction"""
    # Create sample features (24 features for CKD model)
    features = [50.0] * 24
    
    response = client.post("/api/inference/predict", json={
        "model_type": "ckd",
        "features": features
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert "probability_positive" in data


@pytest.mark.unit
def test_invalid_model_type():
    """Test prediction with invalid model type"""
    response = client.post("/api/inference/predict", json={
        "model_type": "invalid_model",
        "features": [1.0, 2.0, 3.0]
    })
    
    assert response.status_code == 400
