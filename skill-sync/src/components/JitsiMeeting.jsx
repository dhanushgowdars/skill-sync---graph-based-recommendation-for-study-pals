// src/components/JitsiModal.jsx
import React, { useEffect, useRef } from "react";

export default function JitsiModal({ roomName, displayName, onClose }) {
  const containerRef = useRef();

  useEffect(() => {
    if (typeof window === "undefined" || !window.JitsiMeetExternalAPI) {
      console.error("Jitsi external API not loaded");
      return;
    }
    const domain = "meet.jit.si";
    const options = {
      roomName,
      parentNode: containerRef.current,
      userInfo: { displayName },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          "microphone", "camera", "hangup", "chat", "tileview", "desktop", "fullscreen"
        ]
      },
      configOverwrite: {
        enableWelcomePage: false
      }
    };
    const api = new window.JitsiMeetExternalAPI(domain, options);

    // Example event listeners
    api.addEventListener("participantJoined", (evt) => console.log("joined", evt));
    api.addEventListener("participantLeft", (evt) => console.log("left", evt));

    return () => {
      try { api.dispose(); } catch (e) {}
    };
  }, [roomName, displayName]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[90%] h-[80%] bg-slate-900 rounded-lg overflow-hidden">
        <div className="h-full" ref={containerRef} />
        <button onClick={onClose} className="absolute top-4 right-4 px-3 py-1 rounded bg-white/10">Close</button>
      </div>
    </div>
  );
}
