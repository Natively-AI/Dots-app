from sqlalchemy.orm import Session
from typing import List
from models.user import User
from models.match import Match, MatchStatus


def calculate_match_score(user1: User, user2: User) -> float:
    """
    Calculate match score between two users based on:
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


def find_potential_matches(
    user: User,
    db: Session,
    limit: int = None,
    min_score: float = 30.0
) -> List[dict]:
    """
    Find potential matches for a user
    Returns all matches sorted by score, limit can be applied by caller
    """
    # Get all users except current user and existing matches
    existing_match_user_ids = db.query(Match.user2_id).filter(
        Match.user1_id == user.id
    ).union(
        db.query(Match.user1_id).filter(Match.user2_id == user.id)
    ).all()
    existing_match_user_ids = [m[0] for m in existing_match_user_ids]
    
    potential_users = db.query(User).filter(
        User.id != user.id,
        User.is_active == True,
        ~User.id.in_(existing_match_user_ids) if existing_match_user_ids else True
    ).all()
    
    matches = []
    for potential_user in potential_users:
        score = calculate_match_score(user, potential_user)
        if score >= min_score:
            matches.append({
                "user": potential_user,
                "score": score
            })
    
    # Sort by score descending
    matches.sort(key=lambda x: x["score"], reverse=True)
    
    # Apply limit if provided
    if limit:
        return matches[:limit]
    return matches


def create_match_request(
    user1_id: int,
    user2_id: int,
    db: Session
) -> Match:
    """
    Create a match request
    """
    # Check if match already exists
    existing = db.query(Match).filter(
        ((Match.user1_id == user1_id) & (Match.user2_id == user2_id)) |
        ((Match.user1_id == user2_id) & (Match.user2_id == user1_id))
    ).first()
    
    if existing:
        raise ValueError("Match already exists")
    
    # Calculate score
    user1 = db.query(User).filter(User.id == user1_id).first()
    user2 = db.query(User).filter(User.id == user2_id).first()
    score = calculate_match_score(user1, user2)
    
    match = Match(
        user1_id=user1_id,
        user2_id=user2_id,
        match_score=score,
        status=MatchStatus.PENDING
    )
    db.add(match)
    db.commit()
    db.refresh(match)
    
    return match

