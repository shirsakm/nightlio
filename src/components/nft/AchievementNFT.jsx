import { useState } from 'react';
import { Zap, Flame, Target, BarChart3, Crown } from 'lucide-react';

const AchievementNFT = ({ achievement, isUnlocked = true }) => {
  const [error, setError] = useState('');

  // Get the icon component
  const getIcon = (iconName) => {
    const icons = { Zap, Flame, Target, BarChart3, Crown };
    const IconComponent = icons[iconName] || Zap;
    return IconComponent;
  };

  const IconComponent = getIcon(achievement.icon);

  return (
    <div style={{
      padding: '1.5rem',
      borderRadius: '16px',
      background: isUnlocked 
        ? 'linear-gradient(145deg, #ffffff, #f8f9fa)'
        : 'linear-gradient(145deg, #f5f5f5, #e8e8e8)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
  minHeight: '300px',
  maxWidth: '520px',
      margin: '0 auto',
      opacity: isUnlocked ? 1 : 0.6,
      filter: isUnlocked ? 'none' : 'grayscale(50%)',
      transition: 'all 0.3s ease'
    }}>
      {/* Icon */}
      <div style={{ 
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          background: isUnlocked 
            ? 'linear-gradient(135deg, #667eea, #764ba2)'
            : 'linear-gradient(135deg, #999, #777)',
          borderRadius: '50%',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
        }}>
          <IconComponent size={28} color="white" />
        </div>
      </div>
      
      {/* Content */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <h3 style={{ 
            color: isUnlocked ? '#333' : '#777', 
            margin: '0 0 0.75rem 0',
            fontSize: '1.2rem',
            fontWeight: '700'
          }}>
            {achievement.name}
          </h3>
          
          <p style={{ 
            color: isUnlocked ? '#666' : '#999', 
            margin: '0 0 1.5rem 0',
            fontSize: '0.9rem',
            lineHeight: '1.4'
          }}>
            {achievement.description}
          </p>
        </div>

        {/* Rarity Badge */}
        <div style={{
          background: achievement.rarity === 'legendary' ? '#ffd700' : 
                     achievement.rarity === 'rare' ? '#9b59b6' :
                     achievement.rarity === 'uncommon' ? '#3498db' : '#95a5a6',
          color: 'white',
          padding: '0.4rem 1rem',
          borderRadius: '25px',
          fontSize: '0.75rem',
          fontWeight: '700',
          display: 'inline-block',
          marginBottom: '1.5rem',
          letterSpacing: '0.5px',
          alignSelf: 'center'
        }}>
          {achievement.rarity.toUpperCase()}
        </div>
      </div>

      {/* Action Button */}
      <div>
        {!isUnlocked ? (
          <div style={{
            background: '#ccc',
            color: '#777',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            🔒 Locked
          </div>
        ) : (
          <div style={{
            background: '#4ecdc4',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <Zap size={16} />
            Unlocked
          </div>
        )}
      </div>

  {error && (
        <div style={{
          background: '#fee',
          color: '#c33',
          padding: '0.5rem',
          borderRadius: '6px',
          marginTop: '0.5rem',
          fontSize: '0.8rem'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default AchievementNFT;