#!/usr/bin/env python3
"""
Railway startup script for Nightlio API
"""
import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app

if __name__ == '__main__':
    # Get environment
    env = os.getenv('RAILWAY_ENVIRONMENT', 'production')
    
    # Create app
    app = create_app(env)
    
    # Get port from Railway
    port = int(os.getenv('PORT', 5000))
    
    print(f"🚀 Starting Nightlio API on port {port}")
    print(f"📍 Environment: {env}")
    print(f"🔑 Google Client ID: {'✅ Set' if app.config.get('GOOGLE_CLIENT_ID') else '❌ Missing'}")
    
    # Run the app
    app.run(host='0.0.0.0', port=port, debug=False)