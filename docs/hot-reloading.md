# Backend Hot-Reloading Setup

## Overview
The backend container is now configured for **hot-reloading** in development mode. This means you can make changes to your backend code and see them reflected immediately without rebuilding the Docker container.

## How It Works

### 1. **Volume Mounting**
The entire `./backend` directory is mounted into the container at `/app`:
```yaml
volumes:
  - ./backend:/app
  - /app/node_modules  # Prevents host from overwriting container's node_modules
```

### 2. **Nodemon for Auto-Restart**
The container uses `nodemon` (already in your `devDependencies`) to watch for file changes:
```dockerfile
CMD ["npm", "run", "dev"]
```

This runs the `dev` script from `package.json`:
```json
"dev": "nodemon server.js"
```

### 3. **Development Dependencies**
The Dockerfile now installs all dependencies (including `nodemon`):
```dockerfile
RUN npm ci  # Instead of npm ci --only=production
```

## Usage

### First Time Setup
Build the containers with the new configuration:
```bash
docker compose build backend cube
docker compose up -d
```

### Making Changes
1. Edit any file in the `./backend` directory
2. Save the file
3. Nodemon will automatically detect the change and restart the server
4. Check the logs to see the restart:
   ```bash
   docker compose logs -f backend
   ```

### What Gets Hot-Reloaded?
✅ **JavaScript files** (`.js`)
✅ **Configuration files**
✅ **Any file in the backend directory**

### What Requires Rebuild?
❌ **package.json changes** (new dependencies)
❌ **Dockerfile changes**
❌ **System-level dependencies**

If you add new npm packages:
```bash
# Rebuild the container
docker compose build backend
docker compose up -d backend
```

## Benefits

1. **Faster Development**: No need to rebuild containers for code changes
2. **Instant Feedback**: See changes in seconds, not minutes
3. **Better DX**: Smooth development experience similar to local development

## Troubleshooting

### Changes Not Reflecting?
1. Check if nodemon is running:
   ```bash
   docker compose logs backend | grep nodemon
   ```

2. Verify volume mount:
   ```bash
   docker compose exec backend ls -la /app
   ```

3. Restart the container:
   ```bash
   docker compose restart backend
   ```

### Performance Issues?
If file watching is slow on Windows/Mac, you can configure nodemon with polling:

Create `nodemon.json` in the backend directory:
```json
{
  "watch": ["*.js", "routes/**/*.js", "middleware/**/*.js"],
  "ext": "js,json",
  "ignore": ["node_modules/**", "uploads/**", "database/**"],
  "legacyWatch": true,
  "delay": 1000
}
```

## Production vs Development

### Development (Current Setup)
- Hot-reloading enabled
- Source code mounted as volume
- All dependencies installed (including devDependencies)
- Uses `nodemon` for auto-restart

### Production (When Deploying)
For production, you should:
1. Set `NODE_ENV=production`
2. Remove the source code volume mount
3. Use `CMD ["node", "server.js"]` instead of nodemon
4. Install only production dependencies

Example production Dockerfile:
```dockerfile
RUN npm ci --only=production
CMD ["node", "server.js"]
```

## Notes

- The `/app/node_modules` volume ensures that the container's `node_modules` (with native bindings for Linux) aren't overwritten by your host's `node_modules`
- The same hot-reloading setup applies to both `backend` and `cube` services
- Database and uploads are still persisted in Docker volumes
