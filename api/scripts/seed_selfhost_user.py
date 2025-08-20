#!/usr/bin/env python3
"""
Seed script to ensure the default self-host user exists.
- Reads DEFAULT_SELF_HOST_ID from typed config (api/config.get_config)
- Uses sqlite3 via existing MoodDatabase + UserService
- Idempotent: safe to run multiple times; prints the resulting user id
"""
from __future__ import annotations

import sys
from pathlib import Path

# Ensure imports resolve when executing as a script: python api/scripts/seed_selfhost_user.py
API_DIR = Path(__file__).resolve().parent.parent
if str(API_DIR) not in sys.path:
    sys.path.insert(0, str(API_DIR))

from config import get_config  # noqa: E402
from database import MoodDatabase  # noqa: E402
from services.user_service import UserService  # noqa: E402


def seed_selfhost_user() -> dict:
    cfg = get_config()
    db = MoodDatabase()  # uses default sqlite path under data/nightlio.db
    user_service = UserService(db)
    user = user_service.ensure_local_user(cfg.DEFAULT_SELF_HOST_ID)
    return user


def main() -> int:
    user = seed_selfhost_user()
    # Print only the user id as required by the prompt
    print(user.get('id'))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
