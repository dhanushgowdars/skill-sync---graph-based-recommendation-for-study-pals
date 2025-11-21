import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Plus, X, ArrowRight, Trophy, Target } from 'lucide-react';

export default function Onboarding() {
  const { user, addSkill, addInterest } = useUser();
  const navigate = useNavigate();
  
  const [skillInput, setSkillInput] = useState('');
  const [proficiency, setProficiency] = useState(40); // Default start at 40%
  const [interestInput, setInterestInput] = useState('');

  // Helper to determine color based on slider value
  const getLevelColor = (val) => {
    if (val < 40) return "text-red-400";       // Beginner
    if (val < 80) return "text-yellow-400";    // Intermediate
    return "text-green-400";                   // Expert
  };

  const getLevelLabel = (val) => {
    if (val < 40) return "Rookie";
    if (val < 80) return "Specialist";
    return "Guru";
  };

  const handleAddSkill = () => {
    if (skillInput.trim()) {
      addSkill(skillInput, proficiency);
      setSkillInput('');
      setProficiency(40); // Reset slider
    }
  };

  const handleAddInterest = () => {
    if (interestInput.trim()) {
      addInterest(interestInput);
      setInterestInput('');
    }
  };

  const handleEnterKey = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="min-h-screen p-6 pb-20">
      
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-10 mt-4 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Welcome, <span className="text-primary">{user.name || "Scholar"}</span>!
        </h1>
        <p className="text-slate-400">Let's build your knowledge profile.</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* --- SECTION 1: SKILLS (The Slider Logic) --- */}
        <div className="bg-card border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Trophy size={20} /></div>
            <h2 className="text-xl font-bold text-white">Add Your Skills</h2>
          </div>
          
          {/* Input Area */}
          <div className="space-y-4">
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="e.g. Python, React, Public Speaking"
                className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => handleEnterKey(e, handleAddSkill)}
              />
              <button 
                onClick={handleAddSkill}
                className="bg-primary hover:bg-primary/90 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!skillInput}
              >
                <Plus size={24} />
              </button>
            </div>

            {/* The Magic Slider (Only shows when typing) */}
            <div className={`bg-slate-900/80 p-4 rounded-xl border border-slate-700 transition-all duration-300 ${skillInput ? 'opacity-100 translate-y-0' : 'opacity-50 grayscale'}`}>
              <div className="flex justify-between mb-2 text-sm font-medium">
                <span className="text-slate-400">Proficiency: <span className={getLevelColor(proficiency)}>{getLevelLabel(proficiency)}</span></span>
                <span className="text-white">{proficiency}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={proficiency} 
                onChange={(e) => setProficiency(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                disabled={!skillInput}
              />
            </div>
          </div>

          {/* List of Added Skills */}
          <div className="mt-6 space-y-3">
            {user.skills.length === 0 && (
              <p className="text-center text-slate-600 text-sm italic">No skills added yet. Try adding "Python"!</p>
            )}
            {user.skills.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-900/40 border border-slate-800/50 p-3 rounded-lg group hover:border-slate-700 transition-colors">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-slate-200">{s.name}</span>
                    <span className={`text-xs font-bold ${getLevelColor(s.proficiency)}`}>{getLevelLabel(s.proficiency)} ({s.proficiency}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${s.proficiency > 80 ? 'bg-green-500' : s.proficiency > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                      style={{ width: `${s.proficiency}%` }}
                    />
                  </div>
                </div>
                {/* Delete Button (Mock - just UI for now) */}
                <button className="ml-4 text-slate-600 hover:text-red-400 transition-colors">
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* --- SECTION 2: INTERESTS (Tags) --- */}
        <div className="bg-card border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Target size={20} /></div>
            <h2 className="text-xl font-bold text-white">Your Interests</h2>
          </div>

          <div className="flex gap-3 mb-4">
            <input 
              type="text" 
              placeholder="e.g. Chess, Sci-Fi, Hackathons"
              className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={(e) => handleEnterKey(e, handleAddInterest)}
            />
            <button 
              onClick={handleAddInterest}
              className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!interestInput}
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {user.interests.map((int, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-full text-sm border border-slate-700 flex items-center gap-2">
                {int}
              </span>
            ))}
            {user.interests.length === 0 && (
              <p className="text-slate-600 text-sm italic">Add interests to find conversation starters.</p>
            )}
          </div>
        </div>

        {/* Navigation Footer */}
        <button 
          onClick={() => navigate('/dashboard')}
          disabled={user.skills.length === 0}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
           Find My Matches <ArrowRight size={20} />
        </button>

      </div>
    </div>
  );
}