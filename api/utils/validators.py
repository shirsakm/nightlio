from typing import Any, Dict, List
from datetime import datetime

def validate_mood_value(mood: Any) -> bool:
    """Validate that mood is an integer between 1 and 5"""
    return isinstance(mood, int) and 1 <= mood <= 5

def validate_required_fields(data: Dict, required_fields: List[str]) -> List[str]:
    """Validate that all required fields are present and not empty"""
    missing_fields = []
    for field in required_fields:
        if field not in data or not data[field]:
            missing_fields.append(field)
    return missing_fields

def validate_date_format(date_str: str) -> bool:
    """Validate date string format"""
    try:
        # Try common date formats
        formats = ['%m/%d/%Y', '%Y-%m-%d', '%d/%m/%Y']
        for fmt in formats:
            try:
                datetime.strptime(date_str, fmt)
                return True
            except ValueError:
                continue
        return False
    except:
        return False

def sanitize_string(text: str) -> str:
    """Basic string sanitization"""
    if not isinstance(text, str):
        return ""
    return text.strip()[:10000]  # Limit length to prevent abuse