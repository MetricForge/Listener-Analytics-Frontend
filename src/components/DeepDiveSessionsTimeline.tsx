// components/DeepDiveSessionsTimeline.tsx
import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SpotifyData {
  played_at: string;
  duration_ms: number;
  artist_name?: string;
  track_name?: string;
}

interface Props {
  data: SpotifyData[];
}

type TimeRange = '7d' | '1m' | '3m' | '6m' | '1y';

const TIME_RANGES = [
  { value: '7d' as TimeRange, label: 'Last 7 Days', days: 7 },
  { value: '1m' as TimeRange, label: 'Last Month', days: 30 },
  { value: '3m' as TimeRange, label: '3 Months', days: 90 },
  { value: '6m' as TimeRange, label: '6 Months', days: 180 },
  { value: '1y' as TimeRange, label: '1 Year', days: 365 },
];

export default function DeepDiveSessionsTimeline({ data }: Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');
  const [showBadgeTooltip, setShowBadgeTooltip] = useState(false);

  // Filter data by time range
  const filteredData = useMemo(() => {
    const now = new Date();
    const days = TIME_RANGES.find(r => r.value === timeRange)?.days || 30;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    return data.filter(track => {
      const trackDate = new Date(track.played_at);
      return trackDate >= startDate && trackDate <= now;
    });
  }, [data, timeRange]);

  const sessionAnalysis = useMemo(() => {
    if (filteredData.length === 0) return null;

    // Sort by time
    const sorted = [...filteredData].sort((a, b) => 
      new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
    );

    // Build sessions
    const SESSION_GAP = 20 * 60 * 1000; // 20 minutes
    interface Session {
      start: Date;
      end: Date;
      tracks: SpotifyData[];
      duration: number;
      artists: Set<string>;
    }

    const sessions: Session[] = [];
    let currentTracks: SpotifyData[] = [sorted[0]];
    let sessionStart = new Date(sorted[0].played_at);

    for (let i = 1; i < sorted.length; i++) {
      const gap = new Date(sorted[i].played_at).getTime() - 
                   new Date(sorted[i - 1].played_at).getTime();
      
      if (gap > SESSION_GAP) {
        const artists = new Set(
          currentTracks
            .map(t => t.artist_name)
            .filter((name): name is string => Boolean(name))
        );
        const duration = currentTracks.reduce((sum, t) => sum + t.duration_ms, 0);
        sessions.push({
          start: sessionStart,
          end: new Date(sorted[i - 1].played_at),
          tracks: currentTracks,
          duration,
          artists,
        });
        // Start new session
        currentTracks = [sorted[i]];
        sessionStart = new Date(sorted[i].played_at);
      } else {
        currentTracks.push(sorted[i]);
      }
    }

    // Add final session
    if (currentTracks.length > 0) {
      const artists = new Set(
        currentTracks
          .map(t => t.artist_name)
          .filter((name): name is string => Boolean(name))
      );
      const duration = currentTracks.reduce((sum, t) => sum + t.duration_ms, 0);
      sessions.push({
        start: sessionStart,
        end: new Date(sorted[sorted.length - 1].played_at),
        tracks: currentTracks,
        duration,
        artists,
      });
    }

    // Find marathon sessions (>2 hours)
    const marathonSessions = sessions.filter(s => s.duration > 2 * 60 * 60 * 1000);

    // Calculate stats
    const avgDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;
    const longestSession = sessions.reduce((max, s) => s.duration > max.duration ? s : max);
    
    // Find most common session hour
    const sessionHours = sessions.map(s => s.start.getHours());
    const hourCounts = new Map<number, number>();
    sessionHours.forEach(h => hourCounts.set(h, (hourCounts.get(h) || 0) + 1));
    const mostCommonHour = Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 0;
    
    const formatHour = (h: number) => {
      if (h === 0) return '12AM';
      if (h < 12) return `${h}AM`;
      if (h === 12) return '12PM';
      return `${h - 12}PM`;
    };

    // Create chart data - group sessions by duration buckets
    const buckets = [
      { name: '<15min', min: 0, max: 15 * 60 * 1000, count: 0, color: '#9CA3AF' },
      { name: '15-30min', min: 15 * 60 * 1000, max: 30 * 60 * 1000, count: 0, color: '#60a5fa' },
      { name: '30-60min', min: 30 * 60 * 1000, max: 60 * 60 * 1000, count: 0, color: '#a78bfa' },
      { name: '1-2hrs', min: 60 * 60 * 1000, max: 2 * 60 * 60 * 1000, count: 0, color: '#f59e0b' },
      { name: '2hrs+', min: 2 * 60 * 60 * 1000, max: Infinity, count: 0, color: '#ef4444' },
    ];

    sessions.forEach(s => {
      const bucket = buckets.find(b => s.duration >= b.min && s.duration < b.max);
      if (bucket) bucket.count++;
    });

    // Top artist in marathons
    const marathonArtists = new Map<string, number>();
    marathonSessions.forEach(s => {
      s.tracks.forEach(t => {
        if (t.artist_name) {
          marathonArtists.set(t.artist_name, (marathonArtists.get(t.artist_name) || 0) + 1);
        }
      });
    });

    const topMarathonArtist = Array.from(marathonArtists.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      totalSessions: sessions.length,
      marathonCount: marathonSessions.length,
      avgDuration: (avgDuration / 60000).toFixed(0),
      longestDuration: (longestSession.duration / 60000).toFixed(0),
      longestTracks: longestSession.tracks.length,
      mostCommonHour: formatHour(mostCommonHour),
      topMarathonArtist,
      chartData: buckets,
    };
  }, [filteredData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-700 border border-gray-600 rounded shadow-xl p-3">
          <p className="text-white font-bold mb-1">{payload[0].payload.name}</p>
          <p className="text-gray-300 text-sm">
            {payload[0].value} sessions
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomCursor = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (!payload || !payload[0]) return null;
  
  const barColor = payload[0].payload.color;
  
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={`${barColor}30`} // 30 is hex for ~19% opacity
      style={{ pointerEvents: 'none' }}
    />
  );
};
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header with Filter and Badge */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Deep Dive Sessions</h2>
          <p className="text-gray-400 text-sm">
            Your listening session patterns and binge behavior
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Dropdown Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="text-xs font-semibold bg-gray-900 text-purple-300 px-2 py-1.5 rounded border border-purple-700/30 hover:bg-gray-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {TIME_RANGES.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>

          {/* Badge with Tooltip */}
          <div 
            className="relative"
            onMouseEnter={() => setShowBadgeTooltip(true)}
            onMouseLeave={() => setShowBadgeTooltip(false)}
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-900/30 text-purple-300 border border-purple-700/30">
              Sessions
            </span>
            {showBadgeTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-80">
                <p className="text-white text-xs font-semibold mb-1">Session Analysis</p>
                <p className="text-gray-300 text-xs mb-2">
                  Applies session delimitation using 20-minute inactivity thresholds to aggregate listening events into continuous engagement periods.
                </p>
                <p className="text-gray-300 text-xs">
                  Analyzes engagement duration patterns, identifies extended sessions (120+ minutes), and examines content distribution across session length segments to reveal consumption intensity metrics.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {!sessionAnalysis ? (
        <p className="text-gray-400 text-sm">Not enough data to analyze sessions for this period</p>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Total Sessions</p>
              <p className="text-white font-bold text-2xl">{sessionAnalysis.totalSessions}</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Marathon Sessions</p>
              <p className="text-orange-400 font-bold text-2xl">{sessionAnalysis.marathonCount}</p>
              <p className="text-xs text-gray-500">2+ hours</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Avg Session</p>
              <p className="text-blue-400 font-bold text-2xl">{sessionAnalysis.avgDuration}</p>
              <p className="text-xs text-gray-500">minutes</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Longest Session</p>
              <p className="text-purple-400 font-bold text-2xl">{sessionAnalysis.longestDuration}</p>
              <p className="text-xs text-gray-500">min ({sessionAnalysis.longestTracks} tracks)</p>
            </div>
          </div>

          {/* Session Length Distribution */}
          <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
            <h3 className="text-white font-bold text-sm mb-4">Session Length Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sessionAnalysis.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
               <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={<CustomCursor />}
                />
                <Bar 
                  dataKey="count" 
                  radius={[8, 8, 0, 0]}
                >
                  {sessionAnalysis.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

        {/* Session Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📊</span>
              <h3 className="text-white font-bold">Extended Engagement</h3>
            </div>
            <p className="text-gray-300 text-sm mb-2">
              <span className="font-bold text-orange-400">{sessionAnalysis.marathonCount}</span> extended sessions identified (120+ minute duration threshold)
            </p>
            <p className="text-gray-400 text-xs">
              Dominant content in extended sessions: <span className="text-orange-300 font-semibold">{sessionAnalysis.topMarathonArtist}</span>
            </p>
          </div>

          <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⏰</span>
              <h3 className="text-white font-bold">Temporal Patterns</h3>
            </div>
            <p className="text-gray-300 text-sm mb-2">
              Peak session initiation time: <span className="font-bold text-blue-400">{sessionAnalysis.mostCommonHour}</span>
            </p>
            <p className="text-gray-400 text-xs">
              Mean session duration: {sessionAnalysis.avgDuration} minutes
            </p>
          </div>
        </div>

        </>
      )}
    </div>
  );
}
