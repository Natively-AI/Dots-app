from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from core.database import get_supabase, get_db
from api.auth import get_current_user
from schemas.user import UserResponse, UserUpdate, UserProfile, CompleteProfileRequest
from schemas.user_photo import UserPhotoCreate, UserPhotoResponse
from models.user import User

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    current_user: dict = Depends(get_current_user)
):
    """Get current user's profile"""
    try:
        supabase: Client = get_supabase()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Supabase connection error: {str(e)}"
        )
    
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID not found"
        )
    
    # Get photos - handle errors gracefully
    photos = []
    try:
        photos_result = supabase.table("user_photos").select("*").eq("user_id", user_id).order("display_order").execute()
        photos = photos_result.data if photos_result.data else []
    except Exception:
        photos = []
    
    # Get sports - handle errors gracefully
    sports = []
    try:
        sports_result = supabase.table("user_sports").select("sport_id, sports(*)").eq("user_id", user_id).execute()
        if sports_result.data:
            for item in sports_result.data:
                if item.get("sports"):
                    sports.append(item["sports"])
    except Exception:
        sports = []
    
    # Get goals - handle errors gracefully
    goals = []
    try:
        goals_result = supabase.table("user_goals").select("goal_id, goals(*)").eq("user_id", user_id).execute()
        if goals_result.data:
            for item in goals_result.data:
                if item.get("goals"):
                    goals.append(item["goals"])
    except Exception:
        goals = []
    
    # Build response with safe defaults
    response = {
        **current_user,
        "sports": [{"id": s.get("id"), "name": s.get("name") or "Unknown", "icon": s.get("icon") or "🏃"} for s in sports if s.get("id")],
        "goals": [{"id": g.get("id"), "name": g.get("name") or "Unknown"} for g in goals if g.get("id")],
        "photos": [{"id": p.get("id"), "photo_url": p.get("photo_url") or "", "display_order": p.get("display_order", 0)} for p in photos if p.get("id")]
    }
    
    # Ensure all required fields have defaults
    if not response.get("full_name"):
        response["full_name"] = None
    if not response.get("avatar_url"):
        response["avatar_url"] = None
    if not response.get("cover_image_url"):
        response["cover_image_url"] = None
    if not response.get("bio"):
        response["bio"] = None
    if not response.get("location"):
        response["location"] = None
    if response.get("age") is None:
        response["age"] = None
    
    return response


@router.get("/search", response_model=List[UserProfile])
async def search_users(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Search for users by name, location, or bio"""
    query = db.query(User).filter(User.is_active == True)
    
    search_term = f"%{q.lower()}%"
    query = query.filter(
        or_(
            User.full_name.ilike(search_term),
            User.location.ilike(search_term),
            User.bio.ilike(search_term)
        )
    )
    
    users = query.limit(limit).all()
    
    result = []
    for user in users:
        result.append({
            **UserResponse.model_validate(user).model_dump(),
            "sports": [{"id": s.id, "name": s.name, "icon": s.icon} for s in user.sports],
            "goals": [{"id": g.id, "name": g.name} for g in user.goals]
        })
    
    return result


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
    current_user: dict = Depends(get_current_user)
):
    """Update current user's profile"""
    try:
        supabase: Client = get_supabase()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Supabase connection error: {str(e)}"
        )
    
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID not found"
        )
    update_data = user_update.dict(exclude_unset=True)
    
    # Handle sports and goals separately
    sport_ids = update_data.pop("sport_ids", None)
    goal_ids = update_data.pop("goal_ids", None)
    
    # Update basic fields in users table
    if update_data:
        result = supabase.table("users").update(update_data).eq("id", user_id).execute()
        if not result.data:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update user")
        current_user = result.data[0]
    
    # Update sports
    if sport_ids is not None:
        # Delete existing user_sports
        supabase.table("user_sports").delete().eq("user_id", user_id).execute()
        # Insert new user_sports
        if sport_ids:
            user_sports_data = [{"user_id": user_id, "sport_id": sid} for sid in sport_ids]
            supabase.table("user_sports").insert(user_sports_data).execute()
    
    # Update goals
    if goal_ids is not None:
        # Delete existing user_goals
        supabase.table("user_goals").delete().eq("user_id", user_id).execute()
        # Insert new user_goals
        if goal_ids:
            user_goals_data = [{"user_id": user_id, "goal_id": gid} for gid in goal_ids]
            supabase.table("user_goals").insert(user_goals_data).execute()
    
    # Get updated user with relations
    return await get_current_user_profile(current_user=current_user)


@router.post("/me/photos", response_model=UserPhotoResponse, status_code=status.HTTP_201_CREATED)
async def add_user_photo(
    photo_data: UserPhotoCreate,
    current_user: dict = Depends(get_current_user)
):
    """Add a photo to user's profile"""
    try:
        supabase: Client = get_supabase()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Supabase connection error: {str(e)}"
        )
    
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID not found"
        )
    
    # Check photo limit (4 photos max)
    existing_photos = supabase.table("user_photos").select("*").eq("user_id", user_id).execute()
    existing_count = len(existing_photos.data) if existing_photos.data else 0
    if existing_count >= 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 4 photos allowed"
        )
    
    # Insert new photo
    new_photo_data = {
        "user_id": user_id,
        "photo_url": photo_data.photo_url,
        "display_order": photo_data.display_order or existing_count
    }
    result = supabase.table("user_photos").insert(new_photo_data).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add photo"
        )
    
    return UserPhotoResponse(**result.data[0])


@router.delete("/me/photos/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_photo(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a user photo"""
    photo = db.query(UserPhoto).filter(
        UserPhoto.id == photo_id,
        UserPhoto.user_id == current_user.id
    ).first()
    
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found"
        )
    
    db.delete(photo)
    db.commit()
    return None


@router.post("/me/complete-profile", response_model=UserProfile)
async def complete_profile(
    request: CompleteProfileRequest,
    current_user: dict = Depends(get_current_user)
):
    """Complete profile onboarding - only name and age are required"""
    is_discoverable = request.is_discoverable
    
    # Check minimum requirements
    if not current_user.get("full_name"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full name is required"
        )
    
    if not current_user.get("age"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Age is required"
        )
    
    try:
        supabase: Client = get_supabase()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Supabase connection error: {str(e)}"
        )
    
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID not found"
        )
    
    # Update profile
    result = supabase.table("users").update({
        "is_discoverable": is_discoverable,
        "profile_completed": True
    }).eq("id", user_id).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete profile"
        )
    
    # Get updated user with relations
    return await get_current_user_profile(current_user=result.data[0])

