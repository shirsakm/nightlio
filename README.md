# 🌙 Nightlio

Privacy‑first mood tracker and daily journal, designed for effortless self‑hosting. Your data, your server, your rules.

This README provides a comprehensive, feature‑complete overview of Nightlio: what it can do, how it works, and how to run it.

—

## ✨ Feature Catalog (exhaustive)

### 1) Journaling & Mood Tracking
- 5‑Level mood scale (1–5)
- Rich text note per entry (content)
- Optional time stamp per entry
- Tag entries with selectable options (from custom groups)
- Full CRUD for entries
   - Create: POST /api/mood (mood, date, content, optional time, optional selected_options[])
   - Read: GET /api/moods (all or by date range), GET /api/mood/:id
   - Update: PUT /api/mood/:id (mood and/or content)
   - Delete: DELETE /api/mood/:id
- Per‑user scoping enforced by JWT auth

### 2) Categories (Groups) & Options
- Built‑in defaults on first run:
   - Emotions: happy, excited, grateful, relaxed, content, tired, unsure, bored, anxious, angry, stressed, sad, desperate
   - Sleep: well‑rested, refreshed, tired, exhausted, restless, insomniac
   - Productivity: focused, motivated, accomplished, busy, distracted, procrastinating, overwhelmed, lazy
- Manage categories and options via API:
   - List groups with options: GET /api/groups
   - Create group: POST /api/groups
   - Create option: POST /api/groups/:group_id/options
   - Delete group: DELETE /api/groups/:group_id
   - Delete option: DELETE /api/options/:option_id
- Link options to entries (selected_options on create)
- Retrieve options selected for an entry: GET /api/mood/:id/selections

### 3) Analytics & Insights
- Mood statistics per user: GET /api/statistics
   - total_entries, average_mood, lowest_mood, highest_mood, first_entry_date, last_entry_date
- Mood distribution counts: returned under mood_distribution
- Streak tracking: GET /api/streak and exposed in statistics
   - Robust date parsing for multiple formats (MM/DD/YYYY, YYYY‑MM‑DD)

### 4) Achievements (Gamification)
- Auto‑awarded achievements (defined in code):
   - first_entry: First mood entry
   - week_warrior: 7‑day streak
   - consistency_king: 30‑day streak
   - data_lover: View statistics 10 times
   - mood_master: 100 total entries
- Endpoints:
   - Get user achievements: GET /api/achievements
   - Force check & award: POST /api/achievements/check (returns new achievements)
   - Record NFT mint details: POST /api/achievements/:id/mint (token_id, tx_hash)

### 5) Authentication
- Self‑host “local login” (no password; single default user)
   - POST /api/auth/local/login returns JWT + default user
   - Rate‑limited (30 req/min) to mitigate abuse
- Google OAuth (optional)
   - POST /api/auth/google with Google ID token
   - On success: upsert user and return JWT
- Verify token: POST /api/auth/verify (returns user)
- JWT‑based Authorization for protected endpoints

### 6) Web3 (Optional)
- Health check: GET /api/web3/health (quick, non‑blocking)
- Achievement NFTs: record minted token/tx via achievements mint endpoint (Web3 ops happen off‑chain or client‑side; backend stores result)
- Feature can be toggled off with config (no hard dependency when disabled)

### 7) Configuration & Health
- Public config: GET /api/config (used by frontend to enable/disable features)
- Health root: GET /api/ (status, message, timestamp)
- Server time: GET /api/time

