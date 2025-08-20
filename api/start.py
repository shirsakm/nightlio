#!/usr/bin/env python3
"""
Railway startup script for Nightlio API
"""
import os
import sys

# Ensure project root is on sys.path so `import api.app` works when cwd=api/
api_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(api_dir)
if project_root not in sys.path:
  sys.path.insert(0, project_root)

try:
  from api.app import create_app
except Exception:
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