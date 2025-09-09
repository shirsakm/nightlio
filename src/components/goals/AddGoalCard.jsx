import { Plus } from 'lucide-react';

const AddGoalCard = ({ onAdd }) => {
  return (
    <div
      className="entry-card"
      role="button"
      tabIndex={0}
      onClick={onAdd}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAdd?.(); } }}
      style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: 160,
        background: 'var(--accent-bg-softer)',
        borderStyle: 'dashed',
        borderColor: 'color-mix(in oklab, var(--accent-600), transparent 40%)',
        cursor: 'pointer',
        transition: 'background 0.2s, border-color 0.2s'
      }}
      aria-label="Add Goal"
      title="Add Goal"
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--accent-600)' }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          background: 'var(--accent-bg)',
          color: '#fff',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <Plus size={24} />
        </div>
        <div style={{ fontWeight: 600 }}>Add Goal</div>
      </div>
    </div>
  );
};

export default AddGoalCard;
