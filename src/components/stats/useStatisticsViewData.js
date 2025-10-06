import { useMemo } from 'react';
import { getWeeklyMoodData, movingAverage } from '../../utils/moodUtils';
import {
  DEFAULT_METRICS,
  EMPTY_OBJECT,
  buildCalendarDays,
  buildMoodDistributionData,
  aggregateTagStats,
  buildOverviewCards,
} from './statisticsViewUtils';

const useStatisticsViewData = (statistics, pastEntries, range) => {
  const hasStatistics = Boolean(statistics);
  const metrics = statistics?.statistics ?? DEFAULT_METRICS;
  const currentStreak = statistics?.current_streak ?? 0;

  const moodDistribution = useMemo(
    () => statistics?.mood_distribution ?? EMPTY_OBJECT,
    [statistics?.mood_distribution],
  );

  const weeklyMoodData = useMemo(() => getWeeklyMoodData(pastEntries, range), [pastEntries, range]);

  const movingAverageSeries = useMemo(
    () => movingAverage(weeklyMoodData.map((d) => d.mood), 7),
    [weeklyMoodData],
  );

  const trendChartData = useMemo(
    () => weeklyMoodData.map((point, index) => ({ ...point, ma: movingAverageSeries[index] })),
    [weeklyMoodData, movingAverageSeries],
  );

  const moodDistributionData = useMemo(
    () => buildMoodDistributionData(moodDistribution),
    [moodDistribution],
  );

  const tagStats = useMemo(() => aggregateTagStats(pastEntries), [pastEntries]);

  const calendarDays = useMemo(() => buildCalendarDays(pastEntries), [pastEntries]);

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

  return {
    hasStatistics,
    weeklyMoodData,
    trendChartData,
    moodDistribution,
    moodDistributionData,
    tagStats,
    calendarDays,
    overviewCards,
  };
};

export default useStatisticsViewData;
