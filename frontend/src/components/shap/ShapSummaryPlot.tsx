import dynamic from 'next/dynamic';
import React from 'react';
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export const ShapSummaryPlot = ({ explanation }: { explanation: any }) => {
  if (!explanation || !explanation.shap_values) return null;
  const vals = explanation.shap_values as number[];
  const names = explanation.feature_names as string[];
  const absVals = vals.map((v) => Math.abs(v));
  const sortedIdx = absVals.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v).map((x) => x.i);
  const x = sortedIdx.map((i) => absVals[i]);
  const y = sortedIdx.map((i) => names[i]);

  return (
    <div>
      <h4 className="font-semibold mb-2">SHAP Feature Importance (summary)</h4>
      <Plot data={[{ x, y, type: 'bar', orientation: 'h', marker: { color: 'rgba(99,102,241,0.9)' } }]} layout={{ margin: { l: 140, r: 20, t: 20, b: 40 }, height: Math.min(400, y.length * 30) }} />
    </div>
  );
};
