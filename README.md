# Medical Dashboard: Explainable AI for Clinical Diagnostics

A full-stack web application that demonstrates Explainable AI (XAI) in clinical diagnostics. This project combines machine learning inference with interactive explanations using SHAP and LIME frameworks.

## 🎯 Project Overview

**Research Problem**: Machine learning models in healthcare are "black boxes." Clinicians demand interpretability before trusting an AI diagnosis. This dashboard provides two types of diagnostic models (cardiovascular disease and chronic kidney disease) with detailed explanations.

**Academic Title**: "Quantifying Explanation Stability in Machine Learning Diagnostic Interfaces Using SHAP and LIME Frameworks"

## 🏗️ Project Structure

```
medical-dashboard/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── models/            # ML model implementations
│   │   ├── routes/            # API endpoints
│   │   ├── utils/             # SHAP, LIME, preprocessing
│   │   ├── core/              # Configuration, settings
│   │   ├── db/                # Database models, session
│   │   └── main.py            # FastAPI app
│   ├── data/
│   │   ├── cardiovascular/    # CVD datasets
│   │   └── ckd/               # Chronic kidney disease datasets
│   ├── tests/                 # Test suite
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile             # Production Docker image
│   └── pytest.ini             # Test configuration
├── frontend/                   # Next.js React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   └── shap/          # SHAP visualization components
│   │   ├── pages/             # Next.js pages
│   │   ├── utils/             # API client utilities
│   │   └── styles/            # Tailwind CSS styling
│   ├── package.json           # Node dependencies
│   ├── tsconfig.json          # TypeScript configuration
│   ├── Dockerfile             # Production Docker image
│   └── next.config.js         # Next.js configuration
├── research/                   # Research & evaluation
│   ├── evaluation/            # User study framework
│   └── data_analysis/         # Analysis scripts
├── docker-compose.yml         # Docker orchestration
├── .github/
│   ├── workflows/             # GitHub Actions CI/CD
│   └── copilot-instructions.md # Development guide
└── README.md                  # This file
```

## 🔧 Tech Stack

**Backend**:
- Python 3.11
- FastAPI (API framework)
- SQLAlchemy 2.0 (ORM)
- XGBoost (ML models)
- SHAP & LIME (Explainability)
- ReportLab (PDF generation)
- Pandas & NumPy (Data processing)

**Frontend**:
- React 18
- Next.js 14
- TypeScript 5.2
- Tailwind CSS (Styling)
- Plotly & Recharts (Visualizations)

**DevOps**:
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- SQLite (Default DB, configurable)

## 📋 Prerequisites

- **Python**: 3.11+
- **Node.js**: 18+ (with npm)
- **Docker**: 20.10+ (for containerized deployment)
- **Git**: For version control

## 🚀 Quick Start

### Option 1: Local Development (Recommended for Development)

#### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create Python virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Generate sample data** (optional):
   ```bash
   python data/generate_samples.py
   ```

5. **Set environment variables** (create `.env` file in backend directory):
   ```bash
   # .env file (optional, uses defaults if not provided)
   FASTAPI_ENV=development
   DATABASE_URL=sqlite:///./medical_dashboard.db
   SECRET_KEY=your-secret-key-here-change-in-production
   CORS_ORIGINS=http://localhost:3000
   ```

6. **Run development server**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   **API will be available at**:
   - Main: `http://localhost:8000`
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

#### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file** (create `.env.local`):
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

   **Frontend will be available at**: `http://localhost:3000`

### Option 2: Docker Compose (Recommended for Production)

1. **Set environment variables** (create `.env` in project root):
   ```bash
   FASTAPI_ENV=production
   DATABASE_URL=sqlite:///./medical_dashboard.db
   SECRET_KEY=your-secret-key-here-change-in-production
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

2. **Start all services**:
   ```bash
   docker-compose up -d
   ```

   **Services will be available at**:
   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:3000`

3. **View logs**:
   ```bash
   docker-compose logs -f backend  # Backend logs
   docker-compose logs -f frontend # Frontend logs
   ```

