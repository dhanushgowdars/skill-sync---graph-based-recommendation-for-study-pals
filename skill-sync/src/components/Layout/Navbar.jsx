import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-background/50 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
            S
          </div>
          <span className="text-white">SkillSync</span>
        </Link>

        {/* Navigation Links (Only show if logged in) */}
        {user.name && (
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <Link to="/dashboard" className="hover:text-primary transition-colors">Find Pals</Link>
            <Link to="/stats" className="hover:text-primary transition-colors">My Stats</Link>
            <Link to="/teacher" className="hover:text-primary transition-colors">Teacher View</Link>
          </div>
        )}

        {/* User Profile / Login State */}
        <div className="flex items-center gap-4">
          {user.name ? (
            <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 py-1.5 px-3 rounded-full">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold">
                {user.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-slate-200">{user.name}</span>
              <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="text-slate-500 hover:text-red-400 ml-2">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link to="/" className="text-sm font-medium text-slate-400 hover:text-white">
              Guest Mode
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}