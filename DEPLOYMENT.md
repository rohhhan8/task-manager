# Deployment Guide - Task Manager Pro

## Recommended FREE Setup: Vercel (Frontend) + Cyclic (Backend)

### Why This Setup?
- **Vercel**: Best for React apps, instant deployments, no cold starts
- **Cyclic**: 100% FREE, no cold starts, always-on, built for Node.js

---

## Backend Deployment (Cyclic) - 100% FREE!

### 1. Deploy to Cyclic
1. Go to [cyclic.sh](https://cyclic.sh)
2. Sign up with GitHub (no credit card needed!)
3. Click "Link Your Own" → "From GitHub"
4. Select your repository
5. Choose the `backend` folder as the root directory
6. Click "Connect Cyclic"

### 2. Environment Variables
Add these in Cyclic dashboard (Settings → Environment):
```
MONGO_URI=mongodb+srv://rohan_mongo18:Wm44iKss7Sk5R51P@cluster0.wsbb06d.mongodb.net/taskmanager?retryWrites=true&w=majority&appName=TaskManager
JWT_SECRET=task_manager_secure_jwt_secret_2025
GMAIL_USER=rohanbhaikapc@gmail.com
GMAIL_PASSWORD=lpfdcyuxjtlmafxa
NODE_ENV=production
```

### 3. Your Backend URL
After deployment, you'll get a URL like:
`https://your-app-name.cyclic.app`

### 4. Update CORS
After deployment, update `backend/server.js` line 15:
```javascript
'https://your-actual-vercel-url.vercel.app',
```

---

## Frontend Deployment (Vercel)

### 1. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Set root directory to `frontend`
6. Framework preset: Create React App

### 2. Environment Variables
Add in Vercel dashboard:
```
REACT_APP_API_URL=https://your-railway-backend-url.railway.app/api
```

### 3. Build Settings
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

---

## Alternative Options

### Option 1: Cyclic (Backend Alternative)
- Go to [cyclic.sh](https://cyclic.sh)
- Connect GitHub repository
- No cold starts, always-on free tier

### Option 2: Netlify (Frontend Alternative)
- Go to [netlify.com](https://netlify.com)
- Drag & drop build folder or connect GitHub
- Similar to Vercel

### Option 3: Full-Stack on Vercel
Deploy both frontend and backend on Vercel using serverless functions.

---

## Step-by-Step Deployment

### Phase 1: Backend First
1. Deploy backend to Railway
2. Note the Railway URL (e.g., `https://task-manager-backend-production.railway.app`)
3. Test the backend: `https://your-url.railway.app/health`

### Phase 2: Update Frontend
1. Update `frontend/.env.production`:
   ```
   REACT_APP_API_URL=https://your-railway-url.railway.app/api
   ```
2. Update `frontend/src/services/api.js` line 13 with your Railway URL

### Phase 3: Frontend Deployment
1. Deploy frontend to Vercel
2. Note the Vercel URL (e.g., `https://task-manager-pro.vercel.app`)

### Phase 4: Update CORS
1. Update backend CORS with your Vercel URL
2. Redeploy backend

---

## Testing Deployment

### Backend Health Check
```bash
curl https://your-railway-url.railway.app/health
```

### Frontend Test
1. Visit your Vercel URL
2. Try signup/login
3. Create a task
4. Check if email reminders work

---

## Cost Comparison

| Service | Free Tier | Cold Starts | Best For |
|---------|-----------|-------------|----------|
| **Cyclic** | **100% FREE Forever** | **None** | **Backend (RECOMMENDED)** |
| **Vercel** | **Unlimited** | **None** | **Frontend (RECOMMENDED)** |
| Railway | $5 credit/month | ~2-3 seconds | Backend (paid) |
| Render | 750 hours/month | 30-60 seconds | Not recommended |
| Netlify | Unlimited | None | Frontend alternative |

---

## Troubleshooting

### Common Issues
1. **CORS Error**: Update allowed origins in backend
2. **API Not Found**: Check REACT_APP_API_URL
3. **Database Connection**: Verify MongoDB Atlas IP whitelist
4. **Email Not Working**: Check Gmail app password

### Debug Commands
```bash
# Check environment variables
echo $REACT_APP_API_URL

# Test API endpoint
curl https://your-backend-url/api/auth/login

# Check build
npm run build
```

---

## Performance Tips

1. **Enable Gzip**: Railway/Vercel handle this automatically
2. **Optimize Images**: Use WebP format
3. **Code Splitting**: React does this by default
4. **CDN**: Vercel provides global CDN

---

## Security Checklist

- [ ] Environment variables are set correctly
- [ ] MongoDB Atlas IP whitelist is configured
- [ ] CORS origins are restricted to your domains
- [ ] JWT secret is secure
- [ ] Gmail app password is used (not regular password)

---

## Next Steps After Deployment

1. Set up custom domain (optional)
2. Configure monitoring/analytics
3. Set up automated deployments
4. Add error tracking (Sentry)
5. Set up backup strategy for MongoDB
