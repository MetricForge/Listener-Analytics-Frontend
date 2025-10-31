// components/TimeOfDayDistribution.tsx
import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SpotifyData {
  played_at: string;
  track_name?: string;
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

const TIME_PERIODS = [
  { name: 'Morning', start: 6, end: 12, color: '#fbbf24', emoji: '🌅' },
  { name: 'Afternoon', start: 12, end: 18, color: '#fb923c', emoji: '☀️' },
  { name: 'Evening', start: 18, end: 22, color: '#a78bfa', emoji: '🌆' },
  { name: 'Night', start: 22, end: 6, color: '#60a5fa', emoji: '🌙' },
];

export default function TimeOfDayDistribution({ data }: Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [showBadgeTooltip, setShowBadgeTooltip] = useState(false);

  // Filter data based on selected time range
  const { currentPeriodData, previousPeriodData } = useMemo(() => {
    const now = new Date();
    const days = TIME_RANGES.find(r => r.value === timeRange)?.days || 7;
    
    const currentStart = new Date(now);
    currentStart.setDate(currentStart.getDate() - days);
    
    const previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - days);
    
    const current = data.filter(track => {
      const date = new Date(track.played_at);
      return date >= currentStart && date <= now;
    });
    
    const previous = data.filter(track => {
      const date = new Date(track.played_at);
      return date >= previousStart && date < currentStart;
    });
    
    return { currentPeriodData: current, previousPeriodData: previous };
  }, [data, timeRange]);

  // Calculate period statistics for current and previous periods
  const periodStats = useMemo(() => {
    const calculatePeriodCounts = (dataset: SpotifyData[]) => {
      const periodCounts = TIME_PERIODS.map(period => ({
        name: period.name,
        value: 0,
        uniqueTracks: new Set<string>(),
        color: period.color,
        emoji: period.emoji,
      }));

      dataset.forEach(track => {
        const date = new Date(track.played_at);
        const hour = date.getHours();
        
        const period = TIME_PERIODS.find(p => {
          if (p.start < p.end) {
            return hour >= p.start && hour < p.end;
          } else {
            return hour >= p.start || hour < p.end;
          }
        });

        if (period) {
          const index = TIME_PERIODS.findIndex(p => p.name === period.name);
          periodCounts[index].value++;
          if (track.track_name) {
            periodCounts[index].uniqueTracks.add(track.track_name);
          }
        }
      });

      return periodCounts;
    };

    const current = calculatePeriodCounts(currentPeriodData);
    const previous = calculatePeriodCounts(previousPeriodData);

    // Calculate changes
    return current.map((curr, idx) => {
      const prev = previous[idx];
      const change = curr.value - prev.value;
      const percentChange = prev.value > 0 ? ((change / prev.value) * 100) : (curr.value > 0 ? 100 : 0);
      
      return {
        ...curr,
        uniqueCount: curr.uniqueTracks.size,
        change,
        percentChange,
        previousValue: prev.value,
      };
    });
  }, [currentPeriodData, previousPeriodData]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return periodStats.map(p => ({
      name: p.name,
      value: p.value,
      color: p.color,
    }));
  }, [periodStats]);

  // Generate dynamic insight
    const insight = useMemo(() => {
      if (periodStats.every(p => p.value === 0)) {
        return "Insufficient data for temporal pattern analysis in selected period";
      }

      const mostActive = periodStats.reduce((max, p) => p.value > max.value ? p : max);
      const mostUnique = periodStats.reduce((max, p) => p.uniqueCount > max.uniqueCount ? p : max);
      const biggestIncrease = periodStats.reduce((max, p) => p.change > max.change ? p : max);
      const biggestDecrease = periodStats.reduce((min, p) => p.change < min.change ? p : min);

      // Choose most interesting insight
      if (biggestIncrease.change > 10 && biggestIncrease.percentChange > 20) {
        return `${biggestIncrease.emoji} ${biggestIncrease.name} period demonstrates strongest growth with ${biggestIncrease.change > 0 ? '+' : ''}${biggestIncrease.change} track increase (+${biggestIncrease.percentChange.toFixed(0)}%) versus previous period baseline`;
      } else if (biggestDecrease.change < -10 && Math.abs(biggestDecrease.percentChange) > 20) {
        return `${biggestDecrease.emoji} ${biggestDecrease.name} period shows significant volume reduction with ${biggestDecrease.change} track decrease (${biggestDecrease.percentChange.toFixed(0)}%) versus previous period baseline`;
      } else if (mostUnique.uniqueCount > 0 && mostUnique.uniqueCount === mostActive.uniqueCount) {
        return `${mostActive.emoji} ${mostActive.name} period exhibits highest engagement density with ${mostActive.value} total tracks (${mostActive.uniqueCount} unique content items)`;
      } else {
        const total = periodStats.reduce((sum, p) => sum + p.value, 0);
        const percent = ((mostActive.value / total) * 100).toFixed(0);
        return `${mostActive.emoji} ${mostActive.name} period accounts for ${percent}% of total listening activity (${mostActive.value} tracks), establishing dominant temporal pattern`;
      }
    }, [periodStats]);


  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const total = chartData.reduce((sum, entry) => sum + entry.value, 0);
      const percent = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-gray-700 border border-gray-600 rounded shadow-xl p-3">
          <p className="text-white font-bold mb-1">{payload[0].name}</p>
          <p className="text-gray-300 text-sm">
            {payload[0].value.toLocaleString()} plays ({percent}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const total = chartData.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header with Badge and Filter */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Listening by Time of Day</h2>
          <p className="text-gray-400 text-sm">Distribution of listening across different times.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Badge with Tooltip */}
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
          <div 
            className="relative"
            onMouseEnter={() => setShowBadgeTooltip(true)}
            onMouseLeave={() => setShowBadgeTooltip(false)}
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-900/30 text-purple-300 border border-purple-700/30">
              Time Distribution
            </span>
            {showBadgeTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-80">
                   <p className="text-gray-300 text-xs mb-2">
                  Segments listening activity across diurnal time periods (Morning, Afternoon, Evening, Night).
                </p>
                <p className="text-gray-300 text-xs">
                  Analyzes hourly engagement patterns to identify peak activity windows and temporal preference distributions across the 24-hour cycle.
                </p>
              </div>
            )}
          </div>


        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {TIME_PERIODS.map(period => (
          <div key={period.name} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: period.color }}
            />
            <span className="text-gray-300">
              {period.emoji} {period.name}
            </span>
          </div>
        ))}
      </div>

      {/* Pie Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Period Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {periodStats.map((period) => {
          const percent = total > 0 ? ((period.value / total) * 100).toFixed(1) : '0.0';
          const changeColor = period.change > 0 ? 'text-green-400' : period.change < 0 ? 'text-red-400' : 'text-gray-400';
          
          return (
            <div key={period.name} className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{period.emoji}</span>
                <h3 className="text-white font-bold text-sm">{period.name}</h3>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-white">
                  {period.value.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">tracks</p>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${changeColor}`}>
                    {period.change > 0 ? '+' : ''}{period.change}
                  </span>
                  <span className="text-xs text-gray-500">vs previous</span>
                </div>
                <p className="text-xs text-gray-400">{percent}% of plays</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Insight */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <p className="text-blue-300 text-sm">
            📊 <span className="font-semibold">Pattern Analysis:</span> {insight}
          </p>
        </div>
    </div>
  );
}
