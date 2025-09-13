#!/usr/bin/env python3
"""
Simple test Flask app for Railway debugging
"""
import os
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["https://nightlio.vercel.app", "http://localhost:5173"])


@app.route("/")
def health():
    return jsonify(
        {
            "status": "healthy",
            "message": "Simple test app is running",
            "port": os.getenv("PORT", "not set"),
            "railway_env": os.getenv("RAILWAY_ENVIRONMENT", "not set"),
        }
    )


@app.route("/api/test")
def test():
    return jsonify({"test": "success"})


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    print(f"Starting simple test app on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)
