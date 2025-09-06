import { useEffect, useMemo, useState } from 'react';
import apiService from '../../services/api';

// Simple monthly calendar that highlights completion days
const MonthCalendar = ({ year, month, dates = new Set() }) => {
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay(); // 0-6 Sun..Sat
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8, fontSize: 12, color: 'var(--text-muted)' }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} style={{ textAlign: 'center' }}>{d}</div>
        ))}
      </div>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {cells.map((d, i) => {
          const iso = d ? `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` : null;
          const isHit = iso && dates.has(iso);
          return (
            <div key={i} style={{
              height: 28,
              borderRadius: 6,
      border: '1px solid var(--border)',
      background: isHit ? 'var(--accent-bg)' : 'var(--accent-bg-soft)',
              color: isHit ? '#fff' : 'var(--text)',
              display: 'grid', placeItems: 'center',
              fontSize: 12
            }}>
              {d || ''}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const GoalStatsCalendar = ({ goalId }) => {
  const [yearMonth, setYearMonth] = useState(() => {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() };
  });
  const [dates, setDates] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const monthLabel = useMemo(() => new Date(yearMonth.y, yearMonth.m, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' }), [yearMonth]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const start = `${yearMonth.y}-${String(yearMonth.m+1).padStart(2,'0')}-01`;
        const end = `${yearMonth.y}-${String(yearMonth.m+1).padStart(2,'0')}-${String(new Date(yearMonth.y, yearMonth.m+1, 0).getDate()).padStart(2,'0')}`;
        const rows = await apiService.getGoalCompletions(goalId, { start, end });
        if (!mounted) return;
        setDates(new Set((rows || []).map(r => r.date)));
      } catch {
        if (mounted) setDates(new Set());
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [goalId, yearMonth]);

  const prevMonth = () => setYearMonth(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }));
  const nextMonth = () => setYearMonth(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={prevMonth} className="primary" style={{ padding: '6px 10px' }}>{'<'}</button>
        <div style={{ fontWeight: 600 }}>{monthLabel}{loading ? '…' : ''}</div>
        <button onClick={nextMonth} className="primary" style={{ padding: '6px 10px' }}>{'>'}</button>
      </div>
      <MonthCalendar year={yearMonth.y} month={yearMonth.m} dates={dates} />
    </div>
  );
};

export default GoalStatsCalendar;
