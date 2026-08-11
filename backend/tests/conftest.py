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
