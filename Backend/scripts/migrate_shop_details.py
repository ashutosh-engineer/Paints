"""
Migration script to add shop details fields to users table
Run this script to update existing database schema
"""
import sqlite3
import os

# Get the directory of this script
current_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(current_dir, 'kubti_hardware.db')

def migrate_database():
    print(f"Connecting to database: {db_path}")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(users)")
        columns = [col[1] for col in cursor.fetchall()]
        
        # Add shop_name column if it doesn't exist
        if 'shop_name' not in columns:
            print("Adding shop_name column...")
            cursor.execute("ALTER TABLE users ADD COLUMN shop_name VARCHAR")
            print("✓ shop_name column added")
        else:
            print("✓ shop_name column already exists")
        
        # Add trader_name column if it doesn't exist
        if 'trader_name' not in columns:
            print("Adding trader_name column...")
            cursor.execute("ALTER TABLE users ADD COLUMN trader_name VARCHAR")
            print("✓ trader_name column added")
        else:
            print("✓ trader_name column already exists")
        
        # Add address column if it doesn't exist
        if 'address' not in columns:
            print("Adding address column...")
            cursor.execute("ALTER TABLE users ADD COLUMN address TEXT")
            print("✓ address column added")
        else:
            print("✓ address column already exists")
        
        # Add shop_details_completed column if it doesn't exist
        if 'shop_details_completed' not in columns:
            print("Adding shop_details_completed column...")
            cursor.execute("ALTER TABLE users ADD COLUMN shop_details_completed BOOLEAN DEFAULT 0")
            print("✓ shop_details_completed column added")
        else:
            print("✓ shop_details_completed column already exists")
        
        conn.commit()
        print("\n✅ Database migration completed successfully!")
        
    except sqlite3.Error as e:
        print(f"\n❌ Error during migration: {e}")
    finally:
        if conn:
            conn.close()
            print("Database connection closed.")

if __name__ == "__main__":
    print("=" * 50)
    print("Shop Details Migration Script")
    print("=" * 50)
    migrate_database()
