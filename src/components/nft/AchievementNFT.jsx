import { Zap, Flame, Target, BarChart3, Crown } from 'lucide-react';
import ProgressBar from '../ui/ProgressBar';

const AchievementNFT = ({ achievement, isUnlocked = true, progressValue, progressMax }) => {

  // Get the icon component
  const getIcon = (iconName) => {
    const icons = { Zap, Flame, Target, BarChart3, Crown };
    const IconComponent = icons[iconName] || Zap;
    return IconComponent;
  };

  const IconComponent = getIcon(achievement.icon);

  const rarityToken = (achievement.rarity || '').toLowerCase();
  const rarityStyles = {
    legendary: { bg: 'rgba(255, 215, 0, 0.16)', text: '#7a6500', border: 'rgba(255, 215, 0, 0.5)' },
    rare: { bg: 'rgba(155, 89, 182, 0.14)', text: '#5b3a66', border: 'rgba(155, 89, 182, 0.4)' },
    uncommon: { bg: 'rgba(52, 152, 219, 0.14)', text: '#245b7a', border: 'rgba(52, 152, 219, 0.4)' },
    common: { bg: 'rgba(149, 165, 166, 0.12)', text: '#4a5455', border: 'rgba(149, 165, 166, 0.4)' },
  };
  const r = rarityStyles[rarityToken] || rarityStyles.common;

  return (
    <div style={{
  position: 'relative',
  boxSizing: 'border-box',
      padding: '1.25rem',
      borderRadius: '12px',
      background: isUnlocked ? '#ffffff' : '#f7f8fa',
      border: '1px solid rgba(0,0,0,0.06)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
  minHeight: '280px',
  overflow: 'hidden',
  width: '100%',
  margin: 0,
      opacity: isUnlocked ? 1 : 0.9,
      transition: 'transform 0.18s ease',
      willChange: 'transform'
    }}>
      {/* Rarity badge (subtle) */}
      {rarityToken && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          padding: '4px 8px',
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 600,
          background: r.bg,
          color: r.text,
          border: `1px solid ${r.border}`,
          letterSpacing: 0.3
        }} aria-label={`rarity: ${rarityToken}`}>
          {rarityToken}
        </div>
      )}
      {/* Icon */}
      <div style={{ 
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          background: isUnlocked 
            ? 'linear-gradient(135deg, #667eea, #764ba2)'
            : 'linear-gradient(135deg, #a8a8a8, #8c8c8c)',
          borderRadius: '50%',
          padding: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.25)'
        }}>
          <IconComponent size={26} color="white" />
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
            color: isUnlocked ? '#1f2937' : '#6b7280', 
            margin: '0 0 0.5rem 0',
            fontSize: '1.05rem',
            fontWeight: 700,
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            wordBreak: 'break-word',
            hyphens: 'auto'
          }}>
            {achievement.name}
          </h3>
          
          <p style={{ 
            color: isUnlocked ? '#4b5563' : '#9ca3af', 
            margin: '0 0 1rem 0',
            fontSize: '0.9rem',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            maxHeight: '3.1em',
            wordBreak: 'break-word',
            hyphens: 'auto'
          }}>
            {achievement.description}
          </p>
        </div>

        {/* Spacer to keep bottom area from jumping */}
        <div style={{ height: 4 }} />
      </div>

      {/* Bottom status area (consistent height) */}
      <div style={{ minHeight: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!isUnlocked ? (
          <div style={{ width: '100%' }}>
            <ProgressBar value={typeof progressValue === 'number' ? progressValue : 0} max={typeof progressMax === 'number' ? progressMax : 7} label="Progress" />
          </div>
        ) : (
          <div style={{
            background: 'linear-gradient(135deg, #29c6b8, #4ecdc4)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}>
            <Zap size={14} />
            Unlocked
          </div>
        )}
      </div>

    </div>
  );
};

export default AchievementNFT;