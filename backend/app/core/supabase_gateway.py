import httpx

from app.core.config import settings
from app.core.exceptions import (
    AccessDeniedError,
    ConflictError,
    DomainValidationError,
    ServiceUnavailableError,
    UpstreamError,
)


class SupabaseGateway:
    """Shared HTTP adapter for Auth and PostgREST. Repositories own the paths."""

    def __init__(self, base_url: str | None = None, api_key: str | None = None) -> None:
        self._base_url = (base_url or settings.supabase_url).rstrip('/')
        self._api_key = api_key or settings.supabase_publishable_key

    async def request(self, method: str, path: str, token: str, **kwargs):
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                result = await client.request(
                    method,
                    self._base_url + path,
                    headers={
                        'apikey': self._api_key,
                        'Authorization': 'Bearer ' + token,
                        'Prefer': 'return=representation',
                    },
                    **kwargs,
                )
        except httpx.RequestError as exc:
            raise ServiceUnavailableError('Database or authentication service unavailable') from exc
        if result.status_code in (401, 403):
            raise AccessDeniedError('Session expired or access denied')
        if not result.is_error:
            return result
        payload = {}
        try:
            payload = result.json()
        except ValueError:
            payload = {}
        code = str(payload.get('code') or '')
        message = str(payload.get('message') or '')
        details = str(payload.get('details') or '')
        blob = f'{path} {message} {details}'.lower()
        if result.status_code == 409 or code == '23505':
            if 'activity_requests' in blob:
                raise ConflictError('You already requested to join')
            raise ConflictError('This change conflicts with an existing record')
        lowered = message.lower()
        if 'this activity is full' in lowered or 'full guest list' in lowered:
            raise DomainValidationError('This activity is full')
        if 'already started' in lowered:
            raise DomainValidationError('This plan has already started')
        if 'changes are locked' in lowered:
            raise DomainValidationError(
                'Changes are locked 12 hours before the plan, because people have already said yes.'
            )
        if 'cannot reduce spaces' in lowered:
            raise DomainValidationError('Cannot reduce spaces below the number already accepted')
        if 'only pending' in lowered:
            raise DomainValidationError('Only pending requests can be decided')
        if 'all your messages' in lowered:
            raise DomainValidationError("That's all your messages - see you there!")
        raise UpstreamError('Supabase request failed; check project configuration and schema')


gateway = SupabaseGateway()
