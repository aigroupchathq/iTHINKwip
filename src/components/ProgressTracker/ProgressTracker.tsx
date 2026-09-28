import React, { useState } from 'react';
import { 
  TrendingUp, 
  Flame, 
  Clock, 
  Download, 
  ShieldCheck, 
} from 'lucide-react';
import { ChallengeResult } from '../../types/neuro';

interface ProgressTrackerProps {
  results: ChallengeResult[];
  dailyStreak: number;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ results, dailyStreak }) => {
  const [activeDomainFilter, setActiveDomainFilter] = useState<'all' | 'stroop' | 'nback' | 'gonogo' | 'trailmaking'>('all');

  // Compute aggregated metrics
  const totalSessions = results.length;
  const latestResult = results[0] ?? null;

  const filteredResults = activeDomainFilter === 'all'
    ? results
    : results.filter(r => r.challengeType === activeDomainFilter);

  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6 + index);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const sessionCount = results.filter(result => {
      const resultDate = new Date(result.date);
      return `${resultDate.getFullYear()}-${String(resultDate.getMonth() + 1).padStart(2, '0')}-${String(resultDate.getDate()).padStart(2, '0')}` === dateKey;
    }).length;

    return {
      label: date.toLocaleDateString(undefined, { weekday: 'short' }),
      sessionCount,
    };
  });
  const maxDailySessions = Math.max(1, ...days.map(day => day.sessionCount));

  // Personal practice summary download handler
  const handleExportReport = () => {
    const reportData = {
      exportDate: new Date().toISOString(),
      latestAccuracyPercent: latestResult?.accuracy ?? null,
      latestReactionTimeMs: latestResult?.meanReactionTimeMs ?? null,
      consecutiveStreakDays: dailyStreak,
      totalCompletedSessions: totalSessions,
      sessionLog: results,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iTHINK_Practice_Summary_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Your practice, at a glance</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Your practice history</h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Review the exercise results you choose to record and reflect on what conditions may have shaped each session.
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 transition cursor-pointer self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          Export My Summary (JSON)
        </button>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Session count */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Practice Sessions</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-cyan-400 font-mono">{totalSessions}</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {totalSessions === 1 ? 'One session recorded' : `${totalSessions} sessions recorded`}
          </span>
        </div>

        {/* Reaction Time Card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Latest Reaction Time</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-400 font-mono">{latestResult ? `${latestResult.meanReactionTimeMs}ms` : 'Not yet recorded'}</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {latestResult ? 'Most recent exercise session' : 'Complete a session to begin'}
          </span>
        </div>

        {/* Global Accuracy Card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Latest Exercise Accuracy</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 font-mono">{latestResult ? `${latestResult.accuracy}%` : 'Not yet recorded'}</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {latestResult ? 'Most recent exercise session' : 'Complete a session to begin'}
          </span>
        </div>

        {/* Practice streak */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Daily Practice Streak</span>
            <Flame className="w-4 h-4 text-amber-400 fill-current" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400 font-mono">{dailyStreak} Days</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Consecutive days with at least one recorded session
          </span>
        </div>
      </div>

      {/* Seven-day practice summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Practice sessions · last 7 days</h3>
              <p className="text-xs text-slate-400">A simple count of the exercise sessions you recorded each day</p>
            </div>
          </div>

          <div className="h-52 flex items-end justify-between gap-3 pt-4 border-b border-slate-800">
            {days.map((day, index) => {
              const hasData = day.sessionCount > 0;
              const isToday = index === days.length - 1;
              return (
                <div
                  key={`${day.label}-${index}`}
                  className="group flex flex-1 flex-col items-center gap-2"
                  aria-label={`${day.label}: ${day.sessionCount} ${day.sessionCount === 1 ? 'session' : 'sessions'}`}
                  title={`${day.sessionCount} ${day.sessionCount === 1 ? 'session' : 'sessions'}`}
                >
                  <span className="text-[11px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.sessionCount}
                  </span>
                  <div className="w-full bg-slate-800 rounded-t-lg overflow-hidden h-40 flex items-end">
                    <div
                      className={`w-full transition-all duration-500 rounded-t-lg ${
                        isToday
                          ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-lg shadow-cyan-500/20'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                      style={{ height: `${day.sessionCount === 0 ? 0 : Math.max(15, day.sessionCount / maxDailySessions * 100)}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${isToday ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}>
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
          {totalSessions === 0 && (
            <p className="text-xs text-slate-400">
              Your daily session counts will appear here after you complete an exercise.
            </p>
          )}

          <div className="text-[11px] text-slate-400">
            Session counts show when you practiced; they do not indicate cognitive progress or a brain-health change.
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">A note on these results</h3>
            <p className="text-xs text-slate-400">What this tracker can and cannot tell you</p>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            These are descriptive summaries of your own exercise sessions. They do not diagnose, measure brain activity, or establish that a cognitive ability has changed.
          </p>
          <p className="text-sm text-slate-400 leading-relaxed">
            Results can vary with sleep, stress, familiarity, device, and surroundings. Use the numbers as prompts for reflection, not as clinical guidance.
          </p>
        </div>
      </div>

      {/* Session History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Your Practice History</h3>
            <p className="text-xs text-slate-400">A clear log of your recent focus and memory practices</p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            {(['all', 'stroop', 'nback', 'gonogo', 'trailmaking'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveDomainFilter(tab)}
                className={`px-3 py-1 rounded capitalize font-medium transition cursor-pointer ${
                  activeDomainFilter === tab
                    ? 'bg-slate-800 text-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'all' ? 'All Practices' : tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4 rounded-l-lg">Exercise</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Reaction Speed</th>
                <th className="py-3 px-4 rounded-r-lg">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center font-sans text-sm text-slate-400">
                    {totalSessions === 0
                      ? 'No practice sessions recorded yet. Complete an exercise to start your history.'
                      : 'No sessions match this exercise filter.'}
                  </td>
                </tr>
              )}
              {filteredResults.map(item => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-sans font-semibold text-white uppercase">
                    {item.challengeType}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-sans">
                    {new Date(item.date).toLocaleDateString()} · {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">
                    {item.accuracy}%
                  </td>
                  <td className="py-3 px-4 text-cyan-400">
                    {item.meanReactionTimeMs}ms
                  </td>
                  <td className="py-3 px-4 text-amber-400">
                    {item.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
