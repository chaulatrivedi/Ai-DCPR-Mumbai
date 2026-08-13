"""Task 3.1 follow-up — Use Mix multi-select: `use_mix` jsonb column on
`projects` (migration ad26efdd1f48). Mirrors the frontend's optional-field
handling in project-form-fields.tsx / actions.ts, exercised here directly
against test.projects."""

import json

from sqlalchemy import text

from .test_projects_schema import _insert_project


def test_use_mix_column_exists_and_defaults_to_null(test_conn, make_user):
    user_id = make_user()
    project_id = _insert_project(test_conn, user_id=user_id)

    row = test_conn.execute(
        text("SELECT use_mix FROM test.projects WHERE id = :id"),
        {"id": project_id},
    ).fetchone()
    assert row.use_mix is None


def test_use_mix_stores_multiple_selections(test_conn, make_user):
    user_id = make_user()
    project_id = _insert_project(
        test_conn, user_id=user_id, occupancy_type="Mixed-Use"
    )

    test_conn.execute(
        text("UPDATE test.projects SET use_mix = :use_mix WHERE id = :id"),
        {"use_mix": json.dumps(["Residential", "Commercial"]), "id": project_id},
    )

    row = test_conn.execute(
        text("SELECT use_mix FROM test.projects WHERE id = :id"),
        {"id": project_id},
    ).fetchone()
    assert row.use_mix == ["Residential", "Commercial"]
