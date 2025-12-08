from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.match import MatchStatus


class MatchResponse(BaseModel):
    id: int
    user1_id: int
    user2_id: int
    match_score: Optional[float] = None
    status: MatchStatus
    created_at: datetime
    
    class Config:
        from_attributes = True


class MatchDetail(MatchResponse):
    user1: dict = {}
    user2: dict = {}


class MatchRequest(BaseModel):
    user2_id: int


class MatchUpdate(BaseModel):
    status: MatchStatus

