"""add use_mix to projects

Revision ID: ad26efdd1f48
Revises: 40914294a4ce
Create Date: 2026-08-13 21:05:15.114759

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ad26efdd1f48'
down_revision: Union[str, Sequence[str], None] = '40914294a4ce'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # jsonb, not text[]: Supabase's JS client serializes a JS array straight
    # to jsonb with no Postgres array-literal casting; nullable + no default
    # since Task 3.1's spec keeps Use Mix optional even when the field is
    # shown (Occupancy Type = "Mixed-Use").
    for schema in ("public", "test"):
        op.execute(f"ALTER TABLE {schema}.projects ADD COLUMN use_mix jsonb")


def downgrade() -> None:
    """Downgrade schema."""
    for schema in ("public", "test"):
        op.execute(f"ALTER TABLE {schema}.projects DROP COLUMN IF EXISTS use_mix")
