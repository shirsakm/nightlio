import { useState, useEffect } from 'react';
import { Target, Plus } from 'lucide-react';
import GoalsList from '../components/goals/GoalsList';
import GoalForm from '../components/goals/GoalForm';
import Skeleton from '../components/ui/Skeleton';

const GoalsView = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Dummy data for now
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setGoals([
        {
          id: 1,
          title: 'Morning Meditation',
          description: 'Start each day with 10 minutes of mindfulness meditation to center myself and set positive intentions.',
          frequency: '7 days a week',
          completed: 5,
          total: 7,
          streak: 3,
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          title: 'Evening Walk',
          description: 'Take a 30-minute walk to clear my mind and get some fresh air after work.',
          frequency: '5 days a week',
          completed: 3,
          total: 5,
          streak: 2,
          created_at: '2024-01-02T00:00:00Z'
        },
        {
          id: 3,
          title: 'Read Before Bed',
          description: 'Read for at least 20 minutes before going to sleep to wind down and learn something new.',
          frequency: '4 days a week',
          completed: 2,
          total: 4,
          streak: 1,
          created_at: '2024-01-03T00:00:00Z'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddGoal = (newGoal) => {
    const goal = {
      id: Date.now(),
      ...newGoal,
      completed: 0,
      total: parseInt(newGoal.frequency.split(' ')[0]),
      streak: 0,
      created_at: new Date().toISOString()
    };
    setGoals(prev => [goal, ...prev]);
    setShowForm(false);
  };

  const handleDeleteGoal = (goalId) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const handleUpdateProgress = (goalId) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, completed: Math.min(goal.completed + 1, goal.total) }
        : goal
    ));
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
