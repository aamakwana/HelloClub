from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class NewTask(BaseModel):
    title: str = Field(min_length=1, max_length=200)

    @field_validator('title')
    @classmethod
    def clean(cls, value: str) -> str:
        if not value.strip():
            raise ValueError('Title cannot be blank')
        return value.strip()


class Task(BaseModel):
    id: UUID
    title: str
    created_at: datetime
