from datetime import datetime
from api.models.mood_entry import MoodEntry, Group, GroupOption

def test_mood_entry_to_dict():
    dt = datetime(2023, 10, 10, 12, 0, 0)
    entry = MoodEntry(
        id=1,
        date="10/10/2023",
        mood=4,
        content="Good day",
        created_at=dt,
        selections=[1, 2]
    )
    result = entry.to_dict()
    assert result["id"] == 1
    assert result["date"] == "10/10/2023"
    assert result["mood"] == 4
    assert result["content"] == "Good day"
    assert result["created_at"] == "2023-10-10T12:00:00"
    assert result["updated_at"] is None
    assert result["selections"] == [1, 2]

def test_group_option_to_dict():
    dt = datetime(2023, 10, 10, 12, 0, 0)
    option = GroupOption(id=1, group_id=2, name="Option 1", created_at=dt)
    result = option.to_dict()
    assert result["id"] == 1
    assert result["group_id"] == 2
    assert result["name"] == "Option 1"
    assert result["created_at"] == "2023-10-10T12:00:00"

def test_group_to_dict():
    dt = datetime(2023, 10, 10, 12, 0, 0)
    option = GroupOption(id=1, group_id=1, name="Option 1", created_at=dt)
    group = Group(id=1, name="Group 1", options=[option], created_at=dt)
    result = group.to_dict()
    assert result["id"] == 1
    assert result["name"] == "Group 1"
    assert result["created_at"] == "2023-10-10T12:00:00"
    assert len(result["options"]) == 1
    assert result["options"][0]["id"] == 1
    assert result["options"][0]["name"] == "Option 1"
