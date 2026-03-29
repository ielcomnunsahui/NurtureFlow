
export enum UserRole {
  NURSE = 'Nurse',
  ADMIN = 'Admin'
}

export interface Nurse {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Patient {
  id: string;
  fullName: string;
  age: number;
  address: string;
  phoneNumber?: string;
  childrenCount: number;
  fpHistory: string;
  lmp: string; // ISO date
  lastSexualIntercourse: string; // ISO date
  currentMethod: string;
  nextAppointmentDate: string; // ISO date
  registeredBy: string; // Nurse UID
  createdAt: string; // ISO date-time
}

export interface Visit {
  id: string;
  patientId: string;
  nurseId: string;
  visitDate: string;
  methodProvided: string;
  nextAppointmentDate: string;
  notes: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user?: Nurse;
  loading: boolean;
}
