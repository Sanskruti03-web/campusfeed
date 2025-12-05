import os
import sys
import requests
from datetime import datetime, timedelta
from uuid import uuid4
import random

# Add the parent directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.post import Post, Media
from app.models.comment import Comment
from app.models.reaction import Reaction

# Sample images from Lorem Picsum (random placeholder images)
SAMPLE_IMAGES = [
    "https://picsum.photos/800/600?random=1",
    "https://picsum.photos/800/600?random=2",
    "https://picsum.photos/800/600?random=3",
    "https://picsum.photos/800/600?random=4",
    "https://picsum.photos/800/600?random=5",
    "https://picsum.photos/800/600?random=6",
    "https://picsum.photos/800/600?random=7",
    "https://picsum.photos/800/600?random=8",
    "https://picsum.photos/800/600?random=9",
    "https://picsum.photos/800/600?random=10",
]

REACTION_TYPES = ['like', 'helpful', 'funny', 'insightful', 'celebrate']

CATEGORIES = ['Academics', 'Events', 'Clubs', 'Sports', 'Placements', 'General', 'Announcements', 'Food', 'Housing']

def download_image(url, upload_folder):
    """Download image from URL and save to uploads folder"""
    try:
        print(f"  Downloading image from {url}...")
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            filename = f"{uuid4().hex}.jpg"
            filepath = os.path.join(upload_folder, filename)
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            print(f"  ✓ Saved as {filename}")
            return f"/uploads/{filename}", len(response.content)
        else:
            print(f"  ✗ Failed to download (status {response.status_code})")
            return None, 0
    except Exception as e:
        print(f"  ✗ Error downloading image: {e}")
        return None, 0

def create_users():
    """Create test users"""
    print("\n📝 Creating test users...")
    
    users_data = [
        {
            "email": "test1@nitrkl.ac.in",
            "name": "test1",
            "password": "12345678",
            "branch": "Computer Science",
            "year": "3rd Year",
            "bio": "Coding enthusiast | Open source contributor | Hackathon winner 🏆"
        },
        {
            "email": "test2@nitrkl.ac.in",
            "name": "test2",
            "password": "12345678",
            "branch": "Electronics",
            "year": "2nd Year",
            "bio": "Robotics club member | IoT projects | Tech blogger 📱"
        },
        {
            "email": "test3@nitrkl.ac.in",
            "name": "test3",
            "password": "12345678",
            "branch": "Mechanical",
            "year": "4th Year",
            "bio": "Placement coordinator | Formula racing team | Fitness enthusiast 💪"
        }
    ]
    
    users = []
    for data in users_data:
        user = User(
            email=data["email"],
            name=data["name"],
            branch=data.get("branch"),
            year=data.get("year"),
            bio=data.get("bio"),
            verified=True,
            role="user"
        )
        user.set_password(data["password"])
        db.session.add(user)
        users.append(user)
        print(f"  ✓ Created user: {data['name']} ({data['email']})")
    
    db.session.commit()
    print(f"\n✅ Created {len(users)} users")
    return users

