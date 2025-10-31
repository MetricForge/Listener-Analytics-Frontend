// components/RecentPlaysFeed.tsx
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

export default function RecentPlaysFeed({ data, limit = 15 }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate today's metrics
  const todayMetrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTracks = data.filter(track => {
      const trackDate = new Date(track.played_at);
      trackDate.setHours(0, 0, 0, 0);
      return trackDate.getTime() === today.getTime();
    });

    // Track play counts
    const trackCounts = new Map<string, number>();
    todayTracks.forEach(track => {
      const key = `${track.track_name}:::${track.artist_name}`;
      trackCounts.set(key, (trackCounts.get(key) || 0) + 1);
    });

    // Artist play counts and percentages
    const artistCounts = new Map<string, number>();
    todayTracks.forEach(track => {
      artistCounts.set(track.artist_name, (artistCounts.get(track.artist_name) || 0) + 1);
    });

    const totalTodayPlays = todayTracks.length;

    return { trackCounts, artistCounts, totalTodayPlays };
  }, [data]);

  const recentTracks = useMemo(() => {
    return [...data]
      .sort((a, b) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime())
      .slice(0, limit);
  }, [data, limit]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTrackPlayCount = (trackName: string, artistName: string) => {
    const key = `${trackName}:::${artistName}`;
    return todayMetrics.trackCounts.get(key) || 0;
  };

  const getArtistPercentage = (artistName: string) => {
    const count = todayMetrics.artistCounts.get(artistName) || 0;
    if (todayMetrics.totalTodayPlays === 0) return 0;
    return Math.round((count / todayMetrics.totalTodayPlays) * 100);
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-green-600/30">
            <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Recent Plays</h3>
        </div>

        {/* Tooltip Badge */}
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="text-green-300 text-xs font-semibold bg-green-900/30 px-2 py-1 rounded border border-green-700/30 hover:bg-green-900/50 transition-colors"
          >
            RECENT
          </button>
          {showTooltip && (
            <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-72">
              <div className="text-xs text-gray-300 space-y-2">
                <p className="font-semibold text-white mb-1">Recent Listening History</p>
                <p>Your most recently played tracks with timestamps and album artwork.</p>
                <div className="pt-2 border-t border-gray-700/50 space-y-1">
                  <p><span className="text-cyan-400 font-semibold">(#x)</span> = Times played today</p>
                  <p><span className="text-amber-400 font-semibold">%</span> = Artist's % of today's listening</p>
                </div>
                <div className="pt-2 border-t border-gray-700/50">
                  <p className="text-gray-400">
                    <strong className="text-white">Today:</strong> {todayMetrics.totalTodayPlays} tracks played
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Track List */}
      <div className="space-y-2 max-h-[20rem] overflow-y-auto pr-2 custom-scrollbar">
        {recentTracks.map((track, index) => {
          const playCount = getTrackPlayCount(track.track_name, track.artist_name);
          const artistPercentage = getArtistPercentage(track.artist_name);
          
          return (
            <div 
              key={index}
              className="flex items-center gap-3 p-2 bg-gray-900/30 rounded-lg hover:bg-gray-900/50 transition-colors"
            >
              {/* Album Art */}
              <img 
                src={track.album_image_url || '/placeholder-album.png'} 
                alt={track.album_name}
                className="w-12 h-12 rounded object-cover flex-shrink-0"
              />

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">
                  {track.track_name}
                  {playCount > 0 && (
                    <span className="ml-2 text-xs text-cyan-400 font-normal">
                      ({playCount}x)
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {track.artist_name}
                  {artistPercentage > 0 && (
                    <span className="ml-2 text-xs text-amber-400 font-semibold">
                      {artistPercentage}%
                    </span>
                  )}
                </p>
              </div>

              {/* Duration & Time */}
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-400">
                  {formatDuration(track.duration_ms)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTime(track.played_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <p className="text-xs text-gray-400 text-center">
          Showing last {recentTracks.length} tracks • {todayMetrics.totalTodayPlays} played today
        </p>
      </div>
    </div>
  );
}
