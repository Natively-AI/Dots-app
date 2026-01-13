from sqlalchemy.orm import Session
from typing import List
from models.user import User
from models.buddy import Buddy, BuddyStatus


def calculate_buddy_score(user1: User, user2: User) -> float:
    """
    Calculate buddy score between two users based on:
    - Sports overlap (40%)
    - Goals overlap (30%)
    - Location proximity (30%)
    """
    score = 0.0
    
    # Sports overlap (40%)
    user1_sports = {s.id for s in user1.sports}
    user2_sports = {s.id for s in user2.sports}
    if user1_sports and user2_sports:
        common_sports = user1_sports.intersection(user2_sports)
        total_sports = user1_sports.union(user2_sports)
        sports_score = len(common_sports) / len(total_sports) if total_sports else 0
        score += sports_score * 0.4
    elif not user1_sports and not user2_sports:
        score += 0.2  # Both have no sports, neutral score
    
    # Goals overlap (30%)
    user1_goals = {g.id for g in user1.goals}
    user2_goals = {g.id for g in user2.goals}
    if user1_goals and user2_goals:
        common_goals = user1_goals.intersection(user2_goals)
        total_goals = user1_goals.union(user2_goals)
        goals_score = len(common_goals) / len(total_goals) if total_goals else 0
        score += goals_score * 0.3
    elif not user1_goals and not user2_goals:
        score += 0.15  # Both have no goals, neutral score
    
    # Location proximity (30%) - simplified for MVP
    # In production, use geolocation distance calculation
    if user1.location and user2.location:
        if user1.location.lower() == user2.location.lower():
            score += 0.3
        elif user1.location.lower() in user2.location.lower() or user2.location.lower() in user1.location.lower():
            score += 0.15
    else:
        score += 0.1  # Neutral if location not set
    
    return round(score * 100, 2)  # Return as percentage


def find_potential_buddies(
    user: User,
    db: Session,
    limit: int = None,
    min_score: float = 30.0
) -> List[dict]:
    """
    Find potential buddies for a user
    Returns all buddies sorted by score, limit can be applied by caller
    """
    # Get all users except current user and existing buddies
    existing_buddy_user_ids = db.query(Buddy.user2_id).filter(
        Buddy.user1_id == user.id
    ).union(
        db.query(Buddy.user1_id).filter(Buddy.user2_id == user.id)
    ).all()
    existing_buddy_user_ids = [m[0] for m in existing_buddy_user_ids]
    
    potential_users = db.query(User).filter(
        User.id != user.id,
        User.is_active == True,
        ~User.id.in_(existing_buddy_user_ids) if existing_buddy_user_ids else True
    ).all()
    
    buddies = []
    for potential_user in potential_users:
        score = calculate_buddy_score(user, potential_user)
        if score >= min_score:
            buddies.append({
                "user": potential_user,
                "score": score
            })
    
    # Sort by score descending
    buddies.sort(key=lambda x: x["score"], reverse=True)
    
    # Apply limit if provided
    if limit:
        return buddies[:limit]
    return buddies


def create_buddy_request(
    user1_id: int,
    user2_id: int,
    db: Session
) -> Buddy:
    """
    Create a buddy request
    """
    # Check if buddy already exists
    existing = db.query(Buddy).filter(
        ((Buddy.user1_id == user1_id) & (Buddy.user2_id == user2_id)) |
        ((Buddy.user1_id == user2_id) & (Buddy.user2_id == user1_id))
    ).first()
    
    if existing:
        raise ValueError("Buddy already exists")
    
    # Calculate score
    user1 = db.query(User).filter(User.id == user1_id).first()
    user2 = db.query(User).filter(User.id == user2_id).first()
    score = calculate_buddy_score(user1, user2)
    
    buddy = Buddy(
        user1_id=user1_id,
        user2_id=user2_id,
        match_score=score,
        status=BuddyStatus.PENDING
    )
    db.add(buddy)
    db.commit()
    db.refresh(buddy)
    
    return buddy
