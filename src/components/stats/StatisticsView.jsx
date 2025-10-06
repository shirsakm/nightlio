import { useCallback, useRef, useState } from 'react';
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
import { exportSVGToPNG, exportDataToCSV } from '../../utils/exportUtils';
import useStatisticsViewData from './useStatisticsViewData';
import {
  RANGE_OPTIONS,
  TOOLTIP_STYLE,
  MOOD_LEGEND,
  MOOD_SHORTHANDS,
  WEEK_DAYS,
  formatTrendTooltip,
} from './statisticsViewUtils';
import './StatisticsView.css';

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

const StatisticsOverviewGrid = ({ cards }) => (
  <div className="statistics-view__overview-grid">
    {cards.map(({ key, value, label, tone }) => {
      const valueClassName = tone === 'danger'
        ? 'statistics-view__overview-value statistics-view__overview-value--danger'
        : 'statistics-view__overview-value';

      return (
        <div key={key} className="statistics-view__card statistics-view__overview-card">
          <div className={valueClassName}>{value}</div>
          <div className="statistics-view__overview-label">{label}</div>
        </div>
      );
    })}
  </div>
);

const SectionHeader = ({ title, children }) => (
  <div className="statistics-view__section-header">
    <h3 className="statistics-view__section-title">{title}</h3>
    <div className="statistics-view__button-row">{children}</div>
  </div>
);

const RangeSelector = ({ range, onChange }) => (
  <div className="statistics-view__range-buttons">
    {RANGE_OPTIONS.map((option) => (
      <button
        key={option}
        type="button"
        onClick={() => onChange(option)}
        className={`statistics-view__range-button${range === option ? ' is-active' : ''}`}
      >
        {option}d
      </button>
    ))}
  </div>
);

const MoodTrendSection = ({ chartData, range, onChangeRange, onExportPNG, onExportCSV, containerRef }) => (
  <div ref={containerRef} className="statistics-view__card statistics-view__section" id="mood-trend">
    <SectionHeader title="Mood Trend">
      <RangeSelector range={range} onChange={onChangeRange} />
      <button type="button" className="statistics-view__ghost-button" onClick={onExportPNG}>
        Export PNG
      </button>
      <button type="button" className="statistics-view__ghost-button" onClick={onExportCSV}>
        Export CSV
      </button>
    </SectionHeader>

    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={{ stroke: 'var(--border)' }} />
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
);

