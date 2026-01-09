from sqlalchemy import inspect
from app import engine

inspector = inspect(engine)
print('Orders table columns:')
columns = inspector.get_columns('orders')
for col in columns:
    print(f"  {col['name']}: {col['type']}")
