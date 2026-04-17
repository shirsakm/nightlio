import requests
import json
import re
from datetime import datetime
import time

# your token here
listenbrainz_token = 'a96d3f6c-b8fa-4ee4-9161-5576d95d5e25'
# the earliest timestamp you want to submit from. 
min_timestamp = 963792000

def batch(iterable, n=1):
    l = len(iterable)
    for ndx in range(0, l, n):
        yield iterable[ndx:min(ndx + n, l)]

with open('watch-history.json', 'r', encoding='utf-8') as file:
    json_data = json.load(file)

def submit_to_listenbrainz(data, token):
    headers = {
        'Authorization': f'Token {token}',
        'Content-Type': 'application/json'
    }
    listenbrainz_url = 'https://api.listenbrainz.org/1/submit-listens'

    listens = []
    for entry in data:
        timestamp = entry['time'].replace('Z', '+00:00')
        listened_at = int(datetime.fromisoformat(timestamp).timestamp())
        if (listened_at < min_timestamp):
            continue
        if (entry["header"] == "YouTube"):
            continue
        if 'subtitles' not in entry:
            continue
        if entry['subtitles'][0]['name'] == ' - Topic':
            continue

        track_metadata = {
            'artist_name': re.sub(r'\s-\sTopic$', '', entry['subtitles'][0]['name']),
            'track_name': re.sub(r'^Watched\s', '', entry['title']),
            'additional_info': {
                'music_service': 'music.youtube.com',
                'origin_url': entry['titleUrl'],
                'submission_client': 'https://gist.github.com/fuddl/e17aa687df6ac1c7cbee5650ccfbc889',
            }
        }
        listens.append({
            'listened_at': listened_at,
            'track_metadata': track_metadata
        })


    responses = []
    for listen_batch in batch(listens, 1000):
        payload = {
            'listen_type': 'import',
            'payload': listen_batch
        }
        response = requests.post(listenbrainz_url, headers=headers, data=json.dumps(payload))
        time.sleep(int(response.headers['X-RateLimit-Reset-In']))
        print(response)
        responses.append(response)
    return responses

response = submit_to_listenbrainz(json_data, listenbrainz_token)
print(response)
