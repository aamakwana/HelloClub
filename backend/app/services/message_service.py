from app.core.exceptions import DomainValidationError, ForbiddenError, NotFoundError, UpstreamError
from app.repositories.activity_repository import ActivityRepository
from app.repositories.activity_request_repository import ActivityRequestRepository
from app.repositories.message_repository import MessageRepository
from app.schemas.message import NewMessage

MESSAGE_LIMIT = 10


class MessageService:
    def __init__(
        self,
        messages: MessageRepository | None = None,
        activities: ActivityRepository | None = None,
        requests: ActivityRequestRepository | None = None,
    ) -> None:
        self._messages = messages or MessageRepository()
        self._activities = activities or ActivityRepository()
        self._requests = requests or ActivityRequestRepository()

    async def _require_member(self, user_id: str, token: str, plan_id: str) -> dict:
        activity = await self._activities.get_by_id(plan_id, token)
        if not activity:
            raise NotFoundError('This plan was not found')
        if activity['host_user_id'] == user_id:
            return activity
        if await self._requests.has_accepted(plan_id, user_id, token):
            return activity
        raise ForbiddenError('Only the host and accepted guests can use this chat')

    async def list_for_plan(self, user_id: str, token: str, plan_id: str) -> dict:
        activity = await self._require_member(user_id, token, plan_id)
        sent = await self._messages.count_for_sender(plan_id, user_id, token)
        return {
            'activity': {
                'id': activity['id'],
                'title': activity['title'],
                'place': activity['place'],
                'starts_at': activity['starts_at'],
                'host_user_id': activity['host_user_id'],
                'details_updated_at': activity.get('details_updated_at'),
            },
            'messages': await self._messages.list_for_plan(plan_id, token),
            'messages_left': max(0, MESSAGE_LIMIT - sent),
        }

    async def create_message(self, user_id: str, token: str, plan_id: str, body: NewMessage) -> dict:
        await self._require_member(user_id, token, plan_id)
        sent = await self._messages.count_for_sender(plan_id, user_id, token)
        if sent >= MESSAGE_LIMIT:
            raise DomainValidationError("That's all your messages - see you there!")
        try:
            return await self._messages.insert(plan_id, user_id, body.body, token)
        except DomainValidationError:
            raise
        except LookupError as exc:
            raise UpstreamError('Message saved but could not be read back; check insert and select policies') from exc
