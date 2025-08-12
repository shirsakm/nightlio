#!/usr/bin/env python3
"""
Migration script to convert CSV mood data to SQLite database
Run this script if you have existing CSV data you want to preserve
"""

import csv
import os
from database import MoodDatabase

def migrate_csv_to_db():
    """Migrate existing CSV data to SQLite database"""
    
    # Paths
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    csv_path = os.path.join(data_dir, 'moods.csv')
    
    # Check if CSV file exists
    if not os.path.exists(csv_path):
        print("No CSV file found at:", csv_path)
        print("Nothing to migrate.")
        return
    
    # Initialize database
    db = MoodDatabase()
    
    # Read CSV and migrate data
    migrated_count = 0
    
    try:
        with open(csv_path, 'r') as f:
            csv_reader = csv.DictReader(f)
            
            for row in csv_reader:
                try:
                    date = row['date']
                    mood = int(row['mood'])
                    content = row['content']
                    
                    # Add to database
                    entry_id = db.add_mood_entry(date, mood, content)
                    migrated_count += 1
                    
                    print(f"Migrated entry {migrated_count}: {date} - Mood {mood}")
                    
                except (ValueError, KeyError) as e:
                    print(f"Skipping invalid row: {row} - Error: {e}")
                    continue
        
        print(f"\n✅ Migration completed successfully!")
        print(f"📊 Migrated {migrated_count} entries from CSV to SQLite database")
        
        # Optionally backup the CSV file
        backup_path = csv_path + '.backup'
        os.rename(csv_path, backup_path)
        print(f"📁 Original CSV file backed up to: {backup_path}")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")

if __name__ == "__main__":
    migrate_csv_to_db()