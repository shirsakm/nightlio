#!/bin/bash
# Quick server startup script with custom port
# Usage: ./start_server.sh [port] [environment]

PORT=${1:-5000}
ENVIRONMENT=${2:-development}

echo "🚀 Starting Nightlio API"
echo "📍 Port: $PORT"
echo "📍 Environment: $ENVIRONMENT"

cd "$(dirname "$0")"

# Set environment variables
export PORT="$PORT"
export RAILWAY_ENVIRONMENT="$ENVIRONMENT"

if [ "$ENVIRONMENT" = "production" ]; then
    echo "🔧 Using production mode (Gunicorn)"
    python start.py
else
    echo "🔧 Using development mode (Flask dev server)"
    python start.py
fi