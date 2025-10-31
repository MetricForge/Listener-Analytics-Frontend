// components/ListeningHeatmap.tsx
import { useState, useMemo } from 'react';

interface SpotifyData {
  played_at: string;
  track_name: string;
  artist_name: string;
  duration_ms: number;
}

interface Props {
  data: SpotifyData[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function ListeningHeatmap({ data }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number; count: number } | null>(null);

  const heatmapData = useMemo(() => {
    const grid: number[][] = Array(7).fill(0).map(() => Array(24).fill(0));
    
    data.forEach(track => {
      const date = new Date(track.played_at);
      const day = date.getDay(); // 0 = Sunday
      const hour = date.getHours();
      grid[day][hour]++;
    });

    return grid;
  }, [data]);

  const maxCount = useMemo(() => {
    return Math.max(...heatmapData.flat());
  }, [heatmapData]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-800';
    const intensity = Math.min((count / maxCount) * 100, 100);
    if (intensity < 25) return 'bg-blue-900/40';
    if (intensity < 50) return 'bg-blue-700/60';
    if (intensity < 75) return 'bg-blue-500/80';
    return 'bg-blue-400';
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-800 to-gray-800 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-600/30">
            <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Listening Activity Heatmap</h3>
        </div>

        {/* Tooltip Badge */}
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="text-purple-300 text-xs font-semibold bg-purple-900/30 px-2 py-1 rounded border border-purple-700/30 hover:bg-purple-900/50 transition-colors"
          >
            HEATMAP
          </button>
          {showTooltip && (
            <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-72">
              <p className="text-xs text-gray-300">
                <strong className="text-white block mb-1">When You Listen Most</strong>
                Shows your listening activity by hour and day of week. Darker colors indicate more tracks played during that time.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Container */}
      <div className="overflow-x-auto -mx-2 px-02">
        <div className="relative min-w-max">
          {/* Hour labels (top) */}
          <div className="flex ml-6 mb-2">
            {HOURS.map(hour => (
              <div 
                key={hour} 
                className="text-center text-xs text-gray-400"
                style={{ width: '27px' }}
              >
                {hour % 6 === 0 ? hour : ''}
              </div>
            ))}
          </div>

          {/* Day rows */}
          {DAYS.map((day, dayIndex) => (
            <div key={day} className="flex items-center mb-1">
              {/* Day label */}
              <div className="w-10 text-xs text-gray-400 text-right pr-2 flex-shrink-0">
                {day}
              </div>
              
              {/* Hour cells */}
              <div className="flex gap-1">
                {HOURS.map(hour => {
                  const count = heatmapData[dayIndex][hour];
                  return (
                    <div
                      key={hour}
                      className={`h-8 rounded ${getColor(count)} transition-all cursor-pointer hover:ring-2 hover:ring-blue-400`}
                      style={{ width: '24px' }}
                      onMouseEnter={() => setHoveredCell({ day: dayIndex, hour, count })}
                      onMouseLeave={() => setHoveredCell(null)}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Hover tooltip */}
          {hoveredCell && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-xl pointer-events-none z-50">
              <p className="text-xs text-white font-semibold">
                {DAYS[hoveredCell.day]} at {hoveredCell.hour}:00
              </p>
              <p className="text-xs text-gray-400">
                {hoveredCell.count} {hoveredCell.count === 1 ? 'track' : 'tracks'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700/50">
        <p className="text-xs text-gray-400">Less activity</p>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded bg-gray-800" />
          <div className="w-4 h-4 rounded bg-blue-900/40" />
          <div className="w-4 h-4 rounded bg-blue-700/60" />
          <div className="w-4 h-4 rounded bg-blue-500/80" />
          <div className="w-4 h-4 rounded bg-blue-400" />
        </div>
        <p className="text-xs text-gray-400">More activity</p>
      </div>
    </div>
  );
}
