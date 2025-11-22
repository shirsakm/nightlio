# Ensure the api package is importable during tests
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
api_dir = root / "api"
if str(api_dir) not in sys.path:
    sys.path.insert(0, str(api_dir))
