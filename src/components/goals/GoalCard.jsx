import { useState } from 'react';
import { Target, Trash2, CheckCircle, Calendar } from 'lucide-react';
import { useToast } from '../ui/ToastProvider';

const GoalCard = ({ goal, onDelete, onUpdateProgress }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { show } = useToast();

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    setIsDeleting(true);
    
    // Simulate API call delay
    setTimeout(() => {
      onDelete(goal.id);
      show('Goal deleted successfully', 'success');
      setIsDeleting(false);
    }, 500);
  };

  const handleMarkComplete = () => {
    if (goal.completed >= goal.total) {
      show('Goal already completed for this period!', 'info');
      return;
    }
    onUpdateProgress(goal.id);
    show('Progress updated!', 'success');
  };

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
        position: 'relative',
        opacity: isDeleting ? 0.5 : 1,
        pointerEvents: isDeleting ? 'none' : 'auto'
      }}
    >
      {/* Header: icon + delete button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, marginRight: goal.streak > 0 ? '60px' : '40px' }}>
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
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}>
          {goal.streak > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--accent-600)',
              color: 'white',
              fontSize: '0.75rem',
              padding: '2px 6px',
              borderRadius: '12px',
              fontWeight: '500',
              lineHeight: '1'
            }}>
              🔥 {goal.streak}
            </div>
          )}
          <button
            onClick={handleDelete}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text)',
              opacity: isHovered ? 0.7 : 0.4,
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              transition: 'opacity 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Delete goal"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="entry-card__title" style={{ marginBottom: '8px' }}>
        {goal.title}
      </div>

      {/* Description */}
      {goal.description && (
        <div className="entry-card__excerpt" style={{ marginBottom: '16px' }}>
          {goal.description}
        </div>
      )}

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
          height: '8px',
          background: 'var(--accent-bg-softer)',
          borderRadius: '4px',
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

      {/* Action Button */}
      <button
        onClick={handleMarkComplete}
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

export default GoalCard;
