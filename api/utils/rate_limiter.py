from functools import wraps
from flask import request, jsonify, current_app
from collections import defaultdict
from datetime import datetime, timedelta, timezone
import threading

# Simple in-memory rate limiter (for production, use Redis)
request_counts = defaultdict(list)
lock = threading.Lock()


def rate_limit(max_requests=100, window_minutes=15):
    """Rate limiting decorator"""

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if current_app.config.get("TESTING"):
                return f(*args, **kwargs)

            client_ip = request.environ.get("HTTP_X_FORWARDED_FOR", request.remote_addr)
            now = datetime.now(timezone.utc)
            window_start = now - timedelta(minutes=window_minutes)

            with lock:
                # Clean old requests
                request_counts[client_ip] = [
                    req_time
                    for req_time in request_counts[client_ip]
                    if req_time > window_start
                ]

                # Check rate limit
                if len(request_counts[client_ip]) >= max_requests:
                    return (
                        jsonify(
                            {"error": "Rate limit exceeded. Please try again later."}
                        ),
                        429,
                    )

                # Add current request
                request_counts[client_ip].append(now)

            return f(*args, **kwargs)

        return decorated_function

    return decorator
