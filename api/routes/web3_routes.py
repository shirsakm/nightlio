from __future__ import annotations

from flask import Blueprint, jsonify
from typing import Any

# Use the typed runtime config to read flags and RPC URL
try:
    from api.config import get_config  # type: ignore
except Exception:  # fallback when running from api/ directly
    from config import get_config  # type: ignore


web3_bp = Blueprint("web3_bp", __name__)


@web3_bp.get("/web3/health")
def web3_health() -> Any:
    """Return simple Web3 connectivity health.

    Behavior:
    - Lazy-imports web3 to avoid hard dependency when disabled.
    - Does not expose RPC URL or contract details.
    - Times out quickly so it never blocks the app.
    - If web3 isn't installed while ENABLE_WEB3=true, returns 503.
    """

    cfg = get_config()

    # Lazy import web3 only inside the handler
    try:
        from web3 import Web3  # type: ignore
        from web3 import HTTPProvider  # type: ignore
    except Exception:
        # Web3 not installed while feature enabled; surface as 503
        return jsonify({"connected": False}), 503

    rpc_url = (cfg.WEB3_RPC_URL or "").strip()
    if not rpc_url:
        # Feature may be enabled but not configured yet
        return jsonify({"connected": False}), 200

    # Timebox RPC calls to avoid hanging
    timeout_seconds = 1.5
    try:
        provider = HTTPProvider(rpc_url, request_kwargs={"timeout": timeout_seconds})
        w3 = Web3(provider)

        connected = False
        # web3.py v6 uses is_connected(); v5 uses isConnected()
        try:
            if hasattr(w3, "is_connected"):
                connected = bool(getattr(w3, "is_connected")())
            else:
                connected = bool(getattr(w3, "isConnected")())
        except Exception:
            connected = False

        return jsonify({"connected": connected}), 200
    except Exception:
        # Any provider init/HTTP error -> report not connected
        return jsonify({"connected": False}), 200
