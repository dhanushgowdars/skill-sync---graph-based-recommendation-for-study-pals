// src/pages/Stats.jsx
import { useEffect, useState } from "react";
import { Trophy, Star, Medal, TrendingUp, Activity } from "lucide-react";
import { useUser } from "../context/UserContext"; // adjust path if needed

export default function Stats() {
  const { user } = useUser ? useUser() : { user: { id: 1, name: "Student" } };
  const userId = user?.id || 1;

  const [stats, setStats] = useState(null);
  const [classStats, setClassStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fallbackProfile = {
      name: user?.name || "Student",
      level: "Level 3 Learner",
      totalSkills: 0,
      avgProficiency: 0,
      guruBadges: 0,
      interests: [],
      badges: [],
      strongestSkill: null,
      weakestSkill: null,
    };

    const fetchStats = async () => {
      // ---- 1) USER STATS ----
      try {
        setError(null);
        const res = await fetch(
          `http://localhost:5000/api/user-stats/${userId}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch user stats");
        }
        const data = await res.json();

        const themeByType = {
          Guru: {
            color: "text-green-400",
            border: "border-green-500/50",
            bg: "bg-green-500/10",
            bar: "bg-green-400",
          },
          Specialist: {
            color: "text-yellow-400",
            border: "border-yellow-500/50",
            bg: "bg-yellow-500/10",
            bar: "bg-yellow-400",
          },
          Learner: {
            color: "text-blue-400",
            border: "border-blue-500/50",
            bg: "bg-blue-500/10",
            bar: "bg-blue-400",
          },
        };

        const mappedBadges = (data.skills || []).map((s) => {
          const theme = themeByType[s.badge_type] || themeByType.Learner;
          return {
            name: s.name,
            type: s.badge_type,
            level: s.level,
            ...theme,
          };
        });

        // strongest & weakest skill from real data
        const skillsArr = data.skills || [];
        let strongestSkill = null;
        let weakestSkill = null;

        if (skillsArr.length > 0) {
          strongestSkill = skillsArr.reduce((best, s) =>
            best == null || s.level > best.level ? s : best
          , null);

          weakestSkill = skillsArr.reduce((worst, s) =>
            worst == null || s.level < worst.level ? s : worst
          , null);
        }

        const profile = {
          name: data.name || fallbackProfile.name,
          level: data.level_label || fallbackProfile.level,
          totalSkills:
            typeof data.total_skills === "number"
              ? data.total_skills
              : fallbackProfile.totalSkills,
          avgProficiency:
            typeof data.avg_proficiency === "number"
              ? data.avg_proficiency
              : fallbackProfile.avgProficiency,
          guruBadges:
            typeof data.guru_badges === "number"
              ? data.guru_badges
              : fallbackProfile.guruBadges,
          interests: data.interests || [],
          badges: mappedBadges,
          strongestSkill,
          weakestSkill,
        };

        setStats(profile);
      } catch (err) {
        console.error(err);
        setError("Backend not reachable, showing local fallback");
        setStats(fallbackProfile);
      }

      // ---- 2) CLASS / TEACHER STATS (optional) ----
      try {
        const resClass = await fetch("http://localhost:5000/api/teacher/stats");
        if (!resClass.ok) throw new Error("Failed to fetch class stats");
        const cls = await resClass.json();
        setClassStats({
          avgClassSkill: cls.avg_class_skill || 0,
          totalStudents: cls.total_students || 0,
        });
      } catch (err) {
        console.error("Class stats error:", err);
        // classStats stays null if this fails – UI will just hide that card
      }
    };

    fetchStats();
  }, [userId, user?.name]);

  if (!stats) {
    return <div className="text-white p-10">Loading Stats...</div>;
  }

  const comparisonText =
    classStats && typeof classStats.avgClassSkill === "number"
      ? stats.avgProficiency > classStats.avgClassSkill
        ? "You are above the class average 🎯"
        : stats.avgProficiency < classStats.avgClassSkill
        ? "You are below the class average – good chance to level up 💪"
        : "You are exactly at the class average."
      : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6 bg-gray-950 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-purple-900/20">
          {stats.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{stats.name}</h1>
          <p className="text-slate-400 font-medium">{stats.level}</p>

          {stats.interests && stats.interests.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {stats.interests.map((interest, idx) => (
                <span
                  key={idx}
                  className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="text-xs text-amber-300 bg-amber-900/40 border border-amber-700/60 px-3 py-2 rounded-lg inline-block mb-2">
          {error}
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total Skills"
          val={stats.totalSkills}
          icon={Trophy}
          color="text-blue-400"
          bg="bg-blue-500/10"
          border="border-blue-500/20"
        />
        <StatCard
          label="Avg Proficiency"
          val={`${stats.avgProficiency}%`}
          icon={Star}
          color="text-yellow-400"
          bg="bg-yellow-500/10"
          border="border-yellow-500/20"
        />
        <StatCard
          label="Guru Badges"
          val={stats.guruBadges}
          icon={Medal}
          color="text-purple-400"
          bg="bg-purple-500/10"
          border="border-purple-500/20"
        />
      </div>

      {/* Insights Row: Strongest Skill + Class Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.strongestSkill && (
          <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-start gap-4">
            <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-300">
              <TrendingUp size={24} />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase text-emerald-300 font-semibold tracking-wide mb-1">
                Strongest Skill
              </p>
              <p className="text-lg font-bold text-white">
                {stats.strongestSkill.name}
              </p>
              <p className="text-sm text-slate-300 mt-1">
                You are at{" "}
                <span className="font-semibold">
                  {stats.strongestSkill.level}%
                </span>{" "}
                proficiency. This is your best area – good candidate for helping
                peers or mentoring juniors.
              </p>
            </div>
          </div>
        )}

        {classStats && (
          <div className="p-5 rounded-xl border border-sky-500/30 bg-sky-500/5 flex items-start gap-4">
            <div className="p-3 rounded-full bg-sky-500/20 text-sky-300">
              <Activity size={24} />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase text-sky-300 font-semibold tracking-wide mb-1">
                You vs Class Average
              </p>
              <div className="flex justify-between text-sm mb-2">
                <div>
                  <p className="text-slate-400">Your Avg</p>
                  <p className="text-xl font-bold text-white">
                    {stats.avgProficiency}%
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Class Avg</p>
                  <p className="text-xl font-bold text-white">
                    {Math.round(classStats.avgClassSkill)}%
                  </p>
                </div>
              </div>
              {comparisonText && (
                <p className="text-xs text-slate-300 mt-1">{comparisonText}</p>
              )}
              <p className="text-[10px] text-slate-500 mt-2">
                Based on{" "}
                <span className="font-semibold">
                  {classStats.totalStudents}
                </span>{" "}
                students in your cohort.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Badges Section */}
      <div className="w-full">
        <div className="bg-gray-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Medal className="text-yellow-500" /> Earned Badges
          </h2>

          {stats.badges.length === 0 ? (
            <p className="text-slate-400 text-sm">
              No skills recorded yet. Add your skills during onboarding to see
              badges here.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.badges.map((badge, idx) => (
                <div
                  key={idx}
                  className={`relative overflow-hidden flex flex-col p-5 rounded-xl border transition-all hover:-translate-y-1 hover:shadow-lg ${badge.bg} ${badge.border}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-inner text-2xl bg-gray-900/40 ${badge.border} ${badge.color}`}
                    >
                      {badge.level > 80
                        ? "🥇"
                        : badge.level > 50
                        ? "🥈"
                        : "🥉"}
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full bg-black/20 uppercase tracking-wider ${badge.color}`}
                    >
                      {badge.type}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-xl mb-1">
                      {badge.name}
                    </h3>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs text-slate-400">
                        Proficiency
                      </span>
                      <span className={`text-lg font-bold ${badge.color}`}>
                        {badge.level}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${badge.bar}`}
                        style={{ width: `${badge.level}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ label, val, icon: Icon, color, bg, border }) => (
  <div
    className={`p-6 rounded-xl flex items-center gap-5 border ${border} ${bg} transition-all hover:bg-opacity-70`}
  >
    <div className={`p-3 rounded-xl bg-gray-950/50 ${color} shadow-sm`}>
      <Icon size={28} />
    </div>
    <div>
      <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">
        {label}
      </p>
      <p className="text-3xl font-black text-white">{val}</p>
    </div>
  </div>
);
