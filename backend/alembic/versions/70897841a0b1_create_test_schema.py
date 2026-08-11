"""create test schema

Revision ID: 70897841a0b1
Revises: 716d027b229a
Create Date: 2026-08-11 19:49:15.090361

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '70897841a0b1'
down_revision: Union[str, Sequence[str], None] = '716d027b229a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Isolated schema for automated tests, separate from `public` where real
    # data lives. Same Supabase Postgres instance/connection, logically
    # separated by schema. Tests create fixture tables here and clean up
    # after themselves; app code never reads/writes this schema.
    op.execute("CREATE SCHEMA IF NOT EXISTS test")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP SCHEMA IF EXISTS test CASCADE")
