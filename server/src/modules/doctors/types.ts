export interface ITimeSlot {
  start: string;
  end: string;
}

export interface IDaySchedule {
  isWorking: boolean;
  slots: ITimeSlot[];
}

export interface IWeeklySchedule {
  monday: IDaySchedule;
  tuesday: IDaySchedule;
  wednesday: IDaySchedule;
  thursday: IDaySchedule;
  friday: IDaySchedule;
  saturday: IDaySchedule;
  sunday: IDaySchedule;
}

export interface IDoctor {
  userId: string;
  specialization: string;
  qualifications: string[];
  experience: number;
  consultationFee: number;
  languages: string[];
  weeklySchedule: IWeeklySchedule;
  rating: number;
  totalConsultations: number;
  isAvailableNow: boolean;
  bio: string;
}
