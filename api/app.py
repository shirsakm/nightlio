import os
import sys
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from the project root (parent directory)
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

# Support running as a package (api.*) and from within the api/ directory
try:
    from api.database import MoodDatabase
    from api.services.mood_service import MoodService
    from api.services.goal_service import GoalService
    from api.services.group_service import GroupService
    from api.services.user_service import UserService
    from api.services.achievement_service import AchievementService
    from api.routes.mood_routes import create_mood_routes
    from api.routes.goal_routes import create_goal_routes
    from api.routes.group_routes import create_group_routes
    from api.routes.auth_routes import create_auth_routes
    from api.routes.misc_routes import create_misc_routes
    from api.routes.config_routes import create_config_routes
    from api.routes.achievement_routes import create_achievement_routes
    from api.utils.error_handlers import setup_error_handlers
    from api.utils.security_headers import add_security_headers
except Exception:  # fallback for running from inside api/
    from database import MoodDatabase
    from services.mood_service import MoodService
    from services.goal_service import GoalService
    from services.group_service import GroupService
    from services.user_service import UserService
    from services.achievement_service import AchievementService
    from routes.mood_routes import create_mood_routes
    from routes.goal_routes import create_goal_routes
    from routes.group_routes import create_group_routes
    from routes.auth_routes import create_auth_routes
    from routes.misc_routes import create_misc_routes
    from routes.config_routes import create_config_routes
    from routes.achievement_routes import create_achievement_routes
    from utils.error_handlers import setup_error_handlers
    from utils.security_headers import add_security_headers


def create_app(config_name="default"):
    """Application factory pattern"""
    try:
        from api.config import config as config_map
        from api.config import get_config
    except Exception:
        # Fallback when running from within api/ directory
        from config import config as config_map  # type: ignore[import-not-found]
        from config import get_config  # type: ignore[import-not-found]

    app = Flask(__name__)
    app.config.from_object(config_map[config_name])

    # Load typed runtime config and align secrets
    cfg = None
    try:
        cfg = get_config()
        # Ensure JWT verification uses the same secret that issuance uses
        if getattr(cfg, "JWT_SECRET", None):
            app.config["JWT_SECRET_KEY"] = getattr(cfg, "JWT_SECRET")
    except Exception:
        cfg = None  # fallback if typed config fails

    CORS(app, origins=app.config["CORS_ORIGINS"])

    # Rely on flask-cors to handle CORS and automatic OPTIONS responses per route

    # Setup error handlers
    setup_error_handlers(app)

    # Add security headers
    add_security_headers(app)

    # Initialize database
    db = MoodDatabase(app.config.get("DATABASE_PATH"))

    # Initialize services
    mood_service = MoodService(db)
    group_service = GroupService(db)
    goal_service = GoalService(db)
    user_service = UserService(db)
    achievement_service = AchievementService(db)

    # Register blueprints
    app.register_blueprint(create_auth_routes(user_service), url_prefix="/api")
    app.register_blueprint(create_mood_routes(mood_service), url_prefix="/api")
    app.register_blueprint(create_group_routes(group_service), url_prefix="/api")
    app.register_blueprint(create_goal_routes(goal_service), url_prefix="/api")
    app.register_blueprint(
        create_achievement_routes(achievement_service), url_prefix="/api"
    )
    app.register_blueprint(create_misc_routes(), url_prefix="/api")
    app.register_blueprint(create_config_routes(), url_prefix="/api")

    # Expose services for optional blueprints (e.g., OAuth) to reuse
    try:
        if not hasattr(app, "extensions") or app.extensions is None:  # type: ignore[attr-defined]
            app.extensions = {}  # type: ignore[attr-defined]
        app.extensions["user_service"] = user_service  # type: ignore[attr-defined]
    except Exception:
        pass

    # Conditional feature registration (lazy imports)
    if cfg is None:
        try:
            cfg = get_config()
        except Exception:
            cfg = None

    if cfg and getattr(cfg, "ENABLE_GOOGLE_OAUTH", False):
        try:
            # Registered only when enabled; module can lazy-import heavy deps.
            from api.auth.oauth import oauth_bp  # type: ignore

            app.register_blueprint(oauth_bp, url_prefix="/api")
        except Exception as e:
            try:
                from auth.oauth import oauth_bp  # type: ignore

                app.register_blueprint(oauth_bp, url_prefix="/api")
            except Exception as e2:
                if app.debug:
                    print(
                        f"[warn] ENABLE_GOOGLE_OAUTH is true but oauth blueprint not available: {e} / {e2}"
                    )

    # Web3 functionality removed from the application

    # Debug: Print all registered routes
    if app.debug:
        print("Registered routes:")
        for rule in app.url_map.iter_rules():
            methods = sorted(list(getattr(rule, "methods", []) or []))
            print(f"  {rule.rule} -> {rule.endpoint} [{', '.join(methods)}]")

    return app


if __name__ == "__main__":
    # Ensure project root is on sys.path when running this file directly
    root = str(Path(__file__).parent)
    if root not in sys.path:
        sys.path.insert(0, root)

    # Get environment from Railway or default to development
    env = os.getenv("RAILWAY_ENVIRONMENT", "development")
    app = create_app(env)

    print("Starting Flask app...")
    print(f"Environment: {env}")
    print(f"Google Client ID loaded: {app.config.get('GOOGLE_CLIENT_ID', 'NOT FOUND')}")

    # Use Railway's PORT or default to 5000
    port = int(os.getenv("PORT", 5000))
    print(f"Starting server on port: {port}")
    print(f"Host: {'[::]' if env == 'production' else '127.0.0.1'}")

    if env == "production":
        app.run(host="::", port=port, debug=False)
    else:
        app.run(debug=True, host="127.0.0.1", port=port)
