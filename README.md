# Nightlio - Daily Mood Tracker

A minimal daily journal app inspired by Daylio, built with React and Flask.

## Features

- **Mood Tracking**: Select from 5 emoji-based mood levels (😢 to 😁)
- **Journal Entries**: Write detailed thoughts using a markdown editor
- **History View**: Browse past entries with dates and moods
- **Responsive Design**: Works great on mobile and desktop
- **Data Persistence**: Entries saved to SQLite database

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

If you plan to enable Google OAuth or Web3 features, also install the optional dependencies:
```bash
pip install -r api/requirements-optional.txt
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

### Self-hosting and Environment Config

1. Copy the example environment and adjust values:
```bash
cp .env.example .env
```

2. Defaults run in self-host mode with Google OAuth and Web3 disabled. Key variables:
- ENABLE_GOOGLE_OAUTH=0
- GOOGLE_CLIENT_ID=
- GOOGLE_CLIENT_SECRET=
- GOOGLE_CALLBACK_URL=
- ENABLE_WEB3=0
- WEB3_RPC_URL=
- WEB3_CONTRACT_ADDRESS=
- JWT_SECRET=  (set a strong value before deploying)
- DEFAULT_SELF_HOST_ID=selfhost_default_user

3. Frontend config (optional): copy `.env.local` if needed and set `VITE_API_URL` (defaults to http://localhost:5000). If enabling Google OAuth, set `VITE_GOOGLE_CLIENT_ID`.

4. Enabling optional features:
- Google OAuth: set ENABLE_GOOGLE_OAUTH=1 and provide GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL. Ensure the frontend has VITE_GOOGLE_CLIENT_ID. Install optional deps if not already: `pip install -r api/requirements-optional.txt`.
- Web3: set ENABLE_WEB3=1 and provide WEB3_RPC_URL and WEB3_CONTRACT_ADDRESS. Install optional deps if not already: `pip install -r api/requirements-optional.txt`.

The app will run with or without optional dependencies based on these flags. When disabled, related code paths are not imported.

## Usage

1. **Create Entry**: Select your mood and write your thoughts
2. **View History**: Click "View History" to see past entries
3. **Data Storage**: All entries are saved in SQLite database (`data/nightlio.db`)

## Tech Stack

- **Frontend**: React, Vite, MDXEditor, React Markdown
- **Backend**: Flask, Flask-CORS, SQLite
- **Storage**: SQLite database with proper schema
- **Styling**: CSS with responsive design

## API Endpoints

- `GET /api/time` - Get current server time
- `POST /api/mood` - Create new mood entry
- `GET /api/moods` - Get all mood entries (supports date range filtering)
- `GET /api/mood/<id>` - Get specific mood entry
- `PUT /api/mood/<id>` - Update mood entry
- `DELETE /api/mood/<id>` - Delete mood entry
- `GET /api/statistics` - Get mood statistics and distribution
