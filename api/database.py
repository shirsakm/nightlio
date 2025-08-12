import sqlite3
import os
from datetime import datetime
from typing import List, Dict, Optional

class MoodDatabase:
    def __init__(self, db_path: str = None):
        if db_path is None:
            # Create database in the data directory
            data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
            os.makedirs(data_dir, exist_ok=True)
            db_path = os.path.join(data_dir, 'nightlio.db')
        
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize the database with required tables"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS mood_entries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL,
                    mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 5),
                    content TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create index for faster date queries
            conn.execute('''
                CREATE INDEX IF NOT EXISTS idx_mood_entries_date 
                ON mood_entries(date)
            ''')
            
            conn.commit()
    
    def add_mood_entry(self, date: str, mood: int, content: str) -> int:
        """Add a new mood entry and return the entry ID"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                INSERT INTO mood_entries (date, mood, content)
                VALUES (?, ?, ?)
            ''', (date, mood, content))
            conn.commit()
            return cursor.lastrowid
    
    def get_all_mood_entries(self) -> List[Dict]:
        """Get all mood entries ordered by date (newest first)"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute('''
                SELECT id, date, mood, content, created_at, updated_at
                FROM mood_entries
                ORDER BY date DESC, created_at DESC
            ''')
            return [dict(row) for row in cursor.fetchall()]
    
    def get_mood_entries_by_date_range(self, start_date: str, end_date: str) -> List[Dict]:
        """Get mood entries within a date range"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute('''
                SELECT id, date, mood, content, created_at, updated_at
                FROM mood_entries
                WHERE date BETWEEN ? AND ?
                ORDER BY date DESC, created_at DESC
            ''', (start_date, end_date))
            return [dict(row) for row in cursor.fetchall()]
    
    def get_mood_entry_by_id(self, entry_id: int) -> Optional[Dict]:
        """Get a specific mood entry by ID"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute('''
                SELECT id, date, mood, content, created_at, updated_at
                FROM mood_entries
                WHERE id = ?
            ''', (entry_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
    
    def update_mood_entry(self, entry_id: int, mood: int = None, content: str = None) -> bool:
        """Update an existing mood entry"""
        updates = []
        params = []
        
        if mood is not None:
            updates.append("mood = ?")
            params.append(mood)
        
        if content is not None:
            updates.append("content = ?")
            params.append(content)
        
        if not updates:
            return False
        
        updates.append("updated_at = CURRENT_TIMESTAMP")
        params.append(entry_id)
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(f'''
                UPDATE mood_entries 
                SET {", ".join(updates)}
                WHERE id = ?
            ''', params)
            conn.commit()
            return cursor.rowcount > 0
    
    def delete_mood_entry(self, entry_id: int) -> bool:
        """Delete a mood entry by ID"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                DELETE FROM mood_entries WHERE id = ?
            ''', (entry_id,))
            conn.commit()
            return cursor.rowcount > 0
    
    def get_mood_statistics(self) -> Dict:
        """Get mood statistics"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT 
                    COUNT(*) as total_entries,
                    AVG(mood) as average_mood,
                    MIN(mood) as lowest_mood,
                    MAX(mood) as highest_mood,
                    MIN(date) as first_entry_date,
                    MAX(date) as last_entry_date
                FROM mood_entries
            ''')
            row = cursor.fetchone()
            
            if row and row[0] > 0:  # total_entries > 0
                return {
                    'total_entries': row[0],
                    'average_mood': round(row[1], 2) if row[1] else 0,
                    'lowest_mood': row[2],
                    'highest_mood': row[3],
                    'first_entry_date': row[4],
                    'last_entry_date': row[5]
                }
            else:
                return {
                    'total_entries': 0,
                    'average_mood': 0,
                    'lowest_mood': None,
                    'highest_mood': None,
                    'first_entry_date': None,
                    'last_entry_date': None
                }
    
    def get_mood_counts(self) -> Dict[int, int]:
        """Get count of each mood level"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT mood, COUNT(*) as count
                FROM mood_entries
                GROUP BY mood
                ORDER BY mood
            ''')
            return {row[0]: row[1] for row in cursor.fetchall()}