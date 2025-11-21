import { Video, ExternalLink, BookOpen } from 'lucide-react';

const MatchCard = ({ match }) => {
  // Function to handle video room
  const startSession = () => {
    const roomName = `SkillSync-${match.id}-${Math.floor(Math.random() * 1000)}`;
    window.open(`https://meet.jit.si/${roomName}`, '_blank');
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-indigo-500 transition-all shadow-lg">
      {/* Header: Avatar & Name */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
            {match.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{match.name}</h3>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              match.type === 'Mentor' ? 'bg-purple-900 text-purple-200' : 'bg-green-900 text-green-200'
            }`}>
              {match.type}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-indigo-400">{match.score}%</div>
          <div className="text-xs text-gray-400">Match Score</div>
        </div>
      </div>

      {/* 1. SHOW MATCHED SKILLS & PROFICIENCY (The Fix) */}
      <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
        <p className="text-xs text-gray-400 mb-2 uppercase font-semibold">Shared Skills</p>
        <div className="space-y-2">
          {match.matched_skills.slice(0, 2).map((skill, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <span className="text-gray-300">{skill.name}</span>
              <div className="flex items-center gap-2">
                {/* Progress Bar Visual */}
                <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${match.type === 'Mentor' ? 'bg-purple-500' : 'bg-green-500'}`} 
                    style={{ width: `${skill.their_level}%` }}
                  />
                </div>
                <span className="text-white font-mono">{skill.their_level}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. SHOW RECOMMENDATION (The Fix) */}
      {match.recommendation_link && (
        <div className="mb-4 p-3 border border-dashed border-gray-600 rounded-lg flex items-center justify-between group hover:bg-gray-700/30 transition-colors">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-300">Suggested Roadmap</span>
          </div>
          <a 
            href={match.recommendation_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            Open <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Action Button */}
      <button 
        onClick={startSession}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
      >
        <Video className="w-4 h-4" />
        Start Study Session
      </button>
    </div>
  );
};

export default MatchCard;