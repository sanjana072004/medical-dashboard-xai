import React, { useEffect, useState } from 'react';
import { apiClient } from '../utils/api';

const AnalyticsPage = () => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.analyticsSummary();
      setAnalytics(res);
      // if backend doesn't return recent items, keep predictions empty
      setPredictions(res.recent_predictions || []);
    } catch (e) {
      console.error('Failed to load analytics', e);
    }
    setLoading(false);
  };

  const byModel = analytics?.disease_distribution || {};
  const byRisk = analytics?._risk_counts || analytics?.prediction_stats?.by_risk || {};

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Analytics Dashboard</h1>
        <p className="text-gray-600 mb-6">Summary metrics from recent predictions.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <h3 className="font-semibold mb-3">Predictions by Model</h3>
            {loading ? <p>Loading...</p> : (
              <ul className="space-y-2">
                {analytics && Object.entries(byModel).map(([k, v]: any) => (
                  <li key={k} className="flex justify-between">
                    <span className="capitalize">{k}</span>
                    <span className="font-semibold">{v}</span>
                  </li>
                ))}
                {(!analytics || Object.keys(byModel).length === 0) && <li className="text-gray-500">No data yet</li>}
              </ul>
            )}
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3 className="font-semibold mb-3">Predictions by Risk Level</h3>
            {loading ? <p>Loading...</p> : (
              <ul className="space-y-2">
                {analytics && Object.entries(analytics.prediction_stats_by_risk || byRisk).map(([k, v]: any) => (
                  <li key={k} className="flex justify-between">
                    <span className="capitalize">{k}</span>
                    <span className="font-semibold">{v}</span>
                  </li>
                ))}
                {(!analytics || Object.keys(byRisk).length === 0) && <li className="text-gray-500">No data yet</li>}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white p-6 rounded shadow">
          <h3 className="font-semibold mb-3">Recent Predictions</h3>
          <div className="space-y-3">
            {predictions.slice(0, 20).map((p) => (
              <div key={p.id} className="p-3 border rounded flex justify-between">
                <div>
                  <div className="font-semibold">{p.model_type?.toUpperCase()}</div>
                  <div className="text-sm text-gray-500">{new Date(p.created_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{(p.probability_positive * 100).toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">{p.risk_level}</div>
                </div>
              </div>
            ))}
            {predictions.length === 0 && <p className="text-gray-500">No recent predictions.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
