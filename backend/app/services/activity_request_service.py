from datetime import datetime, timezone

from app.core.exceptions import (
    ConflictError,
    DomainValidationError,
    ForbiddenError,
    NotFoundError,
    UpstreamError,
)
from app.repositories.activity_repository import ActivityRepository
from app.repositories.activity_request_repository import ActivityRequestRepository
from app.schemas.activity_request import NewActivityRequest, RequestDecision


class ActivityRequestService:
    def __init__(
        self,
        requests: ActivityRequestRepository | None = None,
        activities: ActivityRepository | None = None,
    ) -> None:
        self._requests = requests or ActivityRequestRepository()
        self._activities = activities or ActivityRepository()

    async def list_mine(self, requester_user_id: str, token: str) -> list[dict]:
        return await self._requests.list_for_requester(requester_user_id, token)

    async def list_received(self, host_user_id: str, token: str) -> list[dict]:
        activity_ids = await self._activities.list_ids_for_host(host_user_id, token)
        return await self._requests.list_for_activity_ids(activity_ids, token)

    async def decide_request(self, host_user_id: str, token: str, request_id: str, body: RequestDecision) -> dict:
        row = await self._requests.get_by_id(request_id, token)
        if not row:
            raise NotFoundError('This request was not found')
        if row['requester_user_id'] == host_user_id:
            raise ForbiddenError('You cannot accept or decline your own request')
        activity = await self._activities.get_by_id(row['activity_id'], token)
        if not activity:
            raise NotFoundError('This plan was not found')
        if activity['host_user_id'] != host_user_id:
            raise ForbiddenError('Only the host can accept or decline this request')
        if row['status'] != 'pending':
            raise DomainValidationError('Only pending requests can be decided')
        starts_at = datetime.fromisoformat(activity['starts_at'].replace('Z', '+00:00'))
        if starts_at <= datetime.now(timezone.utc):
            raise DomainValidationError('This plan has already started')
        if body.status == 'accepted':
            guest_limit = int(activity['max_participants']) - 1
            accepted = await self._requests.count_accepted(row['activity_id'], token)
            if accepted >= guest_limit:
                raise DomainValidationError('This activity is full')
        try:
            return await self._requests.update_status(request_id, body.status, token)
        except LookupError as exc:
            raise NotFoundError('This request could not be updated') from exc

    async def create_request(self, requester_user_id: str, token: str, body: NewActivityRequest) -> dict:
        activity_id = str(body.activity_id)
        activity = await self._activities.get_by_id(activity_id, token)
        if not activity:
            raise NotFoundError('This plan was not found')
        if activity['host_user_id'] == requester_user_id:
            raise DomainValidationError('You cannot request to join your own plan')
        starts_at = datetime.fromisoformat(activity['starts_at'].replace('Z', '+00:00'))
        if starts_at <= datetime.now(timezone.utc):
            raise DomainValidationError('This plan has already started')
        guest_limit = int(activity['max_participants']) - 1
        accepted = await self._requests.count_accepted(activity_id, token)
        if accepted >= guest_limit:
            raise DomainValidationError('This activity is full')
        try:
            return await self._requests.insert(requester_user_id, activity_id, token)
        except ConflictError as exc:
            raise ConflictError('You already requested to join') from exc
        except LookupError as exc:
            raise UpstreamError('Request saved but could not be read back; check insert and select policies') from exc
