from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from the project root (parent directory)
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(env_path)

from database import MoodDatabase
from services.mood_service import MoodService
from services.group_service import GroupService
from services.user_service import UserService
from routes.mood_routes import create_mood_routes
from routes.group_routes import create_group_routes
from routes.auth_routes import create_auth_routes
from routes.misc_routes import create_misc_routes
from utils.error_handlers import setup_error_handlers

def create_app(config_name='default'):
    """Application factory pattern"""
    from config import config
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    CORS(app, origins=app.config['CORS_ORIGINS'])

    # Setup error handlers
    setup_error_handlers(app)

    # Initialize database
    db = MoodDatabase(app.config.get('DATABASE_PATH'))

    # Initialize services
    mood_service = MoodService(db)
    group_service = GroupService(db)
    user_service = UserService(db)

    # Register blueprints
    app.register_blueprint(create_auth_routes(user_service), url_prefix='/api')
    app.register_blueprint(create_mood_routes(mood_service), url_prefix='/api')
    app.register_blueprint(create_group_routes(group_service), url_prefix='/api')
    app.register_blueprint(create_misc_routes(), url_prefix='/api')

    # Debug: Print all registered routes
    if app.debug:
        print("Registered routes:")
        for rule in app.url_map.iter_rules():
            print(f"  {rule.rule} -> {rule.endpoint} [{', '.join(rule.methods)}]")

    return app

if __name__ == '__main__':
    app = create_app('development')
    print("Starting Flask app...")
    print(f"Google Client ID loaded: {app.config.get('GOOGLE_CLIENT_ID', 'NOT FOUND')}")
    app.run(debug=True, host='127.0.0.1', port=5000)