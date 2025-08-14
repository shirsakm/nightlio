import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useNFT } from '../../hooks/useNFT';

const AchievementNFT = ({ achievement }) => {
  const { isConnected } = useAccount();
  const { mintAchievement, isPending, isConfirming, isConfirmed, useHasAchievement } = useNFT();
  const [error, setError] = useState('');
  
  // Check if user already has this achievement NFT
  const { data: hasNFT, isLoading: checkingNFT } = useHasAchievement(achievement.achievement_type.toUpperCase());

  const handleMint = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setError('');
      await mintAchievement(achievement.achievement_type.toUpperCase());
    } catch (err) {
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

  return (
    <div style={{
      padding: '1.5rem',
      border: '2px solid #667eea',
      borderRadius: '12px',
      background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      marginBottom: '1rem'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
        {achievement.icon}
      </div>
      
      <h3 style={{ 
        color: '#333', 
        margin: '0 0 0.5rem 0',
        fontSize: '1.2rem'
      }}>
        {achievement.name}
      </h3>
      
      <p style={{ 
        color: '#666', 
        margin: '0 0 1rem 0',
        fontSize: '0.9rem'
      }}>
        {achievement.description}
      </p>

      <div style={{
        background: achievement.rarity === 'legendary' ? '#ffd700' : 
                   achievement.rarity === 'rare' ? '#9b59b6' :
                   achievement.rarity === 'uncommon' ? '#3498db' : '#95a5a6',
        color: 'white',
        padding: '0.25rem 0.75rem',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '600',
        display: 'inline-block',
        marginBottom: '1rem'
      }}>
        {achievement.rarity.toUpperCase()}
      </div>

      {hasNFT ? (
        <div style={{
          background: '#4ecdc4',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '25px',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          ✅ NFT Owned
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
            transition: 'all 0.3s ease'
          }}
        >
          {isPending ? 'Confirm in Wallet...' :
           isConfirming ? 'Minting...' :
           isConfirmed ? 'Minted! ✅' :
           'Mint NFT'}
        </button>
      )}

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