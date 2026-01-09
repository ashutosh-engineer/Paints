import os
import sqlite3
from pathlib import Path


def get_db_path():
    here = Path(__file__).resolve().parent
    db_path = (here / '..' / 'kubti_hardware.db').resolve()
    return str(db_path)


def get_existing_columns(cur, table):
    cur.execute(f"PRAGMA table_info({table})")
    return {row[1] for row in cur.fetchall()}  # column names


def get_table_info(cur, table):
    """Return list of dicts with keys: cid, name, type, notnull, dflt_value, pk"""
    cur.execute(f"PRAGMA table_info({table})")
    cols = []
    for cid, name, ctype, notnull, dflt_value, pk in cur.fetchall():
        cols.append({
            'cid': cid,
            'name': name,
            'type': ctype,
            'notnull': notnull,
            'dflt_value': dflt_value,
            'pk': pk,
        })
    return cols


def add_missing_columns(cur, table, columns):
    existing = get_existing_columns(cur, table)
    added = []
    for name, coltype in columns.items():
        if name not in existing:
            cur.execute(f"ALTER TABLE {table} ADD COLUMN {name} {coltype}")
            added.append(name)
    return added


def ensure_indexes(cur):
    # Create index on orders.order_number if not exists
    cur.execute(
        "CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number)"
    )
    # Create UNIQUE index to prevent duplicates going forward (allows multiple NULLs)
    cur.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_order_number ON orders(order_number)"
    )


def ensure_order_items_nullable_product_id(conn):
    """Rebuild order_items if product_id is NOT NULL to make it NULLABLE.
    SQLite cannot ALTER COLUMN nullability, so we recreate the table.
    """
    cur = conn.cursor()
    info = get_table_info(cur, 'order_items')
    product_id_info = next((c for c in info if c['name'] == 'product_id'), None)
    if product_id_info and int(product_id_info['notnull']) == 1:
        # Turn off foreign keys for table rebuild
        cur.execute('PRAGMA foreign_keys=OFF')
        # Create new table with nullable product_id, matching SQLAlchemy model
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS order_items__new (
                id INTEGER PRIMARY KEY,
                order_id INTEGER NOT NULL,
                product_id INTEGER NULL,
                product_name TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                price_at_purchase REAL NOT NULL,
                original_price REAL NOT NULL,
                discount_percent INTEGER NOT NULL DEFAULT 0
            )
            """
        )
        # Copy data over, ensuring defaults for any NULLs
        cur.execute(
            """
            INSERT INTO order_items__new (
                id, order_id, product_id, product_name, quantity, price_at_purchase, original_price, discount_percent
            )
            SELECT
                id,
                order_id,
                product_id,
                product_name,
                quantity,
                price_at_purchase,
                COALESCE(original_price, price_at_purchase),
                COALESCE(discount_percent, 0)
            FROM order_items
            """
        )
        # Replace old table
        cur.execute('DROP TABLE order_items')
        cur.execute('ALTER TABLE order_items__new RENAME TO order_items')
        cur.execute('PRAGMA foreign_keys=ON')
        print("Rebuilt 'order_items' to allow NULL product_id")


def deduplicate_orders(conn):
    """Remove duplicate orders keeping the earliest row per order_number.
    Only affects rows where order_number IS NOT NULL.
    """
    cur = conn.cursor()
    # Delete all but earliest id per order_number (non-NULL)
    cur.execute(
        """
        DELETE FROM orders
        WHERE order_number IS NOT NULL
          AND id NOT IN (
            SELECT MIN(id)
            FROM orders
            WHERE order_number IS NOT NULL
            GROUP BY order_number
          )
        """
    )
    deleted = cur.rowcount if cur.rowcount is not None else 0
    if deleted:
        print(f"Removed {deleted} duplicate order rows by order_number")


def main():
    db_path = get_db_path()
    if not os.path.exists(db_path):
        print(f"Database not found at: {db_path}")
        return 1

    conn = sqlite3.connect(db_path)
    try:
        cur = conn.cursor()

        # Ensure orders table has expected columns matching models.Order
        orders_expected = {
            'order_number': 'TEXT',
            'total_amount': 'REAL',
            'original_amount': 'REAL',
            'discount_amount': 'REAL',
            'status': 'TEXT',
            'delivery_address': 'TEXT',
            'delivery_city': 'TEXT',
            'delivery_state': 'TEXT',
            'delivery_pincode': 'TEXT',
            'delivery_phone': 'TEXT',
            'order_date': 'TEXT',
            'order_time': 'TEXT',
            'order_day': 'TEXT',
            'created_at': 'TEXT',
            'updated_at': 'TEXT',
        }

        # Ensure order_items table has expected columns matching models.OrderItem
        order_items_expected = {
            'product_id': 'INTEGER',
            'product_name': 'TEXT',
            'quantity': 'INTEGER',
            'price_at_purchase': 'REAL',
            'original_price': 'REAL',
            'discount_percent': 'INTEGER',
        }

        # Verify tables exist first
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='orders'")
        if cur.fetchone() is None:
            print("Table 'orders' does not exist. Please start the app once to create base tables, then rerun this script.")
            return 2

        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='order_items'")
        if cur.fetchone() is None:
            print("Table 'order_items' does not exist. Please start the app once to create base tables, then rerun this script.")
            return 2

        conn.execute('BEGIN')
        added_orders = add_missing_columns(cur, 'orders', orders_expected)
        # Add missing columns first so data copy has all fields
        added_order_items = add_missing_columns(cur, 'order_items', order_items_expected)
        # Rebuild order_items if product_id is NOT NULL
        ensure_order_items_nullable_product_id(conn)
        # Deduplicate orders and then ensure unique index
        deduplicate_orders(conn)
        ensure_indexes(cur)
        conn.commit()

        if added_orders:
            print("Added columns to 'orders':", ', '.join(added_orders))
        else:
            print("No changes to 'orders' table")

        if added_order_items:
            print("Added columns to 'order_items':", ', '.join(added_order_items))
        else:
            print("No changes to 'order_items' table")

        print("Schema ensure complete.")
        return 0
    finally:
        conn.close()


if __name__ == '__main__':
    raise SystemExit(main())
