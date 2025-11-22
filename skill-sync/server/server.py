# server.py
import random
from datetime import datetime
from typing import Dict, List, Optional, Tuple

from flask import Flask, jsonify, request
from flask_cors import CORS

import networkx as nx  # only conceptual, we don't use nx layout directly

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------
# 1. DATA: SKILLS, INTERESTS, YOUTUBE CONTENT
# ---------------------------------------------------
SEED = 42
random.seed(SEED)

SKILLS = [
    "Python",
    "React",
    "Java",
    "C++",
    "System Design",
    "Next.js",
    "Figma",
    "Django",
    "Node.js",
]

INTERESTS = [
    "Hackathons",
    "Competitive Coding",
    "Open Source",
    "AI Ethics",
    "Game Dev",
    "Product Design",
    "Web Dev",
]

YOUTUBE_DB: Dict[str, Dict[str, str]] = {
    "Python": {
        "beginner": "https://youtu.be/_uQrJ0TkZlc",
        "expert": "https://youtu.be/OdH2b3vT04E",
    },
    "React": {
        "beginner": "https://youtu.be/SqcY0GlETPk",
        "expert": "https://youtu.be/3LRZRSIh_KE?si=mjaestQPYn2AA1Y4",
    },
    "Java": {
        "beginner": "https://youtu.be/eIrMbAQSU34",
        "expert": "https://youtu.be/grEKMHGYyns",
    },
    "C++": {
        "beginner": "https://youtu.be/vLnPwxZdW4Y",
        "expert": "https://youtu.be/8jLOx1hD3_o",
    },
    "System Design": {
        "beginner": "https://youtu.be/xpDnVSmhmPo",
        "expert": "https://youtu.be/i53Gi_K3o7I",
    },
    "Next.js": {
        "beginner": "https://youtu.be/ZVnjOPwW4ZA",
        "expert": "https://youtu.be/843nec-IvW0",
    },
    "Figma": {
        "beginner": "https://youtu.be/4W4LvJnNegI",
        "expert": "https://youtu.be/_rk0JYrxK2c",
    },
    "Django": {
        "beginner": "https://youtu.be/F5mRW0jo-U4",
        "expert": "https://youtu.be/3gw2G5sU3xY",
    },
    "Node.js": {
        "beginner": "https://youtu.be/TlB_eWDSMt4",
        "expert": "https://youtu.be/2eq7F4Iu3zA",
    },
}

# ---------------------------------------------------
# 2. USER "DATABASE"
# ---------------------------------------------------


def generate_users(n: int = 30) -> List[Dict]:
    """
    Generate a mock cohort of students.
    Each user has:
      - id, name, dept
      - skills: { skill_name: level(0-100) }
      - interests: list[str]
    """
    firsts = [
        "Rahul",
        "Ananya",
        "Sarah",
        "David",
        "Vikram",
        "Priya",
        "Sam",
        "Rohan",
        "Aisha",
        "Kevin",
        "Naveen",
        "Emily",
        "Jason",
        "Arjun",
    ]
    lasts = [
        "Reddy",
        "Sharma",
        "Chen",
        "Gupta",
        "Kumar",
        "Watson",
        "Roy",
        "Kapoor",
        "Singh",
        "Khan",
        "Lee",
        "Patel",
    ]

    users: List[Dict] = []

    # --- User 1: our "current user" template ---
    users.append(
        {
            "id": 1,
            "name": "Dhanush",
            "dept": "ECE",
            "skills": {
                "Python": 40,
                "React": 50,
            },
            "interests": ["Hackathons"],
            "created_at": datetime.utcnow().isoformat(),
        }
    )

    uid = 2
    while uid <= n:
        name = f"{random.choice(firsts)} {random.choice(lasts)}"

        k_skills = random.choice([1, 2, 2, 3])
        chosen_skills = random.sample(SKILLS, k=k_skills)
        skills = {s: random.randint(25, 95) for s in chosen_skills}

        k_int = random.choice([0, 1, 1, 2])
        interests = random.sample(INTERESTS, k=k_int)

        users.append(
            {
                "id": uid,
                "name": name,
                "dept": random.choice(["CSE", "ISE", "ECE", "AIML"]),
                "skills": skills,
                "interests": interests,
                "created_at": datetime.utcnow().isoformat(),
            }
        )
        uid += 1

    return users


USERS: List[Dict] = generate_users(30)


def find_user(uid: int) -> Optional[Dict]:
    for u in USERS:
        if u["id"] == uid:
            return u
    return None


def normalize_skill_for_user(user: Dict, requested_skill: Optional[str]) -> Optional[str]:
    """
    Map a skill string from the frontend (any case) to the canonical
    key used in this user's skills dict. Returns None if not found.
    """
    if not requested_skill:
        return None
    req = requested_skill.lower()
    for s in user.get("skills", {}).keys():
        if s.lower() == req:
            return s
    return None


