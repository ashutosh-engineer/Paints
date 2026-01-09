import sqlite3
import os

# Get the database path
db_path = os.path.join(os.path.dirname(__file__), 'shop.db')

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if column exists
    cursor.execute("PRAGMA table_info(cart_items)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'selected_size' not in columns:
        print("Adding selected_size column to cart_items table...")
        cursor.execute("ALTER TABLE cart_items ADD COLUMN selected_size TEXT")
        conn.commit()
        print("✓ Successfully added selected_size column")
    else:
        print("✓ selected_size column already exists")
    
    print("\nCurrent cart_items schema:")
    cursor.execute("PRAGMA table_info(cart_items)")
    for column in cursor.fetchall():
        print(f"  {column[1]}: {column[2]}")
        
except Exception as e:
    print(f"Error: {e}")
    conn.rollback()
finally:
    conn.close()
