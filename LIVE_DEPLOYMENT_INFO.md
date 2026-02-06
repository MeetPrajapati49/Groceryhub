# 🚀 GroceryHub - Deployment Information

## 📌 Live URLs (Bookmark These!)

| Component | URL |
|-----------|-----|
| **Frontend (Vercel)** | https://groceryhub-meetprajapati49.vercel.app |
| **Backend (Render)** | https://groceryhub-gjxf.onrender.com |
| **API Endpoint** | https://groceryhub-gjxf.onrender.com/api |
| **GitHub Repo** | https://github.com/MeetPrajapati49/Groceryhub |

---

## 🔐 Credentials

### MongoDB Atlas
- **Username:** `4meetp_db_user`
- **Password:** `4Meetp492005!`
- **Connection String:**
```
mongodb+srv://4meetp_db_user:4Meetp492005!@cluster0.xpesdyq.mongodb.net/groceryhub?appName=Cluster0
```

### Admin Dashboard
- **URL:** https://groceryhub-meetprajapati49.vercel.app/admin
- **Email:** admin@groceryhub.com
- **Password:** admin123

---

## 🎓 For Viva/Demo

### Before Your Demo (IMPORTANT!)
1. **Visit your site 5 minutes before** to wake up the backend
2. The first load may take 30-50 seconds (free tier sleeps after inactivity)
3. After that, it works normally!

### Demo Flow Suggestions
1. Show the homepage with products
2. Register/Login as a user
3. Add items to cart
4. Show wishlist functionality
5. Complete checkout flow
6. Show admin dashboard (use admin credentials above)
7. Show MongoDB Atlas to prove real database

---

## 💼 For Resume

```
GroceryHub - Full-Stack E-Commerce Platform
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Built with Angular 16, Node.js/Express 5, MongoDB
• Features: User auth, cart, wishlist, admin dashboard, 
  flash sales, order history, analytics
• Cloud Architecture: Vercel (frontend) + Render (backend) 
  + MongoDB Atlas (database)
• Live Demo: https://groceryhub-meetprajapati49.vercel.app
• GitHub: github.com/MeetPrajapati49/Groceryhub
```

---

## 🛠️ How to Run Locally

### Backend
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

### Frontend
```bash
cd frontend-angular
npm install
npm start
# Runs on http://localhost:4200
```

### Requirements
- Node.js 18+
- MongoDB running locally OR use Atlas connection string

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Angular 16 |
| Backend | Node.js + Express 5 |
| Database | MongoDB Atlas |
| Auth | JWT + Sessions |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| Version Control | Git + GitHub |

---

## 📊 Platform Limits (Free Tier)

| Platform | Limit | Note |
|----------|-------|------|
| Vercel | 100GB bandwidth/month | Unlimited deployments |
| Render | 750 hrs/month | Sleeps after 15min inactive |
| MongoDB Atlas | 512MB storage | Free forever |

---

## ⚠️ Troubleshooting

### "Site is slow to load"
- Normal for first request (backend wakes up from sleep)
- Visit site 5 mins before demo

### "CORS Error"
- Already configured for production URLs
- If issues, check `server.js` allowedOrigins array

### "Cannot connect to database"
- Check MongoDB Atlas Network Access allows 0.0.0.0/0
- Verify connection string in Render environment variables

---

## 📅 Deployed On
- **Date:** February 5, 2026
- **By:** Meet Prajapati

---

*Good luck with your exam! 🍀*
