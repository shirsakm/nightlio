"""Achievements and analytics helpers."""
from __future__ import annotations

import sqlite3
from datetime import datetime, timedelta, date
from typing import Dict, List, Optional

try:  # pragma: no cover - allow running as top-level script
    from .database_common import DatabaseConnectionMixin, SQLQueries, logger
except ImportError:  # pragma: no cover - executed for script usage fallback
    from database_common import DatabaseConnectionMixin, SQLQueries, logger  # type: ignore


class AchievementsMixin(DatabaseConnectionMixin):
    """Provides stats, streak, and achievement utilities."""

    # --- Statistics -----------------------------------------------------------
    def increment_stats_view(self, user_id: int) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO user_metrics (user_id, stats_views)
                VALUES (?, 1)
                ON CONFLICT(user_id)
                DO UPDATE SET stats_views = stats_views + 1, updated_at = CURRENT_TIMESTAMP
                """,
                (user_id,),
            )
            conn.commit()

    def get_user_metrics(self, user_id: int) -> Dict:
        with self._connect() as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute(
                "SELECT user_id, stats_views, updated_at FROM user_metrics WHERE user_id = ?",
                (user_id,),
            ).fetchone()
            if not row:
                return {"user_id": user_id, "stats_views": 0}
            return dict(row)

    def get_mood_statistics(self, user_id: int) -> Dict:
        with self._connect() as conn:
            cursor = conn.execute(SQLQueries.GET_MOOD_STATISTICS, (user_id,))
            row = cursor.fetchone()
            if row and row[0] > 0:
                return {
                    "total_entries": row[0],
                    "average_mood": round(row[1], 2) if row[1] else 0,
                    "lowest_mood": row[2],
                    "highest_mood": row[3],
                    "first_entry_date": row[4],
                    "last_entry_date": row[5],
                }
            return {
                "total_entries": 0,
                "average_mood": 0,
                "lowest_mood": None,
                "highest_mood": None,
                "first_entry_date": None,
                "last_entry_date": None,
            }

    def get_mood_counts(self, user_id: int) -> Dict[int, int]:
        with self._connect() as conn:
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

    # --- Streak calculation ---------------------------------------------------
    def get_current_streak(self, user_id: int) -> int:
        try:
            dates = self._get_user_entry_dates(user_id)
            if not dates:
                return 0
            parsed_dates = self._parse_date_strings(dates)
            if not parsed_dates:
                return 0
            return self._calculate_streak_from_dates(parsed_dates)
        except Exception as exc:  # pragma: no cover - defensive guard
            logger.warning("Error calculating streak for user %s: %s", user_id, exc)
            return 0

    def _get_user_entry_dates(self, user_id: int) -> List[str]:
        with self._connect() as conn:
            cursor = conn.execute(SQLQueries.GET_USER_ENTRY_DATES, (user_id,))
            return [row[0] for row in cursor.fetchall()]

    def _parse_date_strings(self, date_strings: List[str]) -> List[date]:
        parsed_dates: List[date] = []
        date_formats = ["%m/%d/%Y", "%Y-%m-%d"]
        for date_str in date_strings:
            for fmt in date_formats:
                try:
                    parsed_dates.append(datetime.strptime(date_str, fmt).date())
                    break
                except ValueError:
                    continue
            else:
                logger.debug("Could not parse date: %s", date_str)
        return sorted(parsed_dates, reverse=True)

    def _calculate_streak_from_dates(self, parsed_dates: List[date]) -> int:
        if not parsed_dates:
            return 0
        today = datetime.now().date()
        most_recent = parsed_dates[0]
        if (today - most_recent).days > 1:
            return 0
        streak = 0
        expected_date = most_recent
        for entry_date in parsed_dates:
            if entry_date == expected_date:
                streak += 1
                expected_date = entry_date - timedelta(days=1)
            else:
                break
        return streak

    # --- Achievements ---------------------------------------------------------
    def add_achievement(self, user_id: int, achievement_type: str) -> Optional[int]:
        with self._connect() as conn:
            try:
                cursor = conn.execute(
                    "INSERT INTO achievements (user_id, achievement_type) VALUES (?, ?)",
                    (user_id, achievement_type),
                )
                conn.commit()
                return int(cursor.lastrowid or 0)
            except sqlite3.IntegrityError:
                return None

    def get_user_achievements(self, user_id: int) -> List[Dict]:
        with self._connect() as conn:
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

    def update_achievement_nft(
        self,
        achievement_id: int,
        token_id: int,
        tx_hash: str,
    ) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE achievements
                   SET nft_minted = TRUE,
                       nft_token_id = ?,
                       nft_tx_hash = ?
                 WHERE id = ?
                """,
                (token_id, tx_hash, achievement_id),
            )
            conn.commit()

    def check_achievements(self, user_id: int) -> List[str]:
        new_achievements: List[str] = []
        total_entries = self.get_mood_statistics(user_id)["total_entries"]
        current_streak = self.get_current_streak(user_id)
        stats_views = int(self.get_user_metrics(user_id).get("stats_views") or 0)

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
                if achievement_id:
                    new_achievements.append(achievement_type)

        return new_achievements

    def get_achievements_progress(self, user_id: int) -> Dict[str, Dict[str, int]]:
        stats = self.get_mood_statistics(user_id)
        total_entries = int(stats.get("total_entries") or 0)
        current_streak = int(self.get_current_streak(user_id) or 0)
        stats_views = int(self.get_user_metrics(user_id).get("stats_views") or 0)

        def clamp(value: int, maximum: int) -> int:
            return max(0, min(int(value), int(maximum)))

        return {
            "first_entry": {"current": clamp(total_entries, 1), "max": 1},
            "week_warrior": {"current": clamp(current_streak, 7), "max": 7},
            "consistency_king": {"current": clamp(current_streak, 30), "max": 30},
            "data_lover": {"current": clamp(stats_views, 10), "max": 10},
            "mood_master": {"current": clamp(total_entries, 100), "max": 100},
        }


__all__ = ["AchievementsMixin"]
