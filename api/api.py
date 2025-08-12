import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from database import MoodDatabase

app = Flask(__name__)
CORS(app)

# Initialize database
db = MoodDatabase()

@app.route('/api/time')
def get_current_time():
    return {
        'time': time.time()
    }

@app.route('/api/mood', methods=['POST'])
def create_mood_entry():
    try:
        data = request.json
        mood = data.get('mood')
        date = data.get('date')
        content = data.get('content')
        time = data.get('time')  # Optional time field
        selected_options = data.get('selected_options', [])  # Optional selected options

        # Validate input
        if not all([mood, date, content]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        if not isinstance(mood, int) or mood < 1 or mood > 5:
            return jsonify({'error': 'Mood must be an integer between 1 and 5'}), 400

        # Add to database
        entry_id = db.add_mood_entry(date, mood, content, time, selected_options)
        
        return jsonify({
            'status': 'success',
            'entry_id': entry_id,
            'message': 'Mood entry created successfully'
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/moods', methods=['GET'])
def get_mood_entries():
    try:
        # Get optional query parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if start_date and end_date:
            entries = db.get_mood_entries_by_date_range(start_date, end_date)
        else:
            entries = db.get_all_mood_entries()
        
        return jsonify(entries)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mood/<int:entry_id>', methods=['GET'])
def get_mood_entry(entry_id):
    try:
        entry = db.get_mood_entry_by_id(entry_id)
        if entry:
            return jsonify(entry)
        else:
            return jsonify({'error': 'Entry not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mood/<int:entry_id>', methods=['PUT'])
def update_mood_entry(entry_id):
    try:
        data = request.json
        mood = data.get('mood')
        content = data.get('content')

        # Validate mood if provided
        if mood is not None and (not isinstance(mood, int) or mood < 1 or mood > 5):
            return jsonify({'error': 'Mood must be an integer between 1 and 5'}), 400

        success = db.update_mood_entry(entry_id, mood, content)
        
        if success:
            return jsonify({
                'status': 'success',
                'message': 'Mood entry updated successfully'
            })
        else:
            return jsonify({'error': 'Entry not found or no changes made'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mood/<int:entry_id>', methods=['DELETE'])
def delete_mood_entry(entry_id):
    try:
        success = db.delete_mood_entry(entry_id)
        
        if success:
            return jsonify({
                'status': 'success',
                'message': 'Mood entry deleted successfully'
            })
        else:
            return jsonify({'error': 'Entry not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/statistics', methods=['GET'])
def get_mood_statistics():
    try:
        stats = db.get_mood_statistics()
        mood_counts = db.get_mood_counts()
        current_streak = db.get_current_streak()
        
        return jsonify({
            'statistics': stats,
            'mood_distribution': mood_counts,
            'current_streak': current_streak
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/streak', methods=['GET'])
def get_current_streak():
    try:
        streak = db.get_current_streak()
        return jsonify({
            'current_streak': streak,
            'message': f'Current streak: {streak} day{"s" if streak != 1 else ""}'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/groups', methods=['GET'])
def get_groups():
    try:
        groups = db.get_all_groups()
        return jsonify(groups)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/groups', methods=['POST'])
def create_group():
    try:
        data = request.json
        name = data.get('name')
        
        if not name:
            return jsonify({'error': 'Group name is required'}), 400
        
        group_id = db.create_group(name)
        
        return jsonify({
            'status': 'success',
            'group_id': group_id,
            'message': 'Group created successfully'
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/groups/<int:group_id>/options', methods=['POST'])
def create_group_option(group_id):
    try:
        data = request.json
        name = data.get('name')
        
        if not name:
            return jsonify({'error': 'Option name is required'}), 400
        
        option_id = db.create_group_option(group_id, name)
        
        return jsonify({
            'status': 'success',
            'option_id': option_id,
            'message': 'Option created successfully'
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/groups/<int:group_id>', methods=['DELETE'])
def delete_group(group_id):
    try:
        success = db.delete_group(group_id)
        
        if success:
            return jsonify({
                'status': 'success',
                'message': 'Group deleted successfully'
            })
        else:
            return jsonify({'error': 'Group not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/options/<int:option_id>', methods=['DELETE'])
def delete_option():
    try:
        success = db.delete_group_option(option_id)
        
        if success:
            return jsonify({
                'status': 'success',
                'message': 'Option deleted successfully'
            })
        else:
            return jsonify({'error': 'Option not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mood/<int:entry_id>/selections', methods=['GET'])
def get_entry_selections(entry_id):
    try:
        selections = db.get_entry_selections(entry_id)
        return jsonify(selections)

    except Exception as e:
        return jsonify({'error': str(e)}), 500