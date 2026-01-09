import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Attendee, Meeting, MeetingTemplate, MeetingHistoryEntry, Settings } from '@/types';

interface MeetingStore {
  // Meeting state
  meeting: Meeting;
  attendees: Attendee[];
  elapsedTime: number; // in seconds
  
  // Settings
  settings: Settings;
  
  // Templates & History
  templates: MeetingTemplate[];
  history: MeetingHistoryEntry[];
  
  // Actions
  startMeeting: () => void;
  pauseMeeting: () => void;
  resumeMeeting: () => void;
  resetMeeting: () => void;
  endMeeting: () => void;
  updateElapsedTime: (seconds: number) => void;
  
  // Attendee actions
  addAttendee: (attendee: Attendee) => void;
  removeAttendee: (id: string) => void;
  updateAttendee: (id: string, updates: Partial<Attendee>) => void;
  duplicateAttendee: (id: string) => void;
  
  // Settings actions
  updateSettings: (settings: Partial<Settings>) => void;
  updateMeetingSettings: (settings: Partial<Meeting>) => void;
  
  // Template actions
  saveTemplate: (name: string) => void;
  loadTemplate: (id: string) => void;
  deleteTemplate: (id: string) => void;
  
  // History actions
  addToHistory: (entry: MeetingHistoryEntry) => void;
  deleteHistoryEntry: (id: string) => void;
  clearHistory: () => void;
  
  // Computed values
  getTotalCost: () => number;
  getCostPerMinute: () => number;
  getAnnualProjection: () => number;
}

const defaultMeeting: Meeting = {
  id: crypto.randomUUID(),
  name: 'Untitled Meeting',
  startTime: null,
  duration: 0,
  status: 'idle',
  frequency: 'one-time',
  overheadMultiplier: 1.5,
};

const defaultSettings: Settings = {
  currency: 'USD',
  theme: 'auto',
  overheadMultiplier: 1.5,
};

export const useMeetingStore = create<MeetingStore>()(
  persist(
    (set, get) => ({
      meeting: defaultMeeting,
      attendees: [],
      elapsedTime: 0,
      settings: defaultSettings,
      templates: [],
      history: [],

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
          meeting: { ...state.meeting, status: 'paused' },
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
        set({
          meeting: { ...defaultMeeting, id: crypto.randomUUID() },
          elapsedTime: 0,
        });
      },

      endMeeting: () => {
        const state = get();
        const finalCost = state.getTotalCost();
        
        if (finalCost > 0 && state.attendees.length > 0) {
          const historyEntry: MeetingHistoryEntry = {
            id: crypto.randomUUID(),
            name: state.meeting.name,
            date: Date.now(),
            duration: state.elapsedTime,
            finalCost,
            attendeeCount: state.attendees.length,
            attendees: state.attendees,
          };
          
          state.addToHistory(historyEntry);
        }
        
        set({
          meeting: { ...defaultMeeting, id: crypto.randomUUID() },
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
        const state = get();
        const attendee = state.attendees.find((a) => a.id === id);
        if (attendee) {
          const duplicate: Attendee = {
            ...attendee,
            id: crypto.randomUUID(),
            name: `${attendee.name} (Copy)`,
          };
          state.addAttendee(duplicate);
        }
      },

      updateSettings: (settings: Partial<Settings>) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }));
      },

      updateMeetingSettings: (settings: Partial<Meeting>) => {
        set((state) => ({
          meeting: { ...state.meeting, ...settings },
        }));
      },

      saveTemplate: (name: string) => {
        const state = get();
        const template: MeetingTemplate = {
          id: crypto.randomUUID(),
          name,
          attendees: state.attendees,
          overheadMultiplier: state.meeting.overheadMultiplier,
        };
        set((state) => ({
          templates: [...state.templates, template],
        }));
      },

      loadTemplate: (id: string) => {
        const state = get();
        const template = state.templates.find((t) => t.id === id);
        if (template) {
          set({
            attendees: template.attendees.map((a) => ({
              ...a,
              id: crypto.randomUUID(),
            })),
            meeting: {
              ...state.meeting,
              overheadMultiplier: template.overheadMultiplier,
            },
          });
        }
      },

      deleteTemplate: (id: string) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      },

      addToHistory: (entry: MeetingHistoryEntry) => {
        set((state) => ({
          history: [entry, ...state.history].slice(0, 50), // Keep last 50
        }));
      },

      deleteHistoryEntry: (id: string) => {
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        }));
      },

      clearHistory: () => {
        set({ history: [] });
      },

      getTotalCost: () => {
        const state = get();
        const hours = state.elapsedTime / 3600;
        const totalHourlyCost = state.attendees.reduce(
          (sum, attendee) => sum + attendee.hourlyRate,
          0
        );
        return totalHourlyCost * hours * state.meeting.overheadMultiplier;
      },

      getCostPerMinute: () => {
        const state = get();
        const totalHourlyCost = state.attendees.reduce(
          (sum, attendee) => sum + attendee.hourlyRate,
          0
        );
        return (totalHourlyCost / 60) * state.meeting.overheadMultiplier;
      },

      getAnnualProjection: () => {
        const state = get();
        const costPerMinute = state.getCostPerMinute();
        const meetingMinutes = state.elapsedTime / 60;
        
        if (meetingMinutes === 0) return 0;
        
        const meetingCost = costPerMinute * meetingMinutes;
        
        switch (state.meeting.frequency) {
          case 'daily':
            return meetingCost * 260; // ~260 working days
          case 'weekly':
            return meetingCost * 52;
          case 'monthly':
            return meetingCost * 12;
          case 'custom':
            return meetingCost * (state.meeting.customFrequency || 0) * 12;
          default:
            return meetingCost;
        }
      },
    }),
    {
      name: 'meeting-cost-calculator',
      partialize: (state) => ({
        settings: state.settings,
        templates: state.templates,
        history: state.history,
      }),
    }
  )
);

