import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { apiClient } from '@/utils/api';
import Link from 'next/link';

export default function PatientDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [patient, setPatient] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const patientData = await apiClient.getPatient(Number(id));
        setPatient(patientData);
        const predictionResponse = await apiClient.listPredictions(Number(id), 1, 10);
        setHistory(predictionResponse.items);
      } catch (err: any) {
        setError(err.message || 'Unable to load patient');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Patient details</p>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Patient summary</h1>
          </div>
          <Link href="/patients">
            <a className="rounded-3xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition">
              Back to patients
            </a>
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-lg border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400">Loading patient record…</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-rose-50 dark:bg-rose-900/20 p-6 text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-700">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-lg border border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Patient profile</h2>
              <div className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Name</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{patient.first_name} {patient.last_name}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Date of birth</p>
                    <p className="mt-2">{patient.date_of_birth || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Gender</p>
                    <p className="mt-2">{patient.gender || 'Unknown'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Clinical data</p>
                  <pre className="mt-3 overflow-x-auto rounded-3xl bg-slate-50 p-4 text-xs text-slate-700 dark:bg-slate-950 dark:text-slate-200">{JSON.stringify(patient.clinical_data, null, 2)}</pre>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Notes</p>
                  <p className="mt-2 text-slate-700 dark:text-slate-200">{patient.notes || 'No notes available'}</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-lg border border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Prediction history</h2>
              {history.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No predictions recorded for this patient yet.</p>
              ) : (
                <div className="mt-6 space-y-4">
                  {history.map((record) => (
                    <div key={record.id} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{record.model_type} prediction</p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Result: {record.prediction ? 'Positive' : 'Negative'}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Risk: {(record.probability * 100).toFixed(1)}%</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">Recorded on: {new Date(record.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </AppShell>
  );
}
