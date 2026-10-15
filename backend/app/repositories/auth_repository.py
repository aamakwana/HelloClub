from app.core.exceptions import AccessDeniedError
from app.core.supabase_gateway import SupabaseGateway, gateway


class AuthRepository:
    def __init__(self, client: SupabaseGateway | None = None) -> None:
        self._client = client or gateway

    async def fetch_user(self, token: str) -> dict:
        result = await self._client.request('GET', '/auth/v1/user', token)
        user = result.json()
        if not user.get('id'):
            raise AccessDeniedError('Invalid session')
        return user
