from typing import Optional, Dict
from api.database import MoodDatabase

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

    # New OAuth handler with idempotent upsert
    def handle_oauth_login(self, provider: str, provider_user_id: str, email: Optional[str], name: Optional[str], avatar_url: Optional[str] = None) -> Dict:
        """Insert/update a user based on OAuth identity and return the user dict.

        For now, this repo stores google identities in a google_id column.
        We upsert by google_id to remain backward-compatible.

        Returns a dict with at least: id, email, name, avatar_url.
        """
        if provider != 'google':
            # Future-proof: only google supported in current schema
            raise ValueError('Unsupported provider')

        user = self.db.upsert_user_by_google_id(
            google_id=provider_user_id,
            email=email,
            name=name,
            avatar_url=avatar_url,
        )
        return user

    # Self-host local user provisioning
    def ensure_local_user(self, default_user_id: str, default_name: Optional[str] = None, default_email: Optional[str] = None) -> Dict:
        """Ensure a self-host single-user exists and return it.

        - Uses the google_id column to store a stable synthetic identifier.
        - Always upserts with provided friendly name/email to improve UX.
        - Remains idempotent and returns the full user row.
        """
        name = default_name or 'Me'
        email = default_email or f"{default_user_id}@localhost"

        # Upsert ensures we set a friendly display name even if a previous
        # row exists with the raw id as name.
        user = self.db.upsert_user_by_google_id(
            google_id=default_user_id,
            email=email,
            name=name,
            avatar_url=None,
        )
        return user