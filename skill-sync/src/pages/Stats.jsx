import { useUser } from '../context/UserContext';
import { Trophy, Star, Clock, Target, Flame, Medal } from 'lucide-react';

export default function Stats() {
  const { user } = useUser();

  // 1. Calculate Real Stats
  const totalSkills = user.skills.length;
  const avgProficiency = totalSkills > 0 
    ? Math.round(user.skills.reduce((acc, curr) => acc + curr.proficiency, 0) / totalSkills) 
    : 0;
  const guruCount = user.skills.filter(s => s.proficiency > 80).length;
  const totalInterests = user.interests.length;

  // 2. Mock Data for "Activity" (Hardcoded for demo)
  const recentSessions = [
    { partner: "Rahul Sharma", topic: "Python Basics", duration: "45 min", date: "Today" },
    { partner: "Sarah Chen", topic: "React Hooks", duration: "1 hr 20 min", date: "Yesterday" },
    { partner: "David Lee", topic: "System Design", duration: "30 min", date: "Nov 18" },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 bg-background space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
          {user.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{user.name}</h1>
          <p className="text-slate-400">{user.dept} Student • Level 4 Scholar</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Skills", val: totalSkills, icon: Target, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Avg Proficiency", val: `${avgProficiency}%`, icon: Star, color: "text-yellow-400", bg: "bg-yellow-400/10" },
          { label: "Guru Badges", val: guruCount, icon: Trophy, color: "text-purple-400", bg: "bg-purple-400/10" },
          { label: "Study Streaks", val: "3 Days", icon: Flame, color: "text-orange-400", bg: "bg-orange-400/10" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-card border border-slate-800 p-5 rounded-xl flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase font-bold">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* BADGES SECTION (Dynamic) */}
        <div className="bg-card border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Medal className="text-yellow-500" /> Earned Badges
          </h2>
          <div className="space-y-4">
            {user.skills.length === 0 && <p className="text-slate-500 italic">Add skills to earn badges!</p>}
            
            {user.skills.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                {/* Badge Icon Logic */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg text-xl
                  ${skill.proficiency > 80 ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 
                    skill.proficiency > 40 ? 'bg-slate-300/20 border-slate-300 text-slate-300' : 
                    'bg-orange-700/20 border-orange-700 text-orange-700'}`
                }>
                  {skill.proficiency > 80 ? '🥇' : skill.proficiency > 40 ? '🥈' : '🥉'}
                </div>
                
                <div>
                  <h3 className="font-bold text-white text-lg">{skill.name} {skill.proficiency > 80 ? "Guru" : "Specialist"}</h3>
                  <p className="text-xs text-slate-400">Proficiency: {skill.proficiency}%</p>
                </div>
                
                <div className="ml-auto text-xs font-bold px-2 py-1 rounded bg-slate-800 text-slate-300">
                  {skill.proficiency > 80 ? "Expert" : "Learning"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT ACTIVITY (Mock) */}
        <div className="bg-card border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="text-blue-500" /> Recent Sessions
          </h2>
          <div className="space-y-0">
            {recentSessions.map((session, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-400">
                    {session.partner.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-white">{session.topic}</p>
                    <p className="text-xs text-slate-500">with {session.partner}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-400">{session.duration}</p>
                  <p className="text-xs text-slate-600">{session.date}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors">
            View All History
          </button>
        </div>

      </div>
    </div>
  );
}