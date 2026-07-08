import dynamic from 'next/dynamic';
import React from 'react';
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export const ShapBeeswarmPlot = ({ explanation, feature_values }: { explanation: any, feature_values?: number[] }) => {
  if (!explanation || !explanation.shap_values) return null;
  const vals = explanation.shap_values as number[];
  const names = explanation.feature_names as string[];

  // For single-instance, show each feature as a scatter point with shap on x and feature index on y
  const x = vals;
  const y = names;
  const marker = { size: 12, color: vals.map((v) => v > 0 ? 'rgba(239,68,68,0.9)' : 'rgba(34,197,94,0.9)') };

  return (
    <div>
      <h4 className="font-semibold mb-2">SHAP Beeswarm (single instance)</h4>
      <Plot data={[{ x, y, mode: 'markers', marker, type: 'scatter' }]} layout={{ margin: { l: 140, r: 20, t: 20, b: 40 }, height: Math.min(400, y.length * 30) }} />
    </div>
  );
};
