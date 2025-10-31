// components/ConsistencyVariance.tsx
import { useMemo, useState } from 'react';

interface SpotifyData {
  played_at: string;
  track_name: string;
  artist_name: string;
  duration_ms: number;
}

interface Props {
  data: SpotifyData[];
}

type TimeRange = '7d' | '1m' | '3m' | '6m' | 'all';

const TIME_RANGES = [
  { value: '7d' as TimeRange, label: '7 Days', days: 7 },
  { value: '1m' as TimeRange, label: '1 Month', days: 30 },
  { value: '3m' as TimeRange, label: '3 Months', days: 90 },
  { value: '6m' as TimeRange, label: '6 Months', days: 180 },
  { value: 'all' as TimeRange, label: 'All Time', days: null },
];

export default function ConsistencyVariance({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');
  const [hoveredDay, setHoveredDay] = useState<{
  date: string;
  plays: number;
  tracks: number;
  artists: number;
  duration: number;
  x: number;
  y: number;
} | null>(null);


  const consistencyData = useMemo(() => {
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

    // Group by date and calculate detailed stats
    const dailyCounts = new Map<string, number>();
    const dailyDetails = new Map<string, { tracks: Set<string>; artists: Set<string>; duration: number }>();
    
    filteredData.forEach(track => {
      const date = new Date(track.played_at).toISOString().split('T')[0];
      dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
      
      if (!dailyDetails.has(date)) {
        dailyDetails.set(date, { tracks: new Set(), artists: new Set(), duration: 0 });
      }
      const details = dailyDetails.get(date)!;
      details.tracks.add(track.track_name);
      details.artists.add(track.artist_name);
      details.duration += Math.floor((track.duration_ms || 180000) / 60000); // Convert to minutes
    });

    const sortedDates = Array.from(dailyCounts.keys()).sort();
    if (sortedDates.length === 0) return null;

    const startDate = new Date(sortedDates[0]);
    const endDate = new Date(sortedDates[sortedDates.length - 1]);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const activeDays = dailyCounts.size;
    const consistency = (activeDays / totalDays) * 100;

    const counts = Array.from(dailyCounts.values());
    const mean = counts.reduce((sum, count) => sum + count, 0) / counts.length;
    const variance = counts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / counts.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = (stdDev / mean) * 100;

    // Generate last 7 weeks heatmap data
    const weeksData = [];
    const today = new Date();
    for (let week = 6; week >= 0; week--) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (week * 7 + (6 - day)));
        const dateStr = date.toISOString().split('T')[0];
        const count = dailyCounts.get(dateStr) || 0;
        weekData.push({ date: dateStr, count, day });
      }
      weeksData.push(weekData);
    }

    let currentStreak = 0;
    let checkDate = new Date();
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (dailyCounts.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      consistency: consistency.toFixed(1),
      variance: coefficientOfVariation.toFixed(1),
      activeDays,
      totalDays,
      currentStreak,
      avgPlaysPerDay: mean.toFixed(1),
      weeksData,
      dailyDetails
    };
  }, [data, timeRange]);

  if (!consistencyData) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <p className="text-gray-400">No consistency data available</p>
      </div>
    );
  }

  const getHeatmapColor = (count: number) => {
    const maxCount = Math.max(...consistencyData.weeksData.flat().map(d => d.count), 1);
    const intensity = count / maxCount;
    if (count === 0) return 'bg-gray-800';
    if (intensity < 0.25) return 'bg-orange-900/40';
    if (intensity < 0.5) return 'bg-orange-700/60';
    if (intensity < 0.75) return 'bg-orange-500/80';
    return 'bg-orange-400';
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Listening Consistency</h2>
          <p className="text-gray-400 text-sm">Activity frequency and variance patterns</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Period Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="text-xs font-semibold bg-gray-900 text-orange-300 px-3 py-1.5 rounded border border-orange-700/30 hover:bg-gray-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {TIME_RANGES.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>

          {/* Badge */}
          <div 
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-900/30 text-orange-300 border border-orange-700/30">
              Consistency
            </span>
            {showTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-80">
                <p className="text-white text-xs font-semibold mb-2">7-Week Activity Heatmap</p>
                <p className="text-gray-300 text-xs mb-3">
                  Each cell represents one day. Darker orange indicates higher listening volume. The pattern reveals engagement consistency and routine formation.
                </p>
                
                <div className="border-t border-gray-600 pt-2 space-y-1">
                  <p className="text-gray-400 text-[10px]">
                    <span className="text-white font-semibold">Consistency:</span> % of days active
                  </p>
                  <p className="text-gray-400 text-[10px]">
                    <span className="text-white font-semibold">Variance:</span> Daily volume fluctuation
                  </p>
                  <p className="text-gray-400 text-[10px]">
                    <span className="text-white font-semibold">Streak:</span> Consecutive active days
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-4">
          <p className="text-gray-400 text-xs mb-1">Consistency Score</p>
          <p className="text-white font-bold text-2xl">{consistencyData.consistency}%</p>
          <p className="text-gray-500 text-xs">{consistencyData.activeDays}/{consistencyData.totalDays} days active</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4">
          <p className="text-gray-400 text-xs mb-1">Variance Index</p>
          <p className="text-orange-300 font-bold text-2xl">{consistencyData.variance}%</p>
          <p className="text-gray-500 text-xs">activity variation</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4">
          <p className="text-gray-400 text-xs mb-1">Current Streak</p>
          <p className="text-green-400 font-bold text-2xl">{consistencyData.currentStreak}</p>
          <p className="text-gray-500 text-xs">consecutive days</p>
        </div>
      </div>

      {/* Weekly Heatmap */}
      <div className="bg-gray-900/30 rounded-lg p-4 mb-4 relative">
        <p className="text-gray-400 text-xs font-semibold mb-3">7-Week Activity Pattern</p>
        <div className="space-y-1">
          {consistencyData.weeksData.map((week, weekIdx) => (
            <div key={weekIdx} className="flex gap-1">
              {week.map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  className={`flex-1 h-6 rounded-sm ${getHeatmapColor(day.count)} transition-colors cursor-pointer hover:ring-2 hover:ring-orange-400`}
                  onMouseEnter={(e) => {
  const details = consistencyData.dailyDetails.get(day.date);
  if (day.count > 0 && details) {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredDay({
      date: day.date,
      plays: day.count,
      tracks: details.tracks.size,
      artists: details.artists.size,
      duration: details.duration,
      x: rect.left + rect.width / 2,
      y: rect.top
    });
  }
}}

                  onMouseLeave={() => setHoveredDay(null)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Custom Hover Tooltip */}
{hoveredDay && (
  <div 
    className="fixed bg-gray-700 border border-gray-600 rounded-lg shadow-xl p-3 z-50 min-w-[180px] pointer-events-none"
    style={{
      left: `${hoveredDay.x}px`,
      top: `${hoveredDay.y - 10}px`,
      transform: 'translate(-50%, -100%)'
    }}
  >
    <p className="text-white text-xs font-semibold mb-2">
      {new Date(hoveredDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
    </p>
    <div className="space-y-1">
      <div className="text-[11px] text-gray-300">
        <span className="font-semibold">{hoveredDay.plays}</span> plays
      </div>
      <div className="text-[11px] text-gray-400">
        {hoveredDay.tracks} unique tracks
      </div>
      <div className="text-[11px] text-gray-400">
        {hoveredDay.artists} artists
      </div>
      <div className="text-[11px] pt-1 border-t border-gray-600">
        <span className="text-orange-300 font-semibold">
          {Math.floor(hoveredDay.duration / 60)}h {hoveredDay.duration % 60}m
        </span>
      </div>
    </div>
  </div>
)}


        <div className="flex justify-between mt-2 text-[10px] text-gray-500">
          <span>S</span>
          <span>M</span>
          <span>T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span>S</span>
        </div>
      </div>

      {/* Stats, Legend & Insights */}
      <div className="mt-4 space-y-3">
        {/* Stats & Legend Row - TOP */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Avg per active day:</span>
            <span className="text-white font-semibold">{consistencyData.avgPlaysPerDay} plays</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-800" />
              <div className="w-3 h-3 rounded-sm bg-orange-900/40" />
              <div className="w-3 h-3 rounded-sm bg-orange-700/60" />
              <div className="w-3 h-3 rounded-sm bg-orange-500/80" />
              <div className="w-3 h-3 rounded-sm bg-orange-400" />
            </div>
            <span className="text-gray-500">More</span>
          </div>
        </div>

        {/* Dynamic Pattern Insight Bubble - BOTTOM */}
        <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-3">
          <p className="text-orange-300 text-xs font-semibold mb-1">Pattern Analysis</p>
          <p className="text-gray-300 text-xs leading-relaxed">
            {parseFloat(consistencyData.consistency) >= 80 && parseFloat(consistencyData.variance) < 50 && 
              "High-frequency, stable-volume engagement pattern observed. Activity occurs on 80%+ of days with minimal daily fluctuation, indicating strong routine-based listening habits."}
            {parseFloat(consistencyData.consistency) >= 80 && parseFloat(consistencyData.variance) >= 50 && 
              "High-frequency, variable-volume engagement detected. Consistent daily presence with significant intensity fluctuations suggests adaptive listening patterns based on daily context."}
            {parseFloat(consistencyData.consistency) >= 50 && parseFloat(consistencyData.consistency) < 80 && parseFloat(consistencyData.variance) < 50 && 
              "Moderate-frequency, stable-volume pattern identified. Structured engagement on 50-80% of days with predictable activity levels indicates selective but consistent listening behavior."}
            {parseFloat(consistencyData.consistency) >= 50 && parseFloat(consistencyData.consistency) < 80 && parseFloat(consistencyData.variance) >= 50 && 
              "Moderate-frequency, variable-volume behavior observed. Intermittent engagement with concentrated burst activity suggests event-driven or mood-dependent listening patterns."}
            {parseFloat(consistencyData.consistency) < 50 && parseFloat(consistencyData.variance) < 50 && 
              "Low-frequency, stable-volume pattern detected. Infrequent but predictable engagement suggests occasion-based listening with consistent volume when active."}
            {parseFloat(consistencyData.consistency) < 50 && parseFloat(consistencyData.variance) >= 50 && 
              "Low-frequency, variable-volume engagement pattern. Sporadic activity with no clear routine indicates opportunistic or irregular listening behavior."}
          </p>
        </div>
      </div>
    </div>
  );
}
