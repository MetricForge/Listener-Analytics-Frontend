// components/ArtistStatsCards.tsx
import { useState, useMemo } from 'react';

interface SpotifyData {
  played_at: string;
  artist_name: string;
  track_name: string;
}

interface Props {
  data: SpotifyData[];
}

export default function ArtistStatsCards({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  const stats = useMemo(() => {
    const now = new Date();

    // Calculate weekly streaks (check last 12 weeks)
    const weeklyTopArtists: string[] = [];
    for (let weekOffset = 0; weekOffset < 12; weekOffset++) {
      const weekStart = new Date(now.getTime() - (weekOffset + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - weekOffset * 7 * 24 * 60 * 60 * 1000);
      
      const weekData = data.filter(track => {
        const trackDate = new Date(track.played_at);
        return trackDate >= weekStart && trackDate < weekEnd;
      });

      const artistCounts = new Map<string, number>();
      weekData.forEach(track => {
        artistCounts.set(track.artist_name, (artistCounts.get(track.artist_name) || 0) + 1);
      });

      const topArtist = Array.from(artistCounts.entries())
        .sort((a, b) => b[1] - a[1])[0];
      
      if (topArtist) {
        weeklyTopArtists.push(topArtist[0]);
      }
    }

    // Calculate week streak
    const currentWeekTopArtist = weeklyTopArtists[0];
    let weekStreak = 0;
    if (currentWeekTopArtist) {
      for (let i = 0; i < weeklyTopArtists.length; i++) {
        if (weeklyTopArtists[i] === currentWeekTopArtist) {
          weekStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate monthly streaks (check last 12 months)
    const monthlyTopArtists: string[] = [];
    for (let monthOffset = 0; monthOffset < 12; monthOffset++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - (monthOffset + 1), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      
      const monthData = data.filter(track => {
        const trackDate = new Date(track.played_at);
        return trackDate >= monthStart && trackDate < monthEnd;
      });

      const artistCounts = new Map<string, number>();
      monthData.forEach(track => {
        artistCounts.set(track.artist_name, (artistCounts.get(track.artist_name) || 0) + 1);
      });

      const topArtist = Array.from(artistCounts.entries())
        .sort((a, b) => b[1] - a[1])[0];
      
      if (topArtist) {
        monthlyTopArtists.push(topArtist[0]);
      }
    }

    // Calculate month streak
    const currentMonthTopArtist = monthlyTopArtists[0];
    let monthStreak = 0;
    if (currentMonthTopArtist) {
      for (let i = 0; i < monthlyTopArtists.length; i++) {
        if (monthlyTopArtists[i] === currentMonthTopArtist) {
          monthStreak++;
        } else {
          break;
        }
      }
    }

    // This week's data
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekData = data.filter(track => new Date(track.played_at) >= oneWeekAgo);
    const artistCountsWeek = new Map<string, number>();
    thisWeekData.forEach(track => {
      artistCountsWeek.set(track.artist_name, (artistCountsWeek.get(track.artist_name) || 0) + 1);
    });
    const topArtistWeek = Array.from(artistCountsWeek.entries())
      .sort((a, b) => b[1] - a[1])[0];

    // This month's data
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const thisMonthData = data.filter(track => new Date(track.played_at) >= oneMonthAgo);
    const artistCountsMonth = new Map<string, number>();
    thisMonthData.forEach(track => {
      artistCountsMonth.set(track.artist_name, (artistCountsMonth.get(track.artist_name) || 0) + 1);
    });
    const topArtistMonth = Array.from(artistCountsMonth.entries())
      .sort((a, b) => b[1] - a[1])[0];

    // Artist discovery rate
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    const recentData = data.filter(track => new Date(track.played_at) >= fourWeeksAgo);
    
    const artistsByWeek: Set<string>[] = [new Set(), new Set(), new Set(), new Set()];
    recentData.forEach(track => {
      const trackDate = new Date(track.played_at);
      const weekIndex = Math.floor((now.getTime() - trackDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      if (weekIndex >= 0 && weekIndex < 4) {
        artistsByWeek[weekIndex].add(track.artist_name);
      }
    });

    const newArtistsPerWeek = artistsByWeek.map((weekSet, index) => {
      if (index === 3) return weekSet.size;
      const previousWeeks = new Set<string>();
      for (let i = index + 1; i < 4; i++) {
        artistsByWeek[i].forEach(artist => previousWeeks.add(artist));
      }
      return Array.from(weekSet).filter(artist => !previousWeeks.has(artist)).length;
    });

    const avgNewArtistsPerWeek = Math.round(
      newArtistsPerWeek.reduce((a, b) => a + b, 0) / 4
    );

    // Diversity score
    const totalArtists = new Set(thisMonthData.map(t => t.artist_name)).size;
    const diversityScore = thisMonthData.length > 0
      ? Math.round((totalArtists / thisMonthData.length) * 100)
      : 0;

    return {
      topArtistWeek: topArtistWeek ? topArtistWeek[0] : 'N/A',
      topArtistWeekCount: topArtistWeek ? topArtistWeek[1] : 0,
      weekStreak,
      topArtistMonth: topArtistMonth ? topArtistMonth[0] : 'N/A',
      topArtistMonthCount: topArtistMonth ? topArtistMonth[1] : 0,
      monthStreak,
      avgNewArtistsPerWeek,
      diversityScore,
    };
  }, [data]);

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-600/30">
            <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Artist Insights</h3>
        </div>

        {/* Tooltip */}
        <div className="relative">
            <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="text-purple-300 text-xs font-semibold bg-purple-900/30 px-2 py-1 rounded border border-purple-700/30 hover:bg-purple-900/50 transition-colors"
            >
            INSIGHTS
            </button>
            {showTooltip && (
            <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-80">
                <div className="text-xs text-gray-300 space-y-2">
                <p className="font-semibold text-white mb-1">Artist Analytics</p>
                <p>Track your listening patterns and discover which artists dominate your recent rotations.</p>
        
                <div className="pt-2 border-t border-gray-700/50 space-y-2">
                    <div>
                    <p className="font-semibold text-blue-400">Top Artist (Week/Month)</p>
                    <p className="text-xs">Your most-played artist in the current time period with total play count.</p>
                    </div>
          
                    <div>
                    <p className="font-semibold text-amber-400">🔥 Streak</p>
                    <p className="text-xs">Consecutive weeks or months this artist has been your #1. Shows obsession phases!</p>
                    </div>
          
                    <div>
                    <p className="font-semibold text-green-400">Discovery Rate</p>
                    <p className="text-xs">Average number of new artists you discover each week (artists you haven't listened to before).</p>
                    </div>
          
                    <div>
                    <p className="font-semibold text-cyan-400">Diversity Score</p>
                    <p className="text-xs">Ratio of unique artists to total plays. Higher % = more variety in your listening.</p>
                    </div>
                </div>
                </div>
            </div>
            )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Top Artist This Week */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30 text-center">
          <p className="text-gray-400 text-xs mb-2">Top Artist This Week</p>
          <p className="text-blue-300 text-lg font-bold truncate" title={stats.topArtistWeek}>
            {stats.topArtistWeek}
          </p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-gray-500 text-xs">
              {stats.topArtistWeekCount} plays
            </p>
            {stats.weekStreak > 1 && (
              <span className="text-amber-400 text-xs font-semibold">
                🔥{stats.weekStreak}
              </span>
            )}
          </div>
        </div>

        {/* Top Artist This Month */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30 text-center">
          <p className="text-gray-400 text-xs mb-2">Top Artist This Month</p>
          <p className="text-purple-300 text-lg font-bold truncate" title={stats.topArtistMonth}>
            {stats.topArtistMonth}
          </p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-gray-500 text-xs">
              {stats.topArtistMonthCount} plays
            </p>
            {stats.monthStreak > 1 && (
              <span className="text-amber-400 text-xs font-semibold">
                🔥{stats.monthStreak}
              </span>
            )}
          </div>
        </div>

        {/* Discovery Rate */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30 text-center">
          <p className="text-gray-400 text-xs mb-2">Discovery Rate</p>
          <p className="text-green-300 text-2xl font-bold">
            {stats.avgNewArtistsPerWeek}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            New artists/Week
          </p>
        </div>

        {/* Diversity Score */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30 text-center">
          <p className="text-gray-400 text-xs mb-2">Artist Diversity</p>
          <p className="text-cyan-300 text-2xl font-bold">
            {stats.diversityScore}
            <span className="text-sm text-gray-400 ml-1">%</span>
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Variety Score
          </p>
        </div>
      </div>
    </div>
  );
}
