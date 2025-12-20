import os
import sys
import random
import string
from datetime import datetime, timedelta

# Add parent dir to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.post import Post
from app.models.comment import Comment
from app.models.reaction import Reaction
from app.models.message import Message  # Assuming Message model exists, though not in imports above

# Constants
NUM_USERS = 50
NUM_POSTS = 100
REACTION_TYPES = ["like", "helpful", "funny", "insightful", "celebrate"]
CATEGORIES = ['Academics', 'Events', 'Clubs', 'Sports', 'Placements', 'General', 'Food', 'Housing']

def random_string(length=10):
    return ''.join(random.choices(string.ascii_letters, k=length))

def random_date(days_back=30):
    return datetime.utcnow() - timedelta(days=random.randint(0, days_back), hours=random.randint(0, 23), minutes=random.randint(0, 59))

def seed():
    app = create_app()
    with app.app_context():
        print("🌱 Seeding large dataset...")

        # 1. Clear interactions
        print("🗑️  Clearing old comments, reactions, and messages...")
        try:
            db.session.query(Reaction).delete()
            db.session.query(Comment).delete()
            # Try to clear messages if model exists
            try:
                from app.models.message import Message
                db.session.query(Message).delete()
            except Exception:
                pass
            db.session.commit()
            print("  ✓ Cleared interactions")
        except Exception as e:
            db.session.rollback()
            print(f"  ✗ Failed to clear interactions: {e}")
            return

        # 2. Create Users
        print(f"👤 Creating {NUM_USERS} users...")
        users = []
        for i in range(NUM_USERS):
            name = f"User_{random_string(5)}"
            email = f"user{i}_{random_string(4)}@nitrkl.ac.in"
            user = User(
                name=name,
                email=email.lower(),
                branch=random.choice(["CS", "EE", "ME", "CE", "BT"]),
                year=random.choice(["1st", "2nd", "3rd", "4th"]),
                bio=f"Bio for {name}",
                verified=True,
                role="user"
            )
            user.set_password("password")
            db.session.add(user)
            users.append(user)
        
        try:
            db.session.commit()
            # Reload users to get IDs
            users = User.query.filter(User.email.contains("@nitrkl.ac.in")).limit(NUM_USERS).all() # Just get the ones we made or all
            # Actually, let's just fetch all users to be safe including old ones
            users = User.query.all()
            print(f"  ✓ Total users in DB: {len(users)}")
        except Exception as e:
            print(f"  ✗ Failed to create users: {e}")
        
        if not users:
            print("No users found/created. Aborting.")
            return

        # 3. Create Posts
        print(f"📝 Creating {NUM_POSTS} posts...")
        posts = []
        for i in range(NUM_POSTS):
            user = random.choice(users)
            post = Post(
                user_id=user.id,
                title=f"Post Title {i} - {random_string(20)}",
                content_md=f"This is the content for post {i}. {random_string(50)}.\n\nMore content here.",
                content_html=f"<p>This is the content for post {i}. {random_string(50)}.</p><p>More content here.</p>",
                category=random.choice(CATEGORIES),
                created_at=random_date()
            )
            db.session.add(post)
            posts.append(post)
        
        try:
            db.session.commit()
            # Fetch all posts (old + new)
            posts = Post.query.all()
            print(f"  ✓ Total posts in DB: {len(posts)}")
        except Exception as e:
            print(f"  ✗ Failed to create posts: {e}")

        # 4. Create Comments & Reactions
        print("💬 Generating interactions...")
        
        # Reactions on posts
        reaction_count = 0
        for post in posts:
            # Random reactions
            num_reactions = random.randint(0, 20)
            reacting_users = random.sample(users, min(num_reactions, len(users)))
            for user in reacting_users:
                reaction = Reaction(
                    post_id=post.id,
                    user_id=user.id,
                    type=random.choice(REACTION_TYPES)
                )
                db.session.add(reaction)
                reaction_count += 1
        
        # Comments on posts
        comment_count = 0
        created_comments = []
        for post in posts:
            num_comments = random.randint(0, 10)
            commenting_users = random.choices(users, k=num_comments)
            for user in commenting_users:
                comment = Comment(
                    post_id=post.id,
                    user_id=user.id,
                    content=f"Comment on post {post.id} by {user.name}. {random_string(10)}",
                    created_at=post.created_at + timedelta(minutes=random.randint(1, 100))
                )
                db.session.add(comment)
                created_comments.append(comment)
                comment_count += 1
        
        db.session.commit() # Commit comments first to get IDs
        
        # Reactions on comments
        for comment in created_comments:
             if random.random() < 0.3: # 30% chance
                 user = random.choice(users)
                 reaction = Reaction(
                     comment_id=comment.id,
                     user_id=user.id,
                     type=random.choice(REACTION_TYPES)
                 )
                 db.session.add(reaction)
                 reaction_count += 1

        try:
            db.session.commit()
            print(f"  ✓ Added {reaction_count} reactions and {comment_count} comments")
        except Exception as e:
             print(f"  ✗ Failed to add interactions: {e}")

        print("\n✅ Database seeded successfully!")

if __name__ == "__main__":
    seed()
