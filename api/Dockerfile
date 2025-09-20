FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
COPY requirements-optional.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire API directory
COPY . .

# Create symbolic link for import compatibility
RUN ln -sf /app /app/api

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Expose port
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=start.py
ENV PYTHONPATH=/app:$PYTHONPATH

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:5000/api/')" || exit 1

# Run the application
CMD ["python", "docker_start.py"]

# Alternative production command with Gunicorn (uncomment for production)
# CMD ["gunicorn", "--bind", "[::]:5000", "--workers", "4", "docker_start:app"]
