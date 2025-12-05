# Campus Feed Backend (v1)

Free-only Flask backend starting on SQLite/MySQL for NIT Rourkela campus feed.

## Features
- ✅ Domain-restricted signup (`@nitrkl.ac.in`)
- ✅ Email verification with tokens
- ✅ Posts with categories (Events, Announcements, Lost&Found, General)
- ✅ Edit/delete posts (owner-only)
- ✅ Nested comments (infinite depth, Reddit-style)
- ✅ Reactions (like/unlike on posts & comments)
- ✅ Local media uploads (images & documents)

## Setup

```zsh
# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Configure environment (copy and edit .env.example)
cp backend/.env.example backend/.env
# Edit .env with your settings

# Run the server
python backend/backend_run.py
```

Server runs on `http://localhost:5000`

## API Endpoints (v1)

### Auth
- `POST /auth/signup` - Register with college email
- `GET /auth/verify?token=...` - Verify email
- `POST /auth/login` - Login (requires verified email)
- `POST /auth/logout` - Logout

### Posts
- `GET /posts?category=Events` - List posts (optional category filter)
- `POST /posts` - Create post (auth required)
- `GET /posts/{id}` - Get post details with media
- `PATCH /posts/{id}` - Edit post (owner only)
- `DELETE /posts/{id}` - Soft delete post (owner only)

### Comments
- `GET /comments/post/{post_id}` - List top-level comments
- `POST /comments/post/{post_id}` - Add comment (optional `parent_id` for replies)
- `PATCH /comments/{id}` - Edit comment (owner only)
- `DELETE /comments/{id}` - Soft delete comment (owner only)

### Reactions
- `POST /reactions` - Add reaction (`post_id` or `comment_id`, `type`)
- `DELETE /reactions` - Remove reaction

### Media
- `POST /media/upload` - Upload file (form-data: `file` + `post_id`)
- `GET /uploads/{filename}` - Serve uploaded files (dev only)

### Health
- `GET /healthz` - Health check

## Testing with Postman

1. Import the collection:
   - File: `Campus_Feed_v1.postman_collection.json`
   - In Postman: Import → Upload Files → Select the JSON file

2. Test flow:
   - Run **Signup** → saves `verify_token` automatically
   - Run **Verify Email** → uses saved token
   - Run **Login** → establishes session
   - Run **Create Post** → saves `post_id` automatically
   - Run **Add Comment** → saves `comment_id` automatically
   - Try **Edit Post**, **Upload Media**, **Add Reaction**

3. Collection variables:
   - `base_url`: `http://localhost:5000` (auto-set)
   - `verify_token`: Auto-captured from signup
   - `post_id`: Auto-captured from create post
   - `comment_id`: Auto-captured from add comment

## Database

**Default**: SQLite (`campusfeed.db` in backend folder)

**Switch to MySQL**:
```zsh
# Install MySQL
brew install mysql
brew services start mysql

# Update .env
DATABASE_URL=mysql+pymysql://root:@127.0.0.1/campusfeed

# Create database
mysql -u root -e "CREATE DATABASE campusfeed;"
```

## Categories

Posts support these categories:
- Events
- Announcements
- Lost & Found
- General
- Academic
- Campus Life

## Notes

- **Email sending**: Currently stubbed for dev; `token_debug` returned in signup response. For production, integrate Resend/Postmark.
- **Sessions**: Uses Flask-Login with server-side sessions (cookies). For SPA/mobile, migrate to JWT in v2.
- **Rate limits**: In-memory limits (5/hour signup, 10/min login, 20/min posts). Use Redis in production.
- **Uploads**: Dev serves from `/uploads/<filename>`. In production, migrate to Cloudflare R2 + CDN.
- **Edit history**: v1 updates `edited_at`; v2 adds `post_edits` table for version history.

## Migration to Postgres (v2)

When ready for production:
1. Update `DATABASE_URL` to Postgres connection string
2. Run migrations (schema is portable via SQLAlchemy)
3. Add Postgres-specific features (FTS, JSONB, performance indexes)

## Next Steps (v2 Roadmap)

- Background jobs (Celery/RQ) for emails & thumbnails
- Redis for rate limiting & caching
- Cloudflare R2 for media storage + CDN
- Notification system (in-app + email)
- Moderation dashboard
- Cursor pagination for feeds
- Edit history with diffs
