<div align="center">

# 🌙 Nightlio

[![GitHub license](https://img.shields.io/github/license/shirsakm/nightlio?style=flat-square)](https://github.com/shirsakm/nightlio/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/shirsakm/nightlio?style=flat-square)](https://github.com/shirsakm/nightlio/stargazers)
![GitHub Tag](https://img.shields.io/github/v/tag/shirsakm/nightlio)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/shirsakm/nightlio/publish.yml?branch=master&style=flat-square)](https://github.com/shirsakm/nightlio/actions)

**Privacy-first mood tracker and daily journal, designed for effortless self-hosting. Your data, your server, your rules.**

</div>

<img width="1366" height="645" alt="image" src="https://github.com/user-attachments/assets/dd50ec1f-4c3f-4588-907c-dca6ac1f7f98" />

### Why Nightlio?

Nightlio was inspired by awesome mood-tracking apps like Daylio, but born out of frustration with aggressive subscription models, paywalls, and a lack of cross-platform access. I wanted a beautiful, effective tool to log my mood and journal my thoughts without compromising on privacy or being locked into a single device.

Nightlio is the result: a feature-complete, open-source alternative that you can run anywhere. It's fully web-based and responsive for use on both desktop and mobile. No ads, no subscriptions, and absolutely no data mining. Just you and your data.

### ✨ Key Features

* **✍️ Rich Journaling with Markdown:** Write detailed notes for every entry using Markdown for formatting, lists, and links.
* **📊 Track Your Mood & Find Patterns:** Log your daily mood on a simple 5-point scale and use customizable tags (e.g., 'Sleep', 'Productivity') to discover what influences your state of mind.
* **📈 Insightful Analytics:** View your mood history on a calendar, see your average mood over time, and track your journaling streak to stay motivated.
* **🔒 Privacy First, Always:** Built from the ground up to be self-hosted. Your sensitive data is stored in a simple SQLite database file on *your* server. No third-party trackers or analytics.
* **🚀 Simple Self-Hosting with Docker:** Get up and running in minutes with a single `docker compose up` command.
* **🎮 Gamified Achievements:** Stay consistent with built-in achievements that unlock as you build your journaling habit.

<div align="center">🌙</div>

## 🐳 Docker Quickstart (Recommended)

> [!NOTE]
> By default, Nightlio runs in a **single-user mode**. The "local login" endpoint is designed for personal use and automatically logs you into the single, default user account. Multi-user support is planned for a future release.

Get your own Nightlio instance running in under 5 minutes.

```bash
# 1. Clone the repository
git clone https://github.com/shirsakm/nightlio.git
cd nightlio

# 2. Create your configuration file
cp .env.docker .env

# 3. Set your secrets
# IMPORTANT: Open the .env file and set unique, random values for
# at least SECRET_KEY and JWT_SECRET.
nano .env

# 4. Launch the application (uses published images by default)
docker compose up -d
```

Alternatively, give it a try without cloning!

```bash
docker network create nightlio-test || true
docker run -d --name nightlio-api \
    --network nightlio-test --network-alias api \
    -e SECRET_KEY=$(openssl rand -hex 32) \
    -e JWT_SECRET=$(openssl rand -hex 32) \
    -e CORS_ORIGINS=http://localhost:5173 \
    -e ENABLE_GOOGLE_OAUTH=0 \
    -e DEFAULT_SELF_HOST_ID=selfhost_default_user \
    -e DATABASE_PATH=/app/data/nightlio.db \
    -e PORT=5000 \
    -v nightlio_data:/app/data \
    ghcr.io/shirsakm/nightlio-api:latest

docker run -d --name nightlio-frontend \
    --network nightlio-test \
    -p 5173:80 \
    ghcr.io/shirsakm/nightlio-frontend:latest
```

Your instance is now live!
* Frontend: http://localhost:5173
* API: http://localhost:5000

## 🏠 Self-hosting

Here are two easy paths for self-hosting using the published GHCR images.

### Option A — Use the repo’s production compose (nginx + TLS)

1) Clone and configure

```bash
git clone https://github.com/shirsakm/nightlio.git
cd nightlio
cp .env.docker .env
# Edit .env: set strong SECRET_KEY and JWT_SECRET, and set CORS_ORIGINS to your domain
```

2) Pin images (recommended) and mount data for backups

```bash
export API_IMAGE=ghcr.io/shirsakm/nightlio-api:0.1.1
export WEB_IMAGE=ghcr.io/shirsakm/nightlio-frontend:0.1.1
mkdir -p data
# Add a bind mount for your DB by editing docker-compose.prod.yml (api service):
#   volumes:
#     - ./data:/app/data
```

3) Bring up the stack (nginx is the only public service)

```bash
docker compose -f docker-compose.prod.yml up -d
```

TLS: put your certs in `./ssl` (`fullchain.pem`, `privkey.pem`). The provided nginx config will serve `80/443`.

Upgrade later:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Option B — Minimal compose

Create docker-compose.yml in an empty folder with:

```yaml
services:
  api:
    image: ghcr.io/shirsakm/nightlio-api:0.1.1
    restart: unless-stopped
    environment:
      - SECRET_KEY=change-me
      - JWT_SECRET=change-me-too
      - CORS_ORIGINS=https://your.domain
      - ENABLE_GOOGLE_OAUTH=0
      - DEFAULT_SELF_HOST_ID=selfhost_default_user
      - DATABASE_PATH=/app/data/nightlio.db
      - PORT=5000
    volumes:
      - ./data:/app/data
    expose:
      - "5000"
    networks: { nightlio: { aliases: [api] } }
  web:
    image: ghcr.io/shirsakm/nightlio-frontend:0.1.1
    restart: unless-stopped
    depends_on: [api]
      ports:
        - "80:80"  # or put behind your own reverse proxy with TLS
    networks: [nightlio]

networks: { nightlio: {} }
```

