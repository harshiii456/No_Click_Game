# 🚀 No-Click Button Game Deployment Guide

## Option 1: Render (Recommended for Full-Stack)

### Backend Deployment
1. **Push to GitHub**:
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

2. **Deploy to Render**:
- Go to [render.com](https://render.com)
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Use these settings:
  - **Name**: no-click-game-api
  - **Environment**: Docker
  - **Dockerfile Path**: `./backend/Dockerfile`
  - **Docker Context**: `./backend`
  - **Health Check Path**: `/api/health`
  - **Plan**: Free (or Starter)

3. **Environment Variables** (in Render dashboard):
```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
FRONTEND_URL=https://your-frontend-url.onrender.com
MIN_GAME_TIME=3
MAX_GAME_TIME=300
```

### Frontend Deployment
1. **Create another Web Service** on Render:
- **Name**: no-click-game-frontend
- **Environment**: Static
- **Build Command**: `cd frontend && npm run build`
- **Publish Directory**: `./frontend/build`
- **Add Custom Domain** (optional)

2. **Environment Variables**:
```
REACT_APP_API_URL=https://no-click-game-api.onrender.com/api
```

## Option 2: Vercel (Frontend Only)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy Frontend**:
```bash
cd frontend
vercel --prod
```

3. **Update Environment Variables** in Vercel dashboard:
```
REACT_APP_API_URL=https://your-render-backend-url.onrender.com/api
```

## Option 3: Netlify (Frontend Only)

1. **Build for Production**:
```bash
cd frontend
npm run build
```

2. **Deploy `build` folder** to Netlify with these redirect rules:
```
/api/*  https://your-backend-url.onrender.com/api/:splat  200
/*      /index.html                                 200
```

## 📋 Pre-Deployment Checklist

### Backend ✅
- [ ] MongoDB Atlas connection string ready
- [ ] Environment variables configured
- [ ] CORS allows production frontend URL
- [ ] Health check endpoint working
- [ ] All API endpoints tested

### Frontend ✅
- [ ] Production build runs without errors
- [ ] API URL configured for production
- [ ] All environment variables set
- [ ] Build optimized and minified

## 🔧 Environment Variables

### Development
```
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/no-click-game
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000/api
```

### Production
```
# Backend (Render Dashboard)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/no-click-game
NODE_ENV=production
FRONTEND_URL=https://your-app.onrender.com

# Frontend (Vercel/Netlify Dashboard)
REACT_APP_API_URL=https://your-app.onrender.com/api
```

## 🌐 Deployment URLs

After deployment:
- **Backend**: `https://no-click-game-api.onrender.com`
- **Frontend**: `https://no-click-game-frontend.onrender.com` OR `https://your-app.vercel.app`

## 🔄 CI/CD Pipeline

For automatic deployments, connect your GitHub repo and enable auto-deploy on push to main branch.

## 📱 Mobile Considerations

- Ensure touch events work on production
- Test on actual mobile devices
- Check responsive design
- Verify performance on slower connections

## 🔒 Security Notes

- Use HTTPS in production
- Set strong MongoDB credentials
- Enable rate limiting (already configured)
- Monitor for unusual activity