4. **Stop services**:
   ```bash
   docker-compose down
   ```

## 🌍 Environment Variables

### Backend (.env file in `backend/` or docker-compose)

| Variable | Default | Description |
|----------|---------|-------------|
| `FASTAPI_ENV` | `development` | Environment mode (`development`, `testing`, `production`) |
| `DATABASE_URL` | `sqlite:///./test.db` | Database connection string (SQLite, PostgreSQL, MySQL, etc.) |
| `SECRET_KEY` | `change-me-in-production` | Secret key for JWT token signing ⚠️ **MUST change in production** |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated CORS allowed origins |
| `API_TITLE` | `Medical Dashboard XAI API` | API title in documentation |
| `API_VERSION` | `1.0.0` | API version number |

### Frontend (.env.local in `frontend/`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | Backend API base URL (must be publicly accessible) |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login (returns JWT token)
- `GET /api/auth/profile` - Get current user profile

### Inference
- `POST /api/inference/predict` - Make a prediction
  - Request: `{ "model_type": "cardiovascular" | "ckd", "features": [...] }`
  - Response: `{ "prediction": 0|1, "probability_positive": float, "probability_negative": float, "risk_level": "low"|"medium"|"high" }`

### Explanations
- `POST /api/explanation/explain` - Get SHAP or LIME explanation
  - Request: `{ "model_type": "cardiovascular" | "ckd", "method": "shap" | "lime", "features": [...] }`
  - Response: `{ "explanation": {...}, "method": "shap" | "lime", "features": {...} }`

### Patient Management
- `GET /api/patients` - List all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/{patient_id}` - Get patient details
- `PUT /api/patients/{patient_id}` - Update patient

### Predictions
- `GET /api/predictions` - List all predictions (paginated)
- `POST /api/predictions` - Save a new prediction
- `GET /api/predictions/{prediction_id}` - Get prediction details

### Analytics
- `GET /api/analytics/summary` - Get aggregated analytics dashboard data
  - Response includes: total_predictions, disease_distribution, monthly_trends, high_risk_patients, statistics

### Reports
- `POST /api/reports/{prediction_id}/generate` - Generate PDF report
  - Response: PDF file download with prediction details and explanations

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_inference.py

# Run with coverage
pytest --cov=app tests/
```

### Frontend Tests

```bash
cd frontend

# Run linting
npm run lint

# Build for production
npm run build

# Run type checking
npm run type-check  # if available
```

## 🐳 Docker Deployment

### Build Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

### Production Deployment

1. **Set production environment variables**:
   ```bash
   FASTAPI_ENV=production
   SECRET_KEY=<generate-strong-key>
   DATABASE_URL=postgresql://user:password@host:5432/medical_dashboard
   ```

2. **Start services**:
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

3. **Verify health**:
   ```bash
   curl http://localhost:8000/health
   ```

### Health Checks

- Backend health: `GET /api/health` (returns HTTP 200 when healthy)
- Frontend: Accessible at `http://localhost:3000`

## 📊 Project Features

✅ **Multi-Model Support**: Cardiovascular and Chronic Kidney Disease diagnostics
✅ **Interactive Visualizations**: SHAP Summary, Beeswarm, Waterfall, and Force Plots
✅ **SHAP Integration**: Tree-based SHAP explanations for XGBoost
✅ **LIME Integration**: Local linear model explanations
✅ **PDF Report Generation**: Server-side PDF creation with predictions and explanations
✅ **Analytics Dashboard**: Aggregated metrics and trends
✅ **Stability Analysis**: Explanation robustness under input perturbations
✅ **User Authentication**: JWT-based authentication
✅ **Patient Management**: CRUD operations for patient records
✅ **Prediction History**: Persistent prediction storage with pagination
✅ **Docker Ready**: Production-grade containerization
✅ **CI/CD Pipeline**: GitHub Actions automated testing and building

## 🧪 Research Framework

### Evaluation Metrics

Located in `research/evaluation/`:

