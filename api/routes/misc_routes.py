import time
from flask import Blueprint, jsonify

def create_misc_routes():
    misc_bp = Blueprint('misc', __name__)

    @misc_bp.route('/')
    def health_check():
        return {
            'status': 'healthy',
            'message': 'Nightlio API is running',
            'timestamp': time.time()
        }

    @misc_bp.route('/time')
    def get_current_time():
        return {
            'time': time.time()
        }

    return misc_bp