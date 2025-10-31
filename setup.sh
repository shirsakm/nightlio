#!/bin/bash

# Nightlio Setup Script
# This script helps you quickly set up Nightlio with Docker

set -e

echo "Setting up Nightlio with Docker..."
echo

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! command -v docker &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

echo "Docker and Docker Compose are installed"
echo

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating environment configuration..."
    cp .env.docker .env
    
    # Generate random secrets
    SECRET_KEY=$(openssl rand -hex 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1)
    JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1)
    
    # Replace the default secrets
    sed -i.bak "s/your-secret-key-change-this-to-something-random-and-secure/$SECRET_KEY/" .env
    sed -i.bak "s/your-jwt-secret-change-this-to-something-different-and-secure/$JWT_SECRET/" .env
    rm .env.bak 2>/dev/null || true
    
    echo "Environment file created with secure random secrets"
else
    echo "Environment file already exists"
fi

echo

# Check if ports are available
echo "Checking if ports are available..."
if lsof -i :5173 >/dev/null 2>&1; then
    echo "WARNING: Port 5173 is already in use. Please stop the service using it or edit docker-compose.yml"
    exit 1
fi

if lsof -i :5000 >/dev/null 2>&1; then
    echo "WARNING: Port 5000 is already in use. Please stop the service using it or edit docker-compose.yml"
    exit 1
fi

echo "Ports 5173 and 5000 are available"
echo

# Start the services
echo "Starting Nightlio services..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d
else
    docker compose up -d
fi

echo
echo "Waiting for services to start..."
sleep 10

# Check if services are running
COMPOSE_CMD="docker-compose"
if ! command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker compose"
fi

if $COMPOSE_CMD ps | grep -q "Up"; then
    echo "Nightlio is now running!"
    echo
    echo "Frontend: http://localhost:5173"
    echo "API: http://localhost:5000"
    echo
    echo "Useful commands:"
    echo "   View logs: $COMPOSE_CMD logs -f"
    echo "   Stop: $COMPOSE_CMD down"
    echo "   Restart: $COMPOSE_CMD restart"
    echo "   Test: ./test.sh"
    echo
    echo "For more help, see DOCKER.md"
    echo
    echo "Happy journaling!"
else
    echo "Something went wrong. Check the logs:"
    echo "   $COMPOSE_CMD logs"
    exit 1
fi
