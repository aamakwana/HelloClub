from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import current_identity
from app.core.exceptions import AccessDeniedError, DomainValidationError, ServiceUnavailableError, UpstreamError
from app.schemas.activity import NewActivity
from app.services.activity_service import ActivityService

router = APIRouter()
_service = ActivityService()


def get_activity_service() -> ActivityService:
    return _service


def _http(exc: Exception) -> HTTPException:
    if isinstance(exc, AccessDeniedError):
        return HTTPException(401, str(exc))
    if isinstance(exc, DomainValidationError):
        return HTTPException(422, str(exc))
    if isinstance(exc, ServiceUnavailableError):
        return HTTPException(503, str(exc))
    if isinstance(exc, UpstreamError):
        return HTTPException(502, str(exc))
    raise exc


@router.get('/activities')
async def list_activities(auth=Depends(current_identity), service: ActivityService = Depends(get_activity_service)):
    _user_id, token = auth
    try:
        return await service.list_activities(token)
    except (AccessDeniedError, ServiceUnavailableError, UpstreamError) as exc:
        raise _http(exc) from exc


@router.post('/activities', status_code=201)
async def create_activity(
    body: NewActivity,
    auth=Depends(current_identity),
    service: ActivityService = Depends(get_activity_service),
):
    user_id, token = auth
    try:
        return await service.create_activity(user_id, token, body)
    except (AccessDeniedError, DomainValidationError, ServiceUnavailableError, UpstreamError) as exc:
        raise _http(exc) from exc
