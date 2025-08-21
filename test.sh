#!/bin/bash

# Nightlio Test Script
# This script tests if your Docker deployment is working correctly

echo "🧪 Testing Nightlio Docker deployment..."
echo

# Function to test endpoint
test_endpoint() {
    local url=$1
    local name=$2
    local expected_code=${3:-200}
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "$expected_code" ]; then
        echo "✅ OK ($response)"
        return 0
    else
        echo "❌ FAILED ($response)"
        return 1
    fi
}

# Determine which docker compose command to use
COMPOSE_CMD="docker-compose"
if ! command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker compose"
fi

# Wait for services to be ready
echo "⏳ Waiting for services to start (30 seconds)..."
sleep 30

# Test API health endpoint
test_endpoint "http://localhost:5000/api/" "API Health Check"
api_status=$?

# Test frontend
test_endpoint "http://localhost:5173" "Frontend"
frontend_status=$?

# Test API through frontend proxy
test_endpoint "http://localhost:5173/api/" "API via Frontend Proxy"
proxy_status=$?

echo
echo "📊 Test Results:"
echo "=================="

if [ $api_status -eq 0 ]; then
    echo "✅ API is running correctly"
else
    echo "❌ API failed - check logs: $COMPOSE_CMD logs api"
fi

if [ $frontend_status -eq 0 ]; then
    echo "✅ Frontend is running correctly"
else
    echo "❌ Frontend failed - check logs: $COMPOSE_CMD logs frontend"
fi

if [ $proxy_status -eq 0 ]; then
    echo "✅ API proxy is working correctly"
else
    echo "❌ API proxy failed - check nginx configuration"
fi

echo
echo "🔍 Additional Information:"
echo "=========================="

# Check if containers are running
echo -n "Containers running: "
running=$($COMPOSE_CMD ps --services --filter "status=running" 2>/dev/null | wc -l)
total=$($COMPOSE_CMD ps --services 2>/dev/null | wc -l)
echo "$running/$total"

# Show container status
echo
echo "Container Status:"
$COMPOSE_CMD ps

# Show resource usage
echo
echo "Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" $($COMPOSE_CMD ps -q) 2>/dev/null

echo
if [ $api_status -eq 0 ] && [ $frontend_status -eq 0 ] && [ $proxy_status -eq 0 ]; then
    echo "🎉 All tests passed! Nightlio is working correctly."
    echo "🌐 Access your app at: http://localhost:5173"
    echo
    echo "📝 Next steps:"
    echo "  1. Create your first mood entry"
    echo "  2. Explore the analytics dashboard"
    echo "  3. Set up regular backups (see DEPLOYMENT.md)"
    echo "  4. Configure HTTPS for production (see DEPLOYMENT.md)"
else
    echo "⚠️  Some tests failed. Please check the logs and configuration."
    echo
    echo "🔧 Troubleshooting:"
    echo "  1. Check logs: $COMPOSE_CMD logs -f"
    echo "  2. Verify ports aren't in use: netstat -tlnp | grep -E ':(5173|5000)'"
    echo "  3. Restart services: $COMPOSE_CMD restart"
    echo "  4. Check the Docker guide: DOCKER.md"
fi

echo
echo "📚 Useful commands:"
echo "  View logs: $COMPOSE_CMD logs -f"
echo "  Restart: $COMPOSE_CMD restart"
echo "  Stop: $COMPOSE_CMD down"
echo "  Update: git pull && $COMPOSE_CMD up -d --build"
