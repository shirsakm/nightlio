#!/usr/bin/env python3
"""
Test script to debug database creation issues in Railway
"""
import os
import sqlite3
from pathlib import Path

def test_database_creation():
    print("=== Database Creation Test ===")
    
    # Test different database paths
    test_paths = [
        '/tmp/nightlio.db',
        './nightlio.db',
        '/app/nightlio.db',
        os.path.join(os.getcwd(), 'nightlio.db')
    ]
    
    for db_path in test_paths:
        print(f"\nTesting path: {db_path}")
        
        try:
            # Check directory
            db_dir = os.path.dirname(db_path) if os.path.dirname(db_path) else '.'
            print(f"  Directory: {db_dir}")
            print(f"  Directory exists: {os.path.exists(db_dir)}")
            print(f"  Directory writable: {os.access(db_dir, os.W_OK)}")
            
            # Try to create database
            with sqlite3.connect(db_path) as conn:
                conn.execute('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY)')
                conn.commit()
                print(f"  ✅ SUCCESS: Database created at {db_path}")
                
                # Clean up
                if os.path.exists(db_path):
                    os.remove(db_path)
                    print(f"  🧹 Cleaned up test database")
                    
        except Exception as e:
            print(f"  ❌ FAILED: {str(e)}")
    
    print("\n=== Environment Info ===")
    print(f"Current working directory: {os.getcwd()}")
    print(f"User: {os.getenv('USER', 'unknown')}")
    print(f"Home: {os.getenv('HOME', 'unknown')}")
    print(f"Temp dir: {os.getenv('TMPDIR', '/tmp')}")
    
    # List writable directories
    print("\n=== Writable Directories ===")
    for path in ['/', '/tmp', '/app', '.', os.getcwd()]:
        if os.path.exists(path):
            writable = os.access(path, os.W_OK)
            print(f"  {path}: {'✅ writable' if writable else '❌ not writable'}")

if __name__ == '__main__':
    test_database_creation()