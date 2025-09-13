#!/usr/bin/env python3
"""
Railway debugging script
"""
import os
import sys
from flask import Flask

print("=== RAILWAY DEBUG INFO ===")
print(f"Python version: {sys.version}")
print(f"Current working directory: {os.getcwd()}")
print(f"Files in current directory: {os.listdir('.')}")
print(f"PORT environment variable: {os.getenv('PORT', 'NOT SET')}")
print(f"RAILWAY_ENVIRONMENT: {os.getenv('RAILWAY_ENVIRONMENT', 'NOT SET')}")
print(f"All environment variables:")
for key, value in os.environ.items():
    if "RAILWAY" in key or key in ["PORT", "HOST"]:
        print(f"  {key}: {value}")

# Try to create Flask app
try:
    app = Flask(__name__)

    @app.route("/")
    def debug():
        return {
            "status": "Flask app created successfully",
            "port": os.getenv("PORT", "not set"),
            "cwd": os.getcwd(),
        }

    port = int(os.getenv("PORT", 8080))
    print(f"\n=== STARTING FLASK APP ===")
    print(f"Attempting to start on 0.0.0.0:{port}")

    app.run(host="0.0.0.0", port=port, debug=True)

except Exception as e:
    print(f"ERROR: Failed to start Flask app: {e}")
    import traceback

    traceback.print_exc()
