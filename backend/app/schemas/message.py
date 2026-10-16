from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class NewMessage(BaseModel):
    body: str = Field(min_length=1, max_length=150)

    @field_validator('body')
    @classmethod
    def clean(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError('Write a short message')
        if len(stripped) > 150:
            raise ValueError('Keep messages to 150 characters')
        return stripped


class Message(BaseModel):
    id: UUID
    plan_id: UUID
    sender_id: UUID
    body: str
    created_at: datetime
