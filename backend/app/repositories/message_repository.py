from app.core.supabase_gateway import SupabaseGateway, gateway

MESSAGE_FIELDS = 'id,plan_id,sender_id,body,created_at'


class MessageRepository:
    def __init__(self, client: SupabaseGateway | None = None) -> None:
        self._client = client or gateway

    async def list_for_plan(self, plan_id: str, token: str) -> list[dict]:
        response = await self._client.request(
            'GET',
            '/rest/v1/messages',
            token,
            params={
                'select': MESSAGE_FIELDS,
                'plan_id': 'eq.' + plan_id,
                'order': 'created_at.asc',
            },
        )
        return response.json()

    async def count_for_sender(self, plan_id: str, sender_id: str, token: str) -> int:
        response = await self._client.request(
            'GET',
            '/rest/v1/messages',
            token,
            params={
                'select': 'id',
                'plan_id': 'eq.' + plan_id,
                'sender_id': 'eq.' + sender_id,
            },
        )
        return len(response.json())

    async def insert(self, plan_id: str, sender_id: str, body: str, token: str) -> dict:
        response = await self._client.request(
            'POST',
            '/rest/v1/messages',
            token,
            json={'plan_id': plan_id, 'sender_id': sender_id, 'body': body},
        )
        rows = response.json()
        if not rows:
            raise LookupError('Message was not returned after insert')
        return rows[0]
