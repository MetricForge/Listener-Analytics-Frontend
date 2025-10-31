// components/FeaturedArtistsCloud.tsx
import { useState, useMemo } from 'react';

interface SpotifyData {
  played_at: string;
  track_name: string;
  artist_name: string;
  artist_image_url: string;
  featured_artists: string | null;
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

export default function FeaturedArtistsCloud({ data, limit = 20 }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoveredArtist, setHoveredArtist] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');

  const cloudData = useMemo(() => {
    const now = new Date();
    const selectedRange = TIME_RANGES.find(r => r.value === timeRange)!;
    const rangeStart = new Date(now.getTime() - selectedRange.days * 24 * 60 * 60 * 1000);

    // Filter data by time range
    const filteredData = data.filter(track => {
      const trackDate = new Date(track.played_at);
      return trackDate >= rangeStart && trackDate <= now;
    });

    // Build artist image map from primary artists
    const artistImageMap = new Map<string, string>();
    filteredData.forEach(track => {
      if (track.artist_image_url && !artistImageMap.has(track.artist_name)) {
        artistImageMap.set(track.artist_name, track.artist_image_url);
      }
    });

    const featuredCounts = new Map<string, { count: number; tracks: Set<string>; image?: string }>();

    filteredData.forEach(track => {
      if (track.featured_artists) {
        const featured = track.featured_artists.split(',').map(a => a.trim());
        featured.forEach(artist => {
          if (artist) {
            const current = featuredCounts.get(artist) || { count: 0, tracks: new Set() };
            current.count++;
            current.tracks.add(track.track_name);
            
            // Try to find artist image (might be in the map if they're also a primary artist)
            if (!current.image) {
              current.image = artistImageMap.get(artist);
            }
            
            featuredCounts.set(artist, current);
          }
        });
      }
    });

    const sorted = Array.from(featuredCounts.entries())
      .map(([name, data]) => ({
        name,
        plays: data.count,
        uniqueTracks: data.tracks.size,
        image: data.image,
      }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, limit);

    // Calculate max for sizing
    const maxPlays = sorted.length > 0 ? sorted[0].plays : 1;

    // Assign sizes (1-5 scale)
    return sorted.map(item => ({
      ...item,
      size: Math.max(1, Math.ceil((item.plays / maxPlays) * 5)),
    }));
  }, [data, limit, timeRange]);

  const getSizePixels = (size: number) => {
    switch (size) {
      case 5: return 120;
      case 4: return 96;
      case 3: return 80;
      case 2: return 64;
      default: return 52;
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-green-600/30">
            <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Featured Artists</h3>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="text-xs font-semibold bg-gray-900 text-green-300 px-2 py-1.5 rounded border border-green-700/30 hover:bg-gray-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {TIME_RANGES.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>

          {/* Tooltip */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-green-300 text-xs font-semibold bg-green-900/30 px-2 py-1 rounded border border-green-700/30 hover:bg-green-900/50 transition-colors"
            >
              FEATURED
            </button>
            {showTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-72">
                <div className="text-xs text-gray-300 space-y-2">
                  <p className="font-semibold text-white mb-1">Featured Artist Cloud</p>
                  <p>
                    Artists who appear as featured/secondary artists on tracks you listen to.
                    Larger avatars = more appearances. Hover for details.
                  </p>
                  <p className="text-gray-400 pt-2 border-t border-gray-700/50">
                    Reveals hidden preferences for artists who collaborate but aren't the primary artist.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Artist Cloud */}
      {cloudData.length > 0 ? (
        <div className="min-h-[400px] flex flex-wrap items-center justify-center gap-6 p-4">
          {cloudData.map((artist) => {
            const sizePixels = getSizePixels(artist.size);
            
            return (
              <div
                key={artist.name}
                onMouseEnter={() => setHoveredArtist(artist.name)}
                onMouseLeave={() => setHoveredArtist(null)}
                className="relative cursor-pointer transition-all duration-300 hover:scale-110"
                style={{ width: sizePixels, height: sizePixels }}
              >
                {/* Artist Image */}
                {artist.image ? (
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-full h-full rounded-full object-cover border-4 border-green-500/50 hover:border-green-400 transition-all shadow-lg"
                    style={{
                      boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                    }}
                  />
                ) : (
                  // Fallback for artists without images
                  <div 
                    className="w-full h-full rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center border-4 border-green-500/50 hover:border-green-400 transition-all shadow-lg"
                    style={{
                      boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                    }}
                  >
                    <span className="text-white font-bold" style={{ fontSize: `${sizePixels / 4}px` }}>
                      {artist.name.charAt(0)}
                    </span>
                  </div>
                )}
                
                {/* Play count badge */}
                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full px-2 py-1 shadow-lg border-2 border-gray-800">
                  {artist.plays}
                </div>

                {/* Hover Tooltip */}
                {hoveredArtist === artist.name && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap z-50">
                    <p className="text-white font-semibold text-sm">{artist.name}</p>
                    <p className="text-green-300 text-xs">{artist.plays} appearances</p>
                    <p className="text-cyan-300 text-xs">{artist.uniqueTracks} unique tracks</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center justify-center h-[400px] text-gray-400">
          <div className="text-center">
            <p className="text-sm">No featured artist data available</p>
            <p className="text-xs mt-1">Featured artists will appear here once tracked</p>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <p className="text-xs text-gray-400 text-center">
          {cloudData.length > 0 
            ? `Showing ${cloudData.length} featured artists • Larger size = more appearances`
            : 'Waiting for featured artist data'}
        </p>
      </div>
    </div>
  );
}
