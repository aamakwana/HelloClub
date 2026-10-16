from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.core.auth import current_identity
from app.core.exceptions import (
    AccessDeniedError,
    ConflictError,
    DomainValidationError,
    ForbiddenError,
    NotFoundError,
    ServiceUnavailableError,
    UpstreamError,
)
from app.schemas.activity_request import NewActivityRequest, RequestDecision
from app.services.activity_request_service import ActivityRequestService

router = APIRouter()
_service = ActivityRequestService()


def get_activity_request_service() -> ActivityRequestService:
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


@router.get('/activity-requests/received')
async def list_received_activity_requests(
    auth=Depends(current_identity),
    service: ActivityRequestService = Depends(get_activity_request_service),
):
    user_id, token = auth
    try:
        return await service.list_received(user_id, token)
    except (AccessDeniedError, ServiceUnavailableError, UpstreamError) as exc:
        raise _http(exc) from exc


@router.patch('/activity-requests/{request_id}')
async def decide_activity_request(
    request_id: UUID,
    body: RequestDecision,
    auth=Depends(current_identity),
    service: ActivityRequestService = Depends(get_activity_request_service),
):
    user_id, token = auth
    try:
        return await service.decide_request(user_id, token, str(request_id), body)
    except (
        AccessDeniedError,
        ConflictError,
        DomainValidationError,
        ForbiddenError,
        NotFoundError,
        ServiceUnavailableError,
        UpstreamError,
    ) as exc:
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
