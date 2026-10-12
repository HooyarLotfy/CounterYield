/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0A0D14",
        surface: "#121620",
        surfaceElevated: "#181E2C",
        borderSlate: "#1E2638",
        chartreuse: {
          light: "#E5FF66",
          DEFAULT: "#CCFF00",
          neon: "#D4FF33",
          dark: "#99BF00",
        },
        snow: "#FFFFFF",
        snowMuted: "#94A3B8",
        warningAmber: "#FFB020",
        alertCrimson: "#FF3B30",
      },
      fontFamily: {
        mono: ["SpaceMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};
