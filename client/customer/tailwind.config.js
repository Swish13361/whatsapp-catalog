/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg))",
        surface: "rgb(var(--surface))",
        text: "rgb(var(--text))",
        muted: "rgb(var(--muted))",
        line: "rgb(var(--line))",
        accent: {
          DEFAULT: "rgb(var(--accent))",
          hover: "rgb(var(--accent-hover))",
          soft: "rgb(var(--accent-soft))",
          ink: "rgb(var(--accent-ink))",
          on: "rgb(var(--on-accent))",
        },
        success: {
          DEFAULT: "rgb(var(--success))",
          soft: "rgb(var(--success-soft))",
        },
        danger: {
          DEFAULT: "rgb(var(--danger))",
          soft: "rgb(var(--danger-soft))",
        },
        warning: {
          DEFAULT: "rgb(var(--warning))",
          soft: "rgb(var(--warning-soft))",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
}