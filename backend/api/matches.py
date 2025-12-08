from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
import random
from core.database import get_db
from api.auth import get_current_user
from schemas.match import MatchResponse, MatchDetail, MatchRequest, MatchUpdate
from models.user import User
from models.match import Match, MatchStatus
from models.event import Event, event_rsvps
from services.matching import find_potential_matches, create_match_request

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("/suggested", response_model=List[dict])
async def get_suggested_matches(
    limit: int = Query(10, ge=1, le=50),
    min_score: float = Query(20.0, ge=0.0, le=100.0),  # Lowered from 30 to 20 to ensure more matches
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get suggested matches for current user with pagination"""
    # Get all potential matches (no limit, sorted by score)
    # Lower min_score to 20 to ensure we always have matches
    all_matches = find_potential_matches(current_user, db, limit=None, min_score=min_score)
    
    # If we don't have enough matches, lower the threshold even more
    if len(all_matches) < offset + limit:
        all_matches = find_potential_matches(current_user, db, limit=None, min_score=10.0)
    
    # Apply offset and limit for pagination
    paginated_matches = all_matches[offset:offset + limit]
    
    result = []
    for m in paginated_matches:
        user = m["user"]
        
        # Get recent events (last 3 events user attended/RSVPed to)
        recent_events_query = db.query(Event).join(
            event_rsvps, Event.id == event_rsvps.c.event_id
        ).filter(
            event_rsvps.c.user_id == user.id,
            Event.start_time < datetime.utcnow()
        ).order_by(Event.start_time.desc()).limit(3).all()
        
        recent_events = [
            {
                "id": e.id,
                "title": e.title,
                "sport": {"id": e.sport.id, "name": e.sport.name, "icon": e.sport.icon} if e.sport else None,
                "start_time": e.start_time.isoformat() if e.start_time else None,
            }
            for e in recent_events_query
        ]
        
        # Calculate badges
        badges = []
        event_count = db.query(func.count(event_rsvps.c.event_id)).filter(
            event_rsvps.c.user_id == user.id
        ).scalar() or 0
        
        if event_count >= 10:
            badges.append({"name": "Event Veteran", "icon": "🏆"})
        elif event_count >= 5:
            badges.append({"name": "Active Member", "icon": "⭐"})
        elif event_count >= 1:
            badges.append({"name": "Getting Started", "icon": "🌱"})
        
        if len(user.sports) >= 5:
            badges.append({"name": "Multi-Sport", "icon": "🎯"})
        
        # Generate multiple photos for the user (using email hash for consistency)
        # Always generate photos even if avatar_url is missing
        num_photos = random.randint(3, 5)
        base_seed = abs(hash(user.email)) % 100000  # Use email hash for consistency, ensure positive
        photos = []
        for i in range(num_photos):
            photos.append(f"https://picsum.photos/seed/{base_seed + i}/400/600")
        
        # If user has avatar_url, use it as first photo, otherwise generate one
        if not user.avatar_url:
            # Update user with avatar URL for future use
            user.avatar_url = photos[0]
            db.flush()
        
        result.append({
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "age": user.age,
                "location": user.location,
                "avatar_url": user.avatar_url,
                "bio": user.bio,
                "sports": [{"id": s.id, "name": s.name, "icon": s.icon} for s in user.sports],
                "goals": [{"id": g.id, "name": g.name} for g in user.goals],
                "recent_events": recent_events,
                "badges": badges,
                "event_count": event_count,
                "photos": photos  # Add photos array
            },
            "score": m["score"]
        })
    
    return result


@router.post("", response_model=MatchResponse, status_code=status.HTTP_201_CREATED)
async def create_match(
    match_request: MatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a match request"""
    if match_request.user2_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot match with yourself"
        )
    
    user2 = db.query(User).filter(User.id == match_request.user2_id).first()
    if not user2:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    try:
        match = create_match_request(current_user.id, match_request.user2_id, db)
        return MatchResponse.model_validate(match)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("", response_model=List[MatchDetail])
async def list_matches(
    status_filter: Optional[MatchStatus] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all matches for current user"""
    query = db.query(Match).filter(
        (Match.user1_id == current_user.id) | (Match.user2_id == current_user.id)
    )
    
    if status_filter:
        query = query.filter(Match.status == status_filter)
    
    matches = query.all()
    
    result = []
    for match in matches:
        other_user = match.user1 if match.user2_id == current_user.id else match.user2
        result.append(MatchDetail(
            **{col.name: getattr(match, col.name) for col in match.__table__.columns},
            user1={
                "id": match.user1.id,
                "full_name": match.user1.full_name,
                "age": match.user1.age,
                "location": match.user1.location,
                "avatar_url": match.user1.avatar_url,
                "bio": match.user1.bio,
                "sports": [{"id": s.id, "name": s.name, "icon": s.icon} for s in match.user1.sports],
                "goals": [{"id": g.id, "name": g.name} for g in match.user1.goals]
            },
            user2={
                "id": match.user2.id,
                "full_name": match.user2.full_name,
                "age": match.user2.age,
                "location": match.user2.location,
                "avatar_url": match.user2.avatar_url,
                "bio": match.user2.bio,
                "sports": [{"id": s.id, "name": s.name, "icon": s.icon} for s in match.user2.sports],
                "goals": [{"id": g.id, "name": g.name} for g in match.user2.goals]
            }
        ))
    
    return result


@router.delete("/{match_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_match(
    match_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a match (remove from matches)"""
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found"
        )
    
    # Only allow deletion if user is part of the match
    if match.user1_id != current_user.id and match.user2_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this match"
        )
    
    db.delete(match)
    db.commit()
    return None


@router.put("/{match_id}", response_model=MatchResponse)
async def update_match(
    match_id: int,
    match_update: MatchUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update match status (accept/reject)"""
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found"
        )
    
    # Only the receiver can update the match status
    if match.user2_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the receiver can update match status"
        )
    
    match.status = match_update.status
    db.commit()
    db.refresh(match)
    
    return MatchResponse.model_validate(match)

