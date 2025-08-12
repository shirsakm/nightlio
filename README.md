# Nightlio - Daily Mood Tracker

A minimal daily journal app inspired by Daylio, built with React and Flask.

## Features

- **Mood Tracking**: Select from 5 emoji-based mood levels (😢 to 😁)
- **Journal Entries**: Write detailed thoughts using a markdown editor
- **History View**: Browse past entries with dates and moods
- **Responsive Design**: Works great on mobile and desktop
- **Data Persistence**: Entries saved to CSV file

## Getting Started

### Prerequisites
- Node.js (for the frontend)
- Python 3.7+ (for the API)

### Installation

1. Install frontend dependencies:
```bash
npm install
```

2. Set up the Python API:
```bash
cd api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Running the App

1. Start the Flask API (in one terminal):
```bash
npm run api:dev
```

2. Start the React frontend (in another terminal):
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

1. **Create Entry**: Select your mood and write your thoughts
2. **View History**: Click "View History" to see past entries
3. **Data Storage**: All entries are saved in `data/moods.csv`

## Tech Stack

- **Frontend**: React, Vite, Toast UI Editor
- **Backend**: Flask, Flask-CORS
- **Storage**: CSV files
- **Styling**: CSS with responsive design
