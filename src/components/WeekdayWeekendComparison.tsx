// components/WeekdayWeekendComparison.tsx
import { useMemo, useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

interface SpotifyData {
  played_at: string;
  duration_ms: number;
  artist_name?: string;
  track_name?: string;
  artist_image_url?: string;
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

export default function WeekdayWeekendComparison({ data }: Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');
  const [showBadgeTooltip, setShowBadgeTooltip] = useState(false);
  const [hoveredArtist, setHoveredArtist] = useState<{ segment: 'weekday' | 'weekend', artistName: string } | null>(null);

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

  const analysis = useMemo(() => {
    if (filteredData.length === 0) return null;

    // Separate weekday and weekend data
    const weekdayData: SpotifyData[] = [];
    const weekendData: SpotifyData[] = [];

    filteredData.forEach(track => {
      const day = new Date(track.played_at).getDay();
      if (day === 0 || day === 6) {
        weekendData.push(track);
      } else {
        weekdayData.push(track);
      }
    });

    // Calculate hourly distribution for radar chart
    const weekdayHours = Array(24).fill(0);
    const weekendHours = Array(24).fill(0);

    weekdayData.forEach(track => {
      const hour = new Date(track.played_at).getHours();
      weekdayHours[hour]++;
    });

    weekendData.forEach(track => {
      const hour = new Date(track.played_at).getHours();
      weekendHours[hour]++;
    });

    // Group hours into periods for cleaner radar
    const periods = [
      { name: 'Late Night\n(12-3AM)', weekdayHours: [0, 1, 2, 3], weekendHours: [0, 1, 2, 3] },
      { name: 'Early Morning\n(3-6AM)', weekdayHours: [3, 4, 5, 6], weekendHours: [3, 4, 5, 6] },
      { name: 'Morning\n(6-9AM)', weekdayHours: [6, 7, 8, 9], weekendHours: [6, 7, 8, 9] },
      { name: 'Late Morning\n(9-12PM)', weekdayHours: [9, 10, 11, 12], weekendHours: [9, 10, 11, 12] },
      { name: 'Afternoon\n(12-3PM)', weekdayHours: [12, 13, 14, 15], weekendHours: [12, 13, 14, 15] },
      { name: 'Late Afternoon\n(3-6PM)', weekdayHours: [15, 16, 17, 18], weekendHours: [15, 16, 17, 18] },
      { name: 'Evening\n(6-9PM)', weekdayHours: [18, 19, 20, 21], weekendHours: [18, 19, 20, 21] },
      { name: 'Night\n(9PM-12AM)', weekdayHours: [21, 22, 23, 0], weekendHours: [21, 22, 23, 0] },
    ];

    const radarData = periods.map(period => ({
      period: period.name,
      Weekday: period.weekdayHours.reduce((sum, h) => sum + weekdayHours[h], 0),
      Weekend: period.weekendHours.reduce((sum, h) => sum + weekendHours[h], 0),
    }));

    // Calculate peak times
    const weekdayPeakHour = weekdayHours.indexOf(Math.max(...weekdayHours));
    const weekendPeakHour = weekendHours.indexOf(Math.max(...weekendHours));

    const formatHour = (h: number) => {
      if (h === 0) return '12AM';
      if (h < 12) return `${h}AM`;
      if (h === 12) return '12PM';
      return `${h - 12}PM`;
    };

    // Calculate total hours and minutes
    const weekdayMinutes = weekdayData.reduce((sum, t) => sum + t.duration_ms, 0) / 60000;
    const weekendMinutes = weekendData.reduce((sum, t) => sum + t.duration_ms, 0) / 60000;

    // Calculate average session length (avg minutes per play)
    const weekdayAvgSession = weekdayData.length > 0 ? weekdayMinutes / weekdayData.length : 0;
    const weekendAvgSession = weekendData.length > 0 ? weekendMinutes / weekendData.length : 0;

    // Process artists for weekday
    const weekdayArtistMap = new Map<string, { count: number; image?: string; uniqueTracks: Set<string> }>();
    weekdayData.forEach(t => {
      if (t.artist_name) {
        if (!weekdayArtistMap.has(t.artist_name)) {
          weekdayArtistMap.set(t.artist_name, { count: 0, uniqueTracks: new Set(), image: t.artist_image_url });
        }
        const artistData = weekdayArtistMap.get(t.artist_name)!;
        artistData.count++;
        if (t.track_name) artistData.uniqueTracks.add(t.track_name);
      }
    });

    const weekdayArtists = Array.from(weekdayArtistMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name, data]) => ({ name, plays: data.count, image: data.image, uniqueTracks: data.uniqueTracks.size }));

    // Process artists for weekend
    const weekendArtistMap = new Map<string, { count: number; image?: string; uniqueTracks: Set<string> }>();
    weekendData.forEach(t => {
      if (t.artist_name) {
        if (!weekendArtistMap.has(t.artist_name)) {
          weekendArtistMap.set(t.artist_name, { count: 0, uniqueTracks: new Set(), image: t.artist_image_url });
        }
        const artistData = weekendArtistMap.get(t.artist_name)!;
        artistData.count++;
        if (t.track_name) artistData.uniqueTracks.add(t.track_name);
      }
    });

    const weekendArtists = Array.from(weekendArtistMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name, data]) => ({ name, plays: data.count, image: data.image, uniqueTracks: data.uniqueTracks.size }));

    // Unique tracks count
    const weekdayUniqueTracks = new Set(weekdayData.map(t => t.track_name).filter(Boolean)).size;
    const weekendUniqueTracks = new Set(weekendData.map(t => t.track_name).filter(Boolean)).size;

    // Calculate difference
    const avgWeekdayPerDay = weekdayData.length / 5;
    const avgWeekendPerDay = weekendData.length / 2;
    const difference = avgWeekdayPerDay > 0 ? ((avgWeekendPerDay - avgWeekdayPerDay) / avgWeekdayPerDay) * 100 : 0;

    return {
      radarData,
      weekday: {
        plays: weekdayData.length,
        avgPerDay: avgWeekdayPerDay.toFixed(1),
        hours: (weekdayMinutes / 60).toFixed(1),
        avgSession: weekdayAvgSession.toFixed(1),
        peakTime: formatHour(weekdayPeakHour),
        uniqueArtists: weekdayArtistMap.size,
        uniqueTracks: weekdayUniqueTracks,
        topArtists: weekdayArtists.slice(0, 3),
        otherArtists: weekdayArtists.slice(3, 33),
      },
      weekend: {
        plays: weekendData.length,
        avgPerDay: avgWeekendPerDay.toFixed(1),
        hours: (weekendMinutes / 60).toFixed(1),
        avgSession: weekendAvgSession.toFixed(1),
        peakTime: formatHour(weekendPeakHour),
        uniqueArtists: weekendArtistMap.size,
        uniqueTracks: weekendUniqueTracks,
        topArtists: weekendArtists.slice(0, 3),
        otherArtists: weekendArtists.slice(3, 33),
      },
      difference: difference.toFixed(0),
    };
  }, [filteredData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-700 border border-gray-600 rounded shadow-xl p-3">
          <p className="text-white font-bold text-xs mb-2">{payload[0].payload.period}</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value} plays
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header with Filter and Badge */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Weekday vs Weekend Behavior</h2>
          <p className="text-gray-400 text-sm">
            How your listening habits change between work and leisure
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
              Comparison
            </span>
            {showBadgeTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-80">
                <p className="text-white text-xs font-semibold mb-1">Behavior Split</p>
                <p className="text-gray-300 text-xs mb-2">
                  Splits listening data into weekday (Mon-Fri) versus weekend (Sat-Sun) segments for comparative analysis.
                </p>
                <p className="text-gray-300 text-xs">
                  Identifies temporal distribution shifts, volume variance metrics, and content preference patterns across different time periods to reveal distinct behavioral segments.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {!analysis ? (
        <p className="text-gray-400 text-sm">Not enough data to compare for this period</p>
      ) : (
        <>
          {/* 3-Column Layout with Responsive Breakpoints */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Weekday Card */}
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💼</span>
                <h3 className="text-white font-bold text-lg">Weekdays</h3>
              </div>

              {/* Stats Grid (3 columns) */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div>
                  <p className="text-gray-400 text-xs">Avg/Day</p>
                  <p className="text-blue-300 font-semibold text-sm">{analysis.weekday.avgPerDay}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Hours</p>
                  <p className="text-blue-300 font-semibold text-sm">{analysis.weekday.hours}h</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Session</p>
                  <p className="text-blue-300 font-semibold text-sm">{analysis.weekday.avgSession}m</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Peak</p>
                  <p className="text-blue-300 font-semibold text-sm">{analysis.weekday.peakTime}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Artists</p>
                  <p className="text-blue-300 font-semibold text-sm">{analysis.weekday.uniqueArtists}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Tracks</p>
                  <p className="text-blue-300 font-semibold text-sm">{analysis.weekday.uniqueTracks}</p>
                </div>
              </div>

              {/* Top 3 Artists - Horizontal Layout */}
              {analysis.weekday.topArtists.length > 0 && (
                <div className="mb-3">
                  <p className="text-gray-400 text-xs mb-2">Top 3 Artists</p>
                  <div className="flex gap-2">
                    {analysis.weekday.topArtists.map((artist, idx) => (
                      <div 
                        key={artist.name}
                        className="flex-1 relative group"
                      >
                        <div className="bg-gray-800/30 rounded-lg px-2 py-2 flex flex-col items-center gap-1">
                          {/* Rank Badge */}
                          <div className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                            {idx + 1}
                          </div>
                          
                          {/* Artist Image */}
                          {artist.image ? (
                            <img 
                              src={artist.image} 
                              alt={artist.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-blue-900/30 border-2 border-blue-700 flex items-center justify-center">
                              <span className="text-blue-400 text-lg">🎵</span>
                            </div>
                          )}
                          
                          {/* Artist Info */}
                          <div className="w-full text-center">
                            <p className="text-white text-[10px] font-semibold truncate px-1">{artist.name}</p>
                            <p className="text-blue-300 text-[9px]">{artist.plays} plays</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Artists Grid (30 artists) */}
              {analysis.weekday.otherArtists.length > 0 && (
                <div>
                  <p className="text-gray-400 text-[10px] mb-2">Other artists ({analysis.weekday.otherArtists.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.weekday.otherArtists.map(artist => (
                      <div 
                        key={artist.name}
                        className="relative"
                        onMouseEnter={() => setHoveredArtist({ segment: 'weekday', artistName: artist.name })}
                        onMouseLeave={() => setHoveredArtist(null)}
                      >
                        {artist.image ? (
                          <img 
                            src={artist.image} 
                            alt={artist.name}
                            className="w-7 h-7 rounded-full object-cover border border-gray-600 hover:border-blue-500 transition-colors cursor-pointer"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gray-700 border border-gray-600 hover:border-blue-500 flex items-center justify-center cursor-pointer transition-colors">
                            <span className="text-gray-400 text-[10px]">🎵</span>
                          </div>
                        )}
                        {hoveredArtist?.segment === 'weekday' && hoveredArtist?.artistName === artist.name && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-700 border border-gray-600 rounded shadow-xl px-3 py-2 z-50 whitespace-nowrap pointer-events-none">
                            <p className="text-white text-xs font-semibold">{artist.name}</p>
                            <p className="text-gray-400 text-[10px]">{artist.plays} plays</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Weekend Card */}
            <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎉</span>
                <h3 className="text-white font-bold text-lg">Weekends</h3>
              </div>

              {/* Stats Grid (3 columns) */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div>
                  <p className="text-gray-400 text-xs">Avg/Day</p>
                  <p className="text-purple-300 font-semibold text-sm">{analysis.weekend.avgPerDay}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Hours</p>
                  <p className="text-purple-300 font-semibold text-sm">{analysis.weekend.hours}h</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Session</p>
                  <p className="text-purple-300 font-semibold text-sm">{analysis.weekend.avgSession}m</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Peak</p>
                  <p className="text-purple-300 font-semibold text-sm">{analysis.weekend.peakTime}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Artists</p>
                  <p className="text-purple-300 font-semibold text-sm">{analysis.weekend.uniqueArtists}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Tracks</p>
                  <p className="text-purple-300 font-semibold text-sm">{analysis.weekend.uniqueTracks}</p>
                </div>
              </div>

              {/* Top 3 Artists - Horizontal Layout */}
              {analysis.weekend.topArtists.length > 0 && (
                <div className="mb-3">
                  <p className="text-gray-400 text-xs mb-2">Top 3 Artists</p>
                  <div className="flex gap-2">
                    {analysis.weekend.topArtists.map((artist, idx) => (
                      <div 
                        key={artist.name}
                        className="flex-1 relative group"
                      >
                        <div className="bg-gray-800/30 rounded-lg px-2 py-2 flex flex-col items-center gap-1">
                          {/* Rank Badge */}
                          <div className="absolute top-1 left-1 bg-purple-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                            {idx + 1}
                          </div>
                          
                          {/* Artist Image */}
                          {artist.image ? (
                            <img 
                              src={artist.image} 
                              alt={artist.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-purple-900/30 border-2 border-purple-700 flex items-center justify-center">
                              <span className="text-purple-400 text-lg">🎵</span>
                            </div>
                          )}
                          
                          {/* Artist Info */}
                          <div className="w-full text-center">
                            <p className="text-white text-[10px] font-semibold truncate px-1">{artist.name}</p>
                            <p className="text-purple-300 text-[9px]">{artist.plays} plays</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Artists Grid (30 artists) */}
              {analysis.weekend.otherArtists.length > 0 && (
                <div>
                  <p className="text-gray-400 text-[10px] mb-2">Other artists ({analysis.weekend.otherArtists.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {analysis.weekend.otherArtists.map(artist => (
                      <div 
                        key={artist.name}
                        className="relative"
                        onMouseEnter={() => setHoveredArtist({ segment: 'weekend', artistName: artist.name })}
                        onMouseLeave={() => setHoveredArtist(null)}
                      >
                        {artist.image ? (
                          <img 
                            src={artist.image} 
                            alt={artist.name}
                            className="w-7 h-7 rounded-full object-cover border border-gray-600 hover:border-purple-500 transition-colors cursor-pointer"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gray-700 border border-gray-600 hover:border-purple-500 flex items-center justify-center cursor-pointer transition-colors">
                            <span className="text-gray-400 text-[10px]">🎵</span>
                          </div>
                        )}
                        {hoveredArtist?.segment === 'weekend' && hoveredArtist?.artistName === artist.name && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-700 border border-gray-600 rounded shadow-xl px-3 py-2 z-50 whitespace-nowrap pointer-events-none">
                            <p className="text-white text-xs font-semibold">{artist.name}</p>
                            <p className="text-gray-400 text-[10px]">{artist.plays} plays</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Radar Chart */}
            <div className="bg-gray-900/50 rounded-lg p-4 lg:col-span-1 col-span-1">
              <h3 className="text-white font-bold text-sm mb-4 text-center">Hourly Distribution Pattern</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={analysis.radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="period" tick={{ fill: '#9CA3AF', fontSize: 9 }} />
                  <PolarRadiusAxis tick={{ fill: '#9CA3AF', fontSize: 9 }} />
                  <Radar name="Weekday" dataKey="Weekday" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.3} />
                  <Radar name="Weekend" dataKey="Weekend" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.3} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400" />
                  <span className="text-gray-300 text-xs">Weekday</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-400" />
                  <span className="text-gray-300 text-xs">Weekend</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Finding */}
          <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <p className="text-blue-300 text-sm">
              📊 <span className="font-semibold">Key Finding:</span>{' '}
              {parseFloat(analysis.difference) > 0 
                ? `Weekend engagement volume exceeds weekday baseline by ${Math.abs(parseFloat(analysis.difference))}% per day` 
                : parseFloat(analysis.difference) < 0
                ? `Weekday engagement volume exceeds weekend baseline by ${Math.abs(parseFloat(analysis.difference))}% per day`
                : 'Engagement volume demonstrates consistent distribution across weekday and weekend segments'}
              {analysis.weekday.topArtists[0]?.name !== analysis.weekend.topArtists[0]?.name && 
                `. Top artist shifts from ${analysis.weekday.topArtists[0]?.name} (weekday) to ${analysis.weekend.topArtists[0]?.name} (weekend).`}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
