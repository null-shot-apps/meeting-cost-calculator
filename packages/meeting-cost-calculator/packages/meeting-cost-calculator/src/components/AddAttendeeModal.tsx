'use client';

import { useState } from 'react';
import { calculateHourlyRate, calculateAnnualSalary, formatCurrency, formatSalary } from '@/lib/utils';
import type { Attendee, SalaryEstimation } from '@/types';

type AddAttendeeModalProps = {
  onAdd: (attendee: Attendee) => void;
  onClose: () => void;
};

export function AddAttendeeModal({ onAdd, onClose }: AddAttendeeModalProps) {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [inputType, setInputType] = useState<'salary' | 'hourly'>('salary');
  
  // Manual input
  const [name, setName] = useState('');
  const [annualSalary, setAnnualSalary] = useState<number>(0);
  const [hourlyRate, setHourlyRate] = useState<number>(0);

  // AI estimation
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [industry, setIndustry] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimation, setEstimation] = useState<SalaryEstimation | null>(null);
  const [estimationError, setEstimationError] = useState('');

  const handleSalaryChange = (value: number) => {
    setAnnualSalary(value);
    setHourlyRate(calculateHourlyRate(value));
  };

  const handleHourlyRateChange = (value: number) => {
    setHourlyRate(value);
    setAnnualSalary(calculateAnnualSalary(value));
  };

  const handleEstimateSalary = async () => {
    if (!jobTitle || !location || !experience) {
      setEstimationError('Please fill in job title, location, and experience level');
      return;
    }

    setIsEstimating(true);
    setEstimationError('');

    try {
      const response = await fetch('/api/estimate-salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle,
          location,
          experience,
          companySize,
          industry,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to estimate salary');
      }

      const data: SalaryEstimation = await response.json();
      setEstimation(data);
      setAnnualSalary(data.median_salary);
      setHourlyRate(calculateHourlyRate(data.median_salary));
    } catch (error) {
      setEstimationError('Unable to estimate salary. Please try manual entry.');
      console.error('Estimation error:', error);
    } finally {
      setIsEstimating(false);
    }
  };

  const handleUseEstimate = () => {
    if (!estimation) return;
    
    const newAttendee: Attendee = {
      id: crypto.randomUUID(),
      name: name || jobTitle,
      inputMethod: 'ai_estimated',
      annualSalary,
      hourlyRate,
      estimationData: {
        jobTitle,
        location,
        experience,
        companySize,
        industry,
        confidence: estimation.confidence,
        range: [estimation.range_low, estimation.range_high],
      },
    };
    onAdd(newAttendee);
  };

  const handleAddManual = () => {
    if (!name || (annualSalary === 0 && hourlyRate === 0)) {
      return;
    }

    const newAttendee: Attendee = {
      id: crypto.randomUUID(),
      name,
      inputMethod: 'manual',
      annualSalary,
      hourlyRate,
    };
    onAdd(newAttendee);
  };

  const quickPresets = [
    { label: 'C-Suite', salary: 300000 },
    { label: 'Senior', salary: 135000 },
    { label: 'Mid-level', salary: 90000 },
    { label: 'Junior', salary: 60000 },
  ];

  return (
    <div className=\"fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4\" onClick={onClose}>
      <div
        className=\"bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto\"
        onClick={(e) => e.stopPropagation()}
      >
        <div className=\"sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between\">
          <h2 className=\"text-2xl font-bold text-slate-900 dark:text-white\">Add Attendee</h2>
          <button
            onClick={onClose}
            className=\"p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors\"
          >
            <svg className=\"w-6 h-6 text-slate-500\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">
              <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M6 18L18 6M6 6l12 12\" />
            </svg>
          </button>
        </div>

        <div className=\"p-6\">
          {/* Mode Toggle */}
          <div className=\"flex gap-2 mb-6\">
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 px-4 py-3 font-medium rounded-xl transition-colors ${
                mode === 'manual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setMode('ai')}
              className={`flex-1 px-4 py-3 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 ${
                mode === 'ai'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <svg className=\"w-5 h-5\" fill=\"currentColor\" viewBox=\"0 0 20 20\">
                <path d=\"M13 7H7v6h6V7z\" />
                <path fillRule=\"evenodd\" d=\"M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z\" clipRule=\"evenodd\" />
              </svg>
              AI Estimate
            </button>
          </div>

          {mode === 'manual' ? (
            <div className=\"space-y-4\">
              {/* Name */}
              <div>
                <label className=\"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2\">
                  Name / Role
                </label>
                <input
                  type=\"text\"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=\"e.g., Sarah - Senior Engineer\"
                  className=\"w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500\"
                />
              </div>

              {/* Quick Presets */}
              <div>
                <label className=\"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2\">
                  Quick Presets
                </label>
                <div className=\"grid grid-cols-2 gap-2\">
                  {quickPresets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handleSalaryChange(preset.salary)}
                      className=\"px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors\"
                    >
                      {preset.label} ({formatSalary(preset.salary)})
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Type Toggle */}
              <div className=\"flex gap-2\">
                <button
                  onClick={() => setInputType('salary')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    inputType === 'salary'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Annual Salary
                </button>
                <button
                  onClick={() => setInputType('hourly')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    inputType === 'hourly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Hourly Rate
                </button>
              </div>

              {/* Salary/Hourly Input */}
              {inputType === 'salary' ? (
                <div>
                  <label className=\"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2\">
                    Annual Salary
                  </label>
                  <div className=\"relative\">
                    <span className=\"absolute left-4 top-1/2 -translate-y-1/2 text-slate-500\">$</span>
                    <input
                      type=\"number\"
                      value={annualSalary || ''}
                      onChange={(e) => handleSalaryChange(parseFloat(e.target.value) || 0)}
                      placeholder=\"0\"
                      className=\"w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500\"
                    />
                  </div>
                  <p className=\"text-sm text-slate-500 dark:text-slate-400 mt-2\">
                    ≈ {formatCurrency(hourlyRate)}/hr
                  </p>
                </div>
              ) : (
                <div>
                  <label className=\"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2\">
                    Hourly Rate
                  </label>
                  <div className=\"relative\">
                    <span className=\"absolute left-4 top-1/2 -translate-y-1/2 text-slate-500\">$</span>
                    <input
                      type=\"number\"
                      value={hourlyRate || ''}
                      onChange={(e) => handleHourlyRateChange(parseFloat(e.target.value) || 0)}
                      placeholder=\"0.00\"
                      step=\"0.01\"
                      className=\"w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500\"
                    />
                  </div>
                  <p className=\"text-sm text-slate-500 dark:text-slate-400 mt-2\">
                    ≈ {formatSalary(annualSalary)}/year
                  </p>
                </div>
              )}

              <button
                onClick={handleAddManual}
                disabled={!name || (annualSalary === 0 && hourlyRate === 0)}
                className=\"w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors\"
              >
                Add Attendee
              </button>
            </div>
          ) : (
            <div className=\"space-y-4\">
              {/* AI Estimation Form */}
              <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                <div className=\"md:col-span-2\">
                  <label className=\"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2\">
                    Job Title *
                  </label>
                  <input
                    type=\"text\"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder=\"e.g., Software Engineer, Product Manager\"
                    className=\"w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500\"
                  />
                </div>

                <div>
                  <label className=\"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2\">
                    Location *
                  </label>
                  <input
                    type=\"text\"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder=\"e.g., San Francisco, CA\"
                    className=\"w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500\"
                  />
                </div>

                <div>
                  <label className=\"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2\">
                    Experience Level *
                  </label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className=\"w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500\"
                  >
                    <option value=\"\">Select...</option>
                    <option value=\"Entry Level (0-2 years)\">Entry Level (0-2 years)</option>
                    <option value=\"Mid-Level (3-5 years)\">Mid-Level (3-5 years)</option>
                    <option value=\"Senior (6-10 years)\">Senior (6-10 years)</option>
                    <option value=\"Lead/Principal (10+ years)\">Lead/Principal (10+ years)</option>
                  </select>
                </div>

                <div>
                  <label className=\"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2\">
                    Company Size
                  </label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className=\"w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500\"
                  >
                    <option value=\"\">Optional</option>
                    <option value=\"Startup (<50)\">Startup (&lt;50)</option>
                    <option value=\"Small (50-200)\">Small (50-200)</option>
                    <option value=\"Medium (200-1,000)\">Medium (200-1,000)</option>
                    <option value=\"Large (1,000-5,000)\">Large (1,000-5,000)</option>
                    <option value=\"Enterprise (5,000+)\">Enterprise (5,000+)</option>
                  </select>
                </div>

                <div>
                  <label className=\"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2\">
                    Industry
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className=\"w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500\"
                  >
                    <option value=\"\">Optional</option>
                    <option value=\"Tech\">Tech</option>
                    <option value=\"Finance\">Finance</option>
                    <option value=\"Healthcare\">Healthcare</option>
                    <option value=\"Retail\">Retail</option>
                    <option value=\"Manufacturing\">Manufacturing</option>
                    <option value=\"Education\">Education</option>
                    <option value=\"Consulting\">Consulting</option>
                  </select>
                </div>
              </div>

              {estimationError && (
                <div className=\"p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm\">
                  {estimationError}
                </div>
              )}

              <button
                onClick={handleEstimateSalary}
                disabled={isEstimating || !jobTitle || !location || !experience}
                className=\"w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2\"
              >
                {isEstimating ? (
                  <>
                    <svg className=\"animate-spin h-5 w-5\" fill=\"none\" viewBox=\"0 0 24 24\">
                      <circle className=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" strokeWidth=\"4\" />
                      <path className=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\" />
                    </svg>
                    Estimating...
                  </>
                ) : (
                  'Estimate Salary'
                )}
              </button>

              {estimation && (
                <div className=\"p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl\">
                  <div className=\"flex items-center justify-between mb-3\">
                    <h3 className=\"font-semibold text-slate-900 dark:text-white\">Estimated Salary</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      estimation.confidence === 'high'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : estimation.confidence === 'medium'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                    }`}>
                      {estimation.confidence} confidence
                    </span>
                  </div>
                  <div className=\"text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2\">
                    {formatSalary(estimation.median_salary)}
                  </div>
                  <div className=\"text-sm text-slate-600 dark:text-slate-400 mb-3\">
                    Range: {formatSalary(estimation.range_low)} - {formatSalary(estimation.range_high)}
                  </div>
                  <div className=\"text-xs text-slate-500 dark:text-slate-400 mb-4\">
                    {estimation.notes}
                  </div>

                  <div className=\"mb-4\">
                    <label className=\"block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2\">
                      Name (optional)
                    </label>
                    <input
                      type=\"text\"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={jobTitle}
                      className=\"w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500\"
                    />
                  </div>

                  <div className=\"flex gap-2\">
                    <button
                      onClick={handleUseEstimate}
                      className=\"flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors\"
                    >
                      Use This Estimate
                    </button>
                    <button
                      onClick={() => setEstimation(null)}
                      className=\"px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors\"
                    >
                      Adjust
                    </button>
                  </div>
                </div>
              )}

              <p className=\"text-xs text-slate-500 dark:text-slate-400 text-center\">
                Estimates are approximations based on market data
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

