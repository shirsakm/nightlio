import sqlite3
import os
import logging
import time
from datetime import datetime, timedelta, date
from typing import List, Dict, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DatabaseError(Exception):
    """Custom exception for database operations."""
    pass


# SQL Query Constants
class SQLQueries:
    """Constants for SQL queries to improve maintainability."""
    
    # User queries
    CREATE_USER = """
        INSERT INTO users (google_id, email, name, avatar_url)
        VALUES (?, ?, ?, ?)
    """
    
    GET_USER_BY_GOOGLE_ID = """
        SELECT id, google_id, email, name, avatar_url, created_at, last_login
        FROM users WHERE google_id = ?
    """
    
    GET_USER_BY_ID = """
        SELECT id, google_id, email, name, avatar_url, created_at, last_login
        FROM users WHERE id = ?
    """
    
    UPSERT_USER = """
        INSERT INTO users (google_id, email, name, avatar_url)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(google_id) DO UPDATE SET
          email=COALESCE(excluded.email, users.email),
          name=COALESCE(excluded.name, users.name),
          avatar_url=COALESCE(excluded.avatar_url, users.avatar_url),
          last_login=CURRENT_TIMESTAMP
    """
    
    # Goals queries
    GET_GOALS_BY_USER = """
        SELECT id, user_id, title, description, frequency_per_week, completed, 
               streak, period_start, last_completed_date, created_at, updated_at
        FROM goals WHERE user_id = ? ORDER BY created_at DESC
    """
    
    GET_GOAL_BY_ID = """
        SELECT id, user_id, title, description, frequency_per_week, completed, 
               streak, period_start, last_completed_date, created_at, updated_at
        FROM goals WHERE id = ? AND user_id = ?
    """
    
    # Mood entries queries
    GET_USER_ENTRY_DATES = """
        SELECT DISTINCT date
        FROM mood_entries
        WHERE user_id = ?
        ORDER BY date DESC
    """
    
    GET_MOOD_STATISTICS = """
        SELECT 
            COUNT(*) as total_entries,
            AVG(mood) as average_mood,
            MIN(mood) as lowest_mood,
            MAX(mood) as highest_mood,
            MIN(date) as first_entry_date,
            MAX(date) as last_entry_date
        FROM mood_entries
        WHERE user_id = ?
    """


