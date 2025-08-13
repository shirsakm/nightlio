import time
from flask import Blueprint, jsonify

def create_misc_routes():
    misc_bp = Blueprint('misc', __name__)

    @misc_bp.route('/time')
    def get_current_time():
        return {
            'time': time.time()
        }

    return misc_bp