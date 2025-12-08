# 🎉 Sample Data Populated!

Your database now has sample data to make the UI look populated and help you test the application.

## 📊 What Was Created

- ✅ **8 Sample Users** with complete profiles
- ✅ **8 Sample Events** across different sports
- ✅ **10 Sample Matches** between users
- ✅ All users have sports interests and fitness goals assigned

## 🔑 Quick Login

**All sample users use the same password:** `password123`

Try these accounts:
- `alice@example.com` / `password123`
- `bob@example.com` / `password123`
- `diana@example.com` / `password123`
- Or any other user from the list

## 🧹 Clean Sample Data

To remove all sample data:

```bash
cd backend
source venv/bin/activate
export PYTHONPATH=$(pwd):$PYTHONPATH
python scripts/seed_sample_data.py clean
```

## 🔄 Re-populate

To add fresh sample data:

```bash
cd backend
source venv/bin/activate
export PYTHONPATH=$(pwd):$PYTHONPATH
python scripts/seed_sample_data.py
```

**Note:** The script skips existing users, so you can run it multiple times safely.

## 📱 What You'll See

After logging in, you'll see:
- **Home Feed**: Upcoming events and suggested matches
- **Events Page**: 8 different events you can browse and RSVP to
- **Matches Page**: Suggested workout buddies based on your profile
- **Messages**: Empty (you can start conversations)

## 🎯 Next Steps

1. **Login** with one of the sample accounts
2. **Browse events** and RSVP to some
3. **Check matches** to see suggested buddies
4. **Create your own account** to interact with sample users
5. **Send messages** to test the messaging system

Enjoy testing! The UI should now be much more populated and realistic! 🚀

