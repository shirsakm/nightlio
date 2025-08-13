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
            
            # Create groups table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS groups (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create group options table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS group_options (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    group_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE
                )
            ''')
            
            # Create table to store selected options for each entry
            conn.execute('''
                CREATE TABLE IF NOT EXISTS entry_selections (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    entry_id INTEGER NOT NULL,
                    option_id INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (entry_id) REFERENCES mood_entries (id) ON DELETE CASCADE,
                    FOREIGN KEY (option_id) REFERENCES group_options (id) ON DELETE CASCADE
                )
            ''')
            
            # Create index for faster date queries
            conn.execute('''
                CREATE INDEX IF NOT EXISTS idx_mood_entries_date 
                ON mood_entries(date)
            ''')
            
            conn.commit()
            
            # Insert default groups and options if they don't exist
            self._insert_default_groups()
    
    def add_mood_entry(self, date: str, mood: int, content: str, time: str = None, selected_options: List[int] = None) -> int:
        """Add a new mood entry and return the entry ID"""
        with sqlite3.connect(self.db_path) as conn:
            if time:
                cursor = conn.execute('''
                    INSERT INTO mood_entries (date, mood, content, created_at)
                    VALUES (?, ?, ?, ?)
                ''', (date, mood, content, time))
            else:
                cursor = conn.execute('''
                    INSERT INTO mood_entries (date, mood, content)
                    VALUES (?, ?, ?)
                ''', (date, mood, content))
            
            entry_id = cursor.lastrowid
            
            # Add selected options if provided
            if selected_options:
                for option_id in selected_options:
                    conn.execute('INSERT INTO entry_selections (entry_id, option_id) VALUES (?, ?)', (entry_id, option_id))
            
            conn.commit()
            return entry_id
    
    def get_all_mood_entries(self) -> List[Dict]:
        """Get all mood entries ordered by created_at (newest first)"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute('''
                SELECT id, date, mood, content, created_at, updated_at
                FROM mood_entries
                ORDER BY created_at DESC, date DESC
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
                ORDER BY created_at DESC, date DESC
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
    
    def get_current_streak(self) -> int:
        """Calculate the current consecutive days streak"""
        with sqlite3.connect(self.db_path) as conn:
            # Get distinct dates with entries, ordered by date descending
            cursor = conn.execute('''
                SELECT DISTINCT date
                FROM mood_entries
                ORDER BY date DESC
            ''')
            dates = [row[0] for row in cursor.fetchall()]
            
            if not dates:
                return 0
            
            # Convert date strings to date objects for comparison
            from datetime import datetime, timedelta
            
            try:
                # Parse dates - handle different formats
                parsed_dates = []
                for date_str in dates:
                    try:
                        # Try MM/DD/YYYY format first
                        parsed_date = datetime.strptime(date_str, '%m/%d/%Y').date()
                        parsed_dates.append(parsed_date)
                    except ValueError:
                        try:
                            # Try M/D/YYYY format
                            parsed_date = datetime.strptime(date_str, '%m/%d/%Y').date()
                            parsed_dates.append(parsed_date)
                        except ValueError:
                            try:
                                # Try YYYY-MM-DD format
                                parsed_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                                parsed_dates.append(parsed_date)
                            except ValueError:
                                # Skip invalid dates
                                continue
                
                if not parsed_dates:
                    return 0
                
                # Sort dates in descending order
                parsed_dates.sort(reverse=True)
                
                today = datetime.now().date()
                streak = 0
                
                # Check if there's an entry today or yesterday (to account for different timezones)
                most_recent = parsed_dates[0]
                days_since_last = (today - most_recent).days
                
                if days_since_last > 1:
                    # No recent entries, streak is broken
                    return 0
                
                # Count consecutive days
                expected_date = most_recent
                for date in parsed_dates:
                    if date == expected_date:
                        streak += 1
                        expected_date = date - timedelta(days=1)
                    else:
                        break
                
                return streak
                
            except Exception:
                # If there's any error in date parsing, return 0
                return 0
    
    def _insert_default_groups(self):
        """Insert default groups and options if they don't exist"""
        default_groups = {
            'Emotions': ['happy', 'excited', 'grateful', 'relaxed', 'content', 'tired', 'unsure', 'bored', 'anxious', 'angry', 'stressed', 'sad', 'desperate'],
            'Sleep': ['well-rested', 'refreshed', 'tired', 'exhausted', 'restless', 'insomniac'],
            'Productivity': ['focused', 'motivated', 'accomplished', 'busy', 'distracted', 'procrastinating', 'overwhelmed', 'lazy']
        }
        
        with sqlite3.connect(self.db_path) as conn:
            for group_name, options in default_groups.items():
                # Check if group exists
                cursor = conn.execute('SELECT id FROM groups WHERE name = ?', (group_name,))
                group_row = cursor.fetchone()
                
                if not group_row:
                    # Insert group
                    cursor = conn.execute('INSERT INTO groups (name) VALUES (?)', (group_name,))
                    group_id = cursor.lastrowid
                    
                    # Insert options
                    for option in options:
                        conn.execute('INSERT INTO group_options (group_id, name) VALUES (?, ?)', (group_id, option))
            
            conn.commit()
    
    def get_all_groups(self) -> List[Dict]:
        """Get all groups with their options"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            
            # Get all groups
            cursor = conn.execute('SELECT id, name FROM groups ORDER BY name')
            groups = []
            
            for group_row in cursor.fetchall():
                group = dict(group_row)
                
                # Get options for this group
                options_cursor = conn.execute('''
                    SELECT id, name FROM group_options 
                    WHERE group_id = ? 
                    ORDER BY name
                ''', (group['id'],))
                
                group['options'] = [dict(option_row) for option_row in options_cursor.fetchall()]
                groups.append(group)
            
            return groups
    
    def create_group(self, name: str) -> int:
        """Create a new group and return its ID"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('INSERT INTO groups (name) VALUES (?)', (name,))
            conn.commit()
            return cursor.lastrowid
    
    def create_group_option(self, group_id: int, name: str) -> int:
        """Create a new option for a group and return its ID"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('INSERT INTO group_options (group_id, name) VALUES (?, ?)', (group_id, name))
            conn.commit()
            return cursor.lastrowid
    
    def delete_group(self, group_id: int) -> bool:
        """Delete a group and all its options"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('DELETE FROM groups WHERE id = ?', (group_id,))
            conn.commit()
            return cursor.rowcount > 0
    
    def delete_group_option(self, option_id: int) -> bool:
        """Delete a group option"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('DELETE FROM group_options WHERE id = ?', (option_id,))
            conn.commit()
            return cursor.rowcount > 0
    
    def add_entry_selections(self, entry_id: int, option_ids: List[int]):
        """Add selected options for an entry"""
        with sqlite3.connect(self.db_path) as conn:
            for option_id in option_ids:
                conn.execute('INSERT INTO entry_selections (entry_id, option_id) VALUES (?, ?)', (entry_id, option_id))
            conn.commit()
    
    def get_entry_selections(self, entry_id: int) -> List[Dict]:
        """Get selected options for an entry"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute('''
                SELECT go.id, go.name, g.name as group_name
                FROM entry_selections es
                JOIN group_options go ON es.option_id = go.id
                JOIN groups g ON go.group_id = g.id
                WHERE es.entry_id = ?
                ORDER BY g.name, go.name
            ''', (entry_id,))
            return [dict(row) for row in cursor.fetchall()]