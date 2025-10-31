// components/DiscoveryRate.tsx
import { useMemo, useState } from 'react';

interface SpotifyData {
  played_at: string;
  artist_name: string;
  track_name: string;
}

interface Props {
  data: SpotifyData[];
}

type ViewMode = 'songs' | 'artists';

export default function DiscoveryRate({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('artists');

  const discoveryData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const sortedData = [...data].sort((a, b) => 
      new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
    );

    if (viewMode === 'artists') {
      // Track when each artist was first discovered
      const artistFirstSeen = new Map<string, string>();
      sortedData.forEach(track => {
        if (!artistFirstSeen.has(track.artist_name)) {
          artistFirstSeen.set(track.artist_name, track.played_at);
        }
      });

      // Calculate monthly discovery rate
      const monthlyDiscoveries = new Map<string, number>();
      artistFirstSeen.forEach(date => {
        const dateString = typeof date === 'string' ? date : (date as Date).toISOString();
        const month = dateString.slice(0, 7);
        monthlyDiscoveries.set(month, (monthlyDiscoveries.get(month) || 0) + 1);
      });

      const totalItems = artistFirstSeen.size;
      const totalDays = Math.max(
        (new Date().getTime() - new Date(sortedData[0].played_at).getTime()) / (1000 * 60 * 60 * 24),
        1
      );

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const last30 = Array.from(artistFirstSeen.values()).filter(date => 
        new Date(date) >= thirtyDaysAgo
      ).length;

      const prev30 = Array.from(artistFirstSeen.values()).filter(date => 
        new Date(date) >= sixtyDaysAgo && new Date(date) < thirtyDaysAgo
      ).length;

      const trend = prev30 > 0 ? ((last30 - prev30) / prev30) * 100 : 0;

      const monthlyTimeline = Array.from(monthlyDiscoveries.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-6)
        .map(([month, count]) => {
          const [monthNum] = month.split('-');
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return {
            month: monthNames[parseInt(monthNum) - 1],
            fullMonth: month,
            count
          };
        });

      return {
        totalItems,
        dailyRate: (totalItems / totalDays).toFixed(2),
        last30,
        trend: trend.toFixed(1),
        trendDirection: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable',
        monthlyTimeline,
        hasEnoughData: totalDays >= 30
      };
    } else {
      // Track when each song was first discovered
      const trackFirstSeen = new Map<string, string>();
      sortedData.forEach(track => {
        const trackKey = `${track.track_name}|||${track.artist_name}`;
        if (!trackFirstSeen.has(trackKey)) {
          trackFirstSeen.set(trackKey, track.played_at);
        }
      });

      // Calculate monthly discovery rate
      const monthlyDiscoveries = new Map<string, number>();
      trackFirstSeen.forEach(date => {
        const dateString = typeof date === 'string' ? date : (date as Date).toISOString();
        const month = dateString.slice(0, 7);
        monthlyDiscoveries.set(month, (monthlyDiscoveries.get(month) || 0) + 1);
      });

      const totalItems = trackFirstSeen.size;
      const totalDays = Math.max(
        (new Date().getTime() - new Date(sortedData[0].played_at).getTime()) / (1000 * 60 * 60 * 24),
        1
      );

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const last30 = Array.from(trackFirstSeen.values()).filter(date => 
        new Date(date) >= thirtyDaysAgo
      ).length;

      const prev30 = Array.from(trackFirstSeen.values()).filter(date => 
        new Date(date) >= sixtyDaysAgo && new Date(date) < thirtyDaysAgo
      ).length;

      const trend = prev30 > 0 ? ((last30 - prev30) / prev30) * 100 : 0;

      const monthlyTimeline = Array.from(monthlyDiscoveries.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-6)
        .map(([month, count]) => {
          const [_year, monthNum] = month.split('-');
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return {
            month: monthNames[parseInt(monthNum) - 1],
            fullMonth: month,
            count
          };
        });

      return {
        totalItems,
        dailyRate: (totalItems / totalDays).toFixed(2),
        last30,
        trend: trend.toFixed(1),
        trendDirection: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable',
        monthlyTimeline,
        hasEnoughData: totalDays >= 30
      };
    }
  }, [data, viewMode]);

  if (!discoveryData) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <p className="text-gray-400">No discovery data available</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Discovery Rate</h2>
          <p className="text-gray-400 text-sm">New {viewMode === 'artists' ? 'artist' : 'song'} acquisition over time</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Songs/Artists Toggle */}
          <div className="flex bg-gray-900 rounded border border-green-700/30 overflow-hidden">
            <button
              onClick={() => setViewMode('songs')}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === 'songs'
                  ? 'bg-green-900/50 text-green-300'
                  : 'text-gray-400 hover:text-green-300'
              }`}
            >
              Songs
            </button>
            <button
              onClick={() => setViewMode('artists')}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === 'artists'
                  ? 'bg-green-900/50 text-green-300'
                  : 'text-gray-400 hover:text-green-300'
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
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-900/30 text-green-300 border border-green-700/30">
              Discovery
            </span>
            {showTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-80">
                <p className="text-white text-xs font-semibold mb-1">Discovery Rate Analysis</p>
                <p className="text-gray-300 text-xs">
                  Measures the frequency of new {viewMode === 'artists' ? 'artist' : 'track'} acquisition over time. Tracks portfolio expansion and identifies periods of high exploratory engagement.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Metric */}
      <div className="bg-gradient-to-br from-green-900/20 to-gray-900/20 rounded-lg p-6 mb-4 border border-green-700/30">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-2">Total Unique {viewMode === 'artists' ? 'Artists' : 'Songs'}</p>
            <p className="text-white font-bold text-4xl">{discoveryData.totalItems}</p>
            <p className="text-gray-500 text-xs mt-1">discovered overall</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs mb-1">Discovery Rate</p>
            <p className="text-green-300 font-bold text-2xl">{discoveryData.dailyRate}</p>
            <p className="text-gray-500 text-xs">{viewMode === 'artists' ? 'artists' : 'songs'}/day</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-900/50 rounded-lg p-4">
          <p className="text-gray-400 text-xs mb-1">Last 30 Days</p>
          <p className="text-white font-bold text-2xl">{discoveryData.last30}</p>
          <p className="text-gray-500 text-xs">new {viewMode === 'artists' ? 'artists' : 'songs'}</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4">
          <p className="text-gray-400 text-xs mb-1">30-Day Trend</p>
          {discoveryData.hasEnoughData ? (
            <>
              <div className="flex items-center gap-2">
                <p className={`font-bold text-2xl ${discoveryData.trendDirection === 'up' ? 'text-green-400' : discoveryData.trendDirection === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                  {discoveryData.trend}%
                </p>
                {discoveryData.trendDirection === 'up' && <span className="text-green-400">↑</span>}
                {discoveryData.trendDirection === 'down' && <span className="text-red-400">↓</span>}
              </div>
              <p className="text-gray-500 text-xs">vs previous period</p>
            </>
          ) : (
            <>
              <p className="text-gray-400 font-bold text-xl">--</p>
              <p className="text-gray-500 text-xs">need more data</p>
            </>
          )}
        </div>
      </div>

      {/* Monthly Timeline with Horizontal Bars */}
      {discoveryData.monthlyTimeline.length > 0 && (
        <div className="bg-gray-900/30 rounded-lg p-4">
          <p className="text-gray-400 text-xs mb-3">Monthly Discovery Trend</p>
          <div className="space-y-3">
            {discoveryData.monthlyTimeline.map((item, idx) => {
              const maxCount = Math.max(...discoveryData.monthlyTimeline.map(d => d.count), 1);
              const width = (item.count / maxCount) * 100;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs w-8 text-right font-medium">{item.month}</span>
                  <div className="flex-1 h-7 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300 hover:opacity-80 relative flex items-center"
                      style={{ 
                        width: `${Math.max(width, 15)}%`,
                        background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                      }}
                    >
                      <span className="absolute right-2 text-white text-xs font-semibold">
                        {item.count}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
