import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { apiClient } from '../utils/api';

interface Prediction {
  model_type: string;
  prediction: number;
  probability_negative: number;
  probability_positive: number;
  risk_level: string;
}

interface Explanation {
  model_type: string;
  method: string;
  explanation: any;
  features: Record<string, number>;
}

interface PatientInputData {
  age: string;
  bp: string;
  cholesterol: string;
  glucose: string;
  bmi: string;
}

const Dashboard = () => {
  const router = useRouter();
  const [modelType, setModelType] = useState('cardiovascular');
  const [method, setMethod] = useState('shap');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [error, setError] = useState('');
  const [patientData, setPatientData] = useState<PatientInputData>({
    age: '',
    bp: '',
    cholesterol: '',
    glucose: '',
    bmi: '',
  });

  const sampleData = {
    cardiovascular: [50, 1, 2, 120, 200, 0, 1, 150, 0, 0.5, 1, 0, 3],
    ckd: [50, 110, 1.015, 0, 0, 1, 0, 0, 0, 128, 22, 0.8, 140, 3.5, 13, 40, 7500, 4, 1, 0, 1, 1, 0, 1]
  };

  const parseNumberField = (label: string, value: string): number => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new Error(`Please enter a valid number for ${label}`);
    }
    return parsed;
  };

  const buildFeatureVector = (currentModelType: string, data: PatientInputData): number[] => {
    const age = parseNumberField('Age', data.age);
    const bp = parseNumberField('Blood Pressure', data.bp);
    const cholesterol = parseNumberField('Cholesterol', data.cholesterol);
    const glucose = parseNumberField('Glucose', data.glucose);
    const bmi = parseNumberField('BMI', data.bmi);

    if (currentModelType === 'ckd') {
      const featureVector = [...sampleData.ckd];
      featureVector[0] = age;
      featureVector[1] = bp;
      featureVector[9] = glucose;
      featureVector[11] = Math.max(0.1, Math.min(15, bmi / 30));
      return featureVector;
    }

    const featureVector = [...sampleData.cardiovascular];
    featureVector[0] = age;
    featureVector[3] = bp;
    featureVector[4] = cholesterol;
    featureVector[5] = glucose >= 120 ? 1 : 0;
    featureVector[9] = Math.max(0, Math.min(6, (bmi - 18.5) / 5));
    return featureVector;
  };

  useEffect(() => {
    if (router.query.model) {
      setModelType(router.query.model as string);
    }
  }, [router.query.model]);

  const handlePredict = async () => {
    setLoading(true);
    setError('');
    try {
      const features = buildFeatureVector(modelType, patientData);
      const pred = await apiClient.predict(modelType, features);
      setPrediction(pred);

      const exp = await apiClient.explain(modelType, features, method);
      setExplanation(exp);
      try {
        await apiClient.createPrediction({
          patient_id: null,
          model_type: modelType,
          features,
          prediction: pred.prediction,
          probability_negative: pred.probability_negative,
          probability_positive: pred.probability_positive,
          risk_level: pred.risk_level,
          model_metadata: {},
        });
      } catch (saveErr) {
        console.warn('Failed to save prediction:', saveErr);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get prediction');
    }
    setLoading(false);
  };

  const getRiskColor = (level: string | undefined) => {
    if (!level) return 'bg-gray-100 text-gray-800';
    const lowerLevel = level.toLowerCase();
    if (lowerLevel === 'low') return 'bg-green-100 text-green-800';
    if (lowerLevel === 'moderate') return 'bg-yellow-100 text-yellow-800';
    if (lowerLevel === 'high') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">Medical Dashboard XAI</h1>
          <p className="text-xl text-gray-600">Explainable AI for Clinical Diagnostics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Configuration</h2>
              <input
                placeholder="Age"
                value={patientData.age}
                onChange={(e) => setPatientData({ ...patientData, age: e.target.value })}
                className="w-full mb-3 px-3 py-2 border rounded"
              />

              <input
                placeholder="Blood Pressure"
                value={patientData.bp}
                onChange={(e) => setPatientData({ ...patientData, bp: e.target.value })}
                className="w-full mb-3 px-3 py-2 border rounded"
              />

              <input
                placeholder="Cholesterol"
                value={patientData.cholesterol}
                onChange={(e) => setPatientData({ ...patientData, cholesterol: e.target.value })}
                className="w-full mb-3 px-3 py-2 border rounded"
              />

              <input
                placeholder="Glucose"
                value={patientData.glucose}
                onChange={(e) => setPatientData({ ...patientData, glucose: e.target.value })}
                className="w-full mb-3 px-3 py-2 border rounded"
              />

              <input
                placeholder="BMI"
                value={patientData.bmi}
                onChange={(e) => setPatientData({ ...patientData, bmi: e.target.value })}
                className="w-full mb-3 px-3 py-2 border rounded"
              />

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Model</label>
                <select
                  value={modelType}
                  onChange={(e) => {
                    setModelType(e.target.value);
                    setPrediction(null);
                    setExplanation(null);
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="cardiovascular">Cardiovascular Disease</option>
                  <option value="ckd">Chronic Kidney Disease</option>
                </select>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Explanation Method</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="shap"
                      checked={method === 'shap'}
                      onChange={(e) => setMethod(e.target.value)}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="text-gray-700">SHAP (Theoretical)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="lime"
                      checked={method === 'lime'}
                      onChange={(e) => setMethod(e.target.value)}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="text-gray-700">LIME (Local)</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handlePredict}
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Analyzing...' : 'Run Prediction'}
              </button>

              {error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {prediction && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Prediction Result</h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600 mb-1">Negative Probability</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {(prediction.probability_negative * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600 mb-1">Positive Probability</p>
                    <p className="text-2xl font-bold text-red-600">
                      {(prediction.probability_positive * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Risk Level</p>
                  <div className={`inline-block px-6 py-3 rounded-full font-bold text-lg ${getRiskColor(prediction.risk_level)}`}>
                    {prediction.risk_level ? prediction.risk_level.toUpperCase() : 'UNKNOWN'}
                  </div>
                </div>
              </div>
            )}

            {explanation && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  {method.toUpperCase()} Explanation
                </h3>

                {method === 'shap' && explanation.explanation.shap_values && (
                  <div>
                    <div className="mb-4 p-4 bg-blue-50 rounded">
                      <p className="text-sm text-gray-600 mb-1">Base Value (Expected Model Output)</p>
                      <p className="text-lg font-semibold text-blue-900">
                        {(explanation.explanation.base_value * 100).toFixed(2)}%
                      </p>
                    </div>

                    <p className="text-sm font-semibold text-gray-700 mb-3">Feature Contributions:</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {explanation.explanation.shap_values.map((value: number, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <span className="text-sm font-medium text-gray-700">
                            {explanation.explanation.feature_names[idx]}
                          </span>
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-6 rounded ${value > 0 ? 'bg-red-200' : 'bg-green-200'}`}
                              style={{ width: `${Math.min(100, Math.abs(value) * 50)}px` }}
                            />
                            <span className="text-sm font-semibold text-gray-900 min-w-16">
                              {(value * 100).toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {method === 'lime' && explanation.explanation.local_explanation && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">Local Feature Weights:</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {Object.entries(explanation.explanation.local_explanation).map(([feat, weight]: [string, any]) => (
                        <div key={feat} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <span className="text-sm font-medium text-gray-700">{feat}</span>
                          <span className={`text-sm font-semibold ${weight > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {weight.toFixed(4)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!prediction && (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <p className="text-gray-500 text-lg">Click "Run Prediction" to analyze patient data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
