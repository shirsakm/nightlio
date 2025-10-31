#!/usr/bin/env python3
"""
Simple test script to verify the refactored API works
"""
import requests
import json

BASE_URL = "http://localhost:5000/api"


def test_api():
    print("Testing refactored API...")

    # Test time endpoint
    try:
        response = requests.get(f"{BASE_URL}/time")
        if response.status_code == 200:
            print("Time endpoint working")
        else:
            print("Time endpoint failed")
    except Exception as e:
        print(f"Time endpoint error: {e}")

    # Test groups endpoint
    try:
        response = requests.get(f"{BASE_URL}/groups")
        if response.status_code == 200:
            groups = response.json()
            print(f"Groups endpoint working - found {len(groups)} groups")
        else:
            print("Groups endpoint failed")
    except Exception as e:
        print(f"Groups endpoint error: {e}")

    # Test moods endpoint
    try:
        response = requests.get(f"{BASE_URL}/moods")
        if response.status_code == 200:
            moods = response.json()
            print(f"Moods endpoint working - found {len(moods)} entries")
        else:
            print("Moods endpoint failed")
    except Exception as e:
        print(f"Moods endpoint error: {e}")


if __name__ == "__main__":
    test_api()
