# 🚀 Start Here - Dots MVP

## ✅ All Issues Fixed!

The backend import errors have been resolved. You're ready to start the application!

## Quick Start (2 Terminals)

### Terminal 1 - Backend Server
```bash
cd /Users/emmanueliriarte/Desktop/natively/dots/backend
source venv/bin/activate
export PYTHONPATH=$(pwd):$PYTHONPATH
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

### Terminal 2 - Frontend Server
```bash
cd /Users/emmanueliriarte/Desktop/natively/dots/frontend
npm run dev
```

You should see:
```
  ▲ Next.js 16.0.3
  - Local:        http://localhost:3000
```

## Access Points

- **Frontend App**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Interactive Swagger UI)

## First Steps to Test

1. **Register** → Go to http://localhost:3000/register
   - Create a new account with email and password

2. **Complete Profile** → http://localhost:3000/profile
   - Add your name, age, location, bio
   - Select sports interests (Running, Cycling, etc.)
   - Select fitness goals (Weight Loss, Muscle Gain, etc.)

3. **Create an Event** → http://localhost:3000/events/create
   - Fill in event details
   - Choose a sport
   - Set date/time and location

4. **Browse Events** → http://localhost:3000/events
   - See all events
   - Filter by sport, location, search

5. **Find Matches** → http://localhost:3000/matches
   - See suggested workout buddies
   - Send match requests

6. **Send Messages** → http://localhost:3000/messages
   - Start conversations with matched users

## Troubleshooting

### Backend won't start?
- Make sure PostgreSQL is running: `docker ps | grep dots_db`
- If not, start it: `docker-compose up db -d`
- Check that `.env` file exists in `backend/` directory

### Frontend won't start?
- Make sure `.env.local` exists in `frontend/` with `NEXT_PUBLIC_API_URL=http://localhost:8000`
- Try `npm install` again

### Import errors?
- Make sure you're using the correct PYTHONPATH: `export PYTHONPATH=$(pwd):$PYTHONPATH`
- All imports should use `from core.` not `from backend.core.`

## What's Working

✅ Database setup complete
✅ All migrations applied
✅ Sports and goals seeded
✅ Backend imports fixed
✅ All dependencies installed
✅ Ready to test!

## Need Help?

- Check `QUICK_START.md` for more details
- Check `SETUP.md` for full setup guide
- Check `IMPLEMENTATION_SUMMARY.md` for feature overview
- API docs at http://localhost:8000/docs for testing endpoints

Happy testing! 🎉