def create_posts(users, upload_folder):
    """Create posts with images for each user"""
    print("\n📝 Creating posts with images...")
    
    posts_data = [
        # test1's posts
        {
            "user": 0,
            "title": "Amazing Hackathon Experience at Smart India Hackathon 2025! 🎉",
            "content": "Just finished an incredible 36-hour coding marathon at SIH 2025! Our team built an AI-powered campus navigation system. We secured **2nd place** nationwide! 🏆\n\nKey learnings:\n- Team coordination is crucial\n- Sleep is optional (kidding!)\n- Never underestimate the power of coffee ☕\n\nThanks to all teammates for the amazing experience!",
            "category": "Events",
            "image": 0
        },
        {
            "user": 0,
            "title": "Best Resources for Learning Web Development in 2025",
            "content": "Hey everyone! After 2 years of web dev journey, here are my **top recommendations**:\n\n**Frontend:**\n- React Documentation (new docs are amazing!)\n- Josh Comeau's CSS course\n- Frontend Masters\n\n**Backend:**\n- Node.js official guides\n- Fireship's quick tutorials\n- FreeCodeCamp\n\n**Full Stack:**\n- The Odin Project\n- Full Stack Open (University of Helsinki)\n\nWhat are your favorites? Drop them in comments! 👇",
            "category": "Academics",
            "image": 1
        },
        {
            "user": 0,
            "title": "Hostel Night Canteen Opens Till 2 AM Now! 🌙",
            "content": "Great news for all night owls! 🦉\n\nThe hostel canteen has extended its hours and will now be open until **2 AM** on weekdays and **3 AM** on weekends!\n\nMenu highlights:\n- Maggi (of course!)\n- Sandwiches\n- Tea/Coffee\n- Snacks\n\nPerfect for those late-night study sessions or project deadlines! 📚",
            "category": "Food",
            "image": 2
        },
        {
            "user": 0,
            "title": "Inter-Hostel Coding Competition - Register Now! 💻",
            "content": "Calling all coders! 📢\n\n**Inter-Hostel Coding Championship**\n\n📅 **Date:** Next Saturday\n⏰ **Duration:** 3 hours\n🏆 **Prizes:** Worth ₹50,000\n\n**Format:**\n- Individual participation\n- 5 algorithmic problems\n- Real-time leaderboard\n\n**Registration:** Link in bio\n**Deadline:** This Friday\n\nLet's see which hostel has the best coders! 🔥",
            "category": "Events",
            "image": 3
        },
        
        # test2's posts
        {
            "user": 1,
            "title": "Robotics Workshop: Build Your First Arduino Robot 🤖",
            "content": "**Robotics Club is organizing a hands-on Arduino workshop!**\n\n📅 **Date:** December 15-16, 2025\n⏰ **Time:** 10 AM - 5 PM\n📍 **Venue:** Electronics Lab, EE Department\n\n**What you'll learn:**\n- Arduino basics and programming\n- Sensor integration\n- Motor control\n- Build a line-following robot!\n\n**Registration:** Limited to 30 participants. First come, first served!\n\nInterested? Drop a comment below! 👇",
            "category": "Clubs",
            "image": 4
        },
        {
            "user": 1,
            "title": "Smart Home Automation Project - Need Team Members!",
            "content": "Working on an **IoT-based smart home automation system** for my minor project. Looking for passionate teammates!\n\n**Requirements:**\n- Knowledge of ESP32/Arduino\n- Basic Python skills\n- Interest in IoT\n\n**Project Goals:**\n- Voice-controlled devices\n- Mobile app interface\n- Energy monitoring\n- Security features\n\nDM me if interested! Let's build something amazing together! 💡",
            "category": "Academics",
            "image": 5
        },
        {
            "user": 1,
            "title": "Best Cafes Near Campus for Study Sessions ☕",
            "content": "Discovered some amazing cafes perfect for study sessions! Here's my ranking:\n\n**1. Coffee Culture** ⭐⭐⭐⭐⭐\n- Great wifi\n- Comfortable seating\n- Affordable\n\n**2. Brew & Books** ⭐⭐⭐⭐\n- Quiet atmosphere\n- Good food\n- Power outlets everywhere\n\n**3. Campus Beans** ⭐⭐⭐⭐\n- Close to campus\n- Student discounts\n- Late hours\n\nWhich one is your favorite? 🤔",
            "category": "Food",
            "image": 6
        },
        {
            "user": 1,
            "title": "Lost and Found: Black Backpack Near Library",
            "content": "**FOUND:** Black backpack near the Central Library yesterday evening.\n\nContains:\n- Notebooks\n- Calculator\n- Water bottle\n\nIf it's yours, please DM me with additional details to verify ownership.\n\nLet's help our fellow student! 🙏",
            "category": "General",
            "image": None
        },
        
        # test3's posts
        {
            "user": 2,
            "title": "Placement Season Tips: How I Got Offers from 3 Product Companies 🎯",
            "content": "Just concluded my placement season with offers from Google, Microsoft, and Amazon! Here's what worked for me:\n\n**Preparation (6 months before):**\n- 300+ LeetCode problems\n- System design fundamentals\n- Mock interviews every week\n\n**During interviews:**\n- Think out loud\n- Ask clarifying questions\n- Don't rush to code\n\n**Key Resources:**\n- NeetCode roadmap\n- System Design Primer\n- Pramp for mock interviews\n\nHappy to answer questions! AMA in comments 👇",
            "category": "Placements",
            "image": 7
        },
        {
            "user": 2,
            "title": "Formula Racing Team Wins National Championship! 🏎️🏆",
            "content": "**HUGE NEWS!** 🎉\n\nOur NIT Rourkela Formula Racing Team just won the **National Formula Racing Championship 2025!**\n\nAfter months of:\n- Late night debugging\n- Countless design iterations\n- Team coordination\n- Testing and retesting\n\nWe finally did it! This victory belongs to every team member who believed in our vision.\n\n**Special thanks to:**\n- Our faculty advisors\n- Sponsoring companies\n- Supporting students\n\nProud moment for NITR! 💪🔥",
            "category": "Sports",
            "image": 8
        },
        {
            "user": 2,
            "title": "Gym Membership Available - Hostel Fitness Center",
            "content": "The hostel gym is now accepting memberships for the winter semester!\n\n**Facilities:**\n- Modern equipment\n- Cardio machines\n- Free weights\n- Dedicated trainer\n\n**Timings:** 6 AM - 10 PM\n**Fees:** ₹1500/semester\n\n**Benefits:**\n- Structured workout plans\n- Diet consultation\n- Group fitness classes\n\nStay fit, stay healthy! 💪 Contact hostel office for registration.",
            "category": "General",
            "image": 9
        },
        {
            "user": 2,
            "title": "Room Available for Rent - Off Campus Housing",
            "content": "**Single room available** in a 2BHK apartment near campus!\n\n**Details:**\n- 10 min walk to main gate\n- Fully furnished\n- WiFi included\n- Separate kitchen\n\n**Rent:** ₹6000/month (negotiable)\n**Available from:** January 2026\n\n**Preferred:** Final year student\n\nSerious inquiries only. Contact for more details! 🏠",
            "category": "Housing",
            "image": None
        }
    ]
    
    posts = []
    for i, data in enumerate(posts_data):
        print(f"\n  Creating post {i+1}/{len(posts_data)}: {data['title'][:50]}...")
        
        # Create post
        post = Post(
            user_id=users[data["user"]].id,
            title=data["title"],
            content_md=data["content"],
            content_html=data["content"],  # In real app, this would be rendered markdown
            category=data["category"],
            created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30))
        )
        db.session.add(post)
        db.session.flush()  # Get the post ID
        
        # Add image if specified
        if data["image"] is not None:
            image_url = SAMPLE_IMAGES[data["image"]]
            image_path, size = download_image(image_url, upload_folder)
            
            if image_path:
                media = Media(
                    post_id=post.id,
                    type="image",
                    url=image_path,
                    mime="image/jpeg",
                    size_bytes=size
                )
                db.session.add(media)
        
        posts.append(post)
    
    db.session.commit()
    print(f"\n✅ Created {len(posts)} posts with images")
    return posts

