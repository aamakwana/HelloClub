from datetime import datetime, timezone

from app.core.exceptions import DomainValidationError, UpstreamError
from app.repositories.activity_repository import ActivityRepository
from app.schemas.activity import NewActivity


class ActivityService:
    def __init__(self, repository: ActivityRepository | None = None) -> None:
        self._repository = repository or ActivityRepository()

    async def list_activities(self, token: str) -> list[dict]:
        return await self._repository.list_all(token)

    async def create_activity(self, host_user_id: str, token: str, body: NewActivity) -> dict:
        if body.starts_at <= datetime.now(timezone.utc):
            raise DomainValidationError('Choose a future date and time in Trondheim (Europe/Oslo)')
        payload = {
            'title': body.title,
            'category': body.category,
            'place': body.place,
            'starts_at': body.starts_at.isoformat(),
            'max_participants': body.max_participants,
            'audience_preference': body.audience_preference,
            'description': body.description,
        }
        try:
            return await self._repository.insert(host_user_id, payload, token)
        except LookupError as exc:
            raise UpstreamError('Activity saved but could not be read back; check insert and select policies') from exc
