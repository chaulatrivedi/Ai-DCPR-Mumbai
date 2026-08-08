from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.types import ASGIApp


class AuthMiddleware(BaseHTTPMiddleware):
    """Placeholder auth middleware.

    Currently passes every request through unchanged. Once Supabase Auth is
    set up (Task 0.5 / Milestone 1), this should verify the Authorization
    header's Supabase JWT and attach the resulting user to request.state.
    """

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        return await call_next(request)
