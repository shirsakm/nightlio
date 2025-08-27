import { Frown, Meh, Smile, Heart } from 'lucide-react';

// Resolve a CSS variable to its computed value (fallback to provided value)
const cssVar = (name, fallback) => {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  } catch {
    return fallback;
  }
};

export const MOODS = [
  { icon: Frown, value: 1, color: 'var(--mood-1)', label: 'Terrible' },
  { icon: Frown, value: 2, color: 'var(--mood-2)', label: 'Bad' },
  { icon: Meh,   value: 3, color: 'var(--mood-3)', label: 'Okay' },
  { icon: Smile, value: 4, color: 'var(--mood-4)', label: 'Good' },
  { icon: Heart, value: 5, color: 'var(--mood-5)', label: 'Amazing' },
];

export const getMoodIcon = (moodValue) => {
  const mood = MOODS.find(m => m.value === moodValue);
  if (!mood) return { icon: Meh, color: cssVar('--mood-3', '#f1fa8c') };
  // Resolve CSS var to concrete color for places that need an actual color value
  const resolved = mood.color.startsWith('var(')
    ? cssVar(mood.color.slice(4, -1), '#999')
    : mood.color;
  return { icon: mood.icon, color: resolved };
};

export const getMoodLabel = (moodValue) => {
  const mood = MOODS.find(m => m.value === moodValue);
  return mood ? mood.label : 'Unknown';
};

export const formatEntryTime = (entry) => {
  if (entry.created_at) {
    const date = new Date(entry.created_at);
    const time = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${entry.date} at ${time}`;
  }
  return entry.date;
};

export const getWeeklyMoodData = (pastEntries, days = 7) => {
  const today = new Date();
  const weekData = [];

  // Create entry lookup by date
  const entryLookup = {};
  pastEntries.forEach(entry => {
    entryLookup[entry.date] = entry;
  });

  // Get last N days
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString();
    const entry = entryLookup[dateStr];

    weekData.push({
      date: days <= 7
        ? date.toLocaleDateString('en-US', { weekday: 'short' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: entry ? entry.mood : null,
      moodEmoji: entry ? getMoodIcon(entry.mood).icon : null,
      hasEntry: !!entry,
    });
  }

  return weekData;
};

export const movingAverage = (arr, windowSize = 7) => {
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const slice = arr.slice(start, i + 1).filter((v) => v != null);
    res.push(slice.length ? slice.reduce((a, b) => a + b, 0) / slice.length : null);
  }
  return res;
};