import { useState, useRef } from 'react';
import { seedUsers } from '../data/seedData'; 
import ForceGraph2D from 'react-force-graph-2d';
import { Users, AlertTriangle, Search, LogIn, ShieldAlert } from 'lucide-react';

export default function Teacher() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const graphRef = useRef();

  // --- 1. THE LOGIN GATE ---
  const handleLogin = (e) => {
    e.preventDefault();
    // Hardcoded credentials for the demo
    if (username === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
    } else {
      setError('Invalid Credentials. Try admin / admin123');
    }
  };

  // --- 2. DATA PREP FOR "GOD VIEW" ---
  // Identify "At Risk" students (Low connections or Low skills)
  const atRiskStudents = seedUsers.filter(u => u.connections < 3);
  
  // Prepare Graph Data: Show ALL students
  const nodes = seedUsers.map(u => ({
    id: u.id,
    name: u.name,
    val: u.connections < 3 ? 15 : 10, // Make at-risk nodes slightly bigger
    color: u.connections < 3 ? '#ef4444' : '#3b82f6', // RED for Risk, BLUE for Safe
    ...u
  }));

  const links = []; 
  // In a real app, we'd map actual connections. 
  // For this demo, we simulate links for healthy students and 0 links for at-risk ones.
  seedUsers.forEach((u, i) => {
    if (u.connections >= 3) {
      // Create a ring of connections for healthy students
      const nextUser = seedUsers[(i + 1) % seedUsers.length];
      if (nextUser.connections >= 3) {
        links.push({ source: u.id, target: nextUser.id, color: '#334155' });
      }
    }
  });
  
  const graphData = { nodes, links };

  // --- RENDER: LOGIN SCREEN ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md bg-card border border-slate-800 p-8 rounded-2xl shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
               <ShieldAlert size={40} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-2">Admin Access</h1>
          <p className="text-slate-400 text-center mb-8">Restricted to Faculty & Administrators</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase">Username</label>
               <input 
                 type="text" 
                 className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                 value={username}
                 onChange={e => setUsername(e.target.value)}
               />
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
               <input 
                 type="password" 
                 className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                 value={password}
                 onChange={e => setPassword(e.target.value)}
               />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
              <LogIn size={18} /> Login to Dashboard
            </button>
            <div className="text-center text-xs text-slate-600 mt-4">
              Hint: admin / admin123
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER: DASHBOARD (If Logged In) ---
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-6 space-y-6">
      
      {/* Top Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card border border-slate-800 p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg"><Users /></div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase">Total Students</p>
            <h3 className="text-2xl font-bold text-white">{seedUsers.length}</h3>
          </div>
        </div>
        <div className="bg-card border border-slate-800 p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-lg"><AlertTriangle /></div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase">At-Risk (Isolated)</p>
            <h3 className="text-2xl font-bold text-white">{atRiskStudents.length}</h3>
          </div>
        </div>
        <div className="bg-card border border-slate-800 p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-lg"><Search /></div>
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase">Avg Engagement</p>
            <h3 className="text-2xl font-bold text-white">78%</h3>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 h-[500px]">
        
        {/* LEFT: The "God View" Graph */}
        <div className="bg-card border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
            <h3 className="font-bold text-white">Class Network Topology</h3>
            <div className="flex gap-3 text-xs">
               <span className="flex items-center gap-1 text-slate-300"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Healthy</span>
               <span className="flex items-center gap-1 text-slate-300"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Isolated</span>
            </div>
          </div>
          <div className="flex-1 bg-slate-950 relative">
             <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                
                // --- CUSTOM LABEL RENDERING ---
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
                  // Position text slightly below the node
                  ctx.fillText(label, node.x, node.y + (node.val / 3) + 4);
                }}

                linkColor={() => '#334155'}
                backgroundColor="#020617"
                width={600} // Fixed width for layout stability
                height={450}
             />
          </div>
        </div>

        {/* RIGHT: The "At-Risk" Table */}
        <div className="bg-card border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50">
            <h3 className="font-bold text-white text-red-400 flex items-center gap-2">
              <AlertTriangle size={18} /> Intervention Needed
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {atRiskStudents.map(student => (
              <div key={student.id} className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-red-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full bg-slate-800" />
                  <div>
                    <h4 className="font-bold text-white">{student.name}</h4>
                    <p className="text-xs text-slate-400">{student.dept} • {student.connections} Connections</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-red-500/10 text-red-400 text-xs font-bold rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                  Alert Mentor
                </button>
              </div>
            ))}
            {atRiskStudents.length === 0 && (
              <div className="text-center text-slate-500 mt-10">
                All students are well connected!
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}