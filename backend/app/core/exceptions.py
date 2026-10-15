class AccessDeniedError(Exception):
    """Session missing, expired, or rejected by Supabase Auth."""


class ServiceUnavailableError(Exception):
    """Database or authentication service could not be reached."""


class UpstreamError(Exception):
    """Supabase returned an unexpected error."""


class TaskNotFoundError(Exception):
    """No matching task for this authenticated user."""
