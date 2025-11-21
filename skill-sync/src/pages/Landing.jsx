import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Sparkles, Users, Zap, ArrowRight } from 'lucide-react';

export default function Landing() {
  const [name, setName] = useState('');
  const [dept, setDept] = useState('');
  const { login } = useUser();
  const navigate = useNavigate();

  const handleStart = (e) => {
    e.preventDefault();
    if (name && dept) {
      login(name, dept);
      navigate('/onboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="z-10 max-w-5xl w-full text-center space-y-8 mt-10">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4 animate-fade-in">
          <Sparkles size={14} />
          <span>Welcome to SkillSync</span>
        </div>
        
        {/* Hero Title */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
          Find your perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Study Pal</span>
          <br /> based on Skills.
        </h1>
        
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Stop studying alone. Connect with mentors who can teach you and peers who can learn with you based on actual proficiency.
        </p>

        {/* Feature Cards (Grid) */}
        <div className="grid md:grid-cols-3 gap-4 my-12 text-left">
          {[
            { icon: Users, title: "Smart Matching", desc: "Match based on skill gaps (<15%) or mentorship (>40%)." },
            { icon: Sparkles, title: "Skill-Based", desc: "Focus on what you know, not just your grades." },
            { icon: Zap, title: "Instant Sessions", desc: "Jump into video rooms instantly with one click." }
          ].map((feature, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-card border border-slate-800 hover:border-primary/50 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* The "Get Started" Form */}
        <div className="max-w-md mx-auto bg-slate-900/50 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white mb-6">Start Your Journey</h2>
          <form onSubmit={handleStart} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Your Name</label>
              <input 
                type="text" 
                placeholder="e.g. Dhanush RS"
                className="w-full bg-background border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Department</label>
              <select 
                className="w-full bg-background border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                required
              >
                <option value="">Select Department...</option>
                <option value="CSE">Computer Science (CSE)</option>
                <option value="ISE">Information Science (ISE)</option>
                <option value="ECE">Electronics (ECE)</option>
                <option value="AIML">AI & ML</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 group">
              Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}