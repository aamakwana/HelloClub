import httpx

from app.core.config import settings
from app.core.exceptions import AccessDeniedError, ConflictError, ServiceUnavailableError, UpstreamError


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
        if result.status_code == 409:
            raise ConflictError('This change conflicts with an existing record')
        if result.is_error:
            raise UpstreamError('Supabase request failed; check project configuration and schema')
        return result


gateway = SupabaseGateway()
