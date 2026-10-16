from app.core.supabase_gateway import SupabaseGateway, gateway

PROFILE_FIELDS = (
    'user_id,first_name,last_name,gender,age,study_programme,year_of_study,'
    'school_option,school_name,city,languages,interests,created_at,updated_at'
)


class ProfileRepository:
    def __init__(self, client: SupabaseGateway | None = None) -> None:
        self._client = client or gateway

    async def get_own(self, user_id: str, token: str) -> dict | None:
        response = await self._client.request(
            'GET',
            '/rest/v1/profiles',
            token,
            params={'select': PROFILE_FIELDS, 'user_id': 'eq.' + user_id},
        )
        rows = response.json()
        return rows[0] if rows else None

    async def insert(self, user_id: str, payload: dict, token: str) -> dict:
        response = await self._client.request(
            'POST',
            '/rest/v1/profiles',
            token,
            json={'user_id': user_id, **payload},
        )
        rows = response.json()
        if not rows:
            raise LookupError('Profile was not returned after save')
        return rows[0]

    async def update(self, user_id: str, payload: dict, token: str) -> dict:
        response = await self._client.request(
            'PATCH',
            '/rest/v1/profiles',
            token,
            params={'user_id': 'eq.' + user_id},
            json=payload,
        )
        rows = response.json()
        if not rows:
            raise LookupError('Profile was not returned after save')
        return rows[0]

    async def list_public_names(self, user_ids: list[str], token: str) -> list[dict]:
        if not user_ids:
            return []
        response = await self._client.request(
            'GET',
            '/rest/v1/profile_public_names',
            token,
            params={
                'select': 'user_id,first_name',
                'user_id': 'in.(' + ','.join(user_ids) + ')',
            },
        )
        return response.json()
