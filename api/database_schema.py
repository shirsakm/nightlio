"""Database schema helpers for Nightlio."""

from __future__ import annotations

import sqlite3
from typing import Iterable

try:  # pragma: no cover - allow module to run outside package context
    from .database_common import DatabaseConnectionMixin, logger
except ImportError:  # pragma: no cover - fallback for scripts
    from database_common import DatabaseConnectionMixin, logger  # type: ignore


class DatabaseSchemaMixin(DatabaseConnectionMixin):
    """Provides table creation and bootstrap helpers."""

    def init_database(self) -> None:
        """Initialize the database with required tables and seed data."""
        try:
            logger.info("Initializing database at: %s", self.db_path)
            with sqlite3.connect(self.db_path) as conn:
                logger.info("Database connection successful. Creating tables...")

                # Core tables
                self._create_users_table(conn)
                self._create_mood_entries_table(conn)
                self._create_groups_table(conn)
                self._create_group_options_table(conn)
                self._create_entry_selections_table(conn)
                self._create_achievements_table(conn)

                # Goals and metrics
                self._create_goals_table(conn)
                self._create_goal_completions_table(conn)
                self._create_user_metrics_table(conn)

                # Shared indexes
                self._create_database_indexes(conn)

                conn.commit()
                logger.info("Database initialization complete")

            self._insert_default_groups()
        except Exception as exc:  # pragma: no cover - initialization rarely fails
            logger.error("Database initialization failed: %s", exc)
            raise

    # --- Table creation helpers -------------------------------------------------
    def _create_users_table(self, conn: sqlite3.Connection) -> None:
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
        logger.info("Users table ready")

    def _create_mood_entries_table(self, conn: sqlite3.Connection) -> None:
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
        logger.info("Mood entries table ready")

    def _create_groups_table(self, conn: sqlite3.Connection) -> None:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS groups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        logger.info("Groups table ready")

    def _create_group_options_table(self, conn: sqlite3.Connection) -> None:
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
        logger.info("Group options table ready")

    def _create_entry_selections_table(self, conn: sqlite3.Connection) -> None:
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
        logger.info("Entry selections table ready")

    def _create_achievements_table(self, conn: sqlite3.Connection) -> None:
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
        logger.info("Achievements table ready")

    def _create_goals_table(self, conn: sqlite3.Connection) -> None:
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
                    period_start TEXT,
                    last_completed_date TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
                """
            )
            self._migrate_goals_table_schema(conn)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id)")
            logger.info("Goals table ready")
        except sqlite3.Error as exc:
            logger.warning("Goals table creation failed (non-critical): %s", exc)

    def _migrate_goals_table_schema(self, conn: sqlite3.Connection) -> None:
        try:
            cur = conn.execute("PRAGMA table_info(goals)")
            cols: Iterable[str] = {row[1] for row in cur.fetchall()}
            if "last_completed_date" not in cols:
                conn.execute("ALTER TABLE goals ADD COLUMN last_completed_date TEXT")
                logger.info("Goals table migrated to include last_completed_date")
        except sqlite3.Error as exc:
            logger.warning("Goals table migration failed (non-critical): %s", exc)

    def _create_goal_completions_table(self, conn: sqlite3.Connection) -> None:
        try:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS goal_completions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    goal_id INTEGER NOT NULL,
                    date TEXT NOT NULL,
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
            logger.info("Goal completions table ready")
        except sqlite3.Error as exc:
            logger.warning(
                "Goal completions table creation failed (non-critical): %s", exc
            )

    def _create_user_metrics_table(self, conn: sqlite3.Connection) -> None:
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
            logger.info("User metrics table ready")
        except sqlite3.Error as exc:
            logger.warning("User metrics table creation failed (non-critical): %s", exc)

    def _create_database_indexes(self, conn: sqlite3.Connection) -> None:
        try:
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_mood_entries_date ON mood_entries(date)"
            )
            logger.info("Mood entries index ready")
        except sqlite3.Error as exc:
            logger.warning("Index creation failed (non-critical): %s", exc)

    # --- Seed helpers -----------------------------------------------------------
    def _insert_default_groups(self) -> None:
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

        with self._connect() as conn:
            for group_name, options in default_groups.items():
                cursor = conn.execute(
                    "SELECT id FROM groups WHERE name = ?",
                    (group_name,),
                )
                group_row = cursor.fetchone()

                if not group_row:
                    cursor = conn.execute(
                        "INSERT INTO groups (name) VALUES (?)",
                        (group_name,),
                    )
                    group_id = cursor.lastrowid
                    for option in options:
                        conn.execute(
                            "INSERT INTO group_options (group_id, name) VALUES (?, ?)",
                            (group_id, option),
                        )

            conn.commit()
            logger.info("Default groups ensured")


__all__ = ["DatabaseSchemaMixin"]
