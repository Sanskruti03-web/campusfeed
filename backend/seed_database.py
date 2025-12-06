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
    """Create 50-70 posts with images for each user"""
    print("\n📝 Creating 50-70 posts with images...")
    
    posts_data = [
        # test1's posts (Academics & Events focused)
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
        {"user": 0, "title": "Python Tips and Tricks - List Comprehensions 🐍", "content": "One of the most powerful Python features is list comprehensions!\n\n**Before:**\n```python\nsquares = []\nfor i in range(10):\n    squares.append(i**2)\n```\n\n**After:**\n```python\nsquares = [i**2 for i in range(10)]\n```\n\nMuch cleaner! You can also add conditions:\n```python\neven_squares = [i**2 for i in range(10) if i % 2 == 0]\n```\n\nSave this tip for your next project! 📌", "category": "Academics", "image": None},
        {"user": 0, "title": "Data Structures Interview Prep - Trees 🌳", "content": "Preparing for placements? Here's a quick crash course on Trees!\n\n**Key Concepts:**\n1. **BST Operations:** Insertion, Deletion, Search O(log n)\n2. **Traversals:** Inorder, Preorder, Postorder\n3. **Balanced Trees:** AVL, Red-Black Trees\n4. **LCA:** Lowest Common Ancestor\n\n**Must Know Problems:**\n- Validate BST\n- Invert Binary Tree\n- Path Sum\n- Level Order Traversal\n\nDM me if you need solutions! 💪", "category": "Academics", "image": None},
        {"user": 0, "title": "CSS Grid vs Flexbox - When to Use Each? 🎨", "content": "Still confused between Grid and Flexbox? Let me clarify!\n\n**Flexbox:**\n- 1D layout (rows OR columns)\n- Great for navigation bars\n- Perfect for spacing items\n- Use when arranging items in a line\n\n**CSS Grid:**\n- 2D layout (rows AND columns)\n- Ideal for page layouts\n- Great for complex designs\n- Use when you need both horizontal and vertical alignment\n\n**Pro Tip:** Use both together! 🚀\n\nExample:\n- Grid for main layout\n- Flexbox for component internals", "category": "Academics", "image": None},
        {"user": 0, "title": "Database Normalization - ACID vs BASE 📊", "content": "Understanding database principles is crucial!\n\n**ACID (SQL Databases):**\n- Atomicity: All or nothing\n- Consistency: Valid state\n- Isolation: No conflicts\n- Durability: Permanent\n\n**BASE (NoSQL Databases):**\n- Basically Available\n- Soft state\n- Eventually consistent\n\n**When to use what?**\n- **SQL:** Financial systems, banking\n- **NoSQL:** Social media, real-time data\n\nBoth have their place! 🏛️", "category": "Academics", "image": None},
        {"user": 0, "title": "TechTalk Series - Machine Learning Fundamentals", "content": "Excited to announce the TechTalk series!\n\n📅 **Schedule:**\n- Week 1: ML Basics (Supervised vs Unsupervised)\n- Week 2: Feature Engineering\n- Week 3: Model Evaluation\n- Week 4: Real-world projects\n\n🎯 **Target Audience:** Beginners to intermediate\n⏰ **Duration:** 1 hour per session\n📍 **Venue:** A-105 Conference Room\n\nFree for all! Register in comments! 🚀", "category": "Events", "image": None},
        {"user": 0, "title": "Open Source Contribution Guide for Beginners 💻", "content": "Want to contribute to open source but don't know where to start?\n\n**Step 1:** Find a beginner-friendly project\n- Check GitHub's 'good first issue' label\n- Look at projects with good documentation\n\n**Step 2:** Read the CONTRIBUTING.md\n**Step 3:** Start small - fix docs or small bugs\n**Step 4:** Make your first PR!\n\n**Best projects for beginners:**\n- First Timers Only\n- Awesome for Beginners\n- Good First Issue label\n\nDon't be afraid to ask for help! 🤝", "category": "Academics", "image": None},

        # test2's posts (Clubs & Events focused)
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
        {"user": 1, "title": "Electronics Club Meetup - Soldering Workshop 🔧", "content": "**Free soldering workshop for all interested members!**\n\n📍 **Venue:** Electronics Lab\n📅 **Date:** Next Sunday\n⏰ **Time:** 2 PM onwards\n\n**What to bring:** Your own components (optional)\n**What we provide:** Soldering iron, solder, practice boards\n\n**Topics:**\n- Proper soldering technique\n- PCB design basics\n- Component identification\n- Circuit building\n\nNo prior experience needed! 🎓", "category": "Clubs", "image": None},
        {"user": 1, "title": "IoT Project Showcase - Submit Your Projects! 🌟", "content": "Calling all IoT enthusiasts!\n\n**IoT Project Showcase** - A platform to display your projects\n\n📋 **Categories:**\n1. Smart Home\n2. Agriculture Tech\n3. Health & Wellness\n4. Environmental Monitoring\n5. Creative IoT\n\n🏆 **Prizes:**\n- 1st: ₹10,000\n- 2nd: ₹7,000\n- 3rd: ₹5,000\n\n📅 **Deadline:** December 31, 2025\n✉️ **Submit:** robotics.club@nitr.ac.in\n\nLet's showcase your innovation! 🚀", "category": "Clubs", "image": None},
        {"user": 1, "title": "Embedded Systems Bootcamp - 2 Week Intensive 💪", "content": "**Embedded Systems Bootcamp**\n\nLearn to build real-world embedded systems!\n\n📚 **Curriculum:**\n- Week 1: Microcontroller basics\n- Week 2: Real-time applications\n\n**Topics covered:**\n- ARM Cortex architecture\n- Interrupts and timers\n- Communication protocols (UART, SPI, I2C)\n- Real-time OS basics\n\n👥 **Limited to:** 25 participants\n📍 **Venue:** Electronics Lab\n💰 **Fee:** ₹500 (includes materials)\n\nRegister now! 🎯", "category": "Clubs", "image": None},
        {"user": 1, "title": "Drone Racing Competition 2025 - Register Now! 🚁", "content": "🎬 **NITR Drone Racing Championship 2025**\n\nAre you ready for the most exciting aerial competition?\n\n📋 **Competition Details:**\n- Team size: 2-3 members\n- Drone specs: Pre-approved models\n- Multiple categories: Speed, Obstacle, Endurance\n\n🏆 **Prize Pool:** ₹1,00,000\n📅 **Date:** January 15-16, 2026\n📍 **Venue:** Sports ground\n\n⚡ **Registration Fee:** ₹2000/team\n**Deadline:** December 20, 2025\n\nLet's fly! 🚀", "category": "Events", "image": None},

        # test3's posts (Placements & General focused)
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
        {"user": 2, "title": "Campus Placement Drive - TCS Hiring 500+ Candidates! 💼", "content": "**TCS CAMPUS RECRUITMENT DRIVE**\n\n📍 **Date:** December 18, 2025\n⏰ **Time:** 9 AM onwards\n📍 **Venue:** Central Auditorium\n\n👥 **Roles:**\n- Software Developer\n- Systems Engineer\n- Data Analyst\n- Infrastructure Engineer\n\n💰 **CTC:** 4.5 - 6 LPA\n📋 **Eligibility:** 60% CGPA, no active backlogs\n\n**Selection Process:**\n1. Online Assessment (1 hour)\n2. Technical Round\n3. HR Round\n\nMake sure you're prepared! Good luck everyone! 🚀", "category": "Placements", "image": None},
        {"user": 2, "title": "Amazon SDE Interview Experience 💻", "content": "Just had my Amazon SDE2 interview. Here's what to expect:\n\n**Round 1 - Online Assessment (2 hours):**\n- 2 coding problems (medium difficulty)\n- Must solve both for interview call\n\n**Round 2 - Technical Round 1 (60 mins):**\n- 1 coding problem + follow-ups\n- System design discussion\n- Code walkthrough\n\n**Round 3 - Technical Round 2 (60 mins):**\n- Another coding problem\n- Design patterns discussion\n\n**Tips:**\n- Think aloud throughout\n- Ask clarifying questions\n- Discuss tradeoffs\n- Practice mock interviews\n\nHappy to mentor anyone preparing! 🤝", "category": "Placements", "image": None},
        {"user": 2, "title": "NVIDIA Campus Recruitment - AI/ML Roles Available! 🤖", "content": "**NVIDIA Campus Drive**\n\n🎯 **Hiring for:**\n- AI/ML Engineer\n- CUDA Developer\n- Computer Vision Engineer\n- Deep Learning Researcher\n\n💼 **Perks:**\n- Competitive salary\n- Free GPU access for research\n- International conference travel\n- Relocation assistance\n\n📅 **Timeline:**\n- Registrations: Open until Dec 15\n- Interviews: Dec 20-22\n\n⚡ **Eligibility:** 7.5+ CGPA (or demonstrate strong projects)\n\nThis is a rare opportunity! Apply now! 🔥", "category": "Placements", "image": None},
        {"user": 2, "title": "Internship Success Stories - Summer 2025 🌟", "content": "Congratulations to all students who secured amazing internships!\n\n**Breakdown:**\n- 45 students at product companies\n- 32 students at startups\n- 28 students at research labs\n- 15 students at international companies\n\n**Top picks:**\n- Google: 8 interns\n- Microsoft: 6 interns\n- Goldman Sachs: 4 interns\n- DeepMind: 3 interns\n\n**Median Stipend:** ₹1,25,000/month\n\nProud of everyone! Can't wait to hear your experiences! 🎉", "category": "Placements", "image": None},
        {"user": 2, "title": "Lost: Blue Water Bottle - Hostel 4 🚨", "content": "Lost my favorite blue water bottle somewhere near Hostel 4 yesterday evening.\n\n**Description:**\n- Color: Royal blue\n- Size: 750ml\n- Brand: Hydro Flask\n- Contains: My name on sticker\n\nIf you find it, please contact me or leave it at the Hostel office.\n\nReward offered! 🙏", "category": "General", "image": None},
        {"user": 2, "title": "Fitness Challenge 2026 - Join Now! 💪", "content": "**New Year Fitness Challenge**\n\nLet's get fit together!\n\n📋 **Challenge Details:**\n- Duration: Jan 1 - Mar 31, 2026\n- Track: Steps, workouts, diet\n- Groups: Running, strength, yoga\n\n🏆 **Prizes:**\n- Gym membership (3 months)\n- Fitness tracker\n- Nutrition plan\n\n👥 **Current Members:** 150+\n\n**Join our WhatsApp group:** [Link in comments]\n\nNo zero days! 🔥", "category": "General", "image": None},

        # Additional diverse posts from all users
        {"user": 0, "title": "Hostel Night Canteen Opens Till 2 AM Now! 🌙", "content": "Great news for all night owls! 🦉\n\nThe hostel canteen has extended its hours and will now be open until **2 AM** on weekdays and **3 AM** on weekends!\n\nMenu highlights:\n- Maggi (of course!)\n- Sandwiches\n- Tea/Coffee\n- Snacks\n\nPerfect for those late-night study sessions or project deadlines! 📚", "category": "Food", "image": 2},
        {"user": 1, "title": "Best Cafes Near Campus for Study Sessions ☕", "content": "Discovered some amazing cafes perfect for study sessions! Here's my ranking:\n\n**1. Coffee Culture** ⭐⭐⭐⭐⭐\n- Great wifi\n- Comfortable seating\n- Affordable\n\n**2. Brew & Books** ⭐⭐⭐⭐\n- Quiet atmosphere\n- Good food\n- Power outlets everywhere\n\n**3. Campus Beans** ⭐⭐⭐⭐\n- Close to campus\n- Student discounts\n- Late hours\n\nWhich one is your favorite? 🤔", "category": "Food", "image": 6},
        {"user": 2, "title": "Hostel Mess Menu - Week of Dec 6-12 🍽️", "content": "**Weekly Mess Menu**\n\n**Monday:** Rajma-Rice, Dal Makhani\n**Tuesday:** Chicken Curry, Rotli\n**Wednesday:** Paneer Tikka, Basmati Rice\n**Thursday:** Fish Fry, Jeera Rice\n**Friday:** Chole Bhature, Pickle\n**Saturday:** Biryani (Special! 🌟)\n**Sunday:** Takeaway from mess or order outside\n\n⏰ **Meal Timings:**\n- Breakfast: 7-9 AM\n- Lunch: 12-2 PM\n- Dinner: 6-8 PM\n- Late dinner: 8-9:30 PM\n\nEnjoy your meals! 😋", "category": "Food", "image": None},
        {"user": 0, "title": "Room Available for Rent - Off Campus Housing", "content": "**Single room available** in a 2BHK apartment near campus!\n\n**Details:**\n- 10 min walk to main gate\n- Fully furnished\n- WiFi included\n- Separate kitchen\n\n**Rent:** ₹6000/month (negotiable)\n**Available from:** January 2026\n\n**Preferred:** Final year student\n\nSerious inquiries only. Contact for more details! 🏠", "category": "Hostel", "image": None},
        {"user": 1, "title": "Gym Membership Available - Hostel Fitness Center", "content": "The hostel gym is now accepting memberships for the winter semester!\n\n**Facilities:**\n- Modern equipment\n- Cardio machines\n- Free weights\n- Dedicated trainer\n\n**Timings:** 6 AM - 10 PM\n**Fees:** ₹1500/semester\n\n**Benefits:**\n- Structured workout plans\n- Diet consultation\n- Group fitness classes\n\nStay fit, stay healthy! 💪 Contact hostel office for registration.", "category": "General", "image": 9},
        {"user": 2, "title": "Inter-Hostel Cricket Tournament 2026 🏏", "content": "**NITR Inter-Hostel Cricket Championship**\n\n🎯 **Tournament Format:**\n- T20 format\n- 8 hostels competing\n- Winners play semifinals\n\n📅 **Schedule:**\n- Group matches: Jan 5-10\n- Semifinals: Jan 12\n- Finals: Jan 15\n\n🏆 **Prize Pool:** ₹50,000\n- 1st: ₹25,000\n- 2nd: ₹15,000\n- 3rd: ₹10,000\n\n📋 **Registration:** Hostel coordinators\n**Deadline:** Dec 20\n\nLet's play! 🔥", "category": "Sports", "image": None},
        {"user": 0, "title": "Diwali Preparation - Hostel Decoration Drive! 🎆", "content": "**Hostel Decoration Competition**\n\nIt's time to decorate and celebrate!\n\n🎨 **Competition Details:**\n- Each floor competes\n- Judges: Student committee\n- Rating: Creativity, neatness, originality\n\n🏆 **Prizes:**\n- 1st: ₹5000\n- 2nd: ₹3000\n- 3rd: ₹2000\n\n📅 **Decoration dates:** Dec 15-20\n🎊 **Celebration:** Dec 21\n\nLet's make it beautiful! 💡", "category": "General", "image": None},
        {"user": 1, "title": "Tech Talk: Quantum Computing Basics 🔬", "content": "**Quantum Computing Demystified**\n\nEver wondered what's all the fuss about quantum computers?\n\n🎯 **Topics:**\n- Qubits vs Bits\n- Superposition & Entanglement\n- Quantum gates\n- Real-world applications\n\n👤 **Speaker:** Dr. Sharma (Physics Dept)\n📅 **Date:** Dec 10, 2025\n⏰ **Time:** 4 PM\n📍 **Venue:** A-105\n\n**Free entry! No registration needed**\n\nCome curious, leave amazed! 🚀", "category": "Academics", "image": None},
        {"user": 2, "title": "Campus Blood Donation Drive 🩸", "content": "**NITR Blood Donation Camp**\n\nBe a hero! Save lives!\n\n📍 **Location:** Medical Center\n📅 **Date:** Dec 12, 2025\n⏰ **Time:** 10 AM - 4 PM\n\n✅ **Eligibility:**\n- Age 18-60\n- Weight >50 kg\n- No major health issues\n\n💝 **Incentive:**\n- Free health checkup\n- Refreshments\n- Certificate\n\n📝 **Register:** Link in comments\n\nEach unit of blood can save 3 lives! 💪", "category": "Announcements", "image": None},
        {"user": 0, "title": "Exam Preparation Tips - Make a Study Plan 📚", "content": "Exams coming up? Here's how to prepare effectively:\n\n**30 days before:**\n- Review syllabus\n- Make study schedule\n- Start with weak areas\n\n**15 days before:**\n- Complete revision\n- Practice previous papers\n- Join study groups\n\n**1 week before:**\n- Final revision\n- Mock tests\n- Sleep well!\n\n**Day before:**\n- Light revision\n- Early bed\n- Positive vibes ✨\n\n**During exam:**\n- Read questions carefully\n- Manage time\n- Double-check answers\n\nYou got this! 💪", "category": "Academics", "image": None},
        {"user": 1, "title": "Bug Bounty Programs - Earn While You Hack! 💰", "content": "Found a bug? Get paid for it!\n\n**Popular Bug Bounty Platforms:**\n\n**HackerOne**\n- Average payout: $500-$5000\n- Companies: Google, Microsoft, Uber\n\n**Bugcrowd**\n- Average payout: $300-$2000\n- Companies: Yahoo, Salesforce\n\n**Intigriti**\n- Average payout: €100-€5000\n- Companies: Various startups\n\n**Tips:**\n- Start with simple vulnerabilities\n- Read the scope carefully\n- Be professional\n- Document everything\n\nTurn your hacking skills into income! 🚀", "category": "Academics", "image": None},
        {"user": 2, "title": "Summer Internship Applications Opening Soon! 📝", "content": "**Heads Up!** 🚨\n\nSummer internship application season is approaching!\n\n📅 **Timeline:**\n- Early January: Portal opens\n- Mid January: Deadline (usually)\n- Feb-March: Interviews\n- April onwards: Internships begin\n\n💡 **Pro Tips:**\n- Update resume NOW\n- Polish your GitHub\n- Do practice coding\n- Research companies\n\n🎯 **Target Companies:**\n- Google, Microsoft, Amazon\n- Startups (AngelList)\n- Research labs\n\n**Don't miss out!** Start preparing! 🔥", "category": "Placements", "image": None},
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
            created_at=datetime.utcnow() - timedelta(days=random.randint(0, 40), hours=random.randint(0, 23))
        )
        db.session.add(post)
        db.session.flush()  # Get the post ID
        
        # Add image if specified
        if data.get("image") is not None:
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
