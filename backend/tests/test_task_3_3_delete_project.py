"""Task 3.3 — Delete Project: soft-delete sets deleted_at and hides the
row from normal (deleted_at IS NULL) queries; restore reverses it;
leaving a project untouched (the "cancel" case) means simply never
running the delete statement — nothing special to assert there beyond
the row being unchanged, covered implicitly by every other test in this
file reading the row back."""

from sqlalchemy import text

from .test_projects_schema import _insert_project


def _visible_ids(conn):
    return {
        row[0]
        for row in conn.execute(
            text("SELECT id FROM test.projects WHERE deleted_at IS NULL")
        )
    }


def test_soft_delete_sets_deleted_at_and_hides_from_normal_list(test_conn, make_user):
    user_id = make_user()
    project_id = _insert_project(test_conn, user_id=user_id)
    assert project_id in _visible_ids(test_conn)

    test_conn.execute(
        text("UPDATE test.projects SET deleted_at = now() WHERE id = :id"),
        {"id": project_id},
    )

    row = test_conn.execute(
        text("SELECT deleted_at FROM test.projects WHERE id = :id"),
        {"id": project_id},
    ).fetchone()
    assert row.deleted_at is not None
    assert project_id not in _visible_ids(test_conn)


def test_soft_delete_does_not_remove_the_row(test_conn, make_user):
    user_id = make_user()
    project_id = _insert_project(test_conn, user_id=user_id)

    test_conn.execute(
        text("UPDATE test.projects SET deleted_at = now() WHERE id = :id"),
        {"id": project_id},
    )

    row = test_conn.execute(
        text("SELECT id FROM test.projects WHERE id = :id"), {"id": project_id}
    ).fetchone()
    assert row is not None


def test_restore_clears_deleted_at_and_returns_to_normal_view(test_conn, make_user):
    user_id = make_user()
    project_id = _insert_project(test_conn, user_id=user_id)

    test_conn.execute(
        text("UPDATE test.projects SET deleted_at = now() WHERE id = :id"),
        {"id": project_id},
    )
    assert project_id not in _visible_ids(test_conn)

    test_conn.execute(
        text("UPDATE test.projects SET deleted_at = NULL WHERE id = :id"),
        {"id": project_id},
    )
    assert project_id in _visible_ids(test_conn)


def test_rls_blocks_deleting_another_users_project(test_conn, make_user, as_user):
    user_a = make_user()
    user_b = make_user()
    project_a = _insert_project(test_conn, user_id=user_a)

    as_user(user_b)
    test_conn.execute(
        text("UPDATE test.projects SET deleted_at = now() WHERE id = :id"),
        {"id": project_a},
    )

    as_user(user_a)
    row = test_conn.execute(
        text("SELECT deleted_at FROM test.projects WHERE id = :id"),
        {"id": project_a},
    ).fetchone()
    assert row.deleted_at is None