def create_comments(users, posts):
    """Create comments on posts"""
    print("\n📝 Creating comments...")
    
    comments_data = [
        # Comments on test1's hackathon post (post 0)
        {"post": 0, "user": 1, "content": "Congratulations! 🎉 Your hard work paid off!", "parent": None},
        {"post": 0, "user": 2, "content": "Amazing achievement! Which tech stack did you use?", "parent": None},
        {"post": 0, "user": 0, "content": "Thanks! We used React + Flask + TensorFlow 🚀", "parent": 1},
        {"post": 0, "user": 1, "content": "That's impressive! Would love to see a demo sometime.", "parent": 2},
        
        # Comments on web dev resources post (post 1)
        {"post": 1, "user": 1, "content": "Great list! I'd also recommend Kyle Cook's Web Dev Simplified channel", "parent": None},
        {"post": 1, "user": 2, "content": "Saved this post! Starting web dev next semester 📚", "parent": None},
        {"post": 1, "user": 0, "content": "Good addition! His tutorials are really beginner-friendly", "parent": 4},
        
        # Comments on canteen timing post (post 2)
        {"post": 2, "user": 1, "content": "Finally! This is what we needed 🙌", "parent": None},
        {"post": 2, "user": 2, "content": "RIP my diet plan 😂 But seriously, this is great!", "parent": None},
        {"post": 2, "user": 0, "content": "Haha! Everything in moderation 😄", "parent": 8},
        
        # Comments on coding competition (post 3)
        {"post": 3, "user": 1, "content": "Registered! Let's see who wins 😎", "parent": None},
        {"post": 3, "user": 2, "content": "Challenge accepted! May the best coder win 💪", "parent": None},
        {"post": 3, "user": 0, "content": "Good luck everyone! 🔥", "parent": 10},
        
        # Comments on robotics workshop (post 4)
        {"post": 4, "user": 0, "content": "Interested! How do we register?", "parent": None},
        {"post": 4, "user": 2, "content": "Count me in! Always wanted to learn Arduino", "parent": None},
        {"post": 4, "user": 1, "content": "Registration link will be shared in the Robotics Club WhatsApp group!", "parent": 13},
        
        # Comments on IoT project (post 5)
        {"post": 5, "user": 0, "content": "This sounds exciting! I have experience with ESP32", "parent": None},
        {"post": 5, "user": 2, "content": "I can help with the mobile app development!", "parent": None},
        {"post": 5, "user": 1, "content": "Perfect! Let's connect tomorrow to discuss 🤝", "parent": 16},
        
        # Comments on cafe recommendations (post 6)
        {"post": 6, "user": 0, "content": "Coffee Culture is my favorite too! ☕", "parent": None},
        {"post": 6, "user": 2, "content": "Brew & Books has the best ambiance though", "parent": None},
        {"post": 6, "user": 1, "content": "You should try their cheesecake at Brew & Books! 🍰", "parent": 19},
        
        # Comments on lost and found (post 7)
        {"post": 7, "user": 0, "content": "Good deed! Hope the owner finds it soon 🙏", "parent": None},
        {"post": 7, "user": 2, "content": "This might be my friend's. Let me check with him.", "parent": None},
        
        # Comments on placement tips (post 8)
        {"post": 8, "user": 0, "content": "Congratulations! 🎉 How many hours did you study daily?", "parent": None},
        {"post": 8, "user": 1, "content": "Amazing! Did you do any competitive programming?", "parent": None},
        {"post": 8, "user": 2, "content": "Thanks! I studied 4-5 hours daily. Yes, CP helped a lot with problem-solving!", "parent": 23},
        
        # Comments on racing championship (post 9)
        {"post": 9, "user": 0, "content": "Unbelievable achievement! Proud of you guys! 🏆", "parent": None},
        {"post": 9, "user": 1, "content": "This is HUGE! Congratulations to the entire team! 🎉", "parent": None},
        {"post": 9, "user": 2, "content": "Thank you so much! Your support means everything! ❤️", "parent": 25},
        
        # Comments on gym membership (post 10)
        {"post": 10, "user": 0, "content": "Is personal training included in the fees?", "parent": None},
        {"post": 10, "user": 1, "content": "Are there any yoga classes available?", "parent": None},
        {"post": 10, "user": 2, "content": "Yes, basic training is included. Yoga classes on weekends!", "parent": 27},
        
        # Comments on housing (post 11)
        {"post": 11, "user": 0, "content": "Is parking available?", "parent": None},
        {"post": 11, "user": 1, "content": "Interested! Can I visit this weekend?", "parent": None},
        {"post": 11, "user": 2, "content": "Yes, there's parking. Sure, DM me to schedule a visit! 🏠", "parent": 29},
    ]
    
    comments = []
    for data in comments_data:
        parent_comment = comments[data["parent"]] if data["parent"] is not None else None
        
        comment = Comment(
            post_id=posts[data["post"]].id,
            parent_id=parent_comment.id if parent_comment else None,
            user_id=users[data["user"]].id,
            content=data["content"],
            depth=parent_comment.depth + 1 if parent_comment else 0,
            created_at=datetime.utcnow() - timedelta(days=random.randint(0, 10), hours=random.randint(0, 23))
        )
        db.session.add(comment)
        db.session.flush()
        
        # Set path after getting ID
        if parent_comment:
            comment.path = f"{parent_comment.path}.{comment.id}"
        else:
            comment.path = str(comment.id)
        
        comments.append(comment)
    
    db.session.commit()
    print(f"  ✓ Created {len(comments)} comments (including nested replies)")
    return comments

