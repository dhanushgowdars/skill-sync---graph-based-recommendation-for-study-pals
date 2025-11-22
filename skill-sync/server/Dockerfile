# ---------- Backend Dockerfile (server/Dockerfile) ----------
# Base Python image
FROM python:3.11-slim

# Set workdir inside container
WORKDIR /app

# Install system deps (optional but safe for some libs)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
  && rm -rf /var/lib/apt/lists/*

# Copy requirements first (better for layer caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of backend code
COPY . .

# Expose backend port
EXPOSE 5000

# Run Flask app
# Make sure server.py has: app.run(host="0.0.0.0", port=5000, debug=True)
CMD ["python", "server.py"]
