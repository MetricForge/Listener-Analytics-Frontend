// components/ListeningPersonalityProfile.tsx
import { useMemo, useState } from 'react';

interface SpotifyData {
  played_at: string;
  duration_ms: number;
  artist_name?: string;
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

export default function ListeningPersonalityProfile({ data }: Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');
  const [showBadgeTooltip, setShowBadgeTooltip] = useState(false);

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

  const personality = useMemo(() => {
    if (filteredData.length === 0) return null;

    // Sort by time
    const sorted = [...filteredData].sort((a, b) => 
      new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
    );

    // Calculate sessions
    const SESSION_GAP = 20 * 60 * 1000; // 20 minutes
    const sessions: number[] = [];
    let currentSession = 0;

    for (let i = 0; i < sorted.length; i++) {
      currentSession += sorted[i].duration_ms;
      if (i < sorted.length - 1) {
        const gap = new Date(sorted[i + 1].played_at).getTime() - 
                     new Date(sorted[i].played_at).getTime();
        if (gap > SESSION_GAP) {
          sessions.push(currentSession);
          currentSession = 0;
        }
      }
    }
    if (currentSession > 0) sessions.push(currentSession);

    const avgSessionMinutes = sessions.reduce((a, b) => a + b, 0) / sessions.length / 60000;

    // Session personality: Marathon (>45min avg) vs Quick (<25min avg)
    const sessionScore = Math.min(100, (avgSessionMinutes / 60) * 100);
    const sessionType = avgSessionMinutes > 45 ? 'Marathon Listener' : 'Quick Sessions';
    const sessionDesc = avgSessionMinutes > 45 
      ? 'You prefer long, immersive listening sessions'
      : 'You listen in short, focused bursts';

    // Consistency: Check day gaps
    const uniqueDays = new Set<string>();
    filteredData.forEach(track => {
      const date = new Date(track.played_at);
      uniqueDays.add(date.toDateString());
    });
    
    const daySpan = Math.ceil((new Date(sorted[sorted.length - 1].played_at).getTime() - 
                                new Date(sorted[0].played_at).getTime()) / (1000 * 60 * 60 * 24));
    const consistencyScore = Math.min(100, (uniqueDays.size / Math.max(daySpan, 1)) * 100);
    const consistencyType = consistencyScore > 70 ? 'Routine Creature' : 'Spontaneous Explorer';
    const consistencyDesc = consistencyScore > 70
      ? 'You listen regularly and consistently'
      : 'Your listening habits are spontaneous';

    // Weekday vs Weekend
    let weekdayPlays = 0;
    let weekendPlays = 0;
    filteredData.forEach(track => {
      const day = new Date(track.played_at).getDay();
      if (day === 0 || day === 6) weekendPlays++;
      else weekdayPlays++;
    });

    const weekendScore = (weekendPlays / (weekdayPlays + weekendPlays)) * 100;
    const weekendType = weekendScore > 40 ? 'Weekend Warrior' : 'Weekday Grinder';
    const weekendDesc = weekendScore > 40
      ? 'Weekends are your prime listening time'
      : 'You listen more during the week';

    // Time of day
    const hours = filteredData.map(track => new Date(track.played_at).getHours());
    const lateNightCount = hours.filter(h => h >= 22 || h < 6).length;
    const morningCount = hours.filter(h => h >= 6 && h < 12).length;

    const timeScore = (lateNightCount / filteredData.length) * 100;
    const timeType = lateNightCount > morningCount ? 'Night Owl' : 'Morning Person';
    const timeDesc = lateNightCount > morningCount
      ? 'Your peak listening is late night'
      : 'You prefer listening in the morning';

    return {
      session: { type: sessionType, score: sessionScore, desc: sessionDesc, icon: '🎧' },
      consistency: { type: consistencyType, score: consistencyScore, desc: consistencyDesc, icon: '📅' },
      weekend: { type: weekendType, score: weekendScore, desc: weekendDesc, icon: '🗓️' },
      time: { type: timeType, score: timeScore, desc: timeDesc, icon: '🌙' },
    };
  }, [filteredData]);

  const traits = personality ? [personality.session, personality.consistency, personality.weekend, personality.time] : [];

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 h-full">
      {/* Header with Filter and Badge */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Your Listening Personality</h2>
          <p className="text-gray-400 text-sm">
            Based on your listening patterns and behavior over time
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
              Personality
            </span>
            {showBadgeTooltip && (
              <div className="absolute top-full right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-50 w-80">
                <p className="text-white text-xs font-semibold mb-1">Behavioral Classification</p>
                <p className="text-gray-300 text-xs mb-2">
                  Uses pattern recognition to segment users into behavioral categories based on listening metrics.
                </p>
                <p className="text-gray-300 text-xs">
                  Analyzes session duration, consistency patterns, temporal preferences, and weekday/weekend activity to generate multi-dimensional user profiles.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {!personality ? (
        <p className="text-gray-400 text-sm">Not enough data to analyze your personality for this period</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {traits.map((trait, idx) => (
              <div
                key={idx}
                className="bg-gray-900/50 rounded-lg p-5 border border-gray-700/50 hover:border-purple-500/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{trait.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">{trait.type}</h3>
                    <p className="text-gray-400 text-xs">{trait.desc}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${trait.score}%` }}
                  />
                </div>
                <p className="text-right text-xs text-purple-300 mt-1 font-semibold">
                  {trait.score.toFixed(0)}% match
                </p>
              </div>
            ))}
          </div>

          {/* Classification Summary */}
        <div className="mt-6 p-4 bg-purple-900/20 border border-purple-700/30 rounded-lg">
            <p className="text-purple-300 text-sm">
            <span className="font-semibold">📊 Behavioral Classification:</span> User exhibits{' '}
            <span className="font-bold">{personality.session.type}</span> engagement patterns with{' '}
            <span className="font-bold">{personality.consistency.type}</span> tendencies, classified as{' '}
            <span className="font-bold">{personality.weekend.type}</span> temporal distribution and{' '}
            <span className="font-bold">{personality.time.type}</span> peak activity characteristics.
            </p>
        </div>
        </>
      )}
    </div>
  );
}
