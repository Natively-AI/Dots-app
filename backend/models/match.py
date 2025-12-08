from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from core.database import Base


class MatchStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user2_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    match_score = Column(Float, nullable=True)  # Algorithm-generated score
    status = Column(SQLEnum(MatchStatus), default=MatchStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user1 = relationship("User", foreign_keys=[user1_id], back_populates="sent_matches")
    user2 = relationship("User", foreign_keys=[user2_id], back_populates="received_matches")

