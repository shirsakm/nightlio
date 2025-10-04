#!/bin/bash
# Production startup script using Gunicorn
# Usage: ./run_production.sh [port]

PORT=${1:-5000}
WORKERS=${WORKERS:-4}
TIMEOUT=${TIMEOUT:-120}

echo "🚀 Starting Nightlio API with Gunicorn"
echo "📍 Port: $PORT"
echo "🔧 Workers: $WORKERS"
echo "⏱️  Timeout: $TIMEOUT"

cd "$(dirname "$0")"

gunicorn \
    --bind "[::]:$PORT" \
    --workers "$WORKERS" \
    --timeout "$TIMEOUT" \
    --worker-class sync \
    --access-logfile - \
    --error-logfile - \
    --preload \
    wsgi:application