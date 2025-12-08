# Quick Start Guide - Dots MVP

## ✅ Setup Complete!

Your project is ready to run. Here's how to start everything:

## Option 1: Use the Run Script (Easiest)

```bash
./run.sh
```

This will start:
- PostgreSQL database (via Docker)
- Backend API server (http://localhost:8000)
- Frontend web app (http://localhost:3000)

## Option 2: Manual Start

### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate
export PYTHONPATH=$(pwd):$PYTHONPATH
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## First Steps

1. **Register a new account** at http://localhost:3000/register
2. **Complete your profile** at http://localhost:3000/profile
   - Add your sports interests
   - Set your fitness goals
   - Add location and bio
3. **Create an event** at http://localhost:3000/events/create
4. **Browse matches** at http://localhost:3000/matches
5. **Send messages** at http://localhost:3000/messages

## Database Status

The database is already set up with:
- ✅ All tables created
- ✅ Sports and goals seeded
- ✅ Ready for use

## Troubleshooting

### Backend not starting?
- Check if port 8000 is already in use
- Make sure PostgreSQL is running: `docker ps | grep dots_db`
- Check backend/.env file exists

### Frontend not starting?
- Check if port 3000 is already in use
- Make sure .env.local exists in frontend directory
- Try `npm install` again

### Database connection issues?
- Start database: `docker-compose up db -d`
- Check DATABASE_URL in backend/.env

## Need Help?

- API docs: http://localhost:8000/docs (interactive API testing)
- Check SETUP.md for detailed setup instructions
- Check IMPLEMENTATION_SUMMARY.md for feature overview

Happy testing! 🎉

