"""Task 0 — confirms the isolated `test` schema exists and is wired
correctly, separate from `public`, before any real M3 work begins."""

from sqlalchemy import text


def test_schema_exists_and_is_separate_from_public(test_conn):
    schemas = {
        row[0]
        for row in test_conn.execute(
            text("SELECT schema_name FROM information_schema.schemata")
        )
    }
    assert "test" in schemas
    assert "public" in schemas


def test_create_read_delete_dummy_row_in_test_schema(test_conn):
    test_conn.execute(
        text("CREATE TABLE test.smoke_check (id serial primary key, note text)")
    )

    test_conn.execute(
        text("INSERT INTO test.smoke_check (note) VALUES (:note)"),
        {"note": "task-0-smoke-test"},
    )
    row = test_conn.execute(
        text("SELECT note FROM test.smoke_check WHERE note = :note"),
        {"note": "task-0-smoke-test"},
    ).fetchone()
    assert row is not None
    assert row[0] == "task-0-smoke-test"

    test_conn.execute(
        text("DELETE FROM test.smoke_check WHERE note = :note"),
        {"note": "task-0-smoke-test"},
    )
    row = test_conn.execute(
        text("SELECT note FROM test.smoke_check WHERE note = :note"),
        {"note": "task-0-smoke-test"},
    ).fetchone()
    assert row is None

    test_conn.execute(text("DROP TABLE test.smoke_check"))


def test_public_schema_untouched_by_test_fixtures(test_conn):
    # Guards against a future test accidentally writing to `public`: this
    # suite must never create tables there.
    tables = {
        row[0]
        for row in test_conn.execute(
            text(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema = 'public'"
            )
        )
    }
    assert "smoke_check" not in tables
