from flask import jsonify
import logging

def setup_error_handlers(app):
    """Setup global error handlers for the Flask app"""
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'Bad request'}), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        logging.error(f'Internal server error: {error}')
        return jsonify({'error': 'Internal server error'}), 500

    @app.errorhandler(ValueError)
    def value_error(error):
        return jsonify({'error': str(error)}), 400

    return app