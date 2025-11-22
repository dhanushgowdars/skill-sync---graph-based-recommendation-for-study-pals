// src/components/MatchCard.jsx
import React, { useState, useRef, useEffect } from "react";
import { Video, ExternalLink, BookOpen } from "lucide-react";

/**
 * MatchCard
 * - Shows match info (avatar, skills, recommendation)
 * - "Start Study Session" opens an embedded Jitsi modal
 * - Falls back to opening a new tab if embedding fails
 *
 * Requirements: none (script loads dynamically)
 */

const JITSI_SCRIPT = "https://meet.jit.si/external_api.js";

// Helper to inject script once and wait for it
function loadJitsiScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject("no-window");
    if (window.JitsiMeetExternalAPI) return resolve(window.JitsiMeetExternalAPI);

    // Check if script already in DOM
    const existing = document.querySelector(`script[src="${JITSI_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.JitsiMeetExternalAPI));
      existing.addEventListener("error", () => reject("Failed to load Jitsi script"));
      return;
    }

    const script = document.createElement("script");
    script.src = JITSI_SCRIPT;
    script.async = true;
    script.onload = () => {
      if (window.JitsiMeetExternalAPI) resolve(window.JitsiMeetExternalAPI);
      else reject("Jitsi API not available after load");
    };
    script.onerror = () => reject("Failed to load Jitsi script");
    document.head.appendChild(script);
  });
}

function JitsiModal({ roomName, displayName = "Guest", onClose }) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    loadJitsiScript()
      .then(() => {
        if (!mounted) return;
        try {
          const domain = "meet.jit.si";
          const options = {
            roomName,
            parentNode: containerRef.current,
            userInfo: { displayName },
            configOverwrite: {
              enableWelcomePage: false
            },
            interfaceConfigOverwrite: {
              // keep toolbar compact for demo
              TOOLBAR_BUTTONS: [
                "microphone", "camera", "hangup", "chat", "tileview", "desktop", "fullscreen"
              ]
            }
          };
          // eslint-disable-next-line no-undef
          apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

          // optional: listen for events (for debugging)
          apiRef.current.addEventListener && apiRef.current.addEventListener("videoConferenceJoined", () => {
            // console.log("joined conference");
          });
        } catch (err) {
          console.error("Jitsi init error:", err);
          // if cannot init, call onClose with error so parent can fallback
          onClose && onClose(err);
        }
      })
      .catch((err) => {
        console.error("Load Jitsi failed:", err);
        onClose && onClose(err);
      });

    return () => {
      mounted = false;
      try {
        apiRef.current && apiRef.current.dispose();
      } catch (e) {
        // ignore
      }
    };
  }, [roomName, displayName, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-[92%] h-[86%] bg-slate-900 rounded-lg overflow-hidden relative shadow-2xl">
        <button
          onClick={() => {
            // call onClose which will dispose
            onClose && onClose();
          }}
          className="absolute top-3 right-3 z-40 px-3 py-1 rounded-md bg-white/10 text-white hover:bg-white/20"
        >
          Close
        </button>
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}

const MatchCard = ({ match, currentUserName = "Dhanush" }) => {
  // state to open embedded jitsi modal
  const [embedOpen, setEmbedOpen] = useState(false);
  // fallback reason (if embedding fails)
  const [embedError, setEmbedError] = useState(null);

  // startSession now opens modal instead of new tab; fallback to new tab if error
  const startSession = async () => {
    setEmbedError(null);
    const roomName = `SkillSync-${match.id}`; // deterministic room for repeatable join
    try {
      // try to load script first (fast if already cached)
      await loadJitsiScript();
      // open embedded modal
      setEmbedOpen(true);
    } catch (err) {
      console.warn("Embedding Jitsi failed, opening in new tab:", err);
      setEmbedError(String(err));
      // fallback: open in new tab so demo works for judges immediately
      window.open(`https://meet.jit.si/${roomName}`, "_blank");
    }
  };

  // If user closes modal due to script-init error, fallback to new tab
  const handleModalClose = (err) => {
    setEmbedOpen(false);
    if (err) {
      // fallback to new tab
      const roomName = `SkillSync-${match.id}`;
      window.open(`https://meet.jit.si/${roomName}`, "_blank");
    }
  };

  return (
    <>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-indigo-500 transition-all shadow-lg">
        {/* Header: Avatar & Name */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
              {match.name ? match.name.charAt(0) : "U"}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{match.name}</h3>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded ${
                  match.type === "Mentor" ? "bg-purple-900 text-purple-200" : "bg-green-900 text-green-200"
                }`}
              >
                {match.type}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-400">{match.score}%</div>
            <div className="text-xs text-gray-400">Match Score</div>
          </div>
        </div>

        {/* 1. SHOW MATCHED SKILLS & PROFICIENCY */}
        <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
          <p className="text-xs text-gray-400 mb-2 uppercase font-semibold">Shared Skills</p>
          <div className="space-y-2">
            {(match.matched_skills || []).slice(0, 2).map((skill, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-gray-300">{skill.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${match.type === "Mentor" ? "bg-purple-500" : "bg-green-500"}`}
                      style={{ width: `${skill.their_level}%` }}
                    />
                  </div>
                  <span className="text-white font-mono">{skill.their_level}%</span>
                </div>
              </div>
            ))}
            {(!match.matched_skills || match.matched_skills.length === 0) && (
              <div className="text-xs text-gray-400">No shared skills found</div>
            )}
          </div>
        </div>

        {/* 2. SHOW RECOMMENDATION */}
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

        {embedError && (
          <div className="mt-3 text-xs text-yellow-300">
            Embedded meeting failed to initialize — opened in new tab instead.
          </div>
        )}
      </div>

      {/* Embedded modal */}
      {embedOpen && (
        <JitsiModalWrapper
          roomName={`SkillSync-${match.id}`}
          displayName={currentUserNameFromApp(match) || "You"}
          onClose={handleModalClose}
        />
      )}
    </>
  );
};

/**
 * Lightweight wrapper that renders the JitsiModal and handles load fallback.
 * We keep JitsiModal internal to reduce number of files to paste.
 */
function JitsiModalWrapper({ roomName, displayName, onClose }) {
  // inner state to track if jitsi api loaded ok
  const [loadError, setLoadError] = useState(false);
  // when load error occurs we notify parent via onClose(err) and fallback will open new tab
  useEffect(() => {
    let cancelled = false;
    loadJitsiScript()
      .then(() => {
        if (cancelled) return;
        // okay — script available, the JitsiModal will initialize actual API
      })
      .catch((err) => {
        console.error("Jitsi script load failed in wrapper:", err);
        if (!cancelled) {
          setLoadError(true);
          onClose && onClose(err);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [onClose]);

  if (loadError) return null;

  return <JitsiModal roomName={roomName} displayName={displayName} onClose={onClose} />;
}

/* Helper to pick display name from your app/user context.
   Replace with your real user name logic if you have a UserContext.
*/
function currentUserNameFromApp(match) {
  // Example placeholder: return logged in user's name (replace with context)
  // If you use a UserContext, import and return user.name here.
  return "Dhanush";
}

// Export default MatchCard
export default MatchCard;
