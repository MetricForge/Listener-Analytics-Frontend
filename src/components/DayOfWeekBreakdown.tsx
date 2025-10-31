// components/DayOfWeekBreakdown.tsx
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SpotifyData {
  played_at: string;
}

interface Props {
  data: SpotifyData[];
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DayOfWeekBreakdown({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  const chartData = useMemo(() => {
    const dayCounts = DAYS.map(day => ({ day: day.slice(0, 3), fullDay: day, plays: 0 }));

    data.forEach(track => {
      const date = new Date(track.played_at);
      const dayIndex = date.getDay();
      dayCounts[dayIndex].plays++;
    });

    return dayCounts;
  }, [data]);

  const { busiest, quietest, avgPlays } = useMemo(() => {
    const totalPlays = chartData.reduce((sum, day) => sum + day.plays, 0);
    const avg = Math.round(totalPlays / 7);
    const sorted = [...chartData].sort((a, b) => b.plays - a.plays);
    
    return {
      busiest: sorted[0],
      quietest: sorted[sorted.length - 1],
      avgPlays: avg,
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-1">{payload[0].payload.fullDay}</p>
          <p className="text-purple-300 text-sm">{payload[0].value.toLocaleString()} plays</p>
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
          <div className="p-2 rounded-lg bg-purple-600/30">
            <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Day of Week</h3>
        </div>

        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="text-purple-300 text-xs font-semibold bg-purple-900/30 px-2 py-1 rounded border border-purple-700/30 hover:bg-purple-900/50 transition-colors"
          >
            WEEKLY
          </button>
          {showTooltip && (
            <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-64">
              <div className="text-xs text-gray-300 space-y-2">
                <p className="font-semibold text-white mb-1">Weekly Patterns</p>
                <p>Shows total plays for each day of the week. Which days do you listen most?</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-700/30 text-center">
          <p className="text-gray-400 text-xs mb-1">Busiest Day</p>
          <p className="text-purple-300 text-sm font-bold">{busiest.day}</p>
          <p className="text-gray-500 text-xs">{busiest.plays.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30 text-center">
          <p className="text-gray-400 text-xs mb-1">Avg/Day</p>
          <p className="text-white text-sm font-bold">{avgPlays.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30 text-center">
          <p className="text-gray-400 text-xs mb-1">Quietest Day</p>
          <p className="text-gray-400 text-sm font-bold">{quietest.day}</p>
          <p className="text-gray-500 text-xs">{quietest.plays.toLocaleString()}</p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '11px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }} />
          <Bar dataKey="plays" fill="#a78bfa" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
