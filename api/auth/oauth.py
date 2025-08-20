from flask import Blueprint, current_app, redirect, request, jsonify, url_for

# Lazy-load heavy/optional dependencies inside handlers to avoid import errors
# when OAuth is disabled or deps aren't installed.

oauth_bp = Blueprint("oauth", __name__)


@oauth_bp.get("/auth/login/google")
def login_google():
    # Import inside route to keep module import cheap and optional
    try:
        from authlib.integrations.flask_client import OAuth  # type: ignore
    except Exception as e:
        return jsonify({"error": "OAuth dependencies not installed"}), 503

    cfg = _get_runtime_config()
    if not cfg["enable_google_oauth"]:
        return jsonify({"error": "Google OAuth disabled"}), 404

    oauth = OAuth(current_app)
    oauth.register(
        name="google",
        client_id=cfg["GOOGLE_CLIENT_ID"],
        client_secret=cfg.get("GOOGLE_CLIENT_SECRET"),
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )

    redirect_uri = cfg.get("GOOGLE_CALLBACK_URL") or url_for("oauth.google_callback", _external=True)
    return oauth.google.authorize_redirect(redirect_uri)


@oauth_bp.get("/auth/callback/google")
def google_callback():
    try:
        from authlib.integrations.flask_client import OAuth  # type: ignore
    except Exception:
        return jsonify({"error": "OAuth dependencies not installed"}), 503

    cfg = _get_runtime_config()
    if not cfg["enable_google_oauth"]:
        return jsonify({"error": "Google OAuth disabled"}), 404

    oauth = OAuth(current_app)
    oauth.register(
        name="google",
        client_id=cfg["GOOGLE_CLIENT_ID"],
        client_secret=cfg.get("GOOGLE_CLIENT_SECRET"),
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )

    try:
        token = oauth.google.authorize_access_token()
        userinfo = oauth.google.parse_id_token(token)
    except Exception as e:
        return jsonify({"error": "OAuth callback failed"}), 400

    # Extract user details
    provider = "google"
    provider_user_id = userinfo.get("sub")
    email = userinfo.get("email")
    name = userinfo.get("name")
    avatar = userinfo.get("picture")

    # Delegate to user service (existing service)
    user_service = current_app.extensions.get("user_service")  # type: ignore[attr-defined]
    if user_service is None:
        return jsonify({"error": "User service unavailable"}), 500

    # Reuse the existing method for now; a dedicated handler will be added later
    # Use idempotent upsert path
    user = user_service.handle_oauth_login('google', provider_user_id, email, name, avatar)

    # Issue JWT using existing app config (legacy)
    try:
        from jose import jwt  # type: ignore
        from datetime import datetime, timedelta

        payload = {
            'user_id': user['id'],
            'exp': datetime.utcnow() + timedelta(seconds=current_app.config['JWT_ACCESS_TOKEN_EXPIRES']),
            'iat': datetime.utcnow()
        }
        token = jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
    except Exception:
        return jsonify({"error": "Token issuance failed"}), 500

    # Return token in JSON; optionally switch to HttpOnly cookie in future
    return jsonify({"token": token, "user": {"id": user["id"], "name": user["name"], "email": user["email"], "avatar_url": user.get("avatar_url")}})


def _get_runtime_config():
    # Importing here avoids import cycles at module import time
    from api.config import get_config, config_to_public_dict
    cfg = get_config()
    public = config_to_public_dict(cfg)
    # Merge select private fields required for OAuth flow (not exposed to client)
    return {
        **public,
        "GOOGLE_CLIENT_ID": cfg.GOOGLE_CLIENT_ID,
        "GOOGLE_CLIENT_SECRET": cfg.GOOGLE_CLIENT_SECRET,
        "GOOGLE_CALLBACK_URL": cfg.GOOGLE_CALLBACK_URL,
    }
