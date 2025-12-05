# Quick Start Guide

Get CampusFeed running in 5 minutes!

## Prerequisites Check
```bash
# Check Python version (need 3.9+)
python3 --version

# Check Node.js version (need 18+)
node --version

# Check npm
npm --version
```

## 🚀 Quick Setup

### 1. Clone/Navigate to Project
```bash
cd /path/to/campusfeed
```

### 2. Backend Setup (Terminal 1)

```bash
# Go to backend
cd backend

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate     # Windows

# Install packages
pip install -r requirements.txt

# Setup config
cp .env.example .env

# Edit .env - change SECRET_KEY to any random string
# Example: SECRET_KEY=my-super-secret-key-12345

# Start server
python backend_run.py
```

✅ Backend running on `http://localhost:5000`

### 3. Frontend Setup (Terminal 2)

```bash
# Go to frontend (from project root)
cd frontend

# Install packages
npm install

# Start dev server
npm run dev
```

✅ Frontend running on `http://localhost:3000`

## 🎯 First Run Test

1. Open browser: `http://localhost:3000`
2. Click "Sign Up"
3. Register with: `test@nitrkl.ac.in` (must be @nitrkl.ac.in)
4. Copy the verification token shown
5. Click the verification link (or paste token in verify page)
6. Login with your credentials
7. Click "+ Create Post"
8. Write a post with markdown
9. Upload an image
10. Submit!

## 📧 Dev Mode Email

In development, signup returns a `token_debug` field. The UI shows a clickable verification link - no real email needed!

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process or use different port in backend_run.py
```

### Frontend won't start
```bash
# Check if port 3000 is in use
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Use different port
npm run dev -- -p 3001
```

### Can't upload files
- Check `backend/uploads/` directory is created
- Check file is under 10MB
- Check file type is PNG, JPEG, WebP, or PDF

### Login not persisting
- Check backend console for errors
- Ensure `withCredentials: true` in frontend/lib/api.ts
- Clear browser cookies and try again

## 🧪 Testing with Postman

```bash
# Import collection
backend/Campus_Feed_v1.postman_collection.json

# Test flow
1. Run "Signup" → See token_debug in response
2. Copy token and run "Verify Email"
3. Run "Login" → Cookie set automatically
4. Run "Create Post" → Copy post_id from response
5. Test all other endpoints
```

## 📂 Database Location

SQLite database is created at: `backend/campusfeed.db`

To reset everything:
```bash
cd backend
rm campusfeed.db
rm -rf uploads/
python backend_run.py  # Creates fresh DB
```

## 🎨 What to Try

### Markdown Examples
```markdown
# Heading
**Bold** and *italic*
- List item 1
- List item 2

[Link](https://nitrkl.ac.in)

`code inline`

\```
code block
\```
```

### Categories
- Events: College fests, workshops, seminars
- Announcements: Important notices
- Lost&Found: Missing items
- General: Everything else

### Comments
- Reply to any comment
- Nested replies go infinite
- Like comments and posts

## ⚡ Development Tips

### Backend Changes
```bash
# Just restart the server
python backend_run.py
```

### Frontend Changes
- Auto-reloads with Next.js dev server
- No restart needed

### Database Schema Changes
```bash
cd backend
rm campusfeed.db  # Drop DB
python backend_run.py  # Recreate with new schema
```

## 🎓 Next Steps

- Read full README.md for architecture details
- Check backend/app/routes/ for API logic
- Explore frontend/app/ for page components
- Review models in backend/app/models/
- Try editing posts and comments
- Test cascade delete (delete post with comments)

## 🆘 Need Help?

Common issues:
1. **"Module not found"** → Run `pip install -r requirements.txt` or `npm install`
2. **"Address already in use"** → Another process using port 5000 or 3000
3. **"Invalid email domain"** → Must use @nitrkl.ac.in email
4. **Login fails** → Check if account is verified
5. **Upload fails** → Check file size and type

---

Happy coding! 🚀 Built for NIT Rourkela students.
