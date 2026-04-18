from flask import Blueprint, request, jsonify
from api.services.mus_service import MusicService

def create_music_routes(music_service: MusicService):
    music_bp = Blueprint("music", __name__)

    @music_bp.route("/music/vibe", methods=["GET"])
    def get_vibe():
        tag = request.args.get('tag', 'chill')
        result = music_service.get_track_by_tag(tag)
        
        if "error" in result:
            return jsonify(result), 400
        return jsonify(result)

    return music_bp