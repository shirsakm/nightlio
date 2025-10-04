from flask import Blueprint, request, jsonify
from api.services.achievement_service import AchievementService
from api.utils.auth_middleware import require_auth, get_current_user_id
from api.config import get_config


def create_achievement_routes(achievement_service: AchievementService):
    achievement_bp = Blueprint("achievement", __name__)

    @achievement_bp.route("/achievements", methods=["GET"])
    @require_auth
    def get_user_achievements():
        try:
            user_id = get_current_user_id()
            if not isinstance(user_id, int):
                return jsonify({"error": "Unauthorized"}), 401
            achievements = achievement_service.get_user_achievements(user_id)
            return jsonify(achievements)

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @achievement_bp.route("/achievements/check", methods=["POST"])
    @require_auth
    def check_achievements():
        try:
            user_id = get_current_user_id()
            if not isinstance(user_id, int):
                return jsonify({"error": "Unauthorized"}), 401
            new_achievements = achievement_service.check_and_award_achievements(user_id)

            return jsonify(
                {"new_achievements": new_achievements, "count": len(new_achievements)}
            )

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # CORS preflight should not require auth
    @achievement_bp.route(
        "/achievements/progress", methods=["OPTIONS"], strict_slashes=False
    )
    @achievement_bp.route(
        "/achievements/progress/", methods=["OPTIONS"], strict_slashes=False
    )
    def achievements_progress_options():
        return ("", 204)

    @achievement_bp.route(
        "/achievements/progress", methods=["GET"], strict_slashes=False
    )
    @achievement_bp.route(
        "/achievements/progress/", methods=["GET"], strict_slashes=False
    )
    @require_auth
    def achievements_progress():
        try:
            user_id = get_current_user_id()
            if not isinstance(user_id, int):
                return jsonify({"error": "Unauthorized"}), 401
            progress = achievement_service.db.get_achievements_progress(user_id)
            return jsonify(progress)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # Web3 NFT minting removed

    return achievement_bp
