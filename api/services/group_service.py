from typing import List, Dict
from database import MoodDatabase

class GroupService:
    def __init__(self, db: MoodDatabase):
        self.db = db

    def get_all_groups(self) -> List[Dict]:
        """Get all groups with their options"""
        return self.db.get_all_groups()

    def create_group(self, name: str) -> int:
        """Create a new group"""
        if not name.strip():
            raise ValueError("Group name cannot be empty")
            
        return self.db.create_group(name.strip())

    def create_group_option(self, group_id: int, name: str) -> int:
        """Create a new option for a group"""
        if not name.strip():
            raise ValueError("Option name cannot be empty")
            
        return self.db.create_group_option(group_id, name.strip())

    def delete_group(self, group_id: int) -> bool:
        """Delete a group and all its options"""
        return self.db.delete_group(group_id)

    def delete_group_option(self, option_id: int) -> bool:
        """Delete a group option"""
        return self.db.delete_group_option(option_id)