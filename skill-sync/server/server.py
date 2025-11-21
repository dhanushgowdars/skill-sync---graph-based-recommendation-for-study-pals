# server.py
import random
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
import networkx as nx

app = Flask(__name__)
CORS(app)

# -----------------------
# Seeds & DB
# -----------------------
SEED = 42
random.seed(SEED)

SKILLS = ["Python", "React", "Java", "C++", "System Design", "Next.js", "Figma", "Django", "Node.js"]
INTERESTS = ["Hackathons", "Competitive Coding", "Open Source", "AI Ethics", "Game Dev", "Product Design"]

YOUTUBE_DB = {
    "Python": {"beginner": "https://youtu.be/_uQrJ0TkZlc", "expert": "https://youtu.be/OdH2b3vT04E"},
    "React": {"beginner": "https://youtu.be/SqcY0GlETPk", "expert": "https://youtu.be/wPqnGRrE_UU"},
    "Java": {"beginner": "https://youtu.be/eIrMbAQSU34", "expert": "https://youtu.be/grEKMHGYyns"},
    "C++": {"beginner": "https://youtu.be/vLnPwxZdW4Y", "expert": "https://youtu.be/8jLOx1hD3_o"},
    "System Design": {"beginner": "https://youtu.be/xpDnVSmhmPo", "expert": "https://youtu.be/i53Gi_K3o7I"},
    "Next.js": {"beginner": "https://youtu.be/ZVnjOPwW4ZA", "expert": "https://youtu.be/843nec-IvW0"},
    "Figma": {"beginner": "https://youtu.be/4W4LvJnNegI", "expert": "https://youtu.be/_rk0JYrxK2c"},
    "Django": {"beginner": "https://youtu.be/F5mRW0jo-U4", "expert": "https://youtu.be/3gw2G5sU3xY"},
    "Node.js": {"beginner": "https://youtu.be/TlB_eWDSMt4", "expert": "https://youtu.be/2eq7F4Iu3zA"}
}

def generate_users(n=22):
    firsts = ["Rahul","Ananya","Sarah","David","Vikram","Priya","Sam","Rohan","Aisha","Kevin","Naveen","Emily","Jason","Arjun"]
    lasts = ["Reddy","Sharma","Chen","Gupta","Kumar","Watson","Roy","Kapoor","Singh","Khan","Lee","Patel"]
    users = []

    # user 1: Dhanush (explicit)
    users.append({
        "id": 1,
        "name": "Dhanush",
        "dept": "ECE",
        "skills": {"Python": 40, "React": 50},
        "interests": ["Hackathons"],
        "created_at": datetime.utcnow().isoformat()
    })

    uid = 2
    while uid <= n:
        name = f"{random.choice(firsts)} {random.choice(lasts)}"
        k = random.choice([1,2,2,3])
        chosen_skills = random.sample(SKILLS, k=k)
        skills = {}
        for s in chosen_skills:
            skills[s] = random.randint(25, 95)
        interests = random.sample(INTERESTS, k=random.choice([0,1,1,2]))
        users.append({
            "id": uid,
            "name": name,
            "dept": random.choice(["CSE","ISE","ECE","MECH"]),
            "skills": skills,
            "interests": interests,
            "created_at": datetime.utcnow().isoformat()
        })
        uid += 1
    return users

USERS = generate_users(22)

def find_user(uid):
    for u in USERS:
        if u["id"] == uid:
            return u
    return None

# -----------------------
# Matching/Scoring
# -----------------------
def score_pair(target, other):
    score = 0
    matched_skills = []
    for skill, t_lvl in target["skills"].items():
        o_lvl = other["skills"].get(skill)
        if o_lvl is None:
            continue
        matched_skills.append({"name": skill, "their_level": o_lvl})
        diff = o_lvl - t_lvl
        if diff >= 30:
            score += 40
        elif abs(diff) <= 15:
            score += 25
        else:
            score += 8

    shared_interests = list(set(target.get("interests", [])) & set(other.get("interests", [])))
    score += 10 * len(shared_interests)

    if other.get("skills"):
        avg = sum(other["skills"].values()) / len(other["skills"])
        score += (avg / 100) * 10

    return score, matched_skills, shared_interests

