import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

type MeetingStore = {
  meeting: Meeting;
  attendees: Attendee[];
  elapsedTime: number;
  overheadMultiplier: number;
  currency: string;
  theme: 'light' | 'dark' | 'auto';
  history: MeetingHistory[];
  templates: MeetingTemplate[];

  // Meeting actions
  startMeeting: () => void;
  pauseMeeting: () => void;
  resumeMeeting: () => void;
  resetMeeting: () => void;
  updateElapsedTime: (seconds: number) => void;

  // Attendee actions
  addAttendee: (attendee: Attendee) => void;
  removeAttendee: (id: string) => void;
  updateAttendee: (id: string, updates: Partial<Attendee>) => void;
  duplicateAttendee: (id: string) => void;

  // Settings actions
  setOverheadMultiplier: (multiplier: number) => void;
  setCurrency: (currency: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;

  // Template actions
  saveTemplate: (name: string) => void;
  loadTemplate: (id: string) => void;
  deleteTemplate: (id: string) => void;

  // History actions
  saveMeetingToHistory: () => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;

  // Calculations
  getTotalCost: () => number;
  getCostPerMinute: () => number;
  getIndividualCost: (attendeeId: string) => number;
};

export const useMeetingStore = create<MeetingStore>()(
  persist(
    (set, get) => ({
      meeting: {
        id: crypto.randomUUID(),
        name: '',
        startTime: null,
        pausedTime: 0,
        status: 'idle',
        frequency: 'one-time',
      },
      attendees: [],
      elapsedTime: 0,
      overheadMultiplier: 1.5,
      currency: 'USD',
      theme: 'auto',
      history: [],
      templates: [],

      startMeeting: () => {
        set((state) => ({
          meeting: {
            ...state.meeting,
            status: 'running',
            startTime: Date.now() - state.elapsedTime * 1000,
          },
        }));
      },

      pauseMeeting: () => {
        set((state) => ({
          meeting: {
            ...state.meeting,
            status: 'paused',
            pausedTime: state.elapsedTime,
          },
        }));
      },

      resumeMeeting: () => {
        set((state) => ({
          meeting: {
            ...state.meeting,
            status: 'running',
            startTime: Date.now() - state.elapsedTime * 1000,
          },
        }));
      },

      resetMeeting: () => {
        const state = get();
        if (state.elapsedTime > 0 && state.attendees.length > 0) {
          state.saveMeetingToHistory();
        }
        set({
          meeting: {
            id: crypto.randomUUID(),
            name: '',
            startTime: null,
            pausedTime: 0,
            status: 'idle',
            frequency: 'one-time',
          },
          elapsedTime: 0,
        });
      },

      updateElapsedTime: (seconds: number) => {
        set({ elapsedTime: seconds });
      },

      addAttendee: (attendee: Attendee) => {
        set((state) => ({
          attendees: [...state.attendees, attendee],
        }));
      },

      removeAttendee: (id: string) => {
        set((state) => ({
          attendees: state.attendees.filter((a) => a.id !== id),
        }));
      },

      updateAttendee: (id: string, updates: Partial<Attendee>) => {
        set((state) => ({
          attendees: state.attendees.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }));
      },

      duplicateAttendee: (id: string) => {
        set((state) => {
          const attendee = state.attendees.find((a) => a.id === id);
          if (!attendee) return state;
          const newAttendee = {
            ...attendee,
            id: crypto.randomUUID(),
            name: `${attendee.name} (copy)`,
          };
          return {
            attendees: [...state.attendees, newAttendee],
          };
        });
      },

      setOverheadMultiplier: (multiplier: number) => {
        set({ overheadMultiplier: multiplier });
      },

      setCurrency: (currency: string) => {
        set({ currency });
      },

      setTheme: (theme: 'light' | 'dark' | 'auto') => {
        set({ theme });
      },

      saveTemplate: (name: string) => {
        set((state) => ({
          templates: [
            ...state.templates,
            {
              id: crypto.randomUUID(),
              name,
              attendees: state.attendees,
              overheadMultiplier: state.overheadMultiplier,
            },
          ],
        }));
      },

      loadTemplate: (id: string) => {
        set((state) => {
          const template = state.templates.find((t) => t.id === id);
          if (!template) return state;
          return {
            attendees: template.attendees.map((a) => ({
              ...a,
              id: crypto.randomUUID(),
            })),
            overheadMultiplier: template.overheadMultiplier,
          };
        });
      },

      deleteTemplate: (id: string) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      },

      saveMeetingToHistory: () => {
        set((state) => {
          const totalCost = state.getTotalCost();
          if (totalCost === 0) return state;

          return {
            history: [
              {
                id: crypto.randomUUID(),
                name: state.meeting.name || 'Untitled Meeting',
                date: Date.now(),
                duration: state.elapsedTime,
                finalCost: totalCost,
                attendeeCount: state.attendees.length,
                attendees: state.attendees,
              },
              ...state.history,
            ].slice(0, 50), // Keep last 50 meetings
          };
        });
      },

      deleteHistoryItem: (id: string) => {
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        }));
      },

      clearHistory: () => {
        set({ history: [] });
      },

      getTotalCost: () => {
        const state = get();
        const costPerSecond = state.attendees.reduce((sum, attendee) => {
          return sum + (attendee.hourlyRate * state.overheadMultiplier) / 3600;
        }, 0);
        return costPerSecond * state.elapsedTime;
      },

      getCostPerMinute: () => {
        const state = get();
        return state.attendees.reduce((sum, attendee) => {
          return sum + (attendee.hourlyRate * state.overheadMultiplier) / 60;
        }, 0);
      },

      getIndividualCost: (attendeeId: string) => {
        const state = get();
        const attendee = state.attendees.find((a) => a.id === attendeeId);
        if (!attendee) return 0;
        return (
          (attendee.hourlyRate * state.overheadMultiplier * state.elapsedTime) /
          3600
        );
      },
    }),
    {
      name: 'meeting-cost-storage',
      partialize: (state) => ({
        overheadMultiplier: state.overheadMultiplier,
        currency: state.currency,
        theme: state.theme,
        history: state.history,
        templates: state.templates,
      }),
    }
  )
);

