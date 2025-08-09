import time
import csv
from flask import Flask, request

app = Flask(__name__)

@app.route('/api/time')
def get_current_time():
    return {
        'time': time.time()
    }

@app.route('/api/mood', methods=['POST'])
def update_mood():
    data = request.json
    mood = data.get('mood')
    date = data.get('date')

    with open('../data/moods.csv', 'a') as f:
        csv_writer = csv.writer(f)
        csv_writer.writerow([date, mood])

    return {
        'status': 'success'
    }