from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from api.auth import get_current_user
from schemas.message import MessageCreate, MessageResponse, MessageDetail
from models.user import User
from models.message import Message
from models.event import Event
from core.security import verify_token
import json

router = APIRouter(prefix="/messages", tags=["messages"])

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket
    
    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
    
    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)
    
    async def broadcast_to_event(self, message: dict, event_id: int, db: Session):
        # Get all participants of the event
        from models.event import event_rsvps
        participant_ids = db.query(event_rsvps.c.user_id).filter(
            event_rsvps.c.event_id == event_id
        ).all()
        participant_ids = [p[0] for p in participant_ids]
        
        for user_id in participant_ids:
            if user_id in self.active_connections:
                await self.active_connections[user_id].send_json(message)

manager = ConnectionManager()


@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    """WebSocket endpoint for real-time messaging"""
    # Verify token
    payload = verify_token(token)
    if not payload:
        await websocket.close(code=1008, reason="Invalid token")
        return
    
    email = payload.get("sub")
    db = next(get_db())
    user = db.query(User).filter(User.email == email).first()
    if not user:
        await websocket.close(code=1008, reason="User not found")
        return
    
    await manager.connect(websocket, user.id)
    
    try:
        while True:
            data = await websocket.receive_json()
            message_type = data.get("type")
            
            if message_type == "message":
                # Create message
                content = data.get("content")
                receiver_id = data.get("receiver_id")
                event_id = data.get("event_id")
                
                if not content:
                    continue
                
                # Validate receiver or event
                if receiver_id:
                    receiver = db.query(User).filter(User.id == receiver_id).first()
                    if not receiver:
                        continue
                elif event_id:
                    event = db.query(Event).filter(Event.id == event_id).first()
                    if not event:
                        continue
                else:
                    continue
                
                # Create message in database
                new_message = Message(
                    sender_id=user.id,
                    receiver_id=receiver_id,
                    event_id=event_id,
                    content=content
                )
                db.add(new_message)
                db.commit()
                db.refresh(new_message)
                
                # Prepare message response
                message_data = {
                    "id": new_message.id,
                    "sender_id": new_message.sender_id,
                    "receiver_id": new_message.receiver_id,
                    "event_id": new_message.event_id,
                    "content": new_message.content,
                    "is_read": new_message.is_read,
                    "created_at": new_message.created_at.isoformat(),
                    "sender": {
                        "id": user.id,
                        "full_name": user.full_name,
                        "avatar_url": user.avatar_url
                    }
                }
                
                # Send to receiver or broadcast to event
                if receiver_id:
                    await manager.send_personal_message(message_data, receiver_id)
                elif event_id:
                    await manager.broadcast_to_event(message_data, event_id, db)
                
                # Echo back to sender
                await manager.send_personal_message(message_data, user.id)
            
            elif message_type == "read":
                # Mark message as read
                message_id = data.get("message_id")
                if message_id:
                    message = db.query(Message).filter(Message.id == message_id).first()
                    if message and message.receiver_id == user.id:
                        message.is_read = True
                        db.commit()
    
    except WebSocketDisconnect:
        manager.disconnect(user.id)
    finally:
        db.close()


