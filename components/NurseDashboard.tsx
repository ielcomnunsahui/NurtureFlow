import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Patient } from '../types';
import { CONTRACEPTIVE_METHODS } from '../constants';
import { formatDate, getStatus, cn } from '../lib/utils';
import { Search, Filter, User, Calendar, Phone, ChevronRight, AlertCircle, Clock, CheckCircle2, TrendingUp, Users, Activity } from 'lucide-react';
import Analytics from './Analytics';

interface NurseDashboardProps {
  onViewPatient: (id: string) => void;
}

const NurseDashboard: React.FC<NurseDashboardProps> = ({ onViewPatient }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');

  useEffect(() => {
    const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const patientData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Patient[];
      setPatients(patientData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.phoneNumber?.includes(searchTerm);
    const matchesFilter = filterMethod === 'all' || p.currentMethod === filterMethod;
    return matchesSearch && matchesFilter;
  });

  const missedCount = patients.filter(p => getStatus(p.nextAppointmentDate) === 'Missed').length;
  const dueSoonCount = patients.filter(p => getStatus(p.nextAppointmentDate) === 'Due Soon').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-emerald-600">
        <Clock className="w-12 h-12 animate-spin mb-4" />
        <p className="font-medium">Loading patient records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-2xl">
            <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Patients</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{patients.length}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-2xl">
            <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Due Soon</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{dueSoonCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-2xl">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Missed</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{missedCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Rate</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {patients.length > 0 ? Math.round(((patients.length - missedCount) / patients.length) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Patient List Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Patient Directory</h3>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-grow sm:flex-grow-0">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-64 transition-all dark:text-white"
                  />
                </div>
                <div className="relative">
                  <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={filterMethod}
                    onChange={(e) => setFilterMethod(e.target.value)}
                    className="pl-10 pr-8 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none transition-all dark:text-white"
                  >
                    <option value="all">All Methods</option>
                    {CONTRACEPTIVE_METHODS.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => {
                  const status = getStatus(patient.nextAppointmentDate);
                  const method = CONTRACEPTIVE_METHODS.find(m => m.id === patient.currentMethod);
                  
                  return (
                    <button
                      key={patient.id}
                      onClick={() => onViewPatient(patient.id)}
                      className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 rounded-2xl transition-all group shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          <User className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{patient.fullName}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {method?.name}</span>
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {patient.phoneNumber || 'No phone'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Next Visit</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">{formatDate(patient.nextAppointmentDate)}</p>
                        </div>
                        
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          status === 'Missed' ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                          status === 'Due Soon' ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" :
                          "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                        )}>
                          {status}
                        </div>
                        
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-12 text-center text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No patients found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Sidebar Section */}
        <div className="space-y-6">
          <Analytics patients={patients} />
          
          <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-lg shadow-emerald-100">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Nurse Quick Tip
            </h4>
            <p className="text-emerald-50 text-sm leading-relaxed mb-4">
              Always verify the patient's phone number during registration to ensure follow-up reminders can be sent effectively.
            </p>
            <div className="p-4 bg-emerald-500/30 rounded-2xl text-xs">
              <p className="font-bold mb-1 uppercase tracking-widest">Today's Focus:</p>
              <p>Follow up with {dueSoonCount} patients due this week.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;