def create_reactions(users, posts, comments):
    """Create reactions on posts and comments"""
    print("\n📝 Creating reactions...")
    
    reaction_count = 0
    
    # Each user reacts to multiple posts
    for post in posts:
        for user in users:
            # Don't react to own posts always, but sometimes do
            if post.user_id == user.id and random.random() > 0.3:
                continue
            
            # 70% chance to react to a post
            if random.random() < 0.7:
                reaction_type = random.choice(REACTION_TYPES)
                reaction = Reaction(
                    post_id=post.id,
                    user_id=user.id,
                    type=reaction_type
                )
                db.session.add(reaction)
                reaction_count += 1
    
    # React to some comments
    for comment in comments:
        for user in users:
            # Don't react to own comments
            if comment.user_id == user.id:
                continue
            
            # 40% chance to react to a comment
            if random.random() < 0.4:
                reaction_type = random.choice(REACTION_TYPES)
                reaction = Reaction(
                    comment_id=comment.id,
                    user_id=user.id,
                    type=reaction_type
                )
                db.session.add(reaction)
                reaction_count += 1
    
    db.session.commit()
    print(f"  ✓ Created {reaction_count} reactions")

def main():
    """Main seeding function"""
    print("\n" + "="*60)
    print("🌱 SEEDING CAMPUS FEED DATABASE")
    print("="*60)
    
    app = create_app()
    upload_folder = app.config.get('UPLOAD_FOLDER', 'uploads')
    
    # Make upload folder path absolute
    if not os.path.isabs(upload_folder):
        upload_folder = os.path.join(os.path.dirname(__file__), upload_folder)
    
    # Ensure upload folder exists
    os.makedirs(upload_folder, exist_ok=True)
    
    with app.app_context():
        # Ask for confirmation
        print("\n⚠️  WARNING: This will clear all existing data!")
        response = input("Do you want to continue? (yes/no): ")
        
        if response.lower() != 'yes':
            print("❌ Seeding cancelled.")
            return
        
        # Clear existing data
        print("\n🗑️  Clearing existing data...")
        db.drop_all()
        db.create_all()
        print("  ✓ Database reset complete")
        
        # Seed data
        users = create_users()
        posts = create_posts(users, upload_folder)
        comments = create_comments(users, posts)
        create_reactions(users, posts, comments)
        
        # Print summary
        print("\n" + "="*60)
        print("✅ DATABASE SEEDING COMPLETE!")
        print("="*60)
        print(f"\n📊 Summary:")
        print(f"  - Users: {len(users)}")
        print(f"  - Posts: {len(posts)}")
        print(f"  - Comments: {len(comments)}")
        
        print(f"\n🔐 Login credentials (all users):")
        for user in users:
            print(f"  - {user.email} / 12345678")
        
        print("\n🚀 You can now start the backend server and explore the app!")
        print("="*60 + "\n")

if __name__ == "__main__":
    main()
