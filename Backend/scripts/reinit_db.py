import os
import sys

# Ensure we can import from app modules (Backend root)
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import engine, SessionLocal, Base
from app.models import User
from app.auth import get_password_hash

def init_db():
    print("Connecting to database...")
    print(f"Creating tables in {engine.url}...")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    print("Tables created.")

    db = SessionLocal()

    # Create Admin
    admin_email = "kubti@admin.com"
    # Check if exists
    existing_admin = db.query(User).filter(User.email == admin_email).first()
    if not existing_admin:
        print(f"Creating admin user {admin_email}...")
        try:
            admin = User(
                email=admin_email,
                hashed_password=get_password_hash("admin@kubti123"),
                full_name="Admin User",
                is_admin=True,
                is_profile_complete=True,
                phone="0000000000"
            )
            db.add(admin)
            db.commit()
            print("Admin created.")
        except Exception as e:
            print(f"Error creating admin: {e}")
            db.rollback()
    else:
        print(f"Admin user {admin_email} already exists.")

    # Create User
    user_email = "ashutoshsingh6376@gmail.com"
    existing_user = db.query(User).filter(User.email == user_email).first()
    if not existing_user:
        print(f"Creating normal user {user_email}...")
        try:
            user = User(
                email=user_email,
                hashed_password=get_password_hash("ashu@2012nashu"),
                full_name="Ashutosh Singh",
                is_admin=False,
                is_profile_complete=True
            )
            db.add(user)
            db.commit()
            print("User created.")
        except Exception as e:
            print(f"Error creating user: {e}")
            db.rollback()
    else:
        print(f"User {user_email} already exists.")

    db.close()
    print("Database initialization complete.")

if __name__ == "__main__":
    init_db()
