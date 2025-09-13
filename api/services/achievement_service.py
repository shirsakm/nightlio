from typing import List, Dict
from api.database import MoodDatabase


class AchievementService:
    def __init__(self, db: MoodDatabase):
        self.db = db

        # Achievement definitions
        self.achievements = {
            "first_entry": {
                "name": "First Entry",
                "description": "Log your first mood entry",
                "icon": "Zap",
                "rarity": "common",
            },
            "week_warrior": {
                "name": "Week Warrior",
                "description": "Maintain a 7-day streak",
                "icon": "Flame",
                "rarity": "uncommon",
            },
            "consistency_king": {
                "name": "Consistency King",
                "description": "Maintain a 30-day streak",
                "icon": "Target",
                "rarity": "rare",
            },
            "data_lover": {
                "name": "Data Lover",
                "description": "View statistics 10 times",
                "icon": "BarChart3",
                "rarity": "uncommon",
            },
            "mood_master": {
                "name": "Mood Master",
                "description": "Log 100 total entries",
                "icon": "Crown",
                "rarity": "legendary",
            },
        }

    def get_achievement_info(self, achievement_type: str) -> Dict:
        """Get achievement metadata"""
        return self.achievements.get(achievement_type, {})

    def get_user_achievements(self, user_id: int) -> List[Dict]:
        """Get user achievements with metadata"""
        achievements = self.db.get_user_achievements(user_id)

        # Add metadata to each achievement
        for achievement in achievements:
            achievement_info = self.get_achievement_info(
                achievement["achievement_type"]
            )
            achievement.update(achievement_info)

        return achievements

    def check_and_award_achievements(self, user_id: int) -> List[Dict]:
        """Check for new achievements and return them with metadata"""
        new_achievement_types = self.db.check_achievements(user_id)

        new_achievements = []
        for achievement_type in new_achievement_types:
            achievement_info = self.get_achievement_info(achievement_type)
            achievement_info["achievement_type"] = achievement_type
            new_achievements.append(achievement_info)

        return new_achievements

    # Web3/NFT functionality removed; no-op retained intentionally