1. **user_study_framework.py**: Framework for conducting user studies
   - `ExplanationStabilityEvaluator`: Assess explanation consistency under noisy inputs
   - `UserStudyFramework`: Manage participant feedback collection

2. **metrics.py**: Quantitative evaluation metrics
   - Consistency Score: Stability across perturbations
   - Fidelity Score: Explanation accuracy
   - Coverage Score: Feature importance coverage
   - Faithfulness Score: Correlation with model behavior

### Running Experiments

```bash
cd backend

# Run stability analysis
python -m research.evaluation.user_study_framework
```

## 📈 Datasets

### 1. Cardiovascular Disease Dataset
- **Features**: 13 clinical indicators (age, sex, chest pain, blood pressure, cholesterol, etc.)
- **Target**: Presence/absence of heart disease (binary classification)
- **Size**: 500 synthetic samples (for demo)
- **Location**: `backend/data/cardiovascular/cardiovascular_data.csv`

### 2. Chronic Kidney Disease Dataset
- **Features**: 24 clinical measurements (blood pressure, glucose, creatinine, hemoglobin, etc.)
- **Target**: CKD stage classification
- **Size**: 500 synthetic samples (for demo)
- **Location**: `backend/data/ckd/ckd_data.csv`

## 🔬 Explanation Methods

### SHAP (SHapley Additive exPlanations)
- **Strengths**: Theoretically sound, consistent feature importance globally
- **Method**: Tree SHAP for XGBoost models
- **Output**: Exact contribution of each feature to prediction
- **Visualization**: Summary plot, beeswarm plot, waterfall plot, force plot

### LIME (Local Interpretable Model-agnostic Explanations)
- **Strengths**: Model-agnostic, locally accurate interpretations
- **Method**: Local linear approximation
- **Output**: Weights for local decision boundary
- **Visualization**: Feature importance chart

## 🔐 Clinical Use Case

**Scenario**: A clinician receives an AI recommendation for a patient with chest pain.

1. **Input**: Patient data (age, blood pressure, cholesterol, etc.)
2. **Model Output**: "60% probability of cardiovascular disease"
3. **Explanation**:
   - **SHAP**: "High cholesterol (+0.25), age (+0.15), blood pressure (+0.10) are the top contributors"
   - **LIME**: "Similar patients with high cholesterol and your age have 65% disease rate"
4. **Clinical Decision**: Physician can now make informed, explainable decisions

## 📝 Testing

Run backend tests:
```bash
cd backend
pytest tests/ -v
```

## 🔧 Troubleshooting

### Backend Issues

**Port 8000 already in use**:
```bash
# Use different port
uvicorn app.main:app --port 8001
```

**Database connection errors**:
```bash
# Check DATABASE_URL in .env
# SQLite path should exist: sqlite:///./medical_dashboard.db
```

**CORS errors in frontend**:
```bash
# Ensure CORS_ORIGINS in backend .env includes frontend URL
# Default: http://localhost:3000
```

### Frontend Issues

**API connection refused**:
```bash
# Verify NEXT_PUBLIC_API_URL in .env.local
# Ensure backend is running on port 8000
```

**Build errors**:
```bash
# Clear build cache
rm -rf .next node_modules
npm install
npm run build
```

## 🤝 Contributing

This is an academic research project. For modifications or extensions:

1. Follow PEP 8 (Python) and ESLint (JavaScript) style guidelines
2. Add docstrings to all functions
3. Update tests for new features
4. Document evaluation experiments
5. Create feature branches for all changes

## 📚 References

- Lundberg, S. M., & Lee, S. I. (2017). A Unified Approach to Interpreting Model Predictions. NIPS.
- Ribeiro, M. T., Singh, S., & Guestrin, C. (2016). "Why Should I Trust You?". KDD.
- Chen, T., & Guestrin, C. (2016). XGBoost: A Scalable Tree Boosting System. KDD.

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Authors

Medical Dashboard XAI Development Team

---

**Note**: This is a research/educational project using synthetic data for demonstration purposes. For production use with real clinical data, additional validation, regulatory compliance (HIPAA, FDA), and clinical validation is required.

**Last Updated**: 2024

