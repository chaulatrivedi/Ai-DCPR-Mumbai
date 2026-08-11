import json

import pytest
from sqlalchemy import text

from app.core.db import engine

# Every fixture/table here lives in the `test` Postgres schema, never
# `public` where real user data lives. Nothing in this test suite should
# ever reference a `public.*` table.


@pytest.fixture()
def test_conn():
    """A connection scoped to a single test, rolled back on teardown.

    Using a rolled-back transaction (rather than DDL commit + manual cleanup)
    keeps fixture data from ever persisting in the `test` schema between runs.
    """
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            yield conn
        finally:
            trans.rollback()


@pytest.fixture()
def uuid_factory(test_conn):
    """Generate a real UUID via Postgres so tests don't need a Python uuid dep."""

    def _make() -> str:
        return str(test_conn.execute(text("SELECT gen_random_uuid()")).scalar())

    return _make


@pytest.fixture()
def make_user(test_conn, uuid_factory):
    """Insert a minimal fake auth.users row, scoped to the same rolled-back
    transaction as test_conn — never actually persisted. Needed because
    projects.user_id has a real FK to auth.users(id): RLS policies for
    `test.projects` can only be exercised end-to-end against a row that
    genuinely satisfies that constraint.
    """

    def _make() -> str:
        user_id = uuid_factory()
        test_conn.execute(
            text(
                "INSERT INTO auth.users (id, aud, role, email) "
                "VALUES (:id, 'authenticated', 'authenticated', :email)"
            ),
            {"id": user_id, "email": f"{user_id}@test.local"},
        )
        return user_id

    return _make


@pytest.fixture()
def as_user(test_conn):
    """Switch the current transaction to the `authenticated` Postgres role
    (the one RLS policies apply to — `postgres`/DATABASE_URL's role has
    BYPASSRLS) and set request.jwt.claims so auth.uid() resolves to the
    given user. This is the same mechanism PostgREST uses, so RLS is
    genuinely exercised rather than assumed.
    """

    def _as(user_id: str) -> None:
        test_conn.execute(text("SET LOCAL ROLE authenticated"))
        test_conn.execute(
            text("SELECT set_config('request.jwt.claims', :claims, true)"),
            {"claims": json.dumps({"sub": user_id, "role": "authenticated"})},
        )

    return _as
