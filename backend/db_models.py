from datetime import datetime
from pathlib import Path
import os
from sqlalchemy import (
    create_engine, Column, Integer, String, DateTime, Text, Float, Date
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database URL can be overridden via environment variable for deployment.
# If DATABASE_URL is not set, default to local SQLite for easy dev (no MySQL needed).
DEFAULT_SQLITE_PATH = (Path(__file__).parent / "suswastha.db").resolve()
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_SQLITE_PATH.as_posix()}")

# pool_pre_ping=True helps avoid stale connections on managed MySQL services.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(
    DATABASE_URL,
    pool_recycle=3600,
    pool_pre_ping=True,
    connect_args=connect_args,
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)

    # NEW:
    password_hash = Column(String(255), nullable=False)
    dob = Column(Date, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(255), index=True, nullable=False)
    test_type = Column(String(64), nullable=False)   # 'diabetes', 'heart', etc.
    raw_input = Column(Text, nullable=False)         # JSON string
    label = Column(String(64), nullable=False)       # 'Low Risk', 'High Risk', etc.
    risk_score = Column(Float, nullable=False)       # probability * 100
    pdf_path = Column(String(512))                   # path to PDF file
    created_at = Column(DateTime, default=datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)
