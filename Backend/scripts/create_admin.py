"""
Initialize admin user for Kubti Hardware
Run this once to create the admin account
"""

from database import SessionLocal, engine, Base
from models import User
from auth import get_password_hash

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Admin credentials
ADMIN_EMAIL = "kubti@admin.com"
ADMIN_PASSWORD = "admin@kubti123" 
ADMIN_NAME = "Kubti Administrator"

try:
    # Check if admin already exists
    existing_admin = db.query(User).filter(User.email == ADMIN_EMAIL).first()
    
    if existing_admin:
        print(f"⚠️  Admin user already exists: {ADMIN_EMAIL}")
        if not existing_admin.is_admin:
            existing_admin.is_admin = True
            db.commit()
            print("✅ Updated existing user to admin")
        else:
            print("✅ Admin user is already set up")
    else:
        # Create new admin user
        admin_user = User(
            email=ADMIN_EMAIL,
            hashed_password=get_password_hash(ADMIN_PASSWORD),
            full_name=ADMIN_NAME,
            is_admin=True,
            is_profile_complete=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("=" * 60)
        print("✅ Admin user created successfully!")
        print("=" * 60)
        print(f"📧 Email: {ADMIN_EMAIL}")
        print(f"🔑 Password: {ADMIN_PASSWORD}")
        print(f"👤 Name: {ADMIN_NAME}")
        print("=" * 60)
        print("\n⚠️  IMPORTANT: Change the admin password after first login!")
        print("   Use the admin portal to update your password.\n")
        
except Exception as e:
    print(f"❌ Error creating admin user: {e}")
    db.rollback()
finally:
    db.close()
