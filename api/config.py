import os
from dataclasses import dataclass
from typing import Optional, Dict, Any
from pathlib import Path

# Optional .env loader: only if python-dotenv is installed.
try:
    from dotenv import load_dotenv  # type: ignore

    _ENV_PATH = Path(__file__).parent.parent / '.env'
    if _ENV_PATH.exists():
        # Load from project root so simple self-host works OOTB.
        load_dotenv(_ENV_PATH)
except Exception:
    # Silently ignore if dotenv is not installed or fails; env vars still work.
    pass


class Config:
    """Existing Flask-style configuration (kept for backward compatibility).

    Note: New features should prefer the typed config via get_config().
    """

    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'

    # Database configuration
    DATABASE_PATH = os.environ.get('DATABASE_PATH') or os.path.join(
        Path(__file__).parent.parent, 'data', 'nightlio.db'
    )

    # CORS configuration
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:5173,https://nightlio.vercel.app').split(',')

    # Google OAuth configuration
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')

    # JWT configuration (legacy)
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False

    # Use Railway's writable directory for database
    DATABASE_PATH = os.environ.get('DATABASE_PATH') or '/tmp/nightlio.db'


class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    # Use a file-backed SQLite DB so multiple connections see the same data
    DATABASE_PATH = '/tmp/nightlio_test.db'


# Configuration mapping (legacy app factory still uses this).
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig,
}


# --- New typed configuration for optional features ---

# Avoid importing optional helpers with package-level relative import here,
# as this module is also used directly in scripts. The utils package exists,
# and when imported from the app (which sets PYTHONPATH to api/) this works.
try:
    from utils.is_truthy import is_truthy  # type: ignore
except Exception:
    # Tiny fallback in case utils isn't importable for ad-hoc scripts.
    def is_truthy(value: Optional[str]) -> bool:  # type: ignore
        if value is None:
            return False
        return str(value).strip().lower() in {'1', 'true', 'yes', 'on'}


@dataclass(frozen=True)
class ConfigData:
    """Typed runtime configuration for optional features.

    Only use these values on the server; never expose secrets to the client.

    If you use SQLAlchemy elsewhere in the project, prefer keeping this
    module's surface the same and swap underlying DB access in services.
    """

    # Feature flags
    ENABLE_GOOGLE_OAUTH: bool
    ENABLE_WEB3: bool

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str]
    GOOGLE_CLIENT_SECRET: Optional[str]
    GOOGLE_CALLBACK_URL: Optional[str]

    # Web3
    WEB3_RPC_URL: Optional[str]
    WEB3_CONTRACT_ADDRESS: Optional[str]

    # Auth
    JWT_SECRET: str
    DEFAULT_SELF_HOST_ID: str = 'selfhost_default_user'


_CONFIG_SINGLETON: Optional[ConfigData] = None


def _load_config_from_env() -> ConfigData:
    """Load ConfigData from environment variables.

    - Booleans parsed with is_truthy.
    - Secrets are not logged or exposed.
    - JWT_SECRET falls back to JWT_SECRET_KEY/SECRET_KEY/dev default.
    """

    enable_google = is_truthy(os.getenv('ENABLE_GOOGLE_OAUTH'))
    enable_web3 = is_truthy(os.getenv('ENABLE_WEB3'))

    # Secrets pulled from env; don't default to empty string.
    jwt_secret = (
        os.getenv('JWT_SECRET')
        or os.getenv('JWT_SECRET_KEY')
        or os.getenv('SECRET_KEY')
        or 'dev-secret-key-change-in-production'
    )

    return ConfigData(
        ENABLE_GOOGLE_OAUTH=enable_google,
        ENABLE_WEB3=enable_web3,
        GOOGLE_CLIENT_ID=os.getenv('GOOGLE_CLIENT_ID'),
        GOOGLE_CLIENT_SECRET=os.getenv('GOOGLE_CLIENT_SECRET'),
        GOOGLE_CALLBACK_URL=os.getenv('GOOGLE_CALLBACK_URL'),
        WEB3_RPC_URL=os.getenv('WEB3_RPC_URL'),
        WEB3_CONTRACT_ADDRESS=os.getenv('WEB3_CONTRACT_ADDRESS'),
        JWT_SECRET=jwt_secret,
        DEFAULT_SELF_HOST_ID=os.getenv('DEFAULT_SELF_HOST_ID') or 'selfhost_default_user',
    )


def get_config() -> ConfigData:
    """Return a process-wide ConfigData singleton.

    Loads from environment on first access; subsequent calls return the same instance.
    """
    global _CONFIG_SINGLETON
    if _CONFIG_SINGLETON is None:
        _CONFIG_SINGLETON = _load_config_from_env()
    return _CONFIG_SINGLETON


def config_to_public_dict(cfg: ConfigData) -> Dict[str, Any]:
    """Return a safe public configuration for the frontend.

    Only returns non-secret feature flags.
    """
    return {
        'enable_google_oauth': bool(cfg.ENABLE_GOOGLE_OAUTH),
        'enable_web3': bool(cfg.ENABLE_WEB3),
    }