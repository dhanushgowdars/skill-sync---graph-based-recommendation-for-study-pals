export const seedUsers = [
  {
    id: "1",
    name: "Rahul Sharma",
    dept: "CSE",
    skills: [
      { name: "Python", proficiency: 90 }, // Mentor Material
      { name: "React", proficiency: 45 }
    ],
    interests: ["Chess", "AI", "Robotics"],
    connections: 12,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul"
  },
  {
    id: "2",
    name: "Ananya Reddy",
    dept: "ISE",
    skills: [
      { name: "Python", proficiency: 42 }, // Peer Material
      { name: "Java", proficiency: 60 }
    ],
    interests: ["Anime", "Web Dev", "Design"],
    connections: 4,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya"
  },
  {
    id: "3",
    name: "David Lee",
    dept: "ECE",
    skills: [
      { name: "C++", proficiency: 85 },
      { name: "IoT", proficiency: 70 }
    ],
    interests: ["Robotics", "Hardware"],
    connections: 0, // ISOLATED NODE (For Teacher View)
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David"
  },
  {
    id: "4",
    name: "Sarah Chen",
    dept: "CSE",
    skills: [
      { name: "Python", proficiency: 95 }, // Guru
      { name: "React", proficiency: 90 },
      { name: "AI", proficiency: 80 }
    ],
    interests: ["Hackathons", "AI", "Startup"],
    connections: 25,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
  }
];