// components/RepeatRatio.tsx
import { useMemo, useState } from 'react';

interface SpotifyData {
  played_at: string;
  track_name: string;
  artist_name: string;
}

interface Props {
  data: SpotifyData[];
}

type TimeRange = '7d' | '1m' | '3m' | '6m' | 'all';
type ViewMode = 'songs' | 'artists';

const TIME_RANGES = [
  { value: '7d' as TimeRange, label: '7 Days', days: 7 },
  { value: '1m' as TimeRange, label: '1 Month', days: 30 },
  { value: '3m' as TimeRange, label: '3 Months', days: 90 },
  { value: '6m' as TimeRange, label: '6 Months', days: 180 },
  { value: 'all' as TimeRange, label: 'All Time', days: null },
];

export default function RepeatRatio({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');
  const [viewMode, setViewMode] = useState<ViewMode>('songs');

  const repeatData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const now = new Date();
    const selectedRange = TIME_RANGES.find(r => r.value === timeRange)!;
    
    const filteredData = selectedRange.days
      ? data.filter(track => {
          const trackDate = new Date(track.played_at);
          const rangeStart = new Date(now.getTime() - selectedRange.days * 24 * 60 * 60 * 1000);
          return trackDate >= rangeStart && trackDate <= now;
        })
      : data;

    if (viewMode === 'songs') {
      // Count track plays
      const trackCounts = new Map<string, { count: number; artist: string }>();
      filteredData.forEach(track => {
        const key = `${track.track_name}|||${track.artist_name}`;
        const existing = trackCounts.get(key);
        if (existing) {
          existing.count++;
        } else {
          trackCounts.set(key, { count: 1, artist: track.artist_name });
        }
      });

      const totalPlays = filteredData.length;
      const uniqueTracks = trackCounts.size;
      const repeatPlays = totalPlays - uniqueTracks;
      const repeatRatio = (repeatPlays / totalPlays) * 100;

      const topRepeats = Array.from(trackCounts.entries())
        .filter(([_, data]) => data.count > 1)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([key, data]) => ({
          name: key.split('|||')[0],
          subtitle: data.artist,
          count: data.count
        }));

      const singlePlays = Array.from(trackCounts.values()).filter(t => t.count === 1).length;
      const explorationRate = (singlePlays / uniqueTracks) * 100;

      return {
        repeatRatio: repeatRatio.toFixed(1),
        uniqueItems: uniqueTracks,
        totalPlays,
        repeatPlays,
        topRepeats,
        explorationRate: explorationRate.toFixed(1),
        familiarityRate: (100 - explorationRate).toFixed(1)
      };
    } else {
      // Count artist plays
      const artistCounts = new Map<string, number>();
      filteredData.forEach(track => {
        artistCounts.set(track.artist_name, (artistCounts.get(track.artist_name) || 0) + 1);
      });

      const totalPlays = filteredData.length;
      const uniqueArtists = artistCounts.size;
      const repeatPlays = totalPlays - uniqueArtists;
      const repeatRatio = (repeatPlays / totalPlays) * 100;

      const topRepeats = Array.from(artistCounts.entries())
        .filter(([_, count]) => count > 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([artist, count]) => ({
          name: artist,
          subtitle: `${count} plays`,
          count
        }));

      const singlePlays = Array.from(artistCounts.values()).filter(c => c === 1).length;
      const explorationRate = (singlePlays / uniqueArtists) * 100;

      return {
        repeatRatio: repeatRatio.toFixed(1),
        uniqueItems: uniqueArtists,
        totalPlays,
        repeatPlays,
        topRepeats,
        explorationRate: explorationRate.toFixed(1),
        familiarityRate: (100 - explorationRate).toFixed(1)
      };
    }
  }, [data, timeRange, viewMode]);

  if (!repeatData) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <p className="text-gray-400">No repeat data available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Repeat Behavior</h2>
          <p className="text-gray-400 text-sm">Content repetition vs. exploration patterns</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Period Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="text-xs font-semibold bg-gray-900 text-purple-300 px-3 py-1.5 rounded border border-purple-700/30 hover:bg-gray-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {TIME_RANGES.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>

          {/* Songs/Artists Toggle */}
          <div className="flex bg-gray-900 rounded border border-purple-700/30 overflow-hidden">
            <button
              onClick={() => setViewMode('songs')}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === 'songs'
                  ? 'bg-purple-900/50 text-purple-300'
                  : 'text-gray-400 hover:text-purple-300'
              }`}
            >
              Songs
            </button>
            <button
              onClick={() => setViewMode('artists')}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === 'artists'
                  ? 'bg-purple-900/50 text-purple-300'
                  : 'text-gray-400 hover:text-purple-300'
              }`}
            >
              Artists
            </button>
          </div>

          {/* Badge */}
          <div 
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-900/30 text-purple-300 border border-purple-700/30">
              Behavior
            </span>
            {showTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-80">
                <p className="text-white text-xs font-semibold mb-1">Repeat Behavior Analysis</p>
                <p className="text-gray-300 text-xs">
                  Analyzes the balance between replaying familiar content and exploring new {viewMode}. Higher repeat ratios indicate preference for familiar content.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Metric */}
      <div className="bg-gradient-to-br from-purple-900/20 to-gray-900/20 rounded-lg p-6 mb-4 border border-purple-700/30">
        <p className="text-gray-400 text-sm mb-2">Repeat Ratio</p>
        <p className="text-white font-bold text-5xl mb-2">{repeatData.repeatRatio}%</p>
        <p className="text-gray-500 text-xs">{repeatData.repeatPlays.toLocaleString()} repeat plays out of {repeatData.totalPlays.toLocaleString()} total</p>
      </div>

      {/* Exploration vs Familiarity */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-xs">Exploration</span>
          <span className="text-gray-400 text-xs">Familiarity</span>
        </div>
        <div className="h-3 bg-gray-900 rounded-full overflow-hidden flex">
          <div 
            className="bg-blue-500" 
            style={{ width: `${repeatData.explorationRate}%` }}
          />
          <div 
            className="bg-purple-500" 
            style={{ width: `${repeatData.familiarityRate}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-blue-300 text-xs font-semibold">{repeatData.explorationRate}%</span>
          <span className="text-purple-300 text-xs font-semibold">{repeatData.familiarityRate}%</span>
        </div>
      </div>

      {/* Top Repeated Items */}
      <div className="bg-gray-900/30 rounded-lg p-4">
        <p className="text-gray-400 text-xs font-semibold mb-3">Most Repeated {viewMode === 'songs' ? 'Tracks' : 'Artists'}</p>
        <div className="space-y-2">
          {repeatData.topRepeats.length > 0 ? (
            repeatData.topRepeats.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{item.name}</p>
                  <p className="text-gray-500 truncate">{item.subtitle}</p>
                </div>
                <div className="ml-3 flex items-center gap-2">
                  <div className="h-1.5 bg-purple-900 rounded-full w-16">
                    <div 
                      className="h-full bg-purple-500 rounded-full" 
                      style={{ width: `${(item.count / repeatData.topRepeats[0].count) * 100}%` }}
                    />
                  </div>
                  <span className="text-purple-300 font-bold w-8 text-right">{item.count}×</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-xs text-center py-4">No repeated {viewMode} in this period</p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-gray-900/50 rounded-lg p-3 text-center">
          <p className="text-gray-400 text-xs mb-1">Unique {viewMode === 'songs' ? 'Tracks' : 'Artists'}</p>
          <p className="text-white font-bold text-xl">{repeatData.uniqueItems.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 text-center">
          <p className="text-gray-400 text-xs mb-1">Repeated {viewMode === 'songs' ? 'Tracks' : 'Artists'}</p>
          <p className="text-purple-300 font-bold text-xl">{repeatData.topRepeats.length.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
