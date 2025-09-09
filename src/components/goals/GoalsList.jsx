import GoalCard from './GoalCard';
import AddGoalCard from './AddGoalCard';

const GoalsList = ({ goals, onDelete, onUpdateProgress, onAdd }) => {
  if (goals.length === 0) {
    return (
      <div style={{ padding: '1rem 0' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
          <p style={{ marginBottom: 8, fontSize: '1.1rem' }}>No goals yet.</p>
          <p style={{ marginBottom: 0, fontSize: '0.95rem', opacity: 0.8 }}>
            Start by adding your first goal to begin tracking your progress.
          </p>
        </div>
        {onAdd && (
          <div className="card-grid">
            <AddGoalCard onAdd={onAdd} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card-grid">
      {onAdd && (
        <AddGoalCard onAdd={onAdd} />
      )}
      {goals.map(goal => (
        <GoalCard 
          key={goal.id} 
          goal={goal} 
          onDelete={onDelete}
          onUpdateProgress={onUpdateProgress}
        />
      ))}
    </div>
  );
};

export default GoalsList;
