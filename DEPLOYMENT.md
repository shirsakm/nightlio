# Deployment Guide

## Current Setup (RECOMMENDED)

### Frontend: Vercel
- **URL**: https://nightlio.vercel.app
- **Status**: ✅ Deployed
- **Auto-deploy**: GitHub main branch
- **Free tier**: 100GB bandwidth/month

### Backend: Railway  
- **URL**: https://nightlio-production-8c5a.up.railway.app
- **Status**: ✅ Deployed
- **Auto-deploy**: GitHub main branch
- **Free tier**: 500 hours/month

## Environment Variables

### Vercel (Frontend)
```
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### Railway (Backend)
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET_KEY=your-jwt-secret-key
SECRET_KEY=your-flask-secret-key
RAILWAY_ENVIRONMENT=production
CORS_ORIGINS=https://nightlio.vercel.app
```

## Monitoring Usage

### Railway Free Tier Limits
- **500 hours/month** (≈ 16.7 hours/day)
- **1GB RAM**
- **1GB disk space**
- **No credit card required**

### How to Monitor
1. Go to Railway dashboard
2. Check "Usage" tab
3. Monitor hours used
4. Set up usage alerts

### If You Hit Limits
**Option 1**: Upgrade Railway ($5/month)
**Option 2**: Switch to Render.com (750 hours free)
**Option 3**: Use EC2 micro (750 hours free first year)

## Alternative Deployments

### Option A: Vercel + Render
1. Keep Vercel frontend
2. Deploy backend to Render.com
3. Update API_BASE_URL in frontend

### Option B: Full EC2
1. Launch EC2 t2.micro instance
2. Install Node.js + Python
3. Set up nginx reverse proxy
4. Configure SSL with Let's Encrypt
5. Deploy both frontend + backend

### Option C: Vercel + Supabase
1. Keep Vercel frontend  
2. Migrate to Supabase backend
3. Use Supabase auth + database
4. Rewrite API calls to use Supabase client

## Recommended: Stay with Current Setup

Your current Vercel + Railway setup is:
- ✅ Already working
- ✅ Professional URLs
- ✅ Automatic deployments
- ✅ Free tier generous enough
- ✅ Perfect for portfolio

## Cost Breakdown (Monthly)

| Service  | Free Tier            | Paid Tier |
| -------- | -------------------- | --------- |
| Vercel   | 100GB bandwidth      | $20/month |
| Railway  | 500 hours            | $5/month  |
| Render   | 750 hours            | $7/month  |
| EC2      | 750 hours (1st year) | ~$8/month |
| Supabase | 500MB DB             | $25/month |

## Security Checklist for Production

- [x] Environment variables set
- [x] CORS origins restricted  
- [x] Debug logs removed
- [x] Security headers added
- [x] Rate limiting implemented
- [x] Input validation added
- [x] HTTPS enforced
- [x] JWT tokens secured

## Performance Optimization

### Frontend (Vercel)
- Automatic CDN
- Image optimization
- Code splitting
- Gzip compression

### Backend (Railway)
- Keep-alive connections
- Database connection pooling
- Response caching
- Efficient queries

Your app is production-ready! 🚀