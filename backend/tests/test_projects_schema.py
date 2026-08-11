"""Structural + RLS tests for the `projects` table migration
(40914294a4ce). Runs entirely against `test.projects`, the mirror of
`public.projects` created by the same migration — see SESSION_LOG.md for
why DB-level tests target `test` via a direct connection rather than
`public` through PostgREST."""

import pytest
from sqlalchemy.exc import IntegrityError, ProgrammingError
from sqlalchemy import text


def _insert_project(conn, **overrides):
    fields = {
        "user_id": None,
        "name": "Test Project",
        "occupancy_type": "Residential",
        "plot_area": 500,
        "road_width": None,
        "zoning": None,
    }
    fields.update(overrides)
    return conn.execute(
        text(
            "INSERT INTO test.projects "
            "(user_id, name, occupancy_type, plot_area, road_width, zoning) "
            "VALUES (:user_id, :name, :occupancy_type, :plot_area, :road_width, :zoning) "
            "RETURNING id"
        ),
        fields,
    ).scalar()


def test_table_exists_in_both_schemas(test_conn):
    tables = {
        (row[0], row[1])
        for row in test_conn.execute(
            text(
                "SELECT table_schema, table_name FROM information_schema.tables "
                "WHERE table_name = 'projects'"
            )
        )
    }
    assert ("public", "projects") in tables
    assert ("test", "projects") in tables


def test_required_fields_enforced(test_conn, make_user):
    user_id = make_user()
    with pytest.raises(IntegrityError):
        _insert_project(test_conn, user_id=user_id, name=None)


def test_missing_occupancy_type_rejected(test_conn, make_user):
    user_id = make_user()
    with pytest.raises(IntegrityError):
        _insert_project(test_conn, user_id=user_id, occupancy_type=None)


def test_missing_plot_area_rejected(test_conn, make_user):
    user_id = make_user()
    with pytest.raises(IntegrityError):
        _insert_project(test_conn, user_id=user_id, plot_area=None)


def test_non_positive_plot_area_rejected(test_conn, make_user):
    user_id = make_user()
    with pytest.raises(IntegrityError):
        _insert_project(test_conn, user_id=user_id, plot_area=0)


def test_optional_fields_can_be_null_at_creation(test_conn, make_user):
    user_id = make_user()
    project_id = _insert_project(test_conn, user_id=user_id)
    row = test_conn.execute(
        text("SELECT road_width, zoning FROM test.projects WHERE id = :id"),
        {"id": project_id},
    ).fetchone()
    assert row.road_width is None
    assert row.zoning is None


def test_updated_at_trigger_fires_on_update(test_conn, make_user):
    user_id = make_user()
    project_id = _insert_project(test_conn, user_id=user_id)
    before = test_conn.execute(
        text("SELECT created_at, updated_at FROM test.projects WHERE id = :id"),
        {"id": project_id},
    ).fetchone()
    assert before.created_at == before.updated_at

    test_conn.execute(text("SELECT pg_sleep(0.01)"))
    test_conn.execute(
        text("UPDATE test.projects SET name = 'Renamed' WHERE id = :id"),
        {"id": project_id},
    )
    after = test_conn.execute(
        text("SELECT created_at, updated_at FROM test.projects WHERE id = :id"),
        {"id": project_id},
    ).fetchone()
    assert after.created_at == before.created_at
    assert after.updated_at > before.updated_at


def test_rls_user_cannot_see_another_users_project(test_conn, make_user, as_user):
    user_a = make_user()
    user_b = make_user()
    project_a = _insert_project(test_conn, user_id=user_a, name="A's project")
    _insert_project(test_conn, user_id=user_b, name="B's project")

    as_user(user_a)
    visible_ids = {
        row[0] for row in test_conn.execute(text("SELECT id FROM test.projects"))
    }
    assert visible_ids == {project_a}


def test_rls_blocks_insert_with_other_users_id(test_conn, make_user, as_user):
    user_a = make_user()
    user_b = make_user()

    as_user(user_a)
    with pytest.raises(ProgrammingError):
        _insert_project(test_conn, user_id=user_b, name="Spoofed project")


def test_rls_allows_insert_and_select_for_own_row(test_conn, make_user, as_user):
    user_a = make_user()
    as_user(user_a)
    project_id = _insert_project(test_conn, user_id=user_a, name="Mine")
    row = test_conn.execute(
        text("SELECT name FROM test.projects WHERE id = :id"),
        {"id": project_id},
    ).fetchone()
    assert row is not None
    assert row.name == "Mine"
