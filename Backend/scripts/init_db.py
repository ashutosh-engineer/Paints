from sqlalchemy import create_engine
from models import Base
import os

# Create database engine
DATABASE_URL = "sqlite:///./shop.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Create all tables
print("Creating all database tables...")
Base.metadata.create_all(bind=engine)
print("✓ All tables created successfully!")

# List all tables
from sqlalchemy import inspect
inspector = inspect(engine)
tables = inspector.get_table_names()
print(f"\nTotal tables: {len(tables)}")
for table in tables:
    print(f"  - {table}")
    columns = inspector.get_columns(table)
    for col in columns:
        print(f"      {col['name']}: {col['type']}")
