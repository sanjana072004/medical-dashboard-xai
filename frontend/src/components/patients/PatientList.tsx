type Patient = {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: string;
  clinical_data: Record<string, any>;
  notes?: string;
  created_at: string;
};

type PatientListProps = {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (patientId: number) => void;
  onView: (patientId: number) => void;
};

export const PatientList = ({ patients, onEdit, onDelete, onView }: PatientListProps) => {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-950">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Patient</th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">DOB</th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Gender</th>
            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {patients.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                No patients found.
              </td>
            </tr>
          ) : (
            patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{patient.first_name} {patient.last_name}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{Object.keys(patient.clinical_data).length} data points</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{patient.date_of_birth || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{patient.gender || 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => onView(patient.id)} className="rounded-2xl bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition">
                    View
                  </button>
                  <button onClick={() => onEdit(patient)} className="rounded-2xl bg-sky-600 px-3 py-2 text-white hover:bg-sky-700 transition">
                    Edit
                  </button>
                  <button onClick={() => onDelete(patient.id)} className="rounded-2xl bg-rose-500 px-3 py-2 text-white hover:bg-rose-600 transition">
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
