import { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Users, AlertTriangle, Search, LogIn, ShieldAlert, TrendingUp, CheckCircle, UserPlus, UserCheck, X } from 'lucide-react';

export default function Teacher() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // State for Real Data
  const [students, setStudents] = useState([]);
  const [atRiskList, setAtRiskList] = useState([]);
  const [kpi, setKpi] = useState({ total: 0, atRisk: 0, avg: 0 });
  
  const [interventionModal, setInterventionModal] = useState(null); 
  const graphRef = useRef();

  // --- 1. FETCH DATA FROM BACKEND ---
  useEffect(() => {
    if (isLoggedIn) {
        fetch('http://localhost:5000/api/teacher/stats')
        .then(res => res.json())
        .then(data => {
            setKpi({
                total: data.total_students || 0,
                atRisk: data.at_risk_count || 0,
                avg: data.avg_skill || 0
            });
            setAtRiskList(data.at_risk_list || []);
            
            // Create a full list for the graph (Healthy + At Risk)
            // We add mock healthy students so the graph isn't empty, but now they have full data
            const healthyMock = [
                { id: 101, name: "Rahul S", dept: "CSE", status: "Healthy", avg_skill: 78 },
                { id: 102, name: "Ananya R", dept: "ISE", status: "Healthy", avg_skill: 85 },
                { id: 103, name: "Sarah C", dept: "ECE", status: "Healthy", avg_skill: 72 },
                { id: 104, name: "Vikram M", dept: "CSE", status: "Healthy", avg_skill: 90 },
                { id: 105, name: "Priya K", dept: "AIML", status: "Healthy", avg_skill: 88 }
            ];
            
            // Combine real at-risk students with mock healthy students for the UI
            setStudents([...(data.at_risk_list || []), ...healthyMock]);
        })
        .catch(err => console.error("Teacher API Error:", err));
    }
  }, [isLoggedIn]);

  // PREPARE GRAPH DATA
  const graphData = {
    nodes: students.map(s => ({
      id: s.name,
      group: s.status === 'At-Risk' ? 'isolated' : 'healthy',
      val: s.status === 'At-Risk' ? 20 : 10,
      color: s.status === 'At-Risk' ? '#ef4444' : '#3b82f6'
    })),
    links: students
        .filter(s => s.status === 'Healthy')
        .map((s, i, arr) => ({
            source: s.name,
            target: arr[(i + 1) % arr.length].name // Link healthy students in a ring
        }))
  };

  // --- 2. LOGIN LOGIC ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
    } else {
      setError('Invalid Credentials. Try admin / admin123');
    }
  };

  // --- 3. INTERVENTION LOGIC ---
  const handleIntervention = (type) => {
    setTimeout(() => {
        alert(`✅ Successfully assigned a ${type} to ${interventionModal.name}. \nThey have been notified via Email.`);
        setInterventionModal(null);
        
        // Optimistic UI Update: Remove from At-Risk list locally
        const updatedList = atRiskList.filter(s => s.name !== interventionModal.name);
        setAtRiskList(updatedList);
        
        // Update the main student list to reflect the change (move to healthy for demo visual)
        setStudents(prev => prev.map(s => 
            s.name === interventionModal.name ? { ...s, status: "Healthy", color: '#3b82f6' } : s
        ));
        
        setKpi(prev => ({ ...prev, atRisk: Math.max(0, prev.atRisk - 1) }));
    }, 500);
  };

  // --- RENDER: LOGIN SCREEN ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background p-4 bg-gray-950 text-white">
        <div className="w-full max-w-md bg-gray-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
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
                 className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                 value={username}
                 onChange={e => setUsername(e.target.value)}
               />
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
               <input 
                 type="password" 
                 className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
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
    <div className="min-h-screen bg-gray-950 p-6 space-y-6 text-white relative">
      
      {/* INTERVENTION MODAL */}
      {interventionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <button 
                    onClick={() => setInterventionModal(null)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>
                
                <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Intervene for {interventionModal.name}</h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Student has 0 connections and low skill avg ({interventionModal.avg_skill}%).
                    </p>
                </div>

                <div className="space-y-3">
                    <button 
                        onClick={() => handleIntervention('Mentor')}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white p-4 rounded-xl flex items-center justify-between group transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg"><UserCheck className="w-5 h-5" /></div>
                            <div className="text-left">
                                <p className="font-bold">Assign a Mentor</p>
                                <p className="text-xs text-purple-200">Match with a High-Performing Senior</p>
                            </div>
                        </div>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded">Best for Guidance</span>
                    </button>

                    <button 
                        onClick={() => handleIntervention('Peer Group')}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-xl flex items-center justify-between group transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg"><UserPlus className="w-5 h-5" /></div>
                            <div className="text-left">
                                <p className="font-bold">Assign to Peer Group</p>
                                <p className="text-xs text-emerald-200">Add to an existing study circle</p>
                            </div>
                        </div>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded">Best for Social</span>
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
            <h1 className="text-3xl font-bold text-white">Instructor Dashboard</h1>
            <p className="text-gray-400">Real-time analysis of student engagement and skill gaps.</p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid md:grid-cols-4 gap-4">
        <KpiCard title="Total Students" value={kpi.total || 0} icon={<Users className="text-blue-400" />} />
        <KpiCard title="At-Risk (Isolated)" value={kpi.atRisk || 0} icon={<AlertTriangle className="text-red-400" />} color="border-red-500/50 bg-red-900/10" />
        <KpiCard title="Avg Class Skill" value={`${kpi.avg || 0}%`} icon={<TrendingUp className="text-green-400" />} />
        <KpiCard title="Sessions Today" value="12" icon={<CheckCircle className="text-purple-400" />} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 h-[500px]">
        
        {/* LEFT: The "God View" Graph */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
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
                nodeCanvasObject={(node, ctx, globalScale) => {
                  const label = node.id;
                  const fontSize = 12/globalScale;
                  ctx.fillStyle = node.color;
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
                  ctx.fill();
                  ctx.font = `${fontSize}px Sans-Serif`;
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillStyle = 'white';
                  ctx.fillText(label, node.x, node.y + 8);
                }}
                linkColor={() => '#334155'}
                backgroundColor="#020617"
                width={600}
                height={450}
             />
          </div>
        </div>

        {/* RIGHT: STUDENT TABLE */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50">
            <h3 className="font-bold text-white text-red-400 flex items-center gap-2">
              <AlertTriangle size={18} /> At-Risk Students
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-0">
             {atRiskList.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-slate-500">
                     <CheckCircle className="w-10 h-10 mb-2 text-green-500/50" />
                     <p>All students are healthy!</p>
                 </div>
             ) : (
                 <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-gray-950 text-gray-200 font-bold uppercase text-xs">
                        <tr>
                            <th className="p-4">Name / Dept</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {atRiskList.map(student => (
                            <tr key={student.id} className="hover:bg-gray-800/50 transition-colors">
                                <td className="p-4 font-medium text-white">
                                    {student.name}
                                    {/* SAFEGUARDED VALUES */}
                                    <div className="text-xs text-gray-500">
                                        {student.dept || "General"} • {student.avg_skill || 0}% Avg
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded text-xs font-bold bg-red-900/30 text-red-400 border border-red-500/30">
                                        At-Risk
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => setInterventionModal(student)}
                                        className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded flex items-center gap-1 ml-auto transition-colors"
                                    >
                                        <ShieldAlert className="w-3 h-3" /> Intervene
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Helper
const KpiCard = ({ title, value, icon, color = "bg-gray-900 border-gray-800" }) => (
    <div className={`p-5 rounded-xl border ${color} flex items-center gap-4`}>
        <div className="p-3 bg-gray-950 rounded-lg border border-gray-800">{icon}</div>
        <div>
            <p className="text-gray-400 text-xs uppercase font-bold">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);