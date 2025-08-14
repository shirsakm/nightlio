import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useNFT } from '../../hooks/useNFT';
import { Zap, Flame, Target, BarChart3, Crown } from 'lucide-react';

const AchievementNFT = ({ achievement, isUnlocked = true }) => {
  const { isConnected } = useAccount();
  const { mintAchievement, isPending, isConfirming, isConfirmed, useHasAchievement, writeError } = useNFT();
  const [error, setError] = useState('');
  
  // Log any write errors
  if (writeError) {
    console.error('Write error from wagmi:', writeError);
  }
  
  // Check if user already has this achievement NFT (only if unlocked)
  const { data: hasNFT, isLoading: checkingNFT } = useHasAchievement(
    isUnlocked ? achievement.achievement_type : null
  );

  const handleMint = async () => {
    // console.log('Mint button clicked');
    // console.log('Connected:', isConnected);
    // console.log('Achievement type:', achievement.achievement_type);
    
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setError('');
      console.log('Attempting to mint achievement...');
      await mintAchievement(achievement.achievement_type);
      console.log('Mint transaction initiated');
    } catch (err) {
      console.error('Mint error:', err);
      setError(err.message || 'Failed to mint NFT');
    }
  };

  if (checkingNFT) {
    return (
      <div style={{ 
        padding: '1rem', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        Checking NFT status...
      </div>
    );
  }

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
      borderRadius: '12px',
      background: isUnlocked 
        ? 'linear-gradient(145deg, #ffffff, #f8f9fa)'
        : 'linear-gradient(145deg, #f5f5f5, #e8e8e8)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
      textAlign: 'center',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      maxWidth: '300px',
      margin: '0 auto',
      opacity: isUnlocked ? 1 : 0.6,
      filter: isUnlocked ? 'none' : 'grayscale(50%)'
    }}>
      {/* Icon */}
      <div style={{ 
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          background: isUnlocked 
            ? 'linear-gradient(135deg, #667eea, #764ba2)'
            : 'linear-gradient(135deg, #999, #777)',
          borderRadius: '50%',
          padding: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <IconComponent size={24} color="white" />
        </div>
      </div>
      
      {/* Content */}
      <div style={{ flex: 1 }}>
        <h3 style={{ 
          color: isUnlocked ? '#333' : '#777', 
          margin: '0 0 0.5rem 0',
          fontSize: '1.1rem',
          fontWeight: '700'
        }}>
          {achievement.name}
        </h3>
        
        <p style={{ 
          color: isUnlocked ? '#666' : '#999', 
          margin: '0 0 1rem 0',
          fontSize: '0.85rem',
          lineHeight: '1.3'
        }}>
          {achievement.description}
        </p>

        {/* Rarity Badge */}
        <div style={{
          background: achievement.rarity === 'legendary' ? '#ffd700' : 
                     achievement.rarity === 'rare' ? '#9b59b6' :
                     achievement.rarity === 'uncommon' ? '#3498db' : '#95a5a6',
          color: 'white',
          padding: '0.3rem 0.8rem',
          borderRadius: '20px',
          fontSize: '0.7rem',
          fontWeight: '700',
          display: 'inline-block',
          marginBottom: '1rem',
          letterSpacing: '0.5px'
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
        ) : hasNFT ? (
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
            Owned
          </div>
        ) : (
          <button
            onClick={handleMint}
            disabled={isPending || isConfirming || !isConnected}
            style={{
              background: isPending || isConfirming ? '#ccc' : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '25px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: isPending || isConfirming || !isConnected ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              width: '100%'
            }}
          >
            {isPending ? 'Confirm in Wallet...' :
             isConfirming ? 'Minting...' :
             isConfirmed ? 'Minted!' :
             'Mint NFT'}
          </button>
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