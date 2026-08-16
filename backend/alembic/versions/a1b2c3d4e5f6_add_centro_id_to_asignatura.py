"""add centro_id to asignatura

Revision ID: a1b2c3d4e5f6
Revises: b3764423c9bf
Create Date: 2026-08-14 08:54:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'b3764423c9bf'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Agregar la columna centro_id como nullable primero
    op.add_column('asignatura', sa.Column('centro_id', sa.BigInteger(), nullable=True))

    # 2. Obtener el primer centro educativo disponible para asignar a las existentes
    conn = op.get_bind()
    result = conn.execute(sa.text("SELECT id FROM centro_educativo ORDER BY id LIMIT 1"))
    row = result.fetchone()

    if row:
        default_centro_id = row[0]
        conn.execute(
            sa.text("UPDATE asignatura SET centro_id = :cid WHERE centro_id IS NULL"),
            {"cid": default_centro_id}
        )

    # 3. Hacer la columna NOT NULL
    op.alter_column('asignatura', 'centro_id', nullable=False)

    # 4. FK a centro_educativo
    op.create_foreign_key(
        'fk_asignatura_centro_id',
        'asignatura',
        'centro_educativo',
        ['centro_id'],
        ['id'],
        ondelete='RESTRICT'
    )

    # 5. UniqueConstraint (centro_id, codigo)
    op.create_unique_constraint(
        'uq_asignatura_centro',
        'asignatura',
        ['centro_id', 'codigo']
    )


def downgrade() -> None:
    op.drop_constraint('uq_asignatura_centro', 'asignatura', type_='unique')
    op.drop_constraint('fk_asignatura_centro_id', 'asignatura', type_='foreignkey')
    op.drop_column('asignatura', 'centro_id')