Run it:

```bash
docker compose up -d
```

> [!NOTE]
> 1. Persistent data lives in ./data/nightlio.db — include it in backups.
> 2. Pin to a version (0.1.1) for predictable upgrades; switch to newer tags when ready.

<div align="center">🌙</div>

## 🔧 Configuration (`.env`)

You can customize your Nightlio instance using environment variables in the `.env` file.

#### Server (API)
```
# Core
FLASK_ENV=production
SECRET_KEY=change-this-to-a-long-random-string
JWT_SECRET=change-this-too
DATABASE_PATH=/app/data/nightlio.db

# Feature flags (1 to enable, 0 to disable)
ENABLE_GOOGLE_OAUTH=0

# Google OAuth (if enabled)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# CORS - Add your frontend's domain if deploying publicly
CORS_ORIGINS=http://localhost:5173,[https://your.domain.com](https://your.domain.com)
```

#### Frontend (Vite)
```
# This is only needed for local development outside of Docker
VITE_API_URL=http://localhost:5000

# Required for Google OAuth (if enabled)
VITE_GOOGLE_CLIENT_ID=
```

<div align="center">🌙</div>

## 🛠️ For Developers

Interested in contributing or running the project without Docker? Here's what you need to know.

<details>
<summary><strong>🧭 Architecture Overview</strong></summary>

* **Frontend:** React 19 + Vite, served by Nginx.
* **Backend:** Flask (Python) serving a JSON API.
* **Database:** SQLite, with auto-migrations on startup.
* **Authentication:** JWT-based. Supports a default local user and optional Google OAuth.
</details>

<details>
<summary><strong>🧪 Local Development Setup</strong></summary>

**Prerequisites:** Node.js v18+, Python v3.11+

```bash
# Install frontend dependencies
npm install

# Setup and activate backend virtual environment
cd api
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..

# Run both servers concurrently
npm run dev # Starts Vite frontend dev server
npm run api:dev   # Starts Flask backend API server
```
The frontend will be available at `http://localhost:5173`.
</details>

<details>
<summary><strong>📊 API Reference</strong></summary>

All protected endpoints require an `Authorization: Bearer <jwt>` header unless otherwise noted.

**Auth**
* `POST /api/auth/local/login` → 200 { token, user }
* `POST /api/auth/google { token }` → 200 { token, user }
* `POST /api/auth/verify` → 200 { user }

**Config & Misc**
* `GET /api/config` → { enable_google_oauth }
* `GET /api/` → health payload
* `GET /api/time` → { time }

**Moods**
* `POST /api/mood { date, mood(1-5), content, time?, selected_options?: number[] }` → 201 { entry_id, new_achievements[] }
* `GET /api/moods[?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD]` → list of entries
* `GET /api/mood/:id` → entry
* `PUT /api/mood/:id { mood?, content? }` → success
* `DELETE /api/mood/:id` → success
* `GET /api/mood/:id/selections` → options linked to the entry
* `GET /api/statistics` → { statistics, mood_distribution, current_streak }
* `GET /api/streak` → { current_streak, message }

**Groups & Options**
* `GET /api/groups` → [{ id, name, options: [{ id, name }] }]
* `POST /api/groups { name }` → { group_id }
* `POST /api/groups/:group_id/options { name }` → { option_id }
* `DELETE /api/groups/:group_id` → success
* `DELETE /api/options/:option_id` → success

**Achievements**
* `GET /api/achievements` → user achievements (with metadata)
* `POST /api/achievements/check` → { new_achievements, count }

</details>

<details>
<summary><strong>🗃️ Data Model</strong></summary>

**Tables (SQLite):**
* `users`: id, google_id, email, name, avatar_url, ...
* `mood_entries`: id, user_id(FK), date, mood, content, ...
* `groups`: id, name
* `group_options`: id, group_id(FK), name
* `entry_selections`: entry_id(FK), option_id(FK)
* `achievements`: id, user_id(FK), achievement_type, earned_at, ...
</details>

<div align="center">🌙</div>

### 🔐 Security & Privacy

* **Data Ownership:** Your data is stored in a local SQLite file. You can back it up, move it, or delete it at any time.
* **No Telemetry:** This application does not collect any usage data or send information to third-party services.
* **Secure Authentication:** API endpoints are protected using JSON Web Tokens (JWT).
* **Configurable CORS:** Restrict API access to trusted domains via environment variables.

### 🗺️ Roadmap

Nightlio is actively developed. Here are some of the features planned for the future:
- [ ] **Multi-User Support:** Full support for multiple user accounts on a single instance.
- [ ] **Data Import/Export:** Tools to import data from other services (like Daylio) and export your data to standard formats (JSON, CSV).
- [ ] **More Themes & Customization:** Additional themes and more options to personalize the look and feel of your journal.
- [ ] **Advanced Analytics:** Deeper insights into your data, including correlations between tags and mood.

### 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change. Please ensure you add tests for any new API functionality.

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<div align="center">🌙</div>

If this project helps you, please consider starring the repository. Stay well 💙
