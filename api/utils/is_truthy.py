def is_truthy(value) -> bool:
    """Parse common truthy strings and values.

    Accepted truthy: '1', 'true', 'yes', 'on' (case-insensitive). Others are False.
    None and empty strings are False.
    """
    if value is None:
        return False
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {"1", "true", "yes", "on"}
