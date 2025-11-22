#!/usr/bin/env python3
"""
Simple test script to verify the refactored API works
"""
import requests
import sys

BASE_URL = "http://localhost:5000/api"


def test_api():
    print("Testing refactored API...")
    
    # 1. Authenticate
    print("1. Authenticating...")
    try:
        auth_response = requests.post(f"{BASE_URL}/auth/local/login")
        if auth_response.status_code == 200:
            token = auth_response.json().get("token")
            print("✅ Authentication successful")
            headers = {"Authorization": f"Bearer {token}"}
        else:
            print(f"❌ Authentication failed: {auth_response.text}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Authentication error: {e}")
        sys.exit(1)

    # 2. Test time endpoint (Public)
    print("\n2. Testing time endpoint (Public)...")
    try:
        response = requests.get(f"{BASE_URL}/time")
        if response.status_code == 200:
            print("✅ Time endpoint working")
        else:
            print(f"❌ Time endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Time endpoint error: {e}")

    # 3. Test groups endpoint (Public)
    print("\n3. Testing groups endpoint (Public)...")
    try:
        response = requests.get(f"{BASE_URL}/groups")
        if response.status_code == 200:
            groups = response.json()
            print(f"✅ Groups endpoint working - found {len(groups)} groups")
        else:
            print(f"❌ Groups endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Groups endpoint error: {e}")

    # 4. Test moods endpoint (Protected)
    print("\n4. Testing moods endpoint (Protected)...")
    try:
        response = requests.get(f"{BASE_URL}/moods", headers=headers)
        if response.status_code == 200:
            moods = response.json()
            print(f"✅ Moods endpoint working - found {len(moods)} entries")
        else:
            print(f"❌ Moods endpoint failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Moods endpoint error: {e}")


if __name__ == "__main__":
    test_api()
