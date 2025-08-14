from flask import Blueprint, request, jsonify
from services.achievement_service import AchievementService
from utils.auth_middleware import require_auth, get_current_user_id

def create_achievement_routes(achievement_service: AchievementService):
    achievement_bp = Blueprint('achievement', __name__)

    @achievement_bp.route('/achievements', methods=['GET'])
    @require_auth
    def get_user_achievements():
        try:
            user_id = get_current_user_id()
            achievements = achievement_service.get_user_achievements(user_id)
            return jsonify(achievements)

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @achievement_bp.route('/achievements/check', methods=['POST'])
    @require_auth
    def check_achievements():
        try:
            user_id = get_current_user_id()
            new_achievements = achievement_service.check_and_award_achievements(user_id)
            
            return jsonify({
                'new_achievements': new_achievements,
                'count': len(new_achievements)
            })

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @achievement_bp.route('/achievements/<int:achievement_id>/mint', methods=['POST'])
    @require_auth
    def mint_achievement_nft(achievement_id):
        try:
            user_id = get_current_user_id()
            data = request.json
            token_id = data.get('token_id')
            tx_hash = data.get('tx_hash')
            
            if not token_id or not tx_hash:
                return jsonify({'error': 'token_id and tx_hash are required'}), 400
            
            achievement_service.update_achievement_nft(achievement_id, token_id, tx_hash)
            
            return jsonify({
                'status': 'success',
                'message': 'Achievement NFT minted successfully'
            })

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return achievement_bp