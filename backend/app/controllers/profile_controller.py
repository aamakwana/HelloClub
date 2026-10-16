from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.auth import current_identity
from app.core.exceptions import (
    AccessDeniedError,
    ConflictError,
    DomainValidationError,
    NotFoundError,
    ServiceUnavailableError,
    UpstreamError,
)
from app.schemas.profile import ProfileIn
from app.services.profile_service import ProfileService

router = APIRouter()
_service = ProfileService()


def get_profile_service() -> ProfileService:
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


@router.get('/profiles/me')
async def get_my_profile(auth=Depends(current_identity), service: ProfileService = Depends(get_profile_service)):
    user_id, token = auth
    try:
        return await service.get_own(user_id, token)
    except (AccessDeniedError, NotFoundError, ServiceUnavailableError, UpstreamError) as exc:
        raise _http(exc) from exc


@router.put('/profiles/me')
async def save_my_profile(
    body: ProfileIn,
    auth=Depends(current_identity),
    service: ProfileService = Depends(get_profile_service),
):
    user_id, token = auth
    try:
        return await service.save_own(user_id, token, body)
    except (
        AccessDeniedError,
        ConflictError,
        DomainValidationError,
        NotFoundError,
        ServiceUnavailableError,
        UpstreamError,
    ) as exc:
        raise _http(exc) from exc


@router.get('/profiles/host-names')
async def list_host_first_names(
    ids: list[UUID] = Query(default=[]),
    auth=Depends(current_identity),
    service: ProfileService = Depends(get_profile_service),
):
    _user_id, token = auth
    try:
        return await service.host_first_names([str(item) for item in ids], token)
    except (AccessDeniedError, ServiceUnavailableError, UpstreamError) as exc:
        raise _http(exc) from exc
