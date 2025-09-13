from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime


@dataclass
class MoodEntry:
    id: Optional[int]
    date: str
    mood: int
    content: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    selections: Optional[List] = None

    def to_dict(self):
        return {
            "id": self.id,
            "date": self.date,
            "mood": self.mood,
            "content": self.content,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "selections": self.selections or [],
        }


@dataclass
class Group:
    id: Optional[int]
    name: str
    options: Optional[List] = None
    created_at: Optional[datetime] = None

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "options": [
                option.to_dict() if hasattr(option, "to_dict") else option
                for option in (self.options or [])
            ],
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


@dataclass
class GroupOption:
    id: Optional[int]
    group_id: int
    name: str
    created_at: Optional[datetime] = None

    def to_dict(self):
        return {
            "id": self.id,
            "group_id": self.group_id,
            "name": self.name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
