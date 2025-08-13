import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { Frown, Meh, Smile, Heart } from 'lucide-react';
import { getWeeklyMoodData, getMoodIcon } from '../../utils/moodUtils';

const StatisticsView = ({ statistics, pastEntries, loading, error }) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
        Loading statistics...
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

  const weeklyData = getWeeklyMoodData(pastEntries);

  return (
    <div style={{ textAlign: 'left' }}>
      {/* Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
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
            background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
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
            background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
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
            background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
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
      <div
        style={{
          background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
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
          Weekly Mood Trend
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={weeklyData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
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
      <div
        style={{
          background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
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
          Mood Distribution
        </h3>
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