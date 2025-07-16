# Deployment Guide

## For Render.com Deployment

### Quick Setup
1. Connect your GitHub repository to Render
2. Use the provided `render.yaml` configuration file
3. Set environment variables in Render dashboard

### Manual Setup

#### 1. Build Command
```bash
npm run build
```

#### 2. Start Command
```bash
npm start
```

#### 3. Environment Variables
Set these environment variables in Render:
- `NODE_ENV=production`
- `PORT=10000` (Render's default port)
- `DATABASE_URL=your_postgresql_connection_string` (if using database)

#### 4. Alternative: Use Deploy Script
```bash
./deploy.sh
```

### 4. Build Settings
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Node Version**: 18 or higher
- **Auto-Deploy**: Yes (optional)

### 5. Port Configuration
The application automatically binds to port 5000 in the server configuration. Render should handle port mapping automatically.

### 6. Static Files
The build process creates:
- `dist/public/` - Contains built frontend assets
- `dist/index.js` - Contains bundled server code

### 7. Common Issues and Solutions

#### Issue: "Could not find the build directory"
**Solution**: Make sure the build command runs successfully. Check that both `vite build` and `esbuild` commands complete without errors.

#### Issue: Application not loading
**Solution**: Check that the PORT environment variable is properly set. The app defaults to port 5000.

#### Issue: Static assets not loading
**Solution**: Ensure the `dist/public` directory exists after build and contains the frontend assets.

### 8. Manual Deployment Steps
1. Clone the repository
2. Run `npm install`
3. Run `npm run build`
4. Run `npm start`
5. Access the application at the deployed URL

### 9. Production Checklist
- [ ] Build completes successfully
- [ ] `dist/public` directory exists with assets
- [ ] `dist/index.js` exists and is executable
- [ ] Environment variables are set correctly
- [ ] Port configuration is correct
- [ ] Static file serving works