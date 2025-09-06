import GoalCard from './GoalCard';

const GoalsList = ({ goals, onDelete, onUpdateProgress }) => {
  if (goals.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 1rem' }}>
        <p style={{ marginBottom: 16, fontSize: '1.1rem' }}>No goals yet.</p>
        <p style={{ marginBottom: 0, fontSize: '0.95rem', opacity: 0.8 }}>
          Start by adding your first goal to begin tracking your progress.
        </p>
      </div>
    );
  }

  return (
    <div className="card-grid">
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
