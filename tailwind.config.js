/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: "#060913",
          card: "#0d1527",
          accent: "#7c3aed",
          cyan: "#06b6d4",
          success: "#10b981"
        }
      }
    },
  },
  plugins: [],
}
