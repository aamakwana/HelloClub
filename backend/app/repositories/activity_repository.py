from app.core.supabase_gateway import SupabaseGateway, gateway

ACTIVITY_FIELDS = 'id,host_user_id,title,category,place,starts_at,max_participants,audience_preference,description,created_at'


class ActivityRepository:
    def __init__(self, client: SupabaseGateway | None = None) -> None:
        self._client = client or gateway

    async def get_by_id(self, activity_id: str, token: str) -> dict | None:
        response = await self._client.request(
            'GET',
            '/rest/v1/activities',
            token,
            params={'select': ACTIVITY_FIELDS, 'id': 'eq.' + activity_id},
        )
        rows = response.json()
        return rows[0] if rows else None

    async def list_all(self, token: str) -> list[dict]:
        response = await self._client.request(
            'GET',
            '/rest/v1/activities',
            token,
            params={'select': ACTIVITY_FIELDS, 'order': 'starts_at.asc'},
        )
        return response.json()

    async def insert(self, host_user_id: str, payload: dict, token: str) -> dict:
        response = await self._client.request(
            'POST',
            '/rest/v1/activities',
            token,
            json={'host_user_id': host_user_id, **payload},
        )
        rows = response.json()
        if not rows:
            raise LookupError('Activity was not returned after insert')
        return rows[0]
