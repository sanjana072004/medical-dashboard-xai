import React, { useState } from 'react';
import { apiClient } from '../utils/api';

function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((s, v, i) => s + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

function spearmanRankCorrelation(a: number[], b: number[]) {
  // compute ranks
  const rank = (arr: number[]) => {
    const sorted = arr.slice().map((v, i) => ({ v, i })).sort((x, y) => x.v - y.v);
    const ranks = Array(arr.length).fill(0);
    for (let i = 0; i < sorted.length; i++) ranks[sorted[i].i] = i + 1;
    return ranks;
  };
  const ra = rank(a);
  const rb = rank(b);
  const n = a.length;
  const d2sum = ra.reduce((s, _, i) => s + Math.pow(ra[i] - rb[i], 2), 0);
  return 1 - ((6 * d2sum) / (n * (n * n - 1)));
}

function topKOverlap(a: number[], b: number[], k = 3) {
  const idxA = a.map((v, i) => ({ v, i })).sort((x, y) => Math.abs(y.v) - Math.abs(x.v)).slice(0, k).map((x) => x.i);
  const idxB = b.map((v, i) => ({ v, i })).sort((x, y) => Math.abs(y.v) - Math.abs(x.v)).slice(0, k).map((x) => x.i);
  const setA = new Set(idxA);
  const overlap = idxB.filter((i) => setA.has(i)).length;
  return overlap / k;
}

const StabilityPage = () => {
  const [modelType, setModelType] = useState('cardiovascular');
  const [method, setMethod] = useState<'shap' | 'lime'>('shap');
  const [runBoth, setRunBoth] = useState(false);
  const [raw, setRaw] = useState('');
  const [iterations, setIterations] = useState(20);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const noiseLevels = [0.01, 0.03, 0.05, 0.1];

  const run = async () => {
    const base = raw.split(',').map((s) => Number(s.trim())).filter((x) => !isNaN(x));
    if (base.length === 0) return;
    setRunning(true);
    setResults([]);
    try {
      const methodsToRun = runBoth ? ['shap', 'lime'] : [method];
      const overall: any = {};
      for (const m of methodsToRun) {
        overall[m] = { noise_levels: {} };
        const baseExp = (await apiClient.explain(modelType, base, m)).explanation;
        const baseVals: number[] = (baseExp.shap_values || Object.values(baseExp.local_explanation || {}).map((v: any) => Number(v))) || [];
        for (const nl of noiseLevels) {
          const metrics: any[] = [];
          const samples: any[] = [];
          for (let i = 0; i < iterations; i++) {
            const noisy = base.map((v) => v * (1 + (Math.random() * 2 - 1) * nl));
            const exp = (await apiClient.explain(modelType, noisy, m)).explanation;
            const vals: number[] = exp.shap_values || Object.values(exp.local_explanation || {}).map((v: any) => Number(v)) || [];
            const cos = cosineSimilarity(baseVals, vals);
            const spr = spearmanRankCorrelation(baseVals, vals);
            const jacc = topKOverlap(baseVals, vals, Math.min(3, baseVals.length || 3));
            metrics.push({ cos, spr, jacc });
            samples.push({ noisy, cos, spr, jacc });
            setResults((r) => [...r, { method: m, noisy, cos, spr, jacc }]);
          }
          const avg = metrics.reduce((acc, mm) => { acc.cos += mm.cos; acc.spr += mm.spr; acc.jacc += mm.jacc; return acc; }, { cos: 0, spr: 0, jacc: 0 });
          overall[m].noise_levels[nl] = {
            avg_cosine: avg.cos / metrics.length,
            avg_spearman: avg.spr / metrics.length,
            avg_jaccard: avg.jacc / metrics.length,
            samples,
          };
        }
      }
      setSummary(overall);
    } catch (e) {
      console.error('Stability run failed', e);
    }
    setRunning(false);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-3">Explanation Stability Analysis</h1>
        <p className="text-gray-600 mb-6">Perturb features and measure explanation stability (cosine, Spearman, top-k overlap).</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded shadow">
            <label className="block text-sm font-medium mb-2">Model</label>
            <select value={modelType} onChange={(e) => setModelType(e.target.value)} className="w-full p-2 border rounded mb-3">
              <option value="cardiovascular">Cardiovascular</option>
              <option value="ckd">CKD</option>
            </select>

            <label className="block text-sm font-medium mb-2">Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as any)} className="w-full p-2 border rounded mb-3">
              <option value="shap">SHAP</option>
              <option value="lime">LIME</option>
            </select>

            <label className="inline-flex items-center gap-2 mb-3">
              <input type="checkbox" checked={runBoth} onChange={(e) => setRunBoth(e.target.checked)} />
              <span className="text-sm">Run both SHAP and LIME</span>
            </label>

            <label className="block text-sm font-medium mb-2">Base Features (comma separated)</label>
            <textarea value={raw} onChange={(e) => setRaw(e.target.value)} className="w-full p-2 border rounded h-28 mb-3" placeholder="50, 120, 200, 90, 25" />

            <label className="block text-sm font-medium mb-2">Iterations per noise level</label>
            <input type="number" value={iterations} onChange={(e) => setIterations(Number(e.target.value))} className="w-full p-2 border rounded mb-3" />

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Noise levels to run</label>
              <div className="flex gap-2 flex-wrap">
                {noiseLevels.map((n) => (
                  <div key={n} className="px-2 py-1 bg-gray-100 rounded">{(n*100).toFixed(0)}%</div>
                ))}
              </div>
            </div>

            <button onClick={run} disabled={running} className="w-full px-4 py-2 bg-indigo-600 text-white rounded">{running ? 'Running...' : 'Run Stability Analysis'}</button>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded shadow">
            <h3 className="font-semibold mb-2">Summary</h3>
            {summary ? (
              <div className="mb-3">
                <button onClick={() => { const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'stability_summary.json'; a.click(); URL.revokeObjectURL(url); }} className="px-3 py-2 bg-sky-500 text-white rounded mb-3">Export Results (JSON)</button>
              <div className="mb-4">
                {Object.entries(summary).map(([methodName, methodObj]: any) => (
                  <div key={methodName} className="mb-4">
                    <h4 className="font-semibold mb-2">Method: {methodName.toUpperCase()}</h4>
                    <table className="w-full text-sm border">
                      <thead>
                        <tr className="bg-gray-100"><th className="p-2">Noise</th><th className="p-2">Avg Cosine</th><th className="p-2">Avg Spearman</th><th className="p-2">Avg Jaccard</th></tr>
                      </thead>
                      <tbody>
                        {Object.entries(methodObj.noise_levels).map(([nl, val]: any) => (
                          <tr key={nl} className="border-t"><td className="p-2">{(Number(nl)*100).toFixed(0)}%</td><td className="p-2">{val.avg_cosine.toFixed(3)}</td><td className="p-2">{val.avg_spearman.toFixed(3)}</td><td className="p-2">{val.avg_jaccard.toFixed(3)}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No results yet.</p>
            )}

            <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
              {results.map((r, idx) => (
                <div key={idx} className="p-3 border rounded grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Noisy features</div>
                    <div className="font-mono text-xs">{r.noisy.join(', ')}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Cosine</div>
                    <div className="font-semibold">{r.cos.toFixed(3)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Spearman / Top-k</div>
                    <div className="font-semibold">{r.spr.toFixed(3)} / {r.top.toFixed(3)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StabilityPage;
