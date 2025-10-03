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
  const [progress, setProgress] = useState({});

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const [data, prog] = await Promise.all([
        apiService.getUserAchievements(),
        apiService.getAchievementsProgress(),
      ]);
      setAchievements(data);
      setProgress(prog || {});
    } catch (err) {
      setError('Failed to load achievements');
      console.error('Failed to load achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading achievements...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--accent-600)' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1.5rem' }}>

  {/* Web3 notice removed */}

      {/* Achievements Grid */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: 0,
        margin: 0,
        alignItems: 'stretch',
        alignContent: 'flex-start',
        width: '100%'
      }}>
        {/* All possible achievements */}
        {getAllAchievements().map((achievement, index) => {
          const unlockedAchievement = achievements.find(a => a.achievement_type === achievement.achievement_type);
          const isUnlocked = !!unlockedAchievement;
          const p = progress[achievement.achievement_type] || null;
          const progressValue = isUnlocked ? undefined : (p ? p.current : 0);
          const progressMax = p ? p.max : 7;
          return (
            <div
              key={index}
              onClick={() => setActive(unlockedAchievement || achievement)}
              style={{
                cursor: 'pointer',
                flex: '1 1 300px',
                minWidth: 260,
                maxWidth: '100%',
                display: 'flex'
              }}
            >
              <AchievementNFT 
                achievement={unlockedAchievement || achievement}
                isUnlocked={isUnlocked}
                progressValue={progressValue}
                progressMax={progressMax}
              />
            </div>
          );
        })}
      </div>

      <Modal open={!!active} onClose={() => setActive(null)} title={active?.name || 'Achievement'}>
        <p style={{ marginTop: 0 }}>{active?.description}</p>
        {!achievements.find(a => a.achievement_type === active?.achievement_type) && (() => {
          const p = progress[active?.achievement_type] || { current: 0, max: 7 };
          return <ProgressBar value={p.current || 0} max={p.max || 7} label="Progress to unlock" />;
        })()}
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
          Tips: Log daily to maintain your streak. Viewing statistics contributes to "Data Lover".
        </div>
      </Modal>
    </div>
  );
};

export default AchievementsView;