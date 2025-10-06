import { useState, useMemo, useRef, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from 'recharts';
import Skeleton from '../ui/Skeleton';
import { Frown, Meh, Smile, Heart } from 'lucide-react';
import { getWeeklyMoodData, getMoodIcon, movingAverage } from '../../utils/moodUtils';
import { exportSVGToPNG, exportDataToCSV } from '../../utils/exportUtils';
import './StatisticsView.css';

const RANGE_OPTIONS = [7, 30, 90];
const TOOLTIP_STYLE = Object.freeze({
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  boxShadow: 'var(--shadow-md)',
});
const DEFAULT_METRICS = Object.freeze({ total_entries: 0, average_mood: 0 });
const EMPTY_OBJECT = Object.freeze({});
const MIN_TAG_OCCURRENCES = 2;

const MOOD_LEGEND = [
  { value: 1, icon: Frown, color: 'var(--mood-1)', label: 'Terrible', shorthand: 'T' },
  { value: 2, icon: Frown, color: 'var(--mood-2)', label: 'Bad', shorthand: 'B' },
  { value: 3, icon: Meh, color: 'var(--mood-3)', label: 'Okay', shorthand: 'O' },
  { value: 4, icon: Smile, color: 'var(--mood-4)', label: 'Good', shorthand: 'G' },
  { value: 5, icon: Heart, color: 'var(--mood-5)', label: 'Amazing', shorthand: 'A' },
];

const MOOD_FULL_LABELS = MOOD_LEGEND.reduce((acc, { value, label }) => {
  acc[value] = label;
  return acc;
}, {});

const MOOD_SHORTHANDS = MOOD_LEGEND.reduce((acc, { value, shorthand }) => {
  acc[value] = shorthand;
  return acc;
}, {});

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatTrendTooltip = (value, _name, props) => {
  if (props?.dataKey === 'ma') {
    if (value == null || Number.isNaN(value)) {
      return ['No data', 'Moving Avg'];
    }
    return [Number(value).toFixed(2), 'Moving Avg'];
  }

  if (value == null) {
    return ['No entry', 'Mood'];
  }

  const label = MOOD_FULL_LABELS[value] ?? '';
  return [label, 'Mood'];
};

const normalizeDateKey = (date) => {
  if (!date) return null;
  const instance = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(instance.getTime())) return null;
  return instance.toLocaleDateString();
};

const buildMoodDistributionData = (moodDistribution) =>
  MOOD_LEGEND.map(({ value, label, shorthand, color }) => ({
    key: value,
    label,
    mood: shorthand,
    count: moodDistribution?.[value] ?? 0,
    fill: color,
  }));

const aggregateTagStats = (entries) => {
  if (!entries?.length) {
    return { topPositive: [], topNegative: [], all: [] };
  }

  const map = new Map();

  for (const entry of entries) {
    const mood = Number(entry.mood);
    if (!entry.selections?.length) continue;

    for (const selection of entry.selections) {
      const key = selection.name || selection.label || String(selection.id);
      const aggregate = map.get(key) ?? { tag: key, count: 0, sum: 0 };
      aggregate.count += 1;
      aggregate.sum += mood;
      map.set(key, aggregate);
    }
  }

  const rows = Array.from(map.values()).map(({ tag, count, sum }) => ({
    tag,
    count,
    avgMood: count ? sum / count : 0,
  }));

  const ranked = rows.filter((row) => row.count >= MIN_TAG_OCCURRENCES).sort((a, b) => b.avgMood - a.avgMood);

  return {
    topPositive: ranked.slice(0, 5),
    topNegative: ranked.slice(-5).reverse(),
    all: rows,
  };
};

const buildCalendarDays = (entries) => {
  const today = new Date();
  const todayKey = today.toDateString();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const lookup = new Map();
  for (const entry of entries ?? []) {
    const key = normalizeDateKey(entry.date);
    if (key) {
      lookup.set(key, entry);
    }
  }

  const days = [];
  const current = new Date(startDate);
  while (current <= lastDay || current.getDay() !== 0) {
    const dateKey = normalizeDateKey(current);
    const entry = dateKey ? lookup.get(dateKey) : null;
    const moodInfo = entry ? getMoodIcon(entry.mood) : null;

    days.push({
      key: current.toISOString(),
      label: current.getDate(),
      entry,
      IconComponent: moodInfo?.icon ?? null,
      iconColor: moodInfo?.color ?? null,
      isCurrentMonth: current.getMonth() === today.getMonth(),
      isToday: current.toDateString() === todayKey,
    });

    current.setDate(current.getDate() + 1);
  }

  return days;
};

