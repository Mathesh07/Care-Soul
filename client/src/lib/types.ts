// Appointment Status Types and Constants
export const APPOINTMENT_STATUS = {
  PENDING: 'Pending',
  BOOKED: 'Booked',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
} as const;

export type AppointmentStatus = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS];

export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  status: AppointmentStatus;
}

// User Roles
export const USER_ROLE = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Notification Types
export const NOTIFICATION_TYPE = {
  APPOINTMENT: 'appointment',
  EMERGENCY: 'emergency',
  REMINDER: 'reminder',
  SYSTEM: 'system',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPE[keyof typeof NOTIFICATION_TYPE];

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Availability Types
export const TIME_SLOT = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
} as const;

export type TimeSlot = typeof TIME_SLOT[keyof typeof TIME_SLOT];

export const DAY_OF_WEEK = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
} as const;

export type DayOfWeek = typeof DAY_OF_WEEK[keyof typeof DAY_OF_WEEK];

export interface DoctorAvailability {
  doctorId: string;
  day: DayOfWeek;
  slots: {
    [key in TimeSlot]: boolean; // true = available, false = unavailable
  };
}
