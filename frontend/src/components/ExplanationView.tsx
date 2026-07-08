import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import { ShapSummaryPlot } from './shap/ShapSummaryPlot';
import { ShapWaterfallPlot } from './shap/ShapWaterfallPlot';
import { ShapBeeswarmPlot } from './shap/ShapBeeswarmPlot';
import { FeatureImportanceChart } from './shap/FeatureImportanceChart';

export const ExplanationView = ({ features, modelType }: { features: number[]; modelType: string }) => {
  const [explanation, setExplanation] = useState<any>(null);
  const [method, setMethod] = useState('shap');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (features.length > 0) {
      handleExplain();
    }
  }, [method]);

  const handleExplain = async () => {
    if (features.length === 0) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.explain(modelType, features, method);
      setExplanation(result);
    } catch (error) {
      console.error('Explanation error:', error);
      setError(error instanceof Error ? error.message : 'Explanation failed');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 border rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Explanation Analysis</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Explanation Method</label>
        <select 
          value={method} 
          onChange={(e) => setMethod(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="shap">SHAP</option>
          <option value="lime">LIME</option>
        </select>
      </div>

      {explanation && (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded">
            <p className="text-sm text-gray-600">Method: {explanation.method}</p>
            <p className="mt-2">Model output: {(explanation.explanation.model_output * 100).toFixed(1)}%</p>
            {explanation.method === 'LIME' && explanation.explanation.local_explanation && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">LIME Local Explanation</h4>
                <div className="space-y-2 max-h-72 overflow-auto pr-2">
                  {Object.entries(explanation.explanation.local_explanation)
                    .sort(([, a], [, b]) => Math.abs(Number(b)) - Math.abs(Number(a)))
                    .map(([feature, weight]) => (
                      <div key={feature} className="flex items-center justify-between text-sm bg-white rounded px-3 py-2 border">
                        <span className="mr-3">{feature}</span>
                        <span className={Number(weight) >= 0 ? 'text-green-700' : 'text-red-700'}>
                          {Number(weight).toFixed(4)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
            <FeatureImportanceChart explanation={explanation.explanation} />
          </div>

          <div className="space-y-4">
            <ShapSummaryPlot explanation={explanation.explanation} />
            <ShapWaterfallPlot explanation={explanation.explanation} />
            <ShapBeeswarmPlot explanation={explanation.explanation} feature_values={features} />
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-3">
        <button 
          onClick={handleExplain} 
          disabled={loading || features.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? 'Explaining...' : 'Get Explanation'}
        </button>

        <a href="#" onClick={async (e) => { e.preventDefault(); if (!explanation) return; const blob = await apiClient.downloadReport(0).catch(()=>null); }} className="px-4 py-2 bg-sky-500 text-white rounded">Export Report</a>
      </div>

      {error && (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
};
