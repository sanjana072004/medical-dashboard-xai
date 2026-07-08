import React, { useState } from 'react';
import { apiClient } from '../utils/api';
import { ExplanationView } from '../components/ExplanationView';

const ExplainabilityPage = () => {
  const [modelType, setModelType] = useState('cardiovascular');
  const [features, setFeatures] = useState<number[]>([]);
  const [rawInputs, setRawInputs] = useState<string>('');

  const handleSetFeatures = () => {
    // Accept comma-separated numbers
    const vals = rawInputs
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => Number(s));
    if (vals.length === 0) {
      alert('Please enter valid comma-separated numbers');
      return;
    }
    setFeatures(vals);
  };

  const exportReport = async () => {
    if (features.length === 0) return;
    try {
      const pred = await apiClient.predict(modelType, features);
      const exp = await apiClient.explain(modelType, features, 'shap');
      const html = `
        <html>
        <head>
          <title>Explainability Report</title>
          <style>body{font-family:Arial;padding:20px} .card{border:1px solid #ddd;padding:12px;border-radius:6px;margin-bottom:10px}</style>
        </head>
        <body>
          <h1>Explainability Report</h1>
          <div class="card"><strong>Model:</strong> ${modelType}</div>
          <div class="card"><strong>Features:</strong> ${features.join(', ')}</div>
          <div class="card"><strong>Prediction:</strong> ${pred.prediction} (${((pred.probability_positive || 0)*100).toFixed(1)}% positive)</div>
          <div class="card"><strong>Explanation (SHAP):</strong><pre>${JSON.stringify(exp.explanation, null, 2)}</pre></div>
        </body>
        </html>
      `;
      const w = window.open('', '_blank');
      if (!w) return;
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => w.print(), 500);
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Explainable AI Dashboard</h1>
        <p className="text-gray-600 mb-6">Run SHAP or LIME explanations for model predictions.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <label className="block text-sm font-medium mb-2">Select Model</label>
            <select value={modelType} onChange={(e) => setModelType(e.target.value)} className="w-full p-2 border rounded mb-4">
              <option value="cardiovascular">Cardiovascular</option>
              <option value="ckd">Chronic Kidney Disease</option>
            </select>

            <label className="block text-sm font-medium mb-2">Feature Vector (comma separated)</label>
            <textarea
              value={rawInputs}
              onChange={(e) => setRawInputs(e.target.value)}
              placeholder="e.g. 50, 120, 200, 90, 25"
              className="w-full p-2 border rounded h-32"
            />

            <button onClick={handleSetFeatures} className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded">Load Features</button>
          </div>

          <div className="lg:col-span-2">
            <ExplanationView features={features} modelType={modelType} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplainabilityPage;
