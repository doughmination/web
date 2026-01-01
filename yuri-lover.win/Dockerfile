FROM python:3.12-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY server/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose the port
EXPOSE 8080

# Run the FastAPI server
CMD ["python", "-m", "server.main"]