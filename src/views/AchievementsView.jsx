import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNFT } from '../hooks/useNFT';
import AchievementNFT from '../components/nft/AchievementNFT';
import apiService from '../services/api';

// All possible achievements
const getAllAchievements = () => [
  {
    achievement_type: 'first_entry',
    name: 'First Entry',
    description: 'Log your first mood entry',
    icon: 'Zap',
    rarity: 'common'
  },
  {
    achievement_type: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'Flame',
    rarity: 'uncommon'
  },
  {
    achievement_type: 'consistency_king',
    name: 'Consistency King',
    description: 'Maintain a 30-day streak',
    icon: 'Crown',
    rarity: 'rare'
  },
  {
    achievement_type: 'data_lover',
    name: 'Data Lover',
    description: 'View statistics 10 times',
    icon: 'BarChart3',
    rarity: 'uncommon'
  },
  {
    achievement_type: 'mood_master',
    name: 'Mood Master',
    description: 'Log 100 total entries',
    icon: 'Target',
    rarity: 'legendary'
  }
];

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
      <style>
        {`
          .achievements-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
            align-items: stretch;
            max-width: 800px;
            margin: 0 auto;
          }
          
          @media (max-width: 768px) {
            .achievements-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
      <div className="achievements-grid">
        {/* All possible achievements */}
        {getAllAchievements().map((achievement, index) => {
          const unlockedAchievement = achievements.find(a => a.achievement_type === achievement.achievement_type);
          return (
            <AchievementNFT 
              key={index} 
              achievement={unlockedAchievement || achievement}
              isUnlocked={!!unlockedAchievement}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsView;