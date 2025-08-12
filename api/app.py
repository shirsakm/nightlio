from flask import Flask
from flask_cors import CORS
from database import MoodDatabase
from services.mood_service import MoodService
from services.group_service import GroupService
from routes.mood_routes import create_mood_routes
from routes.group_routes import create_group_routes
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

    # Register blueprints
    app.register_blueprint(create_mood_routes(mood_service), url_prefix='/api')
    app.register_blueprint(create_group_routes(group_service), url_prefix='/api')
    app.register_blueprint(create_misc_routes(), url_prefix='/api')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)