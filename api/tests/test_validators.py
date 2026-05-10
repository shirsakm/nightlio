from api.utils.validators import sanitize_string, validate_mood_entry, validate_group_data

def test_sanitize_string():
    assert sanitize_string("hello") == "hello"
    assert sanitize_string("  world  ") == "world"
    assert sanitize_string("test\x00") == "test"
    assert sanitize_string(123) == ""
    assert sanitize_string("a" * 1500) == "a" * 1000

def test_validate_group_data():
    errors = validate_group_data({"name": ""})
    assert len(errors) == 1
    assert "Group name cannot be empty" in errors[0]
    
    errors = validate_group_data({"name": "Valid Group Name"})
    assert len(errors) == 0

    errors = validate_group_data({"name": "Invalid!"})
    assert len(errors) == 1
    assert "invalid characters" in errors[0]

def test_validate_mood_entry():
    errors = validate_mood_entry({"mood": 3, "content": "Hello", "date": "10/10/2023"})
    assert len(errors) == 0
    
    errors = validate_mood_entry({"mood": 6, "content": "", "date": "2023-10-10"})
    assert len(errors) == 3
