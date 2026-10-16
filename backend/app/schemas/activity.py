from datetime import datetime, timezone
from typing import Literal
from uuid import UUID
from zoneinfo import ZoneInfo

from pydantic import BaseModel, Field, field_validator

CATEGORIES = ('Café', 'Study', 'Concert', 'Food', 'Outdoors', 'Party', 'Other')
OSLO = ZoneInfo('Europe/Oslo')
Category = Literal['Café', 'Study', 'Concert', 'Food', 'Outdoors', 'Party', 'Other']
AudiencePreference = Literal['everyone', 'women_only', 'men_only']
MAX_TOTAL_PARTICIPANTS = 50
MAX_GUESTS = MAX_TOTAL_PARTICIPANTS - 1


class NewActivity(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    category: Category
    place: str = Field(min_length=1, max_length=200)
    starts_at: datetime
    max_participants: int = Field(ge=2, le=MAX_TOTAL_PARTICIPANTS)
    audience_preference: AudiencePreference = 'everyone'
    description: str | None = Field(default=None, max_length=500)

    @field_validator('title', 'place')
    @classmethod
    def clean_required(cls, value: str) -> str:
        if not value.strip():
            raise ValueError('This field cannot be blank')
        return value.strip()

    @field_validator('description')
    @classmethod
    def clean_description(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        return stripped or None

    @field_validator('starts_at', mode='before')
    @classmethod
    def parse_trondheim_time(cls, value):
        if isinstance(value, datetime):
            dt = value
        elif isinstance(value, str):
            dt = datetime.fromisoformat(value.replace('Z', '+00:00'))
        else:
            raise ValueError('Invalid date and time')
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=OSLO)
        return dt.astimezone(timezone.utc)

    @field_validator('max_participants')
    @classmethod
    def guests_plus_host(cls, value: int) -> int:
        guests = value - 1
        if guests < 1 or guests > MAX_GUESTS:
            raise ValueError('Guest limit must be a whole number from 1 to 49')
        return value


class Activity(BaseModel):
    id: UUID
    host_user_id: UUID
    title: str
    category: str
    place: str
    starts_at: datetime
    max_participants: int
    audience_preference: AudiencePreference = 'everyone'
    description: str | None
    created_at: datetime
