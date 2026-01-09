from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Database connection string
# For PostgreSQL (production):
# DATABASE_URL = "postgresql://postgres:password@localhost:5432/kubti_hardware"
# For SQLite (development - no installation needed):
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./kubti_hardware.db"
)

# SQLite needs check_same_thread=False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# Add pool_pre_ping=True to handle DB connection drops (common with cloud DBs like Neon)
engine = create_engine(
    DATABASE_URL, 
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_recycle=300
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
