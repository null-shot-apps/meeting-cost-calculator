export type Attendee = {
  id: string;
  name: string;
  inputMethod: 'manual' | 'ai_estimated';
  annualSalary: number;
  hourlyRate: number;
  estimationData?: {
    jobTitle: string;
    location: string;
    experience: string;
    companySize?: string;
    industry?: string;
    confidence: string;
    range: [number, number];
  };
};

export type MeetingStatus = 'idle' | 'running' | 'paused';

export type Meeting = {
  id: string;
  name: string;
  startTime: number | null;
  pausedTime: number;
  status: MeetingStatus;
  frequency: 'one-time' | 'daily' | 'weekly' | 'monthly' | 'custom';
  customFrequency?: number;
};

export type MeetingHistory = {
  id: string;
  name: string;
  date: number;
  duration: number;
  finalCost: number;
  attendeeCount: number;
  attendees: Attendee[];
};

export type MeetingTemplate = {
  id: string;
  name: string;
  attendees: Attendee[];
  overheadMultiplier: number;
};

export type SalaryEstimation = {
  median_salary: number;
  range_low: number;
  range_high: number;
  confidence: 'high' | 'medium' | 'low';
  notes: string;
};

