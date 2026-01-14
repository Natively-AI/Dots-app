from fastapi import APIRouter, HTTPException, status
from supabase import Client
from typing import List
from core.database import get_supabase

router = APIRouter(prefix="/sports", tags=["sports"])


@router.get("", response_model=List[dict])
async def list_sports():
    """List all available sports"""
    try:
        supabase: Client = get_supabase()
        result = supabase.table("sports").select("*").order("name").execute()
        if result.data:
            return [{"id": s.get("id"), "name": s.get("name"), "icon": s.get("icon")} for s in result.data]
        return []
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch sports: {str(e)}"
        )

