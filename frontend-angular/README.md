# GroceryHub Angular Frontend

Quick start (dev):

1. Install dependencies

```bash
cd frontend-angular
npm install
```

2. Start dev server (proxies /api to backend at http://localhost:5000)

```bash
npm start
```

Notes:
- The project proxies `/api` requests to `http://localhost:5000` using `proxy.conf.json` to avoid CORS and preserve cookies.
- The backend must be running (Express + MongoDB) on port 5000. Keep `SESSION_SECRET` and `MONGO_URI` configured in backend `.env`.
