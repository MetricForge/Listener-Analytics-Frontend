// components/TopArtistsChart.tsx
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SpotifyData {
  played_at: string;
  artist_name: string;
  duration_ms: number;
}

interface Props {
  data: SpotifyData[];
  limit?: number;
}

type TimeRange = '7d' | '1m' | '3m' | '6m' | '1y';

const TIME_RANGES = [
  { value: '7d' as TimeRange, label: 'Last 7 Days', days: 7 },
  { value: '1m' as TimeRange, label: 'Last Month', days: 30 },
  { value: '3m' as TimeRange, label: '3 Months', days: 90 },
  { value: '6m' as TimeRange, label: '6 Months', days: 180 },
  { value: '1y' as TimeRange, label: '1 Year', days: 365 },
];

export default function TopArtistsChart({ data, limit = 10 }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [metric, setMetric] = useState<'plays' | 'time'>('plays');
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');

  const chartData = useMemo(() => {
    const now = new Date();
    const selectedRange = TIME_RANGES.find(r => r.value === timeRange)!;
    const rangeStart = new Date(now.getTime() - selectedRange.days * 24 * 60 * 60 * 1000);

    // Filter data by time range
    const filteredData = data.filter(track => {
      const trackDate = new Date(track.played_at);
      return trackDate >= rangeStart && trackDate <= now;
    });

    const artistStats = new Map<string, { plays: number; duration: number }>();

    filteredData.forEach(track => {
      const current = artistStats.get(track.artist_name) || { plays: 0, duration: 0 };
      artistStats.set(track.artist_name, {
        plays: current.plays + 1,
        duration: current.duration + track.duration_ms,
      });
    });

    const sorted = Array.from(artistStats.entries())
      .map(([name, stats]) => ({
        name,
        plays: stats.plays,
        totalMinutes: Math.round((stats.duration * 0.95) / 60000), // Total minutes
        hours: Math.floor((stats.duration * 0.95) / 3600000), // Hours
        minutes: Math.round(((stats.duration * 0.95) % 3600000) / 60000), // Remaining minutes
      }))
      .sort((a, b) => metric === 'plays' ? b.plays - a.plays : b.totalMinutes - a.totalMinutes)
      .slice(0, limit);

    return sorted;
  }, [data, metric, limit, timeRange]);

// Calculate difference between #1 and #2
    const topComparison = useMemo(() => {
      if (chartData.length < 2) return null;
  
      const first = chartData[0];
      const second = chartData[1];
  
      if (metric === 'plays') {
        const diff = first.plays - second.plays;
        const percent = Math.round((diff / second.plays) * 100);
        const playText = diff === 1 ? 'play' : 'plays';
        return (
          <>
            {first.name} had {diff.toLocaleString()} {playText}{' '}
            <span className="text-green-400 text-[0.7rem]">(+{percent}%)</span>
            {' '}more than {second.name}
          </>
        );
      } else {
        const diffMinutes = first.totalMinutes - second.totalMinutes;
        const percent = Math.round((diffMinutes / second.totalMinutes) * 100);
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
    
        if (hours > 0) {
          return (
            <>
              {first.name} had {hours}h {mins}m{' '}
              <span className="text-green-400 text-[0.7rem]">(+{percent}%)</span>
              {' '}more than {second.name}
            </>
          );
        } else {
          return (
            <>
              {first.name} had {mins}m{' '}
              <span className="text-green-400 text-[0.7rem]">(+{percent}%)</span>
              {' '}more than {second.name}
            </>
          );
        }
      }
    }, [chartData, metric]);


  const formatTime = (totalMinutes: number, hours: number, minutes: number) => {
    if (totalMinutes < 60) {
      return `${totalMinutes}m`;
    }
    return `${hours}h ${minutes}m`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-1">{data.name}</p>
          <p className="text-blue-300 text-sm">{data.plays} plays</p>
          <p className="text-purple-300 text-sm">{formatTime(data.totalMinutes, data.hours, data.minutes)} listening</p>
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
          <h3 className="text-lg font-semibold text-white">Top Artists</h3>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="text-xs font-semibold bg-gray-900 text-blue-300 px-2 py-1.5 rounded border border-blue-700/30 hover:bg-gray-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TIME_RANGES.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>

          {/* Metric Toggle */}
          <div className="flex bg-gray-900 rounded border border-gray-700/30">
            <button
              onClick={() => setMetric('plays')}
              className={`px-3 py-1 text-xs font-semibold rounded-l transition-colors ${
                metric === 'plays'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Plays
            </button>
            <button
              onClick={() => setMetric('time')}
              className={`px-3 py-1 text-xs font-semibold rounded-r transition-colors ${
                metric === 'time'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Time
            </button>
          </div>

          {/* Tooltip */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-blue-300 text-xs font-semibold bg-blue-900/30 px-2 py-1 rounded border border-blue-700/30 hover:bg-blue-900/50 transition-colors"
            >
              TOP
            </button>
            {showTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-72">
                <div className="text-xs text-gray-300 space-y-2">
                  <p className="font-semibold text-white mb-1">Top Artists Ranking</p>
                  <p>Your most-played artists ranked by either play count or total listening time for the selected period.</p>
                  <div className="pt-2 border-t border-gray-700/50 space-y-1">
                    <p><strong className="text-blue-400">Plays:</strong> Total number of tracks played from each artist</p>
                    <p><strong className="text-purple-400">Time:</strong> Total hours and minutes spent listening (95% adjusted)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis 
            dataKey="name" 
            type="category" 
            stroke="#9ca3af" 
            style={{ fontSize: '12px' }}
            width={90}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
          <Bar 
            dataKey={metric === 'plays' ? 'plays' : 'totalMinutes'} 
            fill={metric === 'plays' ? '#60a5fa' : '#a78bfa'}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-700/50">
            <p className="text-xs text-gray-400 text-center">
            Showing top {chartData.length} artists by {metric === 'plays' ? 'play count' : 'listening time'}
            {topComparison && (
                <>
                {' • '}
                <span className="text-white">{topComparison}</span>
                </>
            )}
            </p>
        </div>
    </div>
  );
}
