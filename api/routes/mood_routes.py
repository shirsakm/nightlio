from flask import Blueprint, request, jsonify
from api.services.mood_service import MoodService
from api.utils.auth_middleware import require_auth, get_current_user_id


def create_mood_routes(mood_service: MoodService):
    mood_bp = Blueprint("mood", __name__)

    @mood_bp.route("/mood", methods=["POST"])
    @require_auth
    def create_mood_entry():
        try:
            user_id = get_current_user_id()
            data = request.json
            mood = data.get("mood")
            date = data.get("date")
            content = data.get("content")
            time = data.get("time")
            selected_options = data.get("selected_options", [])

            # Validate input
            if not all([mood, date, content]):
                return jsonify({"error": "Missing required fields"}), 400

            result = mood_service.create_mood_entry(
                user_id, date, mood, content, time, selected_options
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
            data = request.json
            mood = data.get("mood")
            content = data.get("content")

            success = mood_service.update_entry(user_id, entry_id, mood, content)

            if success:
                return jsonify(
                    {"status": "success", "message": "Mood entry updated successfully"}
                )
            else:
                return jsonify({"error": "Entry not found or no changes made"}), 404

        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @mood_bp.route("/mood/<int:entry_id>", methods=["DELETE"])
    @require_auth
    def delete_mood_entry(entry_id):
        try:
            user_id = get_current_user_id()
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
            stats = mood_service.get_statistics(user_id)
            return jsonify(stats)

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @mood_bp.route("/streak", methods=["GET"])
    @require_auth
    def get_current_streak():
        try:
            user_id = get_current_user_id()
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
            selections = mood_service.get_entry_selections(user_id, entry_id)
            return jsonify(selections)

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return mood_bp
