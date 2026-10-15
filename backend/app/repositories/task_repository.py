from uuid import UUID

from app.core.supabase_gateway import SupabaseGateway, gateway


class TaskRepository:
    def __init__(self, client: SupabaseGateway | None = None) -> None:
        self._client = client or gateway

    async def list_for_user(self, user_id: str, token: str) -> list[dict]:
        response = await self._client.request(
            'GET',
            '/rest/v1/tasks',
            token,
            params={'select': 'id,title,created_at', 'user_id': 'eq.' + user_id, 'order': 'created_at.desc'},
        )
        return response.json()

    async def insert(self, user_id: str, title: str, token: str) -> dict:
        response = await self._client.request(
            'POST',
            '/rest/v1/tasks',
            token,
            json={'title': title, 'user_id': user_id},
        )
        return response.json()[0]

    async def delete_for_user(self, user_id: str, task_id: UUID, token: str) -> list[dict]:
        response = await self._client.request(
            'DELETE',
            '/rest/v1/tasks',
            token,
            params={'id': 'eq.' + str(task_id), 'user_id': 'eq.' + user_id},
        )
        return response.json()
