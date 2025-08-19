# ZURDIR Deployment Guide

Complete deployment instructions for the ZURDIR Space AI Platform on Render.com.

## 📋 Prerequisites

- GitHub account
- Render.com account (free tier available)
- Basic familiarity with environment variables

## 🚀 Deployment Steps

### 1. Prepare Repository

**Fork the Repository:**
1. Go to the ZURDIR repository on GitHub
2. Click "Fork" to create your own copy
3. Clone your fork locally:
```bash
git clone https://github.com/yourusername/zurdir-platform.git
cd zurdir-platform
```

### 2. Render.com Setup

**Create Render Account:**
1. Visit [render.com](https://render.com)
2. Sign up with your GitHub account
3. Verify your email address

### 3. Database Deployment

**Create PostgreSQL Database:**
1. In Render Dashboard, click "New +" → "PostgreSQL"
2. Configure database:
   - **Name**: `zurdir-db`
   - **Database**: `zurdir`
   - **User**: `zurdir_user`
   - **Region**: Choose closest to your users
   - **Plan**: Free (or paid for production)
3. Click "Create Database"
4. **Important**: Save the connection string provided

### 4. Backend Service Deployment

**Create Web Service for Backend:**
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure service:
   - **Name**: `zurdir-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free (or paid)

**Configure Environment Variables:**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=[Use connection string from step 3]
JWT_SECRET=[Generate: openssl rand -base64 64]
ADMIN_PASSCODE=[Your 6-digit admin code]
ENCRYPTION_KEY=[Generate: openssl rand -hex 16]
OLLAMA_BASE_URL=https://ollama.cosmictools.us
```

**Generate Secure Keys:**
```bash
# JWT Secret (64 characters)
openssl rand -base64 64

# Encryption Key (32 characters)
openssl rand -hex 16
```

5. Click "Create Web Service"

### 5. Frontend Service Deployment

**Create Web Service for Frontend:**
1. Click "New +" → "Web Service"
2. Connect the same GitHub repository
3. Configure service:
   - **Name**: `zurdir-frontend`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid)

**Configure Environment Variables:**
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://zurdir-backend.onrender.com

```

**⚠️ Important**: Replace `zurdir-backend` with your actual backend service name.

4. Click "Create Web Service"

### 6. Worker Service (Background Jobs)

**Create Background Worker:**
1. Click "New +" → "Background Worker"
2. Connect the same repository
3. Configure worker:
   - **Name**: `zurdir-worker`
   - **Region**: Same as other services
   - **Branch**: `main`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node src/workers/backup.js`
   - **Plan**: Free (or paid)

**Environment Variables:**
```env
NODE_ENV=production
DATABASE_URL=[Same as backend]
ENCRYPTION_KEY=[Same as backend]
```

### 7. Final Configuration

**Update render.yaml (if needed):**
The provided `render.yaml` should work automatically, but verify service names match your deployment.

**Health Checks:**
- Backend: Should respond at `/health`
- Frontend: Should respond at `/`

### 8. Post-Deployment Setup

**Access Your Application:**
1. Frontend URL: `https://your-frontend-service.onrender.com`
2. Backend URL: `https://your-backend-service.onrender.com`

**Initial Admin Setup:**
1. Visit your frontend URL
2. Go to Admin Panel (enter your `ADMIN_PASSCODE`)
3. Create invitation codes
4. Test user registration and AI chat

## 🔧 Configuration Options

### Environment Variables Reference

**Required:**
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Token signing key (64+ characters)
- `ADMIN_PASSCODE`: Admin panel access (6 digits)
- `ENCRYPTION_KEY`: Backup encryption (32 characters)

**Optional:**

- `OLLAMA_CUSTOM_URL`: Override AI endpoint
- `MAX_FILE_SIZE`: Upload limit (default: 100MB)
- `ENABLE_WEB_SEARCH`: Enable/disable search
- `BLOCKED_DOMAINS`: Comma-separated blocked domains

