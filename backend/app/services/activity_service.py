from datetime import datetime, timedelta, timezone

from app.core.exceptions import DomainValidationError, ForbiddenError, NotFoundError, UpstreamError
from app.repositories.activity_repository import ActivityRepository
from app.repositories.activity_request_repository import ActivityRequestRepository
from app.schemas.activity import EditActivity, NewActivity

PLAN_EDIT_LOCK = timedelta(hours=12)
PLAN_EDIT_LOCKED_MESSAGE = (
    'Changes are locked 12 hours before the plan, because people have already said yes.'
)
SPACES_TOO_LOW_MESSAGE = 'Cannot reduce spaces below the number already accepted'


def _as_utc(value) -> datetime:
    if isinstance(value, datetime):
        dt = value
    else:
        dt = datetime.fromisoformat(str(value).replace('Z', '+00:00'))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


class ActivityService:
    def __init__(
        self,
        repository: ActivityRepository | None = None,
        requests: ActivityRequestRepository | None = None,
    ) -> None:
        self._repository = repository or ActivityRepository()
        self._requests = requests or ActivityRequestRepository()

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

    async def update_activity(self, host_user_id: str, token: str, activity_id: str, body: EditActivity) -> dict:
        existing = await self._repository.get_by_id(activity_id, token)
        if not existing:
            raise NotFoundError('This plan was not found')
        if existing['host_user_id'] != host_user_id:
            raise ForbiddenError('Only the host can edit this plan')
        now = datetime.now(timezone.utc)
        current_start = _as_utc(existing['starts_at'])
        if current_start <= now + PLAN_EDIT_LOCK:
            raise DomainValidationError(PLAN_EDIT_LOCKED_MESSAGE)
        if body.starts_at <= now:
            raise DomainValidationError('Choose a future date and time in Trondheim (Europe/Oslo)')
        accepted = await self._requests.count_accepted(activity_id, token)
        if body.max_participants < accepted + 1:
            raise DomainValidationError(SPACES_TOO_LOW_MESSAGE)
        payload = {
            'title': body.title,
            'place': body.place,
            'starts_at': body.starts_at.isoformat(),
            'max_participants': body.max_participants,
        }
        try:
            return await self._repository.update_for_host(activity_id, host_user_id, payload, token)
        except LookupError as exc:
            raise NotFoundError('This plan could not be updated') from exc
