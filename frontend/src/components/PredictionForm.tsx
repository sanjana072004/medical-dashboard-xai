import React, { useState } from 'react';
import { apiClient } from '../utils/api';

export const PredictionForm = () => {
  const [modelType, setModelType] = useState('cardiovascular');
  const [features, setFeatures] = useState<number[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const result = await apiClient.predict(modelType, features);
      setPrediction(result);
    } catch (error) {
      console.error('Prediction error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 border rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Diagnostic Prediction</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Model Type</label>
        <select 
          value={modelType} 
          onChange={(e) => setModelType(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="cardiovascular">Cardiovascular Disease</option>
          <option value="ckd">Chronic Kidney Disease</option>
        </select>
      </div>

      {prediction && (
        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h3 className="font-bold mb-2">Prediction Results</h3>
          <p>Risk Level: <span className="font-bold">{prediction.risk_level}</span></p>
          <p>Positive Probability: {(prediction.probability_positive * 100).toFixed(1)}%</p>
        </div>
      )}

      <button 
        onClick={handlePredict} 
        disabled={loading}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Loading...' : 'Get Prediction'}
      </button>
    </div>
  );
};
