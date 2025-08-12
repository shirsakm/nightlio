import { useState } from 'react';
import { Settings, X } from 'lucide-react';

const GroupManager = ({ groups, onCreateGroup, onCreateOption, loading }) => {
  const [showManager, setShowManager] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newOptionName, setNewOptionName] = useState('');
  const [selectedGroupForOption, setSelectedGroupForOption] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isCreatingOption, setIsCreatingOption] = useState(false);

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
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            margin: '0 auto',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
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
        background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        marginTop: '1rem',
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
            color: '#333',
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
            color: '#666',
            padding: '0.25rem',
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Create New Group */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#555', fontSize: '1rem' }}>
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
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '0.9rem',
            }}
          />
          <button
            onClick={handleCreateGroup}
            disabled={!newGroupName.trim() || isCreatingGroup}
            style={{
              padding: '0.75rem 1rem',
              background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
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
          <h4 style={{ margin: '0 0 1rem 0', color: '#555', fontSize: '1rem' }}>
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
                border: '1px solid #ddd',
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
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '0.9rem',
              }}
            />
            <button
              onClick={handleCreateOption}
              disabled={!newOptionName.trim() || !selectedGroupForOption || isCreatingOption}
              style={{
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
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
          <h4 style={{ margin: '0 0 1rem 0', color: '#555', fontSize: '1rem' }}>
            Current Categories
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {groups.map(group => (
              <div
                key={group.id}
                style={{
                  padding: '1rem',
                  background: 'linear-gradient(145deg, #f8f9fa, #e9ecef)',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                }}
              >
                <div
                  style={{
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '0.5rem',
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
                        background: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        color: '#666',
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