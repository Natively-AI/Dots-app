from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.database import get_db
from api.auth import get_current_user
from schemas.user import UserResponse, UserUpdate, UserProfile
from models.user import User
from models.sport import Sport
from models.goal import Goal

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's profile"""
    return {
        **UserResponse.model_validate(current_user).model_dump(),
        "sports": [{"id": s.id, "name": s.name} for s in current_user.sports],
        "goals": [{"id": g.id, "name": g.name} for g in current_user.goals]
    }


@router.get("/{user_id}", response_model=UserProfile)
async def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get a user's profile by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {
        **UserResponse.model_validate(user).model_dump(),
        "sports": [{"id": s.id, "name": s.name} for s in user.sports],
        "goals": [{"id": g.id, "name": g.name} for g in user.goals]
    }


@router.put("/me", response_model=UserProfile)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile"""
    update_data = user_update.dict(exclude_unset=True)
    
    # Handle sports and goals separately
    sport_ids = update_data.pop("sport_ids", None)
    goal_ids = update_data.pop("goal_ids", None)
    
    # Update basic fields
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    # Update sports
    if sport_ids is not None:
        sports = db.query(Sport).filter(Sport.id.in_(sport_ids)).all()
        current_user.sports = sports
    
    # Update goals
    if goal_ids is not None:
        goals = db.query(Goal).filter(Goal.id.in_(goal_ids)).all()
        current_user.goals = goals
    
    db.commit()
    db.refresh(current_user)
    
    return {
        **UserResponse.model_validate(current_user).model_dump(),
        "sports": [{"id": s.id, "name": s.name} for s in current_user.sports],
        "goals": [{"id": g.id, "name": g.name} for g in current_user.goals]
    }

