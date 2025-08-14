import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNFT } from '../hooks/useNFT';
import AchievementNFT from '../components/nft/AchievementNFT';
import apiService from '../services/api';

const AchievementsView = () => {
  const { isConnected } = useAccount();
  const { nftBalance } = useNFT();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUserAchievements();
      setAchievements(data);
    } catch (err) {
      setError('Failed to load achievements');
      console.error('Failed to load achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ marginTop: '2rem', textAlign: 'center', color: '#666' }}>
        Loading achievements...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ marginTop: '2rem', textAlign: 'center', color: '#ff6b6b' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2 style={{ 
          color: '#333', 
          fontSize: '2rem', 
          fontWeight: '700',
          margin: '0 0 0.5rem 0'
        }}>
          🏆 Your Achievements
        </h2>
        <p style={{ color: '#666', fontSize: '1rem', margin: '0 0 1rem 0' }}>
          Unlock achievements and mint them as NFTs on Sepolia testnet
        </p>
        
        {isConnected && (
          <div style={{
            background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'inline-block'
          }}>
            NFTs Owned: {nftBalance}
          </div>
        )}
      </div>

      {/* Wallet Connection Notice */}
      {!isConnected && (
        <div style={{
          background: '#fff3cd',
          color: '#856404',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Connect your wallet to mint achievement NFTs on Sepolia testnet
        </div>
      )}

      {/* Achievements Grid */}
      {achievements.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          color: '#666',
          padding: '3rem',
          background: '#f8f9fa',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎯</div>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>No Achievements Yet</h3>
          <p style={{ margin: '0' }}>
            Start logging your moods to unlock achievements!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {achievements.map((achievement, index) => (
            <AchievementNFT 
              key={index} 
              achievement={achievement}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AchievementsView;