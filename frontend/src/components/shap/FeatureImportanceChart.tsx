import dynamic from 'next/dynamic';
import React from 'react';
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export const FeatureImportanceChart = ({ explanation }: { explanation: any }) => {
  if (!explanation || !explanation.shap_values) return null;
  const vals = explanation.shap_values as number[];
  const names = explanation.feature_names as string[];
  const absVals = vals.map((v) => Math.abs(v));
  const sorted = names.map((n, i) => ({ name: n, val: absVals[i] })).sort((a, b) => b.val - a.val);
  return (
    <div>
      <h4 className="font-semibold mb-2">Feature Importance</h4>
      <Plot data={[{ x: sorted.map(s => s.val), y: sorted.map(s => s.name), type: 'bar', orientation: 'h', marker: { color: 'rgba(99,102,241,0.85)' } }]} layout={{ margin: { l: 140, r: 20, t: 20, b: 40 }, height: Math.min(400, sorted.length * 30) }} />
    </div>
  );
};
