from typing import Optional, Dict
from database import MoodDatabase

class UserService:
    def __init__(self, db: MoodDatabase):
        self.db = db

    def get_or_create_user(self, google_id: str, email: str, name: str, avatar_url: str = None) -> Dict:
        """Get existing user or create new one from Google OAuth data"""
        # Try to find existing user
        user = self.db.get_user_by_google_id(google_id)
        
        if user:
            # Update last login
            self.db.update_user_last_login(user['id'])
            return user
        else:
            # Create new user
            user_id = self.db.create_user(google_id, email, name, avatar_url)
            return self.db.get_user_by_id(user_id)

    def get_user_by_id(self, user_id: int) -> Optional[Dict]:
        """Get user by ID"""
        return self.db.get_user_by_id(user_id)

    def update_last_login(self, user_id: int):
        """Update user's last login timestamp"""
        self.db.update_user_last_login(user_id)