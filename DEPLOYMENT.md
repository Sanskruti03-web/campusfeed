# ☁️ Free Hosting Guide: CampusFeed

This is a complete, step-by-step guide to deploying **CampusFeed** for free using a modern tech stack. We chose this stack for maximum performance and zero cost.

### 🏗️ The Stack

- **Frontend**: [Vercel](https://vercel.com) (Optimized for Next.js)
- **Backend**: [Railway](https://railway.app) (Zero-config Python deployments)
- **Database**: [Neon](https://neon.tech) (Serverless Postgres with free tier)

---

## ✅ 0. Prerequisites

Before starting, ensure you have:

1.  A **GitHub Account**.
2.  The code pushed to a GitHub repository (public or private).
3.  Accounts on [Vercel](https://vercel.com), [Railway](https://railway.app), and [Neon.tech](https://neon.tech).

> **Note**: Free tiers have limits. Neon sleeps after inactivity (300ms wake-up), and Railway provides $5 trial credit (enough for months of testing).

---

## 🗄️ 1. Setup Database (Neon)

We use Postgres because ephemeral file systems (like Railway's) wipe SQLite files on every restart.

1.  **Create Project**: Log in to [Neon Console](https://console.neon.tech) and create a project named `campusfeed`.
2.  **Get Credentials**:
    - Look only for the **Connection String** on the dashboard.
    - It looks like: `postgres://alex:AbCdEf12...`
    - **Important**: Keep this safe! You will need it for the backend.

---

## � 2. Deploy Backend (Railway)

Railway is the easiest way to deploy Python apps. It builds directly from your repo.

1.  **New Project**: Go to [Railway Dashboard](https://railway.app) -> **New Project** -> **GitHub Repo**.
2.  **Select Repo**: Choose your `campusfeed` repository.
3.  **Configure Service**:
    - Click on the new service card.
    - Go to **Settings** -> **Root Directory**: Set this to `/backend`.
      - _Why?_ The `requirements.txt` is inside this folder.
    - **Build Command**: `pip install -r requirements.txt`
    - **Start Command**: `gunicorn backend_run:app -b 0.0.0.0:$PORT`
4.  **Environment Variables**:
    Go to the **Variables** tab and add:
    - `DATABASE_URL`: Paste your **Neon Connection String**.
      - _Pro Tip_: If it starts with `postgres://`, change it to `postgresql://` (required for SQLAlchemy).
    - `SECRET_KEY`: Any random long string (e.g., `s3cr3t_k3y_123`).
    - `FLASK_ENV`: `production`
    - `PORT`: `5000` (Or let Railway assign one, but setting it helps avoid confusion).
    - `ALLOWED_ORIGINS`: `*` (Set to `*` initially to avoid CORS errors during setup).
5.  **Deploy**: It should deploy automatically. If not, click **Deploy**.
6.  **Public URL**:
    - Go to **Settings** -> **Networking** -> **Public Networking**.
    - Click **Generate Domain**.
    - Copy this URL (e.g., `https://campusfeed-production.up.railway.app`).

---

## ▲ 3. Deploy Frontend (Vercel)

Vercel is the native home of Next.js and offers the best performance.

1.  **Import Project**: Go to [Vercel Dashboard](https://vercel.com/new) -> **Import** your repo.
2.  **Configure**:
    - **Framework Preset**: Next.js (Auto-detected).
    - **Root Directory**: Click **Edit** and ensure `frontend` is selected.
3.  **Environment Variables**:
    - Expand **Environment Variables**.
    - Key: `NEXT_PUBLIC_API_URL`
    - Value: Your **Railway Public URL** (No trailing slash `/`).
      - ✅ `https://campusfeed-production.up.railway.app`
      - ❌ `https://campusfeed-production.up.railway.app/`
4.  **Deploy**: Click **Deploy**.

---

## � 4. Secure the Backend (Final Step)

Now that the frontend is live, we should lock down the backend to only accept requests from your site.

1.  **Copy Vercel URL**: Get your frontend domain (e.g., `https://campusfeed.vercel.app`).
2.  **Update Railway**:
    - Go to Railway Dashboard -> **Variables**.
    - Change `ALLOWED_ORIGINS` from `*` to `https://campusfeed.vercel.app`.
    - Railway will automatically redeploy to apply the security fix.

---

## 🩺 Troubleshooting

### 🔴 **Frontend says "Network Error" or 404**

- Check `NEXT_PUBLIC_API_URL` in Vercel. Did you include a trailing slash? (Remove it).
- Did you redeploy Frontend after setting variables? (Variables require a rebuild).

### 🔴 **Backend Logs: "ModuleNotFoundError"**

- Ensure **Root Directory** in Railway settings is `/backend`.

### 🔴 **Database Error**

- Check `DATABASE_URL` format. Did you seek replace `postgres://` with `postgresql://`?

### 🔴 **CORS Error**

- Temporarily set `ALLOWED_ORIGINS` to `*` in Railway to debug.
- Ensure the Vercel URL matches exactly (https vs http).

---

## 📝 Running Seeds in Production

To populate your database:
The easiest way is to connect to your remote DB from your local machine (if you have local python setup):

1.  Edit your local `.env` file in `backend/`.
2.  Set `DATABASE_URL` to your **Neon** connection string.
3.  Run `python seed_large.py`.
4.  This works because the seed script uses the env variable to connect!
