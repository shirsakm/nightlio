# 🐳 Docker Quick Start Guide for Nightlio

This guide will help you get Nightlio running with Docker in just a f### Changing Ports
Edit `docker-compose.yml` to change ports:
```yaml
services:
  frontend:
    ports:
      - "8080:80"   # Frontend: localhost:8080 instead of 5173
  api:
    ports:
      - "5001:5000" # API: localhost:5001 instead of 5000
```

## Prerequisites

- Docker and Docker Compose installed on your system
- Basic familiarity with command line

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/shirsakm/nightlio.git
   cd nightlio
   ```

2. **Create environment file**
   ```bash
   cp .env.docker .env
   ```

3. **Edit the environment file** (Important for security!)
   ```bash
   nano .env  # or use your preferred editor
   ```
   
   **⚠️ IMPORTANT**: Change at least these values:
   - `SECRET_KEY`: Use a long, random string
   - `JWT_SECRET`: Use a different long, random string

4. **Start the application**
   ```bash
   docker-compose up -d
   ```

5. **Access your application**
   - Open your browser and go to `http://localhost:5173`
   - The API will be available at `http://localhost:5000`

## Port Information

- **Frontend**: `http://localhost:5173` - Same port for both Docker and development (consistency!)
- **API**: `http://localhost:5000` - Flask backend (same in both Docker and development)

## Environment Configuration

### Required Settings
- `SECRET_KEY`: Flask secret key (change this!)
- `JWT_SECRET`: JWT signing secret (change this!)

### Optional Features
- `ENABLE_GOOGLE_OAUTH`: Set to `1` to enable Google login
Web3-related variables have been removed.
- `DEFAULT_SELF_HOST_ID`: User ID for self-hosted instances

### Google OAuth Setup (Optional)
If you want to enable Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Set authorized redirect URI to: `http://localhost:3000/auth/callback`
6. Update your `.env` file:
   ```bash
   ENABLE_GOOGLE_OAUTH=1
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/callback
   ```

## Docker Commands

### Basic Operations
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f api
docker-compose logs -f frontend

# Restart services
docker-compose restart

# Update to latest version
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Data Management
```bash
# Backup your data
docker run --rm -v nightlio_nightlio_data:/data -v $(pwd):/backup alpine tar czf /backup/nightlio-backup.tar.gz -C /data .

# Restore data
docker run --rm -v nightlio_nightlio_data:/data -v $(pwd):/backup alpine tar xzf /backup/nightlio-backup.tar.gz -C /data

# View data volume
docker volume inspect nightlio_nightlio_data
```

## Customization

### Changing Ports
Edit `docker-compose.yml` to change ports:
```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Change 3000 to 8080
  api:
    ports:
      - "5001:5000"  # Change 5000 to 5001
```

### Using External Database
You can mount an external SQLite database:
```yaml
services:
  api:
    volumes:
      - ./path/to/your/nightlio.db:/app/data/nightlio.db
```

### Behind a Reverse Proxy
If running behind nginx, Traefik, or similar:
1. Remove port mappings from `docker-compose.yml`
2. Use the service names (`api`, `frontend`) for internal routing
3. Update `GOOGLE_CALLBACK_URL` if using OAuth

## Troubleshooting

### Services won't start
```bash
# Check logs
docker-compose logs

# Check if ports are already in use
netstat -tlnp | grep -E ':(3000|5000)'

# Clean restart
docker-compose down
docker-compose up --build
```

### Database issues
```bash
# Reset database (WARNING: deletes all data)
docker-compose down
docker volume rm nightlio_nightlio_data
docker-compose up -d
```

### Permission issues
```bash
# Fix volume permissions
docker-compose exec api chown -R 1000:1000 /app/data
```

## Production Deployment

For production use:

1. **Use a reverse proxy** (nginx, Traefik, Caddy)
2. **Enable HTTPS** with Let's Encrypt
3. **Set strong secrets** in your `.env` file
4. **Backup regularly** using the backup commands above
5. **Monitor logs** with `docker-compose logs -f`
6. **Update regularly** for security patches

### Example nginx config
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Support

If you encounter issues:
1. Check the logs: `docker-compose logs`
2. Ensure your `.env` file is configured correctly
3. Make sure ports 3000 and 5000 aren't in use
4. Create an issue on GitHub with your logs

Happy journaling! 🌙
