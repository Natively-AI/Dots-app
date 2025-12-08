from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

# Association table for event participants
event_rsvps = Table(
    "event_rsvps",
    Base.metadata,
    Column("event_id", Integer, ForeignKey("events.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("attended", Boolean, default=False),
    Column("rsvp_at", DateTime(timezone=True), server_default=func.now()),
)


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    sport_id = Column(Integer, ForeignKey("sports.id"), nullable=False)
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    location = Column(String, nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=True)
    max_participants = Column(Integer, nullable=True)
    is_cancelled = Column(Boolean, default=False)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    sport = relationship("Sport", back_populates="events")
    host = relationship("User", back_populates="created_events", foreign_keys=[host_id])
    participants = relationship("User", secondary=event_rsvps, back_populates="event_rsvps")
    messages = relationship("Message", back_populates="event")

