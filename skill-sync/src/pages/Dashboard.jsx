import { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { seedUsers } from '../data/seedData';
import ForceGraph2D from 'react-force-graph-2d';
import { Video, Zap, Share2, User as UserIcon } from 'lucide-react';

export default function Dashboard() {
  const { user } = useUser();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [matches, setMatches] = useState([]);
  const graphRef = useRef();
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 600 });

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

  useEffect(() => {
    if (!user.name) return;

    const calculatedMatches = seedUsers.map(candidate => {
      let score = 0;
      let role = "PEER"; 
      let sharedSkills = [];
      let sharedInterests = [];

      user.skills.forEach(mySkill => {
        const theirSkill = candidate.skills.find(s => 
          s.name.toLowerCase() === mySkill.name.toLowerCase()
        );

        if (theirSkill) {
          sharedSkills.push(mySkill.name);
          const diff = Math.abs(mySkill.proficiency - theirSkill.proficiency);
          if (mySkill.proficiency < 50 && theirSkill.proficiency > 80) {
            score += 60;
            role = "MENTOR";
          } else if (diff < 15) {
            score += 40;
            role = "PEER"; 
          }
        }
      });

      candidate.interests.forEach(i => {
        if (user.interests.some(myI => myI.toLowerCase() === i.toLowerCase())) {
          score += 10;
          sharedInterests.push(i);
        }
      });

      if (candidate.dept === user.dept) score += 5;

      return { ...candidate, score, role, sharedSkills, sharedInterests };
    })
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score);

    setMatches(calculatedMatches);

    const nodes = [];
    const links = [];

    nodes.push({ id: 'me', name: 'You', val: 30, color: '#3b82f6', type: 'user' });

    calculatedMatches.forEach(match => {
      nodes.push({ 
        id: match.id, 
        name: match.name, 
        val: 20, 
        color: match.role === 'MENTOR' ? '#8b5cf6' : '#22c55e', 
        type: 'user'
      });

      links.push({ source: 'me', target: match.id, color: '#334155', width: 2 });

      match.sharedSkills.forEach(skill => {
        const skillId = `skill-${skill}`;
        if (!nodes.find(n => n.id === skillId)) {
          nodes.push({ id: skillId, name: skill, val: 10, color: '#eab308', type: 'skill' });
          links.push({ source: 'me', target: skillId, color: '#eab308', width: 1, dashed: true });
        }
        links.push({ source: match.id, target: skillId, color: '#eab308', width: 1, dashed: true });
      });
    });

    setGraphData({ nodes, links });

  }, [user]);

  const startSession = (partnerName) => {
    const roomName = `SkillSync-${user.name}-${partnerName}`.replace(/\s/g, '');
    const url = `https://meet.jit.si/${roomName}`;
    window.open(url, '_blank');
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-background overflow-hidden">
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
          
          // --- CUSTOM PAINTING FOR LABELS ---
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12/globalScale;
            
            // Draw Node Circle
            ctx.fillStyle = node.color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.val / 4, 0, 2 * Math.PI, false); 
            ctx.fill();

            // Draw Text Label
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            // Draw text slightly below the node
            ctx.fillText(label, node.x, node.y + (node.val / 3) + 4);
          }}
          
          linkColor={link => link.color}
          linkWidth={link => link.width}
          linkLineDash={link => link.dashed ? [4, 2] : null}
          backgroundColor="#0f1117"
          d3VelocityDecay={0.3}
        />
      </div>

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