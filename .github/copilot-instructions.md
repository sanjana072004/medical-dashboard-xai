- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements
	- Confirmed: Full-stack XAI medical dashboard
	- Both cardiovascular and chronic kidney disease datasets with switcher
	- Sample model with sample data included
	- Full evaluation framework for SHAP vs LIME comparison
	- Python 3.11

- [x] Scaffold the Project
	- Created backend directory structure with FastAPI app
	- Created frontend directory structure with Next.js
	- Created research/evaluation directory with user study framework
	- Set up model factory pattern for managing diagnostic models
	- Created sample data generator
	- Implemented SHAP and LIME explanation engines

- [x] Customize the Project
	- Backend:
		* Models: CardiovascularModel, CKDModel (XGBoost-based)
		* Routes: /api/inference/predict, /api/explanation/explain
		* Utils: SHAPExplainer, LIMEExplainer, DataPreprocessor
		* Main FastAPI app with CORS support
	- Frontend:
		* Next.js configuration with API client
		* TypeScript support enabled
		* Tailwind CSS ready
	- Research:
		* ExplanationStabilityEvaluator for testing under perturbations
		* UserStudyFramework for evaluation metrics
		* ComparisonMetrics for SHAP vs LIME analysis

- [ ] Install Required Extensions
	- No VS Code extensions specified for this project

- [ ] Compile the Project
	- Backend: Requires Python dependency installation and data generation
	- Frontend: Requires npm package installation

- [ ] Create and Run Task
	- TODO: Set up dev server tasks for backend (uvicorn) and frontend (npm run dev)

- [ ] Launch the Project
	- TODO: Start backend API server (port 8000)
	- TODO: Start frontend dev server (port 3000)

- [ ] Ensure Documentation is Complete
	- README.md created with full project overview, setup instructions, and research framework details
	- copilot-instructions.md (this file) created in .github directory
	- Project is ready for development

## Next Steps

1. **Install Dependencies**:
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   python data/generate_samples.py
   
   # Frontend
   cd frontend
   npm install
   ```

2. **Start Development Servers**:
   ```bash
   # Terminal 1: Backend
   cd backend
   uvicorn app.main:app --reload
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

3. **Access the Application**:
   - API: http://localhost:8000
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8000/docs

4. **Run Research Evaluation**:
   ```bash
   cd backend
   python -m research.evaluation.user_study_framework
   ```

## Project Features

✅ **Dual Model Support**: Cardiovascular and Chronic Kidney Disease diagnostics
✅ **SHAP Integration**: Tree-based SHAP explanations for XGBoost
✅ **LIME Integration**: Local linear model explanations
✅ **Research Framework**: User study metrics and stability evaluation
✅ **Full-Stack**: FastAPI backend + Next.js/React frontend
✅ **RESTful API**: Comprehensive API with Swagger documentation
✅ **Scalable Architecture**: Factory pattern for model management
✅ **Academic Ready**: Built for "Quantifying Explanation Stability" paper

## Key Files

- Backend: [backend/app/main.py](../../backend/app/main.py)
- Models: [backend/app/models/](../../backend/app/models)
- Explaners: [backend/app/utils/](../../backend/app/utils)
- Research: [research/evaluation/](../../research/evaluation)
- Frontend: [frontend/package.json](../../frontend/package.json)
