// components/TopTracksList.tsx
import { useState, useMemo } from 'react';

interface SpotifyData {
  played_at: string;
  track_name: string;
  artist_name: string;
  album_name: string;
  album_image_url: string;
  duration_ms: number;
}

interface Props {
  data: SpotifyData[];
  limit?: number;
}

type TimeRange = '7d' | '1m' | '3m' | '6m' | '1y' | 'all';

const TIME_RANGES = [
  { value: '7d' as TimeRange, label: '7 Days', days: 7 },
  { value: '1m' as TimeRange, label: '1 Month', days: 30 },
  { value: '3m' as TimeRange, label: '3 Months', days: 90 },
  { value: '6m' as TimeRange, label: '6 Months', days: 180 },
  { value: '1y' as TimeRange, label: '1 Year', days: 365 },
  { value: 'all' as TimeRange, label: 'All Time', days: null },
];

export default function TopTracksList({ data, limit = 20 }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');

  const { topTracks, previousRankings } = useMemo(() => {
    const now = new Date();
    const selectedRange = TIME_RANGES.find(r => r.value === timeRange)!;
    
    // Current period
    const currentStart = selectedRange.days 
      ? new Date(now.getTime() - selectedRange.days * 24 * 60 * 60 * 1000)
      : new Date(0);
    
    const currentData = data.filter(track => {
      const trackDate = new Date(track.played_at);
      return trackDate >= currentStart && trackDate <= now;
    });

    // Previous period (same length)
    const previousStart = selectedRange.days
      ? new Date(currentStart.getTime() - selectedRange.days * 24 * 60 * 60 * 1000)
      : new Date(0);
    
    const previousData = selectedRange.days
      ? data.filter(track => {
          const trackDate = new Date(track.played_at);
          return trackDate >= previousStart && trackDate < currentStart;
        })
      : [];

    // Count plays per track - current period
    const trackCounts = new Map<string, {
      track_name: string;
      artist_name: string;
      album_name: string;
      album_image_url: string;
      duration_ms: number;
      plays: number;
    }>();

    currentData.forEach(track => {
      const key = `${track.track_name}|||${track.artist_name}`;
      const current = trackCounts.get(key);
      
      if (current) {
        current.plays++;
      } else {
        trackCounts.set(key, {
          track_name: track.track_name,
          artist_name: track.artist_name,
          album_name: track.album_name,
          album_image_url: track.album_image_url,
          duration_ms: track.duration_ms,
          plays: 1,
        });
      }
    });

    // Count plays per track - previous period
    const previousTrackCounts = new Map<string, number>();
    previousData.forEach(track => {
      const key = `${track.track_name}|||${track.artist_name}`;
      previousTrackCounts.set(key, (previousTrackCounts.get(key) || 0) + 1);
    });

    // Create previous rankings map (key -> rank)
    const prevRanked = Array.from(previousTrackCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [key], index) => {
        acc.set(key, index + 1);
        return acc;
      }, new Map<string, number>());

    const currentTopTracks = Array.from(trackCounts.values())
      .sort((a, b) => b.plays - a.plays)
      .slice(0, limit);

    return {
      topTracks: currentTopTracks,
      previousRankings: prevRanked,
    };
  }, [data, timeRange, limit]);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPositionChange = (currentRank: number, trackKey: string) => {
    const prevRank = previousRankings.get(trackKey);
    if (!prevRank) return { type: 'new', value: 0 };
    
    const change = prevRank - currentRank;
    if (change > 0) return { type: 'up', value: change };
    if (change < 0) return { type: 'down', value: Math.abs(change) };
    return { type: 'same', value: 0 };
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-pink-600/30">
            <svg className="w-5 h-5 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Top Tracks</h3>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="text-xs font-semibold bg-gray-900 text-pink-300 px-2 py-1.5 rounded border border-pink-700/30 hover:bg-gray-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-500"
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
              className="text-pink-300 text-xs font-semibold bg-pink-900/30 px-2 py-1 rounded border border-pink-700/30 hover:bg-pink-900/50 transition-colors"
            >
              TOP
            </button>
            {showTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-72">
                <div className="text-xs text-gray-300 space-y-2">
                  <p className="font-semibold text-white mb-1">Top Tracks Rankings</p>
                  <p>Ranked by play count for the selected period. Shows position changes vs previous period.</p>
                  <div className="pt-2 border-t border-gray-700/50 space-y-1 text-[0.7rem]">
                    <p><span className="text-green-400">↑</span> = Moved up</p>
                    <p><span className="text-red-400">↓</span> = Moved down</p>
                    <p><span className="text-cyan-400">NEW</span> = New entry</p>
                    <p><span className="text-yellow-400">🔥</span> = Stayed at #1</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tracks List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {topTracks.map((track, index) => {
          const trackKey = `${track.track_name}|||${track.artist_name}`;
          const posChange = getPositionChange(index + 1, trackKey);
          const isTopSpot = index === 0 && posChange.type === 'same';
          
          return (
            <div
              key={trackKey}
              className="flex items-center gap-3 bg-gray-900/50 rounded-lg p-2.5 border border-gray-700/30 hover:border-pink-700/50 transition-all group"
            >
              {/* Rank & Position Change */}
              <div className="flex-shrink-0 w-12 text-center">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-base font-bold text-pink-300">#{index + 1}</span>
                  {posChange.type === 'new' ? (
                    <span className="text-[0.65rem] font-bold text-cyan-400 bg-cyan-900/30 px-1.5 py-0.5 rounded">
                      NEW
                    </span>
                  ) : posChange.type === 'up' ? (
                    <span className="text-[0.65rem] font-bold text-green-400 flex items-center gap-0.5">
                      ↑ {posChange.value}
                    </span>
                  ) : posChange.type === 'down' ? (
                    <span className="text-[0.65rem] font-bold text-red-400 flex items-center gap-0.5">
                      ↓ {posChange.value}
                    </span>
                  ) : isTopSpot ? (
                    <span className="text-[0.65rem]">🔥</span>
                  ) : (
                    <span className="text-[0.65rem] text-gray-600">━</span>
                  )}
                </div>
              </div>

              {/* Album Art */}
              <img
                src={track.album_image_url}
                alt={track.album_name}
                className="w-12 h-12 rounded object-cover shadow-lg flex-shrink-0"
              />

              {/* Track Info */}
              <div className="flex-grow min-w-0">
                <h4 className="text-white font-semibold text-sm truncate group-hover:text-pink-300 transition-colors">
                  {track.track_name}
                </h4>
                <p className="text-gray-400 text-xs truncate">{track.artist_name}</p>
                <p className="text-gray-500 text-[0.7rem] truncate">{track.album_name}</p>
              </div>

              {/* Stats */}
              <div className="flex-shrink-0 text-right">
                <p className="text-pink-300 text-base font-bold">{track.plays}</p>
                <p className="text-gray-400 text-[0.65rem]">plays</p>
                <p className="text-gray-500 text-[0.65rem] mt-0.5">{formatDuration(track.duration_ms)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <p className="text-xs text-gray-400 text-center">
          Showing top {topTracks.length} tracks • {TIME_RANGES.find(r => r.value === timeRange)?.label}
        </p>
      </div>
    </div>
  );
}
