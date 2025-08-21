# 🚀 Production Deployment Guide

This guide covers deploying Nightlio in production environments with proper security, performance, and reliability.

## Quick Production Setup

### Option 1: Simple Production (Recommended for most users)

```bash
# Clone and configure
git clone https://github.com/shirsakm/nightlio.git
cd nightlio
cp .env.docker .env

# Generate secure secrets
export SECRET_KEY=$(openssl rand -hex 32)
export JWT_SECRET=$(openssl rand -hex 32)

# Update .env file with your secrets and domain
sed -i "s/your-secret-key-change-this.*/$SECRET_KEY/" .env
sed -i "s/your-jwt-secret-change-this.*/$JWT_SECRET/" .env

# Deploy
docker-compose up -d
```

### Option 2: Full Production with Reverse Proxy

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d
```

## Environment Configuration

### Required Production Variables

Create a `.env` file with:

```bash
# Security (REQUIRED - Generate random values!)
SECRET_KEY=your-64-character-random-secret-here
JWT_SECRET=your-different-64-character-secret-here

# Domain configuration
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Optional features
ENABLE_GOOGLE_OAUTH=0
ENABLE_WEB3=0
DEFAULT_SELF_HOST_ID=selfhost_default_user

# Google OAuth (if enabled)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/callback
```

### Generating Secure Secrets

```bash
# Generate SECRET_KEY
openssl rand -hex 32

# Generate JWT_SECRET (use different value)
openssl rand -hex 32
```

## Server Requirements

### Minimum Requirements
- **RAM**: 512 MB
- **CPU**: 1 vCPU
- **Storage**: 1 GB (grows with data)
- **OS**: Any Linux distribution with Docker support

### Recommended Requirements
- **RAM**: 1 GB
- **CPU**: 2 vCPU
- **Storage**: 5 GB SSD
- **OS**: Ubuntu 22.04 LTS

## SSL/HTTPS Setup

### Option 1: Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal (add to crontab)
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### Option 2: Manual SSL Certificate

```bash
# Create ssl directory
mkdir ssl

# Place your certificates
cp fullchain.pem ssl/
cp privkey.pem ssl/

# Update nginx-prod.conf to enable HTTPS section
# Then use production docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

## Reverse Proxy Setup

### Nginx (External)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Traefik

```yaml
version: '3.8'
services:
  nightlio-api:
    # ... your api config
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.nightlio-api.rule=Host(`yourdomain.com`) && PathPrefix(`/api`)"
      - "traefik.http.routers.nightlio-api.tls.certresolver=letsencrypt"

  nightlio-frontend:
    # ... your frontend config
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.nightlio.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.nightlio.tls.certresolver=letsencrypt"
```

### Caddy

```
yourdomain.com {
    reverse_proxy localhost:3000
}
```

## Monitoring & Maintenance

### Health Checks

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Check resource usage
docker stats
```

### Backup Strategy

```bash
#!/bin/bash
# backup.sh - Run daily via cron

BACKUP_DIR="/backups/nightlio"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker run --rm \
  -v nightlio_nightlio_data:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/nightlio-$DATE.tar.gz -C /data .

# Keep only last 7 days
find $BACKUP_DIR -name "nightlio-*.tar.gz" -mtime +7 -delete

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_DIR/nightlio-$DATE.tar.gz s3://your-bucket/
```

### Log Rotation

Add to `/etc/logrotate.d/docker-nightlio`:

```
/var/lib/docker/containers/*/*-json.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
    postrotate
        docker kill -s USR1 $(docker ps -q) 2>/dev/null || true
    endscript
}
```

## Security Hardening

### Docker Security

```bash
# Run with non-root user
echo "USER 1000:1000" >> api/Dockerfile

# Use security options
# Add to docker-compose.yml:
security_opt:
  - no-new-privileges:true
read_only: true
tmpfs:
  - /tmp
```

### Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# iptables
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -j DROP
```

### Regular Updates

```bash
#!/bin/bash
# update.sh - Run weekly

# Update system
sudo apt update && sudo apt upgrade -y

# Update Docker images
cd /path/to/nightlio
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Cleanup old images
docker image prune -f
```

## Performance Optimization

### Database Optimization

```bash
# Enable WAL mode for better concurrency
docker-compose exec api python -c "
import sqlite3
conn = sqlite3.connect('/app/data/nightlio.db')
conn.execute('PRAGMA journal_mode=WAL;')
conn.close()
"
```

### Nginx Caching

Add to nginx configuration:

```nginx
# Cache static files
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Enable gzip
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

## Troubleshooting

### Common Issues

1. **Services won't start**
   ```bash
   docker-compose logs
   # Check port conflicts
   netstat -tlnp | grep -E ':(80|443|3000|5000)'
   ```

2. **Database corruption**
   ```bash
   # Restore from backup
   docker-compose down
   docker run --rm -v nightlio_nightlio_data:/data -v $(pwd):/backup alpine tar xzf /backup/nightlio-backup.tar.gz -C /data
   docker-compose up -d
   ```

3. **High memory usage**
   ```bash
   # Add memory limits to docker-compose.yml
   deploy:
     resources:
       limits:
         memory: 512M
   ```

### Getting Help

1. Check logs: `docker-compose logs -f`
2. Verify configuration: `docker-compose config`
3. Test connectivity: `curl -f http://localhost:3000`
4. Create GitHub issue with logs and configuration

## Scaling

### Horizontal Scaling

```yaml
# docker-compose.yml
services:
  api:
    deploy:
      replicas: 3
    # Add load balancer
  
  nginx:
    # Configure upstream servers
```

### Database Scaling

For high-traffic deployments, consider:
- PostgreSQL instead of SQLite
- Read replicas
- Connection pooling
- Database clustering

## Cloud Deployment

### AWS ECS

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
docker build -t nightlio .
docker tag nightlio:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/nightlio:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/nightlio:latest
```

### Google Cloud Run

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT-ID/nightlio
gcloud run deploy --image gcr.io/PROJECT-ID/nightlio --platform managed
```

### DigitalOcean App Platform

```yaml
# .do/app.yaml
name: nightlio
services:
- name: api
  source_dir: /api
  dockerfile_path: Dockerfile
  http_port: 5000
- name: web
  source_dir: /
  dockerfile_path: Dockerfile
  http_port: 80
```

---

**Need help?** Open an issue on GitHub or check the main [Docker guide](DOCKER.md) for basic setup.
