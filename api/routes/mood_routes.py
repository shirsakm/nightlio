from typing import Any, List, Optional
from flask import Blueprint, request, jsonify
from api.services.mood_service import MoodService
from api.utils.auth_middleware import require_auth, get_current_user_id


def _normalise_selected_options(
    raw: Any, *, allow_none: bool = False
) -> Optional[List[int]]:
    if raw is None:
        return None if allow_none else []

    if not isinstance(raw, list):
        raise ValueError("selected_options must be an array")

    try:
        return [int(option_id) for option_id in raw]
    except (TypeError, ValueError) as exc:
        raise ValueError("selected_options must contain integers") from exc


def create_mood_routes(mood_service: MoodService):
    mood_bp = Blueprint("mood", __name__)

    @mood_bp.route("/mood", methods=["POST"])
    @require_auth
    def create_mood_entry():
        try:
            user_id = get_current_user_id()
            if user_id is None:
                return jsonify({"error": "Unauthorized"}), 401
            data = request.get_json(silent=True) or {}
            mood = data.get("mood")
            date = data.get("date")
            content = data.get("content")
            time = data.get("time")
            selected_options_raw = data.get("selected_options", [])

            # Validate input
            if not all([mood, date, content]):
                return jsonify({"error": "Missing required fields"}), 400

            raw_mood: Any = mood
            try:
                mood_value = int(raw_mood)
            except (TypeError, ValueError):
                return jsonify({"error": "Mood must be an integer"}), 400

            date_value = str(date)
            content_value = str(content)
            time_value = str(time) if time else None

            try:
                selected_options = _normalise_selected_options(selected_options_raw)
            except ValueError as exc:
                return jsonify({"error": str(exc)}), 400

            result = mood_service.create_mood_entry(
                user_id,
                date_value,
                mood_value,
                content_value,
                time_value,
                selected_options,
            )

            return (
                jsonify(
                    {
                        "status": "success",
                        "entry_id": result["entry_id"],
                        "new_achievements": result["new_achievements"],
                        "message": "Mood entry created successfully",
                    }
                ),
                201,
            )

        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @mood_bp.route("/moods", methods=["GET"])
    @require_auth
    def get_mood_entries():
        try:
            user_id = get_current_user_id()
            if user_id is None:
                return jsonify({"error": "Unauthorized"}), 401
            start_date = request.args.get("start_date")
            end_date = request.args.get("end_date")

            if start_date and end_date:
                entries = mood_service.get_entries_by_date_range(
                    user_id, start_date, end_date
                )
            else:
                entries = mood_service.get_all_entries(user_id)
            return jsonify(entries)

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @mood_bp.route("/mood/<int:entry_id>", methods=["GET"])
    @require_auth
    def get_mood_entry(entry_id):
        try:
            user_id = get_current_user_id()
            if user_id is None:
                return jsonify({"error": "Unauthorized"}), 401
            entry = mood_service.get_entry_by_id(user_id, entry_id)
            if entry:
                return jsonify(entry)
            else:
                return jsonify({"error": "Entry not found"}), 404

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @mood_bp.route("/mood/<int:entry_id>", methods=["PUT"])
    @require_auth
    def update_mood_entry(entry_id):
        try:
            user_id = get_current_user_id()
            if user_id is None:
                return jsonify({"error": "Unauthorized"}), 401
            data = request.json or {}

            mood = data.get("mood")
            content = data.get("content")
            date = data.get("date")
            time = data.get("time")
            selected_options = None
            if "selected_options" in data:
                try:
                    normalised_options = _normalise_selected_options(
                        data.get("selected_options"), allow_none=True
                    )
                except ValueError as exc:
                    return jsonify({"error": str(exc)}), 400
                selected_options = (
                    [] if normalised_options is None else normalised_options
                )

            if (
                mood is None
                and content is None
                and date is None
                and time is None
                and "selected_options" not in data
            ):
                return jsonify({"error": "No update fields provided"}), 400

            mood_value = None
            if mood is not None:
                try:
                    mood_value = int(mood)
                except (TypeError, ValueError):
                    return jsonify({"error": "Mood must be an integer"}), 400

            content_value = str(content) if content is not None else None
            date_value = str(date) if date is not None else None
            time_value = str(time) if time else None

            updated_entry = mood_service.update_entry(
                user_id,
                entry_id,
                mood=mood_value,
                content=content_value,
                date=date_value,
                time=time_value,
                selected_options=selected_options,
            )

            if updated_entry is None:
                return jsonify({"error": "Entry not found or no changes made"}), 404

            return (
                jsonify(
                    {
                        "status": "success",
                        "message": "Mood entry updated successfully",
                        "entry": updated_entry,
                    }
                ),
                200,
            )

        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @mood_bp.route("/mood/<int:entry_id>", methods=["DELETE"])
    @require_auth
    def delete_mood_entry(entry_id):
        try:
            user_id = get_current_user_id()
            if user_id is None:
                return jsonify({"error": "Unauthorized"}), 401
            success = mood_service.delete_entry(user_id, entry_id)

            if success:
                return jsonify(
                    {"status": "success", "message": "Mood entry deleted successfully"}
                )
            else:
                return jsonify({"error": "Entry not found"}), 404

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @mood_bp.route("/statistics", methods=["GET"])
    @require_auth
    def get_mood_statistics():
        try:
            user_id = get_current_user_id()
            if user_id is None:
                return jsonify({"error": "Unauthorized"}), 401
            stats = mood_service.get_statistics(user_id)
            return jsonify(stats)

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @mood_bp.route("/streak", methods=["GET"])
    @require_auth
    def get_current_streak():
        try:
            user_id = get_current_user_id()
            if user_id is None:
                return jsonify({"error": "Unauthorized"}), 401
            streak = mood_service.get_current_streak(user_id)
            return jsonify(
                {
                    "current_streak": streak,
                    "message": f'Current streak: {streak} day{"s" if streak != 1 else ""}',
                }
            )

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @mood_bp.route("/mood/<int:entry_id>/selections", methods=["GET"])
    @require_auth
    def get_entry_selections(entry_id):
        try:
            user_id = get_current_user_id()
            if user_id is None:
                return jsonify({"error": "Unauthorized"}), 401
            selections = mood_service.get_entry_selections(user_id, entry_id)
            return jsonify(selections)

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return mood_bp
