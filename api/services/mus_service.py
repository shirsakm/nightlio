import requests
import os
import random

class MusicService:
    def __init__(self, db=None):
        self.db = db
        self.client_id = os.getenv("JAMENDO_CLIENT_ID")

    def get_track_by_tag(self, tag: str):
        if not self.client_id:
            return {"error": "Jamendo Client ID not configured"}
        
        random_offset = random.randint(0, 50)
        url = "https://api.jamendo.com/v3.0/tracks/"
        params = {
            "client_id": self.client_id,
            "limit": 1,
            "offset": random_offset,
            "fuzzytags": tag
        }
        
        try:
            response = requests.get(url, params=params)
            data = response.json()
            results = data.get('results')

            # If random search is empty, try again from the beginning
            if not results and random_offset > 0:
                params["offset"] = 0
                response = requests.get(url, params=params)
                data = response.json()
                results = data.get('results')

            if results:
                track = results[0]
                return {
                    "audio_url": track['audio'],
                    "track_name": track['name'],
                    "artist": track['artist_name']
                }
            return {"error": "No music found for this vibe"}
        except Exception as e:
            return {"error": str(e)}