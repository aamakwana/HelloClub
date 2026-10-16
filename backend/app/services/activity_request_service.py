from datetime import datetime, timezone

from app.core.exceptions import ConflictError, DomainValidationError, NotFoundError, UpstreamError
from app.repositories.activity_repository import ActivityRepository
from app.repositories.activity_request_repository import ActivityRequestRepository
from app.schemas.activity_request import NewActivityRequest


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
            raise DomainValidationError('This plan already has a full guest list')
        try:
            return await self._requests.insert(requester_user_id, activity_id, token)
        except ConflictError as exc:
            raise ConflictError('You already requested to join this plan') from exc
        except LookupError as exc:
            raise UpstreamError('Request saved but could not be read back; check insert and select policies') from exc
