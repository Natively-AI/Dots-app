# Quick Test Guide - Dots MVP

## 🎉 Sample Data Ready!

The database has been populated with sample data. You can now test the full application!

## 🚀 Quick Start

### 1. Start Backend (Terminal 1)
```bash
cd backend
source venv/bin/activate
export PYTHONPATH=$(pwd):$PYTHONPATH
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

## 🔑 Test Login

**All sample users have password:** `password123`

Try logging in with:
- `alice@example.com` / `password123`
- `bob@example.com` / `password123`
- `diana@example.com` / `password123`
- Or any other user from the sample data

## 📱 Test Flow

### 1. Home Feed (`/`)
- ✅ See upcoming events
- ✅ See suggested workout buddies
- ✅ Quick actions to create events

### 2. Events (`/events`)
- ✅ Browse all events
- ✅ Filter by sport, location, search
- ✅ View event details
- ✅ RSVP to events

### 3. Matches (`/matches`)
- ✅ See suggested matches
- ✅ View existing matches
- ✅ Send match requests
- ✅ Accept/reject matches

### 4. Profile (`/profile`)
- ✅ Edit your profile
- ✅ Select sports interests
- ✅ Set fitness goals
- ✅ Update location and bio

### 5. Messages (`/messages`)
- ✅ View conversations
- ✅ Send 1:1 messages
- ✅ Group chat for events

## 🧹 Clean Sample Data

When you're done testing, clean the sample data:

```bash
cd backend
source venv/bin/activate
export PYTHONPATH=$(pwd):$PYTHONPATH
python scripts/seed_sample_data.py clean
```

## 🔄 Re-populate Sample Data

To get fresh sample data:

```bash
cd backend
source venv/bin/activate
export PYTHONPATH=$(pwd):$PYTHONPATH
python scripts/seed_sample_data.py
```

## 📊 What's Included

- **8 Sample Users** with complete profiles
- **8 Sample Events** across different sports
- **10 Sample Matches** between users
- **15 Sports** (Running, Cycling, Yoga, etc.)
- **8 Fitness Goals** (Weight Loss, Muscle Gain, etc.)

## 🎯 Testing Tips

1. **Login as different users** to see different data
2. **Create your own account** to interact with sample users
3. **RSVP to events** to see participant management
4. **Send match requests** to test the matching system
5. **Complete your profile** to get better match suggestions

## 🐛 Troubleshooting

### No events showing?
- Make sure sample data was seeded: `python scripts/seed_sample_data.py`
- Check backend is running and connected to database

### No matches showing?
- Complete your profile with sports and goals
- The matching algorithm needs profile data to work

### Can't login?
- Use: `alice@example.com` / `password123`
- Or create a new account

Happy testing! 🎉

