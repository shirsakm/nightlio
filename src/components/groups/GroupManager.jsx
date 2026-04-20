import { useState } from 'react';
import { Settings, X, Trash2 } from 'lucide-react';

const GroupManager = ({ groups, onCreateGroup, onCreateOption, onDeleteGroup }) => {
  const [showManager, setShowManager] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newOptionName, setNewOptionName] = useState('');
  const [selectedGroupForOption, setSelectedGroupForOption] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isCreatingOption, setIsCreatingOption] = useState(false);
  const [deletingGroupId, setDeletingGroupId] = useState(null);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    
    setIsCreatingGroup(true);
    try {
      const success = await onCreateGroup(newGroupName.trim());
      if (success) {
        setNewGroupName('');
      }
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handleCreateOption = async () => {
    if (!newOptionName.trim() || !selectedGroupForOption) return;

    setIsCreatingOption(true);
    try {
      const success = await onCreateOption(selectedGroupForOption, newOptionName.trim());
      if (success) {
        setNewOptionName('');
        setSelectedGroupForOption('');
      }
    } finally {
      setIsCreatingOption(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    setDeletingGroupId(groupId);
    try {
      await onDeleteGroup(groupId);
    } finally {
      setDeletingGroupId(null);
    }
  };

  if (!showManager) {
    return (
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
  <button
          onClick={() => setShowManager(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, var(--accent-bg), var(--accent-bg-2))',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            margin: '0 auto',
            transition: 'all 0.3s ease',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <Settings size={16} />
          Manage Categories
        </button>
      </div>
    );
  }

  return (
  <div
      style={{
    background: 'var(--bg-card)',
        borderRadius: '16px',
        padding: '1.5rem',
    boxShadow: 'var(--shadow-lg)',
        marginTop: '1rem',
        maxHeight: '70vh',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h3
          style={{
            margin: '0',
            color: 'var(--text)',
            fontSize: '1.2rem',
            fontWeight: '600',
          }}
        >
          Manage Categories
        </h3>
        <button
          onClick={() => setShowManager(false)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: '0.25rem',
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Create New Group */}
      <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text)', opacity: 0.9, fontSize: '1rem' }}>
          Create New Category
        </h4>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Category name (e.g., Activities, Weather)"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateGroup()}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '0.9rem',
            }}
          />
      <button
            onClick={handleCreateGroup}
            disabled={!newGroupName.trim() || isCreatingGroup}
            style={{
              padding: '0.75rem 1rem',
  background: 'linear-gradient(135deg, var(--accent-bg), var(--accent-bg-2))',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: !newGroupName.trim() || isCreatingGroup ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              opacity: !newGroupName.trim() || isCreatingGroup ? 0.6 : 1,
            }}
          >
            {isCreatingGroup ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>

      {/* Create New Option */}
      {groups.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text)', opacity: 0.9, fontSize: '1rem' }}>
            Add Option to Category
          </h4>
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
      <select
              value={selectedGroupForOption}
              onChange={(e) => setSelectedGroupForOption(e.target.value)}
              style={{
                padding: '0.75rem',
        border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                minWidth: '150px',
              }}
            >
              <option value="">Select category...</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
      <input
              type="text"
              placeholder="Option name (e.g., happy, tired)"
              value={newOptionName}
              onChange={(e) => setNewOptionName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateOption()}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '0.75rem',
        border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '0.9rem',
              }}
            />
      <button
              onClick={handleCreateOption}
              disabled={!newOptionName.trim() || !selectedGroupForOption || isCreatingOption}
              style={{
                padding: '0.75rem 1rem',
  background: 'linear-gradient(135deg, var(--accent-bg), var(--accent-bg-2))',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: (!newOptionName.trim() || !selectedGroupForOption || isCreatingOption) ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                opacity: (!newOptionName.trim() || !selectedGroupForOption || isCreatingOption) ? 0.6 : 1,
              }}
            >
              {isCreatingOption ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {/* Current Groups Overview */}
      {groups.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text)', opacity: 0.9, fontSize: '1rem' }}>
            Current Categories
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {groups.map(group => (
              <div
                key={group.id}
                style={{
                  padding: '1rem',
                  background: 'var(--surface)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  position: 'relative',
                }}
              >
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  disabled={deletingGroupId === group.id}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: deletingGroupId === group.id ? 'not-allowed' : 'pointer',
                    color: 'var(--text-muted)',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    transition: 'all 0.2s',
                    opacity: deletingGroupId === group.id ? 0.5 : 1,
                  }}
                  title="Delete category"
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Trash2 size={14} />
                </button>
                <div
                  style={{
                    fontWeight: '600',
                    color: 'var(--text)',
                    marginBottom: '0.5rem',
                    paddingRight: '1.5rem',
                  }}
                >
                  {group.name} ({group.options.length} options)
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.25rem',
                  }}
                >
                  {group.options.map(option => (
                    <span
                      key={option.id}
                      style={{
                        padding: '0.25rem 0.5rem',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {option.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupManager;