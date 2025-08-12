import time
import csv
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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
    content = data.get('content')

    # Ensure data directory exists
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    csv_path = os.path.join(data_dir, 'moods.csv')
    
    # Create header if file doesn't exist
    if not os.path.exists(csv_path):
        with open(csv_path, 'w', newline='') as f:
            csv_writer = csv.writer(f)
            csv_writer.writerow(['date', 'mood', 'content'])
    
    with open(csv_path, 'a', newline='') as f:
        csv_writer = csv.writer(f)
        csv_writer.writerow([date, mood, content])

    return jsonify({'status': 'success'})

@app.route('/api/moods', methods=['GET'])
def get_moods():
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    csv_path = os.path.join(data_dir, 'moods.csv')
    
    if not os.path.exists(csv_path):
        return jsonify([])
    
    moods = []
    with open(csv_path, 'r') as f:
        csv_reader = csv.DictReader(f)
        for row in csv_reader:
            moods.append({
                'date': row['date'],
                'mood': int(row['mood']),
                'content': row['content']
            })
    
    return jsonify(moods)