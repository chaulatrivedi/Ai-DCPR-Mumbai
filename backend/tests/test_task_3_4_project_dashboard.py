"""Task 3.4 — Project Dashboard: the query the [id]/page.tsx Server
Component runs (SELECT ... WHERE id = :id AND deleted_at IS NULL) returns
that project's own data and never another project's, including another
project belonging to the same user."""

from sqlalchemy import text

from .test_projects_schema import _insert_project


def _get_by_id(conn, project_id):
    return conn.execute(
        text(
            "SELECT name, occupancy_type, plot_area, road_width, zoning "
            "FROM test.projects WHERE id = :id AND deleted_at IS NULL"
        ),
        {"id": project_id},
    ).fetchone()


def test_project_page_shows_only_its_own_data(test_conn, make_user):
    user_id = make_user()
    project_a = _insert_project(
        test_conn,
        user_id=user_id,
        name="Sea View Apartments",
        occupancy_type="Residential",
        plot_area=600,
    )
    project_b = _insert_project(
        test_conn,
        user_id=user_id,
        name="Downtown Office Tower",
        occupancy_type="Business",
        plot_area=1200,
    )

    row_a = _get_by_id(test_conn, project_a)
    row_b = _get_by_id(test_conn, project_b)

    assert row_a.name == "Sea View Apartments"
    assert row_a.plot_area == 600
    assert row_b.name == "Downtown Office Tower"
    assert row_b.plot_area == 1200

    # Neither query leaked the other project's fields.
    assert row_a.name != row_b.name
    assert row_a.occupancy_type != row_b.occupancy_type


def test_project_page_returns_nothing_for_a_deleted_project(test_conn, make_user):
    user_id = make_user()
    project_id = _insert_project(test_conn, user_id=user_id)
    test_conn.execute(
        text("UPDATE test.projects SET deleted_at = now() WHERE id = :id"),
        {"id": project_id},
    )

    assert _get_by_id(test_conn, project_id) is None
