import { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { seedUsers } from '../data/seedData';
import ForceGraph2D from 'react-force-graph-2d';
import { Video, Zap, Share2, User as UserIcon, Star } from 'lucide-react';

export default function Dashboard() {
  const { user } = useUser();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [matches, setMatches] = useState([]);
  const graphRef = useRef();
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 600 });

  // Responsive Graph Container
  useEffect(() => {
    const updateDims = () => {
      const container = document.getElementById('graph-container');
      if (container) {
        setContainerDimensions({ width: container.clientWidth, height: container.clientHeight });
      }
    };
    window.addEventListener('resize', updateDims);
    updateDims();
    return () => window.removeEventListener('resize', updateDims);
  }, []);

  // --- THE MATCHING ENGINE ---
  useEffect(() => {
    if (!user.name) return;

    // 1. Calculate Scores
    const calculatedMatches = seedUsers.map(candidate => {
      let score = 0;
      let role = "PEER"; 
      let sharedSkills = [];
      let sharedInterests = [];

      // A. Skill Matching
      user.skills.forEach(mySkill => {
        const theirSkill = candidate.skills.find(s => 
          s.name.toLowerCase() === mySkill.name.toLowerCase()
        );

        if (theirSkill) {
          sharedSkills.push(mySkill.name);
          const diff = Math.abs(mySkill.proficiency - theirSkill.proficiency);
          
          // MENTOR: I am Beginner (<50), They are Expert (>80)
          if (mySkill.proficiency < 50 && theirSkill.proficiency > 80) {
            score += 60;
            role = "MENTOR";
          }
          // PEER: Skill gap is small (<15)
          else if (diff < 15) {
            score += 40;
            role = "PEER"; 
          }
        }
      });

      // B. Interest Matching
      candidate.interests.forEach(i => {
        if (user.interests.some(myI => myI.toLowerCase() === i.toLowerCase())) {
          score += 10;
          sharedInterests.push(i);
        }
      });

      // C. Department Bonus
      if (candidate.dept === user.dept) score += 5;

      return { ...candidate, score, role, sharedSkills, sharedInterests };
    })
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score);

    setMatches(calculatedMatches);

    // --- GRAPH DATA GENERATION (Knowledge Graph) ---
    const nodes = [];
    const links = [];

    // 1. Add YOU (Center Node)
    nodes.push({ id: 'me', name: 'You', val: 30, color: '#3b82f6', type: 'user' });

    calculatedMatches.forEach(match => {
      // 2. Add Match Nodes
      nodes.push({ 
        id: match.id, 
        name: match.name, 
        val: 20, 
        color: match.role === 'MENTOR' ? '#8b5cf6' : '#22c55e', // Purple for Mentor, Green for Peer
        type: 'user'
      });

      // Link You <-> Match
      links.push({ source: 'me', target: match.id, color: '#334155', width: 2 });

      // 3. Add Skill Nodes (The "Why" we matched)
      match.sharedSkills.forEach(skill => {
        const skillId = `skill-${skill}`;
        // Only add skill node if it doesn't exist yet
        if (!nodes.find(n => n.id === skillId)) {
          nodes.push({ id: skillId, name: skill, val: 10, color: '#eab308', type: 'skill' });
          // Link You -> Skill
          links.push({ source: 'me', target: skillId, color: '#eab308', width: 1, dashed: true });
        }
        // Link Match -> Skill
        links.push({ source: match.id, target: skillId, color: '#eab308', width: 1, dashed: true });
      });
    });

    setGraphData({ nodes, links });

  }, [user]);


  // --- JITSI VIDEO HANDLER ---
  const startSession = (partnerName) => {
    const roomName = `SkillSync-${user.name}-${partnerName}`.replace(/\s/g, '');
    const url = `https://meet.jit.si/${roomName}`;
    window.open(url, '_blank');
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-background overflow-hidden">
      
      {/* LEFT: GRAPH VISUALIZATION */}
      <div id="graph-container" className="w-full md:w-7/12 h-1/2 md:h-full relative border-r border-slate-800 bg-slate-950/50">
        <div className="absolute top-4 left-4 z-10 bg-slate-900/90 p-4 rounded-xl border border-slate-700 backdrop-blur-sm shadow-xl">
          <h2 className="text-white font-bold flex items-center gap-2 mb-2">
            <Share2 size={18} className="text-blue-400" /> Knowledge Graph
          </h2>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> You</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div> Mentor (Expert)</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Peer (Study Pal)</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Shared Skill</div>
          </div>
        </div>
        
        <ForceGraph2D
          ref={graphRef}
          width={containerDimensions.width}
          height={containerDimensions.height}
          graphData={graphData}
          nodeLabel="name"
          nodeRelSize={6}
          linkColor={link => link.color}
          linkWidth={link => link.width}
          linkLineDash={link => link.dashed ? [4, 2] : null}
          backgroundColor="#0f1117"
          d3VelocityDecay={0.3}
          onNodeClick={node => {
            graphRef.current.centerAt(node.x, node.y, 1000);
            graphRef.current.zoom(3, 2000);
          }}
        />
      </div>

      {/* RIGHT: MATCH LIST */}
      <div className="w-full md:w-5/12 h-1/2 md:h-full overflow-y-auto bg-background p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Your Matches</h2>
          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
            {matches.length} Found
          </span>
        </div>

        <div className="space-y-4 pb-20">
          {matches.length === 0 ? (
            <div className="text-center text-slate-500 mt-10 p-8 border border-dashed border-slate-800 rounded-2xl">
              <Zap className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No matches yet based on your profile.</p>
              <p className="text-sm mt-2">Try adding common skills like "Python" or "React".</p>
            </div>
          ) : (
            matches.map(match => (
              <div key={match.id} className="bg-card border border-slate-800 p-5 rounded-xl hover:border-slate-600 transition-all group shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <img src={match.avatar} alt={match.name} className="w-12 h-12 rounded-lg bg-slate-800" />
                    <div>
                      <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">{match.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <UserIcon size={12} /> {match.dept} • {match.connections} Connections
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    match.role === 'MENTOR' 
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                      : 'bg-green-500/10 text-green-400 border-green-500/20'
                  }`}>
                    {match.role}
                  </span>
                </div>

                {/* Why did we match? */}
                <div className="mb-4 space-y-2">
                  {match.sharedSkills.length > 0 && (
                    <div className="text-xs text-slate-400 flex flex-wrap gap-2">
                      <span className="opacity-70">Skills:</span>
                      {match.sharedSkills.map(skill => (
                        <span key={skill} className="text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">{skill}</span>
                      ))}
                    </div>
                  )}
                  {match.sharedInterests.length > 0 && (
                     <div className="text-xs text-slate-400 flex gap-2">
                       <span className="opacity-70">Interests:</span>
                       <span className="text-white">{match.sharedInterests.join(", ")}</span>
                     </div>
                  )}
                </div>

                <button 
                  onClick={() => startSession(match.name)}
                  className="w-full py-3 rounded-lg bg-slate-800 hover:bg-blue-600 text-white font-medium transition-all flex items-center justify-center gap-2 border border-slate-700 hover:border-blue-500"
                >
                  <Video size={18} /> Start Study Session
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}