// components/ListeningStats.tsx
import { useState, useMemo } from 'react';

interface SpotifyData {
  played_at: string;
  track_name: string;
  artist_name: string;
  album_name: string;
  duration_ms: number;
  featured_artists: string | null;
  genres: string | null;
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

export default function ListeningStats({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');

  const stats = useMemo(() => {
    const now = new Date();
    const selectedRange = TIME_RANGES.find(r => r.value === timeRange)!;
    
    // Current period
    const currentPeriodStart = new Date(now.getTime() - (selectedRange.days * 24 * 60 * 60 * 1000));
    const currentPeriodData = data.filter(track => {
      const trackDate = new Date(track.played_at);
      return trackDate >= currentPeriodStart && trackDate <= now;
    });

    // Previous period (same length)
    const previousPeriodEnd = currentPeriodStart;
    const previousPeriodStart = new Date(previousPeriodEnd.getTime() - (selectedRange.days * 24 * 60 * 60 * 1000));
    const previousPeriodData = data.filter(track => {
      const trackDate = new Date(track.played_at);
      return trackDate >= previousPeriodStart && trackDate < previousPeriodEnd;
    });

    // Calculate current period stats
    const totalTracks = currentPeriodData.length;
    const totalDuration = currentPeriodData.reduce((sum, track) => sum + track.duration_ms, 0);
    const estimatedListeningTime = totalDuration * 0.95;
    const listeningHours = Math.round(estimatedListeningTime / 3600000);
    const listeningMinutes = Math.round((estimatedListeningTime % 3600000) / 60000);
    
    const uniqueArtists = new Set(currentPeriodData.map(track => track.artist_name)).size;
    const diversityScore = totalTracks > 0 
      ? Math.round((uniqueArtists / totalTracks) * 100) 
      : 0;

    // Calculate previous period stats for comparison
    const prevTotalTracks = previousPeriodData.length;
    const prevTotalDuration = previousPeriodData.reduce((sum, track) => sum + track.duration_ms, 0);
    const prevEstimatedTime = prevTotalDuration * 0.95;
    const prevListeningHours = Math.round(prevEstimatedTime / 3600000);
    const prevUniqueArtists = new Set(previousPeriodData.map(track => track.artist_name)).size;
    const prevDiversityScore = prevTotalTracks > 0 
      ? Math.round((prevUniqueArtists / prevTotalTracks) * 100) 
      : 0;

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const timeChange = calculateChange(listeningHours, prevListeningHours);
    const tracksChange = calculateChange(totalTracks, prevTotalTracks);
    const artistsChange = calculateChange(uniqueArtists, prevUniqueArtists);
    const diversityChange = calculateChange(diversityScore, prevDiversityScore);

    return {
      totalTracks,
      listeningHours,
      listeningMinutes,
      uniqueArtists,
      diversityScore,
      timeChange,
      tracksChange,
      artistsChange,
      diversityChange,
      periodLabel: selectedRange.label,
    };
  }, [data, timeRange]);

  const renderChange = (change: number) => {
    if (change === 0) return null;
    const isPositive = change > 0;
    return (
      <span className={`text-xs ml-2 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '↑' : '↓'}{Math.abs(change)}%
      </span>
    );
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Header */}
     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-600/30">
            <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Listening Overview</h3>
        </div>

        {/* Time Range Selector + Tooltip */}
        <div className="flex items-center gap-2">
          {/* Time Range Dropdown */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="text-xs font-semibold bg-gray-900 text-blue-300 px-3 py-1.5 rounded border border-blue-700/30 hover:bg-gray-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TIME_RANGES.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>

          {/* Tooltip Badge */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              className="text-blue-300 text-xs font-semibold bg-blue-900/30 px-2 py-1 rounded border border-blue-700/30 hover:bg-blue-900/50 transition-colors cursor-pointer"
            >
              STATS
            </button>
            {showTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-80">
                <div className="text-xs text-gray-300 space-y-2">
                  <p className="font-semibold text-white mb-1">Listening Statistics</p>
                  <p>
                    Overview of your music listening habits for the selected time period.
                    Percentages show change compared to the previous period of the same length.
                  </p>
                  <div className="pt-2 border-t border-gray-700/50 space-y-1">
                    <p><span className="text-green-400">↑ %</span> = Increase from previous period</p>
                    <p><span className="text-red-400">↓ %</span> = Decrease from previous period</p>
                  </div>
                  <div className="pt-2 border-t border-gray-700/50 text-gray-400">
                    <p><strong className="text-white">Note:</strong> Listening time uses 95% of track duration to account for occasional skips.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Listening Time */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30 text-center">
          <p className="text-gray-400 text-xs mb-1">Listening Time</p>
          <div className="flex items-center justify-center">
            <p className="text-blue-300 text-2xl font-bold">
              {stats.listeningHours}
              <span className="text-sm text-gray-400 ml-1">h</span>
              {stats.listeningMinutes > 0 && (
                <>
                  {' '}{stats.listeningMinutes}
                  <span className="text-sm text-gray-400">m</span>
                </>
              )}
            </p>
            {renderChange(stats.timeChange)}
          </div>
          <p className="text-gray-500 text-xs mt-1">vs previous period</p>
        </div>

        {/* Total Tracks */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30 text-center">
          <p className="text-gray-400 text-xs mb-1">Tracks Played</p>
          <div className="flex items-center justify-center">
            <p className="text-purple-300 text-2xl font-bold">
              {stats.totalTracks.toLocaleString()}
            </p>
            {renderChange(stats.tracksChange)}
          </div>
          <p className="text-gray-500 text-xs mt-1">vs previous period</p>
        </div>

        {/* Unique Artists */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30 text-center">
          <p className="text-gray-400 text-xs mb-1">Unique Artists</p>
          <div className="flex items-center justify-center">
            <p className="text-green-300 text-2xl font-bold">
              {stats.uniqueArtists}
            </p>
            {renderChange(stats.artistsChange)}
          </div>
          <p className="text-gray-500 text-xs mt-1">vs previous period</p>
        </div>

        {/* Diversity Score */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30 text-center">
          <p className="text-gray-400 text-xs mb-1">Diversity Score</p>
          <div className="flex items-center justify-center">
            <p className="text-cyan-300 text-2xl font-bold">
              {stats.diversityScore}
              <span className="text-sm text-gray-400 ml-1">%</span>
            </p>
            {renderChange(stats.diversityChange)}
          </div>
          <p className="text-gray-500 text-xs mt-1">vs previous period</p>
        </div>
      </div>

      {/* Bottom Summary */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <p className="text-xs text-gray-400 text-center">
          Showing data for <span className="text-white font-semibold">{stats.periodLabel}</span>
          {' '}• Compared to previous period
        </p>
      </div>
    </div>
  );
}
