# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/mobile_app
COPY mobile_app/package*.json ./
RUN npm ci
COPY mobile_app/ ./
RUN npm run build

# Stage 2: Production Python Backend Server
FROM python:3.10-slim
WORKDIR /app

# Install system dependencies for OpenCV and Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend files and model pipeline
COPY api_server.py ./
COPY model/ ./model/
COPY static/ ./static/
COPY model_pipeline/ ./model_pipeline/

# Copy built frontend dist from Stage 1
COPY --from=frontend-builder /app/mobile_app/dist ./mobile_app/dist

ENV PORT=5000
ENV PYTHONUNBUFFERED=1

EXPOSE 5000

CMD ["python", "api_server.py"]