class MoodDatabase:
    """
    Main database class for the Nightlio mood tracking application.
    
    This class provides a comprehensive interface for managing users, mood entries,
    goals, achievements, and related data. It uses SQLite as the underlying database
    and provides methods for CRUD operations, analytics, and data integrity.
    
    Features:
    - User management with Google OAuth integration
    - Mood entry tracking with customizable groups and options
    - Goal setting and progress tracking with weekly rollover
    - Achievement system with progress calculation
    - Comprehensive error handling and logging
    
    Attributes:
        db_path (str): Path to the SQLite database file
    
    Example:
        >>> db = MoodDatabase()
        >>> user_id = db.create_user("google123", "user@example.com", "John Doe")
        >>> goal_id = db.create_goal(user_id, "Exercise", "Daily workout", 5)
    """
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
                
                # Create core tables
                self._create_users_table(conn)
                self._create_mood_entries_table(conn)
                self._create_groups_table(conn)
                self._create_group_options_table(conn)
                self._create_entry_selections_table(conn)
                self._create_achievements_table(conn)
                
                # Create goals related tables
                self._create_goals_table(conn)
                self._create_goal_completions_table(conn)
                self._create_user_metrics_table(conn)
                
                # Create indexes
                self._create_database_indexes(conn)
                
                conn.commit()
                print("✅ Database initialization complete")

                # Insert default groups and options if they don't exist
                self._insert_default_groups()

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

    def _create_users_table(self, conn: sqlite3.Connection):
        """Create the users table."""
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

    def _create_mood_entries_table(self, conn: sqlite3.Connection):
        """Create the mood_entries table."""
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

    def _create_groups_table(self, conn: sqlite3.Connection):
        """Create the groups table."""
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

    def _create_group_options_table(self, conn: sqlite3.Connection):
        """Create the group_options table."""
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

    def _create_entry_selections_table(self, conn: sqlite3.Connection):
        """Create the entry_selections table."""
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

    def _create_achievements_table(self, conn: sqlite3.Connection):
        """Create the achievements table."""
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

    def _create_goals_table(self, conn: sqlite3.Connection):
        """Create the goals table with proper error handling."""
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
            
            # Handle schema migration for existing databases
            self._migrate_goals_table_schema(conn)
            
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id)"
            )
            print("✅ Goals table created")
        except Exception:
            # Best-effort; continue so app remains usable
            print("⚠️  Goals table creation failed (non-critical)")

    def _migrate_goals_table_schema(self, conn: sqlite3.Connection):
        """Handle schema migration for goals table."""
        try:
            cur = conn.execute("PRAGMA table_info(goals)")
            cols = {row[1] for row in cur.fetchall()}
            if "last_completed_date" not in cols:
                conn.execute(
                    "ALTER TABLE goals ADD COLUMN last_completed_date TEXT"
                )
        except Exception:
            pass

    def _create_goal_completions_table(self, conn: sqlite3.Connection):
        """Create the goal_completions table."""
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
            print("⚠️  Goal completions table creation failed (non-critical)")

    def _create_user_metrics_table(self, conn: sqlite3.Connection):
        """Create the user_metrics table."""
        try:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS user_metrics (
                    user_id INTEGER PRIMARY KEY,
                    stats_views INTEGER NOT NULL DEFAULT 0,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
                """
            )
            print("✅ User metrics table created")
        except Exception:
            print("⚠️  User metrics table creation failed (non-critical)")

    def _create_database_indexes(self, conn: sqlite3.Connection):
        """Create database indexes for performance."""
        try:
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_mood_entries_date ON mood_entries(date)"
            )
            print("✅ Database indexes created")
        except Exception:
            print("⚠️  Index creation failed (non-critical)")

    def _connect(self) -> sqlite3.Connection:
        """Create a SQLite connection with safe defaults.

        Returns:
            sqlite3.Connection: Database connection with foreign keys enabled.
            
        Raises:
            DatabaseError: If connection fails.
        """
        try:
            conn = sqlite3.connect(self.db_path)
            conn.execute("PRAGMA foreign_keys=ON")
            return conn
        except sqlite3.Error as e:
            logger.error(f"Failed to connect to database: {e}")
            raise DatabaseError(f"Database connection failed: {e}")

    def _execute_with_retry(self, query: str, params: tuple = (), retries: int = 3) -> sqlite3.Cursor:
        """Execute a query with retry logic for handling database locks.
        
        Args:
            query: SQL query to execute
            params: Query parameters
            retries: Number of retries for locked database
            
        Returns:
            sqlite3.Cursor: Result cursor
            
        Raises:
            DatabaseError: If all retries fail
        """
        for attempt in range(retries):
            try:
                with self._connect() as conn:
                    return conn.execute(query, params)
            except sqlite3.OperationalError as e:
                if "database is locked" in str(e) and attempt < retries - 1:
                    logger.warning(f"Database locked, retrying... (attempt {attempt + 1})")
                    time.sleep(0.1 * (attempt + 1))  # Exponential backoff
                    continue
                logger.error(f"Database operation failed: {e}")
                raise DatabaseError(f"Database operation failed: {e}")
            except sqlite3.Error as e:
                logger.error(f"Database error: {e}")
                raise DatabaseError(f"Database error: {e}")
        
        raise DatabaseError("Database operation failed after all retries")

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
        """Create a new goal for a user.
        
        Args:
            user_id: The user ID
            title: Goal title (required, non-empty)
            description: Goal description (optional)
            frequency_per_week: Target completions per week (1-7)
            
        Returns:
            int: The ID of the created goal
            
        Raises:
            ValueError: If validation fails
            DatabaseError: If database operation fails
        """
        # Validate inputs
        if not isinstance(user_id, int) or user_id <= 0:
            raise ValueError("user_id must be a positive integer")
        if not title or not title.strip():
            raise ValueError("Title is required and cannot be empty")
        if not isinstance(frequency_per_week, int) or not (1 <= frequency_per_week <= 7):
            raise ValueError("frequency_per_week must be between 1 and 7")
            
        period_start = self._week_start_iso()
        
        try:
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
                goal_id = cursor.lastrowid
                if goal_id is None:
                    raise DatabaseError("Failed to get goal ID after creation")
                return int(goal_id)
        except sqlite3.Error as e:
            logger.error(f"Failed to create goal for user {user_id}: {e}")
            raise DatabaseError(f"Failed to create goal: {e}")

    def get_goals(self, user_id: int) -> List[Dict]:
        """Get all goals for a user with automatic week rollover.
        
        Args:
            user_id: The user ID
            
        Returns:
            List[Dict]: List of goal dictionaries with current progress
        """
        with self._connect() as conn:
            conn.row_factory = sqlite3.Row
            rows = conn.execute(SQLQueries.GET_GOALS_BY_USER, (user_id,)).fetchall()
            
            results: List[Dict] = []
            for r in rows:
                # Ensure week rollover so UI resets at new week start without user action
                updated = self._rollover_goal_if_needed(conn, r)
                results.append(updated)
            return results

    def get_goal_by_id(self, user_id: int, goal_id: int) -> Optional[Dict]:
        """Get a specific goal by ID with automatic week rollover.
        
        Args:
            user_id: The user ID
            goal_id: The goal ID
            
        Returns:
            Optional[Dict]: Goal dictionary or None if not found
        """
        with self._connect() as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute(SQLQueries.GET_GOAL_BY_ID, (goal_id, user_id)).fetchone()
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
        """Get mood statistics for a specific user.
        
        Args:
            user_id: The user ID
            
        Returns:
            Dict: Statistics including total entries, averages, etc.
        """
        with self._connect() as conn:
            cursor = conn.execute(SQLQueries.GET_MOOD_STATISTICS, (user_id,))
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

    # ---- User metrics (for achievements like Data Lover) ----
    def increment_stats_view(self, user_id: int) -> None:
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "INSERT INTO user_metrics (user_id, stats_views) VALUES (?, 1) ON CONFLICT(user_id) DO UPDATE SET stats_views = stats_views + 1, updated_at = CURRENT_TIMESTAMP",
                (user_id,),
            )
            conn.commit()

    def get_user_metrics(self, user_id: int) -> Dict:
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute(
                "SELECT user_id, stats_views, updated_at FROM user_metrics WHERE user_id = ?",
                (user_id,),
            ).fetchone()
            if not row:
                return {"user_id": user_id, "stats_views": 0}
            return dict(row)

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
        """Calculate the current consecutive days streak for a specific user.
        
        Args:
            user_id: The user ID to calculate streak for
            
        Returns:
            int: Number of consecutive days with mood entries
        """
        try:
            dates = self._get_user_entry_dates(user_id)
            if not dates:
                return 0
                
            parsed_dates = self._parse_date_strings(dates)
            if not parsed_dates:
                return 0
                
            return self._calculate_streak_from_dates(parsed_dates)
            
        except Exception as e:
            logger.warning(f"Error calculating streak for user {user_id}: {e}")
            return 0

    def _get_user_entry_dates(self, user_id: int) -> List[str]:
        """Get all distinct entry dates for a user."""
        with self._connect() as conn:
            cursor = conn.execute(SQLQueries.GET_USER_ENTRY_DATES, (user_id,))
            return [row[0] for row in cursor.fetchall()]

    def _parse_date_strings(self, date_strings: List[str]) -> List[date]:
        """Parse date strings in various formats to date objects."""
        parsed_dates = []
        date_formats = ["%m/%d/%Y", "%Y-%m-%d"]
        
        for date_str in date_strings:
            for fmt in date_formats:
                try:
                    parsed_date = datetime.strptime(date_str, fmt).date()
                    parsed_dates.append(parsed_date)
                    break
                except ValueError:
                    continue
            else:
                # Log unparseable dates but continue
                logger.debug(f"Could not parse date: {date_str}")
                
        return sorted(parsed_dates, reverse=True)

    def _calculate_streak_from_dates(self, parsed_dates: List[date]) -> int:
        """Calculate consecutive days streak from parsed dates."""
        if not parsed_dates:
            return 0
            
        today = datetime.now().date()
        most_recent = parsed_dates[0]
        
        # Check if streak is broken (no entry today or yesterday)
        days_since_last = (today - most_recent).days
        if days_since_last > 1:
            return 0
            
        # Count consecutive days
        streak = 0
        expected_date = most_recent
        
        for date in parsed_dates:
            if date == expected_date:
                streak += 1
                expected_date = date - timedelta(days=1)
            else:
                break
                
        return streak

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
            # Tracked in user_metrics
            metrics = self.get_user_metrics(user_id)
            stats_views = int(metrics.get("stats_views") or 0)

            # Check achievements
            achievements_to_check = [
                ("first_entry", total_entries >= 1),
                ("week_warrior", current_streak >= 7),
                ("consistency_king", current_streak >= 30),
                ("data_lover", stats_views >= 10),
                ("mood_master", total_entries >= 100),
            ]

            for achievement_type, condition in achievements_to_check:
                if condition:
                    achievement_id = self.add_achievement(user_id, achievement_type)
                    if achievement_id:  # New achievement
                        new_achievements.append(achievement_type)

        return new_achievements

    # Progress summary for achievements
    def get_achievements_progress(self, user_id: int) -> Dict[str, Dict[str, int]]:
        """Return progress/current-max per achievement for the user."""
        # Totals and streak
        stats = self.get_mood_statistics(user_id)
        total_entries = int(stats.get("total_entries") or 0)
        current_streak = int(self.get_current_streak(user_id) or 0)
        metrics = self.get_user_metrics(user_id)
        stats_views = int(metrics.get("stats_views") or 0)

        def clamp(v, m):
            return max(0, min(int(v), int(m)))

        progress = {
            "first_entry": {"current": clamp(total_entries, 1), "max": 1},
            "week_warrior": {"current": clamp(current_streak, 7), "max": 7},
            "consistency_king": {"current": clamp(current_streak, 30), "max": 30},
            "data_lover": {"current": clamp(stats_views, 10), "max": 10},
            "mood_master": {"current": clamp(total_entries, 100), "max": 100},
        }
        return progress