const buildOverviewCards = ({ totalEntries, averageMood, currentStreak, bestDayCount }) => [
  {
    key: 'totalEntries',
    value: totalEntries,
    label: 'Total Entries',
    tone: 'default',
  },
  {
    key: 'averageMood',
    value:
      typeof averageMood === 'number' ? averageMood.toFixed(1) : averageMood ?? '0.0',
    label: 'Average Mood',
    tone: 'default',
  },
  {
    key: 'currentStreak',
    value: currentStreak,
    label: 'Current Streak',
    tone: 'danger',
  },
  {
    key: 'bestDay',
    value: bestDayCount,
    label: 'Best Day',
    tone: 'default',
  },
];

const MoodLegend = () => (
  <div className="statistics-view__legend">
    {MOOD_LEGEND.map(({ value, icon, color, label }) => {
      const LegendIcon = icon;
      return (
        <div key={value} className="statistics-view__legend-item">
          <LegendIcon size={16} style={{ color }} />
          <span>{label}</span>
        </div>
      );
    })}
  </div>
);

const StatisticsView = ({ statistics, pastEntries, loading, error }) => {
  const [range, setRange] = useState(7);
  const trendRef = useRef(null);
  const distributionRef = useRef(null);

  const hasStatistics = Boolean(statistics);
  const metrics = statistics?.statistics ?? DEFAULT_METRICS;
  const moodDistribution = useMemo(
    () => statistics?.mood_distribution ?? EMPTY_OBJECT,
    [statistics?.mood_distribution],
  );
  const currentStreak = statistics?.current_streak ?? 0;

  const data = useMemo(() => getWeeklyMoodData(pastEntries, range), [pastEntries, range]);
  const movingAverageSeries = useMemo(() => movingAverage(data.map((d) => d.mood), 7), [data]);
  const trendChartData = useMemo(
    () => data.map((point, index) => ({ ...point, ma: movingAverageSeries[index] })),
    [data, movingAverageSeries],
  );

  const moodDistributionData = useMemo(
    () => buildMoodDistributionData(moodDistribution),
    [moodDistribution],
  );

  const tagStats = useMemo(() => aggregateTagStats(pastEntries), [pastEntries]);

  const calendarDays = useMemo(() => buildCalendarDays(pastEntries), [pastEntries]);
  const handleExportTrendPNG = useCallback(() => {
    const svg = trendRef.current?.querySelector('svg');
    if (svg) {
      exportSVGToPNG(svg, `mood-trend-${range}d.png`);
    }
  }, [range]);

  const handleExportTrendCSV = useCallback(() => {
    exportDataToCSV(data, ['date', 'mood'], `mood-trend-${range}d.csv`);
  }, [data, range]);

  const handleExportDistributionPNG = useCallback(() => {
    const svg = distributionRef.current?.querySelector('svg');
    if (svg) {
      exportSVGToPNG(svg, 'mood-distribution.png');
    }
  }, []);

  const handleExportDistributionCSV = useCallback(() => {
    const rows = MOOD_LEGEND.map(({ value, label }) => ({
      mood: label,
      count: moodDistribution?.[value] ?? 0,
    }));
    exportDataToCSV(rows, ['mood', 'count'], 'mood-distribution.csv');
  }, [moodDistribution]);

  const handleExportTagCSV = useCallback(() => {
    exportDataToCSV(tagStats.all, ['tag', 'count', 'avgMood'], 'tag-correlations.csv');
  }, [tagStats]);

  const bestDayCount = useMemo(() => {
    const counts = Object.values(moodDistribution ?? {});
    return counts.length ? Math.max(...counts) : 0;
  }, [moodDistribution]);

  const overviewCards = useMemo(
    () =>
      buildOverviewCards({
        totalEntries: metrics.total_entries ?? 0,
        averageMood: metrics.average_mood,
        currentStreak,
        bestDayCount,
      }),
    [metrics.total_entries, metrics.average_mood, currentStreak, bestDayCount],
  );

  if (loading) {
    return (
      <div className="statistics-view">
        <div className="statistics-view__overview-grid">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={120} radius={12} />
          ))}
        </div>
        <Skeleton height={36} width={260} style={{ marginBottom: 12 }} />
        <Skeleton height={320} radius={16} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="statistics-view statistics-view__status statistics-view__status--error">{error}</div>
    );
  }

  if (!hasStatistics) {
    return <div className="statistics-view statistics-view__status">No statistics available</div>;
  }

  return (
    <div className="statistics-view">
      <div className="statistics-view__overview-grid">
        {overviewCards.map(({ key, value, label, tone }) => (
          <div key={key} className="statistics-view__card statistics-view__overview-card">
            <div
              className={`statistics-view__overview-value${tone === 'danger' ? ' statistics-view__overview-value--danger' : ''}`}
            >
              {value}
            </div>
            <div className="statistics-view__overview-label">{label}</div>
          </div>
        ))}
      </div>

      <div ref={trendRef} className="statistics-view__card statistics-view__section" id="mood-trend">
        <div className="statistics-view__section-header">
          <h3 className="statistics-view__section-title">Mood Trend</h3>
          <div className="statistics-view__button-row">
            <div className="statistics-view__range-buttons">
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRange(option)}
                  className={`statistics-view__range-button${range === option ? ' is-active' : ''}`}
                >
                  {option}d
                </button>
              ))}
            </div>
            <button type="button" className="statistics-view__ghost-button" onClick={handleExportTrendPNG}>
              Export PNG
            </button>
            <button type="button" className="statistics-view__ghost-button" onClick={handleExportTrendCSV}>
              Export CSV
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={trendChartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <YAxis
              domain={[0.5, 5.5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
              axisLine={{ stroke: 'var(--border)' }}
              width={20}
              tickFormatter={(value) => MOOD_SHORTHANDS[value] || ''}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={formatTrendTooltip} />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="var(--accent-600)"
              strokeWidth={3}
              dot={{ fill: 'var(--accent-600)', strokeWidth: 2, r: 6 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="ma"
              stroke="var(--danger)"
              strokeDasharray="6 6"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>

        <MoodLegend />
      </div>

      <div ref={distributionRef} className="statistics-view__card statistics-view__section" id="mood-distribution">
        <div className="statistics-view__section-header">
          <h3 className="statistics-view__section-title">Mood Distribution</h3>
          <div className="statistics-view__button-row">
            <button type="button" className="statistics-view__ghost-button" onClick={handleExportDistributionPNG}>
              Export PNG
            </button>
            <button type="button" className="statistics-view__ghost-button" onClick={handleExportDistributionCSV}>
              Export CSV
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={moodDistributionData} margin={{ top: 30, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="mood" tick={{ fontSize: 16, fill: 'var(--text-muted)' }} axisLine={{ stroke: 'var(--border)' }} />
            <YAxis
              tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
              axisLine={{ stroke: 'var(--border)' }}
              allowDecimals={false}
              domain={[0, 'dataMax + 1']}
              width={20}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value, _name, props) => [`${value} entries`, props.payload.label]}
            />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              label={{ position: 'top', fontSize: 12, fontWeight: 600, fill: 'var(--text)' }}
            >
              {moodDistributionData.map((entry) => (
                <Cell key={entry.key} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <MoodLegend />
      </div>

      {(tagStats.topPositive.length > 0 || tagStats.topNegative.length > 0) && (
        <div className="statistics-view__card statistics-view__section">
          <div className="statistics-view__section-header">
            <h3 className="statistics-view__section-title">Tag Correlations</h3>
            <button type="button" className="statistics-view__ghost-button" onClick={handleExportTagCSV}>
              Export CSV
            </button>
          </div>

          <div className="statistics-view__tag-grid">
            <div className="statistics-view__tag-list">
              <h4 className="statistics-view__tag-heading statistics-view__tag-heading--positive">Top Positive</h4>
              {tagStats.topPositive.length === 0 && (
                <div className="statistics-view__tag-empty">No tags yet</div>
              )}
              {tagStats.topPositive.map((tag) => (
                <div key={tag.tag} className="statistics-view__tag-item">
                  <span>{tag.tag}</span>
                  <span style={{ color: 'var(--mood-4)' }}>
                    {tag.avgMood.toFixed(2)} ({tag.count})
                  </span>
                </div>
              ))}
            </div>

            <div className="statistics-view__tag-list">
              <h4 className="statistics-view__tag-heading statistics-view__tag-heading--negative">Top Negative</h4>
              {tagStats.topNegative.length === 0 && (
                <div className="statistics-view__tag-empty">No tags yet</div>
              )}
              {tagStats.topNegative.map((tag) => (
                <div key={tag.tag} className="statistics-view__tag-item">
                  <span>{tag.tag}</span>
                  <span style={{ color: 'var(--mood-1)' }}>
                    {tag.avgMood.toFixed(2)} ({tag.count})
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="statistics-view__tag-note">
            Note: simple average mood per tag; requires at least 2 occurrences to rank.
          </div>
        </div>
      )}

      <div className="statistics-view__card statistics-view__calendar-card">
        <h3 className="statistics-view__calendar-title">Mood Calendar</h3>
        <div className="statistics-view__calendar-grid">
          {WEEK_DAYS.map((day) => (
            <div key={day} className="statistics-view__calendar-label">
              {day}
            </div>
          ))}

          {calendarDays.map(({ key, label, entry, IconComponent, iconColor, isCurrentMonth, isToday }) => (
            <div
              key={key}
              className={`statistics-view__calendar-day${
                entry ? ' has-entry' : ''
              }${isCurrentMonth ? '' : ' is-outside'}${isToday ? ' is-today' : ''}`}
              style={{
                background: entry && iconColor ? `color-mix(in oklab, ${iconColor} 18%, transparent)` : undefined,
                color: entry && iconColor ? iconColor : undefined,
              }}
            >
              {entry && IconComponent ? <IconComponent size={16} /> : label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatisticsView;