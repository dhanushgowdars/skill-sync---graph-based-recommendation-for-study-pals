// src/pages/Dashboard.jsx
import React, { useEffect, useRef, useState, useCallback, Suspense, lazy } from "react";
import { BookOpen, Clock, Video, ExternalLink } from "lucide-react";
import { useUser } from "../context/UserContext"; // adapt path if needed

const ForceGraph2D = lazy(() => import("react-force-graph-2d"));
import { forceManyBody, forceLink, forceCenter } from "d3-force";

/**
 * Dashboard.jsx
 * - Moderate node spacing: not too close, not too far
 * - Uses d3-force with tuned parameters:
 *    charge: -140 (moderate repulsion)
 *    link distances: connection ~130, skill ~100, interest ~110
 * - Three graph tabs remain (Network / Skills / Combined)
 */

export default function Dashboard() {
  const ctx = useUser ? useUser() : { user: { id: 1, name: "Dhanush" } };
  const userId = ctx?.user?.id || 1;

  const fgRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [graphMaster, setGraphMaster] = useState({ nodes: [], links: [] });
  const [matches, setMatches] = useState([]);

  const [activeTab, setActiveTab] = useState("network");
  const [graphNetwork, setGraphNetwork] = useState({ nodes: [], links: [] });
  const [graphSkills, setGraphSkills] = useState({ nodes: [], links: [] });
  const [graphCombined, setGraphCombined] = useState({ nodes: [], links: [] });

  // fetch recommendations + compact graph
  useEffect(() => {
    setLoading(true);
    setErrorMsg(null);
    const recUrl = `http://localhost:5000/api/recommend/${userId}`;
    const graphUrl = `http://localhost:5000/api/graph-data?user_id=${userId}`;

    Promise.all([
      fetch(recUrl).then((r) => (r.ok ? r.json() : Promise.reject("recommend API error"))),
      fetch(graphUrl).then((r) => (r.ok ? r.json() : Promise.reject("graph API error")))
    ])
      .then(([rec, graph]) => {
        setMatches((rec || []).slice(0, 3));
        setGraphMaster(graph || { nodes: [], links: [] });
      })
      .catch((err) => {
        console.error(err);
        setErrorMsg(String(err));
      })
      .finally(() => setLoading(false));
  }, [userId]);

  // build filtered graphs
  useEffect(() => {
    const nodes = graphMaster.nodes || [];
    const links = graphMaster.links || [];
    const nodeById = new Map((nodes || []).map((n) => [n.id, n]));

    const meNode = (nodes || []).find((n) => n.role === "me" || String(n.id).includes(`user-${userId}`) || n.is_me);

    // NETWORK: users + connections
    const netNodes = (nodes || []).filter((n) => n.group === "user" || n.role === "me" || n.role === "peer" || n.role === "mentor");
    const netLinks = (links || []).filter((l) => l.type === "connection" || (String(l.source).startsWith("user-") && String(l.target).startsWith("user-")));
    if (meNode && !netNodes.find((n) => n.id === meNode.id)) netNodes.push(meNode);
    setGraphNetwork({ nodes: netNodes, links: netLinks });

    // SKILLS: me + skill nodes + skill links
    const skillNodesMap = new Map();
    const skillNodes = [];
    const skillLinks = [];

    if (meNode) skillNodes.push(meNode);
    (links || []).forEach((l) => {
      if (l.type === "skill") {
        const src = nodeById.get(l.source) || nodeById.get(String(l.source));
        const tgt = nodeById.get(l.target) || nodeById.get(String(l.target));
        const skillNode = src?.group === "skill" ? src : tgt?.group === "skill" ? tgt : null;
        const userNode = src?.group === "user" ? src : tgt?.group === "user" ? tgt : null;

        if (skillNode && !skillNodesMap.has(skillNode.id)) {
          skillNodesMap.set(skillNode.id, skillNode);
          skillNodes.push(skillNode);
        }
        if (userNode && !skillNodes.find((n) => n.id === userNode.id)) skillNodes.push(userNode);
        if (skillNode) skillLinks.push(l);
      }
    });
    setGraphSkills({ nodes: skillNodes, links: skillLinks });

    // COMBINED: user + skill + interest (caps to avoid clutter)
    const combinedSkillSet = new Set();
    const combinedInterestSet = new Set();
    const combinedNodes = [];
    const combinedLinks = [];

    if (meNode) combinedNodes.push(meNode);
    (nodes || []).forEach((n) => { if (n.group === "user") combinedNodes.push(n); });

    for (const l of (links || [])) {
      if (l.type === "skill") {
        const s = nodeById.get(l.source) || nodeById.get(String(l.source));
        const t = nodeById.get(l.target) || nodeById.get(String(l.target));
        if (s && s.group === "skill" && combinedSkillSet.size < 6) { combinedSkillSet.add(s.id); combinedNodes.push(s); }
        if (t && t.group === "skill" && combinedSkillSet.size < 6) { combinedSkillSet.add(t.id); combinedNodes.push(t); }
        combinedLinks.push(l);
      } else if (l.type === "interest") {
        const s = nodeById.get(l.source) || nodeById.get(String(l.source));
        const t = nodeById.get(l.target) || nodeById.get(String(l.target));
        if (s && s.group === "interest" && combinedInterestSet.size < 4) { combinedInterestSet.add(s.id); combinedNodes.push(s); }
        if (t && t.group === "interest" && combinedInterestSet.size < 4) { combinedInterestSet.add(t.id); combinedNodes.push(t); }
        combinedLinks.push(l);
      } else {
        combinedLinks.push(l);
      }
    }
    const seen = new Set();
    const dedup = [];
    for (const n of combinedNodes) {
      if (!seen.has(n.id)) { dedup.push(n); seen.add(n.id); }
    }
    setGraphCombined({ nodes: dedup, links: combinedLinks });
  }, [graphMaster, userId]);

  // paint nodes (moderate sizes)
  const paintNode = useCallback((node, ctx, globalScale) => {
    if (typeof node.x !== "number") return;
    const label = node.label || node.id || "";
    // moderate size: a bit larger than minimal but not huge
    const baseSize = Math.max(6, (node.val ? node.val / 2 : 8));
    const fontSize = Math.max(9, 11 / globalScale);

    const color = node.color || (node.role === "me" ? "#fb923c" : node.group === "skill" ? "#f59e0b" : node.group === "interest" ? "#ef4444" : "#60a5fa");
    ctx.fillStyle = color;

    ctx.beginPath();
    if (node.role === "skill" || node.group === "skill") {
      const s = baseSize;
      ctx.moveTo(node.x, node.y - s);
      ctx.lineTo(node.x + s, node.y);
      ctx.lineTo(node.x, node.y + s);
      ctx.lineTo(node.x - s, node.y);
      ctx.closePath();
      ctx.fill();
    } else if (node.role === "interest" || node.group === "interest") {
      const s = baseSize + 1;
      ctx.moveTo(node.x, node.y - s);
      ctx.lineTo(node.x + s, node.y + s);
      ctx.lineTo(node.x - s, node.y + s);
      ctx.closePath();
      ctx.fill();
    } else {
      const r = baseSize + (node.role === "me" ? 2 : 0);
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
      ctx.fill();
    }

    ctx.lineWidth = 0.9;
    ctx.strokeStyle = "rgba(0,0,0,0.22)";
    ctx.stroke();

    const showLabel = globalScale > 0.9 || node.role === "me";
    if (showLabel) {
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const textW = ctx.measureText(label).width;
      const pad = 7;
      const bgW = textW + pad * 2;
      const bgH = fontSize + 6;
      ctx.fillStyle = "rgba(7,9,14,0.82)";
      ctx.fillRect(node.x - bgW / 2, node.y + (baseSize + 6), bgW, bgH);
      ctx.fillStyle = "#e6eef8";
      ctx.fillText(label, node.x, node.y + (baseSize + 6) + bgH / 2);
    }
  }, []);

  // tune forces for a balanced layout
  useEffect(() => {
    const timer = setTimeout(() => {
      const fg = fgRef.current;
      if (!fg || !fg.d3Force) return;

      // moderate repulsion (not too strong)
      fg.d3Force("charge", forceManyBody().strength(-140)); // moderated from -220

      // link distances moderate: connection ~130, skill ~100, interest ~110
      fg.d3Force("link", forceLink().distance((d) => {
        if (!d || !d.type) return 120;
        if (d.type === "connection") return 130;
        if (d.type === "skill") return 100;
        if (d.type === "interest") return 110;
        return 120;
      }).strength(0.75));

      fg.d3Force("center", forceCenter());

      // small reheat to help layout settle nicely (not fling)
      try {
        fg.d3ReheatSimulation();
      } catch (e) {
        // OK if not available
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [activeTab, graphNetwork, graphSkills, graphCombined]);

  const getActiveGraph = () => {
    if (activeTab === "network") return graphNetwork;
    if (activeTab === "skills") return graphSkills;
    return graphCombined;
  };

  const linkDistance = (link) => {
    if (!link || !link.type) return 120;
    if (link.type === "connection") return 130;
    if (link.type === "skill") return 100;
    if (link.type === "interest") return 110;
    return 120;
  };

  return (
    <div className="min-h-screen p-6 bg-slate-900 text-white">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">Your Study Matches</h1>
          <p className="text-sm text-slate-400">Compact recommendations and focused collaborator graphs</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-3 rounded-md bg-rose-900/60 p-3 text-rose-200">
          <strong>Error:</strong> {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[660px]">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex gap-2">
            <Tab label="Network" active={activeTab === "network"} onClick={() => setActiveTab("network")} />
            <Tab label="Skills" active={activeTab === "skills"} onClick={() => setActiveTab("skills")} />
            <Tab label="Combined" active={activeTab === "combined"} onClick={() => setActiveTab("combined")} />
          </div>

          <div className="flex-1 bg-slate-800/20 rounded-2xl border border-slate-700 p-4 relative overflow-hidden">
            <div className="absolute left-6 top-6 z-20 bg-slate-900/70 border border-slate-700 rounded-lg p-3 text-xs">
              <div className="font-semibold text-slate-300 mb-2">Legend</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-400" /> <div className="text-slate-300">You</div></div>
              <div className="flex items-center gap-2 mt-1"><div className="w-3 h-3 rotate-45 bg-amber-500" /> <div className="text-slate-300">Skill</div></div>
              <div className="flex items-center gap-2 mt-1"><div className="w-3 h-3 bg-red-500" /> <div className="text-slate-300">Interest</div></div>
            </div>

            <div className="absolute inset-0">
              {!loading && (
                <Suspense fallback={<div className="p-6 text-slate-400">Loading graph...</div>}>
                  <ForceGraph2D
                    ref={fgRef}
                    graphData={getActiveGraph()}
                    nodeLabel="label"
                    nodeCanvasObject={paintNode}
                    nodeRelSize={6}
                    linkColor={() => "#475569"}
                    linkWidth={(l) => (l.type === "connection" ? 1.0 : 0.7)}
                    linkDistance={(l) => linkDistance(l)}
                    onNodeClick={(node) => {
                      if (fgRef.current && node && typeof node.x === "number") {
                        fgRef.current.centerAt(node.x, node.y, 400);
                        fgRef.current.zoom(1.4, 700);
                      }
                    }}
                  />
                </Suspense>
              )}
              {loading && <div className="flex items-center justify-center h-full text-slate-400">Loading recommendations & graph…</div>}
            </div>
          </div>
        </div>

        <div className="space-y-4 overflow-y-auto custom-scrollbar p-1">
          {loading ? (
            <div className="text-slate-400">Finding matches…</div>
          ) : matches.length === 0 ? (
            <div className="text-slate-400">No matches found</div>
          ) : (
            matches.map((m) => <MatchCard key={m.id} match={m} />)
          )}
        </div>
      </div>
    </div>
  );
}

// Tab
function Tab({ label, active, onClick }) {
  return (
    <button onClick={onClick} className={`px-3 py-1 rounded-md text-sm font-medium transition ${active ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300"}`}>
      {label}
    </button>
  );
}

// MatchCard
function MatchCard({ match }) {
  const startSession = () => window.open(`https://meet.jit.si/SkillSync-${match.id}`, "_blank");
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
      <div className="p-4 flex justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${match.type === "Mentor" ? "bg-gradient-to-br from-purple-600 to-indigo-600" : "bg-gradient-to-br from-emerald-500 to-teal-500"}`}>{match.name.charAt(0)}</div>
          <div>
            <div className="font-semibold">{match.name}</div>
            <div className="text-xs text-slate-400">{match.dept} • {match.type}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl text-indigo-300 font-extrabold">{match.score}%</div>
          <div className="text-xs text-slate-500">Match Score</div>
        </div>
      </div>

      <div className="px-4 pb-4">
        {match.matched_skills && match.matched_skills.map((s, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-slate-700/40">
            <div className="text-sm text-slate-200">{s.name}</div>
            <div className="text-xs font-semibold px-2 py-0.5 rounded text-slate-100 bg-slate-700/40">{s.their_level}% Proficiency</div>
          </div>
        ))}

        <div className="bg-slate-900/60 p-3 mt-3 rounded-md border border-slate-700">
          <div className="text-xs text-indigo-300 font-bold mb-2 inline-flex items-center gap-2"><Clock className="w-3 h-3" /> AI Recommended Schedule</div>
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-lg font-bold">{match.study_plan?.daily_hours || 1}h</div>
              <div className="text-xs text-slate-400">Daily Goal</div>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-center">
              <div className="text-lg font-bold">{match.study_plan?.days_to_next_level || 14}</div>
              <div className="text-xs text-slate-400">Days to Level Up</div>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-center">
              <div className="text-sm font-bold text-emerald-400">{match.study_plan?.target_level || "Intermediate"}</div>
              <div className="text-xs text-slate-400">Next Milestone</div>
            </div>
          </div>

          <button onClick={() => window.open(match.recommendation_link, "_blank", "noopener")} className="mt-3 w-full flex items-center gap-3 p-2 rounded-md bg-indigo-600/10 border border-indigo-700/20">
            <BookOpen className="w-4 h-4 text-red-400" />
            <div className="flex-1 text-left">
              <div className="text-xs text-indigo-300 font-semibold">Recommended Content</div>
              <div className="text-sm truncate">{match.recommendation_title}</div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="mt-3">
          <button onClick={startSession} className="w-full bg-white text-black py-2 rounded-md font-semibold flex items-center justify-center gap-2">
            <Video className="w-4 h-4" /> Start Session
          </button>
        </div>
      </div>
    </div>
  );
}
