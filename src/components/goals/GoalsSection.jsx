import { useState, useEffect } from 'react';
import { Target, Plus, ArrowRight, Calendar, CheckCircle } from 'lucide-react';
import Skeleton from '../ui/Skeleton';

const GoalsSection = ({ onNavigateToGoals }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dummy data for home page preview (first 3 goals)
  useEffect(() => {
    setTimeout(() => {
      setGoals([
        {
          id: 1,
          title: 'Morning Meditation',
          frequency: '7 days a week',
          completed: 5,
          total: 7,
          streak: 3
        },
        {
          id: 2,
          title: 'Evening Walk',
          frequency: '5 days a week',
          completed: 3,
          total: 5,
          streak: 2
        },
        {
          id: 3,
          title: 'Read Before Bed',
          frequency: '4 days a week',
          completed: 2,
          total: 4,
          streak: 1
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'left', padding: '1rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Skeleton height={28} width={120} />
          <Skeleton height={32} width={100} />
        </div>
        <div className="card-grid">
          {[1,2,3].map((i) => (
            <div key={i}>
              <Skeleton height={160} radius={16} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleMarkComplete = (goalId) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, completed: Math.min(goal.completed + 1, goal.total) }
        : goal
    ));
  };

  return (
    <div style={{ textAlign: 'left', marginTop: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ 
          margin: 0, 
          paddingLeft: 'calc(var(--space-1) / 2)', 
          paddingTop: 0, 
          paddingBottom: 'calc(var(--space-1) / 2)', 
          color: 'var(--text)',
          fontSize: '1.25rem',
          fontWeight: '600'
        }}>
          Goals
        </h2>
        <button
          onClick={onNavigateToGoals}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-600)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.9rem',
            fontWeight: '500',
            padding: '6px 8px',
            borderRadius: '6px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = 'var(--accent-bg-softer)'}
          onMouseLeave={(e) => e.target.style.background = 'none'}
        >
          View All
          <ArrowRight size={14} />
        </button>
      </div>

      {goals.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          color: 'var(--text-muted)', 
          padding: '2rem',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <Target size={24} style={{ marginBottom: '8px', opacity: 0.6 }} />
          <p style={{ marginBottom: 12, fontSize: '1rem' }}>No goals yet.</p>
          <button
            onClick={onNavigateToGoals}
            className="primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}
          >
            <Plus size={16} />
            Add First Goal
          </button>
        </div>
      ) : (
        <div className="card-grid">
          {goals.map(goal => (
            <GoalPreviewCard 
              key={goal.id} 
              goal={goal} 
              onMarkComplete={handleMarkComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const GoalPreviewCard = ({ goal, onMarkComplete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const progressPercentage = (goal.completed / goal.total) * 100;
  const isCompleted = goal.completed >= goal.total;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="entry-card"
      style={{
        border: isHovered ? '1px solid color-mix(in oklab, var(--accent-600), transparent 55%)' : '1px solid var(--border)',
        boxShadow: isHovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        position: 'relative'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, marginRight: goal.streak > 0 ? '50px' : '0' }}>
          <span style={{ 
            color: 'var(--accent-600)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: 28, 
            height: 28, 
            borderRadius: '50%', 
            background: 'var(--accent-bg-softer)', 
            border: '1px solid var(--border)' 
          }}>
            <Target size={16} strokeWidth={2} />
          </span>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text)', opacity: 0.8 }}>
            <Calendar size={14} style={{ marginRight: '4px' }} />
            <span>{goal.frequency}</span>
          </div>
        </div>
        
        {goal.streak > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--accent-600)',
            color: 'white',
            fontSize: '0.7rem',
            padding: '2px 6px',
            borderRadius: '10px',
            fontWeight: '500',
            lineHeight: '1'
          }}>
            🔥 {goal.streak}
          </div>
        )}
      </div>

      {/* Title */}
      <div className="entry-card__title" style={{ marginBottom: '16px' }}>
        {goal.title}
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '6px',
          fontSize: '0.85rem',
          color: 'var(--text)',
          opacity: 0.9
        }}>
          <span>Progress</span>
          <span>{goal.completed}/{goal.total}</span>
        </div>
        <div style={{
          width: '100%',
          height: '6px',
          background: 'var(--accent-bg-softer)',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progressPercentage}%`,
            height: '100%',
            background: isCompleted ? 'var(--success)' : 'var(--accent-600)',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Quick Action Button */}
      <button
        onClick={() => onMarkComplete(goal.id)}
        disabled={isCompleted}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: '8px',
          border: 'none',
          background: isCompleted ? 'var(--success)' : 'var(--accent-600)',
          color: 'white',
          fontSize: '0.85rem',
          fontWeight: '500',
          cursor: isCompleted ? 'default' : 'pointer',
          opacity: isCompleted ? 0.8 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          transition: 'background-color 0.2s'
        }}
      >
        <CheckCircle size={14} />
        {isCompleted ? 'Completed' : 'Mark as Done'}
      </button>
    </div>
  );
};

export default GoalsSection;
