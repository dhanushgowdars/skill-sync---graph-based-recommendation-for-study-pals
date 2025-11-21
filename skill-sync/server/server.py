import json
import random
import networkx as nx
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

# --- 1. DATA GENERATOR ---
SKILLS = ["Python", "React", "Java", "C++", "System Design", "Next.js", "Figma"]
INTERESTS = ["Hackathons", "Competitive Coding", "Open Source", "AI Ethics", "Game Dev"]

# Content Database
YOUTUBE_DB = {
    "Python": {"beginner": "https://youtu.be/_uQrJ0TkZlc", "expert": "https://youtu.be/bOOX45l-Cqw"},
    "React": {"beginner": "https://youtu.be/SqcY0GlETPk", "expert": "https://youtu.be/wPqnGRrE_UU"},
    "Java": {"beginner": "https://youtu.be/eIrMbAQSU34", "expert": "https://youtu.be/grEKMHGYyns"},
    "System Design": {"beginner": "https://youtu.be/xpDnVSmhmPo", "expert": "https://youtu.be/i53Gi_K3o7I"},
    "C++": {"beginner": "https://youtu.be/vLnPwxZdW4Y", "expert": "https://youtu.be/8jLOx1hD3_o"},
    "Next.js": {"beginner": "https://youtu.be/ZVnjOPwW4ZA", "expert": "https://youtu.be/843nec-IvW0"}
}

SKILL_ROADMAP = {
    "Python": "Django", "React": "Next.js", "Java": "Spring Boot", "Machine Learning": "Deep Learning"
}

def generate_db():
    users = []
    # USER 1 (You)
    users.append({
        "id": 1, "name": "Dhanush", "dept": "ECE",
        "skills": {"Python": 40, "React": 85},
        "interests": ["Hackathons"],
        "streak": 3
    })
    
    # Generate 20 Random Students
    names = ["Rahul", "Ananya", "Sarah", "David", "Vikram", "Priya", "Steve", "Elon", "Sam"]
    for i in range(2, 22):
        users.append({
            "id": i,
            "name": f"{random.choice(names)} {i}", 
            "dept": random.choice(["CSE", "ISE", "ECE"]),
            "skills": {
                random.choice(SKILLS): random.randint(20, 95),
                random.choice(SKILLS): random.randint(20, 95)
            },
            "interests": [random.choice(INTERESTS)],
            "streak": random.randint(0, 15)
        })
    return users

USERS = generate_db()

# --- 2. GRAPH LOGIC ---
def build_graph():
    G = nx.Graph()
    subset_users = USERS[:10]
    for user in subset_users:
        G.add_node(user['name'], id=user['name'], group='user', val=20, color="#3b82f6")
        for skill, level in user.get('skills', {}).items():
            G.add_node(skill, id=skill, group='skill', val=12, color="#f59e0b") 
            G.add_edge(user['name'], skill, type='skill')
        for interest in user.get('interests', []):
            G.add_node(interest, id=interest, group='interest', val=12, color="#ef4444")
            G.add_edge(user['name'], interest, type='interest')
    return G

# --- 3. ENDPOINTS (FIXED LOGIC) ---

@app.route('/api/recommend/<int:user_id>', methods=['GET'])
def recommend(user_id):
    target = next((u for u in USERS if u['id'] == user_id), None)
    recommendations = []

    # 1. Progression Check
    for skill, level in target['skills'].items():
        if level > 80 and skill in SKILL_ROADMAP:
            recommendations.append({
                "id": 999, "type": "System", "name": "Skill AI",
                "is_progression": True,
                "current_skill": skill, "next_skill": SKILL_ROADMAP[skill],
                "reason": f"You are a {skill} Expert ({level}%). Time to level up!"
            })
            break 

    # 2. Intelligent Matching
    for other in USERS:
        if other['id'] == user_id: continue
        
        total_score = 0
        best_skill_match = None
        highest_skill_score = -1
        matched_skills = []
        
        # Compare Skills
        for skill, level in target['skills'].items():
            if skill in other['skills']:
                their_level = other['skills'][skill]
                diff = abs(level - their_level)
                
                matched_skills.append({"name": skill, "their_level": their_level})
                
                # Calculate Score for THIS skill
                skill_score = 0
                if diff < 15: skill_score = 40      # Peer (High Value)
                elif level < 50 and their_level > 80: skill_score = 60 # Mentor (Highest Value)
                else: skill_score = 10              # Weak connection
                
                total_score += skill_score
                
                # Track Best Skill for Recommendation
                if skill_score > highest_skill_score:
                    highest_skill_score = skill_score
                    best_skill_match = skill
        
        # Compare Interests
        shared_interests = list(set(target['interests']).intersection(other['interests']))
        if shared_interests:
            total_score += 20

        if total_score > 0:
            # Determine Match Type based on the BEST skill connection
            match_type = "Peer"
            rec_link = "https://youtube.com"
            rec_title = "General Resource"

            if best_skill_match:
                my_lvl = target['skills'][best_skill_match]
                their_lvl = other['skills'][best_skill_match]
                
                if my_lvl < 50 and their_lvl > 80:
                    match_type = "Mentor"
                    rec_link = YOUTUBE_DB.get(best_skill_match, {}).get('expert')
                    rec_title = f"Advanced {best_skill_match}"
                else:
                    match_type = "Peer"
                    rec_link = YOUTUBE_DB.get(best_skill_match, {}).get('beginner')
                    rec_title = f"{best_skill_match} for Beginners"

            recommendations.append({
                "id": other['id'], 
                "name": other['name'], 
                "dept": other['dept'],
                "score": min(total_score, 99), # Cap at 99%
                "type": match_type,
                "matched_skills": matched_skills,
                "shared_interests": shared_interests or other['interests'][:2],
                "recommendation_link": rec_link,
                "recommendation_title": rec_title,
                "study_plan": {
                    "daily_hours": 2 if match_type == "Peer" else 1,
                    "days_to_next_level": 15 if match_type == "Peer" else 30,
                    "target_level": "Intermediate" if match_type == "Peer" else "Specialist"
                }
            })

    # Return Top 5 Sorted by Score
    return jsonify(sorted(recommendations, key=lambda x: x.get('score', 0), reverse=True)[:5])

@app.route('/api/graph-data', methods=['GET'])
def graph_data():
    G = build_graph() 
    nodes = [{"id": n, "group": G.nodes[n]['group'], "val": G.nodes[n]['val'], "color": G.nodes[n]['color']} for n in G.nodes]
    links = [{"source": u, "target": v, "type": d.get('type')} for u, v, d in G.edges(data=True)]
    return jsonify({"nodes": nodes, "links": links})

@app.route('/api/teacher/stats', methods=['GET'])
def teacher_stats():
    at_risk = [u for u in USERS if sum(u['skills'].values())/len(u['skills']) < 35]
    return jsonify({
        "total_students": len(USERS),
        "at_risk_count": len(at_risk),
        "at_risk_list": at_risk,
        "avg_skill": 68
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)