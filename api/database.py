import sqlite3
import os
from datetime import datetime
from typing import List, Dict, Optional


class MoodDatabase:
    def __init__(self, db_path: Optional[str] = None):
        if db_path is None:
            # Create database in the data directory
            data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
            os.makedirs(data_dir, exist_ok=True)
            db_path = os.path.join(data_dir, "nightlio.db")

        self.db_path = db_path

        # Ensure directory exists for the database file
        db_dir = os.path.dirname(self.db_path)
        if db_dir:  # Only create directory if path has a directory component
            os.makedirs(db_dir, exist_ok=True)

        self.init_database()

    def init_database(self):
        """Initialize the database with required tables"""
        try:
            print(f"Initializing database at: {self.db_path}")
            with sqlite3.connect(self.db_path) as conn:
                print("Database connection successful. Creating tables...")
                # Create users table
                conn.execute(
                    """
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    google_id TEXT UNIQUE NOT NULL,
                    email TEXT NOT NULL,
                    name TEXT NOT NULL,
                    avatar_url TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """
                )
                print("✅ Users table created")

                # Create mood_entries table with user_id
                conn.execute(
                    """
                CREATE TABLE IF NOT EXISTS mood_entries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    date TEXT NOT NULL,
                    mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 5),
                    content TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            """
                )
                print("✅ Mood entries table created")

                # Create groups table
                conn.execute(
                    """
                CREATE TABLE IF NOT EXISTS groups (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """
                )
                print("✅ Groups table created")

                # Create group options table
                conn.execute(
                    """
                CREATE TABLE IF NOT EXISTS group_options (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    group_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE
                )
            """
                )
                print("✅ Group options table created")

                # Create table to store selected options for each entry
                conn.execute(
                    """
                CREATE TABLE IF NOT EXISTS entry_selections (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    entry_id INTEGER NOT NULL,
                    option_id INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (entry_id) REFERENCES mood_entries (id) ON DELETE CASCADE,
                    FOREIGN KEY (option_id) REFERENCES group_options (id) ON DELETE CASCADE
                )
            """
                )
                print("✅ Entry selections table created")

                # Create achievements table
                conn.execute(
                    """
                CREATE TABLE IF NOT EXISTS achievements (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    achievement_type TEXT NOT NULL,
                    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    nft_minted BOOLEAN DEFAULT FALSE,
                    nft_token_id INTEGER,
                    nft_tx_hash TEXT,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                    UNIQUE(user_id, achievement_type)
                )
            """
                )
                print("✅ Achievements table created")

                # Create index for faster date queries
                conn.execute(
                    """
                CREATE INDEX IF NOT EXISTS idx_mood_entries_date 
                ON mood_entries(date)
            """
                )
                print("✅ Database indexes created")
                conn.commit()
                print("✅ Database initialization complete")

                # Insert default groups and options if they don't exist
                self._insert_default_groups()

                # Create goals table (idempotent)
                try:
                    conn.execute(
                        """
                    CREATE TABLE IF NOT EXISTS goals (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        title TEXT NOT NULL,
                        description TEXT,
                        frequency_per_week INTEGER NOT NULL CHECK (frequency_per_week >= 1 AND frequency_per_week <= 7),
                        completed INTEGER NOT NULL DEFAULT 0,
                        streak INTEGER NOT NULL DEFAULT 0,
                        period_start TEXT, -- ISO date (YYYY-MM-DD) for current week start (Monday)
                        last_completed_date TEXT, -- ISO date of last completion to enforce 1/day
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                    )
                    """
                    )
                    # Backfill column if database existed before adding last_completed_date
                    try:
                        cur = conn.execute("PRAGMA table_info(goals)")
                        cols = {row[1] for row in cur.fetchall()}
                        if "last_completed_date" not in cols:
                            conn.execute(
                                "ALTER TABLE goals ADD COLUMN last_completed_date TEXT"
                            )
                    except Exception:
                        pass
                    conn.execute(
                        """
                    CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id)
                    """
                    )
                    print("✅ Goals table created")
                except Exception as _:
                    # Best-effort; continue so app remains usable
                    pass

                # Create goal_completions table to track per-day completions
                try:
                    conn.execute(
                        """
                    CREATE TABLE IF NOT EXISTS goal_completions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        goal_id INTEGER NOT NULL,
                        date TEXT NOT NULL, -- ISO date YYYY-MM-DD
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                        FOREIGN KEY (goal_id) REFERENCES goals (id) ON DELETE CASCADE,
                        UNIQUE(user_id, goal_id, date)
                    )
                    """
                    )
                    conn.execute(
                        "CREATE INDEX IF NOT EXISTS idx_goal_completions_user_goal ON goal_completions(user_id, goal_id)"
                    )
                    conn.execute(
                        "CREATE INDEX IF NOT EXISTS idx_goal_completions_date ON goal_completions(date)"
                    )
                    print("✅ Goal completions table created")
                except Exception:
                    pass

        except Exception as e:
            print(f"❌ Database initialization failed: {str(e)}")
            print(f"Database path: {self.db_path}")
            print(
                f"Database directory exists: {os.path.exists(os.path.dirname(self.db_path))}"
            )
            print(
                f"Database directory writable: {os.access(os.path.dirname(self.db_path), os.W_OK)}"
            )
            raise

    def _connect(self) -> sqlite3.Connection:
        """Create a SQLite connection with safe defaults.

        - Enables foreign keys.
        """
        conn = sqlite3.connect(self.db_path)
        try:
            conn.execute("PRAGMA foreign_keys=ON")
        except Exception:
            pass
        return conn

    # -------------------- Goals API --------------------
    @staticmethod
    def _week_start_iso(date_obj=None) -> str:
        from datetime import datetime, timedelta, date

        if date_obj is None:
            date_obj = datetime.now().date()
        # Monday as start of the week
        start = date_obj - timedelta(days=date_obj.weekday())
        return start.strftime("%Y-%m-%d")

    def _rollover_goal_if_needed(self, conn: sqlite3.Connection, goal_row: sqlite3.Row) -> Dict:
        """If the stored period_start is from a previous week, roll the goal forward.

        - Resets `completed` to 0 for the new week.
        - Updates `streak` if the previous week met the target; otherwise resets streak to 0.
        - Sets `period_start` to current week start.

        Returns a dict for the up-to-date goal (and persists the change).
        """
        from datetime import datetime

        today_start = self._week_start_iso()
        d = dict(goal_row)
        # No rollover needed
        if (d.get("period_start") or "") == today_start:
            # Maintain derived flag for convenience
            today_str = datetime.now().strftime("%Y-%m-%d")
            d["already_completed_today"] = d.get("last_completed_date") == today_str
            return d

        # Compute next state based on previous week's performance
        current_completed = int(d.get("completed") or 0)
        freq = int(d.get("frequency_per_week") or 0)
        streak = int(d.get("streak") or 0)

        if freq > 0 and current_completed >= freq:
            streak += 1
        else:
            streak = 0

        # Reset for new week
        new_completed = 0
        conn.execute(
            """
            UPDATE goals
            SET completed = ?, streak = ?, period_start = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
            """,
            (new_completed, streak, today_start, d["id"], d["user_id"]),
        )
        conn.commit()

        # Return fresh row
        conn.row_factory = sqlite3.Row
        updated = conn.execute(
            """
            SELECT id, user_id, title, description, frequency_per_week, completed, streak, period_start, last_completed_date, created_at, updated_at
            FROM goals WHERE id = ? AND user_id = ?
            """,
            (d["id"], d["user_id"]),
        ).fetchone()
        out = dict(updated) if updated else d
        today_str = datetime.now().strftime("%Y-%m-%d")
        out["already_completed_today"] = out.get("last_completed_date") == today_str
        return out

    def create_goal(
        self, user_id: int, title: str, description: str, frequency_per_week: int
    ) -> int:
        if not title or not title.strip():
            raise ValueError("Title is required")
        if frequency_per_week < 1 or frequency_per_week > 7:
            raise ValueError("frequency_per_week must be between 1 and 7")
        period_start = self._week_start_iso()
        with self._connect() as conn:
            cursor = conn.execute(
                """
                INSERT INTO goals (user_id, title, description, frequency_per_week, completed, streak, period_start)
                VALUES (?, ?, ?, ?, 0, 0, ?)
                """,
                (
                    user_id,
                    title.strip(),
                    (description or "").strip(),
                    frequency_per_week,
                    period_start,
                ),
            )
            conn.commit()
            return int(cursor.lastrowid or 0)

    def get_goals(self, user_id: int) -> List[Dict]:
        with self._connect() as conn:
            conn.row_factory = sqlite3.Row
            rows = conn.execute(
                """
                SELECT id, user_id, title, description, frequency_per_week, completed, streak, period_start, last_completed_date, created_at, updated_at
                FROM goals WHERE user_id = ? ORDER BY created_at DESC
                """,
                (user_id,),
            ).fetchall()
            results: List[Dict] = []
            for r in rows:
                # Ensure week rollover so UI resets at new week start without user action
                updated = self._rollover_goal_if_needed(conn, r)
                results.append(updated)
            return results

    def get_goal_by_id(self, user_id: int, goal_id: int) -> Optional[Dict]:
        with self._connect() as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute(
                """
                SELECT id, user_id, title, description, frequency_per_week, completed, streak, period_start, last_completed_date, created_at, updated_at
                FROM goals WHERE id = ? AND user_id = ?
                """,
                (goal_id, user_id),
            ).fetchone()
            if not row:
                return None
            # Apply rollover so single-goal fetch is also up-to-date
            return self._rollover_goal_if_needed(conn, row)

    def update_goal(
        self,
        user_id: int,
        goal_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,
        frequency_per_week: Optional[int] = None,
    ) -> bool:
        updates = []
        params: List = []
        if title is not None:
            updates.append("title = ?")
            params.append(title.strip())
        if description is not None:
            updates.append("description = ?")
            params.append(description.strip())
        if frequency_per_week is not None:
            if frequency_per_week < 1 or frequency_per_week > 7:
                raise ValueError("frequency_per_week must be between 1 and 7")
            updates.append("frequency_per_week = ?")
            params.append(frequency_per_week)
            # When frequency changes, optionally clamp completed to new total
            updates.append("completed = MIN(completed, ?)")
            params.append(frequency_per_week)
        if not updates:
            return False
        updates.append("updated_at = CURRENT_TIMESTAMP")
        params.extend([goal_id, user_id])
        with self._connect() as conn:
            cur = conn.execute(
                f"""UPDATE goals SET {', '.join(updates)} WHERE id = ? AND user_id = ?""",
                params,
            )
            conn.commit()
            return cur.rowcount > 0

    def delete_goal(self, user_id: int, goal_id: int) -> bool:
        with self._connect() as conn:
            cur = conn.execute(
                "DELETE FROM goals WHERE id = ? AND user_id = ?", (goal_id, user_id)
            )
            conn.commit()
            return cur.rowcount > 0

    def increment_goal_progress(self, user_id: int, goal_id: int) -> Optional[Dict]:
        from datetime import datetime

        today_start = self._week_start_iso()
        today_str = datetime.now().strftime("%Y-%m-%d")
        with self._connect() as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute(
                "SELECT * FROM goals WHERE id = ? AND user_id = ?", (goal_id, user_id)
            ).fetchone()
            if not row:
                return None
            # Ensure rollover first so increment logic always works on current week
            goal = self._rollover_goal_if_needed(conn, row)
            current_completed = int(goal.get("completed") or 0)
            freq = int(goal.get("frequency_per_week") or 0)
            streak = int(goal.get("streak") or 0)
            period_start = goal.get("period_start")
            last_completed_date = goal.get("last_completed_date")
            # Enforce once per day per goal
            did_increment = False
            if last_completed_date == today_str:
                # Already completed today; nothing to do
                pass
            else:
                if current_completed < freq:
                    # Increment count and mark completion date
                    current_completed += 1
                    last_completed_date = today_str
                    did_increment = True
                else:
                    # Weekly target already met, but still record today's completion to lock the UI
                    last_completed_date = today_str
            conn.execute(
                """
                UPDATE goals
                SET completed = ?, streak = ?, period_start = ?, last_completed_date = COALESCE(?, last_completed_date), updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND user_id = ?
                """,
                (
                    current_completed,
                    streak,
                    period_start,
                    last_completed_date,
                    goal_id,
                    user_id,
                ),
            )
            # Record today's completion in goal_completions (idempotent)
            try:
                if last_completed_date == today_str:
                    conn.execute(
                        "INSERT OR IGNORE INTO goal_completions (user_id, goal_id, date) VALUES (?, ?, ?)",
                        (user_id, goal_id, today_str),
                    )
            except Exception:
                pass
            conn.commit()
            updated = conn.execute(
                "SELECT id, user_id, title, description, frequency_per_week, completed, streak, period_start, last_completed_date, created_at, updated_at FROM goals WHERE id = ? AND user_id = ?",
                (goal_id, user_id),
            ).fetchone()
            result = dict(updated) if updated else None
            if result is not None:
                # Consider completed today if last_completed_date == today
                result["already_completed_today"] = (
                    result.get("last_completed_date") == today_str
                )
            return result

    def get_goal_completions(
        self,
        user_id: int,
        goal_id: int,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> List[Dict]:
        """Return list of completion dates for a goal within an optional date range.
        Dates are ISO strings YYYY-MM-DD. If no range provided, returns last 90 days.
        """
        from datetime import datetime, timedelta

        with self._connect() as conn:
            conn.row_factory = sqlite3.Row
            if not start_date or not end_date:
                end = datetime.now().date()
                start = end - timedelta(days=90)
                start_date = start.strftime("%Y-%m-%d")
                end_date = end.strftime("%Y-%m-%d")
            rows = conn.execute(
                "SELECT date FROM goal_completions WHERE user_id = ? AND goal_id = ? AND date BETWEEN ? AND ? ORDER BY date ASC",
                (user_id, goal_id, start_date, end_date),
            ).fetchall()
            return [dict(row) for row in rows]

    def add_mood_entry(
        self,
        user_id: int,
        date: str,
        mood: int,
        content: str,
        time: Optional[str] = None,
        selected_options: Optional[List[int]] = None,
    ) -> int:
        """Add a new mood entry and return the entry ID"""
        with sqlite3.connect(self.db_path) as conn:
            if time:
                cursor = conn.execute(
                    """
                    INSERT INTO mood_entries (user_id, date, mood, content, created_at)
                    VALUES (?, ?, ?, ?, ?)
                """,
                    (user_id, date, mood, content, time),
                )
            else:
                cursor = conn.execute(
                    """
                    INSERT INTO mood_entries (user_id, date, mood, content)
                    VALUES (?, ?, ?, ?)
                """,
                    (user_id, date, mood, content),
                )

            entry_id = cursor.lastrowid

            # Add selected options if provided
            if selected_options:
                for option_id in selected_options:
                    conn.execute(
                        "INSERT INTO entry_selections (entry_id, option_id) VALUES (?, ?)",
                        (entry_id, option_id),
                    )

            conn.commit()
            # lastrowid should always be set after INSERT; assert not None for type checkers
            return int(entry_id if entry_id is not None else 0)

    def get_all_mood_entries(self, user_id: int) -> List[Dict]:
        """Get all mood entries for a user ordered by created_at (newest first)"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute(
                """
                SELECT id, date, mood, content, created_at, updated_at
                FROM mood_entries
                WHERE user_id = ?
                ORDER BY created_at DESC, date DESC
            """,
                (user_id,),
            )
            return [dict(row) for row in cursor.fetchall()]

    def get_mood_entries_by_date_range(
        self, user_id: int, start_date: str, end_date: str
    ) -> List[Dict]:
        """Get mood entries within a date range for a user"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute(
                """
                SELECT id, date, mood, content, created_at, updated_at
                FROM mood_entries
                WHERE user_id = ? AND date BETWEEN ? AND ?
                ORDER BY created_at DESC, date DESC
            """,
                (user_id, start_date, end_date),
            )
            return [dict(row) for row in cursor.fetchall()]

    def get_mood_entry_by_id(self, user_id: int, entry_id: int) -> Optional[Dict]:
        """Get a specific mood entry by ID for a user"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute(
                """
                SELECT id, date, mood, content, created_at, updated_at
                FROM mood_entries
                WHERE id = ? AND user_id = ?
            """,
                (entry_id, user_id),
            )
            row = cursor.fetchone()
            return dict(row) if row else None

    def update_mood_entry(
        self,
        user_id: int,
        entry_id: int,
        mood: Optional[int] = None,
        content: Optional[str] = None,
        date: Optional[str] = None,
        time: Optional[str] = None,
        selected_options: Optional[List[int]] = None,
    ) -> bool:
        """Update an existing mood entry for a user"""
        updates: List[str] = []
        params: List[object] = []

        if mood is not None:
            updates.append("mood = ?")
            params.append(mood)

        if content is not None:
            updates.append("content = ?")
            params.append(content)

        if date is not None:
            updates.append("date = ?")
            params.append(date)

        if time is not None:
            updates.append("created_at = ?")
            params.append(time)

        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row

            cursor = conn.execute(
                "SELECT id FROM mood_entries WHERE id = ? AND user_id = ?",
                (entry_id, user_id),
            )
            row = cursor.fetchone()
            if not row:
                return False

            updated = False

            if updates:
                updates.append("updated_at = CURRENT_TIMESTAMP")
                update_cursor = conn.execute(
                    f"""
                    UPDATE mood_entries
                    SET {", ".join(updates)}
                    WHERE id = ? AND user_id = ?
                """,
                    params + [entry_id, user_id],
                )
                updated = True
            else:
                # Even if only selections change, bump updated_at for auditing
                conn.execute(
                    """
                    UPDATE mood_entries
                    SET updated_at = CURRENT_TIMESTAMP
                    WHERE id = ? AND user_id = ?
                """,
                    (entry_id, user_id),
                )

            if selected_options is not None:
                conn.execute(
                    "DELETE FROM entry_selections WHERE entry_id = ?",
                    (entry_id,),
                )
                if selected_options:
                    conn.executemany(
                        "INSERT INTO entry_selections (entry_id, option_id) VALUES (?, ?)",
                        [(entry_id, option_id) for option_id in selected_options],
                    )
                updated = True

            conn.commit()
            return updated or bool(selected_options is not None)

    def delete_mood_entry(self, user_id: int, entry_id: int) -> bool:
        """Delete a mood entry by ID for a user"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                """
                DELETE FROM mood_entries WHERE id = ? AND user_id = ?
            """,
                (entry_id, user_id),
            )
            conn.commit()
            return cursor.rowcount > 0

    def get_mood_statistics(self, user_id: int) -> Dict:
        """Get mood statistics for a specific user"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                """
                SELECT 
                    COUNT(*) as total_entries,
                    AVG(mood) as average_mood,
                    MIN(mood) as lowest_mood,
                    MAX(mood) as highest_mood,
                    MIN(date) as first_entry_date,
                    MAX(date) as last_entry_date
                FROM mood_entries
                WHERE user_id = ?
            """,
                (user_id,),
            )
            row = cursor.fetchone()

            if row and row[0] > 0:  # total_entries > 0
                return {
                    "total_entries": row[0],
                    "average_mood": round(row[1], 2) if row[1] else 0,
                    "lowest_mood": row[2],
                    "highest_mood": row[3],
                    "first_entry_date": row[4],
                    "last_entry_date": row[5],
                }
            else:
                return {
                    "total_entries": 0,
                    "average_mood": 0,
                    "lowest_mood": None,
                    "highest_mood": None,
                    "first_entry_date": None,
                    "last_entry_date": None,
                }

    def get_mood_counts(self, user_id: int) -> Dict[int, int]:
        """Get count of each mood level for a specific user"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                """
                SELECT mood, COUNT(*) as count
                FROM mood_entries
                WHERE user_id = ?
                GROUP BY mood
                ORDER BY mood
            """,
                (user_id,),
            )
            return {row[0]: row[1] for row in cursor.fetchall()}

    def get_current_streak(self, user_id: int) -> int:
        """Calculate the current consecutive days streak for a specific user"""
        with sqlite3.connect(self.db_path) as conn:
            # Get distinct dates with entries, ordered by date descending
            cursor = conn.execute(
                """
                SELECT DISTINCT date
                FROM mood_entries
                WHERE user_id = ?
                ORDER BY date DESC
            """,
                (user_id,),
            )
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
                        parsed_date = datetime.strptime(date_str, "%m/%d/%Y").date()
                        parsed_dates.append(parsed_date)
                    except ValueError:
                        try:
                            # Try M/D/YYYY format
                            parsed_date = datetime.strptime(date_str, "%m/%d/%Y").date()
                            parsed_dates.append(parsed_date)
                        except ValueError:
                            try:
                                # Try YYYY-MM-DD format
                                parsed_date = datetime.strptime(
                                    date_str, "%Y-%m-%d"
                                ).date()
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
            "Emotions": [
                "happy",
                "excited",
                "grateful",
                "relaxed",
                "content",
                "tired",
                "unsure",
                "bored",
                "anxious",
                "angry",
                "stressed",
                "sad",
                "desperate",
            ],
            "Sleep": [
                "well-rested",
                "refreshed",
                "tired",
                "exhausted",
                "restless",
                "insomniac",
            ],
            "Productivity": [
                "focused",
                "motivated",
                "accomplished",
                "busy",
                "distracted",
                "procrastinating",
                "overwhelmed",
                "lazy",
            ],
        }

        with sqlite3.connect(self.db_path) as conn:
            for group_name, options in default_groups.items():
                # Check if group exists
                cursor = conn.execute(
                    "SELECT id FROM groups WHERE name = ?", (group_name,)
                )
                group_row = cursor.fetchone()

                if not group_row:
                    # Insert group
                    cursor = conn.execute(
                        "INSERT INTO groups (name) VALUES (?)", (group_name,)
                    )
                    group_id = cursor.lastrowid

                    # Insert options
                    for option in options:
                        conn.execute(
                            "INSERT INTO group_options (group_id, name) VALUES (?, ?)",
                            (group_id, option),
                        )

            conn.commit()

    def get_all_groups(self) -> List[Dict]:
        """Get all groups with their options"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row

            # Get all groups
            cursor = conn.execute("SELECT id, name FROM groups ORDER BY name")
            groups = []

            for group_row in cursor.fetchall():
                group = dict(group_row)

                # Get options for this group
                options_cursor = conn.execute(
                    """
                    SELECT id, name FROM group_options 
                    WHERE group_id = ? 
                    ORDER BY name
                """,
                    (group["id"],),
                )

                group["options"] = [
                    dict(option_row) for option_row in options_cursor.fetchall()
                ]
                groups.append(group)

            return groups

    def create_group(self, name: str) -> int:
        """Create a new group and return its ID"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("INSERT INTO groups (name) VALUES (?)", (name,))
            conn.commit()
            return int(cursor.lastrowid or 0)

    def create_group_option(self, group_id: int, name: str) -> int:
        """Create a new option for a group and return its ID"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "INSERT INTO group_options (group_id, name) VALUES (?, ?)",
                (group_id, name),
            )
            conn.commit()
            return int(cursor.lastrowid or 0)

    def delete_group(self, group_id: int) -> bool:
        """Delete a group and all its options"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("DELETE FROM groups WHERE id = ?", (group_id,))
            conn.commit()
            return cursor.rowcount > 0

    def delete_group_option(self, option_id: int) -> bool:
        """Delete a group option"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "DELETE FROM group_options WHERE id = ?", (option_id,)
            )
            conn.commit()
            return cursor.rowcount > 0

    def add_entry_selections(self, entry_id: int, option_ids: List[int]):
        """Add selected options for an entry"""
        with sqlite3.connect(self.db_path) as conn:
            for option_id in option_ids:
                conn.execute(
                    "INSERT INTO entry_selections (entry_id, option_id) VALUES (?, ?)",
                    (entry_id, option_id),
                )
            conn.commit()

    def get_entry_selections(self, entry_id: int) -> List[Dict]:
        """Get selected options for an entry"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute(
                """
                SELECT go.id, go.name, g.name as group_name
                FROM entry_selections es
                JOIN group_options go ON es.option_id = go.id
                JOIN groups g ON go.group_id = g.id
                WHERE es.entry_id = ?
                ORDER BY g.name, go.name
            """,
                (entry_id,),
            )
            return [dict(row) for row in cursor.fetchall()]

    # User management functions
    def create_user(
        self, google_id: str, email: str, name: str, avatar_url: Optional[str] = None
    ) -> int:
        """Create a new user and return user ID"""
        with self._connect() as conn:
            cursor = conn.execute(
                """
                INSERT INTO users (google_id, email, name, avatar_url)
                VALUES (?, ?, ?, ?)
                """,
                (google_id, email, name, avatar_url),
            )
            conn.commit()
            return int(cursor.lastrowid or 0)

    def get_user_by_google_id(self, google_id: str) -> Optional[Dict]:
        """Get user by Google ID"""
        with self._connect() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute(
                """
                SELECT id, google_id, email, name, avatar_url, created_at, last_login
                FROM users
                WHERE google_id = ?
                """,
                (google_id,),
            )
            row = cursor.fetchone()
            return dict(row) if row else None

    def get_user_by_id(self, user_id: int) -> Optional[Dict]:
        """Get user by ID"""
        with self._connect() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute(
                """
                SELECT id, google_id, email, name, avatar_url, created_at, last_login
                FROM users
                WHERE id = ?
                """,
                (user_id,),
            )
            row = cursor.fetchone()
            return dict(row) if row else None

    def update_user_last_login(self, user_id: int):
        """Update user's last login timestamp"""
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE users 
                SET last_login = CURRENT_TIMESTAMP
                WHERE id = ?
            """,
                (user_id,),
            )
            conn.commit()

    def upsert_user_by_google_id(
        self,
        google_id: str,
        email: Optional[str],
        name: Optional[str],
        avatar_url: Optional[str] = None,
    ) -> Optional[Dict]:
        """Idempotently insert or update a user by google_id and return the row.

        Uses a single transaction with BEGIN IMMEDIATE and ON CONFLICT upsert to be race-safe.
        """
        with self._connect() as conn:
            conn.row_factory = sqlite3.Row
            # Lock for write to avoid race conditions on the unique index
            conn.execute("BEGIN IMMEDIATE")
            try:
                try:
                    cursor = conn.execute(
                        """
                        INSERT INTO users (google_id, email, name, avatar_url)
                        VALUES (?, ?, ?, ?)
                        ON CONFLICT(google_id) DO UPDATE SET
                          email=COALESCE(excluded.email, users.email),
                          name=COALESCE(excluded.name, users.name),
                          avatar_url=COALESCE(excluded.avatar_url, users.avatar_url),
                          last_login=CURRENT_TIMESTAMP
                        RETURNING id, google_id, email, name, avatar_url, created_at, last_login
                        """,
                        (google_id, email, name, avatar_url),
                    )
                    row = cursor.fetchone()
                except sqlite3.OperationalError:
                    # Fallback for older SQLite without RETURNING
                    conn.execute(
                        """
                        INSERT INTO users (google_id, email, name, avatar_url)
                        VALUES (?, ?, ?, ?)
                        ON CONFLICT(google_id) DO UPDATE SET
                          email=COALESCE(excluded.email, users.email),
                          name=COALESCE(excluded.name, users.name),
                          avatar_url=COALESCE(excluded.avatar_url, users.avatar_url),
                          last_login=CURRENT_TIMESTAMP
                        """,
                        (google_id, email, name, avatar_url),
                    )
                    row = conn.execute(
                        "SELECT id, google_id, email, name, avatar_url, created_at, last_login FROM users WHERE google_id = ?",
                        (google_id,),
                    ).fetchone()

                conn.commit()
                return dict(row) if row else None
            except Exception:
                conn.rollback()
                raise

    # Achievement management functions
    def add_achievement(self, user_id: int, achievement_type: str) -> Optional[int]:
        """Add an achievement for a user (if not already earned)"""
        with sqlite3.connect(self.db_path) as conn:
            try:
                cursor = conn.execute(
                    """
                    INSERT INTO achievements (user_id, achievement_type)
                    VALUES (?, ?)
                """,
                    (user_id, achievement_type),
                )
                conn.commit()
                return int(cursor.lastrowid or 0)
            except sqlite3.IntegrityError:
                # Achievement already exists
                return None

    def get_user_achievements(self, user_id: int) -> List[Dict]:
        """Get all achievements for a user"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute(
                """
                SELECT id, achievement_type, earned_at, nft_minted, nft_token_id, nft_tx_hash
                FROM achievements
                WHERE user_id = ?
                ORDER BY earned_at DESC
            """,
                (user_id,),
            )
            return [dict(row) for row in cursor.fetchall()]

    def update_achievement_nft(self, achievement_id: int, token_id: int, tx_hash: str):
        """Update achievement with NFT minting information"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                """
                UPDATE achievements 
                SET nft_minted = TRUE, nft_token_id = ?, nft_tx_hash = ?
                WHERE id = ?
            """,
                (token_id, tx_hash, achievement_id),
            )
            conn.commit()

    def check_achievements(self, user_id: int) -> List[str]:
        """Check and award new achievements for a user"""
        new_achievements = []

        with sqlite3.connect(self.db_path) as conn:
            # Get user stats
            cursor = conn.execute(
                """
                SELECT COUNT(*) as total_entries
                FROM mood_entries
                WHERE user_id = ?
            """,
                (user_id,),
            )
            total_entries = cursor.fetchone()[0]

            # Get current streak
            current_streak = self.get_current_streak(user_id)

            # Get stats views (we'll need to track this separately)
            # For now, we'll skip this achievement

            # Check achievements
            achievements_to_check = [
                ("first_entry", total_entries >= 1),
                ("week_warrior", current_streak >= 7),
                ("consistency_king", current_streak >= 30),
                ("mood_master", total_entries >= 100),
            ]

            for achievement_type, condition in achievements_to_check:
                if condition:
                    achievement_id = self.add_achievement(user_id, achievement_type)
                    if achievement_id:  # New achievement
                        new_achievements.append(achievement_type)

        return new_achievements
