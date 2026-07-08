import React, { useEffect, useState } from 'react';
import { apiClient } from '../utils/api';

const PredictionsPage = () => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await apiClient.listPredictions(undefined, p, 20);
      // Expecting { results: [], total: n }
      if (res.results) {
        setPredictions(res.results);
      } else if (Array.isArray(res)) {
        setPredictions(res);
      }
    } catch (e) {
      console.error('Failed to load predictions', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load(page);
  }, [page]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Prediction History</h1>
      <div className="bg-white rounded shadow p-4">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-3">
            {predictions.length === 0 && <p className="text-gray-500">No predictions yet.</p>}
            {predictions.map((p) => (
              <div key={p.id} className="p-3 border rounded flex justify-between items-center">
                <div>
                  <div className="font-semibold">{p.model_type?.toUpperCase()}</div>
                  <div className="text-sm text-gray-600">Risk: {p.risk_level}</div>
                  <div className="text-sm text-gray-500">Created: {new Date(p.created_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{(p.probability * 100).toFixed(1)}%</div>
                  <button onClick={async () => {
                    try {
                      const blob = await apiClient.downloadReport(p.id);
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `report_${p.id}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                    } catch (e) {
                      console.error('Download failed', e);
                    }
                  }} className="mt-2 px-3 py-1 bg-sky-500 text-white rounded">Download Report</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={() => setPage((s) => Math.max(1, s - 1))} className="px-3 py-2 bg-gray-200 rounded">Previous</button>
        <button onClick={() => setPage((s) => s + 1)} className="px-3 py-2 bg-gray-200 rounded">Next</button>
      </div>
    </div>
  );
};

export default PredictionsPage;