# ---------------------------------------------------
# 3. MATCHING & SCORING
# ---------------------------------------------------


def score_pair(
    target: Dict, other: Dict, focus_skill: Optional[str] = None
) -> Tuple[float, List[Dict], List[str], str]:
    """
    Compare target vs other and return:
      score, matched_skills, shared_interests, role_hint("Peer"/"Mentor")

    If focus_skill is provided, only that skill is considered (case-insensitive).
    """
    score: float = 0
    matched_skills: List[Dict] = []
    role_hint: str = "Peer"

    for skill, t_level in target.get("skills", {}).items():
        if focus_skill and skill.lower() != focus_skill.lower():
            continue

        o_level = other.get("skills", {}).get(skill)
        if o_level is None:
            continue

        matched_skills.append({"name": skill, "their_level": o_level})

        diff = o_level - t_level
        abs_diff = abs(diff)

        if diff >= 25:
            score += 40
            role_hint = "Mentor"
        elif abs_diff <= 15:
            score += 30
        else:
            score += 10

    shared_interests = list(
        set(target.get("interests", [])) & set(other.get("interests", []))
    )
    if shared_interests:
        score += 10 * len(shared_interests)

    if other.get("skills"):
        avg_other = sum(other["skills"].values()) / len(other["skills"])
        score += (avg_other / 100) * 5

    return score, matched_skills, shared_interests, role_hint


def pick_top_matches(
    user_id: int, top_n: int = 3, focus_skill: Optional[str] = None
) -> List[Dict]:
    """
    Build top_n matches for user_id.
    If focus_skill is given, we *only* match on that skill (case-insensitive).
    """
    target = find_user(user_id)
    if not target:
        return []

    # Normalize requested skill to the actual key in this user's skills dict
    canonical_skill = None
    if focus_skill:
        canonical_skill = normalize_skill_for_user(target, focus_skill)
        if not canonical_skill:
            return []  # user does not have that skill
    focus_skill = canonical_skill

    results: List[Dict] = []

    for other in USERS:
        if other["id"] == user_id:
            continue

        score, matched_skills, shared_interests, role_hint = score_pair(
            target, other, focus_skill=focus_skill
        )

        if score <= 0 or not matched_skills:
            continue

        # pick the best skill for recommendation based on closeness
        best = min(
            matched_skills,
            key=lambda m: abs(
                target["skills"].get(m["name"], 0) - m["their_level"]
            ),
        )
        skill_name = best["name"]
        user_level = target["skills"].get(skill_name, 0)
        other_level = best["their_level"]

        difficulty = "beginner"
        if other_level > user_level + 20:
            difficulty = "expert"

        rec_link = YOUTUBE_DB.get(skill_name, {}).get(
            difficulty, "https://www.youtube.com"
        )
        rec_title = (
            f"Advanced {skill_name}"
            if difficulty == "expert"
            else f"Intro to {skill_name}"
        )

        match_type = role_hint

        results.append(
            {
                "id": other["id"],
                "name": other["name"],
                "dept": other["dept"],
                "score": int(min(99, round(score))),
                "type": match_type,
                "matched_skills": matched_skills,
                "shared_interests": shared_interests,
                "recommendation_link": rec_link,
                "recommendation_title": rec_title,
                "study_plan": {
                    "daily_hours": 1 if match_type == "Mentor" else 2,
                    "days_to_next_level": 30 if match_type == "Mentor" else 14,
                    "target_level": "Specialist"
                    if match_type == "Mentor"
                    else "Intermediate",
                },
            }
        )

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_n]


# ---------------------------------------------------
# 4. API ENDPOINTS
# ---------------------------------------------------


@app.route("/api/recommend/<int:user_id>", methods=["GET"])
def recommend(user_id: int):
    """
    GET /api/recommend/1?skill=python
    -> returns top 2-3 collaborators for that user and that skill.
    """
    focus_skill = request.args.get("skill")
    matches = pick_top_matches(user_id, top_n=3, focus_skill=focus_skill)
    return jsonify(matches)


