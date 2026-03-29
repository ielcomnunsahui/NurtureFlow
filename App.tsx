import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { AuthState, Nurse, UserRole } from './types';
import Login from './components/Login';
import NurseDashboard from './components/NurseDashboard';
import PatientForm from './components/PatientForm';
import PatientDetails from './components/PatientDetails';
import { Heart, LogOut, LayoutDashboard, UserPlus, Loader2, Moon, Sun } from 'lucide-react';
import { cn } from './lib/utils';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    loading: true
  });
  const [view, setView] = useState<'DASHBOARD' | 'ADD_PATIENT' | 'PATIENT_DETAILS'>('DASHBOARD');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const nurseDoc = await getDoc(doc(db, 'nurses', user.uid));
        if (nurseDoc.exists()) {
          setAuthState({
            isAuthenticated: true,
            user: nurseDoc.data() as Nurse,
            loading: false
          });
        } else {
          // Create nurse profile if it doesn't exist
          const newNurse: Nurse = {
            uid: user.uid,
            name: user.displayName || 'Nurse',
            email: user.email || '',
            role: UserRole.NURSE
          };
          await setDoc(doc(db, 'nurses', user.uid), newNurse);
          setAuthState({
            isAuthenticated: true,
            user: newNurse,
            loading: false
          });
        }
      } else {
        setAuthState({
          isAuthenticated: false,
          loading: false
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50 dark:bg-gray-950">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">NurtureFlow</h1>
          </div>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setView('DASHBOARD')}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition",
                  view === 'DASHBOARD' 
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setView('ADD_PATIENT')}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition",
                  view === 'ADD_PATIENT' 
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <UserPlus className="w-4 h-4" />
                Add Patient
              </button>
            </nav>

            <div className="flex items-center gap-4 pl-6 border-l dark:border-gray-800">
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-full transition"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{authState.user?.name}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{authState.user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full p-4 md:p-6">
        {view === 'DASHBOARD' && (
          <NurseDashboard 
            onViewPatient={(id) => {
              setSelectedPatientId(id);
              setView('PATIENT_DETAILS');
            }} 
          />
        )}
        {view === 'ADD_PATIENT' && (
          <PatientForm onComplete={() => setView('DASHBOARD')} />
        )}
        {view === 'PATIENT_DETAILS' && selectedPatientId && (
          <PatientDetails 
            patientId={selectedPatientId} 
            onBack={() => setView('DASHBOARD')} 
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t dark:border-gray-800 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; 2026 NurtureFlow - AI-Powered Family Planning. Non-Diagnostic System.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-gray-400 hover:text-emerald-600">Privacy Policy</a>
            <a href="#" className="text-xs text-gray-400 hover:text-emerald-600">Clinical Guidelines</a>
            <a href="#" className="text-xs text-gray-400 hover:text-emerald-600">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
