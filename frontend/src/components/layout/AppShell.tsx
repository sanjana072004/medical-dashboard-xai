import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const navLinks = [
  { href: '/patients', label: 'Patients' },
  { href: '/dashboard', label: 'Prediction Hub' },
  { href: '/explainability', label: 'Explainability' },
  { href: '/stability', label: 'Stability' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/predictions', label: 'History' },
];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('medical-dashboard-theme') : null;
    setDarkMode(stored === 'dark');
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', darkMode);
      localStorage.setItem('medical-dashboard-theme', darkMode ? 'dark' : 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="lg:flex lg:min-h-screen">
        <aside className="w-full lg:w-80 xl:w-72 bg-white/90 dark:bg-slate-900/95 backdrop-blur border-r border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs text-sky-500 uppercase font-semibold tracking-[0.24em]">Clinical AI</p>
              <h1 className="mt-2 text-2xl font-semibold">CareInsight</h1>
            </div>
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 p-2 text-slate-700 dark:text-slate-200"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>

          <nav className="space-y-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`block rounded-3xl px-4 py-3 text-sm font-medium transition ${router.pathname === link.href ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-10 rounded-3xl bg-slate-50 dark:bg-slate-800 p-5 shadow-inner border border-slate-200 dark:border-slate-700">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400 mb-3">Signed in as</p>
            <p className="font-semibold">{user?.full_name || user?.email}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Role: {user?.role}</p>
            <button
              onClick={logout}
              className="mt-4 w-full rounded-3xl bg-rose-500 text-white py-2 text-sm font-semibold hover:bg-rose-600 transition"
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6 lg:p-10">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, {user?.full_name || 'Clinician'}.</p>
              <h2 className="text-3xl font-semibold mt-2">Patient care dashboard</h2>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};