@router.post("", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a message (1:1, event, or group chat)"""
    from models.group_chat import GroupChat, group_members
    
    if message_data.receiver_id:
        receiver = db.query(User).filter(User.id == message_data.receiver_id).first()
        if not receiver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Receiver not found"
            )
    elif message_data.event_id:
        event = db.query(Event).filter(Event.id == message_data.event_id).first()
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
    elif message_data.group_id:
        group = db.query(GroupChat).filter(GroupChat.id == message_data.group_id).first()
        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Group not found"
            )
        # Check if user is a member
        member = db.query(group_members).filter(
            group_members.c.group_id == message_data.group_id,
            group_members.c.user_id == current_user.id
        ).first()
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not a member of this group"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either receiver_id, event_id, or group_id must be provided"
        )
    
    new_message = Message(
        sender_id=current_user.id,
        receiver_id=message_data.receiver_id,
        event_id=message_data.event_id,
        group_id=message_data.group_id,
        content=message_data.content
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    return MessageResponse.model_validate(new_message)


@router.get("/conversations", response_model=List[dict])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all conversations for current user"""
    # Get 1:1 conversations
    sent_messages = db.query(Message.receiver_id).filter(
        Message.sender_id == current_user.id,
        Message.receiver_id.isnot(None)
    ).distinct().all()
    
    received_messages = db.query(Message.sender_id).filter(
        Message.receiver_id == current_user.id
    ).distinct().all()
    
    user_ids = set([m[0] for m in sent_messages] + [m[0] for m in received_messages])
    
    # Get event conversations
    event_messages = db.query(Message.event_id).filter(
        Message.sender_id == current_user.id,
        Message.event_id.isnot(None)
    ).distinct().all()
    event_ids = [m[0] for m in event_messages]
    
    # Get group conversations
    from models.group_chat import GroupChat, group_members
    group_member_rows = db.query(group_members.c.group_id).filter(
        group_members.c.user_id == current_user.id
    ).all()
    group_ids = [g[0] for g in group_member_rows]
    
    conversations = []
    
    # Add 1:1 conversations
    for user_id in user_ids:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            last_message = db.query(Message).filter(
                ((Message.sender_id == current_user.id) & (Message.receiver_id == user_id)) |
                ((Message.sender_id == user_id) & (Message.receiver_id == current_user.id))
            ).order_by(Message.created_at.desc()).first()
            
            unread_count = db.query(Message).filter(
                Message.sender_id == user_id,
                Message.receiver_id == current_user.id,
                Message.is_read == False
            ).count()
            
            conversations.append({
                "type": "user",
                "id": user_id,
                "name": user.full_name,
                "avatar_url": user.avatar_url,
                "last_message": {
                    "content": last_message.content if last_message else None,
                    "created_at": last_message.created_at.isoformat() if last_message else None
                },
                "unread_count": unread_count
            })
    
    # Add event conversations
    for event_id in event_ids:
        event = db.query(Event).filter(Event.id == event_id).first()
        if event:
            last_message = db.query(Message).filter(
                Message.event_id == event_id
            ).order_by(Message.created_at.desc()).first()
            
            conversations.append({
                "type": "event",
                "id": event_id,
                "name": event.title,
                "avatar_url": event.image_url,
                "last_message": {
                    "content": last_message.content if last_message else None,
                    "created_at": last_message.created_at.isoformat() if last_message else None
                },
                "unread_count": 0  # Event messages don't have read receipts in MVP
            })
    
    # Add group conversations
    for group_id in group_ids:
        group = db.query(GroupChat).filter(GroupChat.id == group_id).first()
        if group:
            last_message = db.query(Message).filter(
                Message.group_id == group_id
            ).order_by(Message.created_at.desc()).first()
            
            # Get member count
            member_count = db.query(group_members).filter(
                group_members.c.group_id == group_id
            ).count()
            
            conversations.append({
                "type": "group",
                "id": group_id,
                "name": group.name,
                "avatar_url": group.avatar_url,
                "member_count": member_count,
                "last_message": {
                    "content": last_message.content if last_message else None,
                    "created_at": last_message.created_at.isoformat() if last_message else None
                },
                "unread_count": 0  # Group messages don't have read receipts in MVP
            })
    
    # Sort by last message time
    conversations.sort(key=lambda x: x["last_message"]["created_at"] or "", reverse=True)
    
    return conversations


@router.get("/conversations/{conversation_id}", response_model=List[MessageDetail])
async def get_conversation(
    conversation_id: int,
    conversation_type: str = "user",  # "user", "event", or "group"
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get messages in a conversation"""
    if conversation_type == "user":
        messages = db.query(Message).filter(
            ((Message.sender_id == current_user.id) & (Message.receiver_id == conversation_id)) |
            ((Message.sender_id == conversation_id) & (Message.receiver_id == current_user.id)),
            Message.event_id.is_(None),
            Message.group_id.is_(None)
        ).order_by(Message.created_at).all()
    elif conversation_type == "event":
        messages = db.query(Message).filter(
            Message.event_id == conversation_id
        ).order_by(Message.created_at).all()
    else:  # group
        from models.group_chat import group_members
        # Check if user is a member
        member = db.query(group_members).filter(
            group_members.c.group_id == conversation_id,
            group_members.c.user_id == current_user.id
        ).first()
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not a member of this group"
            )
        messages = db.query(Message).filter(
            Message.group_id == conversation_id
        ).order_by(Message.created_at).all()
    
    result = []
    for message in messages:
        result.append(MessageDetail(
            **{col.name: getattr(message, col.name) for col in message.__table__.columns},
            sender={
                "id": message.sender.id,
                "full_name": message.sender.full_name,
                "avatar_url": message.sender.avatar_url
            },
            receiver={
                "id": message.receiver.id,
                "full_name": message.receiver.full_name,
                "avatar_url": message.receiver.avatar_url
            } if message.receiver else None,
            event={
                "id": message.event.id,
                "title": message.event.title
            } if message.event else None
        ))
    
    return result

