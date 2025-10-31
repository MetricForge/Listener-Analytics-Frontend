// components/ListeningVelocityChart.tsx
import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SpotifyData {
  played_at: string;
}

interface Props {
  data: SpotifyData[];
}

type TimeRange = '7d' | '1m' | '3m' | '6m' | 'all';

const TIME_RANGES = [
  { value: '7d' as TimeRange, label: 'Last 7 Days', days: 7 },
  { value: '1m' as TimeRange, label: 'Last Month', days: 30 },
  { value: '3m' as TimeRange, label: '3 Months', days: 90 },
  { value: '6m' as TimeRange, label: '6 Months', days: 180 },
  { value: 'all' as TimeRange, label: 'All Time', days: null },
];

export default function ListeningVelocityChart({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');

  const velocityData = useMemo(() => {
    if (!data || data.length === 0) return { chartData: [], stats: null };

    const now = new Date();
    const selectedRange = TIME_RANGES.find(r => r.value === timeRange)!;
    
    const filteredData = selectedRange.days
      ? data.filter(track => {
          const trackDate = new Date(track.played_at);
          const rangeStart = new Date(now.getTime() - selectedRange.days * 24 * 60 * 60 * 1000);
          return trackDate >= rangeStart && trackDate <= now;
        })
      : data;

    // Group by day
    const dailyCounts = new Map<string, number>();
    filteredData.forEach(track => {
      const date = new Date(track.played_at).toISOString().split('T')[0];
      dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
    });

    // Create chart data
    const chartData = Array.from(dailyCounts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({
        date,
        plays: count,
        displayDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));

    // Calculate statistics
    const plays = chartData.map(d => d.plays);
    const avgVelocity = plays.reduce((sum, p) => sum + p, 0) / plays.length;
    const maxVelocity = Math.max(...plays);
    const minVelocity = Math.min(...plays);
    
    // Calculate trend (last 7 days vs previous 7 days)
    const last7 = plays.slice(-7).reduce((sum, p) => sum + p, 0) / Math.min(7, plays.slice(-7).length);
    const prev7 = plays.slice(-14, -7).reduce((sum, p) => sum + p, 0) / Math.min(7, plays.slice(-14, -7).length);
    const trend = prev7 > 0 ? ((last7 - prev7) / prev7) * 100 : 0;

    // Classify velocity zones
    const threshold33 = avgVelocity * 0.7;
    const threshold66 = avgVelocity * 1.3;

    return {
      chartData,
      stats: {
        avgVelocity: avgVelocity.toFixed(1),
        maxVelocity,
        minVelocity,
        trend: trend.toFixed(1),
        trendDirection: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable',
        threshold33,
        threshold66
      }
    };
  }, [data, timeRange]);

  if (!velocityData.stats) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <p className="text-gray-400">No velocity data available</p>
      </div>
    );
  }

  const { chartData, stats } = velocityData;

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Listening Velocity</h2>
          <p className="text-gray-400 text-sm">Daily engagement rate over time</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Period Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="text-xs font-semibold bg-gray-900 text-blue-300 px-3 py-1.5 rounded border border-blue-700/30 hover:bg-gray-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TIME_RANGES.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>

          {/* Badge */}
          <div 
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-900/30 text-blue-300 border border-blue-700/30">
              Velocity
            </span>
            {showTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-80">
                <p className="text-white text-xs font-semibold mb-1">Engagement Velocity</p>
                <p className="text-gray-300 text-xs">
                  Measures daily listening activity rate. Higher velocity indicates increased engagement intensity over time.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-4">
          <p className="text-gray-400 text-xs mb-1">Average Velocity</p>
          <p className="text-white font-bold text-2xl">{stats.avgVelocity}</p>
          <p className="text-gray-500 text-xs">plays/day</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4">
          <p className="text-gray-400 text-xs mb-1">Peak Velocity</p>
          <p className="text-blue-300 font-bold text-2xl">{stats.maxVelocity}</p>
          <p className="text-gray-500 text-xs">max plays/day</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4">
          <p className="text-gray-400 text-xs mb-1">7-Day Trend</p>
          <div className="flex items-center gap-2">
            <p className={`font-bold text-2xl ${stats.trendDirection === 'up' ? 'text-green-400' : stats.trendDirection === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
              {stats.trend}%
            </p>
            {stats.trendDirection === 'up' && <span className="text-green-400">↑</span>}
            {stats.trendDirection === 'down' && <span className="text-red-400">↓</span>}
          </div>
          <p className="text-gray-500 text-xs">vs previous 7 days</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="displayDate" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '0.5rem',
                color: '#fff'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="plays" 
              stroke="#60a5fa" 
              fillOpacity={1} 
              fill="url(#velocityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Velocity Zone Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
          <span className="text-gray-400">Low (&lt;{stats.threshold33.toFixed(0)})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-gray-400">Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-400">High (&gt;{stats.threshold66.toFixed(0)})</span>
        </div>
      </div>
    </div>
  );
}
