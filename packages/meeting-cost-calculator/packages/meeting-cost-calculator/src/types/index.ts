export interface Attendee {
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
    confidence: 'high' | 'medium' | 'low';
    range: [number, number];
  };
}

export interface Meeting {
  id: string;
  name: string;
  startTime: number | null;
  duration: number; // in seconds
  status: 'idle' | 'running' | 'paused' | 'ended';
  frequency: 'one-time' | 'daily' | 'weekly' | 'monthly' | 'custom';
  customFrequency?: number; // times per month
  overheadMultiplier: number;
}

export interface MeetingTemplate {
  id: string;
  name: string;
  attendees: Attendee[];
  overheadMultiplier: number;
}

export interface MeetingHistoryEntry {
  id: string;
  name: string;
  date: number;
  duration: number;
  finalCost: number;
  attendeeCount: number;
  attendees: Attendee[];
}

export interface Settings {
  currency: string;
  theme: 'light' | 'dark' | 'auto';
  overheadMultiplier: number;
}

