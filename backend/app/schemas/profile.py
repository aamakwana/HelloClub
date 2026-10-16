from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, model_validator

from app.schemas.activity import CATEGORIES

Gender = Literal['male', 'female', 'nonbinary', 'prefer_not_to_say']
SchoolOption = Literal['NTNU', 'BI', 'Other']
YearOfStudy = Literal['year_1', 'year_2', 'year_3', 'year_4', 'year_5', 'year_6_plus', 'phd', 'other']
Language = Literal['english', 'norwegian']
Interest = Literal['Café', 'Study', 'Concert', 'Food', 'Outdoors', 'Party', 'Other']
ALLOWED_INTERESTS = CATEGORIES


class ProfileIn(BaseModel):
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str = Field(min_length=1, max_length=80)
    gender: Gender
    age: int = Field(ge=16, le=120)
    study_programme: str = Field(min_length=1, max_length=120)
    year_of_study: YearOfStudy | None = None
    school_option: SchoolOption
    school_name: str = Field(min_length=1, max_length=120)
    city: Literal['Trondheim'] = 'Trondheim'
    languages: list[Language] = Field(min_length=1, max_length=2)
    interests: list[Interest] = Field(min_length=1)

    @field_validator('first_name', 'last_name', 'study_programme', 'school_name')
    @classmethod
    def clean_text(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError('This field cannot be blank')
        return stripped

    @field_validator('languages', mode='before')
    @classmethod
    def unique_languages(cls, value):
        if not isinstance(value, list):
            return value
        unique = list(dict.fromkeys(value))
        if not unique:
            raise ValueError('Choose at least one language')
        return unique

    @field_validator('interests', mode='before')
    @classmethod
    def unique_interests(cls, value):
        if not isinstance(value, list):
            return value
        unique = list(dict.fromkeys(value))
        if not unique:
            raise ValueError('Choose at least one interest')
        if any(item not in ALLOWED_INTERESTS for item in unique):
            raise ValueError('Choose interests from the list')
        return unique

    @model_validator(mode='after')
    def school_matches_option(self):
        if self.school_option in ('NTNU', 'BI'):
            self.school_name = self.school_option
        elif not self.school_name:
            raise ValueError('Add your school name')
        return self


class Profile(BaseModel):
    user_id: UUID
    first_name: str
    last_name: str
    gender: Gender
    age: int
    study_programme: str
    year_of_study: YearOfStudy | None = None
    school_option: SchoolOption
    school_name: str
    city: str
    languages: list[str]
    interests: list[str]


class HostPublicName(BaseModel):
    user_id: UUID
    first_name: str
