import { useState, useEffect, useRef, useCallback } from 'react';
import { Video, ExternalLink, BookOpen, Clock, Calendar, Target, Layers, Code, Zap } from 'lucide-react'; 
import ForceGraph2D from 'react-force-graph-2d'; 

const Dashboard = () => {
  const [matches, setMatches] = useState([]);
  // We store masterData to keep the full graph in memory while filtering
  const [masterGraphData, setMasterGraphData] = useState({ nodes: [], links: [] });
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('all'); // 'all', 'skills', 'interests'
  const graphRef = useRef(); 

  // --- 1. FETCH DATA FROM BACKEND ---
  useEffect(() => {
    setLoading(true);

    // Fetch Recommendations
    fetch('http://localhost:5000/api/recommend/1') // Assuming User ID 1
      .then(res => res.json())
      .then(data => {
        // Filter out any "System" type matches (like the Level Up card you wanted removed)
        const studentMatches = data.filter(m => m.type !== 'System');
        setMatches(studentMatches);
      })
      .catch(err => console.error("Rec API Error:", err));

    // Fetch Graph Data
    // NOTE: The backend should return a graph centered around the current user for clarity
    fetch('http://localhost:5000/api/graph-data')
      .then(res => res.json())
      .then(data => {
        setMasterGraphData(data);
        // Initialize graph with filtered view (only relevant nodes)
        setLoading(false);
      })
      .catch(err => console.error("Graph API Error:", err));
  }, []);

  // --- 2. FILTER LOGIC (Client Side) ---
  useEffect(() => {
    if (!masterGraphData.nodes.length) return;

    let filteredNodes = [];
    let filteredLinks = [];

    if (activeView === 'all') {
      filteredNodes = masterGraphData.nodes;
      filteredLinks = masterGraphData.links;
    } 
    else if (activeView === 'skills') {
      // Keep Users + Skills only (Filter out interests)
      filteredNodes = masterGraphData.nodes.filter(n => n.group !== 'interest');
      // Keep links that are NOT type 'interest'
      filteredLinks = masterGraphData.links.filter(l => l.type !== 'interest');
    } 
    else if (activeView === 'interests') {
      // Keep Users + Interests only (Filter out skills)
      filteredNodes = masterGraphData.nodes.filter(n => n.group !== 'skill');
      filteredLinks = masterGraphData.links.filter(l => l.type !== 'skill');
    }

    setGraphData({ nodes: filteredNodes, links: filteredLinks });
  }, [activeView, masterGraphData]);

  // --- 3. GRAPH NODE PAINTER ---
  const paintNode = useCallback((node, ctx, globalScale) => {
    const label = node.label || node.id; // Using ID as label
    const fontSize = 14 / globalScale;
    
    ctx.fillStyle = node.color || "#3b82f6"; // Default blue if color missing
    ctx.beginPath();
    
    if (node.group === 'skill') {
      // Diamond for Skills
      const size = 6;
      ctx.moveTo(node.x, node.y - size);
      ctx.lineTo(node.x + size, node.y);
      ctx.lineTo(node.x, node.y + size);
      ctx.lineTo(node.x - size, node.y);
    } else if (node.group === 'interest') {
      // Triangle for Interests
      const size = 7;
      ctx.moveTo(node.x, node.y - size);
      ctx.lineTo(node.x + size, node.y + size);
      ctx.lineTo(node.x - size, node.y + size);
    } else {
      // Circle for Users
      ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
    }
    ctx.fill();

    // Label Background
    ctx.font = `${fontSize}px Sans-Serif`;
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; 
    ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y + 6, bckgDimensions[0], bckgDimensions[1]);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.fillText(label, node.x, node.y + 6 + bckgDimensions[1] / 2); 
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      
      {/* HEADER (Cleaned up: No Streak) */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Your Study Matches
          </h1>
          <p className="text-gray-400 text-sm">Real-time recommendations from Python Backend</p>
        </div>
        {/* Streak Button Removed Here */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[550px]"> {/* Medium Size Graph Container */}
        
        {/* LEFT: GRAPH CONTAINER */}
        <div className="lg:col-span-2 flex flex-col gap-4 h-full">
            
            {/* VIEW TOGGLE BUTTONS */}
            <div className="flex gap-2 bg-gray-900 p-1 rounded-lg w-fit border border-gray-800">
                <button 
                    onClick={() => setActiveView('all')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeView === 'all' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    <Layers className="w-4 h-4" /> All Connections
                </button>
                <button 
                    onClick={() => setActiveView('skills')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeView === 'skills' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    <Code className="w-4 h-4" /> Technical Skills
                </button>
                <button 
                    onClick={() => setActiveView('interests')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeView === 'interests' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    <Zap className="w-4 h-4" /> Academic Focus
                </button>
            </div>

            {/* THE GRAPH */}
            <div className="flex-1 bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden relative shadow-inner">
                {/* LEGEND */}
                <div className="absolute top-4 left-4 z-10 bg-gray-900/90 backdrop-blur border border-gray-700 p-4 rounded-xl shadow-xl">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">
                        {activeView === 'all' ? 'Full Network' : activeView === 'skills' ? 'Skill Clusters' : 'Interest Groups'}
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span className="text-xs text-gray-300">You</span>
                        </div>
                        {(activeView === 'all' || activeView === 'skills') && (
                            <div className="flex items-center gap-2 animate-in fade-in">
                                <span className="w-2 h-2 rotate-45 bg-yellow-500"></span>
                                <span className="text-xs text-gray-300">Technical Skill</span>
                            </div>
                        )}
                        {(activeView === 'all' || activeView === 'interests') && (
                            <div className="flex items-center gap-2 animate-in fade-in">
                                <span className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-red-500"></span>
                                <span className="text-xs text-gray-300">Academic Focus</span>
                            </div>
                        )}
                    </div>
                </div>

                {!loading && (
                    <ForceGraph2D
                        ref={graphRef}
                        graphData={graphData}
                        nodeLabel="id"
                        nodeCanvasObject={paintNode}
                        backgroundColor="#0f172a00"
                        linkColor={() => "#334155"}
                        nodeRelSize={6}
                        onNodeClick={node => {
                            graphRef.current.centerAt(node.x, node.y, 1000);
                            graphRef.current.zoom(3, 2000);
                        }}
                    />
                )}
            </div>
        </div>

        {/* RIGHT: MATCH CARDS (Scrollable) */}
        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar pb-10 h-full">
          {loading ? (
            <p className="text-gray-500 text-center mt-10">Finding best matches...</p>
          ) : matches.length === 0 ? (
             <p className="text-gray-500 text-center mt-10">No matches found.</p>
          ) : (
             matches.map((match) => (
              <MatchCard key={match.id} match={match} />
          ))
          )}
        </div>
      </div>
    </div>
  );
};

const MatchCard = ({ match }) => {
  const startSession = () => window.open(`https://meet.jit.si/SkillSync-${match.id}`, '_blank');

  return (
    <div className="bg-gray-800 rounded-xl p-0 border border-gray-700 hover:border-indigo-500 transition-all shadow-lg group overflow-hidden">
      
      {/* TOP SECTION: USER INFO */}
      <div className="p-5 pb-3">
        <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg ${
                match.type === 'Mentor' ? 'bg-gradient-to-br from-purple-600 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'
            }`}>{match.name.charAt(0)}</div>
            <div>
                <h3 className="font-bold text-white text-lg leading-tight">{match.name}</h3>
                <div className="flex gap-2 mt-1">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                    match.type === 'Mentor' ? 'bg-purple-900/50 text-purple-300 border border-purple-700' : 'bg-emerald-900/50 text-emerald-300 border border-emerald-700'
                    }`}>{match.type}</span>
                </div>
            </div>
            </div>
            <div className="text-right">
                <div className="text-2xl font-black text-indigo-400">{match.score}%</div>
                <div className="text-[10px] text-gray-500 uppercase">Match Score</div>
            </div>
        </div>

        {/* INTEREST TAGS */}
        {match.shared_interests && (
            <div className="flex gap-2 mb-4 flex-wrap">
                {match.shared_interests.map((interest, i) => (
                    <div key={i} className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded text-[10px] text-gray-300 font-semibold border border-gray-600">
                        <Target className="w-3 h-3 text-indigo-400" /> 
                        {interest}
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* SKILL PERCENTAGE DISPLAY (VISUAL BAR REMOVED) */}
      <div className="px-5 pb-4">
        {match.matched_skills && match.matched_skills.map((skill, i) => (
            <div key={i} className="mb-3 border-b border-gray-700/50 pb-2 last:border-0">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300 font-medium">{skill.name}</span>
                    {/* TEXT ONLY - PERCENTAGE */}
                    <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                        match.type === 'Mentor' ? 'text-purple-300 bg-purple-900/30' : 'text-emerald-300 bg-emerald-900/30'
                    }`}>
                        {skill.their_level}% Proficiency
                    </span>
                </div>
            </div>
        ))}
      </div>

      {/* MIDDLE SECTION: THE AI STUDY PLAN */}
      <div className="bg-gray-900/80 p-4 border-y border-gray-700">
        <h4 className="text-[10px] font-bold text-indigo-400 uppercase mb-3 flex items-center gap-2">
            <Clock className="w-3 h-3" /> AI Recommended Schedule
        </h4>
        <div className="flex justify-between items-center mb-3">
            <div className="text-center">
                <p className="text-2xl font-bold text-white">{match.study_plan?.daily_hours || 2}h</p>
                <p className="text-[10px] text-gray-400">Daily Goal</p>
            </div>
            <div className="h-8 w-px bg-gray-700"></div>
            <div className="text-center">
                <p className="text-2xl font-bold text-white">{match.study_plan?.days_to_next_level || 15}</p>
                <p className="text-[10px] text-gray-400">Days to Level Up</p>
            </div>
            <div className="h-8 w-px bg-gray-700"></div>
            <div className="text-center">
                <p className="text-sm font-bold text-emerald-400">{match.study_plan?.target_level || "Intermediate"}</p>
                <p className="text-[10px] text-gray-400">Next Milestone</p>
            </div>
        </div>
        
        {/* YOUTUBE RESOURCE LINK */}
        <a href={match.recommendation_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-lg bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 transition-colors group/link">
            <div className="bg-red-600/20 p-1.5 rounded text-red-500">
                <BookOpen className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] text-indigo-300 font-bold">Recommended Content</p>
                <p className="text-xs text-white truncate">{match.recommendation_title}</p>
            </div>
            <ExternalLink className="w-3 h-3 text-gray-500 group-hover/link:text-white" />
        </a>
      </div>

      {/* BOTTOM SECTION: ACTION */}
      <div className="p-4">
        <button onClick={startSession} className="w-full bg-white hover:bg-gray-100 text-black py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-white/5">
            <Video className="w-4 h-4" /> 
            Start Session
        </button>
      </div>
    </div>
  );
};

export default Dashboard;