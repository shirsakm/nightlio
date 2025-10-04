#!/usr/bin/env python3
"""
Docker startup script for Nightlio API
"""
import os
import sys
import subprocess

# Set up path for imports
sys.path.insert(0, "/app")

# Import the app creation function
from app import create_app

if __name__ == "__main__":
    # Get environment
    env = os.getenv("RAILWAY_ENVIRONMENT", "production")
    
    port = int(os.getenv("PORT", 5000))

    print(f"🚀 Starting Nightlio API on port {port}")
    print(f"📍 Environment: {env}")
    
    app = create_app(env)
    print(
        f"🔑 Google Client ID: {'✅ Set' if app.config.get('GOOGLE_CLIENT_ID') else '❌ Missing'}"
    )

    if env == "production":
        cmd = [
            "gunicorn",
            "--bind", f"[::]:{port}",
            "--workers", "4",
            "--timeout", "120",
            "--worker-class", "sync",
            "--access-logfile", "-",
            "--error-logfile", "-",
            "wsgi:application"
        ]
        print(f"🔧 Using Gunicorn: {' '.join(cmd)}")
        subprocess.run(cmd)
    else:
        print("🔧 Using Flask development server")
        app.run(debug=True, host="::", port=port)
