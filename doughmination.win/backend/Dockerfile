FROM python:3.14-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Set working directory
WORKDIR /app

# Install Node.js and system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g @dotenvx/dotenvx \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && pip uninstall -y ecdsa rsa pyasn1

# Create necessary directories
RUN mkdir -p dough-data static

# Copy application code
COPY app/ ./app/
COPY main.py .

# Copy static files
COPY static/ ./static/

# Set permissions for data directory
RUN chmod 755 dough-data

# Expose application port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/api/system')" || exit 1

# Run application
CMD ["dotenvx", "run", "--", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]