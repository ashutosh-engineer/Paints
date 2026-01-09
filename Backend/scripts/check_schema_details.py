import os
import sys
from sqlalchemy import inspect, text

# Ensure we can import from app modules (Backend root)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import engine

def check_db_schema():
    print("Connecting to database...")
    inspector = inspect(engine)
    
    table_names = inspector.get_table_names()
    print("\n--- TABLES FOUND IN DATABASE ---")
    for table in table_names:
        print(f"\n[TABLE] {table}")
        columns = inspector.get_columns(table)
        for column in columns:
            print(f"  - {column['name']} ({column['type']})")

    print("\n------------------------------")
    print(f"Total tables found: {len(table_names)}")

if __name__ == "__main__":
    check_db_schema()
