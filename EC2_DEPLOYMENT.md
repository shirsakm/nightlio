# EC2 Deployment Guide

## Prerequisites
- EC2 t2.micro instance running Ubuntu
- SSH access to your instance

## Step 1: Connect to EC2
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

## Step 2: Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python 3 and pip
sudo apt install python3 python3-pip python3-venv -y

# Install nginx
sudo apt install nginx -y

# Install certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

## Step 3: Clone and Setup Project
```bash
# Clone your repo
git clone https://github.com/your-username/nightlio.git
cd nightlio

# Setup backend
cd api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Setup frontend
npm install
npm run build
```

## Step 4: Create Environment Files
```bash
# Create .env file
nano .env
```

Add your environment variables:
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET_KEY=your-jwt-secret-key
SECRET_KEY=your-flask-secret-key
CORS_ORIGINS=https://your-domain.com
```

## Step 5: Setup Nginx
```bash
sudo nano /etc/nginx/sites-available/nightlio
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /home/ubuntu/nightlio/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/nightlio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 6: Setup SSL
```bash
sudo certbot --nginx -d your-domain.com
```

## Step 7: Create Systemd Service for Backend
```bash
sudo nano /etc/systemd/system/nightlio-api.service
```

Add:
```ini
[Unit]
Description=Nightlio API
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/nightlio/api
Environment=PATH=/home/ubuntu/nightlio/api/venv/bin
ExecStart=/home/ubuntu/nightlio/api/venv/bin/python app.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable nightlio-api
sudo systemctl start nightlio-api
```

## Step 8: Setup Auto-Deployment (Optional)
Create a webhook script for automatic deployments from GitHub.

## Pros of EC2 Deployment
- Full control
- Free for first year
- Can run both frontend + backend
- Learning experience

## Cons of EC2 Deployment
- More complex setup
- Need to manage security updates
- Manual SSL renewal
- No automatic deployments
- Free tier expires after 1 year