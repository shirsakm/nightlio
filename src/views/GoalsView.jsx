import { useState, useEffect } from 'react';
import { Target, Plus } from 'lucide-react';
import GoalsList from '../components/goals/GoalsList';
import GoalForm from '../components/goals/GoalForm';
import Skeleton from '../components/ui/Skeleton';
import apiService from '../services/api';

const GoalsView = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

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
        const resp = await apiService.createGoal({
          title: newGoal.title,
          description: newGoal.description,
          frequency: parseInt(newGoal.frequency.split(' ')[0])
        });
        const id = resp?.id ?? Date.now();
        const goal = {
          id,
          ...newGoal,
          completed: 0,
          total: parseInt(newGoal.frequency.split(' ')[0]),
          streak: 0,
          created_at: new Date().toISOString()
        };
        setGoals(prev => [goal, ...prev]);
  } catch {
        // optimistic add on failure
        const goal = {
          id: Date.now(),
          ...newGoal,
          completed: 0,
          total: parseInt(newGoal.frequency.split(' ')[0]),
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
            color: 'var(--accent-600)' 
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
        
        <GoalForm 
          onSubmit={handleAddGoal}
          onCancel={() => setShowForm(false)}
        />
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
            color: 'var(--accent-600)' 
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
