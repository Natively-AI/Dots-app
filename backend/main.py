from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from api.auth import router as auth_router
from api.users import router as users_router
from api.events import router as events_router
from api.buddies import router as buddies_router
from api.messages import router as messages_router
from api.groups import router as groups_router
from api.sports import router as sports_router
from api.goals import router as goals_router

app = FastAPI(title="Dots API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(events_router)
app.include_router(buddies_router)
app.include_router(messages_router)
app.include_router(groups_router)
app.include_router(sports_router)
app.include_router(goals_router)

@app.get("/")
async def root():
    return {"message": "Dots API", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

