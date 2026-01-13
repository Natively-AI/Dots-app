from supabase import create_client, Client
from core.config import settings

# Create Supabase client for database operations
supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_KEY  # Use service role key for backend operations
)

def get_supabase() -> Client:
    """Get Supabase client for database operations"""
    return supabase
