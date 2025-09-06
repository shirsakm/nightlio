import { useState, useEffect, useRef } from 'react';
import { Target, Plus } from 'lucide-react';
import GoalsList from '../components/goals/GoalsList';
import GoalForm from '../components/goals/GoalForm';
import Skeleton from '../components/ui/Skeleton';
import apiService from '../services/api';

const GoalsView = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  const suggestions = [
    { t: 'Morning Meditation', d: '10 minutes of mindfulness' },
    { t: 'Evening Walk', d: '30-minute walk outside' },
    { t: 'Read Before Bed', d: 'Read 20 minutes before sleep' },
    { t: 'Drink Water', d: '8 glasses of water daily' },
    { t: 'Stretching Routine', d: '15 minutes of light stretching' },
    { t: 'Learn a Language', d: 'Practice 20 minutes on Duolingo' },
    { t: 'Journal', d: 'Write 5-minute reflection' },
  ];

  const handlePrefill = (title, description) => {
    if (formRef.current && typeof formRef.current.prefill === 'function') {
      formRef.current.prefill(title, description);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiService.getGoals();
        if (!mounted) return;
        const mapped = (data || []).map(g => ({
          id: g.id,
          title: g.title,
          description: g.description,
          frequency: `${g.frequency_per_week} days a week`,
          completed: g.completed ?? 0,
          total: g.frequency_per_week ?? 0,
          streak: g.streak ?? 0,
          created_at: g.created_at
        }));
        setGoals(mapped);
  } catch {
        // fallback: keep goals empty; UI can still add
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleAddGoal = (newGoal) => {
    (async () => {
      try {
        const freqNum = newGoal.frequencyNumber ? parseInt(newGoal.frequencyNumber) : parseInt((newGoal.frequency || '0').split(' ')[0]);
        const resp = await apiService.createGoal({
          title: newGoal.title,
          description: newGoal.description,
          frequency: Number.isFinite(freqNum) && freqNum > 0 ? freqNum : 3,
        });
        const id = resp?.id ?? Date.now();
        const goal = {
          id,
          title: newGoal.title,
          description: newGoal.description,
          frequency: `${Number.isFinite(freqNum) && freqNum > 0 ? freqNum : 3} days a week`,
          completed: 0,
          total: Number.isFinite(freqNum) && freqNum > 0 ? freqNum : 3,
          streak: 0,
          created_at: new Date().toISOString()
        };
        setGoals(prev => [goal, ...prev]);
  } catch {
        // optimistic add on failure
        const freqNum = newGoal.frequencyNumber ? parseInt(newGoal.frequencyNumber) : parseInt((newGoal.frequency || '0').split(' ')[0]);
        const goal = {
          id: Date.now(),
          title: newGoal.title,
          description: newGoal.description,
          frequency: `${Number.isFinite(freqNum) && freqNum > 0 ? freqNum : 3} days a week`,
          completed: 0,
          total: Number.isFinite(freqNum) && freqNum > 0 ? freqNum : 3,
          streak: 0,
          created_at: new Date().toISOString()
        };
        setGoals(prev => [goal, ...prev]);
      } finally {
        setShowForm(false);
      }
    })();
  };

  const handleDeleteGoal = (goalId) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
    apiService.deleteGoal(goalId).catch(() => {});
  };

  const handleUpdateProgress = (goalId) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, completed: Math.min(goal.completed + 1, goal.total) }
        : goal
    ));
    apiService.incrementGoalProgress(goalId).then(updated => {
      if (!updated) return;
      setGoals(prev => prev.map(g => g.id === goalId ? {
        ...g,
        completed: updated.completed ?? g.completed,
        total: updated.frequency_per_week ?? g.total,
        streak: updated.streak ?? g.streak,
        // show same label format
        frequency: `${updated.frequency_per_week ?? g.total} days a week`
      } : g));
    }).catch(() => {});
  };

  if (showForm) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 12, 
            background: 'var(--accent-bg)', 
            display: 'grid', 
            placeItems: 'center', 
            color: '#fff' 
          }}>
            <Target size={20} />
          </div>
          <div>
            <h1 style={{ margin: 0, color: 'var(--text)', fontSize: '1.75rem', fontWeight: '700' }}>Add New Goal</h1>
            <p style={{ margin: 0, color: 'var(--text)', opacity: 0.8, fontSize: '0.95rem' }}>
              Set a new goal to track your progress
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 480px', minWidth: 280 }}>
            <GoalForm 
              ref={formRef}
              showInlineSuggestions={false}
              onSubmit={handleAddGoal}
              onCancel={() => setShowForm(false)}
            />
          </div>
          <aside style={{ flex: '0 0 320px', minWidth: 260 }}>
            <div style={{
              position: 'sticky', top: 12,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              borderRadius: 16,
              padding: 16
            }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 8 }}>Quick suggestions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {suggestions.map(s => (
                  <button
                    key={s.t}
                    type="button"
                    onClick={() => handlePrefill(s.t, s.d)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      background: 'var(--surface-2, var(--surface))',
                      color: 'var(--text)',
                      cursor: 'pointer',
                      transition: 'background 0.2s, border-color 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 4 }}>{s.t}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.d}</div>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 12, 
            background: 'var(--accent-bg)', 
            display: 'grid', 
            placeItems: 'center', 
            color: '#fff' 
          }}>
            <Target size={20} />
          </div>
          <div>
            <h1 style={{ margin: 0, color: 'var(--text)', fontSize: '1.75rem', fontWeight: '700' }}>Goals</h1>
            <p style={{ margin: 0, color: 'var(--text)', opacity: 0.8, fontSize: '0.95rem' }}>
              Track your personal goals and build better habits
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowForm(true)}
          className="primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} />
          Add Goal
        </button>
      </div>

      {loading ? (
        <div>
          <div className="card-grid">
            {[1,2,3,4].map((i) => (
              <div key={i}>
                <Skeleton height={180} radius={16} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <GoalsList 
          goals={goals} 
          onDelete={handleDeleteGoal}
          onUpdateProgress={handleUpdateProgress}
        />
      )}
    </div>
  );
};

export default GoalsView;
