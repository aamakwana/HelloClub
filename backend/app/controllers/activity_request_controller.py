from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import current_identity
from app.core.exceptions import (
    AccessDeniedError,
    ConflictError,
    DomainValidationError,
    NotFoundError,
    ServiceUnavailableError,
    UpstreamError,
)
from app.schemas.activity_request import NewActivityRequest
from app.services.activity_request_service import ActivityRequestService

router = APIRouter()
_service = ActivityRequestService()


def get_activity_request_service() -> ActivityRequestService:
    return _service


def _http(exc: Exception) -> HTTPException:
    if isinstance(exc, AccessDeniedError):
        return HTTPException(401, str(exc))
    if isinstance(exc, DomainValidationError):
        return HTTPException(422, str(exc))
    if isinstance(exc, NotFoundError):
        return HTTPException(404, str(exc))
    if isinstance(exc, ConflictError):
        return HTTPException(409, str(exc))
    if isinstance(exc, ServiceUnavailableError):
        return HTTPException(503, str(exc))
    if isinstance(exc, UpstreamError):
        return HTTPException(502, str(exc))
    raise exc


@router.get('/activity-requests')
async def list_activity_requests(
    auth=Depends(current_identity),
    service: ActivityRequestService = Depends(get_activity_request_service),
):
    user_id, token = auth
    try:
        return await service.list_mine(user_id, token)
    except (AccessDeniedError, ServiceUnavailableError, UpstreamError) as exc:
        raise _http(exc) from exc


@router.post('/activity-requests', status_code=201)
async def create_activity_request(
    body: NewActivityRequest,
    auth=Depends(current_identity),
    service: ActivityRequestService = Depends(get_activity_request_service),
):
    user_id, token = auth
    try:
        return await service.create_request(user_id, token, body)
    except (
        AccessDeniedError,
        ConflictError,
        DomainValidationError,
        NotFoundError,
        ServiceUnavailableError,
        UpstreamError,
    ) as exc:
        raise _http(exc) from exc
