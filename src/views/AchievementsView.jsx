import { useState, useEffect } from 'react';
import Modal from '../components/ui/Modal';
import ProgressBar from '../components/ui/ProgressBar';
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
  // Web3 removed
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [active, setActive] = useState(null);

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

  {/* Web3 notice removed */}

      {/* Achievements Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem',
        padding: 0,
        margin: 0
      }}>
        {/* All possible achievements */}
        {getAllAchievements().map((achievement, index) => {
          const unlockedAchievement = achievements.find(a => a.achievement_type === achievement.achievement_type);
          const isUnlocked = !!unlockedAchievement;
          return (
            <div key={index} onClick={() => setActive(unlockedAchievement || achievement)} style={{ cursor: 'pointer' }}>
              <AchievementNFT 
                achievement={unlockedAchievement || achievement}
                isUnlocked={isUnlocked}
              />
              {!isUnlocked && (
                <div style={{ padding: '0.75rem 1rem' }}>
                  <ProgressBar value={Math.floor(Math.random()*7)} max={7} label="Progress" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.name || 'Achievement'}>
        <p style={{ marginTop: 0 }}>{active?.description}</p>
        {!achievements.find(a => a.achievement_type === active?.achievement_type) && (
          <ProgressBar value={Math.floor(Math.random()*7)} max={7} label="Progress to unlock" />
        )}
        <div style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>
          Tips: Log daily to maintain your streak. Viewing statistics contributes to “Data Lover”.
        </div>
      </Modal>
    </div>
  );
};

export default AchievementsView;