from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response

from app.core.auth import current_identity
from app.core.exceptions import AccessDeniedError, ServiceUnavailableError, TaskNotFoundError, UpstreamError
from app.schemas.task import NewTask
from app.services.task_service import TaskService

router = APIRouter()
_service = TaskService()


def get_task_service() -> TaskService:
    return _service


def _http(exc: Exception) -> HTTPException:
    if isinstance(exc, AccessDeniedError):
        return HTTPException(401, str(exc))
    if isinstance(exc, ServiceUnavailableError):
        return HTTPException(503, str(exc))
    if isinstance(exc, UpstreamError):
        return HTTPException(502, str(exc))
    if isinstance(exc, TaskNotFoundError):
        return HTTPException(404, str(exc))
    raise exc


@router.get('/tasks')
async def list_tasks(auth=Depends(current_identity), service: TaskService = Depends(get_task_service)):
    user_id, token = auth
    try:
        return await service.list_tasks(user_id, token)
    except (AccessDeniedError, ServiceUnavailableError, UpstreamError) as exc:
        raise _http(exc) from exc


@router.post('/tasks', status_code=201)
async def create_task(
    body: NewTask,
    auth=Depends(current_identity),
    service: TaskService = Depends(get_task_service),
):
    user_id, token = auth
    try:
        return await service.create_task(user_id, token, body)
    except (AccessDeniedError, ServiceUnavailableError, UpstreamError) as exc:
        raise _http(exc) from exc


@router.delete('/tasks/{task_id}', status_code=204)
async def delete_task(
    task_id: UUID,
    auth=Depends(current_identity),
    service: TaskService = Depends(get_task_service),
):
    user_id, token = auth
    try:
        await service.delete_task(user_id, token, task_id)
    except (TaskNotFoundError, AccessDeniedError, ServiceUnavailableError, UpstreamError) as exc:
        raise _http(exc) from exc
    return Response(status_code=204)
