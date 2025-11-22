🚀 SkillSync – Graph-Based Study Pal Recommendation System

A smart platform that uses graph algorithms + AI insights to match students with ideal study partners, recommend learning roadmaps, and track skill progress.

📌 Overview

SkillSync is an AI-driven learning companion that uses Graph Theory + Skill Profiling to:

🔗 Recommend the best study partners based on matching skills

📚 Auto-generate learning roadmaps

📊 Track user proficiency and compare with class averages

🧠 Visualize collaboration networks

🧩 Provide mentor/peer suggestions

🛠 Built with React + Flask + Docker

This platform is built for students who want personalized guidance, structured learning, and smart collaboration.

🎯 Features
⭐ 1. Smart Study Pal Recommendation

Uses graph similarity (Jaccard Score) to match peers

Shows match percentage

Suggests mentor or peer roles

Provides recommended resources (YouTube + blogs)

📊 2. My Stats Dashboard

Shows total skills

Average proficiency

Strongest skill

Class vs You comparison

Earned badges

Level progression

🧭 3. AI Recommended Roadmap

Daily hours

Days to level up

Next milestone

Personalized content recommendations

🖼 4. Graph Visualizations

Network graph (user + best matches)

Skill graph

Combined graph

Animated node interactions

👨‍🏫 5. Teacher View

Check overall class performance

Track student skill distributions

Identify who needs help

View recommended mentors

🏗️ Tech Stack
Frontend

React

Vite

TailwindCSS

Recharts

Lucide React

React Router

Backend

Python

Flask

Flask-CORS

NetworkX (graph algorithms)

NumPy

Deployment (Docker-Ready)

Dockerfile for frontend

Dockerfile for backend

docker-compose.yml to run both together

📁 Folder Structure (Important)
skill-sync/
│
├── server/
│   ├── server.py
│   ├── users.json
│   ├── requirements.txt
│   ├── Dockerfile
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── data/
│   ├── App.jsx
│   ├── main.jsx
│
├── public/
│
├── Dockerfile           (Frontend)
├── docker-compose.yml
├── package.json

🐳 Run With Docker (Judges will love this)
1. Build & Run Everything
docker-compose up --build

2. Frontend

Runs on:
👉 http://localhost:5173/

3. Backend

Runs on:
👉 http://localhost:5000/

▶️ Run Without Docker (Normal Mode)
Backend
cd server
pip install -r requirements.txt
python server.py

Frontend
npm install
npm run dev

📌 API Endpoints
🔹 /recommend

Returns best study matches based on skills.

🔹 /roadmap

Returns learning roadmap with daily goal, days to level up, milestone.

🔹 /graph-data

Returns nodes + edges for visualization.

🏆 Hackathon Value Proposition
Feature	Benefit
Graph-based matching	Highly accurate peer recommendations
Roadmap automation	Personalized learning path
My Stats	Shows real-time skill growth
Teacher View	Helps educators track class performance
Docker Deploy	Plug-and-run for judges
✨ Authors

Dhanush R S (Full Stack Developer)
Hackathon Project – SkillSync
Graph-Based AI Recommendation System
