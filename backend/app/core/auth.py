from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.exceptions import AccessDeniedError, ServiceUnavailableError, UpstreamError
from app.repositories.auth_repository import AuthRepository

bearer = HTTPBearer(auto_error=False)
_auth_repository = AuthRepository()


async def current_identity(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> tuple[str, str]:
    if credentials is None:
        raise HTTPException(401, 'Sign in required')
    try:
        user = await _auth_repository.fetch_user(credentials.credentials)
    except AccessDeniedError as exc:
        raise HTTPException(401, str(exc)) from exc
    except ServiceUnavailableError as exc:
        raise HTTPException(503, str(exc)) from exc
    except UpstreamError as exc:
        raise HTTPException(502, str(exc)) from exc
    return user['id'], credentials.credentials