### 8) Self‑Hosting & Privacy
- SQLite database on disk (no external DB by default)
- No analytics/trackers
- Docker images for frontend (Nginx) and backend (Flask)
- Nginx proxies /api/* to backend container

—

## 🧭 Architecture Overview

- Frontend: React 19 + Vite, served by Nginx in Docker
- Backend: Flask (Python) serving JSON API
- Database: SQLite with schema auto‑migration at startup
- Auth: JWT; Google OAuth optional; Local self‑host login
- Optional: Web3 health check and achievement NFT metadata storage

—

## 🐳 Docker Quickstart (recommended)

```bash
git clone https://github.com/shirsakm/nightlio.git
cd nightlio
cp .env.docker .env
# IMPORTANT: set at least SECRET_KEY and JWT_SECRET in .env
docker compose up -d
```

Access:
- Frontend: http://localhost:5173
- API: http://localhost:5000

Notes:
- Default config enables “self‑host mode”: local login endpoint provides a single default user and a JWT.
- Google OAuth and Web3 are disabled by default.

—

## 🔧 Configuration (env)

Server (API):

```
# Core
FLASK_ENV=production
SECRET_KEY=change-me
JWT_SECRET=change-me
DATABASE_PATH=/app/data/nightlio.db

# Feature flags
ENABLE_GOOGLE_OAUTH=0
ENABLE_WEB3=0

# Google OAuth (if enabled)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

# Self-host default
DEFAULT_SELF_HOST_ID=selfhost_default_user

# CORS
CORS_ORIGINS=http://localhost:5173,https://yourdomain.com
```

Frontend (Vite):

```
# Only for dev; in Docker we use relative /api
VITE_API_URL=http://localhost:5000

# For Google OAuth (if enabled)
VITE_GOOGLE_CLIENT_ID=
```

Optional deps (if enabling Google OAuth/Web3):

```bash
pip install -r api/requirements-optional.txt
```

—

## 📊 API Reference (detailed)

Auth
- POST /api/auth/local/login → 200 { token, user }
- POST /api/auth/google { token } → 200 { token, user }
- POST /api/auth/verify (Authorization: Bearer <jwt>) → 200 { user }

Config & Misc
- GET /api/config → { enable_google_oauth, enable_web3 }
- GET /api/ → health payload
- GET /api/time → { time }

Moods
- POST /api/mood { date, mood(1‑5), content, time?, selected_options?: number[] } → 201 { entry_id, new_achievements[] }
- GET /api/moods[?start_date=YYYY‑MM‑DD&end_date=YYYY‑MM‑DD] → list of entries
- GET /api/mood/:id → entry
- PUT /api/mood/:id { mood?, content? } → success
- DELETE /api/mood/:id → success
- GET /api/mood/:id/selections → options linked to the entry
- GET /api/statistics → { statistics, mood_distribution, current_streak }
- GET /api/streak → { current_streak, message }

Groups & Options
- GET /api/groups → [{ id, name, options: [{ id, name }] }]
- POST /api/groups { name } → { group_id }
- POST /api/groups/:group_id/options { name } → { option_id }
- DELETE /api/groups/:group_id → success
- DELETE /api/options/:option_id → success

Achievements
- GET /api/achievements → user achievements (with metadata)
- POST /api/achievements/check → { new_achievements, count }
- POST /api/achievements/:id/mint { token_id, tx_hash } → success

Web3 (optional)
- GET /api/web3/health → { connected: boolean }

All protected endpoints require Authorization: Bearer <jwt> unless otherwise noted.

—

## 🗃️ Data Model

Tables (SQLite):
- users: id, google_id (unique), email, name, avatar_url, created_at, last_login
- mood_entries: id, user_id(FK), date, mood(1‑5), content, created_at, updated_at
- groups: id, name(unique), created_at
- group_options: id, group_id(FK), name, created_at
- entry_selections: id, entry_id(FK), option_id(FK), created_at
- achievements: id, user_id(FK), achievement_type, earned_at, nft_minted, nft_token_id, nft_tx_hash

Indexes:
- idx_mood_entries_date on mood_entries(date)

—

## 🧪 Development (no Docker)

Prereqs: Node.js 18+, Python 3.11+ (project tested on modern versions)

```bash
# Frontend
npm install

# Backend
cd api
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..

# Run
npm run api:dev   # starts Flask API
npm run dev       # starts Vite dev server
```

Open http://localhost:5173

Tests (Python):

```bash
cd api
pytest -q
```

—

## 🔐 Security & Privacy
- JWT tokens for authenticated API calls
- Rate limiting on local login endpoint
- CORS configurable via env
- No telemetry or third‑party trackers
- SQLite data stored locally; back up the data/ directory

—

## 🛠️ Stack
- Frontend: React 19, Vite, Lucide icons, Recharts (charts)
- Backend: Flask, Authlib/Jose (JWT), SQLite
- Infra: Docker, Nginx, Docker Compose

—

## 🤝 Contributing
PRs welcome. Please add tests for API changes and keep the README/API sections in sync.

—

## 📄 License
MIT — see [LICENSE](LICENSE).

—

If this project helps you, consider starring it. Stay well 💙
