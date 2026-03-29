import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { addMonths, addYears, format, isBefore, startOfDay } from 'date-fns';
import { CONTRACEPTIVE_METHODS } from '../constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateNextAppointment(methodId: string, startDate: Date = new Date()): Date {
  const method = CONTRACEPTIVE_METHODS.find(m => m.id === methodId);
  if (!method) return addMonths(startDate, 1);

  if (method.durationYears) {
    return addYears(startDate, method.durationYears);
  }
  if (method.durationMonths) {
    return addMonths(startDate, method.durationMonths);
  }
  return addMonths(startDate, 1);
}

export function getStatus(nextDate: string) {
  const next = startOfDay(new Date(nextDate));
  const today = startOfDay(new Date());
  
  if (isBefore(next, today)) return 'Missed';
  
  const diffDays = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return 'Due Soon';
  return 'Upcoming';
}

export function formatDate(date: string | Date) {
  return format(new Date(date), 'PPP');
}
