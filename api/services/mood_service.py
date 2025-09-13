from typing import List, Optional, Dict
from api.database import MoodDatabase
from api.models.mood_entry import MoodEntry


class MoodService:
    def __init__(self, db: MoodDatabase):
        self.db = db

    def create_mood_entry(
        self,
        user_id: int,
        date: str,
        mood: int,
        content: str,
        time: str = None,
        selected_options: List[int] = None,
    ) -> Dict:
        """Create a new mood entry and check for achievements"""
        if not (1 <= mood <= 5):
            raise ValueError("Mood must be between 1 and 5")

        if not content.strip():
            raise ValueError("Content cannot be empty")

        entry_id = self.db.add_mood_entry(
            user_id, date, mood, content, time, selected_options
        )

        # Check for new achievements
        new_achievements = self.db.check_achievements(user_id)

        return {"entry_id": entry_id, "new_achievements": new_achievements}

    def get_all_entries(self, user_id: int) -> List[Dict]:
        """Get all mood entries for a user"""
        return self.db.get_all_mood_entries(user_id)

    def get_entries_by_date_range(
        self, user_id: int, start_date: str, end_date: str
    ) -> List[Dict]:
        """Get mood entries within a date range for a user"""
        return self.db.get_mood_entries_by_date_range(user_id, start_date, end_date)

    def get_entry_by_id(self, user_id: int, entry_id: int) -> Optional[Dict]:
        """Get a specific mood entry by ID for a user"""
        return self.db.get_mood_entry_by_id(user_id, entry_id)

    def update_entry(
        self, user_id: int, entry_id: int, mood: int = None, content: str = None
    ) -> bool:
        """Update an existing mood entry for a user"""
        if mood is not None and not (1 <= mood <= 5):
            raise ValueError("Mood must be between 1 and 5")

        return self.db.update_mood_entry(user_id, entry_id, mood, content)

    def delete_entry(self, user_id: int, entry_id: int) -> bool:
        """Delete a mood entry for a user"""
        return self.db.delete_mood_entry(user_id, entry_id)

    def get_statistics(self, user_id: int) -> Dict:
        """Get mood statistics for a user"""
        stats = self.db.get_mood_statistics(user_id)
        mood_counts = self.db.get_mood_counts(user_id)
        current_streak = self.db.get_current_streak(user_id)

        return {
            "statistics": stats,
            "mood_distribution": mood_counts,
            "current_streak": current_streak,
        }

    def get_current_streak(self, user_id: int) -> int:
        """Get current consecutive days streak for a user"""
        return self.db.get_current_streak(user_id)

    def get_entry_selections(self, user_id: int, entry_id: int) -> List[Dict]:
        """Get selected options for an entry (with user verification)"""
        # First verify the entry belongs to the user
        entry = self.db.get_mood_entry_by_id(user_id, entry_id)
        if not entry:
            return []
        return self.db.get_entry_selections(entry_id)
