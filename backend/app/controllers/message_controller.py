from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import current_identity
from app.core.exceptions import (
    AccessDeniedError,
    DomainValidationError,
    ForbiddenError,
    NotFoundError,
    ServiceUnavailableError,
    UpstreamError,
)
from app.schemas.message import NewMessage
from app.services.message_service import MessageService

router = APIRouter()
_service = MessageService()


def get_message_service() -> MessageService:
    return _service


def _http(exc: Exception) -> HTTPException:
    if isinstance(exc, AccessDeniedError):
        return HTTPException(401, str(exc))
    if isinstance(exc, ForbiddenError):
        return HTTPException(403, str(exc))
    if isinstance(exc, DomainValidationError):
        return HTTPException(422, str(exc))
    if isinstance(exc, NotFoundError):
        return HTTPException(404, str(exc))
    if isinstance(exc, ServiceUnavailableError):
        return HTTPException(503, str(exc))
    if isinstance(exc, UpstreamError):
        return HTTPException(502, str(exc))
    raise exc


@router.get('/activities/{activity_id}/messages')
async def list_plan_messages(
    activity_id: UUID,
    auth=Depends(current_identity),
    service: MessageService = Depends(get_message_service),
):
    user_id, token = auth
    try:
        return await service.list_for_plan(user_id, token, str(activity_id))
    except (
        AccessDeniedError,
        ForbiddenError,
        NotFoundError,
        ServiceUnavailableError,
        UpstreamError,
    ) as exc:
        raise _http(exc) from exc


@router.post('/activities/{activity_id}/messages', status_code=201)
async def create_plan_message(
    activity_id: UUID,
    body: NewMessage,
    auth=Depends(current_identity),
    service: MessageService = Depends(get_message_service),
):
    user_id, token = auth
    try:
        return await service.create_message(user_id, token, str(activity_id), body)
    except (
        AccessDeniedError,
        DomainValidationError,
        ForbiddenError,
        NotFoundError,
        ServiceUnavailableError,
        UpstreamError,
    ) as exc:
        raise _http(exc) from exc
