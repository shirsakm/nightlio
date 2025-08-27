# 🚀 Quick Start - Get Nightlio Running in 2 Minutes

## Option 1: Automated Setup (Recommended)

```bash
git clone https://github.com/shirsakm/nightlio.git
cd nightlio
./setup.sh
```

That's it! Open http://localhost:5173 in your browser.

## Option 2: Manual Setup

```bash
# 1. Clone the repo
git clone https://github.com/shirsakm/nightlio.git
cd nightlio

# 2. Create environment file
cp .env.docker .env

# 3. Edit .env file and change SECRET_KEY and JWT_SECRET to random values
nano .env

# 4. Start with Docker
docker-compose up -d

# 5. Test it works
./test.sh
```

## What You Get

- 🌐 **Web Interface**: http://localhost:5173 (consistent with Vite dev server)
- 🔌 **API**: http://localhost:5000
- 📦 **Persistent Data**: Stored in Docker volume
- 🔒 **Secure**: Random secrets generated

## Port Information

- **Frontend**: `localhost:5173` (same port for both Docker and development!)
- **API**: `localhost:5000` (Flask backend)

## Next Steps

1. **Create your first mood entry** at http://localhost:5173
2. **Set up backups** (see [DEPLOYMENT.md](DEPLOYMENT.md))
3. **Enable HTTPS** for production (see [DEPLOYMENT.md](DEPLOYMENT.md))
4. **Configure Google OAuth** (optional, see [DOCKER.md](DOCKER.md))

## Troubleshooting

### Ports already in use?
```bash
# Change ports in docker-compose.yml
ports:
  - "8080:80"   # Frontend: localhost:8080
  - "5001:5000" # API: localhost:5001
```

### Services won't start?
```bash
# Check what's wrong
docker-compose logs -f

# Full restart
docker-compose down
docker-compose up -d --build
```

### Need help?
- 📖 [Full Docker Guide](DOCKER.md)
- 🚀 [Production Guide](DEPLOYMENT.md)
- 🐛 [Create an Issue](https://github.com/shirsakm/nightlio/issues)

---

**Tip**: Bookmark http://localhost:3000 and start building your mood tracking habit! 🌙
