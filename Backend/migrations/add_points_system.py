"""
Migration script to add points system to the database
Adds: 
- users.points column
- orders.points_earned column  
- order_items.size_ordered column
"""
import sqlite3
import os
import sys

def get_db_path():
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(backend_dir, 'kubti_hardware.db')
    return db_path

def add_points_columns():
    db_path = get_db_path()
    if not os.path.exists(db_path):
        print(f"Database not found at: {db_path}")
        return False
    
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    try:
        conn.execute('BEGIN')
        
        # Add points column to users table
        try:
            cur.execute("ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0")
            print("✓ Added 'points' column to users table")
        except sqlite3.OperationalError as e:
            if 'duplicate column name' in str(e):
                print("- Column 'points' already exists in users table")
            else:
                raise
        
        # Add points_earned column to orders table
        try:
            cur.execute("ALTER TABLE orders ADD COLUMN points_earned INTEGER DEFAULT 0")
            print("✓ Added 'points_earned' column to orders table")
        except sqlite3.OperationalError as e:
            if 'duplicate column name' in str(e):
                print("- Column 'points_earned' already exists in orders table")
            else:
                raise
        
        # Add size_ordered column to order_items table
        try:
            cur.execute("ALTER TABLE order_items ADD COLUMN size_ordered TEXT")
            print("✓ Added 'size_ordered' column to order_items table")
        except sqlite3.OperationalError as e:
            if 'duplicate column name' in str(e):
                print("- Column 'size_ordered' already exists in order_items table")
            else:
                raise
        
        conn.commit()
        print("\n✅ Points system migration completed successfully!")
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"\n❌ Error during migration: {e}")
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    print("=" * 60)
    print("POINTS SYSTEM MIGRATION")
    print("=" * 60)
    success = add_points_columns()
    sys.exit(0 if success else 1)
