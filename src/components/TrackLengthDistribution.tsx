// components/TrackLengthDistribution.tsx
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SpotifyData {
  played_at: string;
  duration_ms: number;
  track_name: string;
  artist_name: string;
}

interface Props {
  data: SpotifyData[];
  limit?: number;
}

type TimeRange = '7d' | '1m' | '3m' | '6m' | '1y';

const TIME_RANGES = [
  { value: '7d' as TimeRange, label: '7 Days', days: 7 },
  { value: '1m' as TimeRange, label: '1 Month', days: 30 },
  { value: '3m' as TimeRange, label: '3 Months', days: 90 },
  { value: '6m' as TimeRange, label: '6 Months', days: 180 },
  { value: '1y' as TimeRange, label: '1 Year', days: 365 },
];

export default function TrackLengthDistribution({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');

  const { chartData, stats } = useMemo(() => {
    const now = new Date();
    const selectedRange = TIME_RANGES.find(r => r.value === timeRange)!;
    const rangeStart = new Date(now.getTime() - selectedRange.days * 24 * 60 * 60 * 1000);

    const filteredData = data.filter(track => {
      const trackDate = new Date(track.played_at);
      return trackDate >= rangeStart && trackDate <= now;
    });

    // Define length buckets (in seconds)
    const buckets = [
      { label: '<2m', min: 0, max: 120 },
      { label: '2-3m', min: 120, max: 180 },
      { label: '3-4m', min: 180, max: 240 },
      { label: '4-5m', min: 240, max: 300 },
      { label: '5-6m', min: 300, max: 360 },
      { label: '>6m', min: 360, max: Infinity },
    ];

    const bucketCounts = buckets.map(bucket => ({
      ...bucket,
      count: 0,
    }));

    filteredData.forEach(track => {
      const seconds = track.duration_ms / 1000;
      const bucket = bucketCounts.find(b => seconds >= b.min && seconds < b.max);
      if (bucket) bucket.count++;
    });

    // Calculate stats
    const durations = filteredData.map(t => t.duration_ms);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const sortedDurations = [...durations].sort((a, b) => a - b);
    const medianDuration = sortedDurations[Math.floor(sortedDurations.length / 2)];
    
    return {
      chartData: bucketCounts,
      stats: {
        avg: Math.round(avgDuration / 1000),
        median: Math.round(medianDuration / 1000),
        shortest: Math.round(Math.min(...durations) / 1000),
        longest: Math.round(Math.max(...durations) / 1000),
      },
    };
  }, [data, timeRange]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-1">{payload[0].payload.label}</p>
          <p className="text-orange-300 text-sm">{payload[0].value} tracks</p>
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
          <div className="p-2 rounded-lg bg-orange-600/30">
            <svg className="w-5 h-5 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Track Length Preferences</h3>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="text-xs font-semibold bg-gray-900 text-orange-300 px-2 py-1.5 rounded border border-orange-700/30 hover:bg-gray-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {TIME_RANGES.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>

          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-orange-300 text-xs font-semibold bg-orange-900/30 px-2 py-1 rounded border border-orange-700/30 hover:bg-orange-900/50 transition-colors"
            >
              LENGTH
            </button>
            {showTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-72">
                <div className="text-xs text-gray-300 space-y-2">
                  <p className="font-semibold text-white mb-1">Track Length Analysis</p>
                  <p>Distribution of song lengths you listen to. Do you prefer short bangers or epic journeys?</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30 text-center">
          <p className="text-gray-400 text-xs mb-1">Average</p>
          <p className="text-orange-300 text-lg font-bold">{formatTime(stats.avg)}</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30 text-center">
          <p className="text-gray-400 text-xs mb-1">Median</p>
          <p className="text-orange-300 text-lg font-bold">{formatTime(stats.median)}</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30 text-center">
          <p className="text-gray-400 text-xs mb-1">Shortest</p>
          <p className="text-green-300 text-lg font-bold">{formatTime(stats.shortest)}</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30 text-center">
          <p className="text-gray-400 text-xs mb-1">Longest</p>
          <p className="text-blue-300 text-lg font-bold">{formatTime(stats.longest)}</p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="label" stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(251, 146, 60, 0.1)' }} />
          <Bar dataKey="count" fill="#fb923c" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
            {/* Dynamic Insights */}
      <div className="mt-6 pt-4 border-t border-gray-700/50">
        <p className="text-xs font-semibold text-orange-300 mb-3">💡 Listening Insights</p>
        <div className="space-y-2">
          {/* Insight 1: Preference indicator */}
          {(() => {
            const totalTracks = chartData.reduce((sum, bucket) => sum + bucket.count, 0);
            const shortTracks = chartData.slice(0, 2).reduce((sum, bucket) => sum + bucket.count, 0); // <3min
            const longTracks = chartData.slice(4).reduce((sum, bucket) => sum + bucket.count, 0); // >5min
            const shortPercent = Math.round((shortTracks / totalTracks) * 100);
            const longPercent = Math.round((longTracks / totalTracks) * 100);
            
            if (shortPercent > 50) {
              return (
                <p className="text-xs text-gray-300">
                  🎵 <strong className="text-white">{shortPercent}%</strong> of tracks are under 3 minutes, indicating a preference for <strong className="text-orange-300">quick, energetic songs</strong>.
                </p>
              );
            } else if (longPercent > 40) {
              return (
                <p className="text-xs text-gray-300">
                  🎸 <strong className="text-white">{longPercent}%</strong> of tracks exceed 5 minutes, showing an affinity for <strong className="text-orange-300">epic, immersive journeys</strong>.
                </p>
              );
            } else {
              return (
                <p className="text-xs text-gray-300">
                  ⚖️ Listening patterns show a <strong className="text-orange-300">balanced distribution</strong> across song lengths - versatile taste profile.
                </p>
              );
            }
          })()}
          
          {/* Insight 2: Average vs Median comparison */}
          {(() => {
            const diff = Math.abs(stats.avg - stats.median);
            if (diff > 30) {
              return stats.avg > stats.median ? (
                <p className="text-xs text-gray-300">
                  📊 The <strong className="text-white">average ({formatTime(stats.avg)})</strong> exceeds the <strong className="text-white">median ({formatTime(stats.median)})</strong> - a few longer tracks are pulling the distribution upward.
                </p>
              ) : (
                <p className="text-xs text-gray-300">
                  📊 The <strong className="text-white">median ({formatTime(stats.median)})</strong> exceeds the <strong className="text-white">average ({formatTime(stats.avg)})</strong> - many short tracks are skewing the distribution.
                </p>
              );
            }
            return null;
          })()}
          
          {/* Insight 3: Extreme tracks */}
          {(() => {
            if (stats.longest > 600) { // 10+ minutes
              return (
                <p className="text-xs text-gray-300">
                  🔥 At least one <strong className="text-orange-300">epic {formatTime(stats.longest)} track</strong> appears in the collection - serious dedication to extended compositions.
                </p>
              );
            } else if (stats.shortest < 90) { // <1.5 minutes
              return (
                <p className="text-xs text-gray-300">
                  ⚡ The shortest track clocks in at just <strong className="text-orange-300">{formatTime(stats.shortest)}</strong> - quick hit vibes dominate the lower end.
                </p>
              );
            }
            return null;
          })()}
          
          {/* Insight 4: Sweet spot */}
          {(() => {
            const maxBucket = chartData.reduce((max, bucket) => 
              bucket.count > max.count ? bucket : max
            );
            return (
              <p className="text-xs text-gray-300">
                🎯 The sweet spot is <strong className="text-orange-300">{maxBucket.label}</strong> with <strong className="text-white">{maxBucket.count} tracks</strong> - the most popular duration range.
              </p>
            );
          })()}
        </div>
      </div>

    </div>
  );
}