const DistributionSection = ({ chartData, onExportPNG, onExportCSV, containerRef }) => (
  <div ref={containerRef} className="statistics-view__card statistics-view__section" id="mood-distribution">
    <SectionHeader title="Mood Distribution">
      <button type="button" className="statistics-view__ghost-button" onClick={onExportPNG}>
        Export PNG
      </button>
      <button type="button" className="statistics-view__ghost-button" onClick={onExportCSV}>
        Export CSV
      </button>
    </SectionHeader>

    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={chartData} margin={{ top: 30, right: 20, left: 0, bottom: 20 }}>
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
        <Bar dataKey="count" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 12, fontWeight: 600, fill: 'var(--text)' }}>
          {chartData.map((entry) => (
            <Cell key={entry.key} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>

    <MoodLegend />
  </div>
);

const TagList = ({ heading, toneClass, tags, emptyLabel, valueColor }) => (
  <div className="statistics-view__tag-list">
    <h4 className={`statistics-view__tag-heading ${toneClass}`}>{heading}</h4>
    {tags.length === 0 && <div className="statistics-view__tag-empty">{emptyLabel}</div>}
    {tags.map((tag) => (
      <div key={tag.tag} className="statistics-view__tag-item">
        <span>{tag.tag}</span>
        <span style={{ color: valueColor }}>
          {tag.avgMood.toFixed(2)} ({tag.count})
        </span>
      </div>
    ))}
  </div>
);

const TagCorrelationsSection = ({ tagStats, onExportCSV }) => {
  const hasTags = tagStats.topPositive.length > 0 || tagStats.topNegative.length > 0;
  if (!hasTags) return null;

  return (
    <div className="statistics-view__card statistics-view__section">
      <SectionHeader title="Tag Correlations">
        <button type="button" className="statistics-view__ghost-button" onClick={onExportCSV}>
          Export CSV
        </button>
      </SectionHeader>

      <div className="statistics-view__tag-grid">
        <TagList
          heading="Top Positive"
          toneClass="statistics-view__tag-heading--positive"
          tags={tagStats.topPositive}
          emptyLabel="No tags yet"
          valueColor="var(--mood-4)"
        />
        <TagList
          heading="Top Negative"
          toneClass="statistics-view__tag-heading--negative"
          tags={tagStats.topNegative}
          emptyLabel="No tags yet"
          valueColor="var(--mood-1)"
        />
      </div>

      <div className="statistics-view__tag-note">
        Note: simple average mood per tag; requires at least 2 occurrences to rank.
      </div>
    </div>
  );
};

const MoodCalendarSection = ({ days }) => (
  <div className="statistics-view__card statistics-view__calendar-card">
    <h3 className="statistics-view__calendar-title">Mood Calendar</h3>
    <div className="statistics-view__calendar-grid">
      {WEEK_DAYS.map((day) => (
        <div key={day} className="statistics-view__calendar-label">
          {day}
        </div>
      ))}

      {days.map(({ key, label, entry, IconComponent, iconColor, isCurrentMonth, isToday }) => (
        <div
          key={key}
          className={`statistics-view__calendar-day${entry ? ' has-entry' : ''}${isCurrentMonth ? '' : ' is-outside'}${isToday ? ' is-today' : ''}`}
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
);

const LoadingState = () => (
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

const ErrorState = ({ message }) => (
  <div className="statistics-view statistics-view__status statistics-view__status--error">{message}</div>
);

const EmptyState = () => (
  <div className="statistics-view statistics-view__status">No statistics available</div>
);

const StatisticsView = ({ statistics, pastEntries, loading, error }) => {
  const [range, setRange] = useState(RANGE_OPTIONS[0]);
  const trendRef = useRef(null);
  const distributionRef = useRef(null);

  const {
    hasStatistics,
    weeklyMoodData,
    trendChartData,
    moodDistributionData,
    tagStats,
    calendarDays,
    overviewCards,
  } = useStatisticsViewData(statistics, pastEntries, range);

  const handleExportTrendPNG = useCallback(() => {
    const svg = trendRef.current?.querySelector('svg');
    if (svg) {
      exportSVGToPNG(svg, `mood-trend-${range}d.png`);
    }
  }, [range]);

  const handleExportTrendCSV = useCallback(() => {
    exportDataToCSV(weeklyMoodData, ['date', 'mood'], `mood-trend-${range}d.csv`);
  }, [weeklyMoodData, range]);

  const handleExportDistributionPNG = useCallback(() => {
    const svg = distributionRef.current?.querySelector('svg');
    if (svg) {
      exportSVGToPNG(svg, 'mood-distribution.png');
    }
  }, []);

  const handleExportDistributionCSV = useCallback(() => {
    const rows = moodDistributionData.map(({ label, count }) => ({ mood: label, count }));
    exportDataToCSV(rows, ['mood', 'count'], 'mood-distribution.csv');
  }, [moodDistributionData]);

  const handleExportTagCSV = useCallback(() => {
    exportDataToCSV(tagStats.all, ['tag', 'count', 'avgMood'], 'tag-correlations.csv');
  }, [tagStats]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!hasStatistics) return <EmptyState />;

  return (
    <div className="statistics-view">
      <StatisticsOverviewGrid cards={overviewCards} />
      <MoodTrendSection
        chartData={trendChartData}
        range={range}
        onChangeRange={setRange}
        onExportPNG={handleExportTrendPNG}
        onExportCSV={handleExportTrendCSV}
        containerRef={trendRef}
      />
      <DistributionSection
        chartData={moodDistributionData}
        onExportPNG={handleExportDistributionPNG}
        onExportCSV={handleExportDistributionCSV}
        containerRef={distributionRef}
      />
      <TagCorrelationsSection tagStats={tagStats} onExportCSV={handleExportTagCSV} />
      <MoodCalendarSection days={calendarDays} />
    </div>
  );
};

export default StatisticsView;