#!/usr/bin/env python3
"""
Script to populate Nightlio database with realistic demo data for screenshots
"""

import sys
import os
from datetime import datetime, timedelta
import random

# Add the api directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "api"))

from database import MoodDatabase


def create_demo_data():
    """Create realistic demo data for screenshots"""

    # Initialize database
    db = MoodDatabase()

    # Demo journal entries with realistic content
    demo_entries = [
        {
            "days_ago": 0,
            "mood": 4,
            "content": """# Great Day at Work!

Had an amazing presentation today. The team really liked my ideas for the new project. Feeling confident and motivated.

**Highlights:**
- Successful presentation
- Positive feedback from colleagues
- Started planning weekend trip

Looking forward to tomorrow!""",
            "options": ["motivated", "accomplished", "happy", "well-rested"],
        },
        {
            "days_ago": 1,
            "mood": 3,
            "content": """# Quiet Sunday

Spent most of the day reading and relaxing at home. Finished that book I've been working on for weeks.

Made some progress on organizing my room. Still have more to do but it's a start.

**Today's activities:**
- Finished reading "The Midnight Library"
- Organized desk and bookshelf
- Cooked a nice dinner

Feeling peaceful but a bit restless.""",
            "options": ["content", "relaxed", "bored", "tired"],
        },
        {
            "days_ago": 2,
            "mood": 2,
            "content": """# Stressful Day

Work was overwhelming today. Too many meetings and not enough time to actually get things done. 

Had trouble sleeping last night which didn't help. Need to find better ways to manage stress.

**Challenges:**
- Back-to-back meetings all day
- Deadline pressure mounting
- Feeling behind on everything

Tomorrow is a new day though.""",
            "options": ["stressed", "overwhelmed", "tired", "anxious"],
        },
        {
            "days_ago": 3,
            "mood": 5,
            "content": """# Amazing Weekend Adventure!

Went hiking with friends today - the weather was perfect! We found this incredible viewpoint I'd never seen before.

**Adventure highlights:**
- 8-mile hike to Eagle Peak
- Perfect weather (72°F and sunny)
- Amazing photos at the summit
- Great conversations with friends
- Discovered a new trail

Feeling so grateful for days like this. Nature really recharges my soul. Already planning our next adventure!

*Note: Remember to bring more water next time*""",
            "options": ["excited", "grateful", "happy", "refreshed"],
        },
        {
            "days_ago": 4,
            "mood": 3,
            "content": """# Regular Thursday

Pretty typical day. Work was fine, nothing too exciting or stressful. Had lunch with Sarah which was nice.

Been thinking about taking that online course I bookmarked last month. Maybe it's time to actually start it.

**Today:**
- Finished quarterly report
- Lunch with Sarah
- Grocery shopping
- Watched two episodes of that new series

Feeling okay, just kind of neutral about everything.""",
            "options": ["content", "unsure", "relaxed"],
        },
        {
            "days_ago": 5,
            "mood": 4,
            "content": """# Productive Wednesday

Got so much done today! Finally tackled that project I've been putting off for weeks.

**Accomplishments:**
- Completed the client presentation
- Organized my digital files
- Went for a 30-minute walk during lunch
- Cooked a healthy dinner

Feeling really good about my productivity lately. The new morning routine is definitely helping.""",
            "options": ["accomplished", "motivated", "focused", "well-rested"],
        },
        {
            "days_ago": 6,
            "mood": 2,
            "content": """# Rough Start to the Week

Monday blues hit hard today. Couldn't seem to get motivated and everything felt like a struggle.

Coffee machine broke this morning which didn't help. Had to get coffee from that expensive place down the street.

**Challenges:**
- Low energy all day
- Procrastinated on important tasks
- Felt disconnected from colleagues
- Weather was gloomy

Hoping tomorrow will be better. Maybe I need to go to bed earlier.""",
            "options": ["tired", "unmotivated", "sad", "restless"],
        },
        {
            "days_ago": 7,
            "mood": 4,
            "content": """# Great Sunday Brunch

Had the most amazing brunch with family today. Mom made her famous pancakes and we spent hours just talking and laughing.

**Family time:**
- Mom's incredible blueberry pancakes
- Long conversations about everything
- Played board games after lunch
- Helped dad with his garden

These moments remind me what's really important. Feeling so grateful for my family.""",
            "options": ["grateful", "happy", "content", "loved"],
        },
        {
            "days_ago": 8,
            "mood": 3,
            "content": """# Weekend Prep

Spent today getting ready for the week ahead. Did laundry, meal prep, and cleaned the apartment.

**Productive Saturday:**
- Laundry and cleaning
- Meal prep for the week
- Grocery shopping
- Organized workspace

Not the most exciting day but feeling prepared for Monday. Sometimes these quiet, productive days are exactly what I need.""",
            "options": ["content", "accomplished", "organized"],
        },
        {
            "days_ago": 9,
            "mood": 5,
            "content": """# Concert Night! 🎵

Went to see my favorite band live tonight - they were INCREDIBLE! The energy in the venue was electric.

**Amazing night:**
- Front row seats (thanks to early arrival!)
- They played all my favorite songs
- Met some really cool people in line
- Perfect sound quality
- Got a signed poster!

Still buzzing with excitement. Music has such a powerful way of lifting your spirits. This is definitely going in my top 10 concerts ever!

*Already looking up their next tour dates*""",
            "options": ["excited", "happy", "energized", "grateful"],
        },
    ]

    print("🌙 Creating demo data for Nightlio...")

    # Get the existing self-host user by google_id
    self_host_user = db.get_user_by_google_id("selfhost_default_user")
    if not self_host_user:
        print(
            "❌ Self-host user not found. Please run the self-host seed script first."
        )
        return

    demo_user_id = self_host_user["id"]
    print(f"✅ Using existing self-host user with ID: {demo_user_id}")

    # Get all available options from database
    groups = db.get_all_groups()
    option_lookup = {}
    for group in groups:
        for option in group["options"]:
            option_lookup[option["name"]] = option["id"]

    # Create entries
    for entry_data in demo_entries:
        # Calculate date
        entry_date = datetime.now() - timedelta(days=entry_data["days_ago"])
        date_str = entry_date.strftime("%m/%d/%Y")
        time_str = entry_date.isoformat()

        # Map option names to IDs
        selected_option_ids = []
        for option_name in entry_data["options"]:
            if option_name in option_lookup:
                selected_option_ids.append(option_lookup[option_name])

        # Create the entry
        entry_id = db.add_mood_entry(
            user_id=demo_user_id,
            date=date_str,
            mood=entry_data["mood"],
            content=entry_data["content"],
            time=time_str,
            selected_options=selected_option_ids,
        )

        print(f"✅ Created entry {entry_id}: {date_str} - Mood {entry_data['mood']}")

    print(f"\n🎉 Successfully created {len(demo_entries)} demo entries!")
    print("📸 Your database is now ready for screenshots!")

    # Show some stats
    stats = db.get_mood_statistics(demo_user_id)
    print(f"\n📊 Current stats:")
    print(f"   Total entries: {stats['total_entries']}")
    print(f"   Average mood: {stats['average_mood']:.1f}")
    print(f"   Current streak: {db.get_current_streak(demo_user_id)}")


if __name__ == "__main__":
    create_demo_data()
