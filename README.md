# SkillSync – Graph-Based Study Partner Recommendation System

A platform that uses graph algorithms and AI-based insights to recommend study partners, generate personalized learning roadmaps, and track skill development.

---

## Overview

SkillSync is designed to:

- Recommend suitable study partners based on skill similarity  
- Generate structured learning roadmaps  
- Track user proficiency and compare with peers  
- Visualize collaboration networks  
- Assist teachers in monitoring student performance  

The system combines graph theory with full-stack development to create a practical learning support platform.

---

## Key Features

### 1. Study Partner Recommendation
- Uses Jaccard similarity for matching users  
- Displays match percentage  
- Suggests mentor or peer roles  
- Recommends learning resources  

---

### 2. Performance Dashboard
- Tracks total skills  
- Shows average proficiency  
- Identifies strongest skill  
- Provides class vs user comparison  
- Includes level progression  

---

### 3. Learning Roadmap
- Personalized daily study plan  
- Estimated time to level up  
- Milestone tracking  
- Content recommendations  

---

### 4. Graph Visualizations
- User collaboration network  
- Skill relationship graph  
- Combined visualization  
- Interactive graph representation  

---

### 5. Teacher Dashboard
- View overall class performance  
- Analyze student skill distribution  
- Identify students needing support  
- Recommend mentors  

---

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Recharts
- React Router

### Backend
- Python
- Flask
- Flask-CORS
- NetworkX
- NumPy

### Deployment
- Docker
- Docker Compose

---

## Project Structure


skill-sync/
│
├── server/
│ ├── server.py
│ ├── users.json
│ ├── requirements.txt
│ ├── Dockerfile
│
├── src/
│ ├── components/
│ ├── pages/
│ ├── context/
│ ├── data/
│ ├── App.jsx
│ ├── main.jsx
│
├── public/
├── Dockerfile
├── docker-compose.yml
├── package.json


---

## Running the Project

### Using Docker


docker-compose up --build


Access:
- Frontend: http://localhost:5173  
- Backend: http://localhost:5000  

---

### Without Docker

#### Backend

cd server
pip install -r requirements.txt
python server.py


#### Frontend

npm install
npm run dev


---

## API Endpoints

- `/recommend` → Returns study partner recommendations  
- `/roadmap` → Returns personalized roadmap  
- `/graph-data` → Returns graph data for visualization  

---

## Key Highlights

- Uses graph algorithms for real-world recommendation  
- Personalized learning support system  
- Full-stack implementation  
- Ready for deployment using Docker  

---

## Author

Dhanush R S  
GitHub: https://github.com/dhanushgowdars
