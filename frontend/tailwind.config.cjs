/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e0faff",
          100: "#b3f4ff",
          200: "#80ecff",
          300: "#4de4ff",
          400: "#1adcff",
          500: "#00caff",
          600: "#00a0cc",
          700: "#007799",
          800: "#004e66",
          900: "#002633",
        },
        slateglass: "rgba(17, 25, 40, 0.85)",
        cyanblur: "rgba(0, 200, 255, 0.15)",
      },
      boxShadow: {
        glass: "0 4px 20px rgba(0, 200, 255, 0.1)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
