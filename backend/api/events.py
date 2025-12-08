from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Optional, List
from datetime import datetime
from core.database import get_db
from api.auth import get_current_user
from schemas.event import EventCreate, EventUpdate, EventResponse, EventDetail
from models.event import Event, event_rsvps
from models.user import User
from models.sport import Sport

router = APIRouter(prefix="/events", tags=["events"])


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_data: EventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new event"""
    # Verify sport exists
    sport = db.query(Sport).filter(Sport.id == event_data.sport_id).first()
    if not sport:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sport not found"
        )
    
    # Generate image URL for the event
    event_seed = abs(hash(event_data.title + str(event_data.sport_id) + str(current_user.id))) % 100000
    image_url = f"https://picsum.photos/seed/{event_seed + 20000}/800/600"
    
    event_dict = event_data.dict()
    event_dict['image_url'] = image_url
    
    new_event = Event(
        **event_dict,
        host_id=current_user.id
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    
    # Host automatically RSVPs
    db.execute(
        event_rsvps.insert().values(event_id=new_event.id, user_id=current_user.id)
    )
    db.commit()
    
    return EventResponse(
        **{col.name: getattr(new_event, col.name) for col in new_event.__table__.columns},
        participant_count=1
    )


@router.get("", response_model=List[EventResponse])
async def list_events(
    sport_id: Optional[int] = Query(None),
    location: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """List events with optional filtering"""
    query = db.query(Event).filter(Event.is_cancelled == False)
    
    if sport_id:
        query = query.filter(Event.sport_id == sport_id)
    
    if location:
        query = query.filter(Event.location.ilike(f"%{location}%"))
    
    if start_date:
        query = query.filter(Event.start_time >= start_date)
    
    if end_date:
        query = query.filter(Event.start_time <= end_date)
    
    if search:
        query = query.filter(
            or_(
                Event.title.ilike(f"%{search}%"),
                Event.description.ilike(f"%{search}%")
            )
        )
    
    events = query.order_by(Event.start_time).all()
    
    result = []
    for event in events:
        participant_count = db.query(func.count(event_rsvps.c.user_id)).filter(
            event_rsvps.c.event_id == event.id
        ).scalar()
        
        # Build event dict with sport info and participant count
        event_data = EventResponse.model_validate(event).model_dump()
        event_data['participant_count'] = participant_count or 0
        event_data['sport'] = {'id': event.sport.id, 'name': event.sport.name, 'icon': event.sport.icon}
        
        result.append(event_data)
    
    return result


@router.get("/{event_id}", response_model=EventDetail)
async def get_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    """Get event details"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Get participants
    participant_ids = db.query(event_rsvps.c.user_id).filter(
        event_rsvps.c.event_id == event_id
    ).all()
    participant_ids = [p[0] for p in participant_ids]
    participants = db.query(User).filter(User.id.in_(participant_ids)).all()
    
    participant_count = len(participants)
    
    return EventDetail(
        **{col.name: getattr(event, col.name) for col in event.__table__.columns},
        participant_count=participant_count,
        host={"id": event.host.id, "full_name": event.host.full_name, "avatar_url": event.host.avatar_url, "location": event.host.location},
        sport={"id": event.sport.id, "name": event.sport.name, "icon": event.sport.icon},
        participants=[{"id": p.id, "full_name": p.full_name, "avatar_url": p.avatar_url, "location": p.location} for p in participants]
    )


@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: int,
    event_update: EventUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an event (host only)"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    if event.host_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the event host can update this event"
        )
    
    update_data = event_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)
    
    db.commit()
    db.refresh(event)
    
    participant_count = db.query(func.count(event_rsvps.c.user_id)).filter(
        event_rsvps.c.event_id == event.id
    ).scalar()
    
    return EventResponse(
        **{col.name: getattr(event, col.name) for col in event.__table__.columns},
        participant_count=participant_count or 0
    )


@router.post("/{event_id}/rsvp", response_model=EventDetail)
async def rsvp_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """RSVP to an event"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    if event.is_cancelled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event is cancelled"
        )
    
    # Check if already RSVP'd
    existing = db.query(event_rsvps).filter(
        event_rsvps.c.event_id == event_id,
        event_rsvps.c.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already RSVP'd to this event"
        )
    
    # Check max participants
    if event.max_participants:
        current_count = db.query(func.count(event_rsvps.c.user_id)).filter(
            event_rsvps.c.event_id == event_id
        ).scalar()
        if current_count >= event.max_participants:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Event is full"
            )
    
    db.execute(
        event_rsvps.insert().values(event_id=event_id, user_id=current_user.id)
    )
    db.commit()
    
    return await get_event(event_id, db)


@router.delete("/{event_id}/rsvp", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_rsvp(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel RSVP to an event"""
    db.execute(
        event_rsvps.delete().where(
            event_rsvps.c.event_id == event_id,
            event_rsvps.c.user_id == current_user.id
        )
    )
    db.commit()
    return None

