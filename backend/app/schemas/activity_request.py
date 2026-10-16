from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel

RequestStatus = Literal['pending', 'accepted', 'declined', 'cancelled']


class NewActivityRequest(BaseModel):
    activity_id: UUID


class ActivityRequest(BaseModel):
    id: UUID
    activity_id: UUID
    requester_user_id: UUID
    status: RequestStatus
    created_at: datetime
