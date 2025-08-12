import { Frown, Meh, Smile, Heart } from 'lucide-react';

export const MOODS = [
  { icon: Frown, value: 1, color: '#ff6b6b', label: 'Terrible' },
  { icon: Frown, value: 2, color: '#ffa726', label: 'Bad' },
  { icon: Meh, value: 3, color: '#ffca28', label: 'Okay' },
  { icon: Smile, value: 4, color: '#66bb6a', label: 'Good' },
  { icon: Heart, value: 5, color: '#42a5f5', label: 'Amazing' },
];

export const getMoodIcon = (moodValue) => {
  const mood = MOODS.find(m => m.value === moodValue);
  if (!mood) return { icon: Meh, color: '#ffca28' };
  return { icon: mood.icon, color: mood.color };
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

export const getWeeklyMoodData = (pastEntries) => {
  const today = new Date();
  const weekData = [];

  // Create entry lookup by date
  const entryLookup = {};
  pastEntries.forEach(entry => {
    entryLookup[entry.date] = entry;
  });

  // Get last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString();
    const entry = entryLookup[dateStr];

    weekData.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      mood: entry ? entry.mood : null,
      moodEmoji: entry ? getMoodIcon(entry.mood).icon : null,
      hasEntry: !!entry,
    });
  }

  return weekData;
};