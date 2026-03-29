import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Patient } from '../types';
import { CONTRACEPTIVE_METHODS } from '../constants';
import { formatDate, getStatus, cn, calculateNextAppointment } from '../lib/utils';
import { ArrowLeft, User, Calendar, Phone, MapPin, Activity, History, Users, Trash2, Edit3, Save, X, Loader2, AlertCircle, Clock } from 'lucide-react';

interface PatientDetailsProps {
  patientId: string;
  onBack: () => void;
}

const PatientDetails: React.FC<PatientDetailsProps> = ({ patientId, onBack }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Patient>>({});

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const docRef = doc(db, 'patients', patientId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Patient;
          setPatient(data);
          setFormData(data);
        }
      } catch (error) {
        console.error('Error fetching patient:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'patients', patientId);
      
      // Recalculate next appointment if method changed
      let nextAppointmentDate = formData.nextAppointmentDate;
      if (formData.currentMethod !== patient?.currentMethod) {
        nextAppointmentDate = calculateNextAppointment(formData.currentMethod!).toISOString();
      }

      const updatedData = { ...formData, nextAppointmentDate };
      await updateDoc(docRef, updatedData);
      setPatient({ ...patient, ...updatedData } as Patient);
      setEditing(false);
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Failed to update record.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this patient record? This action cannot be undone.')) return;
    
    try {
      await deleteDoc(doc(db, 'patients', patientId));
      onBack();
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Failed to delete record.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-emerald-600 dark:text-emerald-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-medium">Loading patient details...</p>
      </div>
    );
  }

  if (!patient) return null;

  const status = getStatus(patient.nextAppointmentDate);
  const method = CONTRACEPTIVE_METHODS.find(m => m.id === patient.currentMethod);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-600 p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 dark:bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white">{patient.fullName}</h2>
              <div className="flex items-center gap-4 mt-2 opacity-80 dark:opacity-70 text-sm">
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {patient.age} years</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {patient.address}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!editing ? (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                  title="Edit Record"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-3 bg-red-500/20 hover:bg-red-500/40 rounded-xl transition-all"
                  title="Delete Record"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-emerald-600 text-emerald-700 dark:text-white font-bold rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-700 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData(patient);
                  }}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Column 1: Biodata & History */}
          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <User className="w-4 h-4" /> Personal Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone Number</p>
                  {editing ? (
                    <input
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-sm dark:text-white"
                    />
                  ) : (
                    <p className="font-semibold text-gray-900 dark:text-white">{patient.phoneNumber || 'Not provided'}</p>
                  )}
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Children Count</p>
                  {editing ? (
                    <input
                      type="number"
                      value={formData.childrenCount}
                      onChange={(e) => setFormData({ ...formData, childrenCount: parseInt(e.target.value) })}
                      className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-sm dark:text-white"
                    />
                  ) : (
                    <p className="font-semibold text-gray-900 dark:text-white">{patient.childrenCount}</p>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <History className="w-4 h-4" /> Medical History
              </h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Family Planning History</p>
                {editing ? (
                  <textarea
                    value={formData.fpHistory}
                    onChange={(e) => setFormData({ ...formData, fpHistory: e.target.value })}
                    className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-sm dark:text-white"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{patient.fpHistory || 'No history recorded.'}</p>
                )}
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Menstrual Period (LMP)</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatDate(patient.lmp)}</p>
              </div>
            </section>
          </div>

          {/* Column 2: Contraceptive Tracking */}
          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4" /> Family Planning Status
              </h3>
              
              <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Current Method</p>
                    {editing ? (
                      <select
                        value={formData.currentMethod}
                        onChange={(e) => setFormData({ ...formData, currentMethod: e.target.value })}
                        className="bg-white dark:bg-gray-700 border border-emerald-200 dark:border-emerald-600 rounded-lg px-2 py-1 text-sm font-bold dark:text-white"
                      >
                        {CONTRACEPTIVE_METHODS.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{method?.name}</p>
                    )}
                  </div>
                  <div className={cn(
                    "px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest",
                    status === 'Missed' ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300" :
                    status === 'Due Soon' ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" :
                    "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                  )}>
                    {status}
                  </div>
                </div>
                
                <div className="pt-4 border-t border-emerald-200/50 dark:border-emerald-800/50 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 opacity-70">Next Appointment Date</p>
                    <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">{formatDate(patient.nextAppointmentDate)}</p>
                  </div>
                </div>
              </div>

              {status === 'Missed' && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-start gap-3 text-red-800 dark:text-red-300 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>This patient has missed their follow-up appointment. Please contact them immediately to reschedule.</p>
                </div>
              )}
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4" /> Record Info
              </h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 space-y-2">
                <p>Registered on: <span className="font-semibold text-gray-700 dark:text-gray-300">{formatDate(patient.createdAt)}</span></p>
                <p>Registered by: <span className="font-semibold text-gray-700 dark:text-gray-300">{patient.registeredBy}</span></p>
                <p>Patient ID: <span className="font-mono text-gray-700 dark:text-gray-300">{patientId}</span></p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
