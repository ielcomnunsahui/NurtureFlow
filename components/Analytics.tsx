import React from 'react';
import { Patient } from '../types';
import { CONTRACEPTIVE_METHODS } from '../constants';
import { PieChart, Activity, TrendingUp, Users } from 'lucide-react';
import { cn } from '../lib/utils';

interface AnalyticsProps {
  patients: Patient[];
}

const Analytics: React.FC<AnalyticsProps> = ({ patients }) => {
  const methodCounts = CONTRACEPTIVE_METHODS.map(method => ({
    ...method,
    count: patients.filter(p => p.currentMethod === method.id).length
  })).sort((a, b) => b.count - a.count);

  const totalPatients = patients.length;

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <PieChart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Method Distribution
        </h3>
        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Live Data</span>
      </div>

      <div className="space-y-4">
        {methodCounts.map((method, index) => {
          const percentage = totalPatients > 0 ? Math.round((method.count / totalPatients) * 100) : 0;
          
          return (
            <div key={method.id} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">{method.name}</span>
                <span className="text-gray-400 dark:text-gray-500 font-bold">{method.count} ({percentage}%)</span>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    index === 0 ? "bg-emerald-500" :
                    index === 1 ? "bg-blue-500" :
                    index === 2 ? "bg-amber-500" :
                    "bg-gray-300 dark:bg-gray-700"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Top Method</p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{methodCounts[0]?.count > 0 ? methodCounts[0].name : 'N/A'}</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Avg. Age</p>
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {patients.length > 0 ? Math.round(patients.reduce((acc, p) => acc + p.age, 0) / patients.length) : 0} yrs
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
