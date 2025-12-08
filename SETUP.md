# Dots MVP Setup Guide

## Prerequisites

- Node.js >= 20.9.0
- Python 3.11+
- PostgreSQL 15+ (or Docker)
- Docker & Docker Compose (optional, for easier setup)

## Quick Start

### 1. Database Setup

**Option A: Using Docker (Recommended)**
```bash
docker-compose up db -d
```

**Option B: Local PostgreSQL**
```bash
# Create database
createdb dots

# Or using psql
psql -U postgres
CREATE DATABASE dots;
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and secret key

# Run database migrations
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head

# Seed initial data (sports and goals)
python scripts/seed_data.py

# Start the server
uvicorn main:app --reload
```

The backend API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API URL (default: http://localhost:8000)

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Project Structure

```
dots/
├── backend/              # FastAPI backend
│   ├── api/             # API routes
│   ├── core/            # Core config, database, security
│   ├── models/          # SQLAlchemy models
│   ├── schemas/         # Pydantic schemas
│   ├── services/        # Business logic
│   ├── alembic/        # Database migrations
│   └── scripts/         # Utility scripts
├── frontend/            # Next.js frontend
│   ├── app/             # Next.js app router pages
│   ├── components/      # React components
│   ├── lib/             # API client, utilities
│   └── types/           # TypeScript types
└── docker-compose.yml   # Docker configuration
```

## Key Features Implemented

### ✅ Authentication
- User registration and login
- JWT token-based authentication
- Protected routes

### ✅ User Profiles
- Profile creation and editing
- Sports preferences selection
- Fitness goals selection
- Avatar support (structure ready)

### ✅ Events
- Event creation, viewing, editing
- Event discovery with filtering
- RSVP functionality
- Participant management

### ✅ Buddy Matching
- Matching algorithm based on sports, goals, and location
- Suggested matches feed
- Match requests (send, accept, reject)

### ✅ Messaging
- 1:1 messaging between users
- Group messaging for events
- WebSocket support for real-time messaging
- Message history

### ✅ Freemium Structure
- Subscription model in database
- Free and premium tiers
- Ready for payment integration

## Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dots
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=["http://localhost:3000","http://localhost:3001"]
DEBUG=true
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Testing the Application

1. **Register a new user** at `/register`
2. **Complete your profile** at `/profile` (add sports, goals, location)
3. **Create an event** at `/events/create`
4. **Browse suggested matches** at `/matches`
5. **Send messages** at `/messages`

## Next Steps

- [ ] Add avatar upload functionality
- [ ] Implement real-time WebSocket messaging in frontend
- [ ] Add event edit/delete functionality
- [ ] Add location-based search with geolocation
- [ ] Implement payment integration for premium features
- [ ] Add email notifications
- [ ] Add event attendance tracking
- [ ] Improve matching algorithm with more factors

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Verify database exists: `psql -l | grep dots`

### CORS Issues
- Ensure CORS_ORIGINS in backend/.env includes your frontend URL
- Check that frontend NEXT_PUBLIC_API_URL matches backend URL

### Import Errors
- Ensure you're in the correct directory when running commands
- Activate virtual environment for backend
- Run `npm install` in frontend directory

## Support

For issues or questions, check the API documentation at `http://localhost:8000/docs`

