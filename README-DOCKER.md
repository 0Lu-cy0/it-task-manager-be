# Docker Deployment Guide

## Prerequisites
- Docker installed
- Docker Compose installed
- `.env` file configured

## Quick Start

### 1. Build and run with Docker Compose
```bash
docker-compose up -d
```

### 2. View logs
```bash
docker-compose logs -f
```

### 3. Stop the application
```bash
docker-compose down
```

## Manual Docker Commands

### Build image
```bash
docker build -t trello-backend .
```

### Run container
```bash
docker run -d \
  --name trello-backend \
  -p 3000:3000 \
  -p 7700:7700 \
  --env-file .env \
  trello-backend
```

### View logs
```bash
docker logs -f trello-backend
```

### Stop container
```bash
docker stop trello-backend
docker rm trello-backend
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
DATABASE_NAME=trello
APP_HOST=0.0.0.0
APP_PORT=3000
JWT_SECRET_KEY=your-secret-key
JWT_SECRET_KEY_REFRESH=your-refresh-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLIENT_URL=http://localhost:5173
MEILISEARCH_API_KEY=your-meili-master-key
MEILISEARCH_HOST=http://localhost:7700
AUTHOR=YourName
```

## Ports

- **3000**: Backend API
- **7700**: MeiliSearch

## Health Check

The container includes a health check that pings the backend every 30 seconds.

## Troubleshooting

### Check container status
```bash
docker ps -a
```

### Enter container shell
```bash
docker exec -it trello-backend sh
```

### Remove all containers and volumes
```bash
docker-compose down -v
```

### Rebuild without cache
```bash
docker-compose build --no-cache
docker-compose up -d
```

## Production Deployment

For production on platforms like Railway, Render, or DigitalOcean:

1. Push to GitHub
2. Connect repository to platform
3. Set environment variables in platform dashboard
4. Deploy using Dockerfile

The platform will automatically:
- Build the Docker image
- Run the container
- Expose the ports
- Handle SSL/HTTPS
