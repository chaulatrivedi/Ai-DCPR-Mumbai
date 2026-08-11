"""create projects table with RLS

Revision ID: 40914294a4ce
Revises: 70897841a0b1
Create Date: 2026-08-11 20:01:16.463700

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '40914294a4ce'
down_revision: Union[str, Sequence[str], None] = '70897841a0b1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


TABLE_DDL = """
CREATE TABLE {schema}.projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    occupancy_type text NOT NULL,
    plot_area numeric NOT NULL CHECK (plot_area > 0),
    road_width numeric CHECK (road_width IS NULL OR road_width > 0),
    zoning text,
    deleted_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX projects_user_id_idx ON {schema}.projects (user_id) WHERE deleted_at IS NULL;

ALTER TABLE {schema}.projects ENABLE ROW LEVEL SECURITY;

-- Standing decision (TASKS-M2-M3-loop-goal.md): projects are private
-- per-user, enforced with RLS (not just app-level filtering).
CREATE POLICY projects_select_own ON {schema}.projects
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY projects_insert_own ON {schema}.projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY projects_update_own ON {schema}.projects
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY projects_delete_own ON {schema}.projects
    FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER projects_set_updated_at
    BEFORE UPDATE ON {schema}.projects
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
"""

GRANTS_DDL = """
GRANT USAGE ON SCHEMA {schema} TO authenticated, service_role;
GRANT ALL ON {schema}.projects TO authenticated, service_role;
"""


def upgrade() -> None:
    """Upgrade schema."""
    # Shared trigger function (lives in public, callable from any schema)
    # keeps `updated_at` honest on every UPDATE — see Task 3.5.
    op.execute(
        """
        CREATE OR REPLACE FUNCTION public.set_updated_at()
        RETURNS trigger AS $$
        BEGIN
            -- clock_timestamp(), not now(): now() is fixed at transaction
            -- start, so two statements in the same transaction would get
            -- an identical updated_at.
            NEW.updated_at = clock_timestamp();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        """
    )

    # `public.projects` is the real table the app reads/writes.
    # `test.projects` is an identical mirror so automated tests (Task 0)
    # never touch real data. Same DDL, applied to both schemas.
    for schema in ("public", "test"):
        op.execute(TABLE_DDL.format(schema=schema))

    # `public` already has Supabase's default privilege grants for
    # anon/authenticated/service_role baked in at project provisioning;
    # the `test` schema is new and needs them granted explicitly so the
    # `authenticated` role (used by RLS tests via SET LOCAL ROLE) can
    # even reach the table before RLS policies are evaluated.
    op.execute(GRANTS_DDL.format(schema="test"))


def downgrade() -> None:
    """Downgrade schema."""
    for schema in ("public", "test"):
        op.execute(f"DROP TABLE IF EXISTS {schema}.projects")
    op.execute("DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE")