def pick_top_matches(user_id, top_n=3):
    target = find_user(user_id)
    if not target:
        return []
    results = []
    for other in USERS:
        if other["id"] == user_id:
            continue
        score, matched_skills, shared_interests = score_pair(target, other)
        if score <= 0:
            continue
        typ = "Peer"
        for ms in matched_skills:
            o_lvl = ms["their_level"]
            t_lvl = target["skills"].get(ms["name"], 0)
            if o_lvl >= t_lvl + 30:
                typ = "Mentor"
                break
        rec_title = "General Resource"
        rec_link = "https://www.youtube.com"
        if matched_skills:
            best = max(matched_skills, key=lambda m: m["their_level"])
            skill = best["name"]
            rec_link = YOUTUBE_DB.get(skill, {}).get("expert" if typ == "Mentor" else "beginner", "https://www.youtube.com")
            rec_title = f"{'Advanced' if typ == 'Mentor' else 'Intro to'} {skill}"
        results.append({
            "id": other["id"],
            "name": other["name"],
            "dept": other["dept"],
            "score": int(min(99, round(score))),
            "type": typ,
            "matched_skills": matched_skills,
            "shared_interests": shared_interests,
            "recommendation_link": rec_link,
            "recommendation_title": rec_title,
            "study_plan": {
                "daily_hours": 1 if typ == "Mentor" else 1 + (0 if score < 50 else 1),
                "days_to_next_level": 30 if typ == "Mentor" else 14,
                "target_level": "Specialist" if typ == "Mentor" else "Intermediate"
            }
        })
    results = sorted(results, key=lambda x: x["score"], reverse=True)
    return results[:top_n]

# -----------------------
# API Endpoints
# -----------------------
@app.route("/api/recommend/<int:user_id>", methods=["GET"])
def recommend(user_id):
    matches = pick_top_matches(user_id, top_n=3)
    return jsonify(matches)

@app.route("/api/graph-data", methods=["GET"])
def graph_data():
    user_id = int(request.args.get("user_id", 1))
    target = find_user(user_id)
    if not target:
        return jsonify({"nodes": [], "links": []})

    matches = pick_top_matches(user_id, top_n=3)

    nodes = []
    links = []

    # add me
    nodes.append({
        "id": f"user-{target['id']}",
        "label": target["name"],
        "role": "me",
        "group": "user",
        "color": "#fb923c",
        "val": 18
    })

    skill_nodes = {}
    interest_nodes = {}

    for m in matches:
        other = find_user(m["id"])
        if not other:
            continue
        role = m["type"].lower()
        nodes.append({
            "id": f"user-{other['id']}",
            "label": other["name"],
            "role": role,
            "group": "user",
            "color": "#60a5fa" if role == "peer" else "#a78bfa",
            "val": 14 if role == "peer" else 16
        })
        links.append({"source": f"user-{target['id']}", "target": f"user-{other['id']}", "type": "connection"})

        for ms in (m.get("matched_skills") or [])[:2]:
            skill = ms["name"]
            if skill not in skill_nodes:
                node_id = f"skill-{skill}"
                skill_nodes[skill] = node_id
                nodes.append({
                    "id": node_id,
                    "label": skill,
                    "role": "skill",
                    "group": "skill",
                    "color": "#f59e0b",
                    "val": 10
                })
            links.append({"source": f"user-{other['id']}", "target": skill_nodes[skill], "type": "skill"})
            if skill in target["skills"]:
                links.append({"source": f"user-{target['id']}", "target": skill_nodes[skill], "type": "skill"})

    # up to 2 shared interests
    interest_count = 0
    for m in matches:
        for intr in (m.get("shared_interests") or []):
            if intr and intr not in interest_nodes and interest_count < 2:
                node_id = f"interest-{intr}"
                interest_nodes[intr] = node_id
                nodes.append({
                    "id": node_id,
                    "label": intr,
                    "role": "interest",
                    "group": "interest",
                    "color": "#ef4444",
                    "val": 10
                })
                interest_count += 1
            if intr in interest_nodes:
                links.append({"source": f"user-{m['id']}", "target": interest_nodes[intr], "type": "interest"})
                if intr in target.get("interests", []):
                    links.append({"source": f"user-{target['id']}", "target": interest_nodes[intr], "type": "interest"})

    # dedupe links simply
    seen = set()
    dedup_links = []
    for l in links:
        key = (l["source"], l["target"], l.get("type"))
        if key not in seen:
            dedup_links.append(l)
            seen.add(key)

    return jsonify({"nodes": nodes, "links": dedup_links})

@app.route("/api/teacher/stats", methods=["GET"])
def teacher_stats():
    avg_skills = []
    at_risk = []
    for u in USERS:
        if not u.get("skills"):
            continue
        avg = sum(u["skills"].values()) / len(u["skills"])
        avg_skills.append(avg)
        if avg < 40:
            at_risk.append({"id": u["id"], "name": u["name"], "avg": avg})
    overall_avg = int(sum(avg_skills) / len(avg_skills)) if avg_skills else 0
    return jsonify({
        "total_students": len(USERS),
        "avg_class_skill": overall_avg,
        "at_risk_count": len(at_risk),
        "at_risk_list": at_risk
    })

@app.route("/api/refresh-data", methods=["POST"])
def refresh_data():
    global USERS
    USERS = generate_users(22)
    return jsonify({"status": "ok", "count": len(USERS)})

if __name__ == "__main__":
    print("Starting backend on http://127.0.0.1:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
