from typing import List, Optional, Dict
from database import MoodDatabase
from models.mood_entry import MoodEntry

class MoodService:
    def __init__(self, db: MoodDatabase):
        self.db = db

    def create_mood_entry(self, date: str, mood: int, content: str, 
                         time: str = None, selected_options: List[int] = None) -> int:
        """Create a new mood entry"""
        if not (1 <= mood <= 5):
            raise ValueError("Mood must be between 1 and 5")
        
        if not content.strip():
            raise ValueError("Content cannot be empty")
            
        return self.db.add_mood_entry(date, mood, content, time, selected_options)

    def get_all_entries(self) -> List[Dict]:
        """Get all mood entries"""
        return self.db.get_all_mood_entries()

    def get_entries_by_date_range(self, start_date: str, end_date: str) -> List[Dict]:
        """Get mood entries within a date range"""
        return self.db.get_mood_entries_by_date_range(start_date, end_date)

    def get_entry_by_id(self, entry_id: int) -> Optional[Dict]:
        """Get a specific mood entry by ID"""
        return self.db.get_mood_entry_by_id(entry_id)

    def update_entry(self, entry_id: int, mood: int = None, content: str = None) -> bool:
        """Update an existing mood entry"""
        if mood is not None and not (1 <= mood <= 5):
            raise ValueError("Mood must be between 1 and 5")
            
        return self.db.update_mood_entry(entry_id, mood, content)

    def delete_entry(self, entry_id: int) -> bool:
        """Delete a mood entry"""
        return self.db.delete_mood_entry(entry_id)

    def get_statistics(self) -> Dict:
        """Get mood statistics"""
        stats = self.db.get_mood_statistics()
        mood_counts = self.db.get_mood_counts()
        current_streak = self.db.get_current_streak()
        
        return {
            'statistics': stats,
            'mood_distribution': mood_counts,
            'current_streak': current_streak
        }

    def get_current_streak(self) -> int:
        """Get current consecutive days streak"""
        return self.db.get_current_streak()

    def get_entry_selections(self, entry_id: int) -> List[Dict]:
        """Get selected options for an entry"""
        return self.db.get_entry_selections(entry_id)