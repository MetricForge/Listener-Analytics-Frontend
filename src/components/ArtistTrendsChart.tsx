// components/ArtistTrendsChart.tsx
import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SpotifyData {
  played_at: string;
  artist_name: string;
}

interface Props {
  data: SpotifyData[];
  topN?: number;
}

type TimeRange = '7d' | '1m' | '3m' | '6m' | '1y';

const TIME_RANGES = [
  { value: '7d' as TimeRange, label: 'Last 7 Days', days: 7, weeks: 1 },
  { value: '1m' as TimeRange, label: 'Last Month', days: 30, weeks: 4 },
  { value: '3m' as TimeRange, label: '3 Months', days: 90, weeks: 12 },
  { value: '6m' as TimeRange, label: '6 Months', days: 180, weeks: 26 },
  { value: '1y' as TimeRange, label: '1 Year', days: 365, weeks: 52 },
];

const COLORS = ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f87171'];

export default function ArtistTrendsChart({ data, topN = 5 }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('3m');
  const [show4WeekSMA, setShow4WeekSMA] = useState(true);
  const [show8WeekSMA, setShow8WeekSMA] = useState(false);
  const [show12WeekSMA, setShow12WeekSMA] = useState(false);
  
  // Track which artists are selected (default: top 3)
  const [selectedArtists, setSelectedArtists] = useState<Set<string>>(new Set());

  // Calculate SMA
  const calculateSMA = (values: number[], period: number): (number | null)[] => {
    return values.map((_, index) => {
      if (index < period - 1) return null;
      const slice = values.slice(index - period + 1, index + 1);
      return slice.reduce((a, b) => a + b, 0) / period;
    });
  };

  const chartData = useMemo(() => {
    const now = new Date();
    const selectedRange = TIME_RANGES.find(r => r.value === timeRange)!;
    const rangeStart = new Date(now.getTime() - selectedRange.days * 24 * 60 * 60 * 1000);

    const filteredData = data.filter(track => {
      const trackDate = new Date(track.played_at);
      return trackDate >= rangeStart && trackDate <= now;
    });

    // Find top N artists
    const artistCounts = new Map<string, number>();
    filteredData.forEach(track => {
      artistCounts.set(track.artist_name, (artistCounts.get(track.artist_name) || 0) + 1);
    });

    const topArtists = Array.from(artistCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([name]) => name);

    // Initialize selected artists if empty (default: top 3)
    if (selectedArtists.size === 0) {
      setSelectedArtists(new Set(topArtists.slice(0, 3)));
    }

    // Group by week
    const numWeeks = selectedRange.weeks;
    const weeklyData = new Map<string, Map<string, number>>();
    
    filteredData.forEach(track => {
      const trackDate = new Date(track.played_at);
      const weekDiff = Math.floor((now.getTime() - trackDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const weekLabel = `W${numWeeks - weekDiff}`;
      
      if (weekDiff >= 0 && weekDiff < numWeeks) {
        if (!weeklyData.has(weekLabel)) {
          weeklyData.set(weekLabel, new Map());
        }
        
        const weekMap = weeklyData.get(weekLabel)!;
        if (topArtists.includes(track.artist_name)) {
          weekMap.set(track.artist_name, (weekMap.get(track.artist_name) || 0) + 1);
        }
      }
    });

    const sortedWeeks = Array.from(weeklyData.keys()).sort((a, b) => {
      const aNum = parseInt(a.substring(1));
      const bNum = parseInt(b.substring(1));
      return aNum - bNum;
    });

    const baseData = sortedWeeks.map(week => {
      const weekData: any = { week };
      const weekMap = weeklyData.get(week)!;
      topArtists.forEach(artist => {
        weekData[artist] = weekMap.get(artist) || 0;
      });
      return weekData;
    });

    // Calculate SMAs only for selected artists
    selectedArtists.forEach(artist => {
      if (!topArtists.includes(artist)) return;
      
      const values = baseData.map(d => d[artist]);
      
      if (show4WeekSMA) {
        const sma4 = calculateSMA(values, 4);
        baseData.forEach((d, i) => {
          d[`${artist}_SMA4`] = sma4[i];
        });
      }
      
      if (show8WeekSMA) {
        const sma8 = calculateSMA(values, 8);
        baseData.forEach((d, i) => {
          d[`${artist}_SMA8`] = sma8[i];
        });
      }
      
      if (show12WeekSMA) {
        const sma12 = calculateSMA(values, 12);
        baseData.forEach((d, i) => {
          d[`${artist}_SMA12`] = sma12[i];
        });
      }
    });

    return { data: baseData, topArtists };
  }, [data, topN, timeRange, show4WeekSMA, show8WeekSMA, show12WeekSMA, selectedArtists]);

  const toggleArtist = (artist: string) => {
    const newSelected = new Set(selectedArtists);
    if (newSelected.has(artist)) {
      newSelected.delete(artist);
    } else {
      newSelected.add(artist);
    }
    setSelectedArtists(newSelected);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload
            .filter((entry: any) => !entry.dataKey.includes('SMA'))
            .sort((a: any, b: any) => b.value - a.value)
            .map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: {entry.value} plays
              </p>
            ))}
          {payload
            .filter((entry: any) => entry.dataKey.includes('SMA'))
            .map((entry: any, index: number) => (
              <p key={index} className="text-xs text-gray-400" style={{ color: entry.color }}>
                {entry.name}: {entry.value?.toFixed(1)} avg
              </p>
            ))}
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
          <div className="p-2 rounded-lg bg-cyan-600/30">
            <svg className="w-5 h-5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Artist Listening Trends</h3>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Time Range */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="text-xs font-semibold bg-gray-900 text-cyan-300 px-2 py-1.5 rounded border border-cyan-700/30 hover:bg-gray-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {TIME_RANGES.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>

          {/* SMA Toggles */}
          <div className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded border border-cyan-700/30">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={show4WeekSMA}
                onChange={(e) => setShow4WeekSMA(e.target.checked)}
                className="w-3 h-3 rounded accent-cyan-500"
              />
              <span className="text-xs text-cyan-300 font-medium">4W</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={show8WeekSMA}
                onChange={(e) => setShow8WeekSMA(e.target.checked)}
                className="w-3 h-3 rounded accent-cyan-500"
              />
              <span className="text-xs text-cyan-300 font-medium">8W</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={show12WeekSMA}
                onChange={(e) => setShow12WeekSMA(e.target.checked)}
                className="w-3 h-3 rounded accent-cyan-500"
              />
              <span className="text-xs text-cyan-300 font-medium">12W</span>
            </label>
          </div>

          {/* Tooltip */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-cyan-300 text-xs font-semibold bg-cyan-900/30 px-2 py-1 rounded border border-cyan-700/30 hover:bg-cyan-900/50 transition-colors"
            >
              TRENDS
            </button>
            {showTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-80">
                <div className="text-xs text-gray-300 space-y-2">
                  <p className="font-semibold text-white mb-1">Artist Listening Trends</p>
                  <p>
                    Track listening patterns for selected artists. Toggle artists below chart to compare.
                  </p>
                  <div className="pt-2 border-t border-gray-700/50 space-y-1">
                    <p><strong className="text-cyan-400">Solid Lines:</strong> Weekly play counts</p>
                    <p><strong className="text-cyan-400">Dashed Lines:</strong> Moving averages (smoothed trends)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.data.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="week" stroke="#9ca3af" style={{ fontSize: '11px' }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            
            {/* Only render lines for selected artists */}
            {chartData.topArtists
              .filter(artist => selectedArtists.has(artist))
              .map((artist, _index) => {
                const colorIndex = chartData.topArtists.indexOf(artist);
                return (
                  <Line
                    key={artist}
                    type="monotone"
                    dataKey={artist}
                    stroke={COLORS[colorIndex % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                );
              })}
            
            {/* SMA Lines for selected artists */}
            {show4WeekSMA && chartData.topArtists
              .filter(artist => selectedArtists.has(artist))
              .map(artist => {
                const colorIndex = chartData.topArtists.indexOf(artist);
                return (
                  <Line
                    key={`${artist}_SMA4`}
                    type="monotone"
                    dataKey={`${artist}_SMA4`}
                    stroke={COLORS[colorIndex % COLORS.length]}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    opacity={0.6}
                    name={`${artist} (4W SMA)`}
                  />
                );
              })}
            
            {show8WeekSMA && chartData.topArtists
              .filter(artist => selectedArtists.has(artist))
              .map(artist => {
                const colorIndex = chartData.topArtists.indexOf(artist);
                return (
                  <Line
                    key={`${artist}_SMA8`}
                    type="monotone"
                    dataKey={`${artist}_SMA8`}
                    stroke={COLORS[colorIndex % COLORS.length]}
                    strokeWidth={2}
                    strokeDasharray="10 5"
                    dot={false}
                    opacity={0.4}
                    name={`${artist} (8W SMA)`}
                  />
                );
              })}
            
            {show12WeekSMA && chartData.topArtists
              .filter(artist => selectedArtists.has(artist))
              .map(artist => {
                const colorIndex = chartData.topArtists.indexOf(artist);
                return (
                  <Line
                    key={`${artist}_SMA12`}
                    type="monotone"
                    dataKey={`${artist}_SMA12`}
                    stroke={COLORS[colorIndex % COLORS.length]}
                    strokeWidth={3}
                    strokeDasharray="15 5"
                    dot={false}
                    opacity={0.3}
                    name={`${artist} (12W SMA)`}
                  />
                );
              })}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-[400px] text-gray-400">
          <p className="text-sm">Not enough data to show trends</p>
        </div>
      )}

      {/* Artist Selection Chips */}
      <div className="mt-6 pt-4 border-t border-gray-700/50">
        <p className="text-xs text-gray-400 mb-3">Select artists to display:</p>
        <div className="flex flex-wrap gap-2">
          {chartData.topArtists.map((artist, index) => {
            const isSelected = selectedArtists.has(artist);
            const color = COLORS[index % COLORS.length];
            
            return (
              <button
                key={artist}
                onClick={() => toggleArtist(artist)}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all
                  ${isSelected 
                    ? 'bg-cyan-900/30 border-cyan-600/50' 
                    : 'bg-gray-900/50 border-gray-700/50 opacity-50 hover:opacity-75'
                  }
                `}
              >
                {/* Color indicator */}
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {/* Rank badge */}
                <span className="text-[0.7rem] text-gray-400 font-semibold">#{index + 1}</span>
                {/* Artist name */}
                <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                  {artist}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
