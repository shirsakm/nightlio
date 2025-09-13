from functools import wraps
from flask import request, jsonify, current_app, g
from jose import jwt, JWTError


def require_auth(f):
    """Decorator to require JWT authentication"""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Allow CORS preflight requests (OPTIONS) to succeed without auth
        # Return 204 directly so the route handler isn't invoked.
        if request.method == "OPTIONS":
            return ("", 204)
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authorization header required"}), 401

        try:
            token = auth_header.split(" ")[1]
            payload = jwt.decode(
                token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"]
            )

            # Store user_id in Flask's g object for use in the route
            g.user_id = payload["user_id"]

        except JWTError as e:
            if "expired" in str(e).lower():
                return jsonify({"error": "Token expired"}), 401
            else:
                return jsonify({"error": "Invalid token"}), 401
        except Exception as e:
            current_app.logger.error(f"Auth middleware error: {str(e)}")
            return jsonify({"error": "Authentication failed"}), 500

        return f(*args, **kwargs)

    return decorated_function


def get_current_user_id():
    """Get current authenticated user ID from Flask g object"""
    return getattr(g, "user_id", None)
