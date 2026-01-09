'use client';

import { useState, useEffect } from 'react';

type Attendee = {
  id: string;
  name: string;
  annualSalary: number;
  hourlyRate: number;
};

type MeetingStatus = 'idle' | 'running' | 'paused';

export default function MeetingCostCalculator() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [status, setStatus] = useState<MeetingStatus>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [overheadMultiplier, setOverheadMultiplier] = useState(1.5);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'running') {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const totalCost = attendees.reduce((sum, attendee) => {
    return sum + (attendee.hourlyRate * overheadMultiplier * elapsedSeconds / 3600);
  }, 0);

  const costPerMinute = attendees.reduce((sum, attendee) => {
    return sum + (attendee.hourlyRate * overheadMultiplier / 60);
  }, 0);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getCostColor = () => {
    if (totalCost < 100) return 'text-green-500';
    if (totalCost < 500) return 'text-yellow-500';
    if (totalCost < 1000) return 'text-orange-500';
    return 'text-red-500';
  };

  const addAttendee = () => {
    const newAttendee: Attendee = {
      id: crypto.randomUUID(),
      name: '',
      annualSalary: 0,
      hourlyRate: 0,
    };
    setAttendees([...attendees, newAttendee]);
  };

  const removeAttendee = (id: string) => {
    setAttendees(attendees.filter(a => a.id !== id));
  };

  const updateSalary = (id: string, annualSalary: number) => {
    const hourlyRate = annualSalary / 2080;
    setAttendees(attendees.map(a => 
      a.id === id ? { ...a, annualSalary, hourlyRate } : a
    ));
  };

  const updateHourlyRate = (id: string, hourlyRate: number) => {
    const annualSalary = hourlyRate * 2080;
    setAttendees(attendees.map(a => 
      a.id === id ? { ...a, annualSalary, hourlyRate } : a
    ));
  };

  const updateName = (id: string, name: string) => {
    setAttendees(attendees.map(a => 
      a.id === id ? { ...a, name } : a
    ));
  };

  const handleStart = () => {
    if (attendees.length === 0) return;
    setStatus('running');
  };

  const handlePause = () => {
    setStatus('paused');
  };

  const handleResume = () => {
    setStatus('running');
  };

  const handleReset = () => {
    if (totalCost > 0) {
      if (!confirm(`This will clear ${formatCurrency(totalCost)} - continue?`)) {
        return;
      }
    }
    setStatus('idle');
    setElapsedSeconds(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Meeting Cost Calculator</h1>
          <p className="text-slate-400 text-lg">Time is money. Literally.</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700">
              <div className="text-center mb-8">
                <div className={`text-7xl md:text-8xl font-bold mb-4 transition-colors duration-300 ${getCostColor()} ${status === 'running' ? 'animate-pulse' : ''}`}>
                  {formatCurrency(totalCost)}
                </div>
                <div className="text-2xl text-slate-400 mb-2">
                  {formatTime(elapsedSeconds)}
                </div>
                <div className="text-lg text-slate-500">
                  {formatCurrency(costPerMinute)}/min
                </div>
              </div>

              <div className="flex gap-4 justify-center flex-wrap">
                {status === 'idle' && (
                  <button
                    onClick={handleStart}
                    disabled={attendees.length === 0}
                    className="px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl font-semibold text-lg transition-colors"
                  >
                    Start Meeting
                  </button>
                )}
                {status === 'running' && (
                  <button
                    onClick={handlePause}
                    className="px-8 py-4 bg-yellow-600 hover:bg-yellow-700 rounded-xl font-semibold text-lg transition-colors"
                  >
                    Pause
                  </button>
                )}
                {status === 'paused' && (
                  <button
                    onClick={handleResume}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold text-lg transition-colors"
                  >
                    Resume
                  </button>
                )}
                {status !== 'idle' && (
                  <button
                    onClick={handleReset}
                    className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-xl font-semibold text-lg transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>

              {attendees.length === 0 && (
                <div className="mt-6 text-center text-slate-400">
                  Add attendees to start calculating →
                </div>
              )}
            </div>

            <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-xl font-semibold">Settings</span>
                <svg
                  className={`w-6 h-6 transition-transform ${showSettings ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showSettings && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Overhead Multiplier: {overheadMultiplier}x
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="2.5"
                      step="0.1"
                      value={overheadMultiplier}
                      onChange={(e) => setOverheadMultiplier(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Accounts for benefits, taxes, office costs, equipment
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Attendees ({attendees.length})</h2>
              <button
                onClick={addAttendee}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Attendee
              </button>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {attendees.map((attendee) => (
                <div
                  key={attendee.id}
                  className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <input
                      type="text"
                      value={attendee.name}
                      onChange={(e) => updateName(attendee.id, e.target.value)}
                      placeholder="Name / Role"
                      className="flex-1 bg-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeAttendee(attendee.id)}
                      className="ml-3 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Annual Salary</label>
                      <input
                        type="number"
                        value={attendee.annualSalary || ''}
                        onChange={(e) => updateSalary(attendee.id, parseFloat(e.target.value) || 0)}
                        placeholder="$0"
                        className="w-full bg-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Hourly Rate</label>
                      <input
                        type="number"
                        value={attendee.hourlyRate ? attendee.hourlyRate.toFixed(2) : ''}
                        onChange={(e) => updateHourlyRate(attendee.id, parseFloat(e.target.value) || 0)}
                        placeholder="$0.00"
                        className="w-full bg-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {status === 'running' && (
                    <div className="mt-4 text-center text-sm text-slate-400">
                      Individual cost: {formatCurrency((attendee.hourlyRate * overheadMultiplier / 3600) * elapsedSeconds)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
