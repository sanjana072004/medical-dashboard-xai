import { useState } from 'react';

type PatientFormProps = {
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onCancel: () => void;
  buttonLabel: string;
};

export const PatientForm = ({ initialData, onSubmit, onCancel, buttonLabel }: PatientFormProps) => {
  const [firstName, setFirstName] = useState(initialData?.first_name || '');
  const [lastName, setLastName] = useState(initialData?.last_name || '');
  const [dateOfBirth, setDateOfBirth] = useState(initialData?.date_of_birth || '');
  const [gender, setGender] = useState(initialData?.gender || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [clinicalData, setClinicalData] = useState(JSON.stringify(initialData?.clinical_data || {}, null, 2));
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!firstName || !lastName) {
      setError('First name and last name are required.');
      return;
    }

    try {
      const parsedClinicalData = clinicalData ? JSON.parse(clinicalData) : {};
      onSubmit({
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        gender,
        notes,
        clinical_data: parsedClinicalData,
      });
    } catch (err) {
      setError('Clinical data must be valid JSON.');
    }
  };

  return (
    <div className="space-y-4 rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-lg border border-slate-200 dark:border-slate-800">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">First Name</span>
          <input
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Last Name</span>
          <input
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Date of Birth</span>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(event) => setDateOfBirth(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Gender</span>
          <select
            value={gender}
            onChange={(event) => setGender(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value="">Select</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Notes</span>
        <textarea
          value={notes}
          rows={3}
          onChange={(event) => setNotes(event.target.value)}
          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Clinical Data (JSON)</span>
        <textarea
          value={clinicalData}
          rows={5}
          onChange={(event) => setClinicalData(event.target.value)}
          className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
      </label>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button onClick={onCancel} className="rounded-3xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="rounded-3xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-700 transition"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
};
