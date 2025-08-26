import { Plus } from 'lucide-react';

const FAB = ({ onClick, label = 'New Entry' }) => {
  return (
    <button className="fab" onClick={onClick} aria-label={label} title={label}>
      <Plus size={24} />
    </button>
  );
};

export default FAB;
