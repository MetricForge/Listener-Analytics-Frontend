// components/SessionLengthAnalysis.tsx
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SpotifyData {
  played_at: string;
  duration_ms: number;
}

interface Props {
  data: SpotifyData[];
}

export default function SessionLengthAnalysis({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  const { chartData, stats } = useMemo(() => {
    if (data.length === 0) return { chartData: [], stats: { avg: 0, median: 0, total: 0 } };

    // Sort by time
    const sorted = [...data].sort((a, b) => 
      new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
    );

    // Group into sessions (gap >20min = new session)
    const sessions: number[] = [];
    let currentSession = 0;
    const SESSION_GAP = 20 * 60 * 1000; // 20 minutes

    for (let i = 0; i < sorted.length; i++) {
      currentSession += sorted[i].duration_ms;
      
      if (i < sorted.length - 1) {
        const gap = new Date(sorted[i + 1].played_at).getTime() - new Date(sorted[i].played_at).getTime();
        if (gap > SESSION_GAP) {
          sessions.push(currentSession / (60 * 1000)); // Convert to minutes
          currentSession = 0;
        }
      }
    }
    if (currentSession > 0) {
      sessions.push(currentSession / (60 * 1000));
    }

    // Create buckets
    const buckets = [
      { label: '<15m', min: 0, max: 15, count: 0 },
      { label: '15-30m', min: 15, max: 30, count: 0 },
      { label: '30-60m', min: 30, max: 60, count: 0 },
      { label: '1-2h', min: 60, max: 120, count: 0 },
      { label: '2-4h', min: 120, max: 240, count: 0 },
      { label: '>4h', min: 240, max: Infinity, count: 0 },
    ];

    sessions.forEach(duration => {
      const bucket = buckets.find(b => duration >= b.min && duration < b.max);
      if (bucket) bucket.count++;
    });

    // Calculate stats
    const avg = sessions.reduce((a, b) => a + b, 0) / sessions.length;
    const sortedSessions = [...sessions].sort((a, b) => a - b);
    const median = sortedSessions[Math.floor(sortedSessions.length / 2)];

    return {
      chartData: buckets,
      stats: {
        avg: Math.round(avg),
        median: Math.round(median),
        total: sessions.length,
      },
    };
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-1">{payload[0].payload.label}</p>
          <p className="text-blue-300 text-sm">{payload[0].value} sessions</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-600/30">
            <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Session Lengths</h3>
        </div>

        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="text-blue-300 text-xs font-semibold bg-blue-900/30 px-2 py-1 rounded border border-blue-700/30 hover:bg-blue-900/50 transition-colors"
          >
            SESSIONS
          </button>
          {showTooltip && (
            <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-64">
              <div className="text-xs text-gray-300 space-y-2">
                <p className="font-semibold text-white mb-1">Listening Sessions</p>
                <p>A session is a continuous period of listening. Sessions separated by 20+ minute gaps.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30 text-center">
          <p className="text-gray-400 text-xs mb-1">Avg Length</p>
          <p className="text-blue-300 text-lg font-bold">{stats.avg}m</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30 text-center">
          <p className="text-gray-400 text-xs mb-1">Median</p>
          <p className="text-blue-300 text-lg font-bold">{stats.median}m</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30 text-center">
          <p className="text-gray-400 text-xs mb-1">Sessions</p>
          <p className="text-blue-300 text-lg font-bold">{stats.total}</p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="label" stroke="#9ca3af" style={{ fontSize: '11px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
          <Bar dataKey="count" fill="#60a5fa" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
