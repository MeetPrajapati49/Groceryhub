# 🚀 GroceryHub Deployment Guide

Deploy your GroceryHub project **for FREE** on the internet! Perfect for college demos and resumes.

---

## 📋 Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Vercel       │────▶│     Render      │────▶│  MongoDB Atlas  │
│   (Frontend)    │     │    (Backend)    │     │   (Database)    │
│  Angular App    │     │  Express API    │     │   Free 512MB    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Your final URLs will look like:**
- Frontend: `https://groceryhub.vercel.app`
- Backend: `https://groceryhub-api.onrender.com`

---

## Step 1️⃣: Setup MongoDB Atlas (Free Database)

### 1.1 Create Account
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Click **"Try Free"** and sign up (Google sign-in works!)

### 1.2 Create a Cluster
1. Choose **M0 FREE** tier
2. Select a cloud provider (AWS recommended)
3. Choose region closest to you (Mumbai for India)
4. Click **"Create Deployment"**

### 1.3 Setup Database Access
1. Go to **Database Access** → **Add New Database User**
2. Create username & password (save these!)
3. Set privileges to **"Read and write to any database"**

### 1.4 Setup Network Access
1. Go to **Network Access** → **Add IP Address**
2. Click **"Allow Access from Anywhere"** (for demo purposes)
3. Click **Confirm**

### 1.5 Get Connection String
1. Go to **Database** → **Connect** → **Drivers**
2. Copy the connection string, it looks like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
3. Replace `<password>` with your actual password
4. Add database name: `mongodb+srv://...mongodb.net/groceryhub?retryWrites=...`

> [!IMPORTANT]
> Save this connection string! You'll need it for the backend deployment.

---

## Step 2️⃣: Deploy Backend on Render (Free)

### 2.1 Prepare Backend Code

Make sure your `backend/package.json` has these scripts:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```
✅ Your backend already has this!

### 2.2 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended for easy deployment)

### 2.3 Deploy from GitHub
1. First, push your code to GitHub if not already done:
   ```bash
   cd i:\code\meet\clg\clg
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/groceryhub.git
   git push -u origin main
   ```

2. On Render Dashboard, click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `groceryhub-api` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### 2.4 Add Environment Variables

Click **"Environment"** tab and add:

| Key | Value |
|-----|-------|
| `MONGO_URI` | `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/groceryhub?retryWrites=true&w=majority` |
| `SESSION_SECRET` | `your-super-secret-key-change-this-123` |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |

### 2.5 Deploy!
1. Click **"Create Web Service"**
2. Wait for deployment (takes 2-5 minutes)
3. Your backend URL will be: `https://groceryhub-api.onrender.com`

> [!NOTE]
> Free tier sleeps after 15 min of inactivity. First request after sleep takes ~30 seconds.

---

## Step 3️⃣: Update Backend for Production

Before deploying, update `backend/server.js` CORS settings:

### 3.1 Modify CORS Configuration

Update the `allowedOrigins` array in `server.js` to include your frontend URL:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:4200',
  'https://groceryhub.vercel.app',       // ← Add your Vercel URL
  'https://your-app.vercel.app'          // ← Or any custom domain
];
```

You can also use an environment variable approach:
```javascript
const allowedOrigins = [
  'http://localhost:4200',
  process.env.FRONTEND_URL              // ← Add to Render env vars
].filter(Boolean);
```

---

## Step 4️⃣: Deploy Frontend on Vercel (Free)

### 4.1 Update Angular Environment

Create/update `frontend-angular/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://groceryhub-api.onrender.com/api'  // ← Your Render URL
};
```

### 4.2 Update API Service

Make sure your Angular services use the environment:
```typescript
import { environment } from '../../environments/environment';

// Use this for API calls:
const API_URL = environment.apiUrl;
```

### 4.3 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### 4.4 Deploy from GitHub
1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Other` |
| **Root Directory** | `frontend-angular` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist/frontend-angular` |

### 4.5 Create vercel.json (for Angular routing)

Create `frontend-angular/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

### 4.6 Deploy!
1. Click **"Deploy"**
2. Wait for build (~2-3 minutes)
3. Your app is LIVE! 🎉

---

## Step 5️⃣: Final Checklist

### ✅ Backend (Render)
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with read/write access
- [ ] Network access allows all IPs (0.0.0.0/0)
- [ ] Backend deployed on Render
- [ ] Environment variables configured
- [ ] CORS updated with frontend URL

### ✅ Frontend (Vercel)
- [ ] Environment files updated with API URL
- [ ] vercel.json created for routing
- [ ] Frontend deployed on Vercel
- [ ] Test all features work

---

## 🔧 Troubleshooting

### "CORS Error"
- Make sure your Vercel URL is in the `allowedOrigins` array
- Redeploy backend after updating CORS

### "Cannot connect to database"
- Check MongoDB Atlas Network Access allows 0.0.0.0/0
- Verify connection string in Render environment variables
- Make sure password has no special characters that need URL encoding

### "Backend is slow"
- Free Render tier sleeps after inactivity
- First request takes ~30 seconds to "wake up"
- This is normal for free tier!

### "Build failed on Vercel"
- Check the build logs
- Make sure `npm install` runs successfully locally
- Verify Angular version compatibility

---

## 📱 For Your Resume

Add to your resume Projects section:

```
GroceryHub - Full-Stack E-Commerce Platform
• Built with Angular 16, Node.js/Express, MongoDB
• Features: User auth, cart, wishlist, admin dashboard, analytics
• Deployed: Frontend on Vercel, Backend on Render, DB on MongoDB Atlas
• Live Demo: https://groceryhub.vercel.app
• GitHub: https://github.com/YOUR_USERNAME/groceryhub
```

---

## 🎓 For College Viva

When presenting:
1. Open your live URL: `https://groceryhub.vercel.app`
2. Show the GitHub repository
3. Explain the architecture (3-tier: frontend, backend, database)
4. Demonstrate key features
5. Be ready to explain deployment process

> [!TIP]
> Visit your site 5 minutes before the viva to "wake up" the backend!

---

## 📞 Need Help?

If you get stuck:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments
3. Check MongoDB logs: Atlas → Activity Feed

**Common Free Tier Limits:**
- **Render**: 750 hours/month, sleeps after 15 min inactive
- **Vercel**: 100GB bandwidth/month, 100 deployments/day
- **MongoDB Atlas**: 512MB storage, shared cluster

---

*Good luck with your project! 🍀*
