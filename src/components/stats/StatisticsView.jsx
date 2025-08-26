import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import Skeleton from '../ui/Skeleton';
import { Frown, Meh, Smile, Heart } from 'lucide-react';
import { getWeeklyMoodData, getMoodIcon, movingAverage } from '../../utils/moodUtils';
import { exportSVGToPNG, exportDataToCSV } from '../../utils/exportUtils';
import { useState, useMemo } from 'react';

const StatisticsView = ({ statistics, pastEntries, loading, error }) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'left', padding: '1rem 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {[1,2,3,4].map((i) => (
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
      <div style={{ textAlign: 'center', color: '#ff6b6b', padding: '2rem' }}>
        {error}
      </div>
    );
  }

  if (!statistics) {
    return (
      <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
        No statistics available
      </div>
    );
  }

  const [range, setRange] = useState(7); // 7,30,90
  const data = useMemo(() => getWeeklyMoodData(pastEntries, range), [pastEntries, range]);
  const ma = useMemo(() => movingAverage(data.map(d => d.mood), 7), [data]);

  // Compute simple tag correlations from entry selections
  const tagStats = useMemo(() => {
    const map = new Map();
    for (const e of pastEntries || []) {
      const mood = Number(e.mood);
      if (!e.selections || e.selections.length === 0) continue;
      for (const s of e.selections) {
        const key = s.name || s.label || String(s.id);
        const curr = map.get(key) || { tag: key, count: 0, sum: 0 };
        curr.count += 1;
        curr.sum += mood;
        map.set(key, curr);
      }
    }
    const rows = Array.from(map.values()).map(r => ({
      tag: r.tag,
      count: r.count,
      avgMood: r.count ? r.sum / r.count : 0,
    }));
    const withMin = rows.filter(r => r.count >= 2); // minimum 2 occurrences to rank
    const sorted = [...withMin].sort((a, b) => b.avgMood - a.avgMood);
    return {
      topPositive: sorted.slice(0, 5),
      topNegative: sorted.slice(-5).reverse(),
      all: rows,
    };
  }, [pastEntries]);

  const exportTrendPNG = () => {
    const svg = document.querySelector('#mood-trend svg');
    exportSVGToPNG(svg, `mood-trend-${range}d.png`);
  };
  const exportTrendCSV = () => {
    exportDataToCSV(data, ['date', 'mood'], `mood-trend-${range}d.csv`);
  };
  const exportDistributionPNG = () => {
    const svg = document.querySelector('#mood-distribution svg');
    exportSVGToPNG(svg, 'mood-distribution.png');
  };
  const exportDistributionCSV = () => {
    const rows = [1,2,3,4,5].map(v => ({ mood: v, count: statistics.mood_distribution[v] || 0 }));
    exportDataToCSV(rows, ['mood', 'count'], 'mood-distribution.csv');
  };

  const container = {
    background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)'
  };
  const lightBtn = {
    padding: '6px 12px',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    color: '#111827',
    fontWeight: 600,
    fontSize: 12,
  };
  const lightBtnHover = {
    background: '#f8fafc',
    border: '1px solid #d1d5db',
  };

  return (
    <div style={{ textAlign: 'left', marginTop: '24px' }}>
      {/* Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            ...container,
            padding: '20px',
            marginBottom: 0,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>
            {statistics.statistics.total_entries}
          </div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Total Entries</div>
        </div>

        <div
          style={{
            ...container,
            padding: '20px',
            marginBottom: 0,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#4ecdc4' }}>
            {statistics.statistics.average_mood?.toFixed(1) || '0.0'}
          </div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Average Mood</div>
        </div>

        <div
          style={{
            ...container,
            padding: '20px',
            marginBottom: 0,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ff6b6b' }}>
            {statistics.current_streak}
          </div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Current Streak</div>
        </div>

        <div
          style={{
            ...container,
            padding: '20px',
            marginBottom: 0,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#9b59b6' }}>
            {(() => {
              const counts = Object.values(statistics.mood_distribution);
              return counts.length > 0 ? Math.max(...counts) : 0;
            })()}
          </div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>Best Day</div>
        </div>
      </div>

      {/* Weekly Mood Trend */}
      <div id="mood-trend" style={container}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: 12 }}>
          <h3
          style={{
            margin: 0,
            color: '#333',
            fontSize: '1.3rem',
            fontWeight: '600',
          }}
          >
            Mood Trend
          </h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {[7,30,90].map((d) => (
              <button
                key={d}
                onClick={() => setRange(d)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: range === d ? 'none' : '1px solid #e5e7eb',
                  background: range === d ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#ffffff',
                  color: range === d ? '#ffffff' : '#111827',
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                {d}d
              </button>
            ))}
            <div style={{ width: 12 }} />
            <button
              onClick={exportTrendPNG}
              style={lightBtn}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, lightBtnHover)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, lightBtn)}
            >
              Export PNG
            </button>
            <button
              onClick={exportTrendCSV}
              style={lightBtn}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, lightBtnHover)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, lightBtn)}
            >
              Export CSV
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <YAxis
              domain={[0.5, 5.5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e0e0e0' }}
              width={20}
              tickFormatter={(value) => {
                const moodLabels = { 1: 'T', 2: 'B', 3: 'O', 4: 'G', 5: 'A' };
                return moodLabels[value] || '';
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value) => {
                if (value === null) return ['No entry', ''];
                const moodLabels = { 1: 'Terrible', 2: 'Bad', 3: 'Okay', 4: 'Good', 5: 'Amazing' };
                return [`${moodLabels[value]}`, ''];
              }}
            />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="#667eea"
              strokeWidth={3}
              dot={{ fill: '#667eea', strokeWidth: 2, r: 6 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              data={data.map((d, i) => ({ ...d, ma: ma[i] }))}
              dataKey="ma"
              stroke="#ff6b6b"
              strokeDasharray="6 6"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Icon Legend for Line Chart */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            marginTop: '1rem',
            flexWrap: 'wrap',
          }}
        >
          {[
            { value: 1, icon: Frown, color: '#ff6b6b', label: 'Terrible' },
            { value: 2, icon: Frown, color: '#ffa726', label: 'Bad' },
            { value: 3, icon: Meh, color: '#ffca28', label: 'Okay' },
            { value: 4, icon: Smile, color: '#66bb6a', label: 'Good' },
            { value: 5, icon: Heart, color: '#42a5f5', label: 'Amazing' },
          ].map(mood => {
            const IconComponent = mood.icon;
            return (
              <div
                key={mood.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.8rem',
                  color: '#666',
                }}
              >
                <IconComponent size={16} style={{ color: mood.color }} />
                <span>{mood.label}</span>
              </div>
            );
          })}
        </div>
      </div>

  {/* Mood Distribution Chart */}
      <div id="mood-distribution" style={container}>
        <h3
          style={{
            margin: '0 0 8px 0',
            color: '#333',
            fontSize: '1.3rem',
            fontWeight: '600',
          }}
        >
          Mood Distribution
        </h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <button
            onClick={exportDistributionPNG}
            style={lightBtn}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, lightBtnHover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, lightBtn)}
          >
            Export PNG
          </button>
          <button
            onClick={exportDistributionCSV}
            style={lightBtn}
            onMouseEnter={(e) => Object.assign(e.currentTarget.style, lightBtnHover)}
            onMouseLeave={(e) => Object.assign(e.currentTarget.style, lightBtn)}
          >
            Export CSV
          </button>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={(() => {
              const moodLabels = ['Terrible', 'Bad', 'Okay', 'Good', 'Amazing'];
              const moodColors = ['#ff6b6b', '#ffa726', '#ffca28', '#66bb6a', '#42a5f5'];
              const moodIcons = ['T', 'B', 'O', 'G', 'A'];

              return [1, 2, 3, 4, 5].map(moodValue => ({
                mood: moodIcons[moodValue - 1],
                label: moodLabels[moodValue - 1],
                count: statistics.mood_distribution[moodValue] || 0,
                fill: moodColors[moodValue - 1],
              }));
            })()}
            margin={{ top: 30, right: 20, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="mood"
              tick={{ fontSize: 16 }}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e0e0e0' }}
              allowDecimals={false}
              domain={[0, 'dataMax + 1']}
              width={20}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value, _, props) => [
                `${value} entries`,
                props.payload.label,
              ]}
            />
            <Bar 
              dataKey="count" 
              radius={[4, 4, 0, 0]}
              label={{ 
                position: 'top', 
                fontSize: 12, 
                fontWeight: '600',
                fill: '#333'
              }}
            >
              {[1, 2, 3, 4, 5].map((entry, index) => {
                const moodColors = ['#ff6b6b', '#ffa726', '#ffca28', '#66bb6a', '#42a5f5'];
                return <Cell key={`cell-${index}`} fill={moodColors[index]} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Icon Legend for Bar Chart */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            marginTop: '1rem',
            flexWrap: 'wrap',
          }}
        >
          {[
            { value: 1, icon: Frown, color: '#ff6b6b', label: 'Terrible' },
            { value: 2, icon: Frown, color: '#ffa726', label: 'Bad' },
            { value: 3, icon: Meh, color: '#ffca28', label: 'Okay' },
            { value: 4, icon: Smile, color: '#66bb6a', label: 'Good' },
            { value: 5, icon: Heart, color: '#42a5f5', label: 'Amazing' },
          ].map(mood => {
            const IconComponent = mood.icon;
            return (
              <div
                key={mood.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.8rem',
                  color: '#666',
                }}
              >
                <IconComponent size={16} style={{ color: mood.color }} />
                <span>{mood.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tag Correlations */}
  {(tagStats.topPositive.length > 0 || tagStats.topNegative.length > 0) && (
    <div style={container}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, color: '#333', fontSize: '1.3rem', fontWeight: 600 }}>Tag Correlations</h3>
            <div>
              <button
        onClick={() => exportDataToCSV(tagStats.all, ['tag', 'count', 'avgMood'], 'tag-correlations.csv')}
        style={lightBtn}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, lightBtnHover)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.style, lightBtn)}
              >
                Export CSV
              </button>
            </div>
          </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '12px' }}>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d6a4f' }}>Top Positive</h4>
              {tagStats.topPositive.length === 0 && <div style={{ color: '#666' }}>No tags yet</div>}
              {tagStats.topPositive.map(t => (
        <div key={t.tag} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '6px 0', borderBottom: '1px dashed #eee' }}>
                  <span style={{ fontWeight: 600 }}>{t.tag}</span>
                  <span style={{ color: '#2d6a4f' }}>{t.avgMood.toFixed(2)} ({t.count})</span>
                </div>
              ))}
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#9b2226' }}>Top Negative</h4>
              {tagStats.topNegative.length === 0 && <div style={{ color: '#666' }}>No tags yet</div>}
              {tagStats.topNegative.map(t => (
        <div key={t.tag} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '6px 0', borderBottom: '1px dashed #eee' }}>
                  <span style={{ fontWeight: 600 }}>{t.tag}</span>
                  <span style={{ color: '#9b2226' }}>{t.avgMood.toFixed(2)} ({t.count})</span>
                </div>
              ))}
            </div>
          </div>
      <div style={{ marginTop: '8px', fontSize: 12, color: '#666' }}>
            Note: simple average mood per tag; requires at least 2 occurrences to rank.
          </div>
        </div>
      )}

      {/* Mood Calendar */}
      <div
        style={{
          background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        }}
      >
        <h3
          style={{
            margin: '0 0 1.5rem 0',
            color: '#333',
            fontSize: '1.3rem',
            fontWeight: '600',
          }}
        >
          Mood Calendar
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.5rem',
            fontSize: '0.8rem',
          }}
        >
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              style={{
                textAlign: 'center',
                fontWeight: '600',
                color: '#666',
                padding: '0.5rem',
              }}
            >
              {day}
            </div>
          ))}
          {(() => {
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            const startDate = new Date(firstDay);
            startDate.setDate(startDate.getDate() - firstDay.getDay());

            const days = [];
            const current = new Date(startDate);

            // Create entry lookup by date
            const entryLookup = {};
            pastEntries.forEach(entry => {
              entryLookup[entry.date] = entry;
            });

            while (current <= lastDay || current.getDay() !== 0) {
              const dateStr = current.toLocaleDateString();
              const entry = entryLookup[dateStr];
              const isCurrentMonth = current.getMonth() === today.getMonth();

              days.push(
                <div
                  key={current.toISOString()}
                  style={{
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    background: entry ? getMoodIcon(entry.mood).color + '20' : 'transparent',
                    border: current.toDateString() === today.toDateString() ? '2px solid #667eea' : 'none',
                    opacity: isCurrentMonth ? 1 : 0.3,
                    fontSize: entry ? '1.2rem' : '0.9rem',
                    fontWeight: entry ? '600' : '400',
                    color: entry ? getMoodIcon(entry.mood).color : '#666',
                  }}
                >
                  {entry ? (
                    (() => {
                      const { icon: IconComponent } = getMoodIcon(entry.mood);
                      return <IconComponent size={16} />;
                    })()
                  ) : (
                    current.getDate()
                  )}
                </div>
              );
              current.setDate(current.getDate() + 1);
            }

            return days;
          })()}
        </div>
      </div>
    </div>
  );
};

export default StatisticsView;