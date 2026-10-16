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

    async def has_accepted(self, activity_id: str, requester_user_id: str, token: str) -> bool:
        response = await self._client.request(
            'GET',
            '/rest/v1/activity_requests',
            token,
            params={
                'select': 'id',
                'activity_id': 'eq.' + activity_id,
                'requester_user_id': 'eq.' + requester_user_id,
                'status': 'eq.accepted',
            },
        )
        return bool(response.json())

    async def list_for_activity_ids(self, activity_ids: list[str], token: str) -> list[dict]:
        if not activity_ids:
            return []
        response = await self._client.request(
            'GET',
            '/rest/v1/activity_requests',
            token,
            params={
                'select': REQUEST_FIELDS,
                'activity_id': 'in.(' + ','.join(activity_ids) + ')',
                'order': 'created_at.asc',
            },
        )
        return response.json()

    async def get_by_id(self, request_id: str, token: str) -> dict | None:
        response = await self._client.request(
            'GET',
            '/rest/v1/activity_requests',
            token,
            params={'select': REQUEST_FIELDS, 'id': 'eq.' + request_id},
        )
        rows = response.json()
        return rows[0] if rows else None

    async def update_status(self, request_id: str, status: str, token: str) -> dict:
        response = await self._client.request(
            'PATCH',
            '/rest/v1/activity_requests',
            token,
            params={'id': 'eq.' + request_id, 'status': 'eq.pending'},
            json={'status': status},
        )
        rows = response.json()
        if not rows:
            raise LookupError('Request was not updated')
        return rows[0]

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
