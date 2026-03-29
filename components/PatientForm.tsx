import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { CONTRACEPTIVE_METHODS } from '../constants';
import { calculateNextAppointment, formatDate, cn } from '../lib/utils';
import { UserPlus, Calendar, Phone, MapPin, Users, History, Loader2, CheckCircle2, Activity } from 'lucide-react';

interface PatientFormProps {
  onComplete: () => void;
}

const PatientForm: React.FC<PatientFormProps> = ({ onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  const selectedMethod = watch('currentMethod');
  const nextDate = selectedMethod ? calculateNextAppointment(selectedMethod) : null;

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const patientData = {
        ...data,
        age: parseInt(data.age),
        childrenCount: parseInt(data.childrenCount),
        nextAppointmentDate: nextDate?.toISOString(),
        registeredBy: auth.currentUser?.uid,
        createdAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp()
      };

      await addDoc(collection(db, 'patients'), patientData);
      setSuccess(true);
      setTimeout(() => onComplete(), 2000);
    } catch (error) {
      console.error('Error adding patient:', error);
      alert('Failed to save patient record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-12 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-emerald-100 dark:border-emerald-900/30 text-center animate-in fade-in zoom-in duration-300">
        <div className="bg-emerald-100 dark:bg-emerald-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Patient Registered!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">The patient record has been successfully saved to the database.</p>
        <div className="flex justify-center gap-4">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce delay-75"></div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce delay-150"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="bg-emerald-600 p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <UserPlus className="w-8 h-8" />
          <h2 className="text-3xl font-bold tracking-tight">Register New Patient</h2>
        </div>
        <p className="text-emerald-100 opacity-80">Enter patient biodata and family planning history to create a new profile.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
        {/* Section 1: Biodata */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Patient Biodata</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input
                {...register('fullName', { required: 'Full name is required' })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:text-white transition-all"
                placeholder="e.g. Maryam Ibrahim"
              />
              {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message as string}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Age</label>
              <input
                type="number"
                {...register('age', { required: 'Age is required', min: 12, max: 100 })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:text-white transition-all"
                placeholder="Years"
              />
              {errors.age && <p className="text-xs text-red-500">Please enter a valid age (12-100)</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" /> Address
              </label>
              <input
                {...register('address', { required: 'Address is required' })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:text-white transition-all"
                placeholder="Residential address"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" /> Phone Number (Optional)
              </label>
              <input
                {...register('phoneNumber')}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:text-white transition-all"
                placeholder="+234..."
              />
            </div>
          </div>
        </div>

        {/* Section 2: Medical & FP Data */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <History className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Medical & Family Planning</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Number of Children</label>
              <input
                type="number"
                {...register('childrenCount', { required: true, min: 0 })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:text-white transition-all"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" /> Last Menstrual Period (LMP)
              </label>
              <input
                type="date"
                {...register('lmp', { required: true })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:text-white transition-all"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Family Planning History</label>
              <textarea
                {...register('fpHistory')}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:text-white transition-all"
                placeholder="Previous methods used, complications, etc."
              />
            </div>
          </div>
        </div>

        {/* Section 3: Current Method & Calculation */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contraceptive Method</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Contraceptive Method</label>
              <div className="grid grid-cols-1 gap-3">
                {CONTRACEPTIVE_METHODS.map((method) => (
                  <label 
                    key={method.id}
                    className={cn(
                      "flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all",
                      selectedMethod === method.id 
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-emerald-100 dark:ring-emerald-900/30" 
                        : "border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                  >
                    <input
                      type="radio"
                      value={method.id}
                      {...register('currentMethod', { required: 'Please select a method' })}
                      className="hidden"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{method.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{method.description}</p>
                    </div>
                    {selectedMethod === method.id && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                  </label>
                ))}
              </div>
              {errors.currentMethod && <p className="text-xs text-red-500">{errors.currentMethod.message as string}</p>}
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                <h4 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Automatic Calculation</h4>
                
                {nextDate ? (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                      <Calendar className="w-6 h-6" />
                      <div>
                        <p className="text-xs font-medium opacity-70 dark:opacity-60 uppercase">Next Appointment Date</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{formatDate(nextDate)}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-2xl text-emerald-800 dark:text-emerald-300 text-sm">
                      <p>Based on the clinical rules for <strong>{CONTRACEPTIVE_METHODS.find(m => m.id === selectedMethod)?.name}</strong>, the patient should return in {
                        CONTRACEPTIVE_METHODS.find(m => m.id === selectedMethod)?.durationYears 
                        ? `${CONTRACEPTIVE_METHODS.find(m => m.id === selectedMethod)?.durationYears} years`
                        : `${CONTRACEPTIVE_METHODS.find(m => m.id === selectedMethod)?.durationMonths} months`
                      }.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500 text-center">
                    <Calendar className="w-12 h-12 mb-2 opacity-20" />
                    <p className="text-sm">Select a contraceptive method to calculate next visit.</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-900/30 text-blue-800 dark:text-blue-300 text-sm">
                <p className="font-semibold mb-1">Nurse Note:</p>
                <p className="opacity-80">Ensure the patient understands the side effects and usage instructions for the selected method before completing registration.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => onComplete()}
            className="px-8 py-4 text-gray-600 dark:text-gray-400 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-12 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? 'Saving Record...' : 'Register Patient'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
