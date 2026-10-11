import uuid
from sqlalchemy import Column, String, DateTime, Integer, Text, func
from database.database import Base

class MediaAsset(Base):
    __tablename__ = "media_assets"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    tags = Column(Text, nullable=False, default="")
    folder = Column(String(40), nullable=False, index=True)
    content_type = Column(String(120), nullable=False)
    sha256 = Column(String(64), nullable=False, unique=True, index=True)
    s3_key = Column(String(512), nullable=False, unique=True)
    size_bytes = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
