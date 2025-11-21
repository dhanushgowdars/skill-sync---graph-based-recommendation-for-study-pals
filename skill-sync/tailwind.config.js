/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f1117",
        card: "#1e293b",
        primary: "#8b5cf6",
        secondary: "#3b82f6",
      },
    },
  },
  plugins: [],
}