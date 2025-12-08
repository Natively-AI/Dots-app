# Sample Data Guide

## 🎉 Sample Data Populated!

The database has been populated with sample data to help you test the application.

## 📊 What's Included

- **8 Sample Users** with profiles, sports interests, and fitness goals
- **8 Sample Events** across different sports and locations
- **10 Sample Matches** between users
- **Sports & Goals** already seeded from initial setup

## 🔑 Test Credentials

All sample users have the same password for easy testing:

**Password for all users:** `password123`

**Sample Users:**
- alice@example.com - Alice Johnson (Running, Yoga)
- bob@example.com - Bob Smith (Cycling)
- charlie@example.com - Charlie Brown (Weightlifting, CrossFit)
- diana@example.com - Diana Prince (Yoga, Pilates)
- eve@example.com - Eve Martinez (Swimming, Hiking)
- frank@example.com - Frank Wilson (Basketball)
- grace@example.com - Grace Lee (Tennis, Dancing)
- henry@example.com - Henry Davis (Rock Climbing, Hiking)

## 🧹 Cleaning Sample Data

### Option 1: Clean all sample data
```bash
cd backend
source venv/bin/activate
export PYTHONPATH=$(pwd):$PYTHONPATH
python scripts/seed_sample_data.py clean
```

### Option 2: Use the dedicated clean script
```bash
cd backend
source venv/bin/activate
export PYTHONPATH=$(pwd):$PYTHONPATH
python scripts/clean_sample_data.py
```

### Option 3: Re-seed (cleans and re-creates)
```bash
cd backend
source venv/bin/activate
export PYTHONPATH=$(pwd):$PYTHONPATH
python scripts/seed_sample_data.py clean
python scripts/seed_sample_data.py
```

## 🔄 Re-populating Sample Data

To add fresh sample data:

```bash
cd backend
source venv/bin/activate
export PYTHONPATH=$(pwd):$PYTHONPATH
python scripts/seed_sample_data.py
```

**Note:** The script will skip users that already exist, so you can run it multiple times safely.

## 📝 What Gets Cleaned

When you run the clean script, it removes:
- ✅ All matches
- ✅ All event RSVPs
- ✅ All events
- ✅ All subscriptions
- ✅ All users

**Note:** Sports and Goals are NOT deleted (they're part of the base data).

## 🎯 Testing Tips

1. **Login as different users** to see different perspectives
2. **Create your own account** to interact with sample users
3. **RSVP to events** to see participant lists
4. **Send match requests** to see the matching system
5. **Send messages** between users

## 🚀 Quick Test Flow

1. Go to http://localhost:3000
2. Login with: `alice@example.com` / `password123`
3. Browse events at `/events`
4. Check matches at `/matches`
5. View profile at `/profile`
6. Send messages at `/messages`

Enjoy testing! 🎉

