# ☁️ Free Hosting Guide

This guide will help you host **CampusFeed** for free using the best free-tier providers available.

- **Frontend**: [Vercel](https://vercel.com) (Best for Next.js)
- **Backend**: [Railway](https://railway.app) (Great developer experience)
- **Database**: [Neon](https://neon.tech) (Free serverless Postgres)

---

## 🏗️ 1. Setup Database (Neon)

Since free hosting platforms have ephemeral file systems (files are wiped on restart), we cannot use SQLite. We will use Postgres.

1.  Go to [Neon.tech](https://neon.tech) and sign up.
2.  Create a **New Project** (e.g., `campusfeed-db`).
3.  Copy the **Connection String** (Postgres URL). It looks like:
    `postgres://user:pass@ep-host.region.neon.tech/neondb?sslmode=require`

---

## 🚀 2. Deploy Backend (Railway)

1.  Push your code to **GitHub**.
2.  Go to [Railway Dashboard](https://railway.app).
3.  Click **New Project** -> **GitHub Repo**.
4.  Select your repository.
5.  **Configuration**:
    - Railway usually auto-detects Python.
    - Go to **Settings** -> **Root Directory**: Set to `backend`.
    - Go to **Settings** -> **Build Command**: `pip install -r requirements.txt`
    - Go to **Settings** -> **Start Command**: `gunicorn backend_run:app` (Or it will auto-read Procfile)
6.  **Variables** (Add these):
    - `DATABASE_URL`: Paste your Neon connection string.
      - _Note_: Change `postgres://` to `postgresql://` if needed for SQLAlchemy.
    - `SECRET_KEY`: Generate a random string.
    - `FLASK_ENV`: `production`
    - `ALLOWED_ORIGINS`: `https://your-frontend.vercel.app` (You will set this after deploying frontend, initially use `*`)
    - `PORT`: `5000` (Optional, Railway usually handles this, but gunicorn defaults to 8000. Start command might need bind address or PORT env)
      - _Better Start Command_: `gunicorn backend_run:app -b 0.0.0.0:$PORT`
7.  Click **Deploy** (if not auto-started).
8.  Go to **Settings** -> **Domains** -> **Generate Domain**.
9.  Copy your **Public URL** (e.g., `https://campusfeed-production.up.railway.app`).

---

## 🌐 3. Deploy Frontend (Vercel)

1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Configuration**:
    - **Root Directory**: Click "Edit" and select `frontend`.
    - **Framework Preset**: Next.js
5.  **Environment Variables**:
    - `NEXT_PUBLIC_API_URL`: Paste your **Railway Backend URL** (no trailing slash).
      - Example: `https://campusfeed-production.up.railway.app`
6.  Click **Deploy**.

---

## 🔄 4. Final Configuration

1.  **Frontend URL**: Copy your new Vercel URL (e.g., `https://campusfeed.vercel.app`).
2.  **Update Backend**:
    - Go back to Railway Dashboard -> Variables.
    - Update `ALLOWED_ORIGINS` to your Vercel URL to secure CORS.
    - Railway auto-redeploys on variable change.

## ✅ Verification

- Visit your Vercel URL.
- Try `Sign Up` -> The backend (Railway) should create a user in Neon DB.
- **Note**: Railway has a trial period for free hobby tier, but it's very robust.
