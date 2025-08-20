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
from services.achievement_service import AchievementService
from routes.mood_routes import create_mood_routes
from routes.group_routes import create_group_routes
from routes.auth_routes import create_auth_routes
from routes.misc_routes import create_misc_routes
from routes.config_routes import create_config_routes
from routes.achievement_routes import create_achievement_routes
from utils.error_handlers import setup_error_handlers
from utils.security_headers import add_security_headers

def create_app(config_name='default'):
    """Application factory pattern"""
    from config import config
    from config import get_config
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    CORS(app, origins=app.config['CORS_ORIGINS'])

    # Setup error handlers
    setup_error_handlers(app)
    
    # Add security headers
    add_security_headers(app)

    # Initialize database
    db = MoodDatabase(app.config.get('DATABASE_PATH'))

    # Initialize services
    mood_service = MoodService(db)
    group_service = GroupService(db)
    user_service = UserService(db)
    achievement_service = AchievementService(db)

    # Register blueprints
    app.register_blueprint(create_auth_routes(user_service), url_prefix='/api')
    app.register_blueprint(create_mood_routes(mood_service), url_prefix='/api')
    app.register_blueprint(create_group_routes(group_service), url_prefix='/api')
    app.register_blueprint(create_achievement_routes(achievement_service), url_prefix='/api')
    app.register_blueprint(create_misc_routes(), url_prefix='/api')
    app.register_blueprint(create_config_routes(), url_prefix='/api')

    # Conditional feature registration (lazy imports)
    cfg = get_config()

    if cfg.ENABLE_GOOGLE_OAUTH:
        try:
            # Registered only when enabled; module can lazy-import heavy deps.
            from auth.oauth import oauth_bp  # type: ignore
            app.register_blueprint(oauth_bp, url_prefix='/api')
        except Exception as e:
            if app.debug:
                print(f"[warn] ENABLE_GOOGLE_OAUTH is true but oauth blueprint not available: {e}")

    if cfg.ENABLE_WEB3:
        try:
            # Optional Web3 routes (added in a later prompt).
            from routes.web3_routes import web3_bp  # type: ignore
            app.register_blueprint(web3_bp, url_prefix='/api')
        except Exception as e:
            if app.debug:
                print(f"[warn] ENABLE_WEB3 is true but web3 blueprint not available: {e}")

    # Debug: Print all registered routes
    if app.debug:
        print("Registered routes:")
        for rule in app.url_map.iter_rules():
            print(f"  {rule.rule} -> {rule.endpoint} [{', '.join(rule.methods)}]")

    return app

if __name__ == '__main__':
    import os
    
    # Get environment from Railway or default to development
    env = os.getenv('RAILWAY_ENVIRONMENT', 'development')
    app = create_app(env)
    
    print("Starting Flask app...")
    print(f"Environment: {env}")
    print(f"Google Client ID loaded: {app.config.get('GOOGLE_CLIENT_ID', 'NOT FOUND')}")
    
    # Use Railway's PORT or default to 5000
    port = int(os.getenv('PORT', 5000))
    print(f"Starting server on port: {port}")
    print(f"Host: {'0.0.0.0' if env == 'production' else '127.0.0.1'}")
    
    if env == 'production':
        app.run(host='0.0.0.0', port=port, debug=False)
    else:
        app.run(debug=True, host='127.0.0.1', port=port)