@app.route("/api/graph-data", methods=["GET"])
def graph_data():
    """
    GET /api/graph-data?user_id=1&skill=python&me_name=Dhanush
    -> returns nodes + links for the force graph.
    Only uses the top matches computed above.
    """
    user_id = int(request.args.get("user_id", 1))
    focus_skill = request.args.get("skill")
    me_name_override = request.args.get("me_name")

    target = find_user(user_id)
    if not target:
        return jsonify({"nodes": [], "links": []})

    if me_name_override:
        target["name"] = me_name_override

    matches = pick_top_matches(user_id, top_n=3, focus_skill=focus_skill)

    nodes: List[Dict] = []
    links: List[Dict] = []

    me_node_id = f"user-{target['id']}"
    nodes.append(
        {
            "id": me_node_id,
            "label": target["name"],
            "role": "me",
            "group": "user",
            "color": "#fb923c",
            "val": 18,
            "is_me": True,
        }
    )

    skill_nodes: Dict[str, str] = {}
    interest_nodes: Dict[str, str] = {}

    for m in matches:
        other = find_user(m["id"])
        if not other:
            continue

        role = m["type"].lower()
        other_node_id = f"user-{other['id']}"

        nodes.append(
            {
                "id": other_node_id,
                "label": other["name"],
                "role": role,
                "group": "user",
                "color": "#60a5fa" if role == "peer" else "#a78bfa",
                "val": 14 if role == "peer" else 16,
            }
        )

        links.append(
            {
                "source": me_node_id,
                "target": other_node_id,
                "type": "connection",
            }
        )

        for ms in (m.get("matched_skills") or [])[:2]:
            skill = ms["name"]
            if focus_skill and skill.lower() != focus_skill.lower():
                continue

            if skill not in skill_nodes:
                sid = f"skill-{skill}"
                skill_nodes[skill] = sid
                nodes.append(
                    {
                        "id": sid,
                        "label": skill,
                        "role": "skill",
                        "group": "skill",
                        "color": "#f59e0b",
                        "val": 10,
                    }
                )
            sid = skill_nodes[skill]
            links.append(
                {"source": other_node_id, "target": sid, "type": "skill"}
            )
            if skill in target.get("skills", {}):
                links.append(
                    {"source": me_node_id, "target": sid, "type": "skill"}
                )

        for intr in m.get("shared_interests") or []:
            if intr not in interest_nodes and len(interest_nodes) < 2:
                iid = f"interest-{intr}"
                interest_nodes[intr] = iid
                nodes.append(
                    {
                        "id": iid,
                        "label": intr,
                        "role": "interest",
                        "group": "interest",
                        "color": "#ef4444",
                        "val": 10,
                    }
                )

            if intr in interest_nodes:
                iid = interest_nodes[intr]
                links.append(
                    {"source": other_node_id, "target": iid, "type": "interest"}
                )
                if intr in target.get("interests", []):
                    links.append(
                        {"source": me_node_id, "target": iid, "type": "interest"}
                    )

    seen = set()
    dedup_links = []
    for l in links:
        key = (l["source"], l["target"], l.get("type"))
        if key not in seen:
            seen.add(key)
            dedup_links.append(l)

    return jsonify({"nodes": nodes, "links": dedup_links})


# ---------------------------------------------------
# 5. STATS ENDPOINTS
# ---------------------------------------------------


@app.route("/api/user-stats/<int:user_id>", methods=["GET"])
def user_stats(user_id: int):
    user = find_user(user_id) or USERS[0]

    skills_dict = user.get("skills", {})
    skill_items = list(skills_dict.items())

    if skill_items:
        total_skills = len(skill_items)
        avg_proficiency = sum(l for _, l in skill_items) / total_skills
    else:
        total_skills = 0
        avg_proficiency = 0.0

    def badge_for_level(level: int) -> str:
        if level >= 80:
            return "Guru"
        if level >= 50:
            return "Specialist"
        return "Learner"

    skill_list = [
        {"name": name, "level": level, "badge_type": badge_for_level(level)}
        for name, level in skill_items
    ]

    guru_badges = sum(1 for s in skill_list if s["badge_type"] == "Guru")

    if avg_proficiency >= 70:
        level_label = "Level 5 Scholar"
    elif avg_proficiency >= 40:
        level_label = "Level 3 Learner"
    else:
        level_label = "Level 1 Beginner"

    return jsonify(
        {
            "id": user["id"],
            "name": user["name"],
            "dept": user["dept"],
            "level_label": level_label,
            "total_skills": total_skills,
            "avg_proficiency": round(avg_proficiency),
            "guru_badges": int(guru_badges),
            "interests": user.get("interests", []),
            "skills": skill_list,
        }
    )


@app.route("/api/teacher/stats", methods=["GET"])
def teacher_stats():
    avg_list: List[float] = []
    at_risk: List[Dict] = []

    for u in USERS:
        s = u.get("skills", {})
        if not s:
            continue
        avg = sum(s.values()) / len(s)
        avg_list.append(avg)
        if avg < 40:
            at_risk.append({"id": u["id"], "name": u["name"], "avg": round(avg)})

    overall_avg = int(sum(avg_list) / len(avg_list)) if avg_list else 0

    return jsonify(
        {
            "total_students": len(USERS),
            "avg_class_skill": overall_avg,
            "at_risk_count": len(at_risk),
            "at_risk_list": at_risk,
        }
    )


@app.route("/api/refresh-data", methods=["POST"])
def refresh_data():
    global USERS
    USERS = generate_users(30)
    return jsonify({"status": "ok", "count": len(USERS)})


if __name__ == "__main__":
    print("Starting backend on http://127.0.0.1:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
