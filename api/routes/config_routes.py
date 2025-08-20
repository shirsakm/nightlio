from flask import Blueprint, jsonify

# Import from local package; avoid absolute 'api.' to work in app context.
from config import get_config, config_to_public_dict


def create_config_routes():
    bp = Blueprint("config", __name__)

    @bp.get("/config")
    def get_public_config():
        cfg = get_config()
        return jsonify(config_to_public_dict(cfg))

    return bp
