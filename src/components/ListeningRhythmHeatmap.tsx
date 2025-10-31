// components/ListeningRhythmHeatmap.tsx
import { useState, useMemo } from 'react';

interface SpotifyData {
  played_at: string;
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

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => i);

export default function ListeningRhythmHeatmap({ data }: Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');
  const [hoveredCell, setHoveredCell] = useState<{ day: number; slot: number } | null>(null);
  const [showBadgeTooltip, setShowBadgeTooltip] = useState(false);

  const heatmapData = useMemo(() => {
    const now = new Date();
    const selectedRange = TIME_RANGES.find(r => r.value === timeRange)!;
    
    const filteredData = selectedRange.days
      ? data.filter(track => {
          const trackDate = new Date(track.played_at);
          const rangeStart = new Date(now.getTime() - selectedRange.days * 24 * 60 * 60 * 1000);
          return trackDate >= rangeStart && trackDate <= now;
        })
      : data;

    const counts = new Map<string, number>();
    const dayOccurrences = new Map<string, Set<string>>();
    const uniqueDays = new Set<string>();
    
    filteredData.forEach(track => {
      const date = new Date(track.played_at);
      const dateStr = date.toISOString().split('T')[0];
      uniqueDays.add(dateStr);
      
      const day = date.getDay();
      const hour = date.getHours();
      const minute = date.getMinutes();
      const slot = hour * 2 + (minute >= 30 ? 1 : 0);
      const key = `${day}-${slot}`;
      
      counts.set(key, (counts.get(key) || 0) + 1);
      
      if (!dayOccurrences.has(key)) {
        dayOccurrences.set(key, new Set<string>());
      }
      dayOccurrences.get(key)!.add(dateStr);
    });

    const totalDays = Math.max(uniqueDays.size, 1);
    const avgData: number[][] = DAYS.map(() => Array(48).fill(0));
    const occurrenceData: number[][] = DAYS.map(() => Array(48).fill(0));
    
    for (let day = 0; day < 7; day++) {
      for (let slot = 0; slot < 48; slot++) {
        const key = `${day}-${slot}`;
        avgData[day][slot] = counts.get(key) || 0;
        occurrenceData[day][slot] = dayOccurrences.get(key)?.size || 0;
      }
    }

    const maxValue = Math.max(...avgData.flat(), 1);
    
    let peakDay = 0, peakSlot = 0, peakValue = 0;
    
    for (let day = 0; day < 7; day++) {
      for (let slot = 0; slot < 48; slot++) {
        if (avgData[day][slot] > peakValue) {
          peakValue = avgData[day][slot];
          peakDay = day;
          peakSlot = slot;
        }
      }
    }

    return { avgData, occurrenceData, maxValue, totalPlays: filteredData.length, totalDays, peakDay, peakSlot, peakValue };
  }, [data, timeRange]);

  const getColor = (value: number) => {
    if (value === 0) return 'bg-gray-800/50';
    const intensity = Math.min(value / heatmapData.maxValue, 1);
    if (intensity < 0.2) return 'bg-teal-900/40';
    if (intensity < 0.4) return 'bg-teal-700/60';
    if (intensity < 0.6) return 'bg-teal-500/70';
    if (intensity < 0.8) return 'bg-teal-400/80';
    return 'bg-teal-300';
  };

  const formatTimeSlot = (slot: number) => {
    const hour = Math.floor(slot / 2);
    const minute = (slot % 2) * 30;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const formatPeakTime = () => {
    if (heatmapData.peakValue === 0) return 'No data';
    return `${DAYS[heatmapData.peakDay]} ${formatTimeSlot(heatmapData.peakSlot)}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 h-full">
      {/* Header with Filter and Badge */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Listening Rhythm Heatmap</h2>
          <p className="text-gray-400 text-sm">Shows average plays per 30-minute block for each day of the week. Reveals precise listening patterns.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Dropdown Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="text-xs font-semibold bg-gray-900 text-purple-300 px-2 py-1.5 rounded border border-purple-700/30 hover:bg-gray-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {TIME_RANGES.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>

          {/* Badge with Tooltip */}
            <div 
              className="relative"
              onMouseEnter={() => setShowBadgeTooltip(true)}
              onMouseLeave={() => setShowBadgeTooltip(false)}
            >
              <button className="px-3 py-1 bg-teal-900/30 text-teal-300 rounded-full text-xs font-semibold border border-teal-700/30 hover:bg-teal-900/50 transition-colors">
                RHYTHM
              </button>
              {showBadgeTooltip && (
                <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-80">
                  <div className="text-xs text-gray-300 space-y-2">
                    <p className="font-semibold text-white mb-2">Listening Rhythm Heatmap</p>
                    <p className="mb-3">
                      Shows average plays per 30-minute block for each day of the week. Reveals precise listening patterns.
                    </p>
        
                    <div className="pt-2 border-t border-gray-700/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Peak Time:</span>
                        <span className="text-teal-300 font-semibold">
                          {formatPeakTime()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Peak Intensity:</span>
                        <span className="text-teal-300 font-semibold">
                          {heatmapData.peakValue} plays
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Total Plays:</span>
                        <span className="text-white font-semibold">
                          {heatmapData.totalPlays.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-700/50 text-[0.7rem] text-gray-400">
                      💡 Each cell = 30-minute window. Darker colors = more listening activity.
                    </div>
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900/50 rounded p-3">
          <p className="text-gray-400 text-xs mb-1">Total Plays</p>
          <p className="text-white font-bold text-lg">{heatmapData.totalPlays.toLocaleString()}</p>
        </div>
        <div className="bg-gray-900/50 rounded p-3">
          <p className="text-gray-400 text-xs mb-1">Peak Time</p>
          <p className="text-teal-300 font-semibold text-sm">{formatPeakTime()}</p>
        </div>
        <div className="bg-gray-900/50 rounded p-3">
          <p className="text-gray-400 text-xs mb-1">Peak Plays</p>
          <p className="text-white font-bold text-lg">{heatmapData.peakValue}</p>
        </div>
      </div>

{/* Heatmap */}
<div className="overflow-x-auto">
  <div className="inline-block min-w-full">
    {DAYS.map((day, dayIndex) => (
      <div key={day} className="flex items-center gap-1 mb-1">
        {/* Day label */}
        <div className="w-12 text-xs text-gray-400 font-medium text-right sticky left-0 bg-gradient-to-r from-gray-800 via-gray-800 to-gray-800/0 pr-2 z-10">
          {day}
        </div>

        {/* 30-min slot cells */}
        <div className="flex gap-0.5">
          {TIME_SLOTS.map(slot => {
            const value = heatmapData.avgData[dayIndex][slot];
            const occurrences = heatmapData.occurrenceData[dayIndex][slot];
            const isHovered = hoveredCell?.day === dayIndex && hoveredCell?.slot === slot;
            
            return (
              <div
                key={slot}
                className="relative"
                onMouseEnter={() => setHoveredCell({ day: dayIndex, slot })}
                onMouseLeave={() => setHoveredCell(null)}
              >
                <div
                  className={`w-4 h-6 rounded-sm ${getColor(value)} cursor-pointer transition-all ${
                    isHovered ? 'ring-2 ring-white scale-110' : ''
                  }`}
                />
                
                {/* Tooltip - Using portal-style fixed positioning */}
                {isHovered && (
                  <div 
                    className="fixed bg-gray-700 border border-gray-600 rounded shadow-xl p-3 z-[9999] whitespace-nowrap pointer-events-none"
                    style={{
                      left: '50%',
                      top: '40%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <p className="text-white font-bold text-xs mb-1">
                      {day} {formatTimeSlot(slot)}
                    </p>
                    <p className="text-gray-300 text-xs">
                      Occurred: {occurrences}x across {heatmapData.totalDays} days
                    </p>
                    <p className="text-gray-300 text-xs">
                      Frequency: {((occurrences / heatmapData.totalDays) * 100).toFixed(0)}%
                    </p>
                    {value > 0 && (
                      <p className="text-gray-400 text-xs mt-1">
                        Total plays: {Math.round(value)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    ))}

            {/* Time labels */}
            <div className="flex items-center gap-1 mt-2">
              <div className="w-12" /> {/* Spacer for day column */}
              <div className="flex gap-0.5 text-[10px] text-gray-500">
                {[0, 6, 12, 18, 24, 30, 36, 42].map(slot => (
                  <div key={slot} style={{ width: `${(slot === 0 ? 1 : 6) * 1.2}rem` }} className="text-center">
                    {formatTimeSlot(slot).replace(' ', '')}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
    

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-gray-800/50 rounded-sm" />
          <div className="w-4 h-4 bg-teal-900/40 rounded-sm" />
          <div className="w-4 h-4 bg-teal-700/60 rounded-sm" />
          <div className="w-4 h-4 bg-teal-500/70 rounded-sm" />
          <div className="w-4 h-4 bg-teal-400/80 rounded-sm" />
          <div className="w-4 h-4 bg-teal-300 rounded-sm" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
