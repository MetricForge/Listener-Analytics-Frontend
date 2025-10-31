// components/AlbumGallery.tsx
import { useState, useMemo } from 'react';

interface SpotifyData {
  played_at: string;
  album_name: string;
  album_image_url: string;
  artist_name: string;
  track_name: string;
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

export default function AlbumGallery({ data, limit = 20 }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');
  const [hoveredAlbum, setHoveredAlbum] = useState<string | null>(null);

  const { topAlbums, comparison } = useMemo(() => {
    const now = new Date();
    const selectedRange = TIME_RANGES.find(r => r.value === timeRange)!;
    
    // Current period
    const currentStart = new Date(now.getTime() - selectedRange.days * 24 * 60 * 60 * 1000);
    const currentData = data.filter(track => {
      const trackDate = new Date(track.played_at);
      return trackDate >= currentStart && trackDate <= now;
    });

    // Previous period (same length)
    const previousStart = new Date(currentStart.getTime() - selectedRange.days * 24 * 60 * 60 * 1000);
    const previousData = data.filter(track => {
      const trackDate = new Date(track.played_at);
      return trackDate >= previousStart && trackDate < currentStart;
    });

    // Count albums for current period
    const albumCounts = new Map<string, {
      album_name: string;
      artist_name: string;
      album_image_url: string;
      plays: number;
      tracks: Set<string>;
    }>();

    currentData.forEach(track => {
      const key = `${track.album_name}|||${track.artist_name}`;
      const current = albumCounts.get(key);
      
      if (current) {
        current.plays++;
        current.tracks.add(track.track_name);
      } else {
        albumCounts.set(key, {
          album_name: track.album_name,
          artist_name: track.artist_name,
          album_image_url: track.album_image_url,
          plays: 1,
          tracks: new Set([track.track_name]),
        });
      }
    });

    // Count albums for previous period
    const previousAlbumCounts = new Map<string, number>();
    previousData.forEach(track => {
      const key = `${track.album_name}|||${track.artist_name}`;
      previousAlbumCounts.set(key, (previousAlbumCounts.get(key) || 0) + 1);
    });

    // Calculate changes and add to albums
    const albumsWithChange = Array.from(albumCounts.entries()).map(([key, album]) => {
      const previousPlays = previousAlbumCounts.get(key) || 0;
      const change = previousPlays === 0 
        ? null // New album, no comparison
        : Math.round(((album.plays - previousPlays) / previousPlays) * 100);
      
      return {
        ...album,
        change,
      };
    });

    const sortedAlbums = albumsWithChange
      .sort((a, b) => b.plays - a.plays)
      .slice(0, limit);

    // Overall period comparison
    const currentTotal = currentData.length;
    const previousTotal = previousData.length;
    const overallChange = previousTotal === 0 
      ? 0 
      : Math.round(((currentTotal - previousTotal) / previousTotal) * 100);

    return {
      topAlbums: sortedAlbums,
      comparison: {
        change: overallChange,
        current: currentTotal,
        previous: previousTotal,
      },
    };
  }, [data, timeRange, limit]);

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-600/30">
            <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Album Gallery</h3>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
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

          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-purple-300 text-xs font-semibold bg-purple-900/30 px-2 py-1 rounded border border-purple-700/30 hover:bg-purple-900/50 transition-colors"
            >
              GALLERY
            </button>
            {showTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-72">
                <div className="text-xs text-gray-300 space-y-2">
                  <p className="font-semibold text-white mb-1">Top Albums</p>
                  <p>Visual grid of your most-played albums. Hover for details.</p>
                  <p className="text-gray-400 pt-2 border-t border-gray-700/50">
                    <span className="text-green-400">Green %</span> = listening more vs previous period
                  </p>
                  <p className="text-gray-400">
                    <span className="text-red-400">Red %</span> = listening less vs previous period
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Album Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
        {topAlbums.map((album, index) => (
          <div
            key={`${album.album_name}-${album.artist_name}`}
            onMouseEnter={() => setHoveredAlbum(`${album.album_name}-${album.artist_name}`)}
            onMouseLeave={() => setHoveredAlbum(null)}
            className="relative group cursor-pointer"
          >
            {/* Album Cover */}
            <div className="relative overflow-hidden rounded-lg shadow-lg aspect-square">
              <img
                src={album.album_image_url}
                alt={album.album_name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              
              {/* Rank Badge */}
              <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                #{index + 1}
              </div>
              
              {/* Play Count Badge */}
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded-full">
                {album.plays}
              </div>

              {/* Change Badge (Bottom Right) */}
              {album.change !== null && (
                <div 
                  className={`absolute bottom-2 right-2 text-xs font-bold px-2 py-1 rounded-full shadow-lg ${
                    album.change > 0 
                      ? 'bg-green-600 text-white' 
                      : album.change < 0 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-600 text-white'
                  }`}
                >
                  {album.change > 0 ? '+' : ''}{album.change}%
                </div>
              )}

              {/* Hover Overlay */}
            {hoveredAlbum === `${album.album_name}-${album.artist_name}` && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-3 text-center">
                <p className="text-white font-semibold text-sm mb-1 line-clamp-2">
                  {album.album_name}
                </p>
                <p className="text-purple-300 text-xs mb-2 line-clamp-1">
                  {album.artist_name}
                </p>
    
                {/* Current Period Stats */}
                <div className="w-full border-t border-gray-600 pt-2 mb-2">
                  <p className="text-white text-sm font-bold">
                    {album.plays} plays
                  </p>
                  <p className="text-gray-400 text-xs">
                    {album.tracks.size} unique tracks
                  </p>
                </div>
    
                {/* Comparison */}
                {album.change !== null ? (
                  <div className="w-full border-t border-gray-600 pt-2">
                    <p className="text-gray-300 text-xs font-semibold mb-1">vs Previous Period</p>
                    <div className="flex items-center justify-center gap-2">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                        album.change > 0 
                          ? 'bg-green-600/30 text-green-300' 
                          : album.change < 0 
                            ? 'bg-red-600/30 text-red-300' 
                            : 'bg-gray-600/30 text-gray-300'
                      }`}>
                        {album.change > 0 ? (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        ) : album.change < 0 ? (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                          </svg>
                        )}
                        <span>{album.change > 0 ? '+' : ''}{album.change}%</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-[0.65rem] mt-1">
                      {album.change > 0 
                        ? '🔥 Listening more!' 
                        : album.change < 0 
                          ? '📉 Listening less' 
                          : '➡️ Same activity'}
                    </p>
                  </div>
                ) : (
                  <div className="w-full border-t border-gray-600 pt-2">
                    <p className="text-gray-400 text-[0.65rem]">
                      Didn't listen to this album in previous period
                    </p>
                  </div>
                )}
              </div>
            )}

            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <div className="flex items-center justify-between text-xs">
          <p className="text-gray-400">
            Showing {topAlbums.length} most-played albums
          </p>
          <p className="text-gray-400">
            Overall:{' '}
            <span className={`font-semibold ${
              comparison.change > 0 ? 'text-green-400' : comparison.change < 0 ? 'text-red-400' : 'text-gray-300'
            }`}>
              {comparison.change > 0 ? '+' : ''}{comparison.change}%
            </span>
            {' '}vs previous {TIME_RANGES.find(r => r.value === timeRange)?.label.toLowerCase()}
          </p>
        </div>
      </div>
    </div>
  );
}
