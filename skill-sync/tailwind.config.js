/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f1117", // Deep dark blue (Exact match to screenshot)
        card: "#1e293b",       // Slate-800 for cards
        primary: "#8b5cf6",    // Violet-500 (The main purple accent)
        secondary: "#3b82f6",  // Blue-500 (The secondary blue accent)
        success: "#22c55e",    // Green for "Expert" or "Peer"
        danger: "#ef4444",     // Red for "Beginner"
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}