"""Goal management mixin for Nightlio."""
from __future__ import annotations

import sqlite3
from datetime import datetime, timedelta, date
from typing import Dict, List, Optional

try:  # pragma: no cover - support both package and script imports
    from .database_common import DatabaseConnectionMixin, DatabaseError, SQLQueries, logger
except ImportError:  # pragma: no cover - script fallback
    from database_common import (  # type: ignore
        DatabaseConnectionMixin,
        DatabaseError,
        SQLQueries,
        logger,
    )


class GoalsMixin(DatabaseConnectionMixin):
    """Provides goal CRUD and progress helpers."""

    @staticmethod
    def _week_start_iso(date_obj: Optional[date] = None) -> str:
        if date_obj is None:
            date_obj = datetime.now().date()
        start = date_obj - timedelta(days=date_obj.weekday())
        return start.strftime("%Y-%m-%d")

    def _rollover_goal_if_needed(
        self,
        conn: sqlite3.Connection,
        goal_row: sqlite3.Row,
    ) -> Dict:
        today_start = self._week_start_iso()
        goal_dict = dict(goal_row)

        if (goal_dict.get("period_start") or "") == today_start:
            today_str = datetime.now().strftime("%Y-%m-%d")
            goal_dict["already_completed_today"] = (
                goal_dict.get("last_completed_date") == today_str
            )
            return goal_dict

        current_completed = int(goal_dict.get("completed") or 0)
        freq = int(goal_dict.get("frequency_per_week") or 0)
        streak = int(goal_dict.get("streak") or 0)

        if freq > 0 and current_completed >= freq:
            streak += 1
        else:
            streak = 0

        conn.execute(
            """
            UPDATE goals
               SET completed = ?,
                   streak = ?,
                   period_start = ?,
                   updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND user_id = ?
            """,
            (0, streak, today_start, goal_dict["id"], goal_dict["user_id"]),
        )
        conn.commit()

        conn.row_factory = sqlite3.Row
        refreshed = conn.execute(
            """
            SELECT id, user_id, title, description, frequency_per_week, completed,
                   streak, period_start, last_completed_date, created_at, updated_at
              FROM goals WHERE id = ? AND user_id = ?
            """,
            (goal_dict["id"], goal_dict["user_id"]),
        ).fetchone()

        out = dict(refreshed) if refreshed else goal_dict
        today_str = datetime.now().strftime("%Y-%m-%d")
        out["already_completed_today"] = out.get("last_completed_date") == today_str
        return out

    # CRUD operations -----------------------------------------------------------
    def create_goal(
        self,
        user_id: int,
        title: str,
        description: str,
        frequency_per_week: int,
    ) -> int:
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
                    INSERT INTO goals (user_id, title, description, frequency_per_week,
                                        completed, streak, period_start)
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
        except sqlite3.Error as exc:
            logger.error("Failed to create goal for user %s: %s", user_id, exc)
            raise DatabaseError(f"Failed to create goal: {exc}") from exc

    def get_goals(self, user_id: int) -> List[Dict]:
        with self._connect() as conn:
            conn.row_factory = sqlite3.Row
            rows = conn.execute(SQLQueries.GET_GOALS_BY_USER, (user_id,)).fetchall()
            return [self._rollover_goal_if_needed(conn, row) for row in rows]

    def get_goal_by_id(self, user_id: int, goal_id: int) -> Optional[Dict]:
        with self._connect() as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute(SQLQueries.GET_GOAL_BY_ID, (goal_id, user_id)).fetchone()
            if not row:
                return None
            return self._rollover_goal_if_needed(conn, row)

    def update_goal(
        self,
        user_id: int,
        goal_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,
        frequency_per_week: Optional[int] = None,
    ) -> bool:
        updates: List[str] = []
        params: List[object] = []

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
            updates.append("completed = MIN(completed, ?)")
            params.append(frequency_per_week)

        if not updates:
            return False

        updates.append("updated_at = CURRENT_TIMESTAMP")
        params.extend([goal_id, user_id])

        with self._connect() as conn:
            cursor = conn.execute(
                f"UPDATE goals SET {', '.join(updates)} WHERE id = ? AND user_id = ?",
                params,
            )
            conn.commit()
            return cursor.rowcount > 0

    def delete_goal(self, user_id: int, goal_id: int) -> bool:
        with self._connect() as conn:
            cursor = conn.execute(
                "DELETE FROM goals WHERE id = ? AND user_id = ?",
                (goal_id, user_id),
            )
            conn.commit()
            return cursor.rowcount > 0

    def increment_goal_progress(self, user_id: int, goal_id: int) -> Optional[Dict]:
        today_str = datetime.now().strftime("%Y-%m-%d")
        with self._connect() as conn:
            conn.row_factory = sqlite3.Row
            row = conn.execute(
                "SELECT * FROM goals WHERE id = ? AND user_id = ?",
                (goal_id, user_id),
            ).fetchone()
            if not row:
                return None

            goal = self._rollover_goal_if_needed(conn, row)
            current_completed = int(goal.get("completed") or 0)
            freq = int(goal.get("frequency_per_week") or 0)
            streak = int(goal.get("streak") or 0)
            period_start = goal.get("period_start")
            last_completed_date = goal.get("last_completed_date")

            if last_completed_date != today_str and current_completed < freq:
                current_completed += 1
                last_completed_date = today_str
            elif last_completed_date != today_str:
                last_completed_date = today_str

            conn.execute(
                """
                UPDATE goals
                   SET completed = ?,
                       streak = ?,
                       period_start = ?,
                       last_completed_date = COALESCE(?, last_completed_date),
                       updated_at = CURRENT_TIMESTAMP
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

            if last_completed_date == today_str:
                try:
                    conn.execute(
                        """
                        INSERT OR IGNORE INTO goal_completions (user_id, goal_id, date)
                        VALUES (?, ?, ?)
                        """,
                        (user_id, goal_id, today_str),
                    )
                except sqlite3.Error:
                    pass

            conn.commit()
            updated = conn.execute(
                """
                SELECT id, user_id, title, description, frequency_per_week, completed,
                       streak, period_start, last_completed_date, created_at, updated_at
                  FROM goals WHERE id = ? AND user_id = ?
                """,
                (goal_id, user_id),
            ).fetchone()

            if not updated:
                return None

            result = dict(updated)
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
        with self._connect() as conn:
            conn.row_factory = sqlite3.Row

            if not start_date or not end_date:
                end = datetime.now().date()
                start = end - timedelta(days=90)
                start_date = start.strftime("%Y-%m-%d")
                end_date = end.strftime("%Y-%m-%d")

            rows = conn.execute(
                """
                SELECT date
                  FROM goal_completions
                 WHERE user_id = ? AND goal_id = ? AND date BETWEEN ? AND ?
                 ORDER BY date ASC
                """,
                (user_id, goal_id, start_date, end_date),
            ).fetchall()

            return [dict(row) for row in rows]


__all__ = ["GoalsMixin"]
