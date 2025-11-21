import { useEffect, useState } from 'react';
import { Trophy, Star, Medal } from 'lucide-react'; 

export default function Stats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // --- YOUR PROFILE DATA (FALLBACK) ---
    const myProfile = {
        name: "Manoj",
        level: "Level 5 Scholar",
        totalSkills: 3,
        avgProficiency: 75,
        guruBadges: 1,
        // Removed streak
        badges: [
            { 
                name: "Python", 
                type: "Specialist", 
                level: 59, 
                color: "text-yellow-400", 
                border: "border-yellow-500/50", 
                bg: "bg-yellow-500/10", 
                bar: "bg-yellow-400" // Explicit bar color
            },
            { 
                name: "Figma", 
                type: "Guru", 
                level: 81, 
                color: "text-green-400", 
                border: "border-green-500/50", 
                bg: "bg-green-500/10", 
                bar: "bg-green-400" // Explicit bar color
            },
            { 
                name: "React", 
                type: "Learner", 
                level: 30, 
                color: "text-blue-400", 
                border: "border-blue-500/50", 
                bg: "bg-blue-500/10", 
                bar: "bg-blue-400" // Explicit bar color
            }
        ],
        // Removed sessions
    };

    // Attempt to connect to Backend (Simulated fetch for now)
    fetch('http://localhost:5000/api/recommend/1')
      .then(() => {
          // Connection Success: For now, we keep using the profile object for UI consistency
          setStats(myProfile);
      })
      .catch(() => {
          console.log("Backend offline, loading local profile");
          setStats(myProfile);
      });
  }, []);

  if (!stats) return <div className="text-white p-10">Loading Stats...</div>;

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 bg-gray-950 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-purple-900/20">
          {stats.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{stats.name}</h1>
          <p className="text-slate-400 font-medium">{stats.level}</p>
        </div>
      </div>

      {/* Stats Grid (Removed Streak) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Skills" val={stats.totalSkills} icon={Trophy} color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20" />
        <StatCard label="Avg Proficiency" val={`${stats.avgProficiency}%`} icon={Star} color="text-yellow-400" bg="bg-yellow-500/10" border="border-yellow-500/20" />
        <StatCard label="Guru Badges" val={stats.guruBadges} icon={Medal} color="text-purple-400" bg="bg-purple-500/10" border="border-purple-500/20" />
      </div>

      {/* Badges Section (Expanded & Highlighted) */}
      <div className="w-full">
        <div className="bg-gray-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Medal className="text-yellow-500" /> Earned Badges
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.badges.map((badge, idx) => (
                    <div key={idx} className={`relative overflow-hidden flex flex-col p-5 rounded-xl border transition-all hover:-translate-y-1 hover:shadow-lg ${badge.bg} ${badge.border}`}>
                        
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-inner text-2xl bg-gray-900/40 ${badge.border} ${badge.color}`}>
                                {badge.level > 80 ? '🥇' : badge.level > 50 ? '🥈' : '🥉'}
                            </div>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full bg-black/20 uppercase tracking-wider ${badge.color}`}>
                                {badge.type}
                            </span>
                        </div>

                        <div>
                            <h3 className="font-bold text-white text-xl mb-1">{badge.name}</h3>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs text-slate-400">Proficiency</span>
                                <span className={`text-lg font-bold ${badge.color}`}>{badge.level}%</span>
                            </div>
                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${badge.bar}`} style={{ width: `${badge.level}%` }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ label, val, icon: Icon, color, bg, border }) => (
  <div className={`p-6 rounded-xl flex items-center gap-5 border ${border} ${bg} transition-all hover:bg-opacity-70`}>
    <div className={`p-3 rounded-xl bg-gray-950/50 ${color} shadow-sm`}><Icon size={28} /></div>
    <div>
      <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-black text-white">{val}</p>
    </div>
  </div>
);