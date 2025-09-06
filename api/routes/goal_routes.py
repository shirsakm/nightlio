from flask import Blueprint, request, jsonify
from api.services.goal_service import GoalService
from api.utils.auth_middleware import require_auth, get_current_user_id


def create_goal_routes(goal_service: GoalService):
    bp = Blueprint('goals', __name__)

    @bp.route('/goals', methods=['GET'])
    @require_auth
    def list_goals():
        try:
            user_id = get_current_user_id()
            if not isinstance(user_id, int):
                return jsonify({'error': 'Unauthorized'}), 401
            goals = goal_service.list_goals(user_id)
            return jsonify(goals)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @bp.route('/goals', methods=['POST'])
    @require_auth
    def create_goal():
        try:
            user_id = get_current_user_id()
            if not isinstance(user_id, int):
                return jsonify({'error': 'Unauthorized'}), 401
            data = request.json or {}
            title = data.get('title', '').strip()
            description = (data.get('description') or '').strip()
            frequency = int(data.get('frequency_per_week') or data.get('frequency') or 0)
            if not title:
                return jsonify({'error': 'Title is required'}), 400
            if frequency < 1 or frequency > 7:
                return jsonify({'error': 'frequency_per_week must be 1..7'}), 400
            goal_id = goal_service.create_goal(user_id, title, description, frequency)
            return jsonify({'id': goal_id}), 201
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @bp.route('/goals/<int:goal_id>', methods=['GET'])
    @require_auth
    def get_goal(goal_id: int):
        try:
            user_id = get_current_user_id()
            if not isinstance(user_id, int):
                return jsonify({'error': 'Unauthorized'}), 401
            goal = goal_service.get_goal(user_id, goal_id)
            if not goal:
                return jsonify({'error': 'Not found'}), 404
            return jsonify(goal)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @bp.route('/goals/<int:goal_id>', methods=['PUT', 'PATCH'])
    @require_auth
    def update_goal(goal_id: int):
        try:
            user_id = get_current_user_id()
            if not isinstance(user_id, int):
                return jsonify({'error': 'Unauthorized'}), 401
            data = request.json or {}
            title = data.get('title')
            description = data.get('description')
            frequency = data.get('frequency_per_week')
            if frequency is None:
                # Accept `frequency` alias from UI
                frequency = data.get('frequency')
            success = goal_service.update_goal(user_id, goal_id, title, description, int(frequency) if frequency is not None else None)
            if not success:
                return jsonify({'error': 'No changes or goal not found'}), 404
            return jsonify({'status': 'ok'})
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @bp.route('/goals/<int:goal_id>', methods=['DELETE'])
    @require_auth
    def delete_goal(goal_id: int):
        try:
            user_id = get_current_user_id()
            if not isinstance(user_id, int):
                return jsonify({'error': 'Unauthorized'}), 401
            success = goal_service.delete_goal(user_id, goal_id)
            if not success:
                return jsonify({'error': 'Not found'}), 404
            return jsonify({'status': 'ok'})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @bp.route('/goals/<int:goal_id>/progress', methods=['POST'])
    @require_auth
    def increment_progress(goal_id: int):
        try:
            user_id = get_current_user_id()
            if not isinstance(user_id, int):
                return jsonify({'error': 'Unauthorized'}), 401
            updated = goal_service.increment_progress(user_id, goal_id)
            if not updated:
                return jsonify({'error': 'Not found'}), 404
            return jsonify(updated)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @bp.route('/goals/<int:goal_id>/completions', methods=['GET', 'OPTIONS'], strict_slashes=False)
    @bp.route('/goals/<int:goal_id>/completions/', methods=['GET', 'OPTIONS'], strict_slashes=False)
    @bp.route('/goal/<int:goal_id>/completions', methods=['GET', 'OPTIONS'], strict_slashes=False)
    @require_auth
    def get_completions(goal_id: int):
        try:
            user_id = get_current_user_id()
            if not isinstance(user_id, int):
                return jsonify({'error': 'Unauthorized'}), 401
            start_date = request.args.get('start')
            end_date = request.args.get('end')
            rows = goal_service.get_completions(user_id, goal_id, start_date, end_date)
            return jsonify(rows)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return bp
