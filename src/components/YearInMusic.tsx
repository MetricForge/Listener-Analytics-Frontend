// components/YearInMusic.tsx
import { useMemo, useState } from 'react';

interface SpotifyData {
  played_at: string;
  artist_name: string;
  track_name: string;
  artist_image_url?: string;
}

interface Props {
  data: SpotifyData[];
}

export default function YearInMusic({ data }: Props) {
  const [showBadgeTooltip, setShowBadgeTooltip] = useState(false);
  const [hoveredArtist, setHoveredArtist] = useState<{ monthKey: string; artistName: string } | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Get available years from data
  const availableYears = useMemo(() => {
    if (!data || data.length === 0) return [];
    const years = new Set(data.map(track => new Date(track.played_at).getFullYear()));
    return Array.from(years).sort((a, b) => b - a); // Most recent first
  }, [data]);

  // Set default year to most recent
  useMemo(() => {
    if (availableYears.length > 0 && selectedYear === null) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const monthlyData = useMemo(() => {
    if (!data || data.length === 0 || !selectedYear) return [];

    const yearData = data.filter(track => new Date(track.played_at).getFullYear() === selectedYear);

    const monthlyMap = new Map<string, SpotifyData[]>();
    
    yearData.forEach(track => {
      const date = new Date(track.played_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, []);
      }
      monthlyMap.get(monthKey)!.push(track);
    });

    const months = Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([monthKey, tracks]) => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        
        const artistCounts = new Map<string, { count: number; uniqueTracks: Set<string>; image?: string }>();
        
        tracks.forEach(track => {
          if (!artistCounts.has(track.artist_name)) {
            artistCounts.set(track.artist_name, {
              count: 0,
              uniqueTracks: new Set(),
              image: track.artist_image_url
            });
          }
          const artistData = artistCounts.get(track.artist_name)!;
          artistData.count++;
          artistData.uniqueTracks.add(track.track_name);
        });

        const allArtists = Array.from(artistCounts.entries())
          .sort((a, b) => b[1].count - a[1].count)
          .map(([name, data]) => ({
            name,
            image: data.image,
            plays: data.count,
            uniqueTracks: data.uniqueTracks.size
          }));

        return {
          monthKey,
          monthName: date.toLocaleString('default', { month: 'long' }),
          year: parseInt(year),
          topArtists: allArtists.slice(0, 3),
          otherArtists: allArtists.slice(3),
          totalPlays: tracks.length,
          uniqueArtists: artistCounts.size,
        };
      });

    return months;
  }, [data, selectedYear]);

  if (availableYears.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg p-12 text-center">
        <p className="text-gray-400">No listening data available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header with Year Filter and Badge */}
      <div className="flex items-start justify-between mb-12">
        <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-white mb-2">
                Explore the Artist You Played this Year
              </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Year Filter */}
          <select
            value={selectedYear || ''}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="text-sm font-semibold bg-gray-900 text-purple-300 px-4 py-2 rounded-lg border border-purple-700/30 hover:bg-gray-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          {/* Timeline Badge */}
          <div 
            className="relative"
            onMouseEnter={() => setShowBadgeTooltip(true)}
            onMouseLeave={() => setShowBadgeTooltip(false)}
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-900/30 text-purple-300 border border-purple-700/30">
              Timeline
            </span>
            {showBadgeTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-80">
                <p className="text-white text-xs font-semibold mb-1">Your Musical Journey</p>
                <p className="text-gray-300 text-xs mb-2">
                  Watch your year unfold month by month, revealing which artists dominated each chapter of your story.
                </p>
                <p className="text-purple-300 text-[10px]">
                  💡 Click +XX to see all artists from any month
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-purple-500" />

        <div className="space-y-1">
          {monthlyData.map((month, index) => {
            const isLeft = index % 2 === 0;
            
            return (
              <div key={month.monthKey} className="relative">
                <div className="absolute left-1/2 top-8 -translate-x-1/2 w-4 h-4 bg-purple-500 rounded-full border-4 border-gray-800 z-10" />

                <div className={`w-[45%] ${isLeft ? 'mr-auto pr-12' : 'ml-auto pl-12'}`}>
                  <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-6 hover:border-purple-500/50 transition-colors">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-white">
                        {month.monthName} <span className="text-lg text-gray-400 font-small">{month.year}</span>
                      </h3>
                    </div>

                    <div className="mb-4">
                      {/* Top Artist */}
                      <div className="flex items-center gap-4 mb-3">
                        {month.topArtists[0]?.image ? (
                          <img
                            src={month.topArtists[0].image}
                            alt={month.topArtists[0].name}
                            className="w-20 h-20 rounded-full object-cover border-2 border-purple-500"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-purple-900/30 border-2 border-purple-700 flex items-center justify-center">
                            <span className="text-purple-400 text-2xl">🎵</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-gray-400 text-xs mb-1">Top Artist</p>
                          <p className="text-white font-bold text-lg truncate">{month.topArtists[0]?.name}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{month.topArtists[0]?.plays} plays</p>
                        </div>
                      </div>

                      {/* Runner-ups */}
                      {month.topArtists.length > 1 && (
                        <div className="flex gap-2 ml-1 mb-3">
                          {month.topArtists.slice(1, 3).map((artist, idx) => (
                            <div key={artist.name} className="flex items-center gap-2 bg-gray-800/30 rounded-lg px-3 py-2 flex-1">
                              {artist.image ? (
                                <img
                                  src={artist.image}
                                  alt={artist.name}
                                  className="w-10 h-10 rounded-full object-cover border border-gray-600"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                                  <span className="text-gray-400 text-sm">🎵</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-400 text-[10px]">#{idx + 2}</p>
                                <p className="text-white text-xs font-semibold truncate">{artist.name}</p>
                                <p className="text-gray-500 text-[10px]">{artist.plays} plays</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Other Artists */}
                      {month.otherArtists.length > 0 && (
                        <div className="ml-1">
                          <p className="text-gray-500 text-[10px] mb-2">Other artists ({month.otherArtists.length})</p>
                          <div className="flex flex-wrap gap-1">
                            {month.otherArtists.slice(0, 10).map((artist) => (
                              <div
                                key={artist.name}
                                className="relative"
                                onMouseEnter={() => setHoveredArtist({ monthKey: month.monthKey, artistName: artist.name })}
                                onMouseLeave={() => setHoveredArtist(null)}
                              >
                                {artist.image ? (
                                  <img
                                    src={artist.image}
                                    alt={artist.name}
                                    className="w-8 h-8 rounded-full object-cover border border-gray-600 hover:border-purple-500 transition-colors cursor-pointer"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-600 hover:border-purple-500 flex items-center justify-center cursor-pointer transition-colors">
                                    <span className="text-gray-400 text-xs">🎵</span>
                                  </div>
                                )}
                                
                                {hoveredArtist?.monthKey === month.monthKey && hoveredArtist?.artistName === artist.name && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-700 border border-gray-600 rounded shadow-xl px-3 py-2 z-50 whitespace-nowrap pointer-events-none">
                                    <p className="text-white text-xs font-semibold">{artist.name}</p>
                                    <p className="text-gray-400 text-[10px]">{artist.plays} plays</p>
                                  </div>
                                )}
                              </div>
                            ))}
                            
                            {month.otherArtists.length > 10 && (
                              <button
                                onClick={() => setExpandedMonth(month.monthKey)}
                                className="w-8 h-8 rounded-full bg-purple-900/30 border border-purple-700 hover:bg-purple-800/50 flex items-center justify-center cursor-pointer transition-colors"
                              >
                                <span className="text-purple-300 text-[10px] font-semibold">+{month.otherArtists.length - 10}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-800/50 rounded p-3">
                        <p className="text-gray-400 text-xs mb-1">Plays</p>
                        <p className="text-purple-300 font-bold">{month.topArtists[0]?.plays}</p>
                      </div>
                      <div className="bg-gray-800/50 rounded p-3">
                        <p className="text-gray-400 text-xs mb-1">Tracks</p>
                        <p className="text-blue-300 font-bold">{month.topArtists[0]?.uniqueTracks}</p>
                      </div>
                      <div className="bg-gray-800/50 rounded p-3">
                        <p className="text-gray-400 text-xs mb-1">Featured</p>
                        <p className="text-teal-300 font-bold">
                          {Math.round((month.topArtists[0]?.plays / month.totalPlays) * 100)}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-700/50 text-xs text-gray-400 text-center">
                      <p>{month.totalPlays.toLocaleString()} total plays • {month.uniqueArtists} artists</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Modal */}
      {expandedMonth && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setExpandedMonth(null)}
          />
          
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-6 z-50 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-bold text-lg">
                  {monthlyData.find(m => m.monthKey === expandedMonth)?.monthName} {monthlyData.find(m => m.monthKey === expandedMonth)?.year} - All Artists
                </h3>
                <p className="text-gray-400 text-sm">
                  {monthlyData.find(m => m.monthKey === expandedMonth)?.otherArtists.length} additional artists
                </p>
              </div>
              <button
                onClick={() => setExpandedMonth(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {monthlyData.find(m => m.monthKey === expandedMonth)?.otherArtists.slice(10).map((artist) => (
                <div
                  key={artist.name}
                  className="flex items-center gap-2 bg-gray-900/50 rounded-lg p-3 hover:bg-gray-700/50 transition-colors"
                >
                  {artist.image ? (
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-600"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center">
                      <span className="text-gray-400">🎵</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{artist.name}</p>
                    <p className="text-gray-400 text-xs">{artist.plays} plays</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
