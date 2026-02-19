# Port Reference Guide

## Application Ports

When running the application with `./manage.sh start`, the following ports are used:

### Frontend (Next.js)
- **Port**: `3050`
- **URL**: http://localhost:3050
- **Access**: This is the main application URL you should use in your browser
- **Login Credentials**:
  - Email: `admin@example.com`
  - Password: `P@ssw0rd`

### Backend (Express.js API)
- **Port**: `3025`
- **URL**: http://localhost:3025
- **Access**: This is the API server - do NOT access this directly in your browser
- **Note**: The frontend automatically connects to this port for API calls

### Other Services
- **Cube.js**: http://localhost:4000
- **Ollama**: http://localhost:11435 (configurable via OLLAMA_PORT in .env)
- **PostgreSQL**: localhost:5432 (internal, accessed via Docker network)

## Common Issues

### "404 Not Found" Error
- **Cause**: Accessing the wrong port
- **Solution**: Make sure you're accessing http://localhost:3050 (frontend) and not http://localhost:3025 (backend API)

### "Cannot GET /" Error
- **Cause**: Trying to access the backend API directly
- **Solution**: The backend is an API server, not a web application. Access http://localhost:3050 instead

### Data Sources Page Shows 404
- **Cause**: Accessing the application on the wrong port
- **Solution**: Navigate to http://localhost:3050/data-sources

## How to Access the Application

1. Start the application: `./manage.sh start`
2. Wait for both backend and frontend to start (you'll see "Ready" messages in the terminal)
3. Open your browser to: **http://localhost:3050**
4. Login with the credentials above
5. Navigate to any page (Dashboard, Reports, Data Sources, etc.)

## Troubleshooting

If the application isn't working:

1. Check if services are running:
   ```bash
   # Check frontend
   lsof -i :3050
   
   # Check backend
   docker ps
   ```

2. View logs:
   ```bash
   # Backend logs
   ./manage.sh logs
   
   # Frontend logs are shown in the terminal where you ran ./manage.sh start
   ```

3. Restart services:
   ```bash
   ./manage.sh stop
   ./manage.sh start
   ```
