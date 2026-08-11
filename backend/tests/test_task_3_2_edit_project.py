"""Task 3.2 — Edit Project: editing a field persists (not a duplicate
row), and RLS still applies to updates. Mirrors the SQL updateProject()
(frontend/src/app/dashboard/projects/actions.ts) runs against
public.projects, but executed here against test.projects."""

from sqlalchemy import text

from .test_projects_schema import _insert_project


def test_edit_persists_on_reload(test_conn, make_user):
    user_id = make_user()
    project_id = _insert_project(test_conn, user_id=user_id, name="Original Name")

    test_conn.execute(
        text(
            "UPDATE test.projects SET name = :name, road_width = :road_width, "
            "zoning = :zoning WHERE id = :id"
        ),
        {"name": "Renamed Tower", "road_width": 12, "zoning": "R3", "id": project_id},
    )

    reloaded = test_conn.execute(
        text("SELECT name, road_width, zoning FROM test.projects WHERE id = :id"),
        {"id": project_id},
    ).fetchone()
    assert reloaded.name == "Renamed Tower"
    assert reloaded.road_width == 12
    assert reloaded.zoning == "R3"


def test_edit_does_not_create_a_duplicate_row(test_conn, make_user):
    user_id = make_user()
    project_id = _insert_project(test_conn, user_id=user_id)

    test_conn.execute(
        text("UPDATE test.projects SET name = 'Updated' WHERE id = :id"),
        {"id": project_id},
    )

    count = test_conn.execute(
        text("SELECT count(*) FROM test.projects WHERE user_id = :user_id"),
        {"user_id": user_id},
    ).scalar()
    assert count == 1


def test_rls_blocks_editing_another_users_project(test_conn, make_user, as_user):
    user_a = make_user()
    user_b = make_user()
    project_a = _insert_project(test_conn, user_id=user_a, name="A's project")

    as_user(user_b)
    test_conn.execute(
        text("UPDATE test.projects SET name = 'Hijacked' WHERE id = :id"),
        {"id": project_a},
    )
    # RLS silently filters rows out of the UPDATE's USING clause rather than
    # erroring — same behavior the Server Action relies on (0 rows back
    # means "not yours").
    row = test_conn.execute(
        text("SELECT name FROM test.projects WHERE id = :id"),
        {"id": project_a},
    ).fetchone()
    assert row is None  # user_b can't even see it to confirm it's unchanged

    as_user(user_a)
    row = test_conn.execute(
        text("SELECT name FROM test.projects WHERE id = :id"),
        {"id": project_a},
    ).fetchone()
    assert row.name == "A's project"
