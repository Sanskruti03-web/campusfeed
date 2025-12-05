# CampusFeed - NIT Rourkela Campus Feed Platform

A platform for NIT Rourkela students to share events, announcements, and connect with the campus community. Features domain-restricted authentication, markdown posts with media attachments, nested Reddit-style comments, and reactions.

## 🚀 Features

### Version 1 (Current - MVP)
- ✅ **Domain-Restricted Auth**: Only @nitrkl.ac.in emails can register
- ✅ **Email Verification**: Token-based email verification (dev mode shows token)
- ✅ **Posts with Categories**: Events, Announcements, Lost&Found, General
- ✅ **Markdown Support**: Rich text formatting in posts
- ✅ **Media Attachments**: Upload images (PNG, JPEG, WebP) and PDFs (max 10MB)
- ✅ **Nested Comments**: Infinite reply loops like Reddit
- ✅ **Reactions**: Like posts and comments
- ✅ **Edit Posts**: Update title, content, category with "edited" badge
- ✅ **Beautiful UI**: Gradient-based design with Tailwind CSS

### Future Versions
- **v2**: Real email service, S3 storage, notifications, user profiles
- **v3**: Advanced search, moderation tools, analytics

## 🛠️ Tech Stack

### Backend
- **Framework**: Flask 3.0+
- **Database**: SQLite (with foreign key constraints)
- **Auth**: Flask-Login with session cookies
- **Storage**: Local disk uploads
- **Rate Limiting**: Flask-Limiter
- **Dependencies**: See `backend/requirements.txt`

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Markdown**: react-markdown

## 📦 Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- Git

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# Minimal required config:
# SECRET_KEY=your-secret-key-here
# DATABASE_URL=sqlite:///campusfeed.db
# ALLOWED_EMAIL_DOMAINS=nitrkl.ac.in

# Run the backend server
python backend_run.py
```

Backend will start on `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file (optional)
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Run the development server
npm run dev
```

Frontend will start on `http://localhost:3000`

## 🧪 Testing with Postman

1. Import the collection: `backend/Campus_Feed_v1.postman_collection.json`
2. The collection includes auto-variable capture for tokens and IDs
3. Test flow:
   - Signup → Get `verify_token` from response
   - Verify → Use captured token
   - Login → Session cookie set automatically
   - Create/Edit/Delete posts
   - Add comments and reactions
   - Upload media

## 📁 Project Structure

```
campusfeed/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # App factory with SQLite config
│   │   ├── config.py            # Configuration from env
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── user.py          # User model with auth
│   │   │   ├── post.py          # Post & Media models
│   │   │   ├── comment.py       # Nested comment system
│   │   │   └── reaction.py      # Reaction model
│   │   ├── routes/              # API endpoints
│   │   │   ├── auth.py          # Auth routes
│   │   │   ├── posts.py         # Post CRUD with cascade delete
│   │   │   ├── comments.py      # Nested comments
│   │   │   ├── reactions.py     # Reactions system
│   │   │   └── media.py         # File uploads
│   │   └── extensions/          # Flask extensions
│   ├── uploads/                 # Media storage (created on first upload)
│   ├── requirements.txt         # Python dependencies
│   ├── backend_run.py           # Entry point
│   └── .env.example             # Config template
└── frontend/
    ├── app/
    │   ├── auth/
    │   │   ├── login/           # Login page
    │   │   ├── signup/          # Signup page
    │   │   └── verify/          # Email verification
    │   ├── posts/
    │   │   ├── create/          # Create post form
    │   │   └── [id]/
    │   │       ├── page.tsx     # Post detail with comments
    │   │       └── edit/        # Edit post form
    │   ├── layout.tsx           # Root layout with AuthProvider
    │   └── page.tsx             # Feed page with categories
    ├── components/
    │   ├── Navbar.tsx           # Navigation
    │   ├── CategoryFilter.tsx   # Category pills
    │   └── PostCard.tsx         # Post preview card
    ├── contexts/
    │   └── AuthContext.tsx      # Auth state management
    └── lib/
        └── api.ts               # Axios client with typed APIs
```

## 🔑 Key Implementation Details

### Cascade Delete
SQLite requires `PRAGMA foreign_keys=ON` to enforce constraints. We enable this via SQLAlchemy event listener in `app/__init__.py`:

```python
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()
```

Posts route also implements manual cascade delete to ensure cleanup of comments, reactions, and media.

### Nested Comments
Uses adjacency list (parent_id) + materialized path for efficient infinite nesting:
- `parent_id`: Points to direct parent comment
- `path`: String like "/1/5/12" for traversal
- `depth`: Calculated depth for UI rendering

### Email Verification (Dev Mode)
In development, the `signup` endpoint returns `token_debug` in the response. The frontend displays this with a clickable link to verify the account immediately without email infrastructure.

### Session Authentication
Backend uses Flask-Login with httpOnly session cookies. Frontend axios client has `withCredentials: true` to send cookies with every request.

## 🚦 Development Workflow

1. **Start Backend**: `cd backend && python backend_run.py`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Open Browser**: Navigate to `http://localhost:3000`
4. **Test Flow**:
   - Signup with `yourname@nitrkl.ac.in`
   - Click the verification link shown on signup success
   - Login with your credentials
   - Create a post with markdown and images
   - Comment and react to posts
   - Edit your posts

## 🐛 Known Issues & Limitations

- **No real email**: Uses token_debug in dev mode
- **Local storage**: Media stored on disk, not production-ready
- **No user profiles**: Can't view other users' posts
- **No media deletion**: Can't remove existing attachments when editing
- **No dark mode**: Only light theme available
- **Basic error handling**: Could be more user-friendly

## 🗺️ Roadmap

### v2 (Production Ready)
- Real email service (SendGrid/AWS SES)
- S3/cloud storage for media
- User profiles and avatars
- Notifications system
- Password reset
- Mobile responsive improvements

### v3 (Scale & Quality)
- Redis caching
- Advanced search (Elasticsearch)
- Content moderation
- Analytics dashboard
- Rate limiting per user
- Image optimization
- Dark mode

## 📝 API Endpoints

### Auth
- `POST /auth/signup` - Register with @nitrkl.ac.in email
- `GET /auth/verify?token=...` - Verify email
- `POST /auth/login` - Login with session cookie
- `POST /auth/logout` - Logout and clear session

### Posts
- `GET /posts?category=Events` - List posts with optional category filter
- `POST /posts` - Create post (title, content_md, category)
- `GET /posts/:id` - Get post with media
- `PATCH /posts/:id` - Edit post (sets edited_at)
- `DELETE /posts/:id` - Delete post with cascade

### Comments
- `GET /comments/post/:postId` - List comments for post
- `POST /comments/post/:postId` - Add comment (content, optional parent_id)
- `PATCH /comments/:id` - Edit comment
- `DELETE /comments/:id` - Delete comment

### Reactions
- `POST /reactions` - Add reaction (post_id or comment_id, type="like")
- `DELETE /reactions` - Remove reaction

### Media
- `POST /media/upload` - Upload file (requires post_id)
- `GET /uploads/:filename` - Serve uploaded file

## 🤝 Contributing

This is a college project for NIT Rourkela. Contributions are welcome!

## 📄 License

MIT License - Feel free to use for your college project!

## 🎓 Built For

**NIT Rourkela** - National Institute of Technology Rourkela

---

**Note**: This is v1 MVP using only free tools suitable for a college project. Production deployment requires additional configuration (environment variables, proper email service, cloud storage, etc.).
