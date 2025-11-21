import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { LogOut, Home, LayoutDashboard, PieChart, School } from 'lucide-react';

export default function Navbar() {
  const { user } = useUser();
  const location = useLocation(); 

  const isActive = (path) => location.pathname === path ? "text-primary bg-primary/10" : "text-slate-400 hover:text-white hover:bg-slate-800";
  const baseClass = "flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-medium";

  // --- THE FIX: CLEAR DATA ON LOGOUT ---
  const handleLogout = () => {
    localStorage.clear(); // 1. Wipes all saved skills/name
    window.location.href = '/'; // 2. Force reloads the page to Landing
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            S
          </div>
          <span className="text-white">SkillSync</span>
        </Link>

        {/* Navigation Links */}
        {user.name && (
          <div className="hidden md:flex items-center gap-2">
            <Link to="/" className={`${baseClass} ${isActive('/')}`}>
              <Home size={16} /> Home
            </Link>
            <Link to="/dashboard" className={`${baseClass} ${isActive('/dashboard')}`}>
              <LayoutDashboard size={16} /> Find Pals
            </Link>
            <Link to="/stats" className={`${baseClass} ${isActive('/stats')}`}>
              <PieChart size={16} /> My Stats
            </Link>
            <Link to="/teacher" className={`${baseClass} ${isActive('/teacher')}`}>
              <School size={16} /> Teacher View
            </Link>
          </div>
        )}

        {/* User Profile / Logout */}
        <div className="flex items-center gap-4">
          {user.name ? (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <span className="text-sm font-medium text-slate-200 hidden sm:block">{user.name}</span>
              
              {/* LOGOUT BUTTON WITH FIX */}
              <button 
                onClick={handleLogout} 
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                title="Logout & Reset"
              >
                <LogOut size={18} />
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