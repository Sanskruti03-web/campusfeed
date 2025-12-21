# ☁️ Free Hosting Guide

This guide will help you host **CampusFeed** for free using the best free-tier providers available.

- **Frontend**: [Vercel](https://vercel.com) (Best for Next.js)
- **Backend**: [Koyeb](https://koyeb.com) (High performance free tier)
- **Database**: [Neon](https://neon.tech) (Free serverless Postgres)

---

## 🏗️ 1. Setup Database (Neon)

Since free hosting platforms have ephemeral file systems (files are wiped on restart), we cannot use SQLite. We will use Postgres.

1.  Go to [Neon.tech](https://neon.tech) and sign up.
2.  Create a **New Project** (e.g., `campusfeed-db`).
3.  Copy the **Connection String** (Postgres URL). It looks like:
    `postgres://user:pass@ep-host.region.neon.tech/neondb?sslmode=require`

---

## 🚀 2. Deploy Backend (Koyeb)

1.  Push your code to **GitHub**.
2.  Go to [Koyeb Dashboard](https://app.koyeb.com).
3.  Click **Create App** (or Create Service).
4.  Select **GitHub** as deployment method.
5.  Select your repository.
6.  **Configure Service**:
    - **Builder**: **Buildpack** (Standard Python builder).
    - **Work Directory**: `backend` (Important! Set this to run from backend folder).
    - **Build Command**: `pip install -r requirements.txt`
    - **Run Command**: `gunicorn backend_run:app`
7.  **Environment Variables** (Add these):
    - `DATABASE_URL`: Paste your Neon connection string.
      - _Note_: Change `postgres://` to `postgresql://` if needed for SQLAlchemy.
    - `SECRET_KEY`: Generate a random string.
    - `FLASK_ENV`: `production`
    - `ALLOWED_ORIGINS`: `https://your-frontend.vercel.app` (You will set this after deploying frontend, initially use `*`).
8.  Click **Deploy**.
9.  Wait for it to deploy. Copy your **Public URL** (e.g., `https://campusfeed-yourname.koyeb.app`).

---

## 🌐 3. Deploy Frontend (Vercel)

1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Configuration**:
    - **Root Directory**: Click "Edit" and select `frontend`.
    - **Framework Preset**: Next.js
5.  **Environment Variables**:
    - `NEXT_PUBLIC_API_URL`: Paste your **Koyeb Backend URL** (no trailing slash).
      - Example: `https://campusfeed-yourname.koyeb.app`
6.  Click **Deploy**.

---

## 🔄 4. Final Configuration

1.  **Frontend URL**: Copy your new Vercel URL (e.g., `https://campusfeed.vercel.app`).
2.  **Update Backend**:
    - Go back to Koyeb Dashboard -> Settings -> Environment Variables.
    - Update `ALLOWED_ORIGINS` to your Vercel URL to secure CORS.
    - Redeploy if needed (Koyeb usually auto-redeploys on env change).

## ✅ Verification

- Visit your Vercel URL.
- Try `Sign Up` -> The backend (Koyeb) should create a user in Neon DB.
- **Benefits of Koyeb**: Unlike Render, Koyeb's free tier has faster cold starts and better global performance.
