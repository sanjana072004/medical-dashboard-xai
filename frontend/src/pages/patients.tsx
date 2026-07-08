import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PatientForm } from '@/components/patients/PatientForm';
import { PatientList } from '@/components/patients/PatientList';
import { apiClient } from '@/utils/api';
import { ToastMessage } from '@/components/ui/ToastMessage';

const PAGE_SIZE = 10;

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await apiClient.listPatients(query, page, PAGE_SIZE);
      setPatients(response.items);
      setTotal(response.total);
    } catch (err: any) {
      setNotification({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [query, page]);

  const onCreatePatient = async (data: any) => {
    try {
      await apiClient.createPatient(data);
      setNotification({ message: 'Patient created successfully', type: 'success' });
      setShowForm(false);
      setSelectedPatient(null);
      fetchPatients();
    } catch (err: any) {
      setNotification({ message: err.message, type: 'error' });
    }
  };

  const onUpdatePatient = async (data: any) => {
    if (!selectedPatient) return;
    try {
      await apiClient.updatePatient(selectedPatient.id, data);
      setNotification({ message: 'Patient updated successfully', type: 'success' });
      setShowForm(false);
      setSelectedPatient(null);
      fetchPatients();
    } catch (err: any) {
      setNotification({ message: err.message, type: 'error' });
    }
  };

  const onDeletePatient = async (patientId: number) => {
    if (!confirm('Remove this patient from your list?')) return;
    try {
      await apiClient.deletePatient(patientId);
      setNotification({ message: 'Patient deleted successfully', type: 'success' });
      fetchPatients();
    } catch (err: any) {
      setNotification({ message: err.message, type: 'error' });
    }
  };

  const pageCount = useMemo(() => Math.ceil(total / PAGE_SIZE), [total]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Patient management</p>
            <h2 className="text-3xl font-semibold">Manage your patient records</h2>
          </div>
          <button
            onClick={() => {
              setSelectedPatient(null);
              setShowForm(true);
            }}
            className="inline-flex items-center justify-center rounded-3xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700 transition"
          >
            Add Patient
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="space-y-4">
            <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-lg border border-slate-200 dark:border-slate-800">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Active patients</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Search, filter, and review patient history quickly.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search patients by name"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-lg border border-slate-200 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">Loading patient records...</p>
              </div>
            ) : (
              <PatientList
                patients={patients}
                onEdit={(patient) => {
                  setSelectedPatient(patient);
                  setShowForm(true);
                }}
                onDelete={onDeletePatient}
                onView={(id) => window.alert(`Patient detail page coming soon: ${id}`)}
              />
            )}

            <div className="flex flex-col items-center justify-between gap-3 rounded-3xl bg-white dark:bg-slate-900 p-4 text-sm text-slate-500 dark:text-slate-400 shadow-lg border border-slate-200 dark:border-slate-800 md:flex-row">
              <p>
                Showing {patients.length} of {total} patients
              </p>
              <div className="inline-flex gap-2">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, pageCount))}
                  disabled={page === pageCount}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 transition"
                >
                  Next
                </button>
              </div>
            </div>
          </section>

          {showForm && (
            <section className="space-y-4">
              <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{selectedPatient ? 'Update patient record' : 'New patient'}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Save patient details securely in the care system.</p>
                  </div>
                </div>
              </div>
              <PatientForm
                initialData={selectedPatient || undefined}
                onSubmit={selectedPatient ? onUpdatePatient : onCreatePatient}
                onCancel={() => {
                  setShowForm(false);
                  setSelectedPatient(null);
                }}
                buttonLabel={selectedPatient ? 'Save changes' : 'Add patient'}
              />
            </section>
          )}
        </div>
      </div>
      {notification && (
        <div className="fixed bottom-8 right-8 z-50">
          <ToastMessage message={notification.message} type={notification.type} />
        </div>
      )}
    </AppShell>
  );
}
