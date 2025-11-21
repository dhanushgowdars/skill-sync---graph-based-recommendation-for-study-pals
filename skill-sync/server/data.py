# data.py
# This acts as our "Database" for the Hackathon

# 1. The Classroom Data
# We deliberately created a mix of "Experts" (Mentors), "Learners" (Peers), and "Isolated" (At-Risk) students.
# server/data.py

USERS = [
    # --- THE "HERO" USER (YOU) ---
    {
        "id": 1,
        "name": "Manoj",
        "dept": "CSE",
        "skills": [
            {"name": "Python", "level": 45},
            {"name": "React", "level": 30},
            {"name": "Figma", "level": 60}
        ],
        "interests": ["Hackathons", "Web Dev"],
        "connections": [] 
    },
    # --- MENTORS (High Skill) ---
    { "id": 2, "name": "Rahul THE BOSS", "dept": "CSE", "skills": [{"name": "Python", "level": 90}, {"name": "Django", "level": 85}], "interests": ["Hackathons", "Coding"], "connections": [3, 4, 8] },
    { "id": 3, "name": "Ananya Reddy", "dept": "ISE", "skills": [{"name": "React", "level": 95}, {"name": "Node.js", "level": 88}], "interests": ["Research", "Web Dev"], "connections": [2, 5, 9] },
    { "id": 4, "name": "Vikram Singh", "dept": "AIML", "skills": [{"name": "TensorFlow", "level": 92}, {"name": "Python", "level": 88}], "interests": ["AI", "Chess"], "connections": [2, 6, 10] },
    { "id": 5, "name": "Priya Kapoor", "dept": "ECE", "skills": [{"name": "IoT", "level": 85}, {"name": "C++", "level": 80}], "interests": ["Robotics", "Hardware"], "connections": [3, 7] },

    # --- PEERS (Mid Skill - Good Matches for You) ---
    { "id": 6, "name": "Sarah Chen", "dept": "CSE", "skills": [{"name": "React", "level": 40}, {"name": "Python", "level": 50}], "interests": ["Web Dev", "Badminton"], "connections": [4, 8] },
    { "id": 7, "name": "David Miller", "dept": "ISE", "skills": [{"name": "Java", "level": 60}, {"name": "SQL", "level": 55}], "interests": ["Database", "Gaming"], "connections": [5, 9] },
    { "id": 8, "name": "Aisha Khan", "dept": "CSE", "skills": [{"name": "Figma", "level": 65}, {"name": "UI/UX", "level": 60}], "interests": ["Design", "Art"], "connections": [2, 6] },
    { "id": 9, "name": "Rohan Das", "dept": "ECE", "skills": [{"name": "Python", "level": 40}, {"name": "C", "level": 45}], "interests": ["Embedded", "Music"], "connections": [3, 7] },
    { "id": 10, "name": "Kevin Liu", "dept": "AIML", "skills": [{"name": "Data Science", "level": 55}, {"name": "Python", "level": 50}], "interests": ["Stats", "Reading"], "connections": [4, 11] },

    # --- LEARNERS / ISOLATED (Graph "Outliers") ---
    { "id": 11, "name": "Sneha Gupta", "dept": "CSE", "skills": [{"name": "HTML", "level": 30}], "interests": ["Web Dev"], "connections": [10] },
    { "id": 12, "name": "Jason Roy", "dept": "ISE", "skills": [{"name": "Java", "level": 25}], "interests": ["Mobile Apps"], "connections": [] }, # Isolated
    { "id": 13, "name": "Emily Watson", "dept": "ECE", "skills": [{"name": "Circuits", "level": 35}], "interests": ["IoT"], "connections": [] }, # Isolated
    { "id": 14, "name": "Arjun Mehta", "dept": "CSE", "skills": [{"name": "Python", "level": 20}], "interests": ["Coding"], "connections": [15] },
    { "id": 15, "name": "Naveen Kumar", "dept": "CSE", "skills": [{"name": "C++", "level": 30}], "interests": ["Gaming"], "connections": [14] }
]

def get_all_users():
    return USERS

def get_user_by_id(user_id):
    return next((u for u in USERS if u["id"] == user_id), None)