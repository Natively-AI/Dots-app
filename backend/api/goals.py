from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from models.goal import Goal

router = APIRouter(prefix="/goals", tags=["goals"])


@router.get("", response_model=List[dict])
async def list_goals(db: Session = Depends(get_db)):
    """List all available fitness goals"""
    goals = db.query(Goal).order_by(Goal.name).all()
    return [{"id": g.id, "name": g.name, "description": g.description} for g in goals]

