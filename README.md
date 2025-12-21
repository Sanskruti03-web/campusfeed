# CampusFeed - 🚀 NIT Rourkela's Premier Social Platform

A vibrant, feature-rich social platform exclusive to NIT Rourkela students. Share events, connect with peers, and stay updated with campus life. Features domain-restricted authentication, real-time-like chat, rich media posts, and a premium glassmorphic UI.

## ✨ Features

### Core Experience

- **🔐 Domain-Restricted Auth**: Exclusive access for `@nitrkl.ac.in` emails.
- **🎨 Premium UI**: Stunning glassmorphism design with animated gradients and smooth transitions.
- **📱 Responsive Design**: Fully optimized for mobile and desktop.

### Social Interaction

- **📝 Rich Posts**: Markdown support, code blocks, and media attachments (Images, PDFs).
- **💬 Nested Comments**: Reddit-style infinite nesting for deep discussions.
- **❤️ Reactions**: Express yourself with diverse reaction types (Like, Funny, Insightful, Celebrate).
- **📨 Direct Messaging**: **NEW!** Chat with other users in real-time (simulated timestamps).

### Developer Experience

- **🌱 Massive Seeding**: One-click script to populate DB with 50+ users, 100+ posts, and thousands of interactions.
- **⚡ Fast Development**: optimized for local dev with `token_debug` for easy auth verification.

## 🛠️ Tech Stack

### Backend

- **Framework**: Flask 3.0+
- **Database**: SQLite (with enforced foreign keys)
- **Auth**: Flask-Login + Session Cookies
- **Real-time**: Socket.IO (for notifications)
- **Processing**: Pillow for image optimization

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **State**: React Context + SWR styles
- **HTTP**: Axios with credentials

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+

### 1. Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # Configure your .env
python backend_run.py
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Seed Database (Optional but Recommended)

Populate your local instance with realistic dummy data (Users, Posts, Comments, Chats).

```bash
cd backend
# Make sure venv is active
python seed_large.py
```

_Note: This will clear existing data to ensure a clean slate._

## 🧪 Testing Guide

1. **Signup**: Go to `/auth/signup`. Use any `... @nitrkl.ac.in` email.
2. **Verify**: Click the "Verify Instantly" link shown on the success screen (Dev mode feature).
3. **Explore**:
   - Check the **Feed** for categorical posts.
   - Visit **Chats** to see seeded conversations.
   - Try **Dark Mode** (system preference usually).

## 📁 Project Structure

```
campusfeed/
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy Models (User, Post, Comment, Reaction, Message)
│   │   ├── routes/          # API Endpoints
│   │   └── ...
│   ├── seed_large.py        # Seeding script
│   └── ...
├── frontend/
│   ├── app/                 # Next.js App Router Pages
│   ├── components/          # Reusable UI Components
│   └── ...
└── ...
```

## 🤝 Contributing

Built with ❤️ for the NIT Rourkela community. Open a PR if you'd like to improve it!

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
