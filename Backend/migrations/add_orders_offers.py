"""Add orders and admin offers tables

Revision ID: add_orders_offers
Create Date: 2025-10-28
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON


def upgrade():
    # Create admin_offers table
    op.create_table(
        'admin_offers',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('discount_percent', sa.Integer(), nullable=False),
        sa.Column('valid_from', sa.DateTime(), nullable=False),
        sa.Column('valid_until', sa.DateTime(), nullable=False),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now())
    )

    # Create orders table
    op.create_table(
        'orders',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('order_number', sa.String(50), unique=True, nullable=False),
        sa.Column('items', JSON, nullable=False),  # Store cart items as JSON
        sa.Column('delivery_address', JSON, nullable=False),  # Store address as JSON
        sa.Column('order_date', sa.Date(), nullable=False),
        sa.Column('order_time', sa.Time(), nullable=False),
        sa.Column('order_day', sa.String(20), nullable=False),  # Monday, Tuesday, etc.
        sa.Column('status', sa.String(50), default='pending'),  # pending, confirmed, shipped, delivered, cancelled
        sa.Column('total_items', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now())
    )

    # Create index on order_number for faster lookups
    op.create_index('idx_order_number', 'orders', ['order_number'])
    op.create_index('idx_user_orders', 'orders', ['user_id', 'created_at'])


def downgrade():
    op.drop_index('idx_user_orders', 'orders')
    op.drop_index('idx_order_number', 'orders')
    op.drop_table('orders')
    op.drop_table('admin_offers')
