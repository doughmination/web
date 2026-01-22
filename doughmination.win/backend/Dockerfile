FROM python:3.14-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Set working directory
WORKDIR /app

# Install system dependencies (if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies, remove issue depencencies
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
CMD ["dotenvx", "run", "--", "python3", "main.py"]
