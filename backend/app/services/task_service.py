from uuid import UUID

from app.core.exceptions import TaskNotFoundError
from app.repositories.task_repository import TaskRepository
from app.schemas.task import NewTask


class TaskService:
    def __init__(self, repository: TaskRepository | None = None) -> None:
        self._repository = repository or TaskRepository()

    async def list_tasks(self, user_id: str, token: str) -> list[dict]:
        return await self._repository.list_for_user(user_id, token)

    async def create_task(self, user_id: str, token: str, body: NewTask) -> dict:
        return await self._repository.insert(user_id, body.title, token)

    async def delete_task(self, user_id: str, token: str, task_id: UUID) -> None:
        deleted = await self._repository.delete_for_user(user_id, task_id, token)
        if not deleted:
            raise TaskNotFoundError('Task not found')
