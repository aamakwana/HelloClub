class AccessDeniedError(Exception):
    """Session missing, expired, or rejected by Supabase Auth."""


class ServiceUnavailableError(Exception):
    """Database or authentication service could not be reached."""


class UpstreamError(Exception):
    """Supabase returned an unexpected error."""


class DomainValidationError(Exception):
    """Business rule failed after request parsing."""


class ConflictError(Exception):
    """The change collides with an existing row, such as a duplicate join request."""


class NotFoundError(Exception):
    """The requested resource does not exist or is not visible to this user."""


class ForbiddenError(Exception):
    """The authenticated user is not allowed to perform this action."""
