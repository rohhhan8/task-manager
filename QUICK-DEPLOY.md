# 🚀 Quick Deploy Guide - 100% FREE!

## Vercel (Frontend) + Cyclic (Backend) - No Credit Card Needed!

### ⚡ Step 1: Deploy Backend to Cyclic (5 minutes)

1. **Go to [cyclic.sh](https://cyclic.sh)**
2. **Sign up with GitHub** (no credit card required!)
3. **Click "Link Your Own" → "From GitHub"**
4. **Select your repository**
5. **Set root directory to `backend`**
6. **Click "Connect Cyclic"**

### 🔧 Step 2: Add Environment Variables in Cyclic

Go to **Settings → Environment** and add:

```
MONGO_URI=mongodb+srv://rohan_mongo18:5y909bwoiqTWJXD4@cluster0.wsbb06d.mongodb.net/myAppDatabase?retryWrites=true&w=majority&appName=TaskManager
JWT_SECRET=task_manager_secure_jwt_secret_2025
GMAIL_USER=rohanbhaikapc@gmail.com
GMAIL_PASSWORD=lpfdcyuxjtlmafxa
NODE_ENV=production
```

### 📝 Step 3: Note Your Backend URL

After deployment, you'll get a URL like:
`https://your-app-name.cyclic.app`

**Copy this URL!** You'll need it for the frontend.

### ⚡ Step 4: Deploy Frontend to Vercel (3 minutes)

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up with GitHub**
3. **Click "New Project"**
4. **Import your repository**
5. **Set root directory to `frontend`**
6. **Framework preset: Create React App**

### 🔧 Step 5: Add Environment Variable in Vercel

In Vercel dashboard, go to **Settings → Environment Variables** and add:

```
REACT_APP_API_URL=https://your-cyclic-url.cyclic.app/api
```

Replace `your-cyclic-url` with your actual Cyclic URL from Step 3.

### 🔄 Step 6: Update CORS (Important!)

1. **Note your Vercel URL** (e.g., `https://task-manager-pro.vercel.app`)
2. **Go to your GitHub repository**
3. **Edit `backend/server.js` line 15**
4. **Replace** `'https://your-frontend-url.vercel.app'` **with your actual Vercel URL**
5. **Commit and push** - Cyclic will auto-redeploy!

### ✅ Step 7: Test Your App

1. **Visit your Vercel URL**
2. **Try signing up**
3. **Create a task**
4. **Set a reminder**

---

## 🎉 That's It! Your App is Live!

### Your URLs:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.cyclic.app`

### 💰 Cost: $0.00 Forever!

### 🚀 Performance:
- **No cold starts** on either platform
- **Global CDN** with Vercel
- **Always-on** backend with Cyclic

---

## 🔧 If Something Goes Wrong:

### Backend Issues:
1. Check Cyclic logs in dashboard
2. Verify environment variables
3. Test: `https://your-cyclic-url.cyclic.app/health`

### Frontend Issues:
1. Check Vercel deployment logs
2. Verify `REACT_APP_API_URL` is set correctly
3. Check browser console for errors

### CORS Issues:
1. Make sure you updated the CORS URLs in `backend/server.js`
2. Redeploy backend after updating CORS

---

## 🎯 Pro Tips:

1. **Custom Domain**: Both Vercel and Cyclic support custom domains for free!
2. **Auto Deploy**: Both platforms auto-deploy when you push to GitHub
3. **Monitoring**: Cyclic provides built-in monitoring and logs
4. **Scaling**: Both platforms handle traffic spikes automatically

---

## 🆘 Need Help?

1. Check the full `DEPLOYMENT.md` guide
2. Test locally first: `npm start` (frontend) and `node server.js` (backend)
3. Verify MongoDB Atlas connection with `node test-mongodb.js`

**Happy Deploying! 🚀**
