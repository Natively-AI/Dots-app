from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
import random
from core.database import get_db
from api.auth import get_current_user
from schemas.buddy import BuddyResponse, BuddyDetail, BuddyRequest, BuddyUpdate
from models.user import User
from models.buddy import Buddy, BuddyStatus
from models.event import Event, event_rsvps
from services.buddying import find_potential_buddies, create_buddy_request

router = APIRouter(prefix="/buddies", tags=["buddies"])


@router.get("/suggested", response_model=List[dict])
async def get_suggested_buddies(
    limit: int = Query(10, ge=1, le=50),
    min_score: float = Query(20.0, ge=0.0, le=100.0),  # Lowered from 30 to 20 to ensure more buddies
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get suggested buddies for current user with pagination"""
    # Get all potential buddies (no limit, sorted by score)
    # Lower min_score to 20 to ensure we always have buddies
    all_buddies = find_potential_buddies(current_user, db, limit=None, min_score=min_score)
    
    # If we don't have enough buddies, lower the threshold even more
    if len(all_buddies) < offset + limit:
        all_buddies = find_potential_buddies(current_user, db, limit=None, min_score=10.0)
    
    # Apply offset and limit for pagination
    paginated_buddies = all_buddies[offset:offset + limit]
    
    result = []
    for m in paginated_buddies:
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


@router.post("", response_model=BuddyResponse, status_code=status.HTTP_201_CREATED)
async def create_buddy(
    buddy_request: BuddyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a buddy request"""
    if buddy_request.user2_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot buddy with yourself"
        )
    
    user2 = db.query(User).filter(User.id == buddy_request.user2_id).first()
    if not user2:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    try:
        buddy = create_buddy_request(current_user.id, buddy_request.user2_id, db)
        return BuddyResponse.model_validate(buddy)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("", response_model=List[BuddyDetail])
async def list_buddies(
    status_filter: Optional[BuddyStatus] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all buddies for current user"""
    query = db.query(Buddy).filter(
        (Buddy.user1_id == current_user.id) | (Buddy.user2_id == current_user.id)
    )
    
    if status_filter:
        query = query.filter(Buddy.status == status_filter)
    
    buddies = query.all()
    
    result = []
    for buddy in buddies:
        other_user = buddy.user1 if buddy.user2_id == current_user.id else buddy.user2
        result.append(BuddyDetail(
            **{col.name: getattr(buddy, col.name) for col in buddy.__table__.columns},
            user1={
                "id": buddy.user1.id,
                "full_name": buddy.user1.full_name,
                "age": buddy.user1.age,
                "location": buddy.user1.location,
                "avatar_url": buddy.user1.avatar_url,
                "bio": buddy.user1.bio,
                "sports": [{"id": s.id, "name": s.name, "icon": s.icon} for s in buddy.user1.sports],
                "goals": [{"id": g.id, "name": g.name} for g in buddy.user1.goals]
            },
            user2={
                "id": buddy.user2.id,
                "full_name": buddy.user2.full_name,
                "age": buddy.user2.age,
                "location": buddy.user2.location,
                "avatar_url": buddy.user2.avatar_url,
                "bio": buddy.user2.bio,
                "sports": [{"id": s.id, "name": s.name, "icon": s.icon} for s in buddy.user2.sports],
                "goals": [{"id": g.id, "name": g.name} for g in buddy.user2.goals]
            }
        ))
    
    return result


@router.delete("/{buddy_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_buddy(
    buddy_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a buddy (remove from buddies)"""
    buddy = db.query(Buddy).filter(Buddy.id == buddy_id).first()
    if not buddy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Buddy not found"
        )
    
    # Only allow deletion if user is part of the buddy
    if buddy.user1_id != current_user.id and buddy.user2_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this buddy"
        )
    
    db.delete(buddy)
    db.commit()
    return None


@router.put("/{buddy_id}", response_model=BuddyResponse)
async def update_buddy(
    buddy_id: int,
    buddy_update: BuddyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update buddy status (accept/reject)"""
    buddy = db.query(Buddy).filter(Buddy.id == buddy_id).first()
    if not buddy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Buddy not found"
        )
    
    # Only the receiver can update the buddy status
    if buddy.user2_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the receiver can update buddy status"
        )
    
    buddy.status = buddy_update.status
    db.commit()
    db.refresh(buddy)
    
    return BuddyResponse.model_validate(buddy)
