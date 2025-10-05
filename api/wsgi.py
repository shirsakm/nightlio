#!/usr/bin/env python3
"""
WSGI entry point for Nightlio API
This file is used by production WSGI servers like Gunicorn
"""
import os
import sys
from pathlib import Path

api_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(api_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

try:
    from api.app import create_app
except ImportError:
    from app import create_app

env = os.getenv("RAILWAY_ENVIRONMENT", "production")

application = create_app(env)

app = application

if __name__ == "__main__":
    import subprocess
    
    port = int(os.getenv("PORT", 5000))
    
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
        print(f"🚀 Starting Nightlio API with Gunicorn on port {port}")
        print(f"📍 Environment: {env}")
        print(
            f"🔑 Google Client ID: {'✅ Set' if app.config.get('GOOGLE_CLIENT_ID') else '❌ Missing'}"
        )

        # print(f"🔧 Command: {' '.join(cmd)}")
        subprocess.run(cmd)
    else:
        # use Flask for development
        print(f"🚀 Starting Nightlio API (development) on port {port}")
        print(f"📍 Environment: {env}")
        print(
            f"🔑 Google Client ID: {'✅ Set' if app.config.get('GOOGLE_CLIENT_ID') else '❌ Missing'}"
        )
        application.run(debug=True, host="127.0.0.1", port=port)