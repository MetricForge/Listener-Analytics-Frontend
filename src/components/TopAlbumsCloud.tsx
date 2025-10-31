// components/TopAlbumsCloud.tsx
import { useState, useMemo } from 'react';

interface SpotifyData {
  played_at: string;
  album_name: string;
  album_image_url: string;
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

export default function TopAlbumsCloud({ data, limit = 20 }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoveredAlbum, setHoveredAlbum] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');

  const cloudData = useMemo(() => {
    const now = new Date();
    const selectedRange = TIME_RANGES.find(r => r.value === timeRange)!;
    const rangeStart = new Date(now.getTime() - selectedRange.days * 24 * 60 * 60 * 1000);

    const filteredData = data.filter(track => {
      const trackDate = new Date(track.played_at);
      return trackDate >= rangeStart && trackDate <= now;
    });

    const albumCounts = new Map<string, {
      album_name: string;
      artist_name: string;
      album_image_url: string;
      plays: number;
    }>();

    filteredData.forEach(track => {
      const key = `${track.album_name}|||${track.artist_name}`;
      const current = albumCounts.get(key);
      
      if (current) {
        current.plays++;
      } else {
        albumCounts.set(key, {
          album_name: track.album_name,
          artist_name: track.artist_name,
          album_image_url: track.album_image_url,
          plays: 1,
        });
      }
    });

    const sorted = Array.from(albumCounts.values())
      .sort((a, b) => b.plays - a.plays)
      .slice(0, limit);

    const maxPlays = sorted.length > 0 ? sorted[0].plays : 1;

    return sorted.map(item => ({
      ...item,
      size: Math.max(1, Math.ceil((item.plays / maxPlays) * 5)),
    }));
  }, [data, limit, timeRange]);

  const getSizePixels = (size: number) => {
    switch (size) {
      case 5: return 100;
      case 4: return 84;
      case 3: return 72;
      case 2: return 60;
      default: return 52;
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-600/30">
            <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Top Albums</h3>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="text-xs font-semibold bg-gray-900 text-indigo-300 px-2 py-1.5 rounded border border-indigo-700/30 hover:bg-gray-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="text-indigo-300 text-xs font-semibold bg-indigo-900/30 px-2 py-1 rounded border border-indigo-700/30 hover:bg-indigo-900/50 transition-colors"
            >
              ALBUMS
            </button>
            {showTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-72">
                <div className="text-xs text-gray-300 space-y-2">
                  <p className="font-semibold text-white mb-1">Top Albums Cloud</p>
                  <p>Albums sized by play count. Larger = more plays. Hover for details.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Album Cloud */}
      <div className="min-h-[350px] flex flex-wrap items-center justify-center gap-4 p-4">
        {cloudData.map((album) => {
          const sizePixels = getSizePixels(album.size);
          const key = `${album.album_name}-${album.artist_name}`;
          
          return (
            <div
              key={key}
              onMouseEnter={() => setHoveredAlbum(key)}
              onMouseLeave={() => setHoveredAlbum(null)}
              className="relative cursor-pointer transition-all duration-300 hover:scale-110"
              style={{ width: sizePixels, height: sizePixels }}
            >
              {/* Album Cover */}
              <img
                src={album.album_image_url}
                alt={album.album_name}
                className="w-full h-full rounded-lg object-cover border-4 border-indigo-500/50 hover:border-indigo-400 transition-all shadow-lg"
                style={{
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                }}
              />
              
              {/* Play count badge */}
              <div className="absolute -bottom-1 -right-1 bg-indigo-500 text-white text-xs font-bold rounded-full px-2 py-1 shadow-lg border-2 border-gray-800">
                {album.plays}
              </div>

              {/* Hover Tooltip */}
              {hoveredAlbum === key && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap z-50">
                  <p className="text-white font-semibold text-sm">{album.album_name}</p>
                  <p className="text-indigo-300 text-xs">{album.artist_name}</p>
                  <p className="text-cyan-300 text-xs">{album.plays} plays</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <p className="text-xs text-gray-400 text-center">
          Showing {cloudData.length} albums • Larger size = more plays
        </p>
      </div>
    </div>
  );
}
