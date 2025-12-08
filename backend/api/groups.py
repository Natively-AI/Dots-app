from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from api.auth import get_current_user
from schemas.group_chat import GroupChatCreate, GroupChatUpdate, GroupChatResponse, GroupChatDetail
from models.user import User
from models.group_chat import GroupChat, group_members
from models.message import Message

router = APIRouter(prefix="/groups", tags=["groups"])


@router.post("", response_model=GroupChatResponse, status_code=status.HTTP_201_CREATED)
async def create_group(
    group_data: GroupChatCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new group chat"""
    if not group_data.member_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one member is required"
        )
    
    # Ensure creator is in members
    member_ids = list(set([current_user.id] + group_data.member_ids))
    
    # Verify all members exist
    members = db.query(User).filter(User.id.in_(member_ids)).all()
    if len(members) != len(member_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more users not found"
        )
    
    # Create group
    new_group = GroupChat(
        name=group_data.name,
        description=group_data.description,
        avatar_url=group_data.avatar_url,
        created_by_id=current_user.id
    )
    db.add(new_group)
    db.flush()
    
    # Add members
    for user in members:
        is_admin = user.id == current_user.id
        db.execute(
            group_members.insert().values(
                group_id=new_group.id,
                user_id=user.id,
                is_admin=is_admin
            )
        )
    
    db.commit()
    db.refresh(new_group)
    
    return GroupChatResponse.model_validate(new_group)


@router.get("", response_model=List[GroupChatResponse])
async def list_groups(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all groups the current user is a member of"""
    groups = db.query(GroupChat).join(
        group_members, GroupChat.id == group_members.c.group_id
    ).filter(
        group_members.c.user_id == current_user.id
    ).all()
    
    return [GroupChatResponse.model_validate(g) for g in groups]


@router.get("/{group_id}", response_model=GroupChatDetail)
async def get_group(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get group details"""
    group = db.query(GroupChat).filter(GroupChat.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    # Check if user is a member
    member = db.query(group_members).filter(
        group_members.c.group_id == group_id,
        group_members.c.user_id == current_user.id
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this group"
        )
    
    # Get members
    members = db.query(User).join(
        group_members, User.id == group_members.c.user_id
    ).filter(
        group_members.c.group_id == group_id
    ).all()
    
    # Get admin status for each member
    member_data = []
    for m in members:
        member_row = db.query(group_members).filter(
            group_members.c.group_id == group_id,
            group_members.c.user_id == m.id
        ).first()
        is_admin = member_row[2] if member_row else False
        
        member_data.append({
            "id": m.id,
            "full_name": m.full_name,
            "avatar_url": m.avatar_url,
            "is_admin": is_admin
        })
    
    return GroupChatDetail(
        **{col.name: getattr(group, col.name) for col in group.__table__.columns},
        members=member_data,
        created_by={
            "id": group.created_by.id,
            "full_name": group.created_by.full_name,
            "avatar_url": group.created_by.avatar_url
        }
    )


@router.put("/{group_id}", response_model=GroupChatResponse)
async def update_group(
    group_id: int,
    group_update: GroupChatUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update group (admin only)"""
    group = db.query(GroupChat).filter(GroupChat.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    # Check if user is admin
    member = db.query(group_members).filter(
        group_members.c.group_id == group_id,
        group_members.c.user_id == current_user.id,
        group_members.c.is_admin == True
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update the group"
        )
    
    if group_update.name:
        group.name = group_update.name
    if group_update.description is not None:
        group.description = group_update.description
    if group_update.avatar_url is not None:
        group.avatar_url = group_update.avatar_url
    
    db.commit()
    db.refresh(group)
    
    return GroupChatResponse.model_validate(group)


@router.post("/{group_id}/members", response_model=dict)
async def add_members(
    group_id: int,
    data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add members to group (admin only)"""
    group = db.query(GroupChat).filter(GroupChat.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    # Check if user is admin
    member = db.query(group_members).filter(
        group_members.c.group_id == group_id,
        group_members.c.user_id == current_user.id,
        group_members.c.is_admin == True
    ).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can add members"
        )
    
    user_ids = data.get("user_ids", [])
    users = db.query(User).filter(User.id.in_(user_ids)).all()
    
    for user in users:
        # Check if already a member
        existing = db.query(group_members).filter(
            group_members.c.group_id == group_id,
            group_members.c.user_id == user.id
        ).first()
        if not existing:
            db.execute(
                group_members.insert().values(
                    group_id=group_id,
                    user_id=user.id,
                    is_admin=False
                )
            )
    
    db.commit()
    return {"message": "Members added successfully"}


@router.delete("/{group_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member(
    group_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove member from group (admin or self)"""
    group = db.query(GroupChat).filter(GroupChat.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    # Check if user is admin or removing themselves
    is_admin = db.query(group_members).filter(
        group_members.c.group_id == group_id,
        group_members.c.user_id == current_user.id,
        group_members.c.is_admin == True
    ).first()
    
    if not is_admin and user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can remove other members"
        )
    
    # Don't allow removing the creator
    if user_id == group.created_by_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove group creator"
        )
    
    db.execute(
        group_members.delete().where(
            group_members.c.group_id == group_id,
            group_members.c.user_id == user_id
        )
    )
    db.commit()
    return None


@router.post("/{group_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
async def leave_group(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Leave a group"""
    group = db.query(GroupChat).filter(GroupChat.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    # Don't allow creator to leave
    if group.created_by_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group creator cannot leave the group"
        )
    
    db.execute(
        group_members.delete().where(
            group_members.c.group_id == group_id,
            group_members.c.user_id == current_user.id
        )
    )
    db.commit()
    return None

