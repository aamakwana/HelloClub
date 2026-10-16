from datetime import datetime, timezone

from app.core.exceptions import ConflictError, NotFoundError, UpstreamError
from app.repositories.profile_repository import ProfileRepository
from app.schemas.profile import ProfileIn


class ProfileService:
    def __init__(self, repository: ProfileRepository | None = None) -> None:
        self._repository = repository or ProfileRepository()

    async def get_own(self, user_id: str, token: str) -> dict:
        row = await self._repository.get_own(user_id, token)
        if not row:
            raise NotFoundError('Complete your profile to continue')
        return row

    async def save_own(self, user_id: str, token: str, body: ProfileIn) -> dict:
        payload = {
            'first_name': body.first_name,
            'last_name': body.last_name,
            'gender': body.gender,
            'age': body.age,
            'study_programme': body.study_programme,
            'year_of_study': body.year_of_study,
            'school_option': body.school_option,
            'school_name': body.school_name,
            'city': body.city,
            'languages': body.languages,
            'interests': body.interests,
            'updated_at': datetime.now(timezone.utc).isoformat(),
        }
        existing = await self._repository.get_own(user_id, token)
        try:
            if existing:
                return await self._repository.update(user_id, payload, token)
            return await self._repository.insert(user_id, payload, token)
        except ConflictError as exc:
            raise ConflictError('You already have a profile') from exc
        except LookupError as exc:
            raise UpstreamError('Profile saved but could not be read back; check insert and select policies') from exc

    async def host_first_names(self, user_ids: list[str], token: str) -> list[dict]:
        unique_ids = list(dict.fromkeys(user_ids))[:50]
        return await self._repository.list_public_names(unique_ids, token)