### Custom Domain Setup

**Add Custom Domain:**
1. Go to your frontend service settings
2. Click "Custom Domains"
3. Add your domain (e.g., `zurdir.yourdomain.com`)
4. Configure DNS CNAME record pointing to Render
5. SSL certificate will be automatically generated

### Scaling Options

**Free Tier Limitations:**
- Services spin down after 15 minutes of inactivity
- 750 hours/month across all services
- Shared resources

**Paid Tier Benefits:**
- Always-on services
- Dedicated resources
- Better performance
- Priority support

## 🚨 Troubleshooting

### Common Issues

**Services Won't Start:**
```bash
# Check build logs in Render dashboard
# Verify environment variables are set
# Ensure database is accessible
```

**Database Connection Errors:**
```bash
# Verify DATABASE_URL format:
# postgresql://user:password@host:port/database

# Test connection from backend service:
curl -X GET https://your-backend.onrender.com/health
```

**Frontend Can't Connect to Backend:**
```bash
# Verify NEXT_PUBLIC_API_URL is correct
# Check CORS configuration in backend
# Ensure backend service is running
```

**File Upload Issues:**
```bash
# Check MAX_FILE_SIZE environment variable
# Verify disk space (Free tier: 1GB)
# Monitor service logs
```

### Debug Mode

**Enable Detailed Logging:**
```env
NODE_ENV=development
DEBUG=zurdir:*
LOG_LEVEL=debug
```

### Service Monitoring

**Health Check Endpoints:**
- Backend: `GET /health`
- Database: Check Render dashboard
- Monitor service logs in real-time

## 📊 Performance Optimization

### Database Optimization

**Connection Pooling:**
```env
DB_POOL_MIN=2
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
```

**Indexing:**
All necessary indexes are created automatically during migration.

### File Storage

**Free Tier Limits:**
- 1GB persistent disk per service
- Files stored in `/app/uploads`
- Automatic cleanup of expired backups

**Upgrade Recommendations:**
- Use external storage (AWS S3, Cloudinary) for production
- Implement file compression
- Set up CDN for static assets

### Caching

**Redis Integration** (Future Enhancement):
```bash
# Add Redis service
# Update backend to use Redis for sessions
# Implement request caching
```

## 🔐 Security Checklist

**Pre-Production:**
- [ ] Generate strong JWT_SECRET
- [ ] Set secure ADMIN_PASSCODE
- [ ] Configure HTTPS enforcement

- [ ] Review CORS settings
- [ ] Test authentication flows
- [ ] Verify database access controls
- [ ] Check file upload restrictions

**Post-Production:**
- [ ] Monitor error logs
- [ ] Set up backup alerts
- [ ] Regular security updates
- [ ] Database backup verification
- [ ] Performance monitoring
- [ ] User activity monitoring

## 📞 Support

**Render.com Issues:**
- Check [Render Status](https://status.render.com)
- Review [Render Docs](https://render.com/docs)
- Contact Render support

**ZURDIR Application Issues:**
- Check application logs
- Review environment variables
- Test individual components
- Create GitHub issue if needed

## 🔄 Updates & Maintenance

### Automated Updates

**GitHub Integration:**
- Push to main branch triggers automatic deployment
- Review build logs for any issues
- Test after each deployment

### Manual Updates

**Database Migrations:**
- Handled automatically on application startup
- Monitor logs for migration status
- Backup before major updates

### Backup & Recovery

**Automatic Backups:**
- Daily PostgreSQL backups (managed by Render)
- Application-level backups via worker service
- 60-day retention policy

**Manual Backup:**
```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Download via Render dashboard
# Or use backup worker service
```

---

**🎉 Congratulations!**

Your ZURDIR Space AI Platform should now be running in production. Visit your frontend URL and start exploring the time vortex of AI!

*"We're all stories in the end. Just make it a good one."* - The Doctor