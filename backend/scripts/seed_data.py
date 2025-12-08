"""
Seed script to populate initial sports and goals data
"""
from sqlalchemy.orm import Session
from core.database import SessionLocal
from models.sport import Sport
from models.goal import Goal


def seed_sports(db: Session):
    sports = [
        {"name": "Running", "icon": "🏃"},
        {"name": "Cycling", "icon": "🚴"},
        {"name": "Swimming", "icon": "🏊"},
        {"name": "Weightlifting", "icon": "🏋️"},
        {"name": "Yoga", "icon": "🧘"},
        {"name": "Basketball", "icon": "🏀"},
        {"name": "Soccer", "icon": "⚽"},
        {"name": "Tennis", "icon": "🎾"},
        {"name": "Volleyball", "icon": "🏐"},
        {"name": "Rock Climbing", "icon": "🧗"},
        {"name": "Hiking", "icon": "🥾"},
        {"name": "CrossFit", "icon": "💪"},
        {"name": "Dancing", "icon": "💃"},
        {"name": "Martial Arts", "icon": "🥋"},
        {"name": "Pilates", "icon": "🧘‍♀️"},
    ]
    
    for sport_data in sports:
        existing = db.query(Sport).filter(Sport.name == sport_data["name"]).first()
        if not existing:
            sport = Sport(**sport_data)
            db.add(sport)
    
    db.commit()
    print("Seeded sports")


def seed_goals(db: Session):
    goals = [
        {"name": "Weight Loss", "description": "Lose weight and burn calories"},
        {"name": "Muscle Gain", "description": "Build muscle and strength"},
        {"name": "Cardio Fitness", "description": "Improve cardiovascular health"},
        {"name": "Flexibility", "description": "Increase flexibility and mobility"},
        {"name": "Endurance", "description": "Build stamina and endurance"},
        {"name": "General Health", "description": "Maintain overall health and wellness"},
        {"name": "Stress Relief", "description": "Reduce stress through physical activity"},
        {"name": "Social Connection", "description": "Meet people and build community"},
    ]
    
    for goal_data in goals:
        existing = db.query(Goal).filter(Goal.name == goal_data["name"]).first()
        if not existing:
            goal = Goal(**goal_data)
            db.add(goal)
    
    db.commit()
    print("Seeded goals")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_sports(db)
        seed_goals(db)
        print("Seeding complete!")
    finally:
        db.close()

