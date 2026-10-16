from app.core.supabase_gateway import SupabaseGateway, gateway

REQUEST_FIELDS = 'id,activity_id,requester_user_id,status,created_at'


class ActivityRequestRepository:
    def __init__(self, client: SupabaseGateway | None = None) -> None:
        self._client = client or gateway

    async def list_for_requester(self, requester_user_id: str, token: str) -> list[dict]:
        response = await self._client.request(
            'GET',
            '/rest/v1/activity_requests',
            token,
            params={
                'select': REQUEST_FIELDS,
                'requester_user_id': 'eq.' + requester_user_id,
                'order': 'created_at.desc',
            },
        )
        return response.json()

    async def count_accepted(self, activity_id: str, token: str) -> int:
        response = await self._client.request(
            'GET',
            '/rest/v1/activity_requests',
            token,
            params={
                'select': 'id',
                'activity_id': 'eq.' + activity_id,
                'status': 'eq.accepted',
            },
        )
        return len(response.json())

    async def insert(self, requester_user_id: str, activity_id: str, token: str) -> dict:
        response = await self._client.request(
            'POST',
            '/rest/v1/activity_requests',
            token,
            json={
                'activity_id': activity_id,
                'requester_user_id': requester_user_id,
                'status': 'pending',
            },
        )
        rows = response.json()
        if not rows:
            raise LookupError('Join request was not returned after insert')
        return rows[0]
