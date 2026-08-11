"""Task 3.5 — Project Timeline: created_at is fixed at insert time,
updated_at moves forward on every edit (displayed on the project page
as "Created ..." / "Last updated ..." — see [id]/page.tsx)."""

from sqlalchemy import text

from .test_projects_schema import _insert_project


def test_created_at_set_on_insert_and_never_changes(test_conn, make_user):
    user_id = make_user()
    project_id = _insert_project(test_conn, user_id=user_id)

    before = test_conn.execute(
        text("SELECT created_at FROM test.projects WHERE id = :id"), {"id": project_id}
    ).scalar()
    assert before is not None

    test_conn.execute(text("SELECT pg_sleep(0.01)"))
    test_conn.execute(
        text("UPDATE test.projects SET name = 'Edited once' WHERE id = :id"),
        {"id": project_id},
    )
    test_conn.execute(text("SELECT pg_sleep(0.01)"))
    test_conn.execute(
        text("UPDATE test.projects SET name = 'Edited twice' WHERE id = :id"),
        {"id": project_id},
    )

    after = test_conn.execute(
        text("SELECT created_at FROM test.projects WHERE id = :id"), {"id": project_id}
    ).scalar()
    assert after == before


def test_updated_at_advances_on_each_edit(test_conn, make_user):
    user_id = make_user()
    project_id = _insert_project(test_conn, user_id=user_id)

    timestamps = []
    for name in ("First edit", "Second edit"):
        test_conn.execute(text("SELECT pg_sleep(0.01)"))
        test_conn.execute(
            text("UPDATE test.projects SET name = :name WHERE id = :id"),
            {"name": name, "id": project_id},
        )
        timestamps.append(
            test_conn.execute(
                text("SELECT updated_at FROM test.projects WHERE id = :id"),
                {"id": project_id},
            ).scalar()
        )

    assert timestamps[1] > timestamps[0]
