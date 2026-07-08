import dynamic from 'next/dynamic';
import React from 'react';
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export const ShapWaterfallPlot = ({ explanation }: { explanation: any }) => {
  if (!explanation || !explanation.shap_values) return null;
  const vals = explanation.shap_values as number[];
  const names = explanation.feature_names as string[];
  const base = explanation.base_value || 0;
  const contribs = vals;
  const measures = ['relative'].concat(Array(contribs.length).fill('relative'));
  const x = ['base'].concat(names.map((n) => n));
  const y = [base].concat(contribs);

  // Use waterfall via bar stacking to show cumulative
  const cumulative = [] as number[];
  let acc = base;
  cumulative.push(acc);
  for (let v of contribs) { acc += v; cumulative.push(acc); }

  return (
    <div>
      <h4 className="font-semibold mb-2">SHAP Waterfall</h4>
      <Plot data={[{ x: x, y: y, type: 'waterfall', measure: ['absolute'].concat(Array(contribs.length).fill('relative')), text: y.map((v) => v.toFixed(3)) } as any]} layout={{ margin: { l: 60, r: 20, t: 20, b: 80 }, height: 360 }} />
    </div>
  );
};
