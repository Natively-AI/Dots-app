from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from models.sport import Sport

router = APIRouter(prefix="/sports", tags=["sports"])


@router.get("", response_model=List[dict])
async def list_sports(db: Session = Depends(get_db)):
    """List all available sports"""
    sports = db.query(Sport).order_by(Sport.name).all()
    return [{"id": s.id, "name": s.name, "icon": s.icon} for s in sports]